# Current State — Anthony's Supermarket

Last updated: 2026-10-18 (#54 allowlist and #55 game layer + 2D hub merged to `main`; `kingdom-os` builds from `main`; the manually deployed Vercel projects still need a deploy of `main`)

This file is operational context, not a secret store. **Live infrastructure is authoritative.** Verify live state before consequential actions.

## 2026-10-10 — 2D Pricing Hub at `/hub/` becomes the default (merged to `main` 2026-10-18)
- **Branch:** `feat/pricing-hub-2d`, stacked on `feat/pricing-hub-ops-game` (#55), which is stacked on #54. Merge order: #54 → #55 → this.
- **Why:**
  - The owner signed in through the homepage's embedded hub (a 3D WebGL app in a 70vh iframe) and found it glitchy.
  - The owner chose a fast 2D hub as the default, kept the game, and wanted a standalone page on the public site with only a small staff link.
- **What:**
  - New `hub/` (static, no external scripts) at `/hub/` (`/hub` redirects; `noindex`).
  - It reuses `pricing-hub/js/api.js` and the same session.
  - The 3D dock stays at `/pricing-hub/` as an optional view.
- **Homepage:**
  - The hub iframe section, the "Pricing" nav link and the hero "Pricing Hub" button are removed.
  - A "Staff · Pricing Hub" footer link is added.
  - `links.html` points to `/hub/`.
- **API (additive):** `GET /invoices/:id` (manager) returns one invoice with every line, rejected included. Storage path, hash and user ids are stripped.
  - It fixes a real gap: an invoice whose lines were all excluded dropped out of `GET /queue` and could not be closed.
  - Client methods `getInvoice`, `getInvoiceSource` and `downloadLabels` were added to `api.js`.
- **Verified locally:**
  - Server suite 133/134 (only the pre-existing Gemini assertion fails), including a new route test. Public site guard 6/6.
  - `vercel build` emulation: 62 static files, `/hub` → `/hub/` 307, deep route 401 without auth.
  - Headless Chromium end to end, desktop 1440 and mobile 390, 0 page or console errors. Covered:
    - rule fix +15 XP;
    - UPC lookup and typed digits;
    - below-cost retail refused;
    - review checklist, a typed retail value surviving edits, short and undo;
    - approve with level-up, labels download;
    - all-excluded invoice reopened after a reload and closed;
    - rescue, upload, duplicate;
    - POS import +60 XP;
    - sign out;
    - no horizontal overflow, approve bar above the tab bar.
- **2026-10-18 23:43 ET: the owner squash-merged #55, with #56 inside it, to `main` (`d6d28a4`).** The tree is identical to the verified head `80726ce`.
  - `/hub/`, the game layer and the homepage staff link are on `main`. `kingdom-os` builds production from it; that deploy was not checked from this session.
  - The public domain `anthony-supermarket.vercel.app` and `anthony-pricing-hub` deploy by hand. `/hub/` appears there only after `main` is deployed to them.
  - First authenticated check: #56's checklist on production (previews report `storeConfigured:false`).
- **2026-10-11:** `main`'s #52 polish is merged through #54 → #55 → #56.
  - The 2D sign-in runs the same preview check as the 3D dock: `GET /config` → `storeConfigured:false` → explain, and never send credentials.
  - The 3D Missions button is lifted clear of the taller polished zone rail.
- **Not verified:** a real Vercel deployment and real Supabase data (the session cannot reach `*.vercel.app`). Previews cannot sign in at all (`storeConfigured:false`), so the first authenticated check is production after the owner's go, or a preview once its environment has the server-only pricing variables.

## 2026-10-10 — Pricing Hub becomes an operational game; deep API routes fixed (merged to `main` 2026-10-18 via #55)
- **Branch:** `feat/pricing-hub-ops-game`, stacked on `fix/vercel-public-allowlist` (PR #54). Draft PR targets #54's branch. Merge #54 first.
- **Live data observed (read-only, Supabase 2026-10-10):**
  - **Nothing has ever been approved through the hub:** 0 invoices `imported`, and 0 attributed approval, history or POS rows. The Oct 8 "approvals" exist only as repo JSON.
  - **Open work:** 8 invoices / 98 lines in `needs_review` (oldest Aug 20); 3 scans stuck in `extracting` since Aug 28; 1 `uploaded` since Aug 20.
  - **Sales feed:** stops at 2026-08-19.
  - **Catalog:** all 279 priced items sit exactly on ×1.70/.99; 190 of 283 have no UPC; 45 are flagged for owner review.
- **Root causes found and fixed:**
  1. **Vercel routed only ONE path segment** to `api/pricing/[...path].js`, so approve, line edits, price history and retail edits 404'd in production. Fixed on `main` by Noel (`0df4412`): `vercel.json` rewrites `/api/pricing/:path*` → `api/pricing-fn.js`, which restores the path from `__path`. This branch adopts it (its own rewrite was dropped), adds a JSON 404 there, and CI now fails if the rewrite or its target goes.
  2. **A failed or killed OCR read left invoices `extracting` forever,** and re-uploads deduped onto them. Fix: failures reset to `uploaded`, and `POST /invoices/:id/extract` rescues stuck scans (`uploaded`, or `extracting` > 10 min).
  3. **Client bugs:**
     - POS upload sent field `file`, but the server reads `sales`, so every import failed;
     - price history read `old_retail_price` instead of `previous_retail_price`;
     - the vault read the wrong P&L keys;
     - approvals never linked history rows to their invoice line.
- **New:**
  - `server/pricing-game.js`: pure engine for missions, XP, levels, streaks, badges, leaderboard and health.
  - `GET /game/state`: manager access.
  - `POST /products/:id/apply-rule`: approver only, server-priced, needs confirm to lower.
  - `pricing-hub/js/game.js`: player strip, mission board, player card, health panel, 3D beacons, stuck-scan packages, XP and level-up feedback.
  - Zone-scoped 3D labels.
- **No new tables, no migration:** XP comes from existing `approved_by` / `changed_by` / `imported_by` columns.
- **Verified locally:**
  - Server suite 132/133. The only failure is the pre-existing Gemini model-name assertion, also on `main`; this includes 16 new game tests, and 5 mutation checks each fail as intended.
  - Public-site guard 6/6.
  - `vercel build` emulation: 51 static files and nothing internal; the function bundles `pricing-game.js`; deep routes reach Express; unknown paths get a JSON 404.
  - Headless Chromium run against the real router plus a seeded store, desktop 1440×900 and mobile 390×844, 0 page or console errors:
    - rule fix +15 XP;
    - scan rescue;
    - approve → level-up to Receiver;
    - player card, board and health render.
- **Not verified:** a real Vercel deployment (this container blocks `*.vercel.app`) and a real OCR provider for the rescue path.
- **Next safe action:**
  1. Owner merges #54 (note: merge auto-deploys `kingdom-os`).
  2. Then review this PR and preview it from its SHA.
  3. Click Approve on one review-line invoice in the preview.
  4. Promote only on the owner's go.

## 2026-10-09 — Pricing Hub deploy published the whole repo; fix merged to `main` 2026-10-18 (manual projects still need a deploy)
- **Exposure (owner-confirmed live 2026-10-09):** `vercel.json` had `outputDirectory: "."`, so the `anthony-pricing-hub` production deployment served every tracked file. That included server source, `invoices/` (54 files), `nrs/` POS exports (76), `apps/pricing-hub/index.html` (embedded cost ledger), `apps/pricing-store/index.html`, the `manual-intake-*` / `goya-*` cost records in `pricing-hub/` (vendor costs, case prices, vendor account number), and internal docs. A local `vercel build` of `main` emits **380** static files.
- **Fix (branch `fix/vercel-public-allowlist`):** `vercel.json` now runs `node scripts/build-public-site.js` and serves only `public-build/`. That is an allowlist of the public pages, `assets/` media, `data/sale.json` and the Loading Dock client: **50** files, each byte-identical to what `main` serves today. The 7 records were moved (not deleted) to `invoices/pricing-hub-records/`, and `scripts/build-pricing-store.py` follows them. New CI check **Public site guard** (`scripts/test-public-site.cjs`, every PR and every push to `main`) fails if internals ship, if `vercel.json` reverts, or if a published page references an unpublished file.
- **Verified locally (Vercel CLI 63.1.2 `vercel build`, branch vs `main`):**
  - the static output has no internal paths;
  - the routing config is identical;
  - the `/api/pricing` function bundle is byte-identical (314 files);
  - on a smoke server, `/pricing-hub/`, `/pricing-hub/js/*`, `/sales.html`, `/data/sale.json`, `/api/pricing/health`, `/api/pricing/config` and `POST /api/pricing/login` behave exactly as on `main`, and every formerly exposed path now returns the homepage instead of the file.
  - The secret-pattern scan of all tracked files found no committed credentials.
- **Not verified:** the Vercel preview. This container's network policy blocks `*.vercel.app`, and the session's Vercel connector is not authorized for the `kingdom-noel` projects (403 on preview access).
- **Deploy topology (from the Vercel bot on PR #54):**
  - `anthony-pricing-hub` is **not** Git-connected; deploys are created manually from a SHA, so it gets no automatic preview.
  - `kingdom-os` (`prj_XvYLZQwKGGyEkLYoSRtXvwvWHbYu`) **is** Git-connected with root directory = repo root, so the root `vercel.json` governs it too. **Merging to `main` auto-deploys it to production.** Its production presumably exposes the same files today (unverified).
  - `anthony-supermarket-superkitchen` builds from `apps/superkitchen` and is unaffected.
- **Production still exposes the files** until the owner promotes the fix. Old deployments keep their own URLs and still serve the files unless Deployment Protection covers them.
- **Pre-existing, unchanged by this fix:** paths outside the static output fall back to the homepage (200, not 404). In the emulated routing, multi-segment API paths (`/invoices/:id/approve`, `/invoices/:id/lines`, `/products/:id/history`, `/products/:id/retail`) hit Vercel's `/api` 404 route on both `main` and the branch. Confirm on a real deployment before acting.
- **2026-10-11:** `main`'s #52 polish layer is allowlisted too (`pricing-hub/polish.css`; `js/polish.js` rides the `js/*.js` rule), so the output is 52 files. The guard caught `polish.css` as an unpublished reference before the fix.
- **Previews cannot sign in.** `main`'s 2026-10-09 checkpoint (`docs/checkpoints/pricing-hub-frontend-polish-2026-10-08.md`) found `GET /api/pricing/config` → `storeConfigured:false` on previews: the Preview environment lacks the server-only pricing variables. Manager sign-in is testable only in production until those are added for Preview (server-only, never `VITE_*`).
- **2026-10-18 22:25 ET: the owner squash-merged #54 to `main` (`c57ec8c`).** Its tree is identical to the verified branch head `b085a8e`.
  - `kingdom-os` is Git-connected, so its production builds from `main`. That deploy was not checked from this session.
  - `anthony-pricing-hub` and the project serving `anthony-supermarket.vercel.app` deploy by hand (#57's 2026-10-15 check: `anthony-pricing-hub` on `a290e9f`; the public domain on an older hub with `/api/pricing` → 404). They keep serving their old, whole-repo builds until `main` is deployed to them.
  - Old deployment URLs keep their files either way; protect or delete them after the redeploy.
- PR: **#54** (merged). Decision: `brain/Decisions/2026-10-09-vercel-public-allowlist.md`.
- Next safe action:
  1. Owner runs the PR #54 URL checklist on the `kingdom-os` branch preview (already built from this commit) and/or a manual `anthony-pricing-hub` preview from the branch SHA.
  2. Confirm nothing consumes repo files from `kingdom-os`'s deployment. Kingdom OS historically parses the Pricing Hub file; if it fetches `/apps/pricing-hub/index.html` over HTTP, the merge breaks it.
  3. Merge and promote only on the owner's explicit go.
  4. Then check one old deployment URL for exposure.

## 2026-09-12 — Menu slug mismatch FIXED: stale 'kitchen' no longer 404s (kanban t_d200935c)
- **Defect fixed + regression-guarded.** The Telegram bot `/menu` handler and `/api/menu/:slug` looked up slug `'kitchen'`, but the seed carries slug `'anthonys'` (renamed in 485331a), so the bot answered "Menu not found" and `/api/menu/kitchen` 404'd.
- Changed: `server/menu-seed.js` (new `resolveMenuBySlug(data, slug)` — exact match wins; a single-menu seed also answers unknown slugs so stale references keep working; multi-menu seeds still 404), `server/index.js` (bot `/menu` requests canonical `'anthonys'`; `/api/menu/:slug`, `cat:` and `add:` callbacks use the resolver; category buttons now emit `cat:<real slug>:` instead of hardcoded `cat:kitchen:`), `server/menu-seed.test.js` (+4 unit tests), `server/menu-smoke.test.js` (+1 booted-server regression test).
- Verified: full server suite **117/117 pass** (112 pre-existing + 5 new). Container rebuilt + recreated (`anthony-supermarket-server` healthy in 19s). Live on host port 3401: `/api/health` 200 with 132 items; `/api/menu` 200 (13,403 bytes); `/api/menu/anthonys` 200; **`/api/menu/kitchen` now 200** (was 404).
- Security or rollback notes: no secrets touched; rollback = checkout pre-change `server/index.js` + `server/menu-seed.js` and recreate the container.
- PR/issue/commit: uncommitted on main (kanban t_d200935c; board card t_7c3667b4 unblocked).
- Next safe action: commit + push to main (JelfferyDuran/anthony-supermarket); spot-check the bot `/menu` command in Telegram.

## 2026-09-11 — GitHub Pages disabled; Vercel stays the public site (CI green)
- Decision recorded (accepted): `brain/Decisions/2026-09-11-pages-private-repo.md`.
- Root cause of chronic red CI since 2026-09-05: repo is private (Free plan), so Pages cannot be enabled — every push's "Deploy to GitHub Pages" run failed at `actions/configure-pages` ("Get Pages site failed"; Pages API 404/422). No code defect.
- Fix: `.github/workflows/deploy.yml` now stages only the public surface (root html, `assets/`, `pricing-hub/`); workflow is `disabled_manually` so no further failing runs. Re-enable only if the repo goes public.
- Verified live: repo `private: true`; Pages API 404; workflow state `disabled_manually`; last Pages run (34562817299) failed pre-disable and was triggered by the very push that disabled it — no Pages runs since.
- Main CI green: Shared Brain CI + Super Kitchen CI latest runs success; Storefront resilience is PR-only.

## 2026-09-11 — Menu smoke guard deployed; empty-menu defect CLOSED
- **Defect fixed + guarded.** The container once served `/api/menu` as `{menus: []}` because `server/.env:9` sets a Windows-only `MENU_DATA_PATH` that cannot exist inside the container. Seed resolution now probes layouts (`08baf39`, `server/menu-seed.js`) instead of trusting env precedence, and a new smoke guard makes a zero-item menu impossible to serve:
  - `server/index.js` `loadMenu()` exits(1) on missing/empty/malformed seed — no silent `{menus: []}` fallback.
  - `GET /api/menu` returns **503** (not 200-empty) if 0 items are loaded at runtime.
  - `GET /api/health` returns **503** when 0 items are loaded, and the Docker healthcheck now probes `/api/health` (was `/pricing-hub/`), so an empty-menu regression flips the container unhealthy.
  - `server/menu-smoke.test.js` (wired into `npm test`) boots the real server and asserts: real seed resolves with items, `/api/menu` serves > 0 items, repo-checkout seed is the served one, empty/malformed seeds refuse to boot, and a host-only `MENU_DATA_PATH` falls back to the populated seed.
- Verified live: container rebuilt + recreated on the new image; `docker ps` = healthy; `GET /api/health` = **200**; `GET /api/menu` = **200 with 132 items** (host port **3401** → container 3001). Full test suite: **112/112 pass** (106 pre-existing + 6 smoke guard).
- The healthcheck no longer requires `PRICING_SERVE_STATIC=1`; it asserts menu health instead.
- **Build-context defect fixed:** the repo had no `.dockerignore`, so the build context was the whole repo (~1.4 GB / 40k files) and a local rebuild would have overwritten the container's Linux `node_modules` with Windows binaries (`COPY server/ .` runs after the builder stage) and baked `server/.env` into an image layer. Fixed in `bf60ee7`; context now 697 kB.

## 2026-09-05 storefront growth review — not deployed
- Owner requested research, documented conversion architecture, modern accessible depth, and planning before production deployment.
- Review pack: `docs/growth/CONVERSION_PLAN.md`; bilingual concept: `docs/growth/concept.html`; evidence/verification: `docs/growth/README.md` and `EVIDENCE.md`.
- Current main was inspected at `dfb38b633f8116270d833997f3eaee882dfe363c` through the authenticated GitHub connector. Historical local worktrees and earlier #28/#29 handoffs are not current architecture authority.
- Live `anthony-supermarket.vercel.app` and the Super Kitchen URL returned HTTP 200. In the browser, the root site failed WebGL initialization and remained on its loading overlay with an empty menu. A scoped patch removes the blocking overlay, defers/isolate-catches decoration, preserves readable sections, and restores zoom. This is proposed code, not a live fix.
- The legacy `www.anthonyssupermarket.com` visibly lists all seven days Closed. Vercel says Open Daily but also Sunday CLOSED. Correct store/kitchen/holiday hours and canonical domain ownership require owner verification; none were guessed or changed.
- Current root source still exposes the Pricing Hub/cost-profit UI. Root Vercel output and Pages artifact settings use the repository root. Public-only packaging and selective reconciliation of #28 remain P0 release gates; no claim that all source/data paths were tested publicly.
- GitHub metadata currently reports a private repository and Pages disabled — Pages is now disabled by decision (see `brain/Decisions/2026-09-11-pages-private-repo.md`). Connected Vercel team reports Hobby and no projects; actual production project settings, billing owner, rollout/rollback ID, and Cloudflare DNS remain unverified.
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


## 2026-10-15 — Issue #45 live portal/runtime check
- GitHub `main` HEAD observed at `43ca4d53a07f39af30433878d6e75ab08b086b5a` (Pricing Hub polish, Oct 11). Supabase project `cbpdiiyzzmbavsymjysb` is `ACTIVE_HEALTHY`; `pricing-integrations` is `ACTIVE`, version 1, `verify_jwt=true` (deployed Aug 21).
- Vercel project `anthony-pricing-hub` reports a latest `READY` production deployment from `main` at `a290e9feeb94a20ed193f76d38522bb2eab9b89e` (Oct 10). Its live `/pricing-hub/` URL returned HTTP 200 and the Loading Dock shell. The separate `anthony-supermarket.vercel.app/pricing-hub/` URL also returned HTTP 200 with Catalog, Approval Queue, Price Changes, Invoice Intake, Financials, and Export tabs.
- **Not confirmed:** the checked live page shells and tracked `pricing-hub/js/api.js` route to `/api/pricing`; no served UI or tracked source inspected here exposed `pricing-integrations`, inventory count actions, or POS alias review. Issue #45's statement that this UI is already present on `main` does not match the specific routes inspected; a different manager portal/route may exist and remains unidentified.
- The deployed function source re-verifies bearer JWTs through Supabase Auth and accepts only protected `app_metadata.role` values `manager` or `admin`. GET resources cover inventory, count sessions, products, aliases, and unmatched POS. POST supports start/save/complete/cancel counts and exact alias registration. Service-role use remains server-side.
- No authenticated HTTP smoke test was run: owner manager credentials/session were unavailable. Therefore manager login, each live action, and actual runtime response/data remain unverified. Completing a test count through the live HTTP endpoint would persist inventory balances; do not send a synthetic completion or register a test alias in production. Use GETs plus start/save/cancel only with an owner-authorized disposable session, and validate completion/alias registration in staging or a rollback-only database transaction.
- **Next safe action:** identify the intended manager route and confirm the owner-authorized test identity/target. Then run read-only GET checks and a disposable start/save/cancel pass; reserve complete/register tests for staging or rollback-only verification. Keep generic NRS department buttons unmatched and do not replace Super Kitchen `menu.json` without an approved mapping.


## 2026-10-15 browser-session follow-up
- The selected Chrome browser initially had no open tabs. The production Loading Dock page rendered its shell but showed `DOCK OFFLINE`; the browser console reported that this sandbox could not create a WebGL context, and the app failed before its auth gate. This is a browser-environment limitation, not a production outage signal.
- The separate non-3D `https://anthony-supermarket.vercel.app/pricing-hub/` page rendered the existing staff Pricing Hub with an embedded catalog fallback and showed `Pricing service unreachable (HTTP 404)`. Its visible tabs still omit inventory counts and POS alias review. No user login/session was confirmed, no form was submitted, and no price or catalog value was changed.
- Therefore the authenticated `pricing-integrations` HTTP smoke test remains unrun. The first blocker is locating a valid signed-in manager browser session/portal path; the current page's legacy `/api/pricing` 404 is a separate service path and does not verify the Edge Function.
