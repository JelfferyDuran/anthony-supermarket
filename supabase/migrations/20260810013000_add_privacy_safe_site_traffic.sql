-- Phase 2B: privacy-minimized storefront traffic for manager insights.
-- No names, phones, addresses, notes, Telegram IDs, full IPs, or raw user agents.
create table if not exists public.site_traffic_events (
  id bigint generated always as identity primary key,
  path text not null check (char_length(path) between 1 and 160 and left(path, 1) = '/'),
  source text not null check (char_length(source) between 1 and 100),
  device text not null check (device in ('mobile', 'tablet', 'desktop')),
  language text not null check (language = 'unknown' or language ~ '^[a-z]{2}$'),
  occurred_at timestamptz not null default now()
);

alter table public.site_traffic_events enable row level security;
revoke all on table public.site_traffic_events from anon, authenticated;
revoke all on sequence public.site_traffic_events_id_seq from anon, authenticated;

create index if not exists site_traffic_events_occurred_at_idx
  on public.site_traffic_events (occurred_at desc);
create index if not exists site_traffic_events_path_occurred_at_idx
  on public.site_traffic_events (path, occurred_at desc);

comment on table public.site_traffic_events is
  'Privacy-minimized aggregate storefront activity written and read only by the authorized Edge Function.';
