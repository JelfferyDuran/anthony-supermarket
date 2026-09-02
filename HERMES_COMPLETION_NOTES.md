# Pricing Hub — Current Hermes Handoff

**Status date:** 2026-08-21 ET  
**Source of truth:** live Supabase + current repo state. Do not use the superseded 2026-08-19 deployment checklist as if production were still empty.

## Binding owner rule

**Retail = Base Cost × 1.70 (70% markup)** with the established `.99` shelf rounding convention. The server/database remains authoritative. Do not reintroduce a 65% default in any collector, write-back path, bot, dashboard, or customer catalog.

## What is already live

The Pricing Hub A–C production cutover has already occurred.

Applied Supabase migrations:
- `20260812013000_add_invoice_pricing_pipeline`
- `20260819213000_reconcile_pricing_hub_dataset`
- `20260819230000_add_pos_sales_and_financials`
- `20260819234500_add_intake_channel_provenance`
- `20260822002824_pricing_hub_production_security_hardening`
- `20260822003315_phase_d_inventory_and_pos_aliases`

**Do not blindly rerun the old four-migration + seed deployment sequence.** Inspect migration state first.

Live snapshot observed 2026-08-21:
- Hub ledger: 294 embedded rows
- Canonical active products: 283
- Vendors: 10
- Pricing invoices: 21
- Invoice lines: 331
- Price-history transitions: 11
- POS sales stored: 11,222
- POS rows linked to products before Phase D alias enrichment: 525 (4.68%)
- Active products with UPC: 93 / 283
- Invoice states: 17 backfilled · 3 needs_review · 1 uploaded

## Phase D now live

### `pricing-catalog`
Supabase Edge Function version 1, `ACTIVE`, `verify_jwt=true`.

Purpose: approved read-only catalog for SuperApp/customer consumers.

Exposes only:
- id
- UPC
- name
- category / department
- approved retail price
- updated timestamp

It does **not** expose costs, vendor/invoice internals, service-role credentials, or pricing writes.

Tracked source: `supabase/functions/pricing-catalog/index.ts`.

### `pricing-integrations`
Supabase Edge Function version 1, `ACTIVE`, `verify_jwt=true`.

Only `manager` / `admin` roles from protected Supabase `app_metadata` may use it.

Capabilities:
- list inventory balances
- list/start/save/complete/cancel inventory count sessions
- inspect safe product identities
- inspect approved POS aliases
- inspect top unmatched POS names
- register a manager-approved exact UPC/name alias

Tracked source: `supabase/functions/pricing-integrations/index.ts`.

## Inventory model

Phase D added:
- `inventory_count_sessions`
- `inventory_count_lines`
- `inventory_balances`
- atomic `inventory_complete_count(...)`

Counts remain auditable and human-attributed. A completed count updates balances atomically; empty or non-draft sessions are refused.

## POS matching model

Phase D added `pos_product_aliases` plus:
- `pricing_register_pos_alias(...)`
- `pricing_apply_pos_alias_to_sale()` trigger
- `pricing_unmatched_pos_summary(...)`

Rules:
1. Alias evidence must be exact UPC and/or exact normalized name.
2. A manager/admin must approve the alias.
3. An alias already owned by another product is refused.
4. Historical backfill touches only exact currently-unmatched rows.
5. Future imports inherit approved aliases automatically.
6. If UPC and name evidence conflict, the sale stays unmatched rather than guessing.

A deterministic audit found **0 additional historical rows** that can be auto-linked by unique exact UPC/name beyond the current matcher. Do not use fuzzy matching merely to raise the percentage.

The largest unmatched revenue includes generic POS buttons such as `GENERAL FOOD`, `PRODUCE`, `MEAT/FISH` and `BISTEC/STEAK`; these are not one canonical product and must remain unresolved unless the POS workflow itself gains item-level identity. Other unmatched real UPC products should be resolved by catalog enrichment or explicit aliases.

## Production verification performed

A rollback-only production transaction verified:
1. inventory count session creation;
2. count-line save;
3. atomic count completion and balance update;
4. exact POS alias registration;
5. future POS insert automatically mapped by the alias trigger;
6. transaction rollback removed all test data.

The two Edge Functions deployed successfully and are reported ACTIVE with `verify_jwt=true`.

## Security changes

Completed:
- removed scratch table `public._hermes_test` (one integer test row, no production data);
- pinned the immutable-history trigger function's search path;
- new inventory/alias tables use RLS deny-by-default with no direct anon/authenticated grants;
- service-role access remains only inside trusted server/Edge Function code.

Supabase security advisor no longer reports the previous exposed scratch-table error or mutable-search-path warning.

Remaining advisor warning: **leaked-password protection is disabled** in Supabase Auth. Consider enabling it through the Supabase Auth security settings; do not weaken existing authentication to compensate.

## NRS boundary

Current supported ingestion remains NRS CSV exports. NRS publicly advertises real-time inventory integration in its own ecommerce/delivery ecosystem, but a documented public merchant/developer API for Anthony's direct use was not verified. Do not invent or reverse-engineer a private API.

## Bank-feed boundary

Plaid/bank feeds are not active. Connecting financial accounts creates a separate credential/consent boundary and requires explicit owner/provider setup. Do not treat Phase D approval as permission to connect bank data automatically.

## Kingdom OS boundary

The embedded `VENDORS` / `ALL_ITEMS` arrays and root Pricing Hub copy remain compatibility contracts for the current Kingdom OS collector/write-back path.

Phase D has created the replacement data/API layer, but **Kingdom OS has not yet been ported**. Preserve file compatibility until the OS consumer is migrated and parity-tested.

## Next safe work

1. Review and merge `feat/pricing-hub-phase-d-prod-hardening` after CI/review; production migrations/functions already exist, so merge is source reconciliation, not a fresh cutover.
2. Add a manager UI for inventory counts and POS alias review.
3. Enrich catalog UPC coverage by unmatched revenue, beginning with real UPC SKUs rather than generic department buttons.
4. Wire SuperApp to the read-only `pricing-catalog` function and smoke-test before replacing its current catalog source.
5. Port Kingdom OS to the new read-only API/data layer and verify parity before retiring the file mirror.
6. Verify the current web/server deployment directly; the connected Vercel listing did not prove the manual production site/server state.

For full live state see `docs/agent-context/CURRENT_STATE.md` and `brain/Sessions/2026-08-21 Pricing Hub Phase D.md`.
