# Pricing Hub Phase D — production handoff

Date: 2026-08-21 ET  
Branch: `feat/pricing-hub-phase-d-prod-hardening`

## Owner decision
The binding Anthony's pricing rule is **70% markup / cost × 1.70**, using the existing `.99` shelf rounding convention. This is not a preview-only preference; server/database authority must remain aligned to the same rule.

## Live state verified before Phase D
- Supabase project `anthony-supermarket` (`cbpdiiyzzmbavsymjysb`) is healthy.
- Pricing Hub A–C migrations were already applied despite stale handoff notes.
- Hub ledger: 294 rows; canonical active catalog: 283 products.
- 21 pricing invoices / 331 lines / 11 price-history transitions.
- 11,222 POS sales rows; 525 linked to products (4.68%) before Phase D alias enrichment.
- 93 of 283 active products currently carry UPCs.

## Production changes made
### Security hardening
Migration `20260822002824_pricing_hub_production_security_hardening`:
- removed one-row scratch table `public._hermes_test`;
- pinned `pricing_block_history_mutation()` search path.

### Phase D integration foundation
Migration `20260822003315_phase_d_inventory_and_pos_aliases`:
- inventory count sessions, count lines and current balances;
- manager-approved exact POS aliases;
- atomic count completion RPC;
- exact alias registration/backfill RPC;
- future POS alias trigger that refuses conflicting evidence;
- unmatched POS summary RPC;
- RLS/revoked client privileges; service-role-only data plane.

### Edge Functions
- `pricing-catalog` v1 ACTIVE, `verify_jwt=true`: read-only approved sellable catalog fields; no cost/vendor/invoice internals.
- `pricing-integrations` v1 ACTIVE, `verify_jwt=true`: manager/admin-only inventory + alias operations, role checked from protected `app_metadata`.

## Verification
A rollback-only production transaction verified:
1. create count session;
2. save count line;
3. complete count and update balance;
4. register exact alias;
5. insert future POS row;
6. trigger maps it to the approved product;
7. transaction rolls back, leaving no test data.

A deterministic historical-match audit found **0 additional rows** eligible for automatic unique exact UPC/name backfill. Do not inflate coverage with fuzzy mappings.

Top unmatched revenue includes broad POS buttons (`GENERAL FOOD`, `PRODUCE`, `MEAT/FISH`) that cannot safely map to one product. Other high-value unmatched rows are real UPC SKUs that need catalog enrichment or explicit manager aliasing.

## External integration boundary
NRS publicly advertises real-time inventory integrations for its own ecommerce/delivery partners, but no supported public merchant/developer API was verified for Anthony's direct ingestion. Keep CSV as the supported NRS path until a documented API/credential contract exists.

Plaid/bank feeds were not activated: they require a separate explicit financial-account connection and scoped approval.

Kingdom OS has not yet been ported from the embedded-array/file mirror. Preserve the file compatibility contract until that consumer is migrated and tested.

## Remaining security note
Supabase security advisor no longer reports the exposed scratch table or mutable search-path issue. Leaked-password protection remains disabled and should be considered for Auth hardening.

## Next safe actions
1. PR review/CI and merge the tracked migration/function source.
2. Manager UI for inventory counts and POS alias review.
3. Prioritize UPC/catalog enrichment by unmatched revenue.
4. Wire SuperApp read-only consumption of `pricing-catalog` and smoke test.
5. Port Kingdom OS read path and verify parity before retiring the file mirror.
6. Verify the actual web/server deployment path separately; connector Vercel listing did not prove it.
