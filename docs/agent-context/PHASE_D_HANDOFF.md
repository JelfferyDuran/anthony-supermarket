# Pricing Hub Phase D — PR Handoff

Date: 2026-08-21 ET

This branch reconciles source control with live Pricing Hub Phase D infrastructure. **The Supabase migrations and Edge Functions in this branch are already active in production. Do not treat merge as a fresh production cutover.**

## Owner rule
Retail price = base cost × **1.70** (70% markup), using the established `.99` shelf rounding convention. Server/database authority wins.

## Live production changes represented here
- `20260822002824_pricing_hub_production_security_hardening.sql`
- `20260822003315_phase_d_inventory_and_pos_aliases.sql`
- `pricing-catalog` Edge Function v1, ACTIVE, `verify_jwt=true`
- `pricing-integrations` Edge Function v1, ACTIVE, `verify_jwt=true`

## Verification performed
- Both migrations were applied successfully to production Supabase.
- Rollback-only smoke transaction verified inventory count completion, exact POS alias registration and automatic future-sale alias mapping; no test data was retained.
- Supabase security advisor no longer reports the previous exposed `_hermes_test` table or mutable search path issue.
- New inventory/alias tables retain intentional RLS deny-by-default posture.
- Deterministic historical POS audit found zero additional unique exact UPC/name matches eligible for automatic backfill; remaining rows require catalog enrichment or explicit manager alias decisions.

## Not yet verified / not included
- No fuzzy POS backfill.
- NRS direct merchant API was not implemented because no supported public developer API was verified; CSV remains the supported source.
- Plaid/bank feeds are not connected.
- Kingdom OS has not yet been ported from the file mirror.
- The current manual Vercel web/server deployment was not proven through the connected Vercel listing.
- Edge Functions are deployed/compiled and ACTIVE, but a real browser HTTP smoke with owner manager credentials is still an acceptance step.

## Next safe action after merge
Build the manager-facing Inventory + POS Alias review UI, enrich UPC coverage by unmatched revenue, then wire SuperApp to the read-only catalog function and port Kingdom OS after parity testing.
