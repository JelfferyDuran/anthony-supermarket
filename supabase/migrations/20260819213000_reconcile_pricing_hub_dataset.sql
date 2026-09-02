-- Reconciles the invoice pricing schema with the live Pricing Hub dataset
-- (157 items / 3 vendors / 9 invoices embedded in apps/pricing-hub/index.html)
-- and adds the authenticated approval transaction the pipeline design calls for.
--
-- Hub reality this migration accommodates:
--   * Items are keyed by a stable integer hub id; the Kingdom OS mirror parses
--     that id out of the file, so it has to round-trip through the database.
--   * Vendor item numbers ARE the vendor SKU. 42 of 157 rows carry the sentinel
--     '—' meaning "not printed on the invoice" — stored as NULL, never invented.
--   * No UPCs appear on any of these invoices yet. upc stays nullable text.
--   * Some lines are internal supplies (not for sale) or flagged for owner review.

-- ── Products: hub-shape columns ──────────────────────────────────────────────
alter table public.pricing_products
  add column if not exists hub_item_id integer,
  add column if not exists category text,
  add column if not exists units_per_case numeric(12,3),
  add column if not exists internal boolean not null default false,
  add column if not exists flagged boolean not null default false,
  add column if not exists flag_reason text,
  add column if not exists source text not null default 'invoice';

comment on column public.pricing_products.hub_item_id is
  'Stable Pricing Hub array id. Keeps the embedded-array mirror and the Kingdom OS collector able to round-trip a row.';
comment on column public.pricing_products.internal is
  'Store supplies and fees that are never sold to a customer. Excluded from retail math and label exports.';

create unique index if not exists pricing_products_hub_item_id_key
  on public.pricing_products(hub_item_id) where hub_item_id is not null;

-- A product bought on two invoices occupies two rows in the hub's line ledger.
-- hub_item_id holds the CURRENT row; hub_item_ids holds every row that resolved
-- to this product, so the Kingdom OS mirror can still find a product by any id
-- it parsed out of the file.
alter table public.pricing_products
  add column if not exists hub_item_ids integer[] not null default '{}';

create index if not exists pricing_products_hub_item_ids_idx
  on public.pricing_products using gin (hub_item_ids);

-- Internal items carry no retail price; sellable items must never sit below cost.
alter table public.pricing_products
  drop constraint if exists pricing_products_retail_sanity;
alter table public.pricing_products
  add constraint pricing_products_retail_sanity check (
    internal is true
    or current_retail_price is null
    or current_unit_cost is null
    or current_retail_price >= current_unit_cost
  );

-- ── Invoices: the label the hub renders in its invoice filter ────────────────
alter table public.pricing_invoices
  add column if not exists display_label text,
  add column if not exists line_count integer not null default 0;

-- The 9 invoices already reflected in the embedded hub arrays predate this
-- pipeline: they were priced and shelved before there was an approval flow, and
-- there is no auth.users row to attribute them to. They are recorded as
-- 'backfilled' rather than back-dated into 'approved', so the audit trail never
-- claims a manager approved something no manager clicked, and the approval
-- constraint below stays strict for everything that DOES flow through review.
alter table public.pricing_invoices
  drop constraint if exists pricing_invoice_status;
alter table public.pricing_invoices
  add constraint pricing_invoice_status check (
    status in ('uploaded','extracting','needs_review','approved','rejected','imported','backfilled')
  );

alter table public.pricing_invoices
  drop constraint if exists pricing_invoice_approval;
alter table public.pricing_invoices
  add constraint pricing_invoice_approval check (
    status not in ('approved','imported') or (approved_by is not null and approved_at is not null)
  );

-- Backfilled invoices have no scan on file. Scanned intake still requires one.
alter table public.pricing_invoices
  alter column source_object_path drop not null;

alter table public.pricing_invoices
  drop constraint if exists pricing_invoice_scan_required;
alter table public.pricing_invoices
  add constraint pricing_invoice_scan_required check (
    source_object_path is not null or status = 'backfilled'
  );

alter table public.pricing_invoice_lines
  drop constraint if exists pricing_line_review_status;
alter table public.pricing_invoice_lines
  add constraint pricing_line_review_status check (
    review_status in ('needs_review','approved','rejected','backfilled')
  );

-- ── Vendor SKU link tolerates unknown item numbers ───────────────────────────
alter table public.pricing_vendor_products
  add column if not exists source_invoice_number text;

-- ── Private storage for invoice scans ────────────────────────────────────────
-- Explicitly private: no public read, no anon/authenticated policies. Scans are
-- reached only through short-lived signed URLs minted by the server.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'pricing-invoices',
  'pricing-invoices',
  false,
  10485760,
  array['application/pdf','image/jpeg','image/png','image/webp']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ── Price history is immutable ───────────────────────────────────────────────
-- Backfilled history rows carry a stable source_key so re-running the seed can
-- skip rows it already wrote. Live approvals leave it null; nothing else may
-- reuse a key.
alter table public.pricing_price_history
  add column if not exists source_key text;

create unique index if not exists pricing_price_history_source_key_idx
  on public.pricing_price_history(source_key) where source_key is not null;

create or replace function public.pricing_block_history_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'pricing_price_history rows are immutable';
end;
$$;

drop trigger if exists pricing_price_history_immutable on public.pricing_price_history;
create trigger pricing_price_history_immutable
  before update or delete on public.pricing_price_history
  for each row execute function public.pricing_block_history_mutation();

-- ── Authoritative single-price write ─────────────────────────────────────────
-- The hub's "edit retail" action lands here. Product row and history row commit
-- together; a caller cannot write one without the other.
create or replace function public.pricing_set_product_retail(
  p_product_id uuid,
  p_retail_price numeric,
  p_approved_by uuid default null,
  p_reason text default null
)
returns public.pricing_products
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_product public.pricing_products;
  v_updated public.pricing_products;
begin
  select * into v_product from public.pricing_products where id = p_product_id for update;
  if not found then
    raise exception 'product % not found', p_product_id;
  end if;
  if v_product.internal then
    raise exception 'internal item % is not sold and cannot carry a retail price', p_product_id;
  end if;
  if p_retail_price is null or p_retail_price < 0 then
    raise exception 'retail price must be zero or greater';
  end if;
  if v_product.current_unit_cost is not null and p_retail_price < v_product.current_unit_cost then
    raise exception 'retail price % is below unit cost %', p_retail_price, v_product.current_unit_cost;
  end if;

  update public.pricing_products
     set current_retail_price = p_retail_price,
         updated_at = now()
   where id = p_product_id
  returning * into v_updated;

  insert into public.pricing_price_history (
    product_id, previous_unit_cost, new_unit_cost,
    previous_retail_price, new_retail_price, retail_multiplier, changed_by
  ) values (
    p_product_id,
    v_product.current_unit_cost,
    coalesce(v_updated.current_unit_cost, 0),
    v_product.current_retail_price,
    p_retail_price,
    v_updated.retail_multiplier,
    p_approved_by
  );

  return v_updated;
end;
$$;

-- ── Approval transaction ─────────────────────────────────────────────────────
-- Reviewed lines -> products + immutable history + label batch + invoice marked
-- imported, all in one transaction. Refuses to run if reconciliation is outside
-- one cent or any line still needs review, so an OCR result can never approve
-- itself.
create or replace function public.pricing_approve_invoice(
  p_invoice_id uuid,
  p_approved_by uuid,
  p_lines jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_invoice public.pricing_invoices;
  v_line jsonb;
  v_product public.pricing_products;
  v_product_id uuid;
  v_unit_cost numeric(12,4);
  v_retail numeric(12,2);
  v_line_sum numeric(12,2) := 0;
  v_variance numeric(12,2);
  v_applied integer := 0;
  v_pending integer;
  v_batch_id uuid;
begin
  if p_approved_by is null then
    raise exception 'an approver is required';
  end if;

  select * into v_invoice from public.pricing_invoices where id = p_invoice_id for update;
  if not found then
    raise exception 'invoice % not found', p_invoice_id;
  end if;
  if v_invoice.status = 'imported' then
    -- Idempotent: re-approving an already-imported invoice is a no-op, not an error.
    return jsonb_build_object('invoice_id', p_invoice_id, 'status', 'imported', 'applied', 0, 'already_imported', true);
  end if;

  for v_line in select * from jsonb_array_elements(coalesce(p_lines, '[]'::jsonb))
  loop
    v_product_id := nullif(v_line->>'product_id', '')::uuid;
    v_unit_cost := (v_line->>'unit_cost')::numeric;
    v_retail := (v_line->>'retail_price')::numeric;

    if v_product_id is null then
      raise exception 'line % has no matched product; fuzzy matches cannot approve', v_line->>'line_number';
    end if;
    if v_unit_cost is null or v_unit_cost < 0 then
      raise exception 'line % has an invalid unit cost', v_line->>'line_number';
    end if;

    select * into v_product from public.pricing_products where id = v_product_id for update;
    if not found then
      raise exception 'product % not found', v_product_id;
    end if;

    if not v_product.internal then
      if v_retail is null or v_retail < v_unit_cost then
        raise exception 'line % retail % is below unit cost %', v_line->>'line_number', v_retail, v_unit_cost;
      end if;
    else
      v_retail := null;
    end if;

    insert into public.pricing_price_history (
      product_id, invoice_line_id, previous_unit_cost, new_unit_cost,
      previous_retail_price, new_retail_price, retail_multiplier, changed_by
    ) values (
      v_product_id,
      nullif(v_line->>'invoice_line_id', '')::uuid,
      v_product.current_unit_cost,
      v_unit_cost,
      v_product.current_retail_price,
      coalesce(v_retail, 0),
      v_product.retail_multiplier,
      p_approved_by
    );

    update public.pricing_products
       set current_unit_cost = v_unit_cost,
           current_retail_price = coalesce(v_retail, current_retail_price),
           updated_at = now()
     where id = v_product_id;

    v_line_sum := v_line_sum + coalesce((v_line->>'line_total')::numeric, 0);
    v_applied := v_applied + 1;
  end loop;

  update public.pricing_invoice_lines
     set review_status = 'approved',
         approved_by = p_approved_by,
         approved_at = now()
   where invoice_id = p_invoice_id
     and review_status = 'needs_review'
     and matched_product_id is not null
     and calculated_unit_cost is not null;

  select count(*) into v_pending
    from public.pricing_invoice_lines
   where invoice_id = p_invoice_id and review_status = 'needs_review';
  if v_pending > 0 then
    raise exception '% line(s) still need review; resolve them before approving', v_pending;
  end if;

  v_variance := round(coalesce(v_invoice.invoice_subtotal, v_line_sum) - v_line_sum, 2);
  if abs(v_variance) > 0.01 then
    raise exception 'reconciliation variance % exceeds the $0.01 tolerance', v_variance;
  end if;

  insert into public.pricing_label_batches (invoice_id, output_format, row_count, created_by)
  values (p_invoice_id, 'csv', v_applied, p_approved_by)
  returning id into v_batch_id;

  update public.pricing_invoices
     set status = 'imported',
         extracted_line_sum = v_line_sum,
         reconciliation_variance = v_variance,
         approved_by = p_approved_by,
         approved_at = now()
   where id = p_invoice_id;

  return jsonb_build_object(
    'invoice_id', p_invoice_id,
    'status', 'imported',
    'applied', v_applied,
    'label_batch_id', v_batch_id,
    'reconciliation_variance', v_variance
  );
end;
$$;

-- ── Price-gun / label export ─────────────────────────────────────────────────
-- Emits exactly the four columns the label printer expects.
create or replace function public.pricing_label_rows(p_invoice_id uuid default null)
returns table (item_name text, upc text, price numeric, department text)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.name, coalesce(p.upc, ''), p.current_retail_price, coalesce(p.department, p.category, '')
    from public.pricing_products p
   where p.active
     and not p.internal
     and p.current_retail_price is not null
     and (
       p_invoice_id is null
       or exists (
         select 1 from public.pricing_invoice_lines l
          where l.invoice_id = p_invoice_id and l.matched_product_id = p.id
       )
     )
   order by p.name;
$$;

-- ── Grants: deny-by-default stays intact ─────────────────────────────────────
-- These routines are SECURITY DEFINER, so execute rights are revoked from
-- untrusted roles. Only the server (service_role) may call them; the browser
-- reaches them through authenticated endpoints, never directly.
revoke all on function public.pricing_set_product_retail(uuid, numeric, uuid, text) from public, anon, authenticated;
revoke all on function public.pricing_approve_invoice(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.pricing_label_rows(uuid) from public, anon, authenticated;
revoke all on function public.pricing_block_history_mutation() from public, anon, authenticated;

grant execute on function public.pricing_set_product_retail(uuid, numeric, uuid, text) to service_role;
grant execute on function public.pricing_approve_invoice(uuid, uuid, jsonb) to service_role;
grant execute on function public.pricing_label_rows(uuid) to service_role;

create index if not exists pricing_products_category_idx on public.pricing_products(category);
create index if not exists pricing_invoices_vendor_idx on public.pricing_invoices(vendor_id, invoice_date desc);
