-- Phase C: POS sales import and the financial views built on top of it.
--
-- The store's NRS POS exports CSV only — there is no API on record — so sales
-- arrive as periodic file uploads. Everything here is derived from data the
-- store already has (invoices + POS files); no new integration is required.

-- ── POS import batches ───────────────────────────────────────────────────────
-- One row per uploaded CSV. source_sha256 makes re-uploading the same export a
-- no-op rather than a double-count, which matters because the daily fetch job
-- and a manual drop can both deliver the same file.
create table if not exists public.pos_import_batches (
  id uuid primary key default gen_random_uuid(),
  filename text,
  source_sha256 text not null unique,
  period_start date,
  period_end date,
  row_count integer not null default 0,
  imported_count integer not null default 0,
  matched_count integer not null default 0,
  gross_sales numeric(14,2) not null default 0,
  void_total numeric(14,2) not null default 0,
  refund_total numeric(14,2) not null default 0,
  imported_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  constraint pos_import_period check (period_start is null or period_end is null or period_end >= period_start)
);

-- ── POS sales lines ──────────────────────────────────────────────────────────
-- One row per sold line. Voids and refunds are KEPT, flagged rather than
-- dropped: they are the store's leak indicators and deleting them would hide
-- exactly what the owner needs to see.
create table if not exists public.pos_sales (
  id bigint generated always as identity primary key,
  batch_id uuid not null references public.pos_import_batches(id) on delete cascade,
  sold_at date not null,
  upc text,
  item_name text not null,
  normalized_name text,
  department text,
  quantity numeric(12,3) not null default 0,
  unit_price numeric(12,2),
  gross_sales numeric(12,2) not null default 0,
  payment_method text,
  cashier text,
  is_void boolean not null default false,
  is_refund boolean not null default false,
  product_id uuid references public.pricing_products(id),
  -- How the row was tied to a product: 'upc' is evidence, 'name' is a
  -- convenience match. Recorded so a margin figure can always be traced back to
  -- how confident its product link was.
  match_method text,
  source_row integer,
  constraint pos_sales_match_method check (match_method is null or match_method in ('upc','name','manual'))
);

create index if not exists pos_sales_batch_idx on public.pos_sales(batch_id);
create index if not exists pos_sales_sold_at_idx on public.pos_sales(sold_at);
create index if not exists pos_sales_product_idx on public.pos_sales(product_id);
create index if not exists pos_sales_upc_idx on public.pos_sales(upc) where upc is not null;
create index if not exists pos_sales_normalized_name_idx on public.pos_sales(normalized_name);

-- ── Invoice payment terms (NET21) ────────────────────────────────────────────
alter table public.pricing_invoices
  add column if not exists payment_terms_days integer not null default 21,
  add column if not exists paid_at date;

comment on column public.pricing_invoices.payment_terms_days is
  'Days from invoice date to due date. The store''s standard vendor terms are NET21.';

alter table public.pricing_invoices
  drop constraint if exists pricing_invoice_terms_sane;
alter table public.pricing_invoices
  add constraint pricing_invoice_terms_sane check (payment_terms_days >= 0 and payment_terms_days <= 365);

-- ── RLS: same deny-by-default posture as the pricing tables ──────────────────
alter table public.pos_import_batches enable row level security;
alter table public.pos_sales enable row level security;

revoke all on public.pos_import_batches, public.pos_sales from public, anon, authenticated;
grant all on public.pos_import_batches, public.pos_sales to service_role;

-- ═════════════════════════════════════════════════════════════════════════════
-- Financial reporting
--
-- Every function below is SECURITY DEFINER and executable only by service_role;
-- the browser reaches them through authenticated endpoints, never directly.
-- ═════════════════════════════════════════════════════════════════════════════

-- Cost of a product AT THE TIME OF A SALE. Using today's cost to value a sale
-- from three weeks ago would silently misstate margin whenever a vendor moved a
-- price, so this walks the immutable history back to the cost then in effect and
-- only falls back to the current cost when no history predates the sale.
create or replace function public.pricing_cost_at(p_product_id uuid, p_when date)
returns numeric
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    (select h.new_unit_cost
       from public.pricing_price_history h
      where h.product_id = p_product_id
        and h.changed_at::date <= p_when
      order by h.changed_at desc
      limit 1),
    (select p.current_unit_cost from public.pricing_products p where p.id = p_product_id)
  );
$$;

-- ── Vendor spend by month ────────────────────────────────────────────────────
create or replace function public.pricing_vendor_spend(p_from date default null, p_to date default null)
returns table (
  month date,
  vendor_id uuid,
  vendor_name text,
  invoice_count bigint,
  total_spend numeric
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select date_trunc('month', i.invoice_date)::date as month,
         v.id,
         v.name,
         count(*)::bigint,
         coalesce(sum(i.invoice_subtotal), 0)
    from public.pricing_invoices i
    join public.pricing_vendors v on v.id = i.vendor_id
   where i.invoice_date is not null
     and (p_from is null or i.invoice_date >= p_from)
     and (p_to is null or i.invoice_date <= p_to)
     and i.status <> 'rejected'
   group by 1, 2, 3
   order by 1 desc, 5 desc;
$$;

-- ── NET21 aging ──────────────────────────────────────────────────────────────
-- Unpaid invoices bucketed by how far past their terms they are.
create or replace function public.pricing_invoice_aging(p_as_of date default null)
returns table (
  invoice_id uuid,
  vendor_name text,
  invoice_number text,
  invoice_date date,
  due_date date,
  amount numeric,
  days_overdue integer,
  bucket text
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with asof as (select coalesce(p_as_of, current_date) as d),
  due as (
    select i.id,
           v.name as vendor_name,
           i.invoice_number,
           i.invoice_date,
           (i.invoice_date + i.payment_terms_days) as due_date,
           coalesce(i.invoice_subtotal, 0) as amount,
           ((select d from asof) - (i.invoice_date + i.payment_terms_days))::integer as days_overdue
      from public.pricing_invoices i
      left join public.pricing_vendors v on v.id = i.vendor_id
     where i.paid_at is null
       and i.invoice_date is not null
       and i.status <> 'rejected'
  )
  select id, vendor_name, invoice_number, invoice_date, due_date, amount, days_overdue,
         case when days_overdue < 0 then 'not_due'
              when days_overdue = 0 then 'due_today'
              when days_overdue <= 7 then 'overdue_1_7'
              when days_overdue <= 14 then 'overdue_8_14'
              when days_overdue <= 30 then 'overdue_15_30'
              else 'overdue_30_plus' end
    from due
   order by days_overdue desc, amount desc;
$$;

-- ── Margin by dimension ──────────────────────────────────────────────────────
-- Valid dimensions: 'item', 'category', 'vendor'. Voids and refunds are excluded
-- from revenue; unmatched POS rows contribute revenue but no cost, and are
-- reported separately so an unmatched catalog cannot masquerade as pure profit.
create or replace function public.pricing_margin_by(
  p_dimension text default 'category',
  p_from date default null,
  p_to date default null
)
returns table (
  label text,
  units_sold numeric,
  revenue numeric,
  cost_of_goods numeric,
  gross_profit numeric,
  margin_pct numeric,
  matched_revenue numeric,
  unmatched_revenue numeric
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with sales as (
    select s.*,
           p.id as matched_id,
           p.name as product_name,
           p.category as product_category,
           case
             when p.id is null then null
             else public.pricing_cost_at(p.id, s.sold_at)
           end as unit_cost
      from public.pos_sales s
      left join public.pricing_products p on p.id = s.product_id
     where not s.is_void and not s.is_refund
       and (p_from is null or s.sold_at >= p_from)
       and (p_to is null or s.sold_at <= p_to)
  ),
  labelled as (
    select case p_dimension
             when 'item' then coalesce(product_name, item_name)
             when 'vendor' then coalesce(
               (select v.name
                  from public.pricing_vendor_products vp
                  join public.pricing_vendors v on v.id = vp.vendor_id
                 where vp.product_id = matched_id
                 limit 1), 'Unmatched')
             else coalesce(product_category, department, 'Uncategorized')
           end as label,
           quantity,
           gross_sales,
           case when matched_id is null then null else unit_cost * quantity end as line_cost,
           matched_id
      from sales
  )
  select label,
         sum(quantity),
         sum(gross_sales),
         coalesce(sum(line_cost), 0),
         sum(gross_sales) - coalesce(sum(line_cost), 0),
         case when sum(gross_sales) = 0 then null
              else round(((sum(gross_sales) - coalesce(sum(line_cost), 0)) / sum(gross_sales)) * 100, 2) end,
         coalesce(sum(gross_sales) filter (where matched_id is not null), 0),
         coalesce(sum(gross_sales) filter (where matched_id is null), 0)
    from labelled
   group by label
   order by 3 desc;
$$;

-- ── P&L summary ──────────────────────────────────────────────────────────────
create or replace function public.pricing_pnl_summary(p_from date default null, p_to date default null)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with sales as (
    select s.quantity, s.gross_sales, s.is_void, s.is_refund, s.product_id,
           case when s.product_id is null then null
                else public.pricing_cost_at(s.product_id, s.sold_at) * s.quantity end as line_cost
      from public.pos_sales s
     where (p_from is null or s.sold_at >= p_from)
       and (p_to is null or s.sold_at <= p_to)
  ),
  spend as (
    select coalesce(sum(i.invoice_subtotal), 0) as vendor_spend, count(*)::bigint as invoice_count
      from public.pricing_invoices i
     where i.invoice_date is not null
       and i.status <> 'rejected'
       and (p_from is null or i.invoice_date >= p_from)
       and (p_to is null or i.invoice_date <= p_to)
  )
  select jsonb_build_object(
    'period_start', p_from,
    'period_end', p_to,
    'gross_sales', coalesce((select sum(gross_sales) from sales where not is_void and not is_refund), 0),
    'voids', coalesce((select sum(abs(gross_sales)) from sales where is_void), 0),
    'refunds', coalesce((select sum(abs(gross_sales)) from sales where is_refund), 0),
    'units_sold', coalesce((select sum(quantity) from sales where not is_void and not is_refund), 0),
    'cost_of_goods', coalesce((select sum(line_cost) from sales where not is_void and not is_refund), 0),
    'gross_profit', coalesce((select sum(gross_sales) from sales where not is_void and not is_refund), 0)
                  - coalesce((select sum(line_cost) from sales where not is_void and not is_refund), 0),
    -- Share of revenue whose cost is actually known. A low value means the
    -- margin figures above are built on a partly unmatched catalog and should be
    -- read as a floor, not a fact.
    'costed_revenue_share', case
      when coalesce((select sum(gross_sales) from sales where not is_void and not is_refund), 0) = 0 then null
      else round(
        coalesce((select sum(gross_sales) from sales where not is_void and not is_refund and product_id is not null), 0)
        / (select sum(gross_sales) from sales where not is_void and not is_refund) * 100, 2)
      end,
    'vendor_spend', (select vendor_spend from spend),
    'invoice_count', (select invoice_count from spend)
  );
$$;

-- ── Price-increase alerts ────────────────────────────────────────────────────
create or replace function public.pricing_increase_alerts(p_since_days integer default 90)
returns table (
  product_id uuid,
  product_name text,
  previous_unit_cost numeric,
  new_unit_cost numeric,
  delta numeric,
  percent_change numeric,
  changed_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select h.product_id,
         p.name,
         h.previous_unit_cost,
         h.new_unit_cost,
         round(h.new_unit_cost - h.previous_unit_cost, 4),
         case when h.previous_unit_cost is null or h.previous_unit_cost = 0 then null
              else round(((h.new_unit_cost - h.previous_unit_cost) / h.previous_unit_cost) * 100, 2) end,
         h.changed_at
    from public.pricing_price_history h
    join public.pricing_products p on p.id = h.product_id
   where h.previous_unit_cost is not null
     and h.new_unit_cost > h.previous_unit_cost
     and h.changed_at >= now() - make_interval(days => greatest(p_since_days, 0))
   order by (h.new_unit_cost - h.previous_unit_cost) desc;
$$;

-- ── Grants ───────────────────────────────────────────────────────────────────
revoke all on function public.pricing_cost_at(uuid, date) from public, anon, authenticated;
revoke all on function public.pricing_vendor_spend(date, date) from public, anon, authenticated;
revoke all on function public.pricing_invoice_aging(date) from public, anon, authenticated;
revoke all on function public.pricing_margin_by(text, date, date) from public, anon, authenticated;
revoke all on function public.pricing_pnl_summary(date, date) from public, anon, authenticated;
revoke all on function public.pricing_increase_alerts(integer) from public, anon, authenticated;

grant execute on function public.pricing_cost_at(uuid, date) to service_role;
grant execute on function public.pricing_vendor_spend(date, date) to service_role;
grant execute on function public.pricing_invoice_aging(date) to service_role;
grant execute on function public.pricing_margin_by(text, date, date) to service_role;
grant execute on function public.pricing_pnl_summary(date, date) to service_role;
grant execute on function public.pricing_increase_alerts(integer) to service_role;
