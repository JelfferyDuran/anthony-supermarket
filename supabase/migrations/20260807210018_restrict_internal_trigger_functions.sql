revoke all on function public.log_order_creation() from public, anon, authenticated;
revoke all on function public.prevent_order_audit_mutation() from public, anon, authenticated;
grant execute on function public.log_order_creation() to service_role;
grant execute on function public.prevent_order_audit_mutation() to service_role;
