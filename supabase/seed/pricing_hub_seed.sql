-- GENERATED FILE — do not edit by hand.
-- Regenerate with: node scripts/seed-pricing-from-hub.js
--
-- Backfills the Supabase pricing schema from the embedded Pricing Hub arrays
-- in apps/pricing-hub/index.html. Ids are UUIDv5 of stable natural keys, so
-- this file is idempotent: running it twice updates rows rather than
-- duplicating them.
--
-- Source: 10 vendors · 17 invoices · 283 products · 294 invoice lines · 11 price transitions
--
-- Repeat purchases collapsed into one product (the later invoice is current):
--   Mama Tere Yuca en Trozos / Frozen Cassava (FZ) (item #1705) bought 2x — hub ids 102 → 212
--   MamaTere Yuca en Trozos / Frozen Cassava (FZ) (item #1708) bought 2x — hub ids 103 → 211
--   Mama Tere Jelly Fruits Net (item #2280) bought 2x — hub ids 111 → 179
--   Mama Tere Plantain Chips Salted Jar Shipper (item #8714) bought 2x — hub ids 112 → 185
--   Mama Tere RD Casabe Artesanal (item #3419) bought 2x — hub ids 125 → 184
--   Mama Tere Lentejon (item #2626) bought 2x — hub ids 130 → 198
--   ILE Alino Adobo Pet (item #5442) bought 2x — hub ids 143 → 202
--   Hornimans Te de Manzanilla (item #5300) bought 2x — hub ids 147 → 200
--   Ecuatun Tuna in Oil Can 4pk (item #1116) bought 2x — hub ids 152 → 183
--   Florida Tuna in vegetable Oil (item #1120) bought 2x — hub ids 154 → 180
--   Van Camps Yellowfin Tuna in Oil (item #1101) bought 2x — hub ids 157 → 181
--     cost moved $2.3656 → $2.0615

begin;

-- ── Vendors ────────────────────────────────────────────────────────────────
insert into public.pricing_vendors (id, name, normalized_name) values ('dd3f1cde-3172-5f32-b08a-be12822e2214', 'Super Trading', 'super trading')
  on conflict (id) do update set name = excluded.name, normalized_name = excluded.normalized_name, updated_at = now();
insert into public.pricing_vendors (id, name, normalized_name) values ('dd5b1cc6-d772-5252-830c-92f50bee9d80', 'Hershey''s Ice Cream', 'hershey''s ice cream')
  on conflict (id) do update set name = excluded.name, normalized_name = excluded.normalized_name, updated_at = now();
insert into public.pricing_vendors (id, name, normalized_name) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', 'Family Food Distributors', 'family food distributors')
  on conflict (id) do update set name = excluded.name, normalized_name = excluded.normalized_name, updated_at = now();
insert into public.pricing_vendors (id, name, normalized_name) values ('425ae6ef-c0a2-5cd1-8c9d-015d0fe1c0d8', 'Amaro Food Enterprises', 'amaro food enterprises')
  on conflict (id) do update set name = excluded.name, normalized_name = excluded.normalized_name, updated_at = now();
insert into public.pricing_vendors (id, name, normalized_name) values ('37e98e34-07ef-516b-8dd0-a690e31ee273', 'JCC Ganoza LLC', 'jcc ganoza llc')
  on conflict (id) do update set name = excluded.name, normalized_name = excluded.normalized_name, updated_at = now();
insert into public.pricing_vendors (id, name, normalized_name) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'NACfoods', 'nacfoods')
  on conflict (id) do update set name = excluded.name, normalized_name = excluded.normalized_name, updated_at = now();
insert into public.pricing_vendors (id, name, normalized_name) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', 'TAINO Trading Corp', 'taino trading corp')
  on conflict (id) do update set name = excluded.name, normalized_name = excluded.normalized_name, updated_at = now();
insert into public.pricing_vendors (id, name, normalized_name) values ('61e73f53-6061-5517-95e1-38f77d2f3921', 'GOYA Foods', 'goya foods')
  on conflict (id) do update set name = excluded.name, normalized_name = excluded.normalized_name, updated_at = now();
insert into public.pricing_vendors (id, name, normalized_name) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', 'Peru Food', 'peru food')
  on conflict (id) do update set name = excluded.name, normalized_name = excluded.normalized_name, updated_at = now();
insert into public.pricing_vendors (id, name, normalized_name) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'Peruvian Import Co', 'peruvian import co')
  on conflict (id) do update set name = excluded.name, normalized_name = excluded.normalized_name, updated_at = now();

-- ── Products ───────────────────────────────────────────────────────────────
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'fa4b25cf-5167-5671-8854-bdc341b694bb', 1, '{1}', '7" Pan 500ct', 'Hot Food Supplies', 'Hot Food Supplies',
  500, 0.084, null, true, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '1d21cc34-0357-5297-979d-2c4704411d50', 2, '{2}', '7" Dome Lid 500ct', 'Hot Food Supplies', 'Hot Food Supplies',
  500, 0.038, null, true, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '0272fe4f-5a8d-59ac-9764-b675fb02e243', 3, '{3}', '8oz Deli Combo', 'Deli Containers', 'Deli Containers',
  24, 1.25, 1.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '99e1b020-bfb7-5ff9-a7a1-e6bd3b195a82', 4, '{4}', '16oz Deli Combo', 'Deli Containers', 'Deli Containers',
  24, 1.4167, 1.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '8741497f-19f4-5d98-a0b2-511ee87822ec', 5, '{5}', 'OKF Aloe S 20ct', 'Beverages', 'Beverages',
  20, 1.05, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '767792b3-34b1-5f1b-b64e-573ec001a99e', 6, '{6}', 'OKF Aloe L 12ct', 'Beverages', 'Beverages',
  12, 2.5, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '707adbed-570f-51fb-b2e5-9903c889c430', 7, '{7}', 'Trix Cereal 12ct', 'Cereal', 'Cereal',
  12, 3.5, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '2ab5fe45-b9ff-53d8-8ff5-bc463c58c45c', 8, '{8}', 'Cinnamon Toast 12ct', 'Cereal', 'Cereal',
  12, 3.5, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'a6c7c3fc-da00-5830-bf5b-401333fb6865', 9, '{9}', 'Cheerios L 14ct', 'Cereal', 'Cereal',
  14, 3.8571, 6.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'a29c6260-266a-504e-b626-a4a98d605eb2', 10, '{10}', 'Coco Pebbles 12ct', 'Cereal', 'Cereal',
  12, 3.5, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd54af35c-791a-528b-9a68-ee716aedf357', 11, '{11}', 'Peanut Butter 11ct', 'Grocery', 'Grocery',
  11, 1.7273, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'a4b03d61-9bbe-5d9c-9590-605305421b32', 12, '{12}', 'Oatmeal 16/18oz', 'Grocery', 'Grocery',
  16, 1.25, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '90d64415-76e6-5aff-b6ac-9e8b040fe87b', 13, '{13}', 'Del Monte Corn 12ct', 'Grocery', 'Grocery',
  12, 1.3333, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '80f8484f-e78a-5089-97a5-e2a23593b0a2', 14, '{14}', 'Awesome Detergent 8/64oz', 'Cleaning', 'Cleaning',
  8, 2.75, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '82f61b1b-62a7-5454-aee8-c67a4bd14c54', 15, '{15}', 'Downy 12/360ml', 'Laundry', 'Laundry',
  12, 1.3333, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'ad1b19cb-97f1-5ef5-8aea-689c69347c64', 16, '{16}', 'Clorox Bleach 6/43oz', 'Cleaning', 'Cleaning',
  6, 3.3333, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '073fea34-b10d-5254-9b2c-70204cd8357a', 17, '{17}', 'Clorox Bleach 20/500ml', 'Cleaning', 'Cleaning',
  20, 1.1, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'c3b291e0-9daa-5fcf-807f-df2c00e00159', 18, '{18}', 'Suavitel Sheets 15ct', 'Laundry', 'Laundry',
  15, 1.0667, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'f51f6f9b-9b99-5d62-8543-49766846f392', 19, '{19}', 'Sponges 27ct', 'Cleaning', 'Cleaning',
  27, 0.7778, 0.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '467d025b-bc22-5fe0-8ff7-70d1749c693b', 20, '{20}', 'Dove Soap 48/135g', 'Personal Care', 'Personal Care',
  48, 0.9583, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '655629b7-631a-5558-9a58-96f7241239cc', 21, '{21}', 'Febreze 8ct', 'Cleaning', 'Cleaning',
  8, 2.625, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '56f950a5-f1ba-5ca2-a39f-3796274b1e43', 22, '{22}', 'Hispano de Miel 48ct', 'Personal Care', 'Personal Care',
  48, 0.8333, 0.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'e9d8429d-12c3-51b2-85fd-7224c7208cb4', 23, '{23}', 'Hispano Pasta 25/2bars', 'Personal Care', 'Personal Care',
  25, 1.4, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'fa278462-2980-5257-8eba-098d27b5fa8a', 24, '{24}', 'Hispano Pasta 10/5pk', 'Personal Care', 'Personal Care',
  10, 3.5, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'ee75f174-e657-5282-a5ee-4bb5584ceb77', 25, '{25}', 'Windex 8/32oz', 'Cleaning', 'Cleaning',
  8, 4, 6.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'eaa71868-6dd5-5017-a43d-5e0633c7868f', 26, '{26}', 'Fabuloso 6/56oz', 'Cleaning', 'Cleaning',
  6, 4, 6.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '4b255476-82c8-514d-b583-f04ebbb04868', 27, '{27}', 'Mistolin 24/15oz', 'Cleaning', 'Cleaning',
  24, 0.9167, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '01eeae77-8f7f-5298-9868-d32bb9b5b4b6', 28, '{28}', 'Fabuloso 12/28oz', 'Cleaning', 'Cleaning',
  12, 2.1667, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '879deadc-f465-52c2-913f-869a1030feae', 29, '{29}', 'Pampers Wipes 12ct', 'Baby', 'Baby',
  12, 1.75, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '3ea5d845-e9fa-5ced-816a-30ee4ece3b05', 30, '{30}', 'Huggies Baby Wipes 10ct', 'Baby', 'Baby',
  10, 1.6, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '697ccbca-565a-5299-96a7-05c3ee9ddc5e', 31, '{31}', '9" Paper Plate 10/100ct', 'Paper & Foil', 'Paper & Foil',
  10, 2.3, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '14739f37-aa88-50ca-b3a3-6464047a11c0', 32, '{32}', 'Reynolds Foil 25ft 24ct', 'Paper & Foil', 'Paper & Foil',
  24, 1.9167, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '401e9d00-bd86-5c0b-8928-bbe9315ab697', 33, '{33}', 'Rectangular Pan 50ct', 'Paper & Foil', 'Paper & Foil',
  50, 0.76, 0.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '4eaaa253-6ffd-5297-9907-e8383e4fd819', 34, '{34}', 'Water Wipes 12ct', 'Baby', 'Baby',
  12, 1.3333, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '5698cd83-a25e-50c7-ae06-d5a446049800', 35, '{35}', 'Jelly Candy Monkey 6ct', 'Candy/Snacks', 'Candy/Snacks',
  6, 5.3333, 8.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'dfb36156-e442-54b2-9e6c-17cb97a12335', 36, '{36}', 'Scott Issue 36ct', 'Paper & Foil', 'Paper & Foil',
  36, 0.8056, 0.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'ffa88345-941e-539e-9fd6-29bfe9e30386', 101, '{101}', 'Mama Tere Maracuya Entera (FZ) 6/32oz', 'Frozen Fruit', 'Frozen Fruit',
  6, 5.9917, 9.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '6606318f-15ed-5353-947a-c324d8ad392f', 104, '{104}', 'Naturissimo Pan de Yuca/Cheese Bread 16ct', 'Frozen Bakery', 'Frozen Bakery',
  16, 4.5594, 7.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '69e5b567-4dfc-5987-9188-47bae1775a6d', 105, '{105}', 'Mama Tere Cheese Tequeno Precooked 12/8ct', 'Frozen Bakery', 'Frozen Bakery',
  12, 4.2, 6.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '70597fde-fe6d-5062-9ae1-f5052b97962f', 106, '{106}', 'Mama Tere Pulpa Maracuya (FZ) 12/14oz', 'Frozen Pulpa', 'Frozen Pulpa',
  12, 3.1417, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'cd385816-fdcc-5ca3-ba68-425f9908d1db', 107, '{107}', 'Mama Tere Pulpa Mora (FZ) 12/14oz', 'Frozen Pulpa', 'Frozen Pulpa',
  12, 2.5417, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'a52638a3-e3bc-526f-9a99-ca4e906cfa0b', 108, '{108}', 'Mama Tere Pulpa Naranjilla (FZ) 12/14oz', 'Frozen Pulpa', 'Frozen Pulpa',
  12, 2.5417, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'feffddf2-ecb2-56f3-864b-0aeacdb9aae6', 109, '{109}', 'Mama Tere Pulpa Tomate Arbol (FZ) 12/14oz', 'Frozen Pulpa', 'Frozen Pulpa',
  12, 2.5417, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'b86fba65-8c49-51cd-acc2-780564dab7e6', 110, '{110}', 'Mama Tere Choclo Desgranado (FZ) 20/16oz', 'Frozen Veg', 'Frozen Veg',
  20, 2.52, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '9bcc8488-d395-594c-aee9-a8c7a09b1ae2', 113, '{113}', 'Guitig Agua Mineral Pet 12/16.9oz', 'Beverages', 'Beverages',
  12, 1.1083, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '36aea547-969e-56dd-add2-103d61130078', 114, '{114}', 'Tropical Soda Glass 24/12oz', 'Beverages', 'Beverages',
  24, 1.2896, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd879eee2-dfc1-5d9e-aed6-545259d7141a', 115, '{115}', 'Tropical Soda Pet 8/67.62oz (2lt)', 'Beverages', 'Beverages',
  8, 2.6, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'db95e767-00fb-597b-8d69-6c7a672090a0', 116, '{116}', 'Fioravanti Strawberry Soda Pet 6/2lt', 'Beverages', 'Beverages',
  6, 4.6583, 7.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '5c7e180b-c2d2-5a1e-8a3f-cbf047d67475', 117, '{117}', 'Fioravanti Apple Soda Pet 6/2lt', 'Beverages', 'Beverages',
  6, 4.6583, 7.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'fa4e7e63-9c0e-50e4-894b-c4dc0f25f0a8', 118, '{118}', 'Del Frutal Pineapple Nectar Tetra 8/3pk', 'Beverages', 'Beverages',
  8, 1.5625, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'b86768ab-d641-57e6-894e-e387d8eed6ce', 119, '{119}', 'Del Frutal Mango Nectar Tetra 8/3pk', 'Beverages', 'Beverages',
  8, 1.5625, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '375d66a2-6fcc-5d42-9cc4-1cd1aa8da030', 120, '{120}', 'Incasur Sol Cusco Choc C&C Bar 48/3.17oz', 'Candy/Snacks', 'Candy/Snacks',
  48, 0.9896, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'bd5b9289-397f-5731-b9c2-50d1f6dba0b0', 121, '{121}', 'Incasur Sol Cusco Chocolate Bar 48/3.17oz', 'Candy/Snacks', 'Candy/Snacks',
  48, 0.9896, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '1cb35b62-bb9e-53de-90ca-22af7832922d', 122, '{122}', 'Allegra Rotini Pasta 20/16oz', 'Dry Goods', 'Dry Goods',
  20, 1.17, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'f162f194-accf-53d6-83b5-b4e25937016e', 123, '{123}', 'Nestle Galak 2 disp/12un', 'Candy/Snacks', 'Candy/Snacks',
  24, 2.9792, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '8d370f04-ba71-5a38-be46-3e66f8540ecc', 124, '{124}', 'Mama Tere Jelly Stars Jar 6/49oz', 'Candy/Snacks', 'Candy/Snacks',
  6, 5.4, 8.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '4e9016e3-6e70-5349-80d8-fb2dd2e44d88', 126, '{126}', 'Angelitos Malvaviscos Churro Fresa 10/7oz', 'Candy/Snacks', 'Candy/Snacks',
  10, 1.555, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '48347134-3837-5dc3-b193-ac3be0fe0758', 127, '{127}', 'Mama Tere Jasmine Rice Hom Mali 2/320oz', 'Rice', 'Rice',
  2, 22.475, 37.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'e57872a3-cd65-5994-8221-4dc5d525d8a9', 128, '{128}', 'Mama Tere Jasmine Rice Hom Mali 8/80oz', 'Rice', 'Rice',
  8, 5.7188, 9.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '1a697e67-b896-5254-a1e5-002590d0c25e', 129, '{129}', 'Toops Chocolate 12/7.8oz', 'Candy/Snacks', 'Candy/Snacks',
  12, 2.875, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '4687ac44-45a1-5151-a3e9-d28932f4c30b', 131, '{131}', 'Mama Tere Canguil 12/32oz (2lb)', 'Dry Goods', 'Dry Goods',
  12, 2.6, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'b57acc07-5d7f-5df6-91e2-37bcacc195ee', 132, '{132}', 'Harina Ya 25/35.2oz (1kg)', 'Dry Goods', 'Dry Goods',
  25, 2.918, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '38b2518c-e39e-5e7f-a5cb-88de443745c3', 133, '{133}', 'Quaker Avena Molida 25/17.6oz', 'Dry Goods', 'Dry Goods',
  25, 2.594, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'b3ca16fb-3dc3-5a27-a322-0e86a6e4d1e5', 134, '{134}', 'Picamas Hot Green Sauce 24/6.2oz', 'Condiments', 'Condiments',
  24, 1.4292, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '764ea2a2-a2a6-5b40-a792-6a7299c11ea7', 135, '{135}', 'Tapiorica Manzana 6/14.1oz', 'Dry Goods', 'Dry Goods',
  6, 3.325, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '767247ae-9208-5af9-ac0b-272f50995595', 136, '{136}', 'Tapiorica Fresa 6/14.1oz', 'Dry Goods', 'Dry Goods',
  6, 3.325, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '6666a7e8-c1e7-5137-8cb0-aabd30f5fa10', 137, '{137}', 'Mama Tere Pacaya 12/32oz (907g)', 'Canned/Jarred', 'Canned/Jarred',
  12, 6.2458, 10.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '9cf77f7c-ce7e-56f9-b65b-c08c6ce50e10', 138, '{138}', 'ILE Alino Adobo Glass 12/8.8oz', 'Condiments', 'Condiments',
  12, 2.2083, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '0c687c7e-d685-5b03-9d58-5f6d5936625e', 139, '{139}', 'Nestle Amor Wafer Vainilla 36/6.1oz', 'Candy/Snacks', 'Candy/Snacks',
  36, 1.7486, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '01e9df39-24d3-5225-a808-b5a4183a923f', 140, '{140}', 'La Favorita Achiote Liquido 30/16.9oz', 'Condiments', 'Condiments',
  30, 3.3317, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '3fb0eb0c-48e5-5db4-b01a-6c55282338dd', 141, '{141}', 'Oriental Salsa China 24/13.52oz', 'Condiments', 'Condiments',
  24, 2.7229, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'a9fdc3a3-f0cf-5fcc-8a35-3ea828d3d7de', 142, '{142}', 'Mama Tere Pasta de Ajo Pet 12/17.6oz', 'Condiments', 'Condiments',
  12, 3.5667, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '1bf68753-6af3-526f-bfb5-744c0c5098f3', 144, '{144}', 'Mondaisa Te Boldo 6/20ct', 'Tea/Coffee', 'Tea/Coffee',
  6, 2.4, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd3d6607a-3c7d-594d-8b4c-7ac4265bd939', 145, '{145}', 'Mondaisa Te Jengibre & Limon 6/20ct', 'Tea/Coffee', 'Tea/Coffee',
  6, 2.5917, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '5fca1ad1-5a73-5b75-a968-6d5e1c21e491', 146, '{146}', 'Mondaisa Te Menta-Eucalipto 6/20ct', 'Tea/Coffee', 'Tea/Coffee',
  6, 2.5917, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '49b9b7bb-1258-5d77-ba7a-31b24a0cad58', 148, '{148}', 'Toni Leche Chocolate Milk 6/33.8oz (1lt)', 'Beverages', 'Beverages',
  6, 5.2, 8.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd8ff2562-23bb-5b99-96da-fe97e8c15619', 149, '{149}', 'Toni Gelatina Uva-Grape Jello 24/7.05oz', 'Dry Goods', 'Dry Goods',
  24, 1.1042, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '831ce589-86f1-5d9c-b10f-20d161b90a95', 150, '{150}', 'Mama Tere Horchata 50/1oz', 'Beverages', 'Beverages',
  50, 1.299, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '5a99119b-c122-5b15-aa82-4d302cbd280c', 151, '{151}', 'Ecuatun Tuna in Oil 48/5oz', 'Canned Tuna', 'Canned Tuna',
  48, 1.874, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'ad5b8cc0-4bce-5687-a7c4-540aa6b8caad', 153, '{153}', 'Ecuatun Encebollado Tuna Soup 24/14oz', 'Canned Tuna', 'Canned Tuna',
  24, 3.6417, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '23088c33-4862-5de8-afbe-75071c87bff9', 155, '{155}', 'Florida Tuna in Water 48/5oz', 'Canned Tuna', 'Canned Tuna',
  48, 1.949, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'bba755be-b7b2-55f0-8015-beae919c885c', 156, '{156}', 'Van Camps Yellowfin Tuna in Oil 24/4pk/3oz', 'Canned Tuna', 'Canned Tuna',
  24, 5.8313, 9.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '98d81666-ab28-541d-8470-c8f897b62ac6', 158, '{158}', 'Neapolitan 1.5QT Scround', 'Frozen Desserts', 'Frozen Desserts',
  3, 4.83, 7.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '233f20c3-5299-5994-9614-db425b7b0d1d', 159, '{159}', 'Chocolate 1.5QT Scround', 'Frozen Desserts', 'Frozen Desserts',
  3, 4.83, 7.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '180b2edd-1bdd-51da-80df-23caa9c4fff9', 160, '{160}', 'Strawberry 1.5QT Scround', 'Frozen Desserts', 'Frozen Desserts',
  3, 4.83, 7.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '4a67163d-8cf9-514c-8473-648f1f67a570', 161, '{161}', 'Cookies N Cream 1.5QT Scround', 'Frozen Desserts', 'Frozen Desserts',
  3, 4.83, 7.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '629e4e48-8ec2-58c2-84ea-409c0246b6a9', 162, '{162}', 'Butter Pecan Pint', 'Frozen Desserts', 'Frozen Desserts',
  6, 2.92, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '1c59a807-1457-550e-ab39-eb35eec59025', 163, '{163}', 'Brownie Batter Pint', 'Frozen Desserts', 'Frozen Desserts',
  6, 2.92, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '69f72a48-8c30-54cb-a2ad-ebda38eb33f4', 164, '{164}', 'Lil'' Blue Panda Pint', 'Frozen Desserts', 'Frozen Desserts',
  6, 2.92, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '2d61345c-ce05-55bf-8af6-76a448b3c591', 165, '{165}', 'Twix Ice Cream Bar', 'Frozen Desserts', 'Frozen Desserts',
  24, 2.2042, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'e5da914f-8a6e-5e9f-a65b-63c3d9249fad', 166, '{166}', 'Vanilla 6oz Cup', 'Frozen Desserts', 'Frozen Desserts',
  12, 1.83, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '269ec070-0f89-5209-b945-4cd5a224dff4', 167, '{167}', 'Straw Sundae 6oz Cup', 'Frozen Desserts', 'Frozen Desserts',
  12, 1.83, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '1307c72d-c8c8-5dc7-93ca-627f0405bfb0', 168, '{168}', 'NP Mini Sandwich', 'Frozen Desserts', 'Frozen Desserts',
  48, 0.46, 0.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '1e4306e8-f466-570a-a644-5286d318a82f', 169, '{169}', 'Delivery Fee', 'Fees', 'Fees',
  1, 5, null, true, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'e73dccf9-b4de-5053-bc83-301920b3662a', 170, '{170}', 'Saba Ultra Invisible Long Pads Wings', 'Health & Beauty', 'Health & Beauty',
  12, 3.1392, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '7c4aa759-9f54-5fb7-8283-446155f8fc98', 171, '{171}', 'Saba Ultra Invisible Overnight Pads Wings', 'Health & Beauty', 'Health & Beauty',
  16, 3.1481, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '00de6ab7-295b-51b4-82cc-e710527357be', 172, '{172}', 'Taqueritos Chile Toreado Snack', 'Snacks', 'Snacks',
  20, 2.5975, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'e505774e-01bb-5dcb-a270-d9eb4fe4530d', 173, '{173}', 'Del Frutal Pineapple Nectar Tetra', 'Beverages', 'Beverages',
  8, 1.5625, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'c6b02f9f-75ad-52b1-aab6-d28b3f21946c', 174, '{174}', 'Del Frutal Mango Nectar Tetra', 'Beverages', 'Beverages',
  8, 1.5625, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '03327e4e-fa1f-5c09-a413-e57ef6bce980', 175, '{175}', 'Maltin Polar Glass', 'Beverages', 'Beverages',
  4, 5.4875, 8.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '8019dab1-6a54-5276-a351-f38715573057', 176, '{176}', 'Manzana Soda Glass', 'Beverages', 'Beverages',
  24, 1.2896, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '6c82064f-4fb3-5462-aaf6-6b458f30ea28', 177, '{177}', 'Guitig Agua Mineral Pet', 'Beverages', 'Beverages',
  6, 2.4917, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '405cf37e-23d7-56e7-9f93-3b4fa10afc1c', 178, '{178}', 'Manzana Soda Pet', 'Beverages', 'Beverages',
  8, 2.6, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '0ad4bb76-c757-5405-b431-e24eacd1a943', 179, '{111,179}', 'Mama Tere Jelly Fruits Net', 'Candy', 'Candy',
  24, 1.3229, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '941eabc2-9a01-518c-b1c2-92586a8a584d', 180, '{154,180}', 'Florida Tuna in vegetable Oil', 'Canned Goods', 'Canned Goods',
  48, 1.949, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'b6188181-497d-5b86-913d-2d17898d01b2', 181, '{157,181}', 'Van Camps Yellowfin Tuna in Oil', 'Canned Goods', 'Canned Goods',
  48, 2.0615, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '65329392-a5ce-5c83-9ff5-f804f804b427', 182, '{182}', 'Ecuatun Sango/ Tuna Plantain Stew', 'Canned Goods', 'Canned Goods',
  12, 4.7458, 7.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'e898fc13-9a3b-5982-8187-16d8bcbd7a63', 183, '{152,183}', 'Ecuatun Tuna in Oil Can 4pk', 'Canned Goods', 'Canned Goods',
  20, 4.7975, 7.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'c15523c1-0689-57cf-9b0a-bc1d3e20a929', 184, '{125,184}', 'Mama Tere RD Casabe Artesanal', 'Snacks', 'Snacks',
  10, 2.465, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '8bc32381-a21a-5202-9032-d019a56d214d', 185, '{112,185}', 'Mama Tere Plantain Chips Salted Jar Shipper', 'Snacks', 'Snacks',
  36, 5.2208, 8.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '1d61f59c-27df-5e67-891c-b91f14d4158f', 186, '{186}', 'La Universal Manicho', 'Candy', 'Candy',
  36, 2.0083, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '8fe401cd-138f-5d88-b839-638ee1ecb7c6', 187, '{187}', 'Allegra Angel Hair Pasta', 'Pasta', 'Pasta',
  20, 1.088, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '357f7a92-820b-5686-a878-45a2d8b3c824', 188, '{188}', 'Allegra Coil Fideo Pasta', 'Pasta', 'Pasta',
  12, 1.2092, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '148e762e-9087-5938-bd84-cb776cce5fc2', 189, '{189}', 'Allegra Linguini Pasta', 'Pasta', 'Pasta',
  20, 1.088, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '4bcc0406-05b9-54fa-a842-19dc8e40ea17', 190, '{190}', 'Allegra Penne Rigate Pasta', 'Pasta', 'Pasta',
  20, 1.088, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd64cbcaa-d9ee-5531-b0c9-06ddb8cd9796', 191, '{191}', 'Allegra Spaghetti Pasta', 'Pasta', 'Pasta',
  20, 1.088, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '3fac66dd-bd01-5e88-a3ea-7ef5fc7c60fb', 192, '{192}', 'Allegra Thin Spaguetti #9 Pasta', 'Pasta', 'Pasta',
  20, 1.088, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '2ebbf872-6de2-579e-9ea0-00092ac0d6ca', 193, '{193}', 'Allegra Tricolor Rotini', 'Pasta', 'Pasta',
  12, 1.2092, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '7514e2b4-c128-5e4b-9d59-9deb6377f40f', 194, '{194}', 'Allegra Rigatoni Pasta', 'Pasta', 'Pasta',
  20, 1.088, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'a0ebea73-d778-578e-918e-2b15fbeab0f4', 195, '{195}', 'Mondaisa Te Flor de Tilo', 'Tea & Coffee', 'Tea & Coffee',
  6, 2.4, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '108072e2-b4c5-5933-8a8b-8cf8c4b065c8', 196, '{196}', 'Mondaisa Te Curcuma Jengibre', 'Tea & Coffee', 'Tea & Coffee',
  6, 2.4, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '7aabe60f-dfb9-5afb-b09d-d7fc179ea270', 197, '{197}', 'Mama Tere Achiote en Grano (Bag)', 'Condiments', 'Condiments',
  24, 3.8313, 6.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '26459064-7905-5ce9-92e2-7c41381cdeae', 198, '{130,198}', 'Mama Tere Lentejon', 'Snacks', 'Snacks',
  24, 1.0396, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '5b5a96ce-8b2d-5c76-8f8f-f32edac08c14', 199, '{199}', 'Hornimans Te Relajante', 'Tea & Coffee', 'Tea & Coffee',
  12, 3.05, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '6828de1b-000b-54c5-bce5-778716d7dbe3', 200, '{147,200}', 'Hornimans Te de Manzanilla', 'Tea & Coffee', 'Tea & Coffee',
  12, 2.3292, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '704cca37-d3ed-53b9-841e-08688751a249', 201, '{201}', 'ILE Pasta de Ajo Pet', 'Condiments', 'Condiments',
  12, 3.5667, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '611df487-0edd-567a-938e-fd8274e9cff6', 202, '{143,202}', 'ILE Alino Adobo Pet', 'Condiments', 'Condiments',
  12, 2.5292, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'c2827b27-6010-599b-a438-dd8b1e3e784c', 203, '{203}', 'ILE Sabora Pasta', 'Condiments', 'Condiments',
  12, 2.9125, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'c2e94303-b80b-5ca8-a126-d5526d704604', 204, '{204}', 'Mama Tere Jasmine Rice Thai Hom Mali', 'Rice & Grains', 'Rice & Grains',
  20, 2.3375, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'c658e5ae-58b0-5810-8822-f8b083474f8a', 205, '{205}', 'Maizabrosa', 'Rice & Grains', 'Rice & Grains',
  12, 4.2833, 6.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '65826603-c87e-5e4a-92da-7d5c51c3099f', 206, '{206}', 'Chocomelher Classic', 'Beverages', 'Beverages',
  24, 2.1646, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'a38fa797-c36a-53d4-951b-136d7be43972', 207, '{207}', 'Nestle PE Sublime Clasico', 'Candy', 'Candy',
  4, 14.4875, 24.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '89c7f971-ba17-5fb5-b88e-d451db0f06c3', 208, '{208}', 'Nestle PE Princesa Bombom', 'Candy', 'Candy',
  8, 6.4375, 10.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'a40a83a3-960a-5a15-9d7f-d7fedfdec71e', 209, '{209}', 'Nestle PE Morochas Galletas 6pk', 'Candy', 'Candy',
  30, 2.34, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '0ef2a5b6-db25-5792-8174-e907e38d80c6', 210, '{210}', 'Mama Tere Hoja de Mashan (FZ)', 'Frozen', 'Frozen',
  12, 2.9958, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '514ea94e-7033-5a35-b7e9-f43e076d96a9', 211, '{103,211}', 'MamaTere Yuca en Trozos / Frozen Cassava (FZ)', 'Frozen', 'Frozen',
  6, 7.6583, 12.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '88b496bc-9145-5dc8-bc1d-e9ab0defe5ca', 212, '{102,212}', 'Mama Tere Yuca en Trozos / Frozen Cassava (FZ)', 'Frozen', 'Frozen',
  12, 3.8292, 6.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '8e311a14-9d27-57a8-a4fe-b5fed4e32811', 213, '{213}', 'Mama Tere Naranjilla (FZ)', 'Frozen', 'Frozen',
  12, 3.125, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '71cf2af5-81fc-5724-9cfb-ef223d32fcd0', 214, '{214}', 'Mama Tere Tomate Arbol (FZ)', 'Frozen', 'Frozen',
  12, 2.875, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '65cc9bbb-8700-5638-845b-d9ebefb9b5f1', 215, '{215}', 'Mama Tere Papa Criolla (FZ)', 'Frozen', 'Frozen',
  6, 5.7, 9.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '257b7fc3-f87b-569c-9d64-3a471ff16ced', 216, '{216}', 'Mama Tere Choclo Entero (FZ)', 'Frozen', 'Frozen',
  6, 8.1583, 13.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '55d40674-30f1-5c49-b454-6c6ec153a062', 217, '{217}', 'Mama Tere Mote Precocido (FZ)', 'Frozen', 'Frozen',
  8, 6.6, 10.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'f1d6b93f-aa5b-5471-a8b4-6fc8b8a791af', 218, '{218}', 'Mama Tere Pulpa Maracuya c/semilla (FZ)', 'Frozen', 'Frozen',
  12, 2.8792, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '7b22cdd5-f2bc-59d8-8115-00bb2d7f7996', 219, '{219}', 'Mama Tere Pulpa Guayaba (FZ)', 'Frozen', 'Frozen',
  12, 1.9125, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'abede8ac-139b-5634-8c78-61153297710f', 220, '{220}', 'Mama Tere Pulpa Guanabana (FZ)', 'Frozen', 'Frozen',
  12, 3.2458, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '6c843fc7-fd32-58bc-845c-2b5a361502d2', 221, '{221}', 'Florida Tuna in vegetable Oil 3pk', 'Canned Goods', 'Canned Goods',
  16, 0, 4.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '4c25919d-c6dc-535b-8307-90f5b6bf7c77', 222, '{222}', '1/4 Legs Reg Medium HOR', 'Meat', 'Meat',
  1, 30.4, 51.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '47ab69c8-b0a2-5838-8523-cb7d9ab96776', 223, '{223}', 'Rib Belle Hat CH #1757', 'Pantry', 'Pantry',
  1, 48.82, 82.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd1aa9d2d-3c4f-5c8e-b100-eb2948c5601a', 224, '{224}', 'Mazita Cushion Hat c/v # 16', 'Meat', 'Meat',
  1, 36.81, 62.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '5103c64c-4e41-547c-9fc6-b47c5462d1a2', 225, '{225}', 'Chulera Ahumada Hat # 2301 Catchuts: 20.80', 'Meat', 'Meat',
  1, 76.75, 129.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '71a5d89a-42a9-5dd9-85cb-3b1449db4c6f', 226, '{226}', 'Universal Gelatina Fresa x 12', 'Desserts', 'Desserts',
  12, 1.375, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'b213382c-71bc-5570-9c79-0bb781cce052', 227, '{227}', 'Universal Gelatina Piña x 12', 'Desserts', 'Desserts',
  12, 1.375, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '34e0f3c1-b6e8-5229-bf54-f6a01e243f79', 228, '{228}', 'Colapiz Universal x 12', 'Desserts', 'Desserts',
  12, 1.5, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '0bb0cd7e-17cc-54d2-8d6a-1e546fb767a9', 229, '{229}', 'Sublime Chocolate x 24', 'Snacks', 'Snacks',
  24, 0.75, 0.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'f641f43c-2676-592b-aea0-4645a80b0d2a', 230, '{230}', 'Galleta Soda San Jorge Caja 7-pack x 4', 'Snacks', 'Snacks',
  4, 1.75, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '73de8e11-c72e-56af-a562-8251d2f0b62b', 231, '{231}', 'Galleta Soda San Jorge Gourmet Caja x 12', 'Snacks', 'Snacks',
  12, 1, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '9abe4ecd-9020-576e-a818-053b9d36b185', 232, '{232}', 'Sibarita Sazon 6 Pack 8.4 Gr x 50 Unidades', 'Spices & Condiments', 'Spices & Condiments',
  50, 1.3, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '623dcfd4-3ec3-5515-863b-ca4ba0d94b16', 233, '{233}', 'Vitalina Linaza 20 OZ x 12', 'Health', 'Health',
  12, 1.6667, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd11449bf-6358-53cd-a204-44ae841287bf', 234, '{234}', 'Vitalina Linaza Piña 20 OZ x 12', 'Health', 'Health',
  12, 1.6667, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '92018b7c-204c-5f9a-8b8b-06d326ae45aa', 235, '{235}', 'Chicha Limeña 20 OZ x 24', 'Beverages', 'Beverages',
  24, 1.5, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '8b18737f-f5e7-548c-8b4c-9a41753f9582', 236, '{236}', 'Guarana Backus 450 ML x 15', 'Beverages', 'Beverages',
  15, 1.1, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '0bf1d152-4c4e-5878-b89f-e3db5cc7cde4', 237, '{237}', 'Chicha Limeña 64 OZ x 8', 'Beverages', 'Beverages',
  8, 3, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '932bf859-d276-5270-bbf1-b9c4216bad9c', 238, '{238}', 'Vitalina Linaza 64OZ x 8', 'Health', 'Health',
  8, 3, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'b9018003-daf9-5058-925b-037c49cd5d5d', 239, '{239}', 'Kola Inglesa 2 Lt x 6', 'Beverages', 'Beverages',
  6, 2, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '68b05fcb-6727-586a-9137-808b7ec1ed3b', 240, '{240}', 'M9.5-CLOVES 12/3 OZ', 'Spices & Condiments', 'Spices & Condiments',
  12, 3.2433, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'afb808c7-1d42-5621-8bd8-3bab6e766d7f', 241, '{241}', 'M28-GROUND CINNAMON 6/12 OZ', 'Spices & Condiments', 'Spices & Condiments',
  6, 4.3333, 6.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '7b3d9ca9-dec0-5a63-876f-161b243ab02a', 242, '{242}', 'PEPITO CHILI GUAJILLO 12/3 OZ', 'Spices & Condiments', 'Spices & Condiments',
  12, 1.6667, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '555419d9-80a5-564b-9841-be8b073ab2f0', 243, '{243}', 'PEPITO CHILI ARBOL 12/3 OZ', 'Spices & Condiments', 'Spices & Condiments',
  12, 1.4233, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'f4f0d554-ebac-5643-9e57-cfbd8e583725', 244, '{244}', 'PEPITO CHILI GUAJILLO 12/8 OZ', 'Spices & Condiments', 'Spices & Condiments',
  12, 2.9183, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '5d90de4f-ca02-5a1d-8279-30fc7306aab4', 245, '{245}', 'PEPITO CORN HUSK 12/6 OZ', 'Canned Goods', 'Canned Goods',
  12, 4.8, 7.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'c9052e8f-9a4a-57e3-bab2-70c5ce47aa5c', 246, '{246}', 'PEPITO HIBISCUS FLOWER 12/3 OZ', 'Spices & Condiments', 'Spices & Condiments',
  12, 1.8333, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '6b203134-3c9f-54ee-873c-4c6222a40171', 247, '{247}', 'PEPITO CINNAMON STICKS MEXICAN 12/3 OZ', 'Spices & Condiments', 'Spices & Condiments',
  12, 3.2433, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '15d13608-1082-50d4-9690-12f844e0591c', 248, '{248}', 'PEPITO CLOVES WHOLE 12/5 OZ', 'Spices & Condiments', 'Spices & Condiments',
  12, 1.2933, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd9fd5b9e-2829-5c45-bdb4-3af78c2fc6e7', 249, '{249}', 'PEPITO CINNAMON STICK 12/75 OZ', 'Spices & Condiments', 'Spices & Condiments',
  12, 1.2933, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '0892e668-a9d4-5002-91d7-6e819701f175', 250, '{250}', 'PEPITO ALLSPICE WHOLE 12/1.25 OZ', 'Spices & Condiments', 'Spices & Condiments',
  12, 1.2933, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '3314dd0f-4a61-5d78-9fbc-e141dbfbe35b', 251, '{251}', 'PEPITO BLACK PEPPER GROUND 12/1.25 OZ', 'Spices & Condiments', 'Spices & Condiments',
  12, 1.2933, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '572cc34c-8853-5b4d-a836-3132a611f3ed', 252, '{252}', 'PEPITO BLACK PEPPER WHOLE 12/1.25 OZ', 'Spices & Condiments', 'Spices & Condiments',
  12, 1.1633, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '71d5cb67-5a32-5c05-92cd-3dab901259f4', 253, '{253}', 'PEPITO HOJA DE GUANABANA 12.5 OZ 70742590086', 'Pantry', 'Pantry',
  1, 19.7, 32.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'ffdc6757-ff76-5f0a-b64b-89cb1b47c1d1', 254, '{254}', 'PEPITO AVOCADO LEAVES 12/8 OZ', 'Pantry', 'Pantry',
  12, 1.6417, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '6f5d884c-2ae9-5779-be11-d59584a5fc8f', 255, '{255}', 'Azucar Domino (Blanca) 4lb 10/1', 'Pantry', 'Pantry',
  10, 4.182, 6.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '4cab3b5c-fc58-53d7-a217-2e5946e89d33', 256, '{256}', 'Baldom Ajo En Pasta 12/8oz', 'Spices & Condiments', 'Spices & Condiments',
  12, 2.7083, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '879f8086-8d45-5e19-b484-5e2ac283c8b6', 257, '{257}', 'Biokemical Artribion 20/4', 'Health', 'Health',
  20, 1.2475, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '14784aea-be1f-52cc-a637-8f4c294e3f6d', 258, '{258}', 'Cafe Bustelo Brick (Paq) 10oz 24/1', 'Beverages', 'Beverages',
  24, 6.2063, 10.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '000bf6e9-d1e4-5b0b-a948-95b4e76895ff', 259, '{259}', 'Cafe Santo Domingo 10oz (Lata) 12/1', 'Beverages', 'Beverages',
  12, 8.75, 14.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '75961928-6189-5267-8947-ee9a89c2dacb', 260, '{260}', 'Campesino Salami Short 16oz 20/1', 'Meat', 'Meat',
  20, 3.675, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '68b012c2-9546-511b-8f47-79d9fd1449b6', 261, '{261}', 'Carnation Evapov Milk 24/12oz', 'Dairy', 'Dairy',
  24, 1.5625, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '0c492b8b-2bba-53c9-b624-447723bc6878', 262, '{262}', 'Casabe Mechi 10/1', 'Snacks', 'Snacks',
  10, 2.35, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'a644feeb-dcc2-5b52-a6fd-fefb7bdfbd01', 263, '{263}', 'Casabe Soy Dominicano 10/10oz', 'Snacks', 'Snacks',
  10, 2.55, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'be50cf8b-dbbe-5b04-8291-d7eec5270cda', 264, '{264}', 'Choco Rica Gd 12/1lt (32oz)', 'Beverages', 'Beverages',
  12, 3.4583, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '7a54cb7e-c5ff-5858-a77c-62d7df1e610f', 265, '{265}', 'Chocolate Embajador 36/1', 'Snacks', 'Snacks',
  36, 2.3472, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '8e6d9d6d-0b05-539b-a8d3-ec35566d02b6', 266, '{266}', 'Country Club Merengue 2lt 8/1', 'Beverages', 'Beverages',
  8, 2.0938, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '17f75a79-4056-5583-a2f2-726fbec4ea4e', 267, '{267}', 'Country Club Uva 12oz 24/1', 'Beverages', 'Beverages',
  24, 0.9792, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '6d60d874-c242-5037-9e6e-9988aa3eedde', 268, '{268}', 'Domino Blanco', 'Pantry', 'Pantry',
  1, 4.75, 7.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'fdd64aef-f48c-58cc-8103-6a1f6031af4c', 269, '{269}', 'Estelar Salami Super Especial 2lb 12/1', 'Meat', 'Meat',
  12, 10.3333, 17.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'dfa2b2e4-854a-52d6-9847-a4687bfb6077', 270, '{270}', 'Galletas Dino Chocolate 18/1', 'Snacks', 'Snacks',
  18, 2.875, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '9b664950-7aff-50fb-8d87-4653878ce7ff', 271, '{271}', 'Galletas La Paloma 16/1loz', 'Snacks', 'Snacks',
  16, 2.9969, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '7f7076bd-5efb-5cae-a91c-197dbb9616ed', 272, '{272}', 'Guarina Wafer Fresa 21/1', 'Snacks', 'Snacks',
  21, 1.9524, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '9ddf4e1f-d7b2-5422-b637-994130e45886', 273, '{273}', 'Kika Crackers (Galleta) 16/1loz', 'Snacks', 'Snacks',
  16, 2.9969, 4.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd44074af-1e6a-5e2d-b0b7-050eff753337', 274, '{274}', 'La Constanzera Azucar Brown 2lb 12/1', 'Pantry', 'Pantry',
  12, 2.5417, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '63beefbc-e636-598b-a536-14608d56cd87', 275, '{275}', 'Maizena Fecula De Maiz 24/14oz', 'Pantry', 'Pantry',
  24, 2.4271, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'ae17ad1a-b175-5d5a-abd1-5d040da839f4', 276, '{276}', 'Mango Best (Gd) 946ml 6/1', 'Beverages', 'Beverages',
  6, 3.325, 5.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '572fb39f-9d4a-5ab5-8d14-7277feb55e97', 277, '{277}', 'Mango Best (Peq) 246ml 24/1', 'Beverages', 'Beverages',
  24, 1.0208, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '77489baf-b489-5e98-90fc-c10edf48e72b', 278, '{278}', 'Mini Pan Original 12/1', 'Snacks', 'Snacks',
  12, 1.9083, 2.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'b411bccf-35fc-5cdb-9030-fd53208d1a49', 279, '{279}', 'Pasta de Tomate Victorina 29oz', 'Spices & Condiments', 'Spices & Condiments',
  1, 31.25, 52.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'c06d2209-d024-5002-bdb5-c06cfc0b6446', 280, '{280}', 'Pringles Original (Gd) 5.5oz 14/1', 'Snacks', 'Snacks',
  14, 2.1429, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'bc5cd74f-da43-5125-98ab-fcd7a9443dfb', 281, '{281}', 'Pringles Original 2.5oz (Med) 12/1', 'Snacks', 'Snacks',
  12, 1.2458, 1.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'f1ce315e-8fc3-56e8-81e9-0e2ecde3b1b8', 282, '{282}', 'PERDIGON OLIVES 20 OZ', 'Spices & Condiments', 'Spices & Condiments',
  1, 41.95, 70.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'c547933a-a38f-5cc1-9aea-b8f857fa0c4f', 283, '{283}', 'STUFF MANZANILLA OLIVES', 'Spices & Condiments', 'Spices & Condiments',
  1, 37.5, 63.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '5f5ff930-8072-567b-90e5-89845e7f292b', 284, '{284}', 'GREEN PIGEON PEAS 15 OZ', 'Canned Goods', 'Canned Goods',
  1, 33.95, 57.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '62da758a-8218-57da-addc-77da82110fb6', 285, '{285}', 'GREEN PIGEON PEAS 29 OZ', 'Canned Goods', 'Canned Goods',
  1, 33.45, 56.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '33a77dfa-b1ba-57b7-8405-31259733b949', 286, '{286}', 'SOFRITO 12 OZ', 'Spices & Condiments', 'Spices & Condiments',
  1, 47.95, 81.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'e93d626f-706f-56f8-9eed-e99724a071f4', 287, '{287}', 'SOFRITO 6 OZ', 'Spices & Condiments', 'Spices & Condiments',
  1, 32.95, 55.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd5b3b4d2-55bc-5233-956e-709c294746be', 288, '{288}', 'CANNED BLACK BEANS 46 OZ', 'Canned Goods', 'Canned Goods',
  1, 35.5, 59.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '7b7287e2-671f-55c3-9fbd-83350e9dbc61', 289, '{289}', 'ROMAN BEANS 46 OZ', 'Canned Goods', 'Canned Goods',
  1, 35.5, 59.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'f0fb5fca-1ce9-5fd1-8728-4b879495f75d', 290, '{290}', 'DARK RED KIDNEY BEANS 12', 'Canned Goods', 'Canned Goods',
  1, 26.25, 44.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '53f21750-84bf-510d-b8b2-d08732518abf', 291, '{291}', 'SMALL RED BEANS 5.5 OZ', 'Canned Goods', 'Canned Goods',
  1, 26.75, 44.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'b5e394a4-c8a9-5afe-a82a-c57dbc94a9e9', 292, '{292}', 'SMALL WHITE BEANS 29 OZ', 'Canned Goods', 'Canned Goods',
  1, 26.25, 44.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd10b9d69-0907-5643-9368-cd0c039b409a', 293, '{293}', 'GOYA LENTIL BEANS 15.5 O', 'Canned Goods', 'Canned Goods',
  1, 26.75, 44.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '4f11f46c-6f5d-5a4f-852b-3cf27a18c9ea', 294, '{294}', 'BLACK BEANS 29 OZ (1 LB', 'Canned Goods', 'Canned Goods',
  1, 26.25, 44.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '75e367ac-3270-54df-ac0a-bb0201b42851', 295, '{295}', 'BLACK BEANS 10.5. OZ', 'Canned Goods', 'Canned Goods',
  1, 24.95, 41.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd4f421dc-238a-5a23-9d09-5fdd6dc2c5e0', 296, '{296}', 'SMALL RED BEANS 1 LB', 'Canned Goods', 'Canned Goods',
  1, 33.95, 57.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '2c8d2045-78bb-504c-b7f4-8946c372c967', 297, '{297}', 'FRIJOL DE SEDA 1 LE', 'Canned Goods', 'Canned Goods',
  1, 53.95, 91.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '1a2d2a5e-b3be-5679-a9f6-6a7e60d5784f', 298, '{298}', 'CENTRAL AMERICAN RED BEA', 'Pantry', 'Pantry',
  1, 53.5, 90.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '53ff9590-2214-5adc-9882-f825e4a14bce', 299, '{299}', 'WHOLE KERNEL CORN 15.25', 'Canned Goods', 'Canned Goods',
  1, 27.5, 46.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'f412eeb3-f727-5cc9-9577-44a9af6a12f9', 300, '{300}', 'SLICED BEETS 15.OZ', 'Canned Goods', 'Canned Goods',
  1, 29.5, 49.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '1bbfafe9-0487-59e9-b1b9-af8e2bc10a33', 301, '{301}', 'SLICED CARROTS 14.5 OZ', 'Canned Goods', 'Canned Goods',
  1, 29.5, 49.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '1e835df2-de3c-5d96-8546-04a7c4911253', 302, '{302}', 'GOYA JASMINE RICE 20 LB', 'Pantry', 'Pantry',
  1, 47.95, 81.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '4502fbac-c0fe-5e34-83a1-c8ec188c75af', 303, '{303}', 'JASMINE RICE 10 LB', 'Pantry', 'Pantry',
  1, 58.95, 99.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '0c9d40b4-6730-5a59-90c5-81c799f33dff', 304, '{304}', 'CANILLA LONG GRAIN RICE', 'Pantry', 'Pantry',
  1, 22.95, 38.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '96c7ee4f-b13c-5e53-a549-4a4959d73a9f', 305, '{305}', 'CANILLA LONG GRAIN RICE', 'Pantry', 'Pantry',
  1, 40.35, 68.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '14c62dd9-27f0-5c68-962b-f3a42323ca6d', 306, '{306}', 'GUANABANA NECTAR', 'Beverages', 'Beverages',
  1, 32.95, 55.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'b5fd6272-d9fb-5c77-9683-b0c4851d4edb', 307, '{307}', 'LIME JUICE 12/32 FL. OZ.', 'Beverages', 'Beverages',
  12, 2.625, 3.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '87b1d4e9-fae3-58a8-b6f4-77b08b0a3357', 308, '{308}', 'OVAL SARDINE TMTO SAUCE', 'Canned Goods', 'Canned Goods',
  1, 47.95, 81.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '5787a0fb-b61b-55f7-908f-25a316fc2d98', 309, '{309}', 'BARDINE INTO HOT-TINAPA', 'Pantry', 'Pantry',
  1, 35.95, 60.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '43ff9633-301e-55d7-ba46-a1be3dc3b8b7', 310, '{310}', 'SAZON CENTRO/ACHTE JUMB', 'Spices & Condiments', 'Spices & Condiments',
  1, 60.8, 102.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '9d5916f9-4ffb-51e6-9969-2c3c770ee93a', 311, '{311}', 'SAZON CENTRO / ACHTE', 'Spices & Condiments', 'Spices & Condiments',
  1, 44.55, 75.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '64ff620e-3f14-5820-80b8-d2328491efca', 312, '{312}', 'COYA ADOBO CON P-IMIENTA', 'Pantry', 'Pantry',
  1, 66.5, 112.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'b410f5ae-2d43-56ee-b4b8-1b00e32d15e6', 313, '{313}', 'GOYA MONO-BOW 20/7 OZ', 'Pantry', 'Pantry',
  20, 0.5975, 0.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '662c1275-8eaf-5668-a2a4-00e2851c00e2', 314, '{314}', 'GOYA SODA CRACKERS 24 0', 'Snacks', 'Snacks',
  1, 37.95, 64.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '6b8e525c-76f0-50ee-897c-b5723461b97b', 315, '{315}', 'RIGATONI 16 OZ', 'Pantry', 'Pantry',
  1, 29.5, 49.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '0010a701-bf06-531e-8b67-1d38778b2538', 316, '{316}', 'ELBOWS 16 07', 'Pantry', 'Pantry',
  1, 29.5, 49.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '8d1935d3-1fde-5b6c-a14e-896248a5b061', 317, '{317}', 'FIDELINT 12 DZ', 'Pantry', 'Pantry',
  1, 24.85, 41.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '37b66b68-9ea5-5717-aba9-2b984aa36c67', 318, '{318}', 'CABELLO DE ANGEL 12 OZ', 'Pantry', 'Pantry',
  1, 24.35, 40.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd6ea0b0b-8145-5a3e-a4fa-9ecd9326e6a7', 319, '{319}', 'MARIA J PACK (FLOW PACK)', 'Pantry', 'Pantry',
  1, 25.75, 43.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '5b2f7e32-fee0-524b-91cc-ebb35f624962', 320, '{320}', 'LADY FINGERS 701', 'Pantry', 'Pantry',
  1, 18.95, 31.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '38fdf5bc-5182-5bd8-95c7-82df70c9dbbb', 321, '{321}', 'NESTLE MEDIA CREMA 7.6 0', 'Dairy', 'Dairy',
  1, 81.5, 138.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd9e44836-5db7-5e1e-9ff5-713168e2b97c', 322, '{322}', 'NIDO POWDERED MICK 12 69', 'Dairy', 'Dairy',
  1, 51.95, 87.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '191e1289-5ee2-5906-a574-136d7935d5ea', 323, '{323}', 'NIDO 1+KINDER CRECIMIENT', 'Dairy', 'Dairy',
  1, 54.5, 92.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '68e6a0d1-05ac-5bc6-ad66-fc14be4f41e3', 324, '{324}', 'NESTUM WHEAT AND RUIT', 'Dairy', 'Dairy',
  1, 74.5, 126.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '18b484e5-054b-5d7b-98d0-158886f38bf5', 325, '{325}', 'SUYA DORADAS CRACKERS 10', 'Snacks', 'Snacks',
  1, 19.25, 32.99, false, true, 'Flagged in the Pricing Hub for owner review', 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '9aef2b08-b746-5b71-a22f-2544c964b132', 326, '{326}', 'MORADO 6* 54 ONZ', 'Pantry', 'Pantry',
  1, 52, 87.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '15d21fae-a067-56a2-83dc-11cf4f007a72', 327, '{327}', 'MAIZ CHULPE - CHULPE CORN 6 X 54 OZ', 'Pantry', 'Pantry',
  1, 45.97, 77.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '1ec64899-e05e-5995-b582-1940c4361828', 328, '{328}', 'BLACK OLIVES IN BRINES (12*20 OZ)', 'Spices & Condiments', 'Spices & Condiments',
  1, 55, 93.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '1c8a4344-0df9-5554-acca-71966d0675de', 329, '{329}', 'PERU FOOD PEACH IN HALVES 12*29.10 OZ', 'Canned Goods', 'Canned Goods',
  1, 30.68, 51.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'bb903095-3ffa-5fa9-8bdb-8e4f96f39c37', 330, '{330}', 'PERU FOO MAIZ CANCHA CARGUAY (24X150Z)', 'Pantry', 'Pantry',
  1, 38.78, 65.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '49422f62-bc7e-50a2-b4d9-71af5dcd7f63', 331, '{331}', 'PERU TRIGO PELADO-PEELED WHEAT (24*15 OZ)', 'Pantry', 'Pantry',
  1, 36.73, 61.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '0debec5b-3eb7-54b4-b10f-40c5425e2e53', 332, '{332}', 'PERU SEMOLA - SEMOLIN 24*15 OZ', 'Pantry', 'Pantry',
  1, 36.93, 62.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'e9ca588c-aefe-5b59-a90f-60991826c926', 333, '{333}', 'PERU FIDEO CHINO - CHINESE NOODLES (30*8.8 OZ)', 'Pantry', 'Pantry',
  1, 39.99, 67.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '3dcbc2fb-45f9-54f3-af8b-4e3cc2614d70', 334, '{334}', 'GLORIA EVAPORATED MILK (24*12FL OZ)', 'Dairy', 'Dairy',
  1, 30, 50.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'b739c94e-c9cf-5027-92ed-c3db8355430a', 335, '{335}', 'FRESA GELATINA - STRAWBERRY JELLY (12*5.30Z)', 'Desserts', 'Desserts',
  1, 20.27, 33.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '95192971-51b9-5f76-ad4a-678e4d59d0b3', 336, '{336}', 'PERU FOOD GROUND BLACK PEPPER // PIMIENTA (24*1.5', 'Spices & Condiments', 'Spices & Condiments',
  1, 39.73, 67.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '8b0ce425-5350-5da9-b5c0-05e3053a003a', 337, '{337}', 'PERU SIYAU KIKKO-SOY SAUCE 30*500 ML', 'Spices & Condiments', 'Spices & Condiments',
  1, 34.68, 58.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '31d3ae2c-16ea-556d-b49a-724663843512', 338, '{338}', 'PERU FOOD CANELA Y CLAVO (24*1.15 OZ)', 'Spices & Condiments', 'Spices & Condiments',
  1, 25.49, 42.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '215fca5f-85a7-597c-b69c-500c4ca56ece', 339, '{339}', 'ROCOTO PASTA-RED HOT PEPPER PASTE (12*15.00 OZ)', 'Spices & Condiments', 'Spices & Condiments',
  1, 35.53, 59.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '74b6758f-7d17-5d98-8001-d562dc019282', 340, '{340}', 'MILD PANCA PEPPER // AJI PANCA POCO PIQUE 12*15 OZ', 'Snacks', 'Snacks',
  1, 38.07, 64.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'cd79d9cd-e11c-5606-b8fd-17bf1d994082', 341, '{341}', 'INCA''S FOOD Haba Frita 24x4oz (113g) - Salty Fried Fava Beans', 'Canned Goods', 'Canned Goods',
  1, 32.4, 54.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'd2354633-b319-5d08-ad68-b3aa83055d4f', 342, '{342}', 'INCA''S FOOD Aji Panca Especial Pasta 24x7.5oz (212.6g) - Panca Pepper Paste NOT SPICY', 'Snacks', 'Snacks',
  1, 44.4, 74.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'f6dbaad2-c330-53e5-9d16-a58654d0544a', 343, '{343}', 'INCA''S FOOD Aji Panca Especial Pasta Etiqueta Negra 12x15oz (425g) - Panca Pepper Paste Special Black Label', 'Snacks', 'Snacks',
  1, 35.88, 60.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '7bdf7d9f-5241-584f-a0a3-d0975986729b', 344, '{344}', 'INCA''S FOOD Aji Amarillo Especial Pasta Etiqueta Negra 12x15oz (425g) - Yellow Hot Pepper Paste Special Black Label', 'Spices & Condiments', 'Spices & Condiments',
  1, 51.48, 87.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'a00a0d6a-85a3-5352-bc1f-305d35922528', 345, '{345}', 'INCA''S FOOD Aderezo Adobo de Cerdo Etiqueta Negra 12x15oz (425g) - Pork Adobo Marinade', 'Spices & Condiments', 'Spices & Condiments',
  1, 39.48, 66.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '9fcd8187-125a-5678-a843-7d28a8e612bb', 346, '{346}', 'INCA''S FOOD Ajo Pasta Familiar 12x15.7oz (445g) - Garlic Paste Family Size', 'Spices & Condiments', 'Spices & Condiments',
  1, 53.88, 91.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'f354b7df-587d-527b-b867-089afa88efad', 347, '{347}', 'INCA''S FOOD Olluco Picado Lata 12x20oz (567g) - Sliced Ollucus (Melloco) Can', 'Pantry', 'Pantry',
  1, 39, 65.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '4283c97d-7510-5e56-9b23-80dc0c5a986c', 348, '{348}', 'INCA''S FOOD Ajo Pasta 24x7.5oz (212.6g) - Garlic Paste', 'Spices & Condiments', 'Spices & Condiments',
  1, 58.8, 99.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '181347c4-597b-5eac-b5ac-ed2d28e83141', 349, '{349}', 'VICTORIA Galleta Casino Menta 8xPack6x1.52oz (258g) - Mint Cookies', 'Snacks', 'Snacks',
  1, 11.92, 19.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '722be82c-2ab1-5870-bb32-c46a5a6175e1', 350, '{350}', 'VICTORIA Galleta Casino Lucuma 8xPack6x1.52oz (258g) - Lucuma Cookies', 'Snacks', 'Snacks',
  1, 11.92, 19.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '7f791a30-0bf2-5556-9600-caa29c0d579b', 351, '{351}', 'GN Galleta Rellenita Chocolate 5xPack8x1.27oz (288g) - Chocolate Sandwich Cookies', 'Snacks', 'Snacks',
  1, 7.95, 13.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '49f76ecb-bf37-58f0-9d09-319eb6ab7454', 352, '{352}', 'GN Galleta Rellenita Coco 5xPack8x1.27oz (288g) - Coconut Sandwich Cookies', 'Snacks', 'Snacks',
  1, 7.95, 13.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'b7dd88ff-8429-5ebe-a847-ee91a7e781be', 353, '{353}', 'INCA''S FOOD Trigo Resbalado 24x15oz (425g) - Hulled Wheat', 'Pantry', 'Pantry',
  1, 39.6, 66.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'a2157e09-b9e5-588b-9d8c-27969615ccaf', 354, '{354}', 'INCA''S FOOD Harina de Chuno 12x12oz (340g) - Chuno Flour', 'Pantry', 'Pantry',
  1, 20.28, 33.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '4b3c86da-bbeb-5dce-a0fb-541f0eea257c', 355, '{355}', 'INCA''S FOOD Trigo Pelado 24x15oz (425g) - Dried Hulled Wheat', 'Pantry', 'Pantry',
  1, 42, 70.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  '2fdc0638-165e-537a-9991-f3a4b4a96757', 356, '{356}', 'INCA''S FOOD Maiz Morado Familiar 8x3lb (1.36kg) - Dried Purple Corn Family Size', 'Pantry', 'Pantry',
  1, 54.32, 91.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'c63e8484-06ba-59d4-b6d7-326662dcef31', 357, '{357}', 'INCA''S FOOD Bebida Chia Maracuya 12x16fl oz (473mL) - Chia Passion Fruit Drink', 'Beverages', 'Beverages',
  1, 19.08, 31.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();
insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (
  'a48027d6-3620-580e-99d3-3e8ab252bafe', 358, '{358}', 'INCA''S FOOD Bebida Chicha de Jora 12x16fl oz (473mL) - Corn Jora Drink', 'Beverages', 'Beverages',
  1, 16.2, 27.99, false, false, null, 'hub-backfill')
  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,
    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,
    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,
    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();

-- ── Invoices (backfilled: shelved before the approval flow existed) ────────
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 'dd3f1cde-3172-5f32-b08a-be12822e2214', '65990', '2026-06-20', '#65990 — 6/20/26',
  '5207a187a9d5836cac3622c88b887f0efeec1485010c9db8a765aa6d0e17ecf2', 533, 533, 0, 17, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 'dd3f1cde-3172-5f32-b08a-be12822e2214', '65991', '2026-06-22', '#65991 — 6/22/26',
  '774cc07f3fe3740114b1027fd96eb11cbacf8f3f8c699da5828c87f7564f0770', 653, 653, 0, 17, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '76390b5d-10f2-55a7-8961-ea8ce3077f96', 'dd3f1cde-3172-5f32-b08a-be12822e2214', '65992', '2026-06-22', '#65992 — 6/22/26',
  '2d773f9182c4608ff4ccdaa20fc2c5c2e9ba39fda28e3b44f1e034249923e572', 61, 61, 0, 2, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '1f76c232-7f7b-532b-abc3-18d4be40509a', 'dd5b1cc6-d772-5252-830c-92f50bee9d80', 'INVE0023460478', '2026-08-13', '#INVE0023460478 — 8/13/26',
  '0328959b1dc4db9b97e66987184aee5deedd921c4a3a9145aa4ee12697265607', 234.42, 234.42, 0, 12, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '56af8b83-e7b5-5383-9d19-ef5f6c39d768', 'f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '90747231', '2026-06-24', '#90747231 — 6/24/26 (Parada 23)',
  '6f04a26a3e588f02ba4bce33a66e8b5c0dc77c98709b70041e0aefcdc2a40ed4', 430.8, 430.8, 0, 10, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 'f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '90747476', '2026-06-24', '#90747476 — 6/24/26 (Parada 22)',
  '7c2ae00f7494380f5ba66dfc936370ed77d0b7a4a367c00c90bb0c6e84248af0', 2833.5, 2833.5, 0, 47, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '67f3b947-c61e-5cda-9488-3b428689c456', 'f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '90772312', '2026-08-19', '#90772312 — 8/19/26',
  '8c8c9c0daf5e0760baa5b9e65a59ee493f90e975e378308d0db0f3bdfad36ac1', 0, 0, 0, 1, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 'f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '90772340', '2026-08-19', '#90772340 — 8/19/26',
  'f2aa88a5b3013aaced76fe3fc5258c5a34e7f2e53b441b03b56da60d4b5252e3', 2162.69, 2162.69, 0, 40, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '31e76f2f-1e8c-5b62-8947-7345565c5a2b', 'f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '90772444', '2026-08-19', '#90772444 — 8/19/26',
  'faf30cfe2a0a9712efc2018f927b5a6b9ba5076f8b496225e33bb837791b6413', 432.25, 432.25, 0, 11, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  'e37e15ff-9e21-5386-81ab-78ce7049a883', '425ae6ef-c0a2-5cd1-8c9d-015d0fe1c0d8', '1671390', '2026-08-06', '#1671390 — 8/6/26',
  'd00d06012907a04be6762104e1253e230c491da9f7ed7cb90a81e39d9021f9a8', 192.78, 192.78, 0, 4, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', '37e98e34-07ef-516b-8dd0-a690e31ee273', '012830', '2026-08-06', '#012830 — 8/6/26',
  '600fe4365a9127bf29bbb6eec741df5ab3e526a72d387898517186a6106bf02a', 559.5, 559.5, 0, 14, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', '2cafc16d-35bc-54fa-887c-d96533e3e69d', '3057:5', '2026-08-06', '#3057:5 — 8/6/26',
  '5731bab4352a39618e32cac40b43e9336f785c9ecb520871984fdc05bcfba980', 396.98, 396.98, 0, 15, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', '697f1361-f4e3-57ec-b3c5-3395a73dc837', '27810', '2026-08-06', '#27810 — 8/6/26',
  '3f355592a748b86b106d233174c739932ae399c4dc067cd32a6e9a5addd470aa', 1392.76, 1392.76, 0, 27, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', '61e73f53-6061-5517-95e1-38f77d2f3921', '27727700', '2026-08-05', '#27727700 — 8/5/26',
  '1507c910a3c44650fcfa243fd061a4a4cd4bf4308423a6028f28623db82cbc1f', 1694.25, 1694.25, 0, 44, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 'a2db4e29-8e2b-5585-b43a-788792e025a6', '0271478-00', '2026-08-04', '#0271478-00 — 8/4/26',
  '03ae3e3a9d7983174a81d0165aad6da692a50aba993ea44b972aa910f0f1df95', 679.85, 679.85, 0, 15, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', '3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'INVNJ23126', '2026-08-04', '#INVNJ23126 — 8/4/26',
  '9d3b7d1176add771c8fef94d2fd2a36251c56d07f0b0622a0e1b94ba3b5e5211', 567.16, 567.16, 0, 16, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;
insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (
  '08ed68c6-f28a-5c00-9884-57d6fb0f71fd', '3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'INVNJ23127', '2026-08-04', '#INVNJ23127 — 8/4/26',
  '04f8c44ac98c67e76c5038fb5dcbd12d7a694cdc866204619b81cdfbc956a966', 35.28, 35.28, 0, 2, 'backfilled')
  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,
    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,
    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;

-- ── Vendor SKU links (item numbers printed on the invoice) ─────────────────
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '00038000845635', 'bc5cd74f-da43-5125-98ab-fcd7a9443dfb', 12, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '00050000015016', '68b012c2-9546-511b-8f47-79d9fd1449b6', 24, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '0021882002890', '9b664950-7aff-50fb-8d87-4653878ce7ff', 16, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '01034745571226', '6f5d884c-2ae9-5779-be11-d59584a5fc8f', 10, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '021882002722', '9ddf4e1f-d7b2-5422-b637-994130e45886', 16, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '051202008295', '17f75a79-4056-5583-a2f2-726fbec4ea4e', 24, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '051228637769', '7f7076bd-5efb-5cae-a91c-197dbb9616ed', 21, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '072728002062', 'b411bccf-35fc-5cdb-9030-fd53208d1a49', 1, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '074471017201', '14784aea-be1f-52cc-a637-8f4c294e3f6d', 24, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '07713', 'e505774e-01bb-5dcb-a270-d9eb4fe4530d', 8, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '07720', 'c6b02f9f-75ad-52b1-aab6-d28b3f21946c', 8, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '0786119000680', '75961928-6189-5267-8947-ee9a89c2dacb', 20, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '0787545052823', '4cab3b5c-fc58-53d7-a217-2e5946e89d33', 12, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '0790330061023', 'be50cf8b-dbbe-5b04-8291-d7eec5270cda', 12, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '0858037006034', 'd44074af-1e6a-5e2d-b0b7-050eff753337', 12, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '089087671525', '8e6d9d6d-0b05-539b-a8d3-ec35566d02b6', 8, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '0895605601116', 'fdd64aef-f48c-58cc-8103-6a1f6031af4c', 12, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '10030600229961', 'c06d2209-d024-5002-bdb5-c06cfc0b6446', 14, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1021', '48347134-3837-5dc3-b193-ac3be0fe0758', 2, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1023', 'e57872a3-cd65-5994-8221-4dc5d525d8a9', 8, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1024', 'c2e94303-b80b-5ca8-a126-d5526d704604', 20, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '104800171127', '63beefbc-e636-598b-a536-14608d56cd87', 24, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1051', '1a697e67-b896-5254-a1e5-002590d0c25e', 12, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '10748325000561', '000bf6e9-d1e4-5b0b-a948-95b4e76895ff', 12, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '10753079000422', 'dfa2b2e4-854a-52d6-9847-a4687bfb6077', 18, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1101', 'b6188181-497d-5b86-913d-2d17898d01b2', 48, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1105', 'ad5b8cc0-4bce-5687-a7c4-540aa6b8caad', 24, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1106', '5a99119b-c122-5b15-aa82-4d302cbd280c', 48, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1116', 'e898fc13-9a3b-5982-8187-16d8bcbd7a63', 20, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1117', '65329392-a5ce-5c83-9ff5-f804f804b427', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1119', '23088c33-4862-5de8-afbe-75071c87bff9', 48, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1120', '941eabc2-9a01-518c-b1c2-92586a8a584d', 48, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1129', 'bba755be-b7b2-55f0-8015-beae919c885c', 24, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1155', '6c843fc7-fd32-58bc-845c-2b5a361502d2', 16, '90772312')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1231', '03327e4e-fa1f-5c09-a413-e57ef6bce980', 4, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '1312', 'f1ce315e-8fc3-56e8-81e9-0e2ecde3b1b8', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '1331', 'c547933a-a38f-5cc1-9aea-b8f857fa0c4f', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1447', '00de6ab7-295b-51b4-82cc-e710527357be', 20, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1500', '6666a7e8-c1e7-5137-8cb0-aabd30f5fa10', 12, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1531', '65826603-c87e-5e4a-92da-7d5c51c3099f', 24, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1705', '88b496bc-9145-5dc8-bc1d-e9ab0defe5ca', 12, '90772444')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1708', '514ea94e-7033-5a35-b7e9-f43e076d96a9', 6, '90772444')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1741', '4e9016e3-6e70-5349-80d8-fb2dd2e44d88', 10, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1826', 'b3ca16fb-3dc3-5a27-a322-0e86a6e4d1e5', 24, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '200', 'b410f5ae-2d43-56ee-b4b8-1b00e32d15e6', 20, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2001', 'db95e767-00fb-597b-8d69-6c7a672090a0', 6, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2001', '5f5ff930-8072-567b-90e5-89845e7f292b', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2002', '5c7e180b-c2d2-5a1e-8a3f-cbf047d67475', 6, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2003', '62da758a-8218-57da-addc-77da82110fb6', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2098', 'e73dccf9-b4de-5053-bc83-301920b3662a', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2099', '7c4aa759-9f54-5fb7-8283-446155f8fc98', 16, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2142', '69e5b567-4dfc-5987-9188-47bae1775a6d', 12, '90747231')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2146', '33a77dfa-b1ba-57b7-8405-31259733b949', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2148', 'e93d626f-706f-56f8-9eed-e99724a071f4', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2202', '9bcc8488-d395-594c-aee9-a8c7a09b1ae2', 12, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2203', '6c82064f-4fb3-5462-aaf6-6b458f30ea28', 6, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2213', '36aea547-969e-56dd-add2-103d61130078', 24, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2214', '8019dab1-6a54-5276-a351-f38715573057', 24, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2217', 'd879eee2-dfc1-5d9e-aed6-545259d7141a', 8, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2218', '405cf37e-23d7-56e7-9f93-3b4fa10afc1c', 8, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2280', '0ad4bb76-c757-5405-b431-e24eacd1a943', 24, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2353', 'd5b3b4d2-55bc-5233-956e-709c294746be', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2390', '7b7287e2-671f-55c3-9fbd-83350e9dbc61', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2407', '3fb0eb0c-48e5-5db4-b01a-6c55282338dd', 24, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2410', 'f0fb5fca-1ce9-5fd1-8728-4b879495f75d', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2420', '53f21750-84bf-510d-b8b2-d08732518abf', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2452', 'b5e394a4-c8a9-5afe-a82a-c57dbc94a9e9', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2456', 'd10b9d69-0907-5643-9368-cd0c039b409a', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2465', '4f11f46c-6f5d-5a4f-852b-3cf27a18c9ea', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('dd5b1cc6-d772-5252-830c-92f50bee9d80', '2468200902', '98d81666-ab28-541d-8470-c8f897b62ac6', 3, 'INVE0023460478')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('dd5b1cc6-d772-5252-830c-92f50bee9d80', '2468200903', '233f20c3-5299-5994-9614-db425b7b0d1d', 3, 'INVE0023460478')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('dd5b1cc6-d772-5252-830c-92f50bee9d80', '2468231261', 'e5da914f-8a6e-5e9f-a65b-63c3d9249fad', 12, 'INVE0023460478')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('dd5b1cc6-d772-5252-830c-92f50bee9d80', '2468231334', '269ec070-0f89-5209-b945-4cd5a224dff4', 12, 'INVE0023460478')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('dd5b1cc6-d772-5252-830c-92f50bee9d80', '2468231352', '1307c72d-c8c8-5dc7-93ca-627f0405bfb0', 48, 'INVE0023460478')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2469', '75e367ac-3270-54df-ac0a-bb0201b42851', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2486', 'd4f421dc-238a-5a23-9d09-5fdd6dc2c5e0', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2503', '2c8d2045-78bb-504c-b7f4-8946c372c967', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2505', 'c658e5ae-58b0-5810-8822-f8b083474f8a', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2517', '1a2d2a5e-b3be-5679-a9f6-6a7e60d5784f', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2556', '53ff9590-2214-5adc-9882-f825e4a14bce', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2559', 'a9fdc3a3-f0cf-5fcc-8a35-3ea828d3d7de', 12, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2569', 'f412eeb3-f727-5cc9-9577-44a9af6a12f9', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2573', '1bbfafe9-0487-59e9-b1b9-af8e2bc10a33', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2617', '1e835df2-de3c-5d96-8546-04a7c4911253', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2619', '4502fbac-c0fe-5e34-83a1-c8ec188c75af', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2626', '26459064-7905-5ce9-92e2-7c41381cdeae', 24, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2634', '0c9d40b4-6730-5a59-90c5-81c799f33dff', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2637', '96c7ee4f-b13c-5e53-a549-4a4959d73a9f', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2675', '4687ac44-45a1-5151-a3e9-d28932f4c30b', 12, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2696', 'a38fa797-c36a-53d4-951b-136d7be43972', 4, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2698', '89c7f971-ba17-5fb5-b88e-d451db0f06c3', 8, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2699', 'a40a83a3-960a-5a15-9d7f-d7fedfdec71e', 30, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2752', '1bf68753-6af3-526f-bfb5-744c0c5098f3', 6, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2754', 'a0ebea73-d778-578e-918e-2b15fbeab0f4', 6, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2759', '108072e2-b4c5-5933-8a8b-8cf8c4b065c8', 6, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2762', 'd3d6607a-3c7d-594d-8b4c-7ac4265bd939', 6, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2764', '5fca1ad1-5a73-5b75-a968-6d5e1c21e491', 6, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '2824', '14c62dd9-27f0-5c68-962b-f3a42323ca6d', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2863', '7aabe60f-dfb9-5afb-b09d-d7fc179ea270', 24, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2902', '71cf2af5-81fc-5724-9cfb-ef223d32fcd0', 12, '90772444')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2905', 'b86fba65-8c49-51cd-acc2-780564dab7e6', 20, '90747231')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2906', '8e311a14-9d27-57a8-a4fe-b5fed4e32811', 12, '90772444')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2926', '55d40674-30f1-5c49-b454-6c6ec153a062', 8, '90772444')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2929', '65cc9bbb-8700-5638-845b-d9ebefb9b5f1', 6, '90772444')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2933', '70597fde-fe6d-5062-9ae1-f5052b97962f', 12, '90747231')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2935', 'a52638a3-e3bc-526f-9a99-ca4e906cfa0b', 12, '90747231')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2936', 'abede8ac-139b-5634-8c78-61153297710f', 12, '90772444')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2937', '7b22cdd5-f2bc-59d8-8115-00bb2d7f7996', 12, '90772444')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2938', 'cd385816-fdcc-5ca3-ba68-425f9908d1db', 12, '90747231')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2948', '257b7fc3-f87b-569c-9d64-3a471ff16ced', 6, '90772444')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2953', 'ffa88345-941e-539e-9fd6-29bfe9e30386', 6, '90747231')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2976', 'f1d6b93f-aa5b-5471-a8b4-6fc8b8a791af', 12, '90772444')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2980', '0ef2a5b6-db25-5792-8174-e907e38d80c6', 12, '90772444')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2988', 'feffddf2-ecb2-56f3-864b-0aeacdb9aae6', 12, '90747231')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '3069', 'b5fd6272-d9fb-5c77-9683-b0c4851d4edb', 12, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('425ae6ef-c0a2-5cd1-8c9d-015d0fe1c0d8', '3303', '47ab69c8-b0a2-5838-8523-cb7d9ab96776', 1, '1671390')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '3419', 'c15523c1-0689-57cf-9b0a-bc1d3e20a929', 10, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('425ae6ef-c0a2-5cd1-8c9d-015d0fe1c0d8', '3511', 'd1aa9d2d-3c4f-5c8e-b100-eb2948c5601a', 1, '1671390')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '36', '9d5916f9-4ffb-51e6-9969-2c3c770ee93a', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '3613', '87b1d4e9-fae3-58a8-b6f4-77b08b0a3357', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '37', '43ff9633-301e-55d7-ba46-a1be3dc3b8b7', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '4122', '38b2518c-e39e-5e7f-a5cb-88de443745c3', 25, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '4210', '764ea2a2-a2a6-5b40-a792-6a7299c11ea7', 6, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '4215', '767247ae-9208-5af9-ac0b-272f50995595', 6, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '4356', 'd8ff2562-23bb-5b99-96da-fe97e8c15619', 24, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '4367', '49b9b7bb-1258-5d77-ba7a-31b24a0cad58', 6, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '4413', '0c687c7e-d685-5b03-9d58-5f6d5936625e', 36, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '4495', '1d61f59c-27df-5e67-891c-b91f14d4158f', 36, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '4550', 'b57acc07-5d7f-5df6-91e2-37bcacc195ee', 25, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('dd5b1cc6-d772-5252-830c-92f50bee9d80', '4767747420', '2d61345c-ce05-55bf-8af6-76a448b3c591', 24, 'INVE0023460478')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '50512', '5787a0fb-b61b-55f7-908f-25a316fc2d98', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51049A', '3dcbc2fb-45f9-54f3-af8b-4e3cc2614d70', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5114', '01e9df39-24d3-5225-a808-b5a4183a923f', 30, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51227', 'b739c94e-c9cf-5027-92ed-c3db8355430a', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51426', '1c8a4344-0df9-5554-acca-71966d0675de', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51631A', '95192971-51b9-5f76-ad4a-678e4d59d0b3', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51822', '31d3ae2c-16ea-556d-b49a-724663843512', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51835', 'bb903095-3ffa-5fa9-8bdb-8e4f96f39c37', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51838', '9aef2b08-b746-5b71-a22f-2544c964b132', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51845', '15d21fae-a067-56a2-83dc-11cf4f007a72', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51871', '215fca5f-85a7-597c-b69c-500c4ca56ece', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51876', '74b6758f-7d17-5d98-8001-d562dc019282', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51940', '1ec64899-e05e-5995-b582-1940c4361828', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51969', '49422f62-bc7e-50a2-b4d9-71af5dcd7f63', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51974', '0debec5b-3eb7-54b4-b10f-40c5425e2e53', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51996', 'e9ca588c-aefe-5b59-a90f-60991826c926', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('a2db4e29-8e2b-5585-b43a-788792e025a6', '51998', '8b0ce425-5350-5da9-b5c0-05e3053a003a', 1, '0271478-00')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5203', 'f162f194-accf-53d6-83b5-b4e25937016e', 24, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5217', '831ce589-86f1-5d9c-b10f-20d161b90a95', 50, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5280', '8d370f04-ba71-5a38-be46-3e66f8540ecc', 6, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5299', '5b5a96ce-8b2d-5c76-8f8f-f32edac08c14', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5300', '6828de1b-000b-54c5-bce5-778716d7dbe3', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '53:', '38fdf5bc-5182-5bd8-95c7-82df70c9dbbb', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5414', 'c2827b27-6010-599b-a438-dd8b1e3e784c', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5441', '9cf77f7c-ce7e-56f9-b65b-c08c6ce50e10', 12, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5442', '611df487-0edd-567a-938e-fd8274e9cff6', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5453', '704cca37-d3ed-53b9-841e-08688751a249', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('425ae6ef-c0a2-5cd1-8c9d-015d0fe1c0d8', '5502', '5103c64c-4e41-547c-9fc6-b47c5462d1a2', 1, '1671390')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '6475', '18b484e5-054b-5d7b-98d0-158886f38bf5', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '6502', '68e6a0d1-05ac-5bc6-ad66-fc14be4f41e3', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', '6975', '37b66b68-9ea5-5717-aba9-2b984aa36c67', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7003', '6606318f-15ed-5353-947a-c324d8ad392f', 16, '90747231')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '71016440054', 'a644feeb-dcc2-5b52-a6fd-fefb7bdfbd01', 10, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '718791808155', 'ae17ad1a-b175-5d5a-abd1-5d040da839f4', 6, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '718791808254', '572fb39f-9d4a-5ab5-8d14-7277feb55e97', 24, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '7410003710555', '879f8086-8d45-5e19-b484-5e2ac283c8b6', 20, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '7461063', '0c492b8b-2bba-53c9-b624-447723bc6878', 10, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7637', '2ebbf872-6de2-579e-9ea0-00092ac0d6ca', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7640', '3fac66dd-bd01-5e88-a3ea-7ef5fc7c60fb', 20, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '764090024031', '7a54cb7e-c5ff-5858-a77c-62d7df1e610f', 36, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7641', '357f7a92-820b-5686-a878-45a2d8b3c824', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7642', '8fe401cd-138f-5d88-b839-638ee1ecb7c6', 20, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7644', '148e762e-9087-5938-bd84-cb776cce5fc2', 20, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7645', '4bcc0406-05b9-54fa-a842-19dc8e40ea17', 20, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7646', '7514e2b4-c128-5e4b-9d59-9deb6377f40f', 20, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7647', '1cb35b62-bb9e-53de-90ca-22af7832922d', 20, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7649', 'd64cbcaa-d9ee-5531-b0c9-06ddb8cd9796', 20, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '767556901068', '6d60d874-c242-5037-9e6e-9988aa3eedde', 1, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7713', 'fa4e7e63-9c0e-50e4-894b-c4dc0f25f0a8', 8, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7720', 'b86768ab-d641-57e6-894e-e387d8eed6ce', 8, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('697f1361-f4e3-57ec-b3c5-3395a73dc837', '837464000204', '77489baf-b489-5e98-90fc-c10edf48e72b', 12, '27810')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '8409', 'bd5b9289-397f-5731-b9c2-50d1f6dba0b0', 48, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '8410', '375d66a2-6fcc-5d42-9cc4-1cd1aa8da030', 48, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '8714', '8bc32381-a21a-5202-9032-d019a56d214d', 36, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'CAS-543', '181347c4-597b-5eac-b5ac-ed2d28e83141', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'CAS-567', '722be82c-2ab1-5870-bb32-c46a5a6175e1', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', 'E538', '191e1289-5ee2-5906-a574-136d7935d5ea', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', 'FREC', '64ff620e-3f14-5820-80b8-d2328491efca', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'GN-376', '49f76ecb-bf37-58f0-9d09-319eb6ab7454', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'GN-383', '7f791a30-0bf2-5556-9600-caa29c0d579b', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-041', 'cd79d9cd-e11c-5606-b8fd-17bf1d994082', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-044', '9fcd8187-125a-5678-a843-7d28a8e612bb', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-146', '4283c97d-7510-5e56-9b23-80dc0c5a986c', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-160', 'a2157e09-b9e5-588b-9d8c-27969615ccaf', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-237', 'a00a0d6a-85a3-5352-bc1f-305d35922528', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-551', '4b3c86da-bbeb-5dce-a0fb-541f0eea257c', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-552', 'b7dd88ff-8429-5ebe-a847-ee91a7e781be', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-7174', '2fdc0638-165e-537a-9991-f3a4b4a96757', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-7478', 'f6dbaad2-c330-53e5-9d16-a58654d0544a', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-7479', '7bdf7d9f-5241-584f-a0a3-d0975986729b', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-7633', 'c63e8484-06ba-59d4-b6d7-326662dcef31', 1, 'INVNJ23127')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-7662', 'd2354633-b319-5d08-ad68-b3aa83055d4f', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-7665', 'f354b7df-587d-527b-b867-089afa88efad', 1, 'INVNJ23126')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('3ad8c842-d6ab-5051-ba00-79801d6d93c1', 'I-919', 'a48027d6-3620-580e-99d3-3e8ab252bafe', 1, 'INVNJ23127')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'M203', '68b05fcb-6727-586a-9137-808b7ec1ed3b', 12, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'M413', 'afb808c7-1d42-5621-8bd8-3bab6e766d7f', 6, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'PC301', '555419d9-80a5-564b-9841-be8b073ab2f0', 12, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'PC306', '7b3d9ca9-dec0-5a63-876f-161b243ab02a', 12, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'PC328', '5d90de4f-ca02-5a1d-8279-30fc7306aab4', 12, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'PC405', 'f4f0d554-ebac-5643-9e57-cfbd8e583725', 12, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('61e73f53-6061-5517-95e1-38f77d2f3921', 'PQ', '662c1275-8eaf-5668-a2a4-00e2851c00e2', 1, '27727700')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'PS136', '15d13608-1082-50d4-9690-12f844e0591c', 12, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'PS176', '0892e668-a9d4-5002-91d7-6e819701f175', 12, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'PS178', '572cc34c-8853-5b4d-a836-3132a611f3ed', 12, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'PS179', '3314dd0f-4a61-5d78-9fbc-e141dbfbe35b', 12, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'PS517', 'd9fd5b9e-2829-5c45-bdb4-3af78c2fc6e7', 12, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'PS518', '6b203134-3c9f-54ee-873c-4c6222a40171', 12, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'PS534', 'c9052e8f-9a4a-57e3-bab2-70c5ce47aa5c', 12, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'PS649', 'ffdc6757-ff76-5f0a-b64b-89cb1b47c1d1', 12, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('2cafc16d-35bc-54fa-887c-d96533e3e69d', 'PS679', '71d5cb67-5a32-5c05-92cd-3dab901259f4', 1, '3057:5')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;

-- ── Invoice lines ──────────────────────────────────────────────────────────
-- Replaced wholesale per invoice so a regenerated seed cannot leave orphans.
delete from public.pricing_invoice_lines where invoice_id = '010ba9b5-3dd7-5351-9bbb-f827b1eab04c';
delete from public.pricing_invoice_lines where invoice_id = '52881d11-7deb-5b91-9b38-a5ce8cdb0897';
delete from public.pricing_invoice_lines where invoice_id = '76390b5d-10f2-55a7-8961-ea8ce3077f96';
delete from public.pricing_invoice_lines where invoice_id = '1f76c232-7f7b-532b-abc3-18d4be40509a';
delete from public.pricing_invoice_lines where invoice_id = '56af8b83-e7b5-5383-9d19-ef5f6c39d768';
delete from public.pricing_invoice_lines where invoice_id = 'cfd7968d-4d3d-5a36-8b85-adad828fbf5d';
delete from public.pricing_invoice_lines where invoice_id = '67f3b947-c61e-5cda-9488-3b428689c456';
delete from public.pricing_invoice_lines where invoice_id = '51441fee-8ea9-5475-8240-e854aae87139';
delete from public.pricing_invoice_lines where invoice_id = '31e76f2f-1e8c-5b62-8947-7345565c5a2b';
delete from public.pricing_invoice_lines where invoice_id = 'e37e15ff-9e21-5386-81ab-78ce7049a883';
delete from public.pricing_invoice_lines where invoice_id = '5703086e-81d6-52ce-bcb7-41ab886cc3bf';
delete from public.pricing_invoice_lines where invoice_id = '7f3fe794-cf77-5c8c-8abd-23e9222061f9';
delete from public.pricing_invoice_lines where invoice_id = '673e89b4-6b92-538c-af09-cd1c5402c015';
delete from public.pricing_invoice_lines where invoice_id = 'b793548f-27ac-5a69-9496-4e85f2c6f266';
delete from public.pricing_invoice_lines where invoice_id = '9ef470c4-d0eb-5106-9472-af05722d3a8a';
delete from public.pricing_invoice_lines where invoice_id = '53634c39-a38b-5d6e-89a9-64dbd8634a8a';
delete from public.pricing_invoice_lines where invoice_id = '08ed68c6-f28a-5c00-9884-57d6fb0f71fd';
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 1, '7" Pan 500ct', null, 1, 500,
  42, 0.084, null, 'fa4b25cf-5167-5671-8854-bdc341b694bb', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 2, '7" Dome Lid 500ct', null, 1, 500,
  19, 0.038, null, '1d21cc34-0357-5297-979d-2c4704411d50', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 3, '8oz Deli Combo', null, 1, 24,
  30, 1.25, 1.99, '0272fe4f-5a8d-59ac-9764-b675fb02e243', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 4, '16oz Deli Combo', null, 1, 24,
  34, 1.4167, 1.99, '99e1b020-bfb7-5ff9-a7a1-e6bd3b195a82', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 5, 'OKF Aloe S 20ct', null, 3, 20,
  63, 1.05, 1.99, '8741497f-19f4-5d98-a0b2-511ee87822ec', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 6, 'OKF Aloe L 12ct', null, 1, 12,
  30, 2.5, 3.99, '767792b3-34b1-5f1b-b64e-573ec001a99e', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 7, 'Trix Cereal 12ct', null, 1, 12,
  42, 3.5, 5.99, '707adbed-570f-51fb-b2e5-9903c889c430', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 8, 'Cinnamon Toast 12ct', null, 1, 12,
  42, 3.5, 5.99, '2ab5fe45-b9ff-53d8-8ff5-bc463c58c45c', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 9, 'Cheerios L 14ct', null, 1, 14,
  54, 3.8571, 6.99, 'a6c7c3fc-da00-5830-bf5b-401333fb6865', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 10, 'Coco Pebbles 12ct', null, 1, 12,
  42, 3.5, 5.99, 'a29c6260-266a-504e-b626-a4a98d605eb2', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 11, 'Peanut Butter 11ct', null, 1, 11,
  19, 1.7273, 2.99, 'd54af35c-791a-528b-9a68-ee716aedf357', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 12, 'Oatmeal 16/18oz', null, 1, 16,
  20, 1.25, 1.99, 'a4b03d61-9bbe-5d9c-9590-605305421b32', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 13, 'Del Monte Corn 12ct', null, 1, 12,
  16, 1.3333, 1.99, '90d64415-76e6-5aff-b6ac-9e8b040fe87b', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 14, 'Awesome Detergent 8/64oz', null, 1, 8,
  22, 2.75, 4.99, '80f8484f-e78a-5089-97a5-e2a23593b0a2', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 15, 'Downy 12/360ml', null, 1, 12,
  16, 1.3333, 1.99, '82f61b1b-62a7-5454-aee8-c67a4bd14c54', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 16, 'Clorox Bleach 6/43oz', null, 1, 6,
  20, 3.3333, 5.99, 'ad1b19cb-97f1-5ef5-8aea-689c69347c64', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '010ba9b5-3dd7-5351-9bbb-f827b1eab04c', 17, 'Clorox Bleach 20/500ml', null, 1, 20,
  22, 1.1, 1.99, '073fea34-b10d-5254-9b2c-70204cd8357a', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 1, 'Suavitel Sheets 15ct', null, 2, 15,
  32, 1.0667, 1.99, 'c3b291e0-9daa-5fcf-807f-df2c00e00159', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 2, 'Sponges 27ct', null, 1, 27,
  21, 0.7778, 0.99, 'f51f6f9b-9b99-5d62-8543-49766846f392', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 3, 'Dove Soap 48/135g', null, 2, 48,
  92, 0.9583, 1.99, '467d025b-bc22-5fe0-8ff7-70d1749c693b', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 4, 'Febreze 8ct', null, 4, 8,
  84, 2.625, 3.99, '655629b7-631a-5558-9a58-96f7241239cc', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 5, 'Hispano de Miel 48ct', null, 1, 48,
  40, 0.8333, 0.99, '56f950a5-f1ba-5ca2-a39f-3796274b1e43', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 6, 'Hispano Pasta 25/2bars', null, 1, 25,
  35, 1.4, 1.99, 'e9d8429d-12c3-51b2-85fd-7224c7208cb4', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 7, 'Hispano Pasta 10/5pk', null, 1, 10,
  35, 3.5, 5.99, 'fa278462-2980-5257-8eba-098d27b5fa8a', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 8, 'Windex 8/32oz', null, 1, 8,
  32, 4, 6.99, 'ee75f174-e657-5282-a5ee-4bb5584ceb77', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 9, 'Fabuloso 6/56oz', null, 2, 6,
  48, 4, 6.99, 'eaa71868-6dd5-5017-a43d-5e0633c7868f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 10, 'Mistolin 24/15oz', null, 1, 24,
  22, 0.9167, 1.99, '4b255476-82c8-514d-b583-f04ebbb04868', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 11, 'Fabuloso 12/28oz', null, 2, 12,
  52, 2.1667, 3.99, '01eeae77-8f7f-5298-9868-d32bb9b5b4b6', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 12, 'Pampers Wipes 12ct', null, 1, 12,
  21, 1.75, 2.99, '879deadc-f465-52c2-913f-869a1030feae', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 13, 'Huggies Baby Wipes 10ct', null, 1, 10,
  16, 1.6, 2.99, '3ea5d845-e9fa-5ced-816a-30ee4ece3b05', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 14, '9" Paper Plate 10/100ct', null, 1, 10,
  23, 2.3, 3.99, '697ccbca-565a-5299-96a7-05c3ee9ddc5e', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 15, 'Reynolds Foil 25ft 24ct', null, 1, 24,
  46, 1.9167, 2.99, '14739f37-aa88-50ca-b3a3-6464047a11c0', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 16, 'Rectangular Pan 50ct', null, 1, 50,
  38, 0.76, 0.99, '401e9d00-bd86-5c0b-8928-bbe9315ab697', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '52881d11-7deb-5b91-9b38-a5ce8cdb0897', 17, 'Water Wipes 12ct', null, 1, 12,
  16, 1.3333, 1.99, '4eaaa253-6ffd-5297-9907-e8383e4fd819', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '76390b5d-10f2-55a7-8961-ea8ce3077f96', 1, 'Jelly Candy Monkey 6ct', null, 1, 6,
  32, 5.3333, 8.99, '5698cd83-a25e-50c7-ae06-d5a446049800', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '76390b5d-10f2-55a7-8961-ea8ce3077f96', 2, 'Scott Issue 36ct', null, 1, 36,
  29, 0.8056, 0.99, 'dfb36156-e442-54b2-9e6c-17cb97a12335', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '1f76c232-7f7b-532b-abc3-18d4be40509a', 1, 'Neapolitan 1.5QT Scround', '2468200902', 1, 3,
  14.49, 4.83, 7.99, '98d81666-ab28-541d-8470-c8f897b62ac6', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '1f76c232-7f7b-532b-abc3-18d4be40509a', 2, 'Chocolate 1.5QT Scround', '2468200903', 1, 3,
  14.49, 4.83, 7.99, '233f20c3-5299-5994-9614-db425b7b0d1d', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '1f76c232-7f7b-532b-abc3-18d4be40509a', 3, 'Strawberry 1.5QT Scround', null, 1, 3,
  14.49, 4.83, 7.99, '180b2edd-1bdd-51da-80df-23caa9c4fff9', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '1f76c232-7f7b-532b-abc3-18d4be40509a', 4, 'Cookies N Cream 1.5QT Scround', null, 1, 3,
  14.49, 4.83, 7.99, '4a67163d-8cf9-514c-8473-648f1f67a570', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '1f76c232-7f7b-532b-abc3-18d4be40509a', 5, 'Butter Pecan Pint', null, 1, 6,
  17.52, 2.92, 4.99, '629e4e48-8ec2-58c2-84ea-409c0246b6a9', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '1f76c232-7f7b-532b-abc3-18d4be40509a', 6, 'Brownie Batter Pint', null, 1, 6,
  17.52, 2.92, 4.99, '1c59a807-1457-550e-ab39-eb35eec59025', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '1f76c232-7f7b-532b-abc3-18d4be40509a', 7, 'Lil'' Blue Panda Pint', null, 1, 6,
  17.52, 2.92, 4.99, '69f72a48-8c30-54cb-a2ad-ebda38eb33f4', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '1f76c232-7f7b-532b-abc3-18d4be40509a', 8, 'Twix Ice Cream Bar', '4767747420', 1, 24,
  52.9, 2.2042, 3.99, '2d61345c-ce05-55bf-8af6-76a448b3c591', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '1f76c232-7f7b-532b-abc3-18d4be40509a', 9, 'Vanilla 6oz Cup', '2468231261', 1, 12,
  21.96, 1.83, 2.99, 'e5da914f-8a6e-5e9f-a65b-63c3d9249fad', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '1f76c232-7f7b-532b-abc3-18d4be40509a', 10, 'Straw Sundae 6oz Cup', '2468231334', 1, 12,
  21.96, 1.83, 2.99, '269ec070-0f89-5209-b945-4cd5a224dff4', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '1f76c232-7f7b-532b-abc3-18d4be40509a', 11, 'NP Mini Sandwich', '2468231352', 1, 48,
  22.08, 0.46, 0.99, '1307c72d-c8c8-5dc7-93ca-627f0405bfb0', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '1f76c232-7f7b-532b-abc3-18d4be40509a', 12, 'Delivery Fee', null, 1, 1,
  5, 5, null, '1e4306e8-f466-570a-a644-5286d318a82f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '56af8b83-e7b5-5383-9d19-ef5f6c39d768', 1, 'Mama Tere Maracuya Entera (FZ) 6/32oz', '2953', 1, 6,
  35.95, 5.9917, 9.99, 'ffa88345-941e-539e-9fd6-29bfe9e30386', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '56af8b83-e7b5-5383-9d19-ef5f6c39d768', 2, 'Mama Tere Yuca en Trozos (FZ) 12/40oz', '1705', 1, 12,
  45.95, 3.8292, 6.99, '88b496bc-9145-5dc8-bc1d-e9ab0defe5ca', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '56af8b83-e7b5-5383-9d19-ef5f6c39d768', 3, 'Mama Tere Yuca en Trozos (FZ) 6/80oz', '1708', 1, 6,
  45.95, 7.6583, 12.99, '514ea94e-7033-5a35-b7e9-f43e076d96a9', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '56af8b83-e7b5-5383-9d19-ef5f6c39d768', 4, 'Naturissimo Pan de Yuca/Cheese Bread 16ct', '7003', 1, 16,
  72.95, 4.5594, 7.99, '6606318f-15ed-5353-947a-c324d8ad392f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '56af8b83-e7b5-5383-9d19-ef5f6c39d768', 5, 'Mama Tere Cheese Tequeno Precooked 12/8ct', '2142', 1, 12,
  50.4, 4.2, 6.99, '69e5b567-4dfc-5987-9188-47bae1775a6d', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '56af8b83-e7b5-5383-9d19-ef5f6c39d768', 6, 'Mama Tere Pulpa Maracuya (FZ) 12/14oz', '2933', 1, 12,
  37.7, 3.1417, 4.99, '70597fde-fe6d-5062-9ae1-f5052b97962f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '56af8b83-e7b5-5383-9d19-ef5f6c39d768', 7, 'Mama Tere Pulpa Mora (FZ) 12/14oz', '2938', 1, 12,
  30.5, 2.5417, 3.99, 'cd385816-fdcc-5ca3-ba68-425f9908d1db', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '56af8b83-e7b5-5383-9d19-ef5f6c39d768', 8, 'Mama Tere Pulpa Naranjilla (FZ) 12/14oz', '2935', 1, 12,
  30.5, 2.5417, 3.99, 'a52638a3-e3bc-526f-9a99-ca4e906cfa0b', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '56af8b83-e7b5-5383-9d19-ef5f6c39d768', 9, 'Mama Tere Pulpa Tomate Arbol (FZ) 12/14oz', '2988', 1, 12,
  30.5, 2.5417, 3.99, 'feffddf2-ecb2-56f3-864b-0aeacdb9aae6', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '56af8b83-e7b5-5383-9d19-ef5f6c39d768', 10, 'Mama Tere Choclo Desgranado (FZ) 20/16oz', '2905', 1, 20,
  50.4, 2.52, 3.99, 'b86fba65-8c49-51cd-acc2-780564dab7e6', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 1, 'Mama Tere Jelly Fruits Net 24/15.8oz', '2280', 1, 24,
  31.75, 1.3229, 1.99, '0ad4bb76-c757-5405-b431-e24eacd1a943', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 2, 'Mama Tere Plantain Chips Salted Jar 36/20oz', '8714', 1, 36,
  187.95, 5.2208, 8.99, '8bc32381-a21a-5202-9032-d019a56d214d', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 3, 'Guitig Agua Mineral Pet 12/16.9oz', '2202', 1, 12,
  13.3, 1.1083, 1.99, '9bcc8488-d395-594c-aee9-a8c7a09b1ae2', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 4, 'Tropical Soda Glass 24/12oz', '2213', 1, 24,
  30.95, 1.2896, 1.99, '36aea547-969e-56dd-add2-103d61130078', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 5, 'Tropical Soda Pet 8/67.62oz (2lt)', '2217', 1, 8,
  20.8, 2.6, 3.99, 'd879eee2-dfc1-5d9e-aed6-545259d7141a', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 6, 'Fioravanti Strawberry Soda Pet 6/2lt', '2001', 1, 6,
  27.95, 4.6583, 7.99, 'db95e767-00fb-597b-8d69-6c7a672090a0', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 7, 'Fioravanti Apple Soda Pet 6/2lt', '2002', 1, 6,
  27.95, 4.6583, 7.99, '5c7e180b-c2d2-5a1e-8a3f-cbf047d67475', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 8, 'Del Frutal Pineapple Nectar Tetra 8/3pk', '7713', 1, 8,
  12.5, 1.5625, 2.99, 'fa4e7e63-9c0e-50e4-894b-c4dc0f25f0a8', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 9, 'Del Frutal Mango Nectar Tetra 8/3pk', '7720', 1, 8,
  12.5, 1.5625, 2.99, 'b86768ab-d641-57e6-894e-e387d8eed6ce', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 10, 'Incasur Sol Cusco Choc C&C Bar 48/3.17oz', '8410', 1, 48,
  47.5, 0.9896, 1.99, '375d66a2-6fcc-5d42-9cc4-1cd1aa8da030', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 11, 'Incasur Sol Cusco Chocolate Bar 48/3.17oz', '8409', 1, 48,
  47.5, 0.9896, 1.99, 'bd5b9289-397f-5731-b9c2-50d1f6dba0b0', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 12, 'Allegra Rotini Pasta 20/16oz', '7647', 1, 20,
  23.4, 1.17, 1.99, '1cb35b62-bb9e-53de-90ca-22af7832922d', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 13, 'Nestle Galak 2 disp/12un', '5203', 1, 24,
  71.5, 2.9792, 4.99, 'f162f194-accf-53d6-83b5-b4e25937016e', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 14, 'Mama Tere Jelly Stars Jar 6/49oz', '5280', 1, 6,
  32.4, 5.4, 8.99, '8d370f04-ba71-5a38-be46-3e66f8540ecc', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 15, 'Mama Tere RD Casabe Artesanal 10/11oz', '3419', 1, 10,
  24.65, 2.465, 3.99, 'c15523c1-0689-57cf-9b0a-bc1d3e20a929', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 16, 'Angelitos Malvaviscos Churro Fresa 10/7oz', '1741', 1, 10,
  15.55, 1.555, 2.99, '4e9016e3-6e70-5349-80d8-fb2dd2e44d88', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 17, 'Mama Tere Jasmine Rice Hom Mali 2/320oz', '1021', 2, 2,
  89.9, 22.475, 37.99, '48347134-3837-5dc3-b193-ac3be0fe0758', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 18, 'Mama Tere Jasmine Rice Hom Mali 8/80oz', '1023', 1, 8,
  45.75, 5.7188, 9.99, 'e57872a3-cd65-5994-8221-4dc5d525d8a9', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 19, 'Toops Chocolate 12/7.8oz', '1051', 1, 12,
  34.5, 2.875, 4.99, '1a697e67-b896-5254-a1e5-002590d0c25e', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 20, 'Mama Tere Lentejon 24/14oz', '2626', 1, 24,
  24.95, 1.0396, 1.99, '26459064-7905-5ce9-92e2-7c41381cdeae', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 21, 'Mama Tere Canguil 12/32oz (2lb)', '2675', 1, 12,
  31.2, 2.6, 3.99, '4687ac44-45a1-5151-a3e9-d28932f4c30b', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 22, 'Harina Ya 25/35.2oz (1kg)', '4550', 1, 25,
  72.95, 2.918, 4.99, 'b57acc07-5d7f-5df6-91e2-37bcacc195ee', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 23, 'Quaker Avena Molida 25/17.6oz', '4122', 1, 25,
  64.85, 2.594, 3.99, '38b2518c-e39e-5e7f-a5cb-88de443745c3', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 24, 'Picamas Hot Green Sauce 24/6.2oz', '1826', 1, 24,
  34.3, 1.4292, 1.99, 'b3ca16fb-3dc3-5a27-a322-0e86a6e4d1e5', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 25, 'Tapiorica Manzana 6/14.1oz', '4210', 1, 6,
  19.95, 3.325, 5.99, '764ea2a2-a2a6-5b40-a792-6a7299c11ea7', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 26, 'Tapiorica Fresa 6/14.1oz', '4215', 1, 6,
  19.95, 3.325, 5.99, '767247ae-9208-5af9-ac0b-272f50995595', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 27, 'Mama Tere Pacaya 12/32oz (907g)', '1500', 1, 12,
  74.95, 6.2458, 10.99, '6666a7e8-c1e7-5137-8cb0-aabd30f5fa10', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 28, 'ILE Alino Adobo Glass 12/8.8oz', '5441', 1, 12,
  26.5, 2.2083, 3.99, '9cf77f7c-ce7e-56f9-b65b-c08c6ce50e10', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 29, 'Nestle Amor Wafer Vainilla 36/6.1oz', '4413', 1, 36,
  62.95, 1.7486, 2.99, '0c687c7e-d685-5b03-9d58-5f6d5936625e', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 30, 'La Favorita Achiote Liquido 30/16.9oz', '5114', 1, 30,
  99.95, 3.3317, 5.99, '01e9df39-24d3-5225-a808-b5a4183a923f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 31, 'Oriental Salsa China 24/13.52oz', '2407', 1, 24,
  65.35, 2.7229, 4.99, '3fb0eb0c-48e5-5db4-b01a-6c55282338dd', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 32, 'Mama Tere Pasta de Ajo Pet 12/17.6oz', '2559', 1, 12,
  42.8, 3.5667, 5.99, 'a9fdc3a3-f0cf-5fcc-8a35-3ea828d3d7de', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 33, 'ILE Alino Adobo Pet 12/17.6oz', '5442', 1, 12,
  30.35, 2.5292, 3.99, '611df487-0edd-567a-938e-fd8274e9cff6', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 34, 'Mondaisa Te Boldo 6/20ct', '2752', 1, 6,
  14.4, 2.4, 3.99, '1bf68753-6af3-526f-bfb5-744c0c5098f3', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 35, 'Mondaisa Te Jengibre & Limon 6/20ct', '2762', 1, 6,
  15.55, 2.5917, 3.99, 'd3d6607a-3c7d-594d-8b4c-7ac4265bd939', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 36, 'Mondaisa Te Menta-Eucalipto 6/20ct', '2764', 1, 6,
  15.55, 2.5917, 3.99, '5fca1ad1-5a73-5b75-a968-6d5e1c21e491', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 37, 'Homimans Te de Manzanilla 12/25ct', '5300', 1, 12,
  27.95, 2.3292, 3.99, '6828de1b-000b-54c5-bce5-778716d7dbe3', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 38, 'Toni Leche Chocolate Milk 6/33.8oz (1lt)', '4367', 1, 6,
  31.2, 5.2, 8.99, '49b9b7bb-1258-5d77-ba7a-31b24a0cad58', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 39, 'Toni Gelatina Uva-Grape Jello 24/7.05oz', '4356', 1, 24,
  26.5, 1.1042, 1.99, 'd8ff2562-23bb-5b99-96da-fe97e8c15619', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 40, 'Mama Tere Horchata 50/1oz', '5217', 1, 50,
  64.95, 1.299, 1.99, '831ce589-86f1-5d9c-b10f-20d161b90a95', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 41, 'Ecuatun Tuna in Oil 48/5oz', '1106', 1, 48,
  89.95, 1.874, 2.99, '5a99119b-c122-5b15-aa82-4d302cbd280c', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 42, 'Ecuatun Tuna In Oil Can 4pk 20/2.82oz', '1116', 1, 20,
  95.95, 4.7975, 7.99, 'e898fc13-9a3b-5982-8187-16d8bcbd7a63', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 43, 'Ecuatun Encebollado Tuna Soup 24/14oz', '1105', 1, 24,
  87.4, 3.6417, 5.99, 'ad5b8cc0-4bce-5687-a7c4-540aa6b8caad', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 44, 'Florida Tuna in Vegetable Oil 48/5oz', '1120', 1, 48,
  93.55, 1.949, 2.99, '941eabc2-9a01-518c-b1c2-92586a8a584d', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 45, 'Florida Tuna in Water 48/5oz', '1119', 1, 48,
  93.55, 1.949, 2.99, '23088c33-4862-5de8-afbe-75071c87bff9', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 46, 'Van Camps Yellowfin Tuna in Oil 24/4pk/3oz', '1129', 1, 24,
  139.95, 5.8313, 9.99, 'bba755be-b7b2-55f0-8015-beae919c885c', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'cfd7968d-4d3d-5a36-8b85-adad828fbf5d', 47, 'Van Camps Yellowfin Tuna in Oil 48/5oz', '1101', 5, 48,
  567.75, 2.3656, 3.99, 'b6188181-497d-5b86-913d-2d17898d01b2', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '67f3b947-c61e-5cda-9488-3b428689c456', 1, 'Florida Tuna in vegetable Oil 3pk', '1155', 1, 16,
  0, 0, 4.99, '6c843fc7-fd32-58bc-845c-2b5a361502d2', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 1, 'Mama Tere Jelly Fruits Net', '2280', 1, 24,
  31.75, 1.3229, 1.99, '0ad4bb76-c757-5405-b431-e24eacd1a943', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 2, 'Mama Tere Plantain Chips Salted Jar Shipper', '8714', 1, 36,
  187.95, 5.2208, 8.99, '8bc32381-a21a-5202-9032-d019a56d214d', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 3, 'Mama Tere RD Casabe Artesanal', '3419', 1, 10,
  24.65, 2.465, 3.99, 'c15523c1-0689-57cf-9b0a-bc1d3e20a929', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 4, 'Mama Tere Lentejon', '2626', 1, 24,
  24.95, 1.0396, 1.99, '26459064-7905-5ce9-92e2-7c41381cdeae', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 5, 'ILE Alino Adobo Pet', '5442', 1, 12,
  30.35, 2.5292, 3.99, '611df487-0edd-567a-938e-fd8274e9cff6', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 6, 'Hornimans Te de Manzanilla', '5300', 1, 12,
  27.95, 2.3292, 3.99, '6828de1b-000b-54c5-bce5-778716d7dbe3', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 7, 'Ecuatun Tuna in Oil Can 4pk', '1116', 1, 20,
  95.95, 4.7975, 7.99, 'e898fc13-9a3b-5982-8187-16d8bcbd7a63', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 8, 'Florida Tuna in vegetable Oil', '1120', 1, 48,
  93.55, 1.949, 2.99, '941eabc2-9a01-518c-b1c2-92586a8a584d', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 9, 'Van Camps Yellowfin Tuna in Oil', '1101', 5, 48,
  494.75, 2.0615, 3.99, 'b6188181-497d-5b86-913d-2d17898d01b2', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 10, 'Saba Ultra Invisible Long Pads Wings', '2098', 1, 12,
  37.67, 3.1392, 4.99, 'e73dccf9-b4de-5053-bc83-301920b3662a', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 11, 'Saba Ultra Invisible Overnight Pads Wings', '2099', 1, 16,
  50.37, 3.1481, 4.99, '7c4aa759-9f54-5fb7-8283-446155f8fc98', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 12, 'Taqueritos Chile Toreado Snack', '1447', 1, 20,
  51.95, 2.5975, 3.99, '00de6ab7-295b-51b4-82cc-e710527357be', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 13, 'Del Frutal Pineapple Nectar Tetra', '07713', 1, 8,
  12.5, 1.5625, 2.99, 'e505774e-01bb-5dcb-a270-d9eb4fe4530d', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 14, 'Del Frutal Mango Nectar Tetra', '07720', 1, 8,
  12.5, 1.5625, 2.99, 'c6b02f9f-75ad-52b1-aab6-d28b3f21946c', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 15, 'Maltin Polar Glass', '1231', 1, 4,
  21.95, 5.4875, 8.99, '03327e4e-fa1f-5c09-a413-e57ef6bce980', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 16, 'Manzana Soda Glass', '2214', 1, 24,
  30.95, 1.2896, 1.99, '8019dab1-6a54-5276-a351-f38715573057', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 17, 'Guitig Agua Mineral Pet', '2203', 1, 6,
  14.95, 2.4917, 3.99, '6c82064f-4fb3-5462-aaf6-6b458f30ea28', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 18, 'Manzana Soda Pet', '2218', 1, 8,
  20.8, 2.6, 3.99, '405cf37e-23d7-56e7-9f93-3b4fa10afc1c', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 19, 'Ecuatun Sango/ Tuna Plantain Stew', '1117', 1, 12,
  56.95, 4.7458, 7.99, '65329392-a5ce-5c83-9ff5-f804f804b427', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 20, 'La Universal Manicho', '4495', 1, 36,
  72.3, 2.0083, 2.99, '1d61f59c-27df-5e67-891c-b91f14d4158f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 21, 'Allegra Angel Hair Pasta', '7642', 1, 20,
  21.76, 1.088, 1.99, '8fe401cd-138f-5d88-b839-638ee1ecb7c6', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 22, 'Allegra Coil Fideo Pasta', '7641', 1, 12,
  14.51, 1.2092, 1.99, '357f7a92-820b-5686-a878-45a2d8b3c824', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 23, 'Allegra Linguini Pasta', '7644', 2, 20,
  43.52, 1.088, 1.99, '148e762e-9087-5938-bd84-cb776cce5fc2', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 24, 'Allegra Penne Rigate Pasta', '7645', 1, 20,
  21.76, 1.088, 1.99, '4bcc0406-05b9-54fa-a842-19dc8e40ea17', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 25, 'Allegra Spaghetti Pasta', '7649', 2, 20,
  43.52, 1.088, 1.99, 'd64cbcaa-d9ee-5531-b0c9-06ddb8cd9796', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 26, 'Allegra Thin Spaguetti #9 Pasta', '7640', 1, 20,
  21.76, 1.088, 1.99, '3fac66dd-bd01-5e88-a3ea-7ef5fc7c60fb', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 27, 'Allegra Tricolor Rotini', '7637', 1, 12,
  14.51, 1.2092, 1.99, '2ebbf872-6de2-579e-9ea0-00092ac0d6ca', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 28, 'Allegra Rigatoni Pasta', '7646', 1, 20,
  21.76, 1.088, 1.99, '7514e2b4-c128-5e4b-9d59-9deb6377f40f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 29, 'Mondaisa Te Flor de Tilo', '2754', 1, 6,
  14.4, 2.4, 3.99, 'a0ebea73-d778-578e-918e-2b15fbeab0f4', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 30, 'Mondaisa Te Curcuma Jengibre', '2759', 1, 6,
  14.4, 2.4, 3.99, '108072e2-b4c5-5933-8a8b-8cf8c4b065c8', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 31, 'Mama Tere Achiote en Grano (Bag)', '2863', 1, 24,
  91.95, 3.8313, 6.99, '7aabe60f-dfb9-5afb-b09d-d7fc179ea270', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 32, 'Hornimans Te Relajante', '5299', 1, 12,
  36.6, 3.05, 4.99, '5b5a96ce-8b2d-5c76-8f8f-f32edac08c14', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 33, 'ILE Pasta de Ajo Pet', '5453', 1, 12,
  42.8, 3.5667, 5.99, '704cca37-d3ed-53b9-841e-08688751a249', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 34, 'ILE Sabora Pasta', '5414', 1, 12,
  34.95, 2.9125, 4.99, 'c2827b27-6010-599b-a438-dd8b1e3e784c', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 35, 'Mama Tere Jasmine Rice Thai Hom Mali', '1024', 1, 20,
  46.75, 2.3375, 3.99, 'c2e94303-b80b-5ca8-a126-d5526d704604', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 36, 'Maizabrosa', '2505', 1, 12,
  51.4, 4.2833, 6.99, 'c658e5ae-58b0-5810-8822-f8b083474f8a', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 37, 'Chocomelher Classic', '1531', 1, 24,
  51.95, 2.1646, 3.99, '65826603-c87e-5e4a-92da-7d5c51c3099f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 38, 'Nestle PE Sublime Clasico', '2696', 1, 4,
  57.95, 14.4875, 24.99, 'a38fa797-c36a-53d4-951b-136d7be43972', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 39, 'Nestle PE Princesa Bombom', '2698', 1, 8,
  51.5, 6.4375, 10.99, '89c7f971-ba17-5fb5-b88e-d451db0f06c3', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '51441fee-8ea9-5475-8240-e854aae87139', 40, 'Nestle PE Morochas Galletas 6pk', '2699', 1, 30,
  70.2, 2.34, 3.99, 'a40a83a3-960a-5a15-9d7f-d7fedfdec71e', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '31e76f2f-1e8c-5b62-8947-7345565c5a2b', 1, 'Mama Tere Yuca en Trozos / Frozen Cassava (FZ)', '1705', 1, 12,
  45.95, 3.8292, 6.99, '88b496bc-9145-5dc8-bc1d-e9ab0defe5ca', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '31e76f2f-1e8c-5b62-8947-7345565c5a2b', 2, 'MamaTere Yuca en Trozos / Frozen Cassava (FZ)', '1708', 1, 6,
  45.95, 7.6583, 12.99, '514ea94e-7033-5a35-b7e9-f43e076d96a9', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '31e76f2f-1e8c-5b62-8947-7345565c5a2b', 3, 'Mama Tere Hoja de Mashan (FZ)', '2980', 1, 12,
  35.95, 2.9958, 4.99, '0ef2a5b6-db25-5792-8174-e907e38d80c6', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '31e76f2f-1e8c-5b62-8947-7345565c5a2b', 4, 'Mama Tere Naranjilla (FZ)', '2906', 1, 12,
  37.5, 3.125, 4.99, '8e311a14-9d27-57a8-a4fe-b5fed4e32811', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '31e76f2f-1e8c-5b62-8947-7345565c5a2b', 5, 'Mama Tere Tomate Arbol (FZ)', '2902', 1, 12,
  34.5, 2.875, 4.99, '71cf2af5-81fc-5724-9cfb-ef223d32fcd0', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '31e76f2f-1e8c-5b62-8947-7345565c5a2b', 6, 'Mama Tere Papa Criolla (FZ)', '2929', 1, 6,
  34.2, 5.7, 9.99, '65cc9bbb-8700-5638-845b-d9ebefb9b5f1', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '31e76f2f-1e8c-5b62-8947-7345565c5a2b', 7, 'Mama Tere Choclo Entero (FZ)', '2948', 1, 6,
  48.95, 8.1583, 13.99, '257b7fc3-f87b-569c-9d64-3a471ff16ced', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '31e76f2f-1e8c-5b62-8947-7345565c5a2b', 8, 'Mama Tere Mote Precocido (FZ)', '2926', 1, 8,
  52.8, 6.6, 10.99, '55d40674-30f1-5c49-b454-6c6ec153a062', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '31e76f2f-1e8c-5b62-8947-7345565c5a2b', 9, 'Mama Tere Pulpa Maracuya c/semilla (FZ)', '2976', 1, 12,
  34.55, 2.8792, 4.99, 'f1d6b93f-aa5b-5471-a8b4-6fc8b8a791af', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '31e76f2f-1e8c-5b62-8947-7345565c5a2b', 10, 'Mama Tere Pulpa Guayaba (FZ)', '2937', 1, 12,
  22.95, 1.9125, 2.99, '7b22cdd5-f2bc-59d8-8115-00bb2d7f7996', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '31e76f2f-1e8c-5b62-8947-7345565c5a2b', 11, 'Mama Tere Pulpa Guanabana (FZ)', '2936', 1, 12,
  38.95, 3.2458, 5.99, 'abede8ac-139b-5634-8c78-61153297710f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'e37e15ff-9e21-5386-81ab-78ce7049a883', 1, '1/4 Legs Reg Medium HOR', null, 1, 1,
  30.4, 30.4, 51.99, '4c25919d-c6dc-535b-8307-90f5b6bf7c77', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'e37e15ff-9e21-5386-81ab-78ce7049a883', 2, 'Rib Belle Hat CH #1757', '3303', 1, 1,
  48.82, 48.82, 82.99, '47ab69c8-b0a2-5838-8523-cb7d9ab96776', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'e37e15ff-9e21-5386-81ab-78ce7049a883', 3, 'Mazita Cushion Hat c/v # 16', '3511', 1, 1,
  36.81, 36.81, 62.99, 'd1aa9d2d-3c4f-5c8e-b100-eb2948c5601a', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'e37e15ff-9e21-5386-81ab-78ce7049a883', 4, 'Chulera Ahumada Hat # 2301 Catchuts: 20.80', '5502', 1, 1,
  76.75, 76.75, 129.99, '5103c64c-4e41-547c-9fc6-b47c5462d1a2', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 1, 'Universal Gelatina Fresa x 12', null, 2, 12,
  33, 1.375, 1.99, '71a5d89a-42a9-5dd9-85cb-3b1449db4c6f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 2, 'Universal Gelatina Piña x 12', null, 2, 12,
  33, 1.375, 1.99, 'b213382c-71bc-5570-9c79-0bb781cce052', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 3, 'Colapiz Universal x 12', null, 2, 12,
  36, 1.5, 2.99, '34e0f3c1-b6e8-5229-bf54-f6a01e243f79', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 4, 'Sublime Chocolate x 24', null, 3, 24,
  54, 0.75, 0.99, '0bb0cd7e-17cc-54d2-8d6a-1e546fb767a9', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 5, 'Galleta Soda San Jorge Caja 7-pack x 4', null, 6, 4,
  42, 1.75, 2.99, 'f641f43c-2676-592b-aea0-4645a80b0d2a', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 6, 'Galleta Soda San Jorge Gourmet Caja x 12', null, 4, 12,
  48, 1, 1.99, '73de8e11-c72e-56af-a562-8251d2f0b62b', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 7, 'Sibarita Sazon 6 Pack 8.4 Gr x 50 Unidades', null, 1, 50,
  65, 1.3, 1.99, '9abe4ecd-9020-576e-a818-053b9d36b185', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 8, 'Vitalina Linaza 20 OZ x 12', null, 1, 12,
  20, 1.6667, 2.99, '623dcfd4-3ec3-5515-863b-ca4ba0d94b16', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 9, 'Vitalina Linaza Piña 20 OZ x 12', null, 1, 12,
  20, 1.6667, 2.99, 'd11449bf-6358-53cd-a204-44ae841287bf', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 10, 'Chicha Limeña 20 OZ x 24', null, 1, 24,
  36, 1.5, 2.99, '92018b7c-204c-5f9a-8b8b-06d326ae45aa', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 11, 'Guarana Backus 450 ML x 15', null, 1, 15,
  16.5, 1.1, 1.99, '8b18737f-f5e7-548c-8b4c-9a41753f9582', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 12, 'Chicha Limeña 64 OZ x 8', null, 5, 8,
  120, 3, 4.99, '0bf1d152-4c4e-5878-b89f-e3db5cc7cde4', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 13, 'Vitalina Linaza 64OZ x 8', null, 1, 8,
  24, 3, 4.99, '932bf859-d276-5270-bbf1-b9c4216bad9c', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '5703086e-81d6-52ce-bcb7-41ab886cc3bf', 14, 'Kola Inglesa 2 Lt x 6', null, 1, 6,
  12, 2, 2.99, 'b9018003-daf9-5058-925b-037c49cd5d5d', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 1, 'M9.5-CLOVES 12/3 OZ', 'M203', 1, 12,
  38.92, 3.2433, 5.99, '68b05fcb-6727-586a-9137-808b7ec1ed3b', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 2, 'M28-GROUND CINNAMON 6/12 OZ', 'M413', 2, 6,
  52, 4.3333, 6.99, 'afb808c7-1d42-5621-8bd8-3bab6e766d7f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 3, 'PEPITO CHILI GUAJILLO 12/3 OZ', 'PC306', 1, 12,
  20, 1.6667, 2.99, '7b3d9ca9-dec0-5a63-876f-161b243ab02a', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 4, 'PEPITO CHILI ARBOL 12/3 OZ', 'PC301', 1, 12,
  17.08, 1.4233, 1.99, '555419d9-80a5-564b-9841-be8b073ab2f0', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 5, 'PEPITO CHILI GUAJILLO 12/8 OZ', 'PC405', 1, 12,
  35.02, 2.9183, 4.99, 'f4f0d554-ebac-5643-9e57-cfbd8e583725', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 6, 'PEPITO CORN HUSK 12/6 OZ', 'PC328', 1, 12,
  57.6, 4.8, 7.99, '5d90de4f-ca02-5a1d-8279-30fc7306aab4', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 7, 'PEPITO HIBISCUS FLOWER 12/3 OZ', 'PS534', 1, 12,
  22, 1.8333, 2.99, 'c9052e8f-9a4a-57e3-bab2-70c5ce47aa5c', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 8, 'PEPITO CINNAMON STICKS MEXICAN 12/3 OZ', 'PS518', 1, 12,
  38.92, 3.2433, 5.99, '6b203134-3c9f-54ee-873c-4c6222a40171', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 9, 'PEPITO CLOVES WHOLE 12/5 OZ', 'PS136', 1, 12,
  15.52, 1.2933, 1.99, '15d13608-1082-50d4-9690-12f844e0591c', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 10, 'PEPITO CINNAMON STICK 12/75 OZ', 'PS517', 1, 12,
  15.52, 1.2933, 1.99, 'd9fd5b9e-2829-5c45-bdb4-3af78c2fc6e7', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 11, 'PEPITO ALLSPICE WHOLE 12/1.25 OZ', 'PS176', 1, 12,
  15.52, 1.2933, 1.99, '0892e668-a9d4-5002-91d7-6e819701f175', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 12, 'PEPITO BLACK PEPPER GROUND 12/1.25 OZ', 'PS179', 1, 12,
  15.52, 1.2933, 1.99, '3314dd0f-4a61-5d78-9fbc-e141dbfbe35b', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 13, 'PEPITO BLACK PEPPER WHOLE 12/1.25 OZ', 'PS178', 1, 12,
  13.96, 1.1633, 1.99, '572cc34c-8853-5b4d-a836-3132a611f3ed', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 14, 'PEPITO HOJA DE GUANABANA 12.5 OZ 70742590086', 'PS679', 1, 1,
  19.7, 19.7, 32.99, '71d5cb67-5a32-5c05-92cd-3dab901259f4', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '7f3fe794-cf77-5c8c-8abd-23e9222061f9', 15, 'PEPITO AVOCADO LEAVES 12/8 OZ', 'PS649', 1, 12,
  19.7, 1.6417, 2.99, 'ffdc6757-ff76-5f0a-b64b-89cb1b47c1d1', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 1, 'Azucar Domino (Blanca) 4lb 10/1', '01034745571226', 3, 10,
  125.46, 4.182, 6.99, '6f5d884c-2ae9-5779-be11-d59584a5fc8f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 2, 'Baldom Ajo En Pasta 12/8oz', '0787545052823', 1, 12,
  32.5, 2.7083, 4.99, '4cab3b5c-fc58-53d7-a217-2e5946e89d33', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 3, 'Biokemical Artribion 20/4', '7410003710555', 2, 20,
  49.9, 1.2475, 1.99, '879f8086-8d45-5e19-b484-5e2ac283c8b6', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 4, 'Cafe Bustelo Brick (Paq) 10oz 24/1', '074471017201', 1, 24,
  148.95, 6.2063, 10.99, '14784aea-be1f-52cc-a637-8f4c294e3f6d', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 5, 'Cafe Santo Domingo 10oz (Lata) 12/1', '10748325000561', 1, 12,
  105, 8.75, 14.99, '000bf6e9-d1e4-5b0b-a948-95b4e76895ff', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 6, 'Campesino Salami Short 16oz 20/1', '0786119000680', 1, 20,
  73.5, 3.675, 5.99, '75961928-6189-5267-8947-ee9a89c2dacb', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 7, 'Carnation Evapov Milk 24/12oz', '00050000015016', 1, 24,
  37.5, 1.5625, 2.99, '68b012c2-9546-511b-8f47-79d9fd1449b6', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 8, 'Casabe Mechi 10/1', '7461063', 1, 10,
  23.5, 2.35, 3.99, '0c492b8b-2bba-53c9-b624-447723bc6878', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 9, 'Casabe Soy Dominicano 10/10oz', '71016440054', 1, 10,
  25.5, 2.55, 3.99, 'a644feeb-dcc2-5b52-a6fd-fefb7bdfbd01', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 10, 'Choco Rica Gd 12/1lt (32oz)', '0790330061023', 1, 12,
  41.5, 3.4583, 5.99, 'be50cf8b-dbbe-5b04-8291-d7eec5270cda', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 11, 'Chocolate Embajador 36/1', '764090024031', 1, 36,
  84.5, 2.3472, 3.99, '7a54cb7e-c5ff-5858-a77c-62d7df1e610f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 12, 'Country Club Merengue 2lt 8/1', '089087671525', 1, 8,
  16.75, 2.0938, 3.99, '8e6d9d6d-0b05-539b-a8d3-ec35566d02b6', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 13, 'Country Club Uva 12oz 24/1', '051202008295', 1, 24,
  23.5, 0.9792, 1.99, '17f75a79-4056-5583-a2f2-726fbec4ea4e', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 14, 'Domino Blanco', '767556901068', 6, 1,
  28.5, 4.75, 7.99, '6d60d874-c242-5037-9e6e-9988aa3eedde', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 15, 'Estelar Salami Super Especial 2lb 12/1', '0895605601116', 1, 12,
  124, 10.3333, 17.99, 'fdd64aef-f48c-58cc-8103-6a1f6031af4c', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 16, 'Galletas Dino Chocolate 18/1', '10753079000422', 1, 18,
  51.75, 2.875, 4.99, 'dfa2b2e4-854a-52d6-9847-a4687bfb6077', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 17, 'Galletas La Paloma 16/1loz', '0021882002890', 1, 16,
  47.95, 2.9969, 4.99, '9b664950-7aff-50fb-8d87-4653878ce7ff', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 18, 'Guarina Wafer Fresa 21/1', '051228637769', 1, 21,
  41, 1.9524, 2.99, '7f7076bd-5efb-5cae-a91c-197dbb9616ed', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 19, 'Kika Crackers (Galleta) 16/1loz', '021882002722', 1, 16,
  47.95, 2.9969, 4.99, '9ddf4e1f-d7b2-5422-b637-994130e45886', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 20, 'La Constanzera Azucar Brown 2lb 12/1', '0858037006034', 1, 12,
  30.5, 2.5417, 3.99, 'd44074af-1e6a-5e2d-b0b7-050eff753337', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 21, 'Maizena Fecula De Maiz 24/14oz', '104800171127', 1, 24,
  58.25, 2.4271, 3.99, '63beefbc-e636-598b-a536-14608d56cd87', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 22, 'Mango Best (Gd) 946ml 6/1', '718791808155', 1, 6,
  19.95, 3.325, 5.99, 'ae17ad1a-b175-5d5a-abd1-5d040da839f4', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 23, 'Mango Best (Peq) 246ml 24/1', '718791808254', 1, 24,
  24.5, 1.0208, 1.99, '572fb39f-9d4a-5ab5-8d14-7277feb55e97', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 24, 'Mini Pan Original 12/1', '837464000204', 1, 12,
  22.9, 1.9083, 2.99, '77489baf-b489-5e98-90fc-c10edf48e72b', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 25, 'Pasta de Tomate Victorina 29oz', '072728002062', 2, 1,
  62.5, 31.25, 52.99, 'b411bccf-35fc-5cdb-9030-fd53208d1a49', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 26, 'Pringles Original (Gd) 5.5oz 14/1', '10030600229961', 1, 14,
  30, 2.1429, 3.99, 'c06d2209-d024-5002-bdb5-c06cfc0b6446', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '673e89b4-6b92-538c-af09-cd1c5402c015', 27, 'Pringles Original 2.5oz (Med) 12/1', '00038000845635', 1, 12,
  14.95, 1.2458, 1.99, 'bc5cd74f-da43-5125-98ab-fcd7a9443dfb', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 1, 'PERDIGON OLIVES 20 OZ', '1312', 1, 1,
  41.95, 41.95, 70.99, 'f1ce315e-8fc3-56e8-81e9-0e2ecde3b1b8', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 2, 'STUFF MANZANILLA OLIVES', '1331', 1, 1,
  37.5, 37.5, 63.99, 'c547933a-a38f-5cc1-9aea-b8f857fa0c4f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 3, 'GREEN PIGEON PEAS 15 OZ', '2001', 1, 1,
  33.95, 33.95, 57.99, '5f5ff930-8072-567b-90e5-89845e7f292b', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 4, 'GREEN PIGEON PEAS 29 OZ', '2003', 1, 1,
  33.45, 33.45, 56.99, '62da758a-8218-57da-addc-77da82110fb6', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 5, 'SOFRITO 12 OZ', '2146', 1, 1,
  47.95, 47.95, 81.99, '33a77dfa-b1ba-57b7-8405-31259733b949', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 6, 'SOFRITO 6 OZ', '2148', 1, 1,
  32.95, 32.95, 55.99, 'e93d626f-706f-56f8-9eed-e99724a071f4', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 7, 'CANNED BLACK BEANS 46 OZ', '2353', 1, 1,
  35.5, 35.5, 59.99, 'd5b3b4d2-55bc-5233-956e-709c294746be', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 8, 'ROMAN BEANS 46 OZ', '2390', 2, 1,
  71, 35.5, 59.99, '7b7287e2-671f-55c3-9fbd-83350e9dbc61', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 9, 'DARK RED KIDNEY BEANS 12', '2410', 1, 1,
  26.25, 26.25, 44.99, 'f0fb5fca-1ce9-5fd1-8728-4b879495f75d', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 10, 'SMALL RED BEANS 5.5 OZ', '2420', 1, 1,
  26.75, 26.75, 44.99, '53f21750-84bf-510d-b8b2-d08732518abf', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 11, 'SMALL WHITE BEANS 29 OZ', '2452', 1, 1,
  26.25, 26.25, 44.99, 'b5e394a4-c8a9-5afe-a82a-c57dbc94a9e9', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 12, 'GOYA LENTIL BEANS 15.5 O', '2456', 1, 1,
  26.75, 26.75, 44.99, 'd10b9d69-0907-5643-9368-cd0c039b409a', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 13, 'BLACK BEANS 29 OZ (1 LB', '2465', 1, 1,
  26.25, 26.25, 44.99, '4f11f46c-6f5d-5a4f-852b-3cf27a18c9ea', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 14, 'BLACK BEANS 10.5. OZ', '2469', 1, 1,
  24.95, 24.95, 41.99, '75e367ac-3270-54df-ac0a-bb0201b42851', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 15, 'SMALL RED BEANS 1 LB', '2486', 1, 1,
  33.95, 33.95, 57.99, 'd4f421dc-238a-5a23-9d09-5fdd6dc2c5e0', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 16, 'FRIJOL DE SEDA 1 LE', '2503', 1, 1,
  53.95, 53.95, 91.99, '2c8d2045-78bb-504c-b7f4-8946c372c967', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 17, 'CENTRAL AMERICAN RED BEA', '2517', 1, 1,
  53.5, 53.5, 90.99, '1a2d2a5e-b3be-5679-a9f6-6a7e60d5784f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 18, 'WHOLE KERNEL CORN 15.25', '2556', 1, 1,
  27.5, 27.5, 46.99, '53ff9590-2214-5adc-9882-f825e4a14bce', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 19, 'SLICED BEETS 15.OZ', '2569', 1, 1,
  29.5, 29.5, 49.99, 'f412eeb3-f727-5cc9-9577-44a9af6a12f9', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 20, 'SLICED CARROTS 14.5 OZ', '2573', 1, 1,
  29.5, 29.5, 49.99, '1bbfafe9-0487-59e9-b1b9-af8e2bc10a33', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 21, 'GOYA JASMINE RICE 20 LB', '2617', 1, 1,
  47.95, 47.95, 81.99, '1e835df2-de3c-5d96-8546-04a7c4911253', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 22, 'JASMINE RICE 10 LB', '2619', 1, 1,
  58.95, 58.95, 99.99, '4502fbac-c0fe-5e34-83a1-c8ec188c75af', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 23, 'CANILLA LONG GRAIN RICE', '2634', 1, 1,
  22.95, 22.95, 38.99, '0c9d40b4-6730-5a59-90c5-81c799f33dff', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 24, 'CANILLA LONG GRAIN RICE', '2637', 1, 1,
  40.35, 40.35, 68.99, '96c7ee4f-b13c-5e53-a549-4a4959d73a9f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 25, 'GUANABANA NECTAR', '2824', 1, 1,
  32.95, 32.95, 55.99, '14c62dd9-27f0-5c68-962b-f3a42323ca6d', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 26, 'LIME JUICE 12/32 FL. OZ.', '3069', 1, 12,
  31.5, 2.625, 3.99, 'b5fd6272-d9fb-5c77-9683-b0c4851d4edb', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 27, 'OVAL SARDINE TMTO SAUCE', '3613', 1, 1,
  47.95, 47.95, 81.99, '87b1d4e9-fae3-58a8-b6f4-77b08b0a3357', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 28, 'BARDINE INTO HOT-TINAPA', '50512', 1, 1,
  35.95, 35.95, 60.99, '5787a0fb-b61b-55f7-908f-25a316fc2d98', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 29, 'SAZON CENTRO/ACHTE JUMB', '37', 1, 1,
  60.8, 60.8, 102.99, '43ff9633-301e-55d7-ba46-a1be3dc3b8b7', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 30, 'SAZON CENTRO / ACHTE', '36', 1, 1,
  44.55, 44.55, 75.99, '9d5916f9-4ffb-51e6-9969-2c3c770ee93a', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 31, 'COYA ADOBO CON P-IMIENTA', 'FREC', 1, 1,
  66.5, 66.5, 112.99, '64ff620e-3f14-5820-80b8-d2328491efca', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 32, 'GOYA MONO-BOW 20/7 OZ', '200', 1, 20,
  11.95, 0.5975, 0.99, 'b410f5ae-2d43-56ee-b4b8-1b00e32d15e6', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 33, 'GOYA SODA CRACKERS 24 0', 'PQ', 1, 1,
  37.95, 37.95, 64.99, '662c1275-8eaf-5668-a2a4-00e2851c00e2', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 34, 'RIGATONI 16 OZ', null, 1, 1,
  29.5, 29.5, 49.99, '6b8e525c-76f0-50ee-897c-b5723461b97b', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 35, 'ELBOWS 16 07', null, 1, 1,
  29.5, 29.5, 49.99, '0010a701-bf06-531e-8b67-1d38778b2538', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 36, 'FIDELINT 12 DZ', null, 1, 1,
  24.85, 24.85, 41.99, '8d1935d3-1fde-5b6c-a14e-896248a5b061', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 37, 'CABELLO DE ANGEL 12 OZ', '6975', 1, 1,
  24.35, 24.35, 40.99, '37b66b68-9ea5-5717-aba9-2b984aa36c67', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 38, 'MARIA J PACK (FLOW PACK)', null, 1, 1,
  25.75, 25.75, 43.99, 'd6ea0b0b-8145-5a3e-a4fa-9ecd9326e6a7', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 39, 'LADY FINGERS 701', null, 1, 1,
  18.95, 18.95, 31.99, '5b2f7e32-fee0-524b-91cc-ebb35f624962', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 40, 'NESTLE MEDIA CREMA 7.6 0', '53:', 1, 1,
  81.5, 81.5, 138.99, '38fdf5bc-5182-5bd8-95c7-82df70c9dbbb', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 41, 'NIDO POWDERED MICK 12 69', null, 1, 1,
  51.95, 51.95, 87.99, 'd9e44836-5db7-5e1e-9ff5-713168e2b97c', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 42, 'NIDO 1+KINDER CRECIMIENT', 'E538', 1, 1,
  54.5, 54.5, 92.99, '191e1289-5ee2-5906-a574-136d7935d5ea', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 43, 'NESTUM WHEAT AND RUIT', '6502', 1, 1,
  74.5, 74.5, 126.99, '68e6a0d1-05ac-5bc6-ad66-fc14be4f41e3', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  'b793548f-27ac-5a69-9496-4e85f2c6f266', 44, 'SUYA DORADAS CRACKERS 10', '6475', 1, 1,
  19.25, 19.25, 32.99, '18b484e5-054b-5d7b-98d0-158886f38bf5', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 1, 'MORADO 6* 54 ONZ', '51838', 1, 1,
  52, 52, 87.99, '9aef2b08-b746-5b71-a22f-2544c964b132', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 2, 'MAIZ CHULPE - CHULPE CORN 6 X 54 OZ', '51845', 1, 1,
  45.97, 45.97, 77.99, '15d21fae-a067-56a2-83dc-11cf4f007a72', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 3, 'BLACK OLIVES IN BRINES (12*20 OZ)', '51940', 1, 1,
  55, 55, 93.99, '1ec64899-e05e-5995-b582-1940c4361828', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 4, 'PERU FOOD PEACH IN HALVES 12*29.10 OZ', '51426', 1, 1,
  30.68, 30.68, 51.99, '1c8a4344-0df9-5554-acca-71966d0675de', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 5, 'PERU FOO MAIZ CANCHA CARGUAY (24X150Z)', '51835', 1, 1,
  38.78, 38.78, 65.99, 'bb903095-3ffa-5fa9-8bdb-8e4f96f39c37', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 6, 'PERU TRIGO PELADO-PEELED WHEAT (24*15 OZ)', '51969', 1, 1,
  36.73, 36.73, 61.99, '49422f62-bc7e-50a2-b4d9-71af5dcd7f63', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 7, 'PERU SEMOLA - SEMOLIN 24*15 OZ', '51974', 1, 1,
  36.93, 36.93, 62.99, '0debec5b-3eb7-54b4-b10f-40c5425e2e53', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 8, 'PERU FIDEO CHINO - CHINESE NOODLES (30*8.8 OZ)', '51996', 1, 1,
  39.99, 39.99, 67.99, 'e9ca588c-aefe-5b59-a90f-60991826c926', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 9, 'GLORIA EVAPORATED MILK (24*12FL OZ)', '51049A', 5, 1,
  150, 30, 50.99, '3dcbc2fb-45f9-54f3-af8b-4e3cc2614d70', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 10, 'FRESA GELATINA - STRAWBERRY JELLY (12*5.30Z)', '51227', 1, 1,
  20.27, 20.27, 33.99, 'b739c94e-c9cf-5027-92ed-c3db8355430a', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 11, 'PERU FOOD GROUND BLACK PEPPER // PIMIENTA (24*1.5', '51631A', 1, 1,
  39.73, 39.73, 67.99, '95192971-51b9-5f76-ad4a-678e4d59d0b3', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 12, 'PERU SIYAU KIKKO-SOY SAUCE 30*500 ML', '51998', 1, 1,
  34.68, 34.68, 58.99, '8b0ce425-5350-5da9-b5c0-05e3053a003a', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 13, 'PERU FOOD CANELA Y CLAVO (24*1.15 OZ)', '51822', 1, 1,
  25.49, 25.49, 42.99, '31d3ae2c-16ea-556d-b49a-724663843512', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 14, 'ROCOTO PASTA-RED HOT PEPPER PASTE (12*15.00 OZ)', '51871', 1, 1,
  35.53, 35.53, 59.99, '215fca5f-85a7-597c-b69c-500c4ca56ece', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '9ef470c4-d0eb-5106-9472-af05722d3a8a', 15, 'MILD PANCA PEPPER // AJI PANCA POCO PIQUE 12*15 OZ', '51876', 1, 1,
  38.07, 38.07, 64.99, '74b6758f-7d17-5d98-8001-d562dc019282', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 1, 'INCA''S FOOD Haba Frita 24x4oz (113g) - Salty Fried Fava Beans', 'I-041', 1, 1,
  32.4, 32.4, 54.99, 'cd79d9cd-e11c-5606-b8fd-17bf1d994082', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 2, 'INCA''S FOOD Aji Panca Especial Pasta 24x7.5oz (212.6g) - Panca Pepper Paste NOT SPICY', 'I-7662', 1, 1,
  44.4, 44.4, 74.99, 'd2354633-b319-5d08-ad68-b3aa83055d4f', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 3, 'INCA''S FOOD Aji Panca Especial Pasta Etiqueta Negra 12x15oz (425g) - Panca Pepper Paste Special Black Label', 'I-7478', 1, 1,
  35.88, 35.88, 60.99, 'f6dbaad2-c330-53e5-9d16-a58654d0544a', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 4, 'INCA''S FOOD Aji Amarillo Especial Pasta Etiqueta Negra 12x15oz (425g) - Yellow Hot Pepper Paste Special Black Label', 'I-7479', 1, 1,
  51.48, 51.48, 87.99, '7bdf7d9f-5241-584f-a0a3-d0975986729b', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 5, 'INCA''S FOOD Aderezo Adobo de Cerdo Etiqueta Negra 12x15oz (425g) - Pork Adobo Marinade', 'I-237', 1, 1,
  39.48, 39.48, 66.99, 'a00a0d6a-85a3-5352-bc1f-305d35922528', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 6, 'INCA''S FOOD Ajo Pasta Familiar 12x15.7oz (445g) - Garlic Paste Family Size', 'I-044', 1, 1,
  53.88, 53.88, 91.99, '9fcd8187-125a-5678-a843-7d28a8e612bb', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 7, 'INCA''S FOOD Olluco Picado Lata 12x20oz (567g) - Sliced Ollucus (Melloco) Can', 'I-7665', 1, 1,
  39, 39, 65.99, 'f354b7df-587d-527b-b867-089afa88efad', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 8, 'INCA''S FOOD Ajo Pasta 24x7.5oz (212.6g) - Garlic Paste', 'I-146', 1, 1,
  58.8, 58.8, 99.99, '4283c97d-7510-5e56-9b23-80dc0c5a986c', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 9, 'VICTORIA Galleta Casino Menta 8xPack6x1.52oz (258g) - Mint Cookies', 'CAS-543', 1, 1,
  11.92, 11.92, 19.99, '181347c4-597b-5eac-b5ac-ed2d28e83141', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 10, 'VICTORIA Galleta Casino Lucuma 8xPack6x1.52oz (258g) - Lucuma Cookies', 'CAS-567', 1, 1,
  11.92, 11.92, 19.99, '722be82c-2ab1-5870-bb32-c46a5a6175e1', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 11, 'GN Galleta Rellenita Chocolate 5xPack8x1.27oz (288g) - Chocolate Sandwich Cookies', 'GN-383', 2, 1,
  15.9, 7.95, 13.99, '7f791a30-0bf2-5556-9600-caa29c0d579b', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 12, 'GN Galleta Rellenita Coco 5xPack8x1.27oz (288g) - Coconut Sandwich Cookies', 'GN-376', 2, 1,
  15.9, 7.95, 13.99, '49f76ecb-bf37-58f0-9d09-319eb6ab7454', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 13, 'INCA''S FOOD Trigo Resbalado 24x15oz (425g) - Hulled Wheat', 'I-552', 1, 1,
  39.6, 39.6, 66.99, 'b7dd88ff-8429-5ebe-a847-ee91a7e781be', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 14, 'INCA''S FOOD Harina de Chuno 12x12oz (340g) - Chuno Flour', 'I-160', 1, 1,
  20.28, 20.28, 33.99, 'a2157e09-b9e5-588b-9d8c-27969615ccaf', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 15, 'INCA''S FOOD Trigo Pelado 24x15oz (425g) - Dried Hulled Wheat', 'I-551', 1, 1,
  42, 42, 70.99, '4b3c86da-bbeb-5dce-a0fb-541f0eea257c', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '53634c39-a38b-5d6e-89a9-64dbd8634a8a', 16, 'INCA''S FOOD Maiz Morado Familiar 8x3lb (1.36kg) - Dried Purple Corn Family Size', 'I-7174', 1, 1,
  54.32, 54.32, 91.99, '2fdc0638-165e-537a-9991-f3a4b4a96757', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '08ed68c6-f28a-5c00-9884-57d6fb0f71fd', 1, 'INCA''S FOOD Bebida Chia Maracuya 12x16fl oz (473mL) - Chia Passion Fruit Drink', 'I-7633', 1, 1,
  19.08, 19.08, 31.99, 'c63e8484-06ba-59d4-b6d7-326662dcef31', 'hub-backfill', 'backfilled');
insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (
  '08ed68c6-f28a-5c00-9884-57d6fb0f71fd', 2, 'INCA''S FOOD Bebida Chicha de Jora 12x16fl oz (473mL) - Corn Jora Drink', 'I-919', 1, 1,
  16.2, 16.2, 27.99, 'a48027d6-3620-580e-99d3-3e8ab252bafe', 'hub-backfill', 'backfilled');

-- ── Price history derived from repeat purchases ────────────────────────────
-- One immutable row per observed cost/retail move. source_key makes the
-- backfill re-runnable without ever rewriting a history row.
insert into public.pricing_price_history (source_key, product_id, previous_unit_cost, new_unit_cost, previous_retail_price, new_retail_price, retail_multiplier, changed_at) values (
  'hub-backfill:102->212', '88b496bc-9145-5dc8-bc1d-e9ab0defe5ca', 3.8292, 3.8292, 6.99, 6.99,
  1.7, '2026-08-19')
  on conflict (source_key) where source_key is not null do nothing;
insert into public.pricing_price_history (source_key, product_id, previous_unit_cost, new_unit_cost, previous_retail_price, new_retail_price, retail_multiplier, changed_at) values (
  'hub-backfill:103->211', '514ea94e-7033-5a35-b7e9-f43e076d96a9', 7.6583, 7.6583, 12.99, 12.99,
  1.7, '2026-08-19')
  on conflict (source_key) where source_key is not null do nothing;
insert into public.pricing_price_history (source_key, product_id, previous_unit_cost, new_unit_cost, previous_retail_price, new_retail_price, retail_multiplier, changed_at) values (
  'hub-backfill:111->179', '0ad4bb76-c757-5405-b431-e24eacd1a943', 1.3229, 1.3229, 1.99, 1.99,
  1.7, '2026-08-19')
  on conflict (source_key) where source_key is not null do nothing;
insert into public.pricing_price_history (source_key, product_id, previous_unit_cost, new_unit_cost, previous_retail_price, new_retail_price, retail_multiplier, changed_at) values (
  'hub-backfill:112->185', '8bc32381-a21a-5202-9032-d019a56d214d', 5.2208, 5.2208, 8.99, 8.99,
  1.7, '2026-08-19')
  on conflict (source_key) where source_key is not null do nothing;
insert into public.pricing_price_history (source_key, product_id, previous_unit_cost, new_unit_cost, previous_retail_price, new_retail_price, retail_multiplier, changed_at) values (
  'hub-backfill:125->184', 'c15523c1-0689-57cf-9b0a-bc1d3e20a929', 2.465, 2.465, 3.99, 3.99,
  1.7, '2026-08-19')
  on conflict (source_key) where source_key is not null do nothing;
insert into public.pricing_price_history (source_key, product_id, previous_unit_cost, new_unit_cost, previous_retail_price, new_retail_price, retail_multiplier, changed_at) values (
  'hub-backfill:130->198', '26459064-7905-5ce9-92e2-7c41381cdeae', 1.0396, 1.0396, 1.99, 1.99,
  1.7, '2026-08-19')
  on conflict (source_key) where source_key is not null do nothing;
insert into public.pricing_price_history (source_key, product_id, previous_unit_cost, new_unit_cost, previous_retail_price, new_retail_price, retail_multiplier, changed_at) values (
  'hub-backfill:143->202', '611df487-0edd-567a-938e-fd8274e9cff6', 2.5292, 2.5292, 3.99, 3.99,
  1.7, '2026-08-19')
  on conflict (source_key) where source_key is not null do nothing;
insert into public.pricing_price_history (source_key, product_id, previous_unit_cost, new_unit_cost, previous_retail_price, new_retail_price, retail_multiplier, changed_at) values (
  'hub-backfill:147->200', '6828de1b-000b-54c5-bce5-778716d7dbe3', 2.3292, 2.3292, 3.99, 3.99,
  1.7, '2026-08-19')
  on conflict (source_key) where source_key is not null do nothing;
insert into public.pricing_price_history (source_key, product_id, previous_unit_cost, new_unit_cost, previous_retail_price, new_retail_price, retail_multiplier, changed_at) values (
  'hub-backfill:152->183', 'e898fc13-9a3b-5982-8187-16d8bcbd7a63', 4.7975, 4.7975, 7.99, 7.99,
  1.7, '2026-08-19')
  on conflict (source_key) where source_key is not null do nothing;
insert into public.pricing_price_history (source_key, product_id, previous_unit_cost, new_unit_cost, previous_retail_price, new_retail_price, retail_multiplier, changed_at) values (
  'hub-backfill:154->180', '941eabc2-9a01-518c-b1c2-92586a8a584d', 1.949, 1.949, 2.99, 2.99,
  1.7, '2026-08-19')
  on conflict (source_key) where source_key is not null do nothing;
insert into public.pricing_price_history (source_key, product_id, previous_unit_cost, new_unit_cost, previous_retail_price, new_retail_price, retail_multiplier, changed_at) values (
  'hub-backfill:157->181', 'b6188181-497d-5b86-913d-2d17898d01b2', 2.3656, 2.0615, 3.99, 3.99,
  1.7, '2026-08-19')
  on conflict (source_key) where source_key is not null do nothing;

commit;
