alter table public.orders
  add column if not exists telegram_user_id bigint,
  add column if not exists telegram_auth_date timestamptz;

create index if not exists idx_orders_telegram_user_created_at
  on public.orders(telegram_user_id, created_at desc)
  where telegram_user_id is not null;

comment on column public.orders.telegram_user_id is 'Telegram user id recorded only after server-side Mini App initData validation.';
comment on column public.orders.telegram_auth_date is 'Telegram Mini App auth_date recorded only after server-side initData validation.';
