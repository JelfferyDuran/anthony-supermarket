insert into public.order_audit_log(order_id, from_status, to_status, actor_role, source, detail, created_at)
select o.id, null, o.estado, 'system', 'legacy_backfill', jsonb_build_object('note','Status captured at Phase 1 hardening baseline'), coalesce(o.created_at, now())
from public.orders o
where not exists (
  select 1 from public.order_audit_log a where a.order_id = o.id
);
