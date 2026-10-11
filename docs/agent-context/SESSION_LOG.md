# Shared Agent Session Log

Append-only operational handoffs. Do not store secrets, passwords, tokens, service keys, or customer PII here.

## 2026-08-08 12:12 ET — ChatGPT
- Goal: establish one canonical repository-based knowledge/handoff layer for all authorized agents.
- Changed: added root `AGENTS.md`, `CURRENT_STATE.md`, `OPERATING_RULES.md`, and `HANDOFF_PROTOCOL.md`.
- Verified: current Super Kitchen work includes secure cutover, UI polish, and Phase 2A Kitchen Dashboard; protected staff login is working in preview; repository has permanent security/build guardrails.
- Not verified / blockers: persistent Telegram command-bot host still needs to be treated as a separate runtime and verified independently; do not infer it from Mini App availability.
- Security or rollback notes: no secrets are stored in the knowledge base; agents must use scoped credentials and PR workflows.
- PR/issue/commit: knowledge branch `agent-knowledge-base-v1`; Phase 2 epic #17; Kitchen #18; Admin #19; operations #20; KDS PR #21.
- Next safe action: merge this documentation-only knowledge layer, then configure Hermes with a repository-scoped GitHub credential and have it read `AGENTS.md` at startup.

## 2026-08-08 15:21 ET — ChatGPT
- Goal: give Hermes useful operational visibility without handing the VPS a Supabase service-role key or production mutation authority.
- Changed: created `superkitchen-ops` as a separate GET-only Edge Function, added `agent_observer` authorization, added `scripts/hermes-ops-check.mjs`, documented `HERMES_ACCESS.md`, and added permanent CI guards for JWT verification, PII exclusion, read-only behavior, and service-role exclusion from the Hermes client.
- Verified: Supabase deployed `superkitchen-ops`; later validation aligned the live function to version 2 ACTIVE with `verify_jwt=true`; CI #88 passed the observer Deno type-check and security invariants. Live `superkitchen` was reported as version 27 during the same infrastructure work.
- Security or rollback notes: customer/order function was not modified; no database schema was changed; observer endpoint contains no mutation routes and no customer PII fields. Rollback is isolated to disabling/removing `superkitchen-ops`.
- PR/issue: observer PR #23 merged into `main`; onboarding checklist #24 tracks runtime activation.
- Next safe action: provision the dedicated Hermes observer identity and run the authenticated VPS smoke test.

## 2026-08-08 22:02 ET — ChatGPT
- Goal: activate the dedicated Hermes observer identity without broadening its authority.
- Changed: no schema or application code changes. Updated only protected Auth app metadata for the dedicated machine account.
- Verified: `kingdom-hermes@agentmail.to` exists in Supabase Auth, is email-confirmed, and now has `app_metadata.role=agent_observer`.
- Not verified / blocker: Hermes has not yet demonstrated an authenticated request from the VPS because its password and publishable key still need to be configured in `/opt/data/anthony-ops.env` and `scripts/hermes-ops-check.mjs` still needs to be run there.
- Security notes: no password, publishable key, service-role key, or customer PII was written to GitHub. Hermes remains GET-only through `superkitchen-ops`; do not grant `SUPABASE_SERVICE_ROLE_KEY`.
- Next safe action: configure the observer email/password and publishable key directly on the Hermes VPS, run the smoke test, then record only the non-secret pass/fail result.

## 2026-08-09 00:07 ET — ChatGPT
- Goal: add Obsidian as the shared human/agent brain and lightweight backup workflow without creating duplicate writable knowledge stores.
- Changed: made the repository root the intended Obsidian vault, added `brain/00 - Anthony HQ.md`, Inbox/Decisions/Sessions/Attachments workspaces, updated `AGENTS.md` and the handoff protocol, ignored local `.obsidian/` state, and added Shared Brain CI guards for file types, size, obvious secrets, and canonical entry points.
- Verified: implementation is isolated to repository knowledge/workflow files; no runtime application, database, pricing, auth, or customer-order behavior was changed.
- Not verified / blocker: Obsidian itself has not yet been opened against the repo on the Hermes VPS/desktop; local UI/plugin state remains intentionally outside Git.
- Security or rollback notes: no credentials or customer PII belong in the vault; brain attachments are limited to approved lightweight formats under 2 MB; live infrastructure remains authoritative over notes.
- Branch: `obsidian-brain-node-v1`.
- Next safe action: run Brain CI, merge if green, then have Hermes pull `main` and open/use the repository root as its Obsidian vault.

## 2026-08-09 20:30 ET — Hermes
- Goal: upgrade the public storefront website (owner request, option 1) without breaking the bilingual single-file app.
- Changed: root `index.html` gained a Shop-by-Department section (4 photo cards using new `assets/depts/*.webp` images), a Weekly Specials section computed from the embedded catalog (`SPECIALS`, `findCatalogItem()`, `renderSpecials()` — no hardcoded prices), nav links for both sections, an embedded Google Map in Visit Us, and a scroll-spy update. Also fixed a latent init bug: `setLang(sl)` ran before `filterTags` was defined, which threw and left the page stuck on the loading overlay for returning visitors with a saved language; the saved-language restore now runs after init.
- Verified: `node --check` on extracted JS passes; browser regression confirms 6 special cards with real catalog prices, EN/ES toggle translates all new sections, department cards switch menu tabs, map iframe loads, all 4 WebP images load, no JS console errors.
- Not verified / blockers: not yet merged or deployed; final visual brightness of department photos is AI-generated imagery (not real store photos); the observer smoke test remains blocked on the missing VPS password/publishable key.
- Security or rollback notes: no secrets, service-role keys, or customer PII added; images are local WebP assets; rollback is a revert of this branch.
- Branch: `website-v5-departments-specials`.
- Next safe action: review and merge the PR, confirm GH Pages deploy, then continue Phase 2A kitchen dashboard (PR #21) per owner sequencing.

- 2026-08-10: Added NRS POS daily sales intelligence pipeline (`nrs/`). Analyzer (nrs-analyze.py) reads NRS portal CSV exports from nrs/inbox/, computes daily KPIs + leak flags (voids/refunds/no-sales/discounts/cashier stats/trend anomalies), appends to nrs/data/daily_history.json, writes briefing to nrs/reports/. Daily Hermes cron "Anthony's NRS Daily Sales Report" (07:30 ET) attempts browser fetch of mystore.nrsplus.com CSV Download report, falls back to manual inbox drop. Creds go in nrs/.env (NRS_USER/NRS_PASS, gitignored).

## 2026-08-12 00:40 ET — Hermes
- Goal: deliver a "fully developed sales page" for the Pasta Night campaign (owner request).
- Changed: new standalone `sales.html` (repo root, committed on `promo-2026-08-pasta-night` since it depends on the campaign poster assets in `assets/promos/2026-08-pasta-night/`). Full bilingual (EN/ES) single-page sales experience: sticky brand bar + lang toggle, PASTA NIGHT hero with ANY 2 FOR $4 deal box + ~28% save chip, red FOMO banner (no dates), interactive Three.js 3D showcase of all 7 Rummo shapes (drag/tap spin, hover glow, click-to-select info panel with packaging facts, "2 FOR $4" price, Get Directions CTA), 3-step how-it-works, pair-it chips (Ragu/Prego/Hunt's/Victoria/Goya), 3 recipe cards, EN/ES poster display that swaps per language, store footer. Prices are NOT invented: only the confirmed 2-for-$4 deal and packaging facts.
- Verified: `node --check` passes; browser regression — 3D wrap unhidden (WebGL OK), auto-select Penne Rigate panel, ES toggle switches hero/hint/price/desc/poster image, EN restore works, ZERO console errors, no rendering glitches.
- Not verified: not yet merged/deployed (no PR capability with embedded PAT — owner merges; Pages auto-deploys; page will be live at /sales.html after promo branch merge).
- Security/rollback: no secrets/PII; no iframes (map is a link — avoids load hangs); rollback = revert branch.
- Branch: `promo-2026-08-pasta-night` (contains sales.html + poster assets).
- Next safe action: owner reviews/merges promo branch; optionally wire a nav link to sales.html from index.html on the site branch after merge.

## 2026-08-12 01:50 ET — Hermes
- Goal: create a v2 upgrade spec for the sales page so Claude Code/Codex can enhance it with full capabilities (owner request), including replacing Three.js for better mobile/multi-screen UI.
- Changed: new `docs/agent-context/SALES_PAGE_V2_UPGRADE.md` — full handoff spec: repo rules, v1 inventory, v2 mission, feature checklist (mobile-first composition, bottom-sheet info panel, DOM-text cards, real product photos, JSON-driven weekly config, share buttons, accessibility, performance gates), rendering-tech decision matrix (recommends Swiper/CSS-3D DOM carousel over Three.js r128; keeps Three.js only as optional lazy-loaded ambient), quality gates (node --check, 4 viewport widths, Lighthouse ≥85, WebGL fallback), acceptance criteria, reference material. GitHub issue #31 created to track it. CURRENT_STATE.md updated.
- Verified: spec written + linked; issue #31 created (https://github.com/JelfferyDuran/anthony-supermarket/issues/31).
- Not verified: no code changed on the live page (v1 stays live until v2 PR merges).
- Branch: committed directly to main (docs-only change, owner approved direct pushes this session).
- Next safe action: hand the spec to Claude Code/Codex (it has owner-authorized repo access) or implement v2 on a `sales-v2-upgrade` branch; also consider merging `site-3d-specials` into main (owner pending decision).

## 2026-08-13 — Hermes (Invoice Grabber)
- Goal: grab Hershey's Ice Cream delivery invoice (scan sent via Telegram) into the Pricing Hub calculator.
- Changed: `apps/pricing-hub/index.html` — added vendor "Hershey's Ice Cream" + invoice INVE0023460478 (8/13/26) to VENDORS; appended 12 items to ALL_ITEMS (11 sellable SKUs: 4 scrounds, 3 pints, Twix bar, 2 cups, NP mini sandwich; 1 internal "Delivery Fee" $5 so Total Paid = $234.42). costPerUnit from invoice pack math; retail = hub 65% default. Verified invoice math line-by-line (4×14.49 + 3×17.52 + 52.90 + 2×21.96 + 22.08 + 5.00 = 234.42 ✓). Handwritten note on invoice: 234.42 − 5.00 = 229.42 (delivery-fee deduction — owner to confirm policy).
- Verified: new `scripts/verify-pricing-hub.js` harness loads the real script with DOM stubs — 29 checks PASS (vendor, invoice, 105 items total, unique ids, per-SKU cost/retail/units, calcRetail). Hub math @65%: revenue $400.74, profit $171.32, margin 42.8%, ROI 73%.
- Not verified: shelf prices are 65%-default estimates — owner should confirm real shelf tags before POS. Raw scan archived in Obsidian vault 03_INVOICES (RAW/PROCESSED + audit) — NOT committed here (repo root deploys to Pages).
- Branch: direct main push (invoice data entry, same cadence as prior invoice batches).
- Next safe action: next invoice scan → same grab flow; optionally point site iframe at `apps/pricing-hub/` (root `pricing-hub/` is a stale demo with "coming soon" buttons).

## 2026-08-15 — Hermes — Bodeguetto Content Engine: brain note + remote cleanup
- Goal: link the Anthony's brain to the new Bodeguetto content pipeline; remove the embedded PAT from this repo's git remote.
- Changed: new `brain/Projects/Bodeguetto Content Engine.md` (lightweight pointer — no code duplicated); CURRENT_STATE workstream bullet; git origin URL cleaned (gh credential helper now authenticates; verified `git ls-remote` OK).
- Verified: content engine Phase 1 acceptance passed (signal "Se acabó la Malta hoy." → HYBRID job → capture mission → NEEDS_FOOTAGE, $0.00); smoke-test ALL PASSED (24 unit + Phase 0 + Phase 1 + MCP protocol).
- Not verified / blockers: remote repo `JelfferyDuran/bodeguetto-content-engine` not yet created (PAT lacks repo-create, 403); no publishing performed.
- Security or rollback notes: no secrets/PII added; old embedded PAT should be revoked/rotated by owner (was exposed in tool output); rollback = revert this branch.
- PR/issue/commit: branch `feat/bodeguetto-brain-note`.
- Next safe action: owner creates the repo (PRIVATE) → push content engine + PRs; Phase 2 (Postiz real publish) only after owner confirmation.

## 2026-08-17 — Hermes — Site v2 upgrade + staff admin portal
- Goal: audit for bugs, ship clean all-device website, IG links hub, standalone Telegram miniapp, admin dashboard (kitchen + store).
- Changed: BUGFIX — pricing-hub iframe 404 (root `pricing-hub/` was stale demo; synced canonical `apps/pricing-hub/index.html` into it, added root `vercel.json` static output, redeployed) + reveal-animation fallback (reduced-motion/IO/timeout) + policies index page (anthony-policies.vercel.app/ now 200). SITE V2 — mobile hamburger drawer nav, Order-on-Telegram CTAs (nav+hero), mobile CSS (dvh/safe-area/44px touch), scroll-padding; sales.html rebuilt per issue #31 (Three.js removed → CSS scroll-snap rack + `data/sale.json`); new `links.html` (bilingual IG links hub, deployed). MINIAPP — verified standalone at anthony-supermarket-superkitchen.vercel.app; added `apps/superkitchen/vercel.json` (deterministic build); STAFF PORTAL (`?staff=1`): Supabase Auth login, kitchen lanes (recibido/preparando/listo/completado/cancelado, 20s poll, audited transitions) + store overview (ops summary: 24h gross, by-status, pickup/delivery, recent orders, transitions) — role-gated (kitchen vs manager/admin). Vercel env (VITE_SUPABASE_URL/ANON_KEY) set for prod+preview.
- Verified: main site + sales v2 + links hub live (browser-tested: EN/ES, console clean, rack images 0 failed, iframe pricing data renders); staff portal login renders live; customer miniapp unaffected; `node --check` on inline JS; admin build clean (87 modules).
- Not verified / blockers: staff login + kitchen/store live data need owner's staff credentials (provisioned user password is outside repo); `MINIAPP_URL` const in live `superkitchen` edge fn still points at dead GitHub Pages (needs careful function redeploy after live-source diff — deferred); main-site Vercel project still manual-deploy (recommend git-link).
- Security or rollback notes: anon key (public publishable) set via Vercel env + local `.env.local` (gitignored); no secrets committed; staff session persisted only in browser localStorage; rollback = revert branches.
- PR/issue/commit: branches `fix/site-hotfix-2026-08` (5e415d6) + `feat/site-v2-responsive` (ae0a541) — PRs opened. Issues: #31 sales v2 DONE.
- Next safe action: owner smoke-tests staff portal with staff credentials; decide on MINIAPP_URL function redeploy + git-linking main site.

## 2026-08-19 — Hermes (Invoice Grabber)
- Goal: grab the Family Food Distributors invoice bundle (5-page PDF via Telegram) into the Pricing Hub calculator.
- Changed: `apps/pricing-hub/index.html` — added vendor "Family Food Distributors" + 3 invoices to VENDORS (90772340 $2,162.69, 90772444 $432.25, 90772312 $0.00); appended 52 items to ALL_ITEMS (ids 170–221; 51 sellable SKUs with vendor item numbers, 1 internal no-charge Florida Tuna 3pk @ $0). costPerUnit from invoice pack math (first number = sellable units/case); retail = hub 65% default. Verified invoice math programmatically (A: 46 cases $2,162.69 ✓, B: 11 cases $432.25 ✓, C: 1 case $0.00 ✓; bundle $2,594.94). Vendor policy note: 3% surcharge on cards, Zelle preferred, NET21 terms.
- Verified: `scripts/verify-pricing-hub.js` extended with FFD assertions — ALL CHECKS PASSED (vendor + 3 invoices, 157 items, unique ids, per-SKU cpu/retail, no-charge internal, itemNo coverage). FFD hub math @65%: revenue $4,203.56, profit $1,608.62, margin 38.3%.
- Not verified: shelf prices are 65%-default estimates — owner should confirm real shelf tags. "Mama Tere Leniejon" (item 2626) name unverifiable — exception logged. Raw scans archived in Obsidian vault 03_INVOICES (RAW/PROCESSED + audit + baseline) — NOT committed here (repo root deploys to Pages).
- Branch: direct main push (invoice data entry, same cadence as prior invoice batches).
- Next safe action: confirm Leniejon shelf name + the $0.00 tuna invoice (replacement/credit?) with the vendor; then confirm shelf prices for the 51 new SKUs.

## 2026-08-19 — Hermes (Invoice Grabber follow-up — owner answers)
- Goal: apply owner answers — "Mamá Tere refund for expired goods", use Pricing Hub formula for the sales sheet, reference prices from other hub invoices.
- Changed: `apps/pricing-hub/index.html` — (1) merged legacy vendor key "Family Food" (2 prior invoices 90747231 + 90747476, 6/24/26, 57 items) into "Family Food Distributors" → single vendor, 5 invoices, 109 items; (2) id 198 renamed "Mama Tere Leniejon" → "Mama Tere Lentejon" (prior invoice spells it Lentejon — today's print typo); (3) id 221 refund tuna (Florida Tuna 3pk, invoice 90772312) now sellable + flagged, reference-priced **$4.99/3pk** (per-oz parity with Florida Tuna 48/5oz @ $2.99/can).
- Cross-reference result: 12 of today's 52 SKUs match prior-invoice item numbers — costs identical (Jelly Fruits, Florida/Ecuatun tuna, Casabe, Plantain Chips, Lentejon, Manzanilla tea, ILE Adobo, Del Frutal nectars, Yuca 12/40oz + 6/80oz) except **Van Camps 48/5oz DROPPED $113.55 → $98.95** (retail $3.99 → $2.99).
- Verified: `scripts/verify-pricing-hub.js` extended (5 invoices, 109 FFD items, legacy key removed, Lentejon rename, Van Camps drop, refund sellable @ 4.99) — ALL CHECKS PASSED.
- Sales price sheet delivered: stylized print-ready HTML (hub formula: 65% markup + .99 rounding, per-SKU, category-grouped, refund + price-drop badges) — 52 items, cost $2,594.94 → est. revenue $4,283.40, profit $1,688.46 (39.4%).
- Vault: Exception_Log all 3 FFD rows RESOLVED; CSVs + audits + Vendor_Price_History regenerated (52 rows, 12 with prior refs); CHANGELOG updated.
- Next safe action: confirm Van Camps $2.99 + refund $4.99 shelf prices; NRS POS shelf tags for the 52 SKUs.

## 2026-08-19 — Hermes (Pricing Hub ↔ Kingdom OS sync)
- Goal: let the owner edit retail prices on Kingdom OS and have the edits persist back into the Pricing Hub (source of truth).
- Changed: `apps/pricing-hub/index.html` — `calcRetail()` now honors the stored `retail` snapshot when it differs from the 65% formula (synced override wins; formula-generated rows unchanged). New Kingdom OS write-back endpoint (`serve_os.py` POST `/api/pricing`) patches this file, OS `data.json`, miniapp staged snapshot, then commits + pushes `main` per edit (3 test syncs landed: set/clear/bulk).
- Verified: `scripts/verify-pricing-hub.js` ALL CHECKS PASSED after calcRetail change; OS smoke 60 PASS incl. pricing overrides; live POST round-trip confirmed (id 170 set → 5.49, clear → 4.99; bulk 170/181 cleared, no-cost 221 kept reference 4.99).
- Not verified: OS page now shows "✓ synced to hub" per edit; other browsers see synced values on reload (data.json patched in place; 2h cron re-derives from hub).
- Next safe action: shelf-tag prices on NRS POS; any OS retail edit now flows to the hub automatically.

## 2026-08-19 — Claude Code (Pricing Hub V2, Phases A + B)
- Goal: finish the PR #32 invoice-pricing foundation against current `main`, reconcile it with the live 157-item hub dataset, and rebuild the Pricing Hub UI on Supabase with an offline fallback.
- Changed:
  - Ported the six genuinely new files out of `feature/invoice-pricing-pipeline` onto a branch cut from current `main`, stripping the branch's UTF-8 mojibake and CRLF damage. Net change to `server/index.js` is +45/−1, entirely additive.
  - Added `supabase/migrations/20260819213000_reconcile_pricing_hub_dataset.sql`: hub-shape product columns, `hub_item_ids` for the Kingdom OS mirror, private `pricing-invoices` storage bucket, immutable-history trigger, `pricing_set_product_retail()`, `pricing_approve_invoice()`, `pricing_label_rows()`, and a `backfilled` status for pre-pipeline invoices.
  - Added `scripts/seed-pricing-from-hub.js` (+ `scripts/lib/hub-data.js`) and the generated `supabase/seed/pricing_hub_seed.sql`.
  - Completed the documented next slice: private invoice storage, the authenticated approval transaction, OCR webhook wiring, and the catalog/queue/history/export endpoints in `server/pricing-router.js` + `server/pricing-store.js`.
  - Rebuilt `apps/pricing-hub/index.html` as v2 (Catalog / Approval Queue / Price Changes / Export) on a Supabase data layer with the embedded arrays as a first-render offline fallback; synced the root iframe copy.
  - Rewrote `scripts/verify-pricing-hub.js`: removed a hardcoded `/opt/data` path that meant it only ever ran on the VPS, made it verify the hub's shipped math rather than a copy, and added structural checks for the Kingdom OS contract and the root/apps sync.
- Verified:
  - `node scripts/test-pricing-migrations.js` — both migrations apply to a clean PostgreSQL 16 database and 14 checks pass, including deny-by-default RLS, SHA-256 upload idempotency, immutable history, the $0.01 tolerance, and refusal to approve an unmatched line or without an approver.
  - Generated seed loaded into local PostgreSQL: all 9 invoice totals reconcile to $0.00 variance, and Hershey's $234.42 / Family Food $2,594.94 match the figures `verify-pricing-hub.js` asserts independently.
  - `node --test server/pricing-engine.test.js server/pricing-pipeline.test.js` — 18 + 8 tests pass, including a full sample-invoice run and the auth-boundary cases.
  - `node scripts/verify-pricing-hub.js` — ALL CHECKS PASSED.
  - Browser (Chromium, desktop 1280 and mobile 390): console clean over HTTP, offline fallback renders 154 rows with no network, no horizontal overflow; and against a stubbed live API the server retail overrides the embedded value, variance pills, history timeline, approval queue, and a persisted retail edit all work, with a below-cost edit rolled back.
  - Ordering runtime unaffected: server boots, `/api/health` reports 132 menu items, emoji render correctly.
- Not verified / blockers:
  - The migration and seed have **not** been applied to the production Supabase project — that needs owner approval.
  - No OCR provider is configured, so the OCR leg is exercised only against a stub.
  - No production deploy was run; the main site is a manual Vercel CLI deploy.
- Security or rollback notes: service-role access is confined to `server/pricing-store.js` (server-side); invoice scans go to a private bucket reached only by short-lived signed URLs; RLS is deny-by-default with zero policies on the pricing tables and no anon/authenticated grants; approvals require a real `auth.users` identity, so the shared operator token cannot approve. Rollback is `git revert` — nothing was applied to production.
- PR/issue/commit: supersedes PR #32; see `brain/Decisions/2026-08-19-pricing-hub-v2-supabase-cutover.md`.
- Next safe action: owner reviews the four open decisions (markup rule, slider behaviour, iframe strategy, OCR provider), then apply the migration + seed to Supabase in that order and re-run the end-to-end test against one real invoice.

## 2026-08-19 — Claude Code (Pricing Hub V2, Phase C)
- Goal: complete Phase C of `PRICING_HUB_V2_UPGRADE.md` — staff invoice intake, NRS POS CSV sales import, and the financials dashboard. Phase D remains explicitly out of scope.
- Changed:
  - `supabase/migrations/20260819230000_add_pos_sales_and_financials.sql`: `pos_import_batches` + `pos_sales`, NET21 payment terms on invoices, and six reporting functions (`pricing_cost_at`, `pricing_vendor_spend`, `pricing_invoice_aging`, `pricing_margin_by`, `pricing_pnl_summary`, `pricing_increase_alerts`), all SECURITY DEFINER and service-role only.
  - `server/pos-import.js`: NRS CSV parser whose column aliases, numeric coercion, summary-row skipping and void/refund conventions mirror the existing `nrs/nrs-analyze.py`, so the dashboard and the daily Telegram briefing cannot disagree about a row.
  - `server/pricing-router.js` + `pricing-store.js`: `POST /pos/import`, `GET /pos/batches`, `GET /financials`.
  - `apps/pricing-hub/index.html`: Invoice Intake and Financials tabs; root iframe copy synced.
  - Verifier extended to 79 checks, including one asserting the uncosted-revenue caveat is shown where the margin is read.
- Verified:
  - `node scripts/test-pricing-migrations.js` — all three migrations apply to a clean PostgreSQL 16 database; 28 checks pass. The financials suite runs in its own database so its totals are exact rather than polluted by the pipeline suite's fixtures. Asserted by hand-computed value: COGS valued per sale date (10 units at $2.00 + 10 at $3.00 = $50.00), NET21 bucketing of an invoice 9 days late, paid invoices excluded from aging, and P&L gross/COGS/profit/costed-share.
  - `cd server && npm test` — 51 tests pass (engine 18, POS parser 18, end-to-end 15).
  - `node scripts/verify-pricing-hub.js` — 79 checks, ALL PASS.
  - Browser (Chromium, 1360 and 390): console clean on both, no horizontal overflow; financials render P&L cards, NET21 buckets, margin table and cost alerts; invoice intake shows extracted lines with every line in `needs_review`; POS import reports its match rate and warns that unmatched rows make margin a floor; an unreadable export reports the header it saw.
- Not verified / blockers:
  - **The POS parser has not been run against a real NRS export** — only against fixtures shaped like one. Confirm the live column names when an export is available.
  - Migrations and seed are still **not applied to production**; that needs owner approval.
  - No OCR provider configured, so the OCR leg is still stubbed.
  - The current catalog carries no UPCs, so POS→product matching will start with a low match rate. This is reported honestly rather than hidden: margin is labelled a floor until items are matched.
- Security or rollback notes: POS tables follow the same deny-by-default RLS posture (RLS on, zero policies, no anon/authenticated grants). Importing sales requires an identified approver — a shared operator token is refused. Voids and refunds are retained and flagged rather than deleted, preserving the leak-detection record. Rollback is `git revert`; nothing was applied to production.
- PR/issue/commit: PR #39 (draft), same branch.
- Next safe action: confirm the NRS export column names against one real file, then apply the three migrations + seed to Supabase in order and run one real invoice and one real POS export end to end.

## 2026-08-19 — Invoice bundle 08/19 (8 invoices, 6 vendors) integrated
- OCR'd 11-page bundle via live webhook (port 8799) → 8 invoices: Amaro #1671390, JCC Ganoza #012830, NACfoods #3057:5, TAINO #27810, GOYA #27727700 (2pp), Peru Food #0271478-00, Peruvian Import #INVNJ23126 + #INVNJ23127.
- Bundle $5,510.54 | 137 lines | 171 cases | all 6 vendors NEW to hub.
- Owner corrections: AMARO Rib Belly $48.82, Masita $36.81 → line sum $192.78 vs printed $192.73 (subtract $0.05). GOYA line sum $1,694.25 vs printed $1,686.28 (subtract $7.97). Owner rule: use printed total.
- Hub: +137 items (ids 222–358) at 70% markup; 294 total; verifier updated (294) + ALL PASSED; root pricing-hub synced.
- Vault: bundle PDF → RAW_UPLOADS; 8 processed CSVs + audits; 137 price-history baselines; register now 17 invoices / $12,851.20; 44 GOYA pack-size exceptions open.

## 2026-09-04 — Triunfo integration into hub
- Merged 49 Triunfo OCR items into `apps/pricing-hub/index.html` ALL_ITEMS (ids 359-407, invoices TRI-1/2/3).
- Registered "Triunfo Foods" vendor in VENDORS registry.
- Hub total now 343 items (GOYA 44, Triunfo 49, rest Super Trading/Family Food/TAINO/etc).
- Verified JS parse with node: 343 items parsed, 9 flagged no-retail.

## 2026-09-05 — Codex growth/conversion review
- Goal: Research a conversion-focused modern storefront and document the architecture before deployment.
- Changed: Added research plan/evidence, bilingual self-contained CSS-depth concept, scoped root WebGL resilience/zoom patch, regression tests and CI, HQ/decision/current-state handoff.
- Verified: Current main and open PR metadata through connector; both Vercel URLs HTTP 200; live browser reproduced WebGL/loading failure and conflicting hours; four resilience/syntax tests pass; concept dictionary, internal links, IDs and JavaScript syntax checked.
- Not verified / blockers: Prototype visual/mobile browser testing blocked for local/data URLs; current commercial hosting project, Cloudflare ownership/DNS, actual hours, authenticated backend state, controlled order, financial baseline. No real conversion improvement measured.
- Security or rollback notes: No production deployment, DNS/database change, order creation, or invoice upload. Public-only packaging and internal UI removal remain release gates. Revert isolated root patch to roll back code; no data rollback is required.
- PR/issue/commit: Feature branch agent/growth-conversion-plan-2026-09-05, based on dfb38b633f8116270d833997f3eaee882dfe363c; reconciles context for #28/#29/#30/#33/#41/#46.
- Next safe action: Review plan/concept and resilience patch, confirm domain/hours, implement public-only build boundary, then validate an authorized preview and ordering lifecycle before production.

## 2026-09-11 — PaddleOCR opt-in reader merged and deployed (PR #50)
- Goal: Land the deferred PaddleOCR work as a single PR, merge it, and deploy the merged code to the local Docker runtime.
- Changed: `server/pricing-ocr.js` (opt-in `paddleUrl()`, honest fall-through reader chain with `_fallback_from`/`_fallback_reason`, `probePaddle()`, `PRICING_PADDLE_MODEL` wired, `HUB_DIR` probes both Docker and repo layouts), `server/pricing-ocr.test.js` (`ENV_KEYS` + 8 tests), `server/.env.example`, `server/index.js`, `docker-compose.yml` (healthcheck `/` → `/pricing-hub/`, expects 200), new `scripts/test-paddle-ocr.js`, new `.dockerignore`. Commit `e25ef45` (7 files, +504/−19) → PR #50 → merged `498d21b`; follow-up `bf60ee7` adds `.dockerignore`.
- Verified: 98/98 unit tests on merged `main`. Live PaddleOCR: `anthony-paddleocr` healthy on `:8120`; e2e on `invoices/archive/processed/triunfo_invoice_1.jpg` → provider=paddle, model=PP-OCRv5-local, 17 items, line totals summing to parsed subtotal 4047.52. Rebuilt image inspected before start: **no `/app/.env` in any layer**, 219 Linux `node_modules` entries, `express` resolves, seed + hub present. Container recreated — healthy in 23s; `/pricing-hub/` → 200 on host port 3401; merged symbols (`paddleUrl`, `probePaddle`, `OCR_ALL_PROVIDERS_FAILED`, `_fallback_reason`, `PRICING_PADDLE_MODEL`) present in the running container; no startup errors.
- Not verified / blockers: the customer-facing order flow was not exercised end to end, and the menu was only observed at the API layer. `/api/menu` returns an empty `menus: []` because the container cannot resolve the Windows `MENU_DATA_PATH` (see CURRENT_STATE) — **pre-existing**, reproducible on the `rollback-pre-pr50` image.
- Security or rollback notes: `.dockerignore` now keeps `server/node_modules` and `server/.env` out of the build context; before it, a local rebuild would have overwritten the container's Linux modules with Windows binaries and baked `server/.env` (Telegram token, Supabase service-role key) into an image layer. Rollback image `anthony-supermarket-server:rollback-pre-pr50` (`5488768fe51c`) retained. Build context 1.4 GB → 697 kB; build cache pruned 19.44 GB → 4.84 GB.
- PR/issue/commit: PR #50 merged (`498d21b`), `.dockerignore` `bf60ee7` on `main`.
- Next safe action: point the container at the seed path it actually has (`/app/seed/anthonys-seed.json`, via `docker-compose.yml` rather than `server/.env`), recreate, and confirm `/api/menu` returns the populated menu.

## 2026-09-11 — Hermes DevOps — GitHub Pages disabled; CI green verified; decision recorded
- Goal: stop the chronic red "Deploy to GitHub Pages" runs (since 2026-09-05) and record the Pages/private-repo decision.
- Changed: `.github/workflows/deploy.yml` now stages only the public surface (root html, `assets/`, `pricing-hub/`) instead of `path: '.'`; workflow set `disabled_manually`; decision record `brain/Decisions/2026-09-11-pages-private-repo.md` (accepted); CURRENT_STATE updated.
- Verified: repo `JelfferyDuran/anthony-supermarket` is `private: true`; Pages API returns 404 (cannot be enabled on a private Free-plan repo); workflow state `disabled_manually`; last Pages run `34562817299` failed at `actions/configure-pages` ("Get Pages site failed ... repository has Pages enabled"), triggered by the very push that disabled it — no Pages runs since. Main CI green before this push: Shared Brain CI and Super Kitchen CI latest runs success; Storefront resilience is PR-only. Post-push Shared Brain CI run `34563148501` on commit `fea7aae`: success (13s).
- Security or rollback notes: workflow stages only public files; a future re-enable cannot publish `server/`, `docs/`, `invoices/`, `nrs/`, `data/`. Re-enable via `gh workflow enable deploy.yml` only if the repo goes public. No secrets touched.
- PR/issue/commit: `e1ba4b7` (Pages disable); decision `brain/Decisions/2026-09-11-pages-private-repo.md`.
- Next safe action: none required for CI; keep Pages disabled while the repo is private. Continue the container menu path fix (`/app/seed/anthonys-seed.json`) as the open defect.

## 2026-09-11 — Menu loader smoke guard: assert /api/menu never returns 0 items (CLOSED)
- Goal: make a zero-item /api/menu impossible to serve after the container once returned {menus: []} because server/.env's Windows-only MENU_DATA_PATH shadowed the image seed (08baf39 fixed resolution; this closes the remaining silent-fallback gap).
- Changed: `server/index.js` (loadMenu exits(1) on missing/empty/malformed seed — no silent {menus: []} fallback; GET /api/menu returns 503 when 0 items loaded; GET /api/health returns 503 when 0 items loaded), `docker-compose.yml` (healthcheck now probes /api/health instead of /pricing-hub/), new `server/menu-smoke.test.js` (6 tests, wired into npm test), `server/package.json` (test script), docs CURRENT_STATE + SESSION_LOG.
- Verified: `node --test menu-smoke.test.js` 6/6 pass — real seed resolves with items; booted server /api/menu returns items > 0; repo-checkout seed is the served one; empty seed refuses to boot (exit 1); malformed seed refuses to boot (exit 1); host-only MENU_DATA_PATH falls back to a populated seed. Full suite 112/112 pass. Container rebuilt + recreated: docker ps healthy; /api/health 200; /api/menu 200 with 132 items on host port 3401.
- Security or rollback notes: no secrets touched; rollback = checkout pre-change server/index.js + docker-compose.yml. Healthcheck no longer requires PRICING_SERVE_STATIC=1.
- PR/issue/commit: uncommitted on main (next commit).
- Next safe action: commit + push to main (JelfferyDuran/anthony-supermarket); monitor that the recreated container stays healthy.

## 2026-09-12 — Hermes DevOps — menu slug mismatch fixed (kanban t_d200935c)
- Goal: fix the 404 on the menu endpoint — the Telegram bot `/menu` handler and `/api/menu/:slug` looked up slug `'kitchen'` while the seed carries `'anthonys'` (renamed in 485331a), so the bot answered "Menu not found".
- Changed: `server/menu-seed.js` (new `resolveMenuBySlug(data, slug)`; exact match wins, single-menu seed falls back to its one menu for any unknown slug, multi-menu seeds still 404), `server/index.js` (bot `/menu` requests canonical `'anthonys'`; `/api/menu/:slug`, `cat:` and `add:` callbacks use the resolver; category buttons emit `cat:<real slug>:` instead of hardcoded `cat:kitchen:`), `server/menu-seed.test.js` (+4 unit tests), `server/menu-smoke.test.js` (+1 booted-server regression test), docs CURRENT_STATE + SESSION_LOG.
- Verified: full server suite 117/117 pass (112 pre-existing + 5 new). Container `anthony-supermarket-server` rebuilt + recreated, healthy in 19s. Live on host port 3401: `/api/health` 200 (132 items); `/api/menu` 200; `/api/menu/anthonys` 200; `/api/menu/kitchen` 200 (was 404).
- Security or rollback notes: no secrets touched; rollback = checkout pre-change `server/index.js` + `server/menu-seed.js` and recreate the container.
- PR/issue/commit: uncommitted on main (next commit); board card t_7c3667b4 unblocked.
- Next safe action: commit + push to main (JelfferyDuran/anthony-supermarket); spot-check bot `/menu` in Telegram.

## 2026-10-09 19:55 ET — Claude Code — Vercel public output allowlist (cost data + server source were public)
- Goal: stop the `anthony-pricing-hub` deployment publishing the whole repo root. The owner confirmed the cost files and server source were publicly downloadable. Move the records, don't delete them. Keep `/api/pricing/*` and `/pricing-hub/` working.
- Changed:
  - `vercel.json`: `buildCommand: node scripts/build-public-site.js`, `outputDirectory: public-build`.
  - New `scripts/build-public-site.js` (allowlist copy).
  - New `scripts/test-public-site.cjs` (guard).
  - New `.github/workflows/public-site-guard.yml`.
  - `git mv` of 5 `manual-intake-*.json` and 2 `goya-2026-08-31-items.*` from `pricing-hub/` to `invoices/pricing-hub-records/` (+ README).
  - `scripts/build-pricing-store.py` `GOYA_DIR` follows the move.
  - `.gitignore` `/public-build/`.
  - `pricing-hub/LOADING_DOCK.md` deploy + endpoint sections.
  - CURRENT_STATE; decision note.
- Verified:
  - Guard 6/6 pass. Mutation checks fail as intended: `vercel.json` back to `.`; `invoices/` allowlisted; missing page asset; missing hub module; cost field in the promo feed.
  - The store script loads 39 Goya rows from the new path.
  - `vercel build` (CLI 63.1.2) of `main` vs branch: 380 → 50 static files; the 50 are byte-identical to `main`'s; routes identical; the API function bundle is byte-identical (314 files).
  - Local smoke server built from the emitted routes: public pages and `/api/pricing/{health,config,login}` match `main`; leaked paths now return the homepage.
  - The secret-pattern scan of all tracked files found no committed credentials.
- Not verified / blockers:
  - Real Vercel preview: this container's network policy denies `*.vercel.app`, and the session's Vercel connector lists 0 projects in team `kingdom-noel`.
  - Production still serves the files until promoted.
  - Old deployment URLs are not checked.
  - Multi-segment `/api/pricing/*` routes 404 in the emulated routing on `main` too. Pre-existing; needs a real-deployment check.
- Security or rollback notes:
  - No secrets touched; no data deleted.
  - Treat everything served before promotion as disclosed: vendor costs, the vendor account number, POS exports, server source.
  - Rollback = revert `vercel.json` (re-exposes everything, so prefer fixing forward) or redeploy the previous deployment.
- PR/issue/commit: draft PR #54, branch `fix/vercel-public-allowlist`.
- Deploy topology learned from the Vercel bot on #54:
  - `anthony-pricing-hub` is not Git-connected (no auto-preview).
  - `kingdom-os` is Git-connected at the repo root, so merging auto-deploys it to production.
  - `anthony-supermarket-superkitchen` builds from `apps/superkitchen` and is unaffected.
- Next safe action: owner runs the #54 URL checklist on the `kingdom-os` branch preview or a manual pricing-hub preview, and confirms no consumer fetches repo files from `kingdom-os`. Merge/promote only on the owner's explicit go.

## 2026-10-10 11:05 ET — Claude Code — Pricing Hub operational game layer + deep API routing fix
- Goal: owner asked for significant backend and frontend work: "develop the pricing hub as a full blown game but operational".
- Changed (branch `feat/pricing-hub-ops-game`, stacked on #54):
  - Deep `/api/pricing/*` routing: superseded by `main`'s `0df4412` (rewrite → `api/pricing-fn.js`); see the 12:05 entry.
  - New `server/pricing-game.js`.
  - `server/pricing-store.js`: game reads, `getProduct`, `downloadInvoiceObject`, `resolveUserNames`.
  - `server/pricing-router.js`:
    - `GET /game/state`;
    - `POST /products/:id/apply-rule`;
    - `POST /invoices/:id/extract`;
    - failed reads reset to `uploaded`;
    - duplicate uploads report `rescuable`;
    - approvals link `invoice_line_id` (own lines only).
  - New `server/pricing-game.test.js`, `server/pricing-game-router.test.js`, wired into `npm test`.
  - Frontend:
    - new `pricing-hub/js/game.js`;
    - `api.js`: game calls, POS field `sales`, 401 handling;
    - `hud.js`: rule button, rescue routing, history field, `invoice_line_id`, vault sales strip, share as %;
    - `zones.js`: Rule Guard markers first on shelves, vault keys, integrity on hologram, pick passthrough;
    - `world.js`: zone-scoped labels, pedestal health colour;
    - `boot.js`: game wiring, name restore;
    - `index.html` / `game.css`: player strip, missions button, XP floats, level-up overlay.
  - `LOADING_DOCK.md`; decision note.
- Verified:
  - Server 132/133; the only failure is the pre-existing Gemini model assertion, also red on `main`.
  - 16 new tests; mutation checks M1–M5 each fail the intended test.
  - Guard 6/6.
  - `vercel build` emulation: static 51 files, function bundles `pricing-game.js`, deep routes reach Express.
  - Playwright desktop + mobile against the real router and a seeded store: 0 page or console errors; rule fix +15 XP; rescue; approve → level-up; screenshots reviewed.
  - Read-only Supabase: schema and the approve / set-retail function bodies inspected; production counts above.
- Not verified / blockers:
  - Real Vercel preview (network policy + connector scope).
  - Real OCR provider for rescues.
  - Vercel function timeout vs a 30–90s read is unknown; if a read is killed, the scan is now rescuable after 10 min.
- Security or rollback notes:
  - No DB writes, no migration; all game reads are server-side under the existing manager gate.
  - Leaderboard exposes only email local parts, never ids or full emails.
  - Apply-rule ignores client prices.
  - Rollback = revert the branch commits; the API stays backward compatible (only additions).
- PR/issue/commit: draft PR (see PR thread), base `fix/vercel-public-allowlist` (#54).
- Next safe action: merge #54 on owner go, preview this branch, approve one real invoice in the preview to confirm the deep routes, then promote on owner go.

## 2026-10-10 12:05 ET — Claude Code — Adopt main's deep-routing fix in #54 and #55
- Goal: bring both open PRs up to date with `main` (`58ca046` UPC lookup, `0df4412` routing fix by Noel) without two competing routing fixes.
- Changed:
  - #54 (`fix/vercel-public-allowlist`): merged `main`. `vercel.json` now holds the allowlist build plus main's `api/pricing-fn.js` functions entry and rewrite.
  - #55 (`feat/pricing-hub-ops-game`): merged #54, kept main's rewrite, and dropped this branch's own `/api/pricing/:path*` → `[...path]` rewrite.
  - The JSON 404 moved from `api/pricing/[...path].js` (reverted to main) into `api/pricing-fn.js`.
  - The guard in `scripts/test-public-site.cjs` no longer pins one routing approach. It requires a `/api/pricing/:path*` rewrite whose target function exists, is configured, and receives the full path. Mutation-checked: dropping `__path`, or naming a missing function, fails it.
- Verified:
  - `vercel build` emulation of #54 after the merge: deep paths (`/products/:id/history`) reach the router through `pricing-fn`, both when the function sees the original URL and when it sees the destination URL.
  - No internal file is served.
  - Server suite: only the pre-existing Gemini assertion fails.
- Not verified: a real Vercel deployment of either branch.
- Next safe action: owner previews #54 and runs the URL checklist; merge/promote only on the owner's explicit go.

## 2026-10-10 13:05 ET — Claude Code — Bring Noel's UPC pipeline into #54 and #55
- Goal: keep both open PRs current with `main` (`6452188`, `3180f54`, `f2e4d9c`: `PATCH /products/:id/upc`, "Find UPC" on review lines and product cards, bulk lookup results in `docs/upc-lookup-2026-10-10.json`).
- Changed:
  - #54: merged `main`; the `LOADING_DOCK.md` endpoint list now combines both sides.
  - #55: merged #54. The product card keeps both the Rule Guard button and Find UPC. A saved UPC now calls `nav.refreshGame()`, because UPC coverage is 10% of Dock Integrity.
- Verified:
  - Server suite: only the pre-existing Gemini assertion fails. Guard 6/6.
  - Headless Chromium (harness store with a UPC stub), desktop and mobile, 0 errors: product card shows "Fix to rule" and "Find UPC" together; picking a candidate saves it, hides the button, refreshes game state, and integrity goes 26 → 27.
  - Full game regression driver: 0 errors.
- Noted, not changed (owner/Noel decision): `setProductUpc` writes `pricing_products.upc` with no record of who set it. A UPC-assignment audit trail would also let the game award XP for barcodes (see `brain/Decisions/2026-10-10-pricing-hub-game-layer.md` follow-ups).
- Next safe action: unchanged. Owner previews #54; merge/promote only on the owner's explicit go.

## 2026-10-10 13:59 ET — Claude Code — Merge `main`'s manual UPC entry; fix typed-digits save
- Goal: keep #54 and #55 current with `main` (`c8b0ea2`, Noel: manual UPC entry plus the red-kidney-beans size split in `docs/upc-lookup-2026-10-10.json`).
- Found a bug on `main`: the "type barcode digits" fallback was rendered in both lookup branches, but `wireManualUpc` ran only when the lookup returned candidates. When the public database had no match, the exact case the fallback exists for (for example the 46oz cans), "Save digits" did nothing.
- Changed:
  - #54: merged `main`, unchanged otherwise.
  - #55: merged #54. `wireManualUpc` now runs after the if/else on both the review line and the product card. A manual save calls `nav.refreshGame()`, like the other UPC saves.
- Verified (headless Chromium, harness store, public-database stub returning no products):
  - With `main`'s `hud.js`: 0 `PATCH /products/:id/upc`, nothing saved. Reproduced.
  - With this branch: 1 PATCH, "UPC saved" toast, barcode stored, game refreshed, 0 page errors.
  - Candidate path re-run on desktop and mobile: 0 errors.
  - Server suite: only the pre-existing Gemini failure. Guard 6/6.
- Next safe action: Noel can apply the same two-line move on `main` now, since the bug is live there. Otherwise unchanged; merge/promote only on the owner's explicit go.

## 2026-10-10 14:35 ET — Claude Code — 2D Pricing Hub at /hub (default), homepage staff link
- Goal: the owner, now signed in, found the hub UI glitchy and wanted a front-end upgrade plus a standalone page on the public site. Their answers:
  - fast 2D hub as the default, keep the game;
  - `/hub` with only a small staff link on the homepage;
  - they had been using the homepage-embedded hub.
- Changed (branch `feat/pricing-hub-2d`, stacked on #55):
  - New `hub/`: `index.html`, `hub.css`, `js/app.js`, `js/ui.js`, `js/upc.js`, `js/views/{today,review,products,intake,vault,me}.js`. No WebGL and no external scripts; it reuses `pricing-hub/js/api.js`.
  - `server/pricing-router.js`: `GET /invoices/:id` (manager; every line; internals stripped), plus a test in `server/pricing-game-router.test.js`.
  - `pricing-hub/js/api.js`: `getInvoice`, `getInvoiceSource`, `downloadLabels`.
  - `scripts/build-public-site.js` allowlists `hub/`. `scripts/test-public-site.cjs` requires its files.
  - `vercel.json`: `/hub` → `/hub/` redirect.
  - `index.html`: hub iframe, "Pricing" nav link and hero button removed; staff footer link added. `links.html`: hub button points to `/hub/`.
  - Docs: `LOADING_DOCK.md`, `CURRENT_STATE.md`, decision note.
- Verified:
  - Server suite 133/134 (only the pre-existing Gemini failure). Guard 6/6.
  - Emulated `vercel build` plus smoke.
  - Headless Chromium end to end on desktop and mobile with 0 errors (details in `CURRENT_STATE.md`).
- Security/rollback:
  - No secrets touched. The new route is read-only, manager-only, and strips storage internals.
  - Rollback = revert the branch; the 3D dock at `/pricing-hub/` is unchanged.
- Next safe action: merge #54 → #55 → this on the owner's explicit go, then check `/hub/` on a preview with a real sign-in.
## 2026-10-10 15:32 ET — Claude Code — Merge main's retry-extract into #54/#55
- `main` gained `4b7a8f5` (Noel):
  - `POST /invoices/:id/retry-extract`;
  - `GET /products/coverage`;
  - a shared `runExtraction()`.
- #54 merged `main` cleanly.
- #55 conflicted where both sides had split the extraction step out of intake. Resolution:
  - Noel's `runExtraction` is the core step;
  - #55's `extractIntoInvoice` wraps it, so a failed read resets the invoice to `uploaded`;
  - every read path (intake, `/extract`, `/retry-extract`) goes through the wrapper. Noel's route previously left a failed retry in `extracting`; his own comment says both paths should agree.
- Test added: `retry-extract` failure resets to `uploaded`, success lands lines, reviewed work is refused (409), the operator token is refused (403). Mutation-checked against the old call.
- Follow-up for the owner: `/extract` (#55, manager, refuses in-flight reads) and `/retry-extract` (main, approver, also re-reads untouched `needs_review` invoices) overlap. Consolidate into one route after these PRs land.
- Still on `main`: the manual-UPC "Save digits" wiring bug (fixed in #55 only).

## 2026-10-11 05:28 ET — Claude Code — main's #52 polish merged into #54; polish.css allowlisted
- `main` moved to `43ca4d5` (#52 Pricing Hub polish: `pricing-hub/polish.css`, `js/polish.js`, and a sign-in check that reports a preview without pricing config instead of a bad password).
- Merged into `fix/vercel-public-allowlist` cleanly. The Public site guard then failed on `pricing-hub/index.html -> polish.css` (unpublished), so `pricing-hub/polish.css` joined `PUBLIC_FILES` and both new files joined the guard's required list.
- Verified: guard 6/6; storefront resilience 4/4; server suite 115/117 (both failures are `main`'s: the .99 rounding expectation in `pricing-engine.test.js` and the Gemini model assertion); `vercel build` emulation 52 static files, nothing internal; `polish.css`/`polish.js` serve as CSS/JS.
- Previews: per `main`'s 2026-10-09 checkpoint, previews report `storeConfigured:false`, so manager sign-in works only in production until the Preview env gets the server-only pricing variables.
- Next safe action: the same `main` merge flows into #55 and #56; merge the stack only on the owner's explicit go.
