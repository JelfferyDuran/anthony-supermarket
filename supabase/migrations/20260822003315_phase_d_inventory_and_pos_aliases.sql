-- Phase D integration foundation: inventory counts + approved POS aliases.
--
-- Safety model:
-- - all tables are RLS deny-by-default and server/service-role only
-- - counts are session-based and auditable
-- - POS aliases are exact evidence approved by a human manager/admin
-- - no fuzzy match can mutate historical sales
-- - registering an alias backfills only exact unmatched rows and a trigger keeps
--   future imports consistent with the same approved mapping

create table if not exists public.inventory_count_sessions (
  id uuid primary key default gen_random_uuid(),
  label text,
  status text not null default 'draft',
  notes text,
  started_by uuid references auth.users(id),
  completed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint inventory_count_status check (status in ('draft','completed','cancelled')),
  constraint inventory_count_completion check ((status = 'completed') = (completed_at is not null))
);

create table if not exists public.inventory_count_lines (
  id bigint generated always as identity primary key,
  session_id uuid not null references public.inventory_count_sessions(id) on delete cascade,
  product_id uuid not null references public.pricing_products(id),
  quantity_each numeric(14,3) not null,
  note text,
  counted_at timestamptz not null default now(),
  constraint inventory_count_qty_nonnegative check (quantity_each >= 0),
  constraint inventory_count_line_unique unique (session_id, product_id)
);

create table if not exists public.inventory_balances (
  product_id uuid primary key references public.pricing_products(id) on delete cascade,
  on_hand_quantity numeric(14,3) not null default 0,
  source_session_id uuid references public.inventory_count_sessions(id),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  constraint inventory_balance_nonnegative check (on_hand_quantity >= 0)
);

create table if not exists public.pos_product_aliases (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.pricing_products(id) on delete cascade,
  upc text unique,
  normalized_name text unique,
  approved_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  constraint pos_alias_has_evidence check (
    nullif(btrim(upc), '') is not null or nullif(btrim(normalized_name), '') is not null
  )
);

create index if not exists inventory_count_session_status_idx
  on public.inventory_count_sessions(status, created_at desc);
create index if not exists inventory_count_lines_product_idx
  on public.inventory_count_lines(product_id);
create index if not exists pos_product_alias_product_idx
  on public.pos_product_aliases(product_id);

alter table public.inventory_count_sessions enable row level security;
alter table public.inventory_count_lines enable row level security;
alter table public.inventory_balances enable row level security;
alter table public.pos_product_aliases enable row level security;

revoke all on public.inventory_count_sessions,
              public.inventory_count_lines,
              public.inventory_balances,
              public.pos_product_aliases
  from public, anon, authenticated;

grant all on public.inventory_count_sessions,
             public.inventory_count_lines,
             public.inventory_balances,
             public.pos_product_aliases
  to service_role;

grant usage, select on sequence public.inventory_count_lines_id_seq to service_role;

create or replace function public.inventory_complete_count(
  p_session_id uuid,
  p_completed_by uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_line_count integer;
begin
  if p_completed_by is null then
    raise exception 'completed_by is required';
  end if;

  select status into v_status
    from public.inventory_count_sessions
   where id = p_session_id
   for update;

  if v_status is null then
    raise exception 'inventory count session not found';
  end if;
  if v_status <> 'draft' then
    raise exception 'inventory count session is not draft';
  end if;

  select count(*)::integer into v_line_count
    from public.inventory_count_lines
   where session_id = p_session_id;

  if v_line_count = 0 then
    raise exception 'inventory count has no lines';
  end if;

  insert into public.inventory_balances (
    product_id,
    on_hand_quantity,
    source_session_id,
    updated_by,
    updated_at
  )
  select product_id, quantity_each, p_session_id, p_completed_by, now()
    from public.inventory_count_lines
   where session_id = p_session_id
  on conflict (product_id) do update
    set on_hand_quantity = excluded.on_hand_quantity,
        source_session_id = excluded.source_session_id,
        updated_by = excluded.updated_by,
        updated_at = excluded.updated_at;

  update public.inventory_count_sessions
     set status = 'completed',
         completed_by = p_completed_by,
         completed_at = now()
   where id = p_session_id;

  return jsonb_build_object(
    'session_id', p_session_id,
    'status', 'completed',
    'line_count', v_line_count
  );
end;
$$;

create or replace function public.pricing_apply_pos_alias_to_sale()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  v_upc_product uuid;
  v_name_product uuid;
begin
  if new.product_id is not null then
    return new;
  end if;

  if nullif(btrim(new.upc), '') is not null then
    select product_id into v_upc_product
      from public.pos_product_aliases
     where upc = regexp_replace(new.upc, '\D', '', 'g')
     limit 1;
  end if;

  if nullif(btrim(new.normalized_name), '') is not null then
    select product_id into v_name_product
      from public.pos_product_aliases
     where normalized_name = upper(regexp_replace(btrim(new.normalized_name), '\s+', ' ', 'g'))
     limit 1;
  end if;

  -- Conflicting evidence must stay unmatched rather than choosing arbitrarily.
  if v_upc_product is not null
     and v_name_product is not null
     and v_upc_product <> v_name_product then
    return new;
  end if;

  new.product_id := coalesce(v_upc_product, v_name_product);
  if new.product_id is not null then
    new.match_method := 'manual';
  end if;

  return new;
end;
$$;

drop trigger if exists pricing_pos_alias_before_write on public.pos_sales;
create trigger pricing_pos_alias_before_write
before insert or update of upc, normalized_name, product_id on public.pos_sales
for each row execute function public.pricing_apply_pos_alias_to_sale();

create or replace function public.pricing_register_pos_alias(
  p_product_id uuid,
  p_upc text default null,
  p_normalized_name text default null,
  p_approved_by uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_upc text;
  v_name text;
  v_alias_id uuid;
  v_existing_product uuid;
  v_updated integer := 0;
begin
  if p_approved_by is null then
    raise exception 'approved_by is required';
  end if;

  if not exists (
    select 1
      from public.pricing_products
     where id = p_product_id
       and active = true
  ) then
    raise exception 'active pricing product not found';
  end if;

  v_upc := nullif(regexp_replace(coalesce(p_upc, ''), '\D', '', 'g'), '');
  v_name := nullif(
    upper(regexp_replace(btrim(coalesce(p_normalized_name, '')), '\s+', ' ', 'g')),
    ''
  );

  if v_upc is null and v_name is null then
    raise exception 'UPC or normalized_name is required';
  end if;

  select product_id into v_existing_product
    from public.pos_product_aliases
   where (v_upc is not null and upc = v_upc)
      or (v_name is not null and normalized_name = v_name)
   limit 1;

  if v_existing_product is not null and v_existing_product <> p_product_id then
    raise exception 'alias already belongs to another product';
  end if;

  if v_existing_product = p_product_id then
    select id into v_alias_id
      from public.pos_product_aliases
     where product_id = p_product_id
       and ((v_upc is not null and upc = v_upc)
         or (v_name is not null and normalized_name = v_name))
     limit 1;
  else
    insert into public.pos_product_aliases (
      product_id,
      upc,
      normalized_name,
      approved_by
    )
    values (p_product_id, v_upc, v_name, p_approved_by)
    returning id into v_alias_id;
  end if;

  update public.pos_sales
     set product_id = p_product_id,
         match_method = 'manual'
   where product_id is null
     and ((v_upc is not null
           and regexp_replace(coalesce(upc, ''), '\D', '', 'g') = v_upc)
       or (v_name is not null
           and upper(regexp_replace(btrim(coalesce(normalized_name, '')), '\s+', ' ', 'g')) = v_name));

  get diagnostics v_updated = row_count;

  return jsonb_build_object(
    'alias_id', v_alias_id,
    'product_id', p_product_id,
    'rows_backfilled', v_updated
  );
end;
$$;

create or replace function public.pricing_unmatched_pos_summary(p_limit integer default 50)
returns table (
  normalized_name text,
  sample_item_name text,
  upc text,
  sale_rows bigint,
  units numeric,
  revenue numeric
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select s.normalized_name,
         min(s.item_name) as sample_item_name,
         min(s.upc) as upc,
         count(*)::bigint as sale_rows,
         sum(s.quantity) as units,
         sum(case when not s.is_void and not s.is_refund then s.gross_sales else 0 end) as revenue
    from public.pos_sales s
   where s.product_id is null
   group by s.normalized_name
   order by revenue desc nulls last, sale_rows desc
   limit greatest(1, least(coalesce(p_limit, 50), 200));
$$;

revoke all on function public.inventory_complete_count(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.pricing_register_pos_alias(uuid, text, text, uuid)
  from public, anon, authenticated;
revoke all on function public.pricing_unmatched_pos_summary(integer)
  from public, anon, authenticated;

grant execute on function public.inventory_complete_count(uuid, uuid)
  to service_role;
grant execute on function public.pricing_register_pos_alias(uuid, text, text, uuid)
  to service_role;
grant execute on function public.pricing_unmatched_pos_summary(integer)
  to service_role;
