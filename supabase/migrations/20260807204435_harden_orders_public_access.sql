drop policy if exists "Orders are viewable by everyone" on public.orders;
drop policy if exists "Orders are insertable by everyone" on public.orders;

revoke select, insert, update, delete on table public.orders from anon, authenticated;

grant select on table public.orders to authenticated;

-- RLS remains enabled with no direct client policies by design.
-- The Super Kitchen Edge Function is the controlled gateway and uses the service role.
