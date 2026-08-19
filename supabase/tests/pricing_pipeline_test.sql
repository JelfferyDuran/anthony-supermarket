-- Behavioral test for the invoice pricing pipeline.
--
-- Runs against a throwaway PostgreSQL database that has had the Supabase-shaped
-- harness plus both pricing migrations applied. Every step below asserts a
-- security or integrity guarantee the design depends on; ERROR lines under the
-- negative cases are the PASS condition for those cases.
--
-- Run with:  node scripts/test-pricing-migrations.js
--
\set ON_ERROR_STOP off
\pset pager off
select '--- 1. migrations are re-runnable (idempotent) ---' as t;
\set ON_ERROR_STOP on
\i :migration_dir/20260819213000_reconcile_pricing_hub_dataset.sql
select 'RERUN OK' as result;
\set ON_ERROR_STOP off

select '--- 2. bucket is private ---' as t;
select id, public, file_size_limit from storage.buckets where id='pricing-invoices';

select '--- 3. RLS enabled + no anon/authenticated grants ---' as t;
select relname, relrowsecurity from pg_class where relname like 'pricing_%' and relkind='r' order by 1;
select count(*) as anon_or_authenticated_grants
  from information_schema.role_table_grants
 where table_schema='public' and table_name like 'pricing_%' and grantee in ('anon','authenticated');
select count(*) as policies_defined from pg_policies where schemaname='public' and tablename like 'pricing_%';

select '--- 4. seed a vendor/product/invoice ---' as t;
insert into auth.users(id,email) values ('11111111-1111-1111-1111-111111111111','manager@example.test');
insert into public.pricing_vendors(id,name,normalized_name) values ('22222222-2222-2222-2222-222222222222','Family Food Distributors','family food distributors');
insert into public.pricing_products(id,hub_item_id,name,category,units_per_case,current_unit_cost,current_retail_price,internal)
 values ('33333333-3333-3333-3333-333333333333',194,'Allegra Rigatoni 20/16oz','Pasta',20,1.0880,1.99,false);
insert into public.pricing_products(id,hub_item_id,name,category,internal)
 values ('44444444-4444-4444-4444-444444444444',1,'7" Pan 500ct','Hot Food Supplies',true);
insert into public.pricing_invoices(id,vendor_id,invoice_number,invoice_date,source_object_path,source_sha256,invoice_subtotal,status,display_label)
 values ('55555555-5555-5555-5555-555555555555','22222222-2222-2222-2222-222222222222','90772340','2026-08-19','ab/abc123','abc123',21.76,'needs_review','#90772340 — 8/19/26');
insert into public.pricing_invoice_lines(id,invoice_id,line_number,extracted_description,vendor_sku,case_quantity,units_per_case,line_total,calculated_unit_cost,proposed_retail_price,matched_product_id,review_status)
 values ('66666666-6666-6666-6666-666666666666','55555555-5555-5555-5555-555555555555',1,'Allegra Rigatoni 20/16oz','2154',1,20,21.76,1.0880,1.99,'33333333-3333-3333-3333-333333333333','needs_review');

select '--- 5. SHA-256 idempotency: duplicate upload rejected ---' as t;
insert into public.pricing_invoices(vendor_id,invoice_number,source_object_path,source_sha256,status)
 values ('22222222-2222-2222-2222-222222222222','DUP','ab/abc123','abc123','uploaded');

select '--- 6. retail below cost is rejected ---' as t;
select public.pricing_set_product_retail('33333333-3333-3333-3333-333333333333', 0.50, '11111111-1111-1111-1111-111111111111', 'too cheap');

select '--- 7. internal item cannot be priced ---' as t;
select public.pricing_set_product_retail('44444444-4444-4444-4444-444444444444', 2.99, '11111111-1111-1111-1111-111111111111', 'nope');

select '--- 8. valid retail edit writes product + history atomically ---' as t;
select current_retail_price from public.pricing_set_product_retail('33333333-3333-3333-3333-333333333333', 2.49, '11111111-1111-1111-1111-111111111111', 'owner override');
select previous_retail_price, new_retail_price, changed_by is not null as has_approver from public.pricing_price_history where product_id='33333333-3333-3333-3333-333333333333';

select '--- 9. history rows are immutable ---' as t;
update public.pricing_price_history set new_retail_price=99.99 where product_id='33333333-3333-3333-3333-333333333333';
delete from public.pricing_price_history where product_id='33333333-3333-3333-3333-333333333333';

select '--- 10. approval requires an approver ---' as t;
select public.pricing_approve_invoice('55555555-5555-5555-5555-555555555555', null, '[]'::jsonb);

select '--- 11. approval refuses an unmatched (fuzzy-only) line ---' as t;
select public.pricing_approve_invoice('55555555-5555-5555-5555-555555555555','11111111-1111-1111-1111-111111111111',
  '[{"line_number":1,"product_id":null,"unit_cost":1.088,"retail_price":1.99,"line_total":21.76}]'::jsonb);

select '--- 12. approval refuses variance beyond $0.01 ---' as t;
select public.pricing_approve_invoice('55555555-5555-5555-5555-555555555555','11111111-1111-1111-1111-111111111111',
  '[{"line_number":1,"invoice_line_id":"66666666-6666-6666-6666-666666666666","product_id":"33333333-3333-3333-3333-333333333333","unit_cost":1.088,"retail_price":1.99,"line_total":19.00}]'::jsonb);

select '--- 13. clean approval succeeds ---' as t;
select public.pricing_approve_invoice('55555555-5555-5555-5555-555555555555','11111111-1111-1111-1111-111111111111',
  '[{"line_number":1,"invoice_line_id":"66666666-6666-6666-6666-666666666666","product_id":"33333333-3333-3333-3333-333333333333","unit_cost":1.088,"retail_price":1.99,"line_total":21.76}]'::jsonb);
select status, approved_by is not null as approved, reconciliation_variance from public.pricing_invoices where id='55555555-5555-5555-5555-555555555555';
select row_count from public.pricing_label_batches where invoice_id='55555555-5555-5555-5555-555555555555';

select '--- 14. re-approving is idempotent, not an error ---' as t;
select public.pricing_approve_invoice('55555555-5555-5555-5555-555555555555','11111111-1111-1111-1111-111111111111','[]'::jsonb);

select '--- 15. label export excludes internal items, right columns ---' as t;
select * from public.pricing_label_rows(null);

select '--- 16. hub_item_id uniqueness holds ---' as t;
insert into public.pricing_products(hub_item_id,name) values (194,'duplicate hub id');
