create index if not exists idx_order_audit_log_order_created_at
on public.order_audit_log(order_id, created_at);
