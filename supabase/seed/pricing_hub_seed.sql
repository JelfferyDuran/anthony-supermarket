-- GENERATED FILE — do not edit by hand.
-- Regenerate with: node scripts/seed-pricing-from-hub.js
--
-- Backfills the Supabase pricing schema from the embedded Pricing Hub arrays
-- in apps/pricing-hub/index.html. Ids are UUIDv5 of stable natural keys, so
-- this file is idempotent: running it twice updates rows rather than
-- duplicating them.
--
-- Source: 3 vendors · 9 invoices · 146 products · 157 invoice lines · 11 price transitions
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

-- ── Vendor SKU links (item numbers printed on the invoice) ─────────────────
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '07713', 'e505774e-01bb-5dcb-a270-d9eb4fe4530d', 8, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '07720', 'c6b02f9f-75ad-52b1-aab6-d28b3f21946c', 8, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1021', '48347134-3837-5dc3-b193-ac3be0fe0758', 2, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1023', 'e57872a3-cd65-5994-8221-4dc5d525d8a9', 8, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1024', 'c2e94303-b80b-5ca8-a126-d5526d704604', 20, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '1051', '1a697e67-b896-5254-a1e5-002590d0c25e', 12, '90747476')
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
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2001', 'db95e767-00fb-597b-8d69-6c7a672090a0', 6, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2002', '5c7e180b-c2d2-5a1e-8a3f-cbf047d67475', 6, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2098', 'e73dccf9-b4de-5053-bc83-301920b3662a', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2099', '7c4aa759-9f54-5fb7-8283-446155f8fc98', 16, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2142', '69e5b567-4dfc-5987-9188-47bae1775a6d', 12, '90747231')
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
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2407', '3fb0eb0c-48e5-5db4-b01a-6c55282338dd', 24, '90747476')
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
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2505', 'c658e5ae-58b0-5810-8822-f8b083474f8a', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2559', 'a9fdc3a3-f0cf-5fcc-8a35-3ea828d3d7de', 12, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '2626', '26459064-7905-5ce9-92e2-7c41381cdeae', 24, '90772340')
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
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '3419', 'c15523c1-0689-57cf-9b0a-bc1d3e20a929', 10, '90772340')
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
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5114', '01e9df39-24d3-5225-a808-b5a4183a923f', 30, '90747476')
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
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5414', 'c2827b27-6010-599b-a438-dd8b1e3e784c', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5441', '9cf77f7c-ce7e-56f9-b65b-c08c6ce50e10', 12, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5442', '611df487-0edd-567a-938e-fd8274e9cff6', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '5453', '704cca37-d3ed-53b9-841e-08688751a249', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7003', '6606318f-15ed-5353-947a-c324d8ad392f', 16, '90747231')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7637', '2ebbf872-6de2-579e-9ea0-00092ac0d6ca', 12, '90772340')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7640', '3fac66dd-bd01-5e88-a3ea-7ef5fc7c60fb', 20, '90772340')
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
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7713', 'fa4e7e63-9c0e-50e4-894b-c4dc0f25f0a8', 8, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '7720', 'b86768ab-d641-57e6-894e-e387d8eed6ce', 8, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '8409', 'bd5b9289-397f-5731-b9c2-50d1f6dba0b0', 48, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '8410', '375d66a2-6fcc-5d42-9cc4-1cd1aa8da030', 48, '90747476')
  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;
insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values ('f6ae192a-2fb4-52f2-9b28-c56d265eb3e8', '8714', '8bc32381-a21a-5202-9032-d019a56d214d', 36, '90772340')
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
