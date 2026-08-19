-- Behavioral test for the Phase C POS import and financial reporting layer.
--
-- Runs against a throwaway database with the harness plus all three pricing
-- migrations applied. Asserts the arithmetic the owner will actually read:
-- vendor spend, COGS valued at the cost in effect on the sale date, gross
-- margin, NET21 aging buckets, and the P&L summary.
--
-- Run with: node scripts/test-pricing-migrations.js
\set ON_ERROR_STOP off
\pset pager off

select '--- setup ---' as t;
insert into auth.users(id,email) values ('aaaaaaaa-0000-0000-0000-000000000001','manager@example.test');
insert into public.pricing_vendors(id,name,normalized_name)
 values ('bbbbbbbb-0000-0000-0000-000000000001','Test Vendor','test vendor');

-- Product bought at $2.00, later at $3.00. Sales straddle the change.
insert into public.pricing_products(id,hub_item_id,name,category,upc,current_unit_cost,current_retail_price)
 values ('cccccccc-0000-0000-0000-000000000001',9001,'Test Coffee','Tea/Coffee','0074471000500',3.0000,5.99);
-- A product with no POS match at all, to prove unmatched revenue is separated.
insert into public.pricing_products(id,hub_item_id,name,category,current_unit_cost,current_retail_price)
 values ('cccccccc-0000-0000-0000-000000000002',9002,'Test Rice','Rice',1.0000,1.99);
insert into public.pricing_vendor_products(vendor_id,vendor_sku,product_id)
 values ('bbbbbbbb-0000-0000-0000-000000000001','SKU-1','cccccccc-0000-0000-0000-000000000001');

-- Cost history: $2.00 from Jul 1, $3.00 from Aug 10.
insert into public.pricing_price_history(source_key,product_id,previous_unit_cost,new_unit_cost,previous_retail_price,new_retail_price,retail_multiplier,changed_at)
 values ('t1','cccccccc-0000-0000-0000-000000000001',null,2.0000,null,3.99,1.70,'2026-07-01'),
        ('t2','cccccccc-0000-0000-0000-000000000001',2.0000,3.0000,3.99,5.99,1.70,'2026-08-10');

-- Two invoices: one paid, one unpaid and past NET21 as of 2026-08-19.
insert into public.pricing_invoices(id,vendor_id,invoice_number,invoice_date,source_sha256,invoice_subtotal,status,paid_at)
 values ('dddddddd-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','INV-JUL','2026-07-01','h1',400.00,'backfilled','2026-07-20');
insert into public.pricing_invoices(id,vendor_id,invoice_number,invoice_date,source_sha256,invoice_subtotal,status)
 values ('dddddddd-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000001','INV-AUG','2026-07-20','h2',600.00,'backfilled');

insert into public.pos_import_batches(id,filename,source_sha256,period_start,period_end,row_count)
 values ('eeeeeeee-0000-0000-0000-000000000001','nrs_sales_2026-08.csv','poshash1','2026-08-01','2026-08-15',4);

-- 10 units sold Aug 5 (cost then $2.00) and 10 units Aug 15 (cost then $3.00).
insert into public.pos_sales(batch_id,sold_at,upc,item_name,normalized_name,department,quantity,unit_price,gross_sales,product_id,match_method)
 values ('eeeeeeee-0000-0000-0000-000000000001','2026-08-05','0074471000500','Test Coffee','TEST COFFEE','Tea/Coffee',10,5.99,59.90,'cccccccc-0000-0000-0000-000000000001','upc'),
        ('eeeeeeee-0000-0000-0000-000000000001','2026-08-15','0074471000500','Test Coffee','TEST COFFEE','Tea/Coffee',10,5.99,59.90,'cccccccc-0000-0000-0000-000000000001','upc');
-- An unmatched line: revenue with no known cost.
insert into public.pos_sales(batch_id,sold_at,item_name,normalized_name,department,quantity,unit_price,gross_sales)
 values ('eeeeeeee-0000-0000-0000-000000000001','2026-08-12','Mystery Item','MYSTERY ITEM','Grocery',5,2.00,10.00);
-- A void: kept, flagged, and excluded from revenue.
insert into public.pos_sales(batch_id,sold_at,item_name,normalized_name,quantity,gross_sales,is_void)
 values ('eeeeeeee-0000-0000-0000-000000000001','2026-08-12','Test Coffee','TEST COFFEE',1,5.99,true);

select '--- 1. POS batch idempotency: same file cannot import twice ---' as t;
insert into public.pos_import_batches(source_sha256) values ('poshash1');

select '--- 2. cost_at resolves the cost in effect on the sale date ---' as t;
select public.pricing_cost_at('cccccccc-0000-0000-0000-000000000001','2026-08-05') as aug5_expect_2,
       public.pricing_cost_at('cccccccc-0000-0000-0000-000000000001','2026-08-15') as aug15_expect_3;

select '--- 3. vendor spend by month ---' as t;
select month, vendor_name, invoice_count, total_spend from public.pricing_vendor_spend();

select '--- 4. NET21 aging (as of 2026-08-19; INV-AUG due 2026-08-10 = 9 days late) ---' as t;
select invoice_number, invoice_date, due_date, amount, days_overdue, bucket
  from public.pricing_invoice_aging('2026-08-19');

select '--- 5. margin by category: COGS = 10*2.00 + 10*3.00 = 50.00 ---' as t;
select label, units_sold, revenue, cost_of_goods, gross_profit, margin_pct, matched_revenue, unmatched_revenue
  from public.pricing_margin_by('category');

select '--- 6. margin by vendor ---' as t;
select label, revenue, cost_of_goods, gross_profit from public.pricing_margin_by('vendor');

select '--- 7. margin by item ---' as t;
select label, units_sold, revenue, cost_of_goods from public.pricing_margin_by('item');

select '--- 8. P&L summary, August only ---' as t;
-- Both invoices are dated July, so August vendor spend is legitimately $0:
-- a P&L for a month reports that month's purchases, not the running catalog.
select jsonb_pretty(public.pricing_pnl_summary('2026-08-01','2026-08-31'));

select '--- 8b. P&L summary, full range (picks up both July invoices) ---' as t;
select jsonb_pretty(public.pricing_pnl_summary('2026-07-01','2026-08-31'));

select '--- 9. price-increase alerts ---' as t;
select product_name, previous_unit_cost, new_unit_cost, delta, percent_change
  from public.pricing_increase_alerts(36500);

select '--- 10. voids are kept, not deleted ---' as t;
select count(*) as void_rows_retained from public.pos_sales where is_void;

select '--- 11. POS tables are deny-by-default ---' as t;
select relname, relrowsecurity from pg_class where relname in ('pos_sales','pos_import_batches') order by 1;
select count(*) as anon_or_authenticated_grants
  from information_schema.role_table_grants
 where table_schema='public' and table_name in ('pos_sales','pos_import_batches') and grantee in ('anon','authenticated');

select '--- 12. match_method is constrained to auditable values ---' as t;
insert into public.pos_sales(batch_id,sold_at,item_name,quantity,gross_sales,match_method)
 values ('eeeeeeee-0000-0000-0000-000000000001','2026-08-12','Bad',1,1.00,'vibes');
