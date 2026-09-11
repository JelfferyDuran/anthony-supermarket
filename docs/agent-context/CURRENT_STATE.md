# Current State — Anthony's Supermarket

Last updated: 2026-09-05 (growth audit added; prior backend observations retain their original dates)

This file is operational context, not a secret store. **Live infrastructure is authoritative.** Verify live state before consequential actions.

## 2026-09-05 storefront growth review — not deployed
- Owner requested research, documented conversion architecture, modern accessible depth, and planning before production deployment.
- Review pack: `docs/growth/CONVERSION_PLAN.md`; bilingual concept: `docs/growth/concept.html`; evidence/verification: `docs/growth/README.md` and `EVIDENCE.md`.
- Current main was inspected at `dfb38b633f8116270d833997f3eaee882dfe363c` through the authenticated GitHub connector. Historical local worktrees and earlier #28/#29 handoffs are not current architecture authority.
- Live `anthony-supermarket.vercel.app` and the Super Kitchen URL returned HTTP 200. In the browser, the root site failed WebGL initialization and remained on its loading overlay with an empty menu. A scoped patch removes the blocking overlay, defers/isolate-catches decoration, preserves readable sections, and restores zoom. This is proposed code, not a live fix.
- The legacy `www.anthonyssupermarket.com` visibly lists all seven days Closed. Vercel says Open Daily but also Sunday CLOSED. Correct store/kitchen/holiday hours and canonical domain ownership require owner verification; none were guessed or changed.
- Current root source still exposes the Pricing Hub/cost-profit UI. Root Vercel output and Pages artifact settings use the repository root. Public-only packaging and selective reconciliation of #28 remain P0 release gates; no claim that all source/data paths were tested publicly.
- GitHub metadata currently reports a private repository and Pages disabled. Connected Vercel team reports Hobby and no projects; actual production project settings, billing owner, rollout/rollback ID, and Cloudflare DNS remain unverified.
- #28 is open/non-draft; #29 remains draft on the older kitchen branch. #33 offers CSS 3D sales work; #30 readiness remediation, #41 pricing integration, and #46 continuity also need reconciliation. Do not merge old stacks over newer Pricing Hub/manager code blindly.
- Research recommends HTML-first isolated storefront output, retained React/Vite kitchen and Supabase authority, browser/guest ordering with optional Telegram, approved retail-only data, and Insights that distinguish clicks, accepted/fulfilled orders, and settled sales.
- No database migration, production order, DNS change, hosting purchase, or production promotion occurred. Test invoices were not used or published.
- Next safe action: review the draft growth pack and resilience patch; verify canonical hours/domain and public build boundary before promoting any new storefront. Continue the existing order lifecycle validation separately.

## Repository
- Canonical repo: `JelfferyDuran/anthony-supermarket`
- Default branch: `main`
- Repository root is also the shared Obsidian vault.
- Human/agent working brain: `brain/`
- Customer/KDS code: `apps/superkitchen`
- Pricing Hub app: `apps/pricing-hub/index.html`; root iframe copy: `pricing-hub/index.html`
- Supabase code/migrations/functions: `supabase/`
- Isolated Telegram bot v2 runtime: `server/bot-v2/`
- Active Pricing Hub Phase D branch: `feat/pricing-hub-phase-d-prod-hardening`.

## Shared Obsidian brain
- Open the repository root directly as the Obsidian vault; do not create a second writable mirror.
- `brain/` is the human/agent working-memory layer; `docs/agent-context/` is the canonical operational handoff layer.
- GitHub provides history, review, collaboration and rollback.
- Local `.obsidian/` state is ignored and must not be committed.
- If a note conflicts with live infrastructure, verify live state and correct the note.

## Business pricing rule — binding
- **Retail = Base Cost × 1.70 (70% markup).**
- Multi-pack: calculate cost per sellable unit first, then retail per unit.
- Shelf-price convention uses the existing `.99` rounding rule.
- Server/database authority wins over browser calculations.
- If pack size, cost, product identity or invoice math is ambiguous, stop for human review rather than guess.

## Supabase production baseline
- Project ref: `cbpdiiyzzmbavsymjysb`
- Project name: `anthony-supermarket`
- Region: `us-east-1`
- Live status verified 2026-08-21: `ACTIVE_HEALTHY`.
- Customer/order Edge Function: `superkitchen`.
- Read-only machine observer: `superkitchen-ops`, `verify_jwt=true`.
- Direct anonymous database access remains deny-by-default through RLS/revoked grants.
- Service-role credentials must stay only in trusted server/Edge Function environments.

## Public website / Super Kitchen
- Public website: `https://anthony-supermarket.vercel.app`; historically deployed manually from the repo root.
- Customer miniapp: `https://anthony-supermarket-superkitchen.vercel.app`.
- Customer/KDS authorization and order-state protections remain separate from Pricing Hub authority.
- Do not infer the main-site/server deployment from the connected Vercel account: the connector available during the 2026-08-21 audit listed the `Kingdom Noel` team but no projects, so current Vercel runtime state still needs a direct deployment/smoke verification before being marked verified.

## Pricing Hub v2 — A–C are live
The old handoff text saying the Pricing Hub migrations are "not applied" is stale.

### Live production migrations verified 2026-08-21
- `20260812013000_add_invoice_pricing_pipeline`
- `20260819213000_reconcile_pricing_hub_dataset`
- `20260819230000_add_pos_sales_and_financials`
- `20260819234500_add_intake_channel_provenance`
- `20260822002824_pricing_hub_production_security_hardening`
- `20260822003315_phase_d_inventory_and_pos_aliases`

### Live Pricing Hub data snapshot observed 2026-08-21
- Embedded Hub ledger: **294 rows**.
- Canonical active Supabase catalog: **283 products**. Repeated vendor SKU purchases collapse into one product rather than becoming duplicate products.
- Pricing vendors: **10**.
- Pricing invoices: **21**.
- Invoice lines: **331**.
- Immutable price-history transitions: **11**.
- Invoice statuses observed: **17 backfilled · 3 needs_review · 1 uploaded**.
- Active products carrying UPCs: **93 / 283**.

### Pricing Hub behavior
- Hub reads live approved data through the server when authenticated, with embedded arrays retained as the offline/first-render fallback and Kingdom OS compatibility mirror.
- Retail edits remain server-authoritative and attributable to a manager/admin identity.
- Invoice uploads are evidence, never approval. OCR/extraction and manager approval remain separate gates.
- Invoice scans remain in the private `pricing-invoices` Storage bucket and are exposed to the review UI only through short-lived signed URLs.
- Hub/Telegram/WhatsApp intake uses one controlled pipeline and per-channel authorization; chat identities cannot approve prices.

## POS sales + financials — live but match coverage is limited
- Real NRS-derived POS data is now present in production, so the older note saying the parser has only seen fixtures is stale.
- Observed 2026-08-21: **36 import batches**, periods 2026-07-15 through 2026-08-19; `pos_sales` contains **11,222 stored rows** dated 2026-07-17 through 2026-08-19.
- Current linked rows before Phase D alias enrichment: **525 / 11,222 = 4.68%**.
- A deterministic re-check found **0 additional historical rows** eligible for an exact unique UPC or exact unique product-name backfill. The existing matcher had already consumed all such evidence.
- Highest-value unmatched rows include generic POS departments/buttons such as `GENERAL FOOD`, `PRODUCE`, `MEAT/FISH`, and `BISTEC/STEAK`; these must NOT be forced onto a single catalog product.
- Other unmatched rows are real UPC products (for example formula/dairy/grocery SKUs) whose UPC/product identity is not yet represented in the Pricing Hub catalog. Resolve those by enriching the catalog or by manager-approved aliases.
- `costed_revenue_share` must remain visible beside margin figures. Until match coverage improves, gross-profit/margin is a floor/partial-cost view, not a fully costed fact.

## Phase D — integration foundation live
Phase D started 2026-08-21 after verifying A–C production state.

### Safe catalog API
- Edge Function: `pricing-catalog` version 1, `ACTIVE`, `verify_jwt=true`.
- Source tracked at `supabase/functions/pricing-catalog/index.ts`.
- GET-only output intentionally exposes only approved sellable identity/retail fields: `id`, `upc`, `name`, `category`, `department`, `retailPrice`, `updatedAt`.
- It does **not** expose unit cost, vendor invoice data, internal flags, service-role credentials, or pricing mutations.
- This is the Phase D catalog surface intended for customer/SuperApp consumers after client integration is tested.

### Manager integration API
- Edge Function: `pricing-integrations` version 1, `ACTIVE`, `verify_jwt=true`.
- Source tracked at `supabase/functions/pricing-integrations/index.ts`.
- Human authorization is re-checked from protected `app_metadata`; only `manager` and `admin` may use it.
- GET resources: inventory balances, count sessions, safe product lookup, approved POS aliases, unmatched POS summary.
- POST actions: start/save/complete/cancel inventory counts and register an exact POS alias.
- Service-role access stays inside the Edge Function; clients receive no service-role credential.

### Inventory data model
- `inventory_count_sessions`: draft/completed/cancelled count sessions with human attribution.
- `inventory_count_lines`: one non-negative count per product/session.
- `inventory_balances`: current on-hand balance derived from a completed count session.
- `inventory_complete_count(...)`: atomic server-only completion RPC; refuses empty/non-draft sessions.

### POS alias model
- `pos_product_aliases`: manager-approved exact UPC and/or normalized-name mappings to canonical products.
- `pricing_register_pos_alias(...)`: refuses missing approvers, inactive products, empty evidence and aliases already owned by another product; backfills only exact previously-unmatched rows.
- `pricing_apply_pos_alias_to_sale()` trigger applies approved aliases to future imports. If UPC evidence and name evidence conflict, the row stays unmatched rather than choosing arbitrarily.
- A rollback-only production smoke test on 2026-08-21 verified inventory completion, alias registration and future-sale trigger mapping, then rolled all test data back.

## NRS integration boundary
- Current verified ingestion path remains NRS CSV exports.
- As of the 2026-08-21 check, NRS publicly advertises real-time POS/inventory integrations with its ecommerce/delivery partners, but no documented public merchant/developer API was verified for direct Anthony's ingestion.
- Do not invent or screen-scrape a private NRS API. Keep the CSV pipeline until NRS provides a supported API/credential path.

## Bank-feed boundary
- Plaid/bank feeds are still **not activated**. They introduce external financial credentials, consent and a new data boundary, so they require an explicit provider/account connection and a scoped implementation before any production bank data is ingested.
- Invoice/POS financial reporting remains usable without bank feeds.

## Kingdom OS boundary
- The embedded `VENDORS` + `ALL_ITEMS` file shape remains a compatibility contract because Kingdom OS historically parses and writes back the Pricing Hub file.
- Phase D has created the safe new data/API layer, but the Kingdom OS consumer has **not yet been ported in this branch**.
- Do not remove the embedded arrays or write-back compatibility until the OS consumer is migrated and smoke-tested against the new read-only/API path.

## Security posture verified 2026-08-21
- Production scratch table `public._hermes_test` was removed; it contained one integer test row and no production records.
- `pricing_block_history_mutation()` now has an explicit `search_path=pg_catalog, public`.
- Phase D inventory/alias tables have RLS enabled with zero client policies and direct public/anon/authenticated privileges revoked — intentional deny-by-default.
- Supabase security advisor no longer reports the previous exposed-test-table error or mutable-search-path warning.
- Remaining notable advisor warning: Supabase Auth leaked-password protection is disabled. Enabling it is recommended; do not weaken any current auth policy to do so.

## Telegram / machine observer
- Customer bot: `@Anthonysuperkitchen_bot`.
- Never reuse historically exposed bot credentials; replacement secrets live outside Git.
- `agent_observer` remains read-only and must not receive service-role credentials, human admin credentials or customer PII.
- Pricing calculator/intake machine identities remain distinct from human pricing approval identities.

## Active next actions
1. Review/merge Phase D branch after CI/review; preserve the production migration versions already applied.
2. Add manager UI in the Pricing Hub/Admin surface for inventory counts and POS alias review rather than editing mappings in SQL.
3. Enrich UPC/product coverage, prioritizing high-revenue unmatched real SKUs; leave broad department buttons unmatched unless the POS workflow is redesigned to capture item-level identity.
4. Wire the customer SuperApp to `pricing-catalog` and run an authenticated read-only smoke test before replacing any existing catalog source.
5. Port Kingdom OS from file parsing to the new read-only data/API path, then retire the file mirror only after verified parity.
6. Verify the actual production web/server deployment path and `/api/pricing` manager flow directly; the connected Vercel listing was insufficient to prove it.
7. Consider enabling Supabase leaked-password protection.
8. Plaid/bank feeds remain a later explicit connection task, not an implicit Phase D permission expansion.

## Data caution
Production contains historical operational/order/POS data. Do not bulk-delete, mass-remap, or rewrite it to make dashboards look complete. Exact evidence and human attribution take priority over coverage percentage.
