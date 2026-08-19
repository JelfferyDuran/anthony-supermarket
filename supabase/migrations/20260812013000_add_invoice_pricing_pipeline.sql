-- Server-managed invoice pricing pipeline. OCR output is never trusted by clients.
create table if not exists public.pricing_vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pricing_products (
  id uuid primary key default gen_random_uuid(),
  upc text unique,
  name text not null,
  department text,
  active boolean not null default true,
  current_unit_cost numeric(12,4),
  current_retail_price numeric(12,2),
  retail_multiplier numeric(6,3) not null default 1.700,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pricing_products_upc_digits check (upc is null or upc ~ '^[0-9]{6,14}$'),
  constraint pricing_products_nonnegative check (
    (current_unit_cost is null or current_unit_cost >= 0) and
    (current_retail_price is null or current_retail_price >= 0)
  )
);

create table if not exists public.pricing_vendor_products (
  vendor_id uuid not null references public.pricing_vendors(id),
  vendor_sku text not null,
  product_id uuid not null references public.pricing_products(id),
  units_per_case numeric(12,3),
  case_upc text,
  verified_at timestamptz,
  primary key (vendor_id, vendor_sku),
  constraint pricing_vendor_products_positive_pack check (units_per_case is null or units_per_case > 0)
);

create table if not exists public.pricing_invoices (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid references public.pricing_vendors(id),
  invoice_number text,
  invoice_date date,
  source_object_path text not null,
  source_sha256 text not null unique,
  currency text not null default 'USD',
  invoice_subtotal numeric(12,2),
  extracted_line_sum numeric(12,2),
  reconciliation_variance numeric(12,2),
  status text not null default 'uploaded',
  created_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  constraint pricing_invoice_status check (status in ('uploaded','extracting','needs_review','approved','rejected','imported')),
  constraint pricing_invoice_approval check ((status not in ('approved','imported')) or (approved_by is not null and approved_at is not null))
);

create table if not exists public.pricing_invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.pricing_invoices(id) on delete cascade,
  line_number integer not null,
  raw_text text,
  vendor_sku text,
  extracted_upc text,
  extracted_description text not null,
  case_quantity numeric(12,3),
  units_per_case numeric(12,3),
  line_total numeric(12,2),
  line_discount numeric(12,2) not null default 0,
  allocated_charges numeric(12,2) not null default 0,
  calculated_unit_cost numeric(12,4),
  proposed_retail_price numeric(12,2),
  ocr_confidence numeric(5,4),
  matched_product_id uuid references public.pricing_products(id),
  match_method text,
  review_status text not null default 'needs_review',
  review_reason text,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  unique (invoice_id, line_number),
  constraint pricing_line_review_status check (review_status in ('needs_review','approved','rejected')),
  constraint pricing_line_confidence check (ocr_confidence is null or ocr_confidence between 0 and 1),
  constraint pricing_line_approved_complete check (
    review_status <> 'approved' or
    (matched_product_id is not null and calculated_unit_cost >= 0 and proposed_retail_price >= calculated_unit_cost and approved_by is not null and approved_at is not null)
  )
);

create table if not exists public.pricing_price_history (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.pricing_products(id),
  invoice_line_id uuid references public.pricing_invoice_lines(id),
  previous_unit_cost numeric(12,4),
  new_unit_cost numeric(12,4) not null,
  previous_retail_price numeric(12,2),
  new_retail_price numeric(12,2) not null,
  retail_multiplier numeric(6,3) not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

create table if not exists public.pricing_label_batches (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid references public.pricing_invoices(id),
  output_format text not null default 'csv',
  row_count integer not null check (row_count >= 0),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists pricing_invoice_lines_invoice_idx on public.pricing_invoice_lines(invoice_id);
create index if not exists pricing_invoice_lines_product_idx on public.pricing_invoice_lines(matched_product_id);
create index if not exists pricing_price_history_product_idx on public.pricing_price_history(product_id, changed_at desc);

alter table public.pricing_vendors enable row level security;
alter table public.pricing_products enable row level security;
alter table public.pricing_vendor_products enable row level security;
alter table public.pricing_invoices enable row level security;
alter table public.pricing_invoice_lines enable row level security;
alter table public.pricing_price_history enable row level security;
alter table public.pricing_label_batches enable row level security;

revoke all on public.pricing_vendors, public.pricing_products, public.pricing_vendor_products,
  public.pricing_invoices, public.pricing_invoice_lines, public.pricing_price_history,
  public.pricing_label_batches from public, anon, authenticated;

grant all on public.pricing_vendors, public.pricing_products, public.pricing_vendor_products,
  public.pricing_invoices, public.pricing_invoice_lines, public.pricing_price_history,
  public.pricing_label_batches to service_role;
