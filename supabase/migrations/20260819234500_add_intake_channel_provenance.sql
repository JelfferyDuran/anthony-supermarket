-- Records which channel a scan arrived on, per the owner's 2026-08-19 decision
-- that invoices may be sent from the hub, Telegram, or WhatsApp.
--
-- Provenance matters here: if a bad line reaches the shelf, the first question is
-- where the scan came from and whether that channel should still be trusted.

alter table public.pricing_invoices
  add column if not exists source_channel text not null default 'hub',
  add column if not exists source_sender_ref text;

comment on column public.pricing_invoices.source_sender_ref is
  'Salted-free SHA-256 prefix of the sending chat id or phone number, namespaced by channel. '
  'Deliberately NOT the raw identifier: the pipeline needs to recognise a repeat sender, not to '
  'store the owner''s or a staff member''s phone number alongside business records.';

alter table public.pricing_invoices
  drop constraint if exists pricing_invoice_source_channel;
alter table public.pricing_invoices
  add constraint pricing_invoice_source_channel check (source_channel in ('hub','telegram','whatsapp','api'));

-- A chat submission must carry a sender reference; a hub upload is already
-- attributed to an authenticated user and has none.
alter table public.pricing_invoices
  drop constraint if exists pricing_invoice_chat_sender_recorded;
alter table public.pricing_invoices
  add constraint pricing_invoice_chat_sender_recorded check (
    source_channel in ('hub','api') or source_sender_ref is not null
  );

create index if not exists pricing_invoices_source_channel_idx
  on public.pricing_invoices(source_channel, created_at desc);
