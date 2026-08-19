# Current State — Anthony's Supermarket

Last updated: 2026-08-19

This file is operational context, not a secret store. Verify live state before consequential actions.

## Repository
- Canonical repo: `JelfferyDuran/anthony-supermarket`
- Default branch: `main`
- Repository root is also the shared Obsidian vault.
- Human/agent working brain: `brain/`
- Customer/KDS code: `apps/superkitchen`
- Supabase code/migrations: `supabase/`
- Isolated Telegram bot v2 runtime: `server/bot-v2/`

## Shared Obsidian brain
- Obsidian should open the repository root directly; no second writable mirror is required.
- Home/navigation note: `brain/00 - Anthony HQ.md`.
- Working folders: `brain/Inbox/`, `brain/Decisions/`, `brain/Sessions/`, `brain/Attachments/`.
- `docs/agent-context/` remains the canonical operational-state and cross-agent handoff layer.
- GitHub provides version history, backup, PR review, collaboration, and rollback for the brain.
- Local `.obsidian/` state is ignored and must not be committed.
- Shared Brain CI enforces allowed lightweight file types, 2 MB maximum brain-file size, no tracked `.obsidian/` state, canonical entry points, and obvious-secret scanning.
- Live infrastructure remains authoritative for runtime state when notes and deployed systems disagree.

## Current Super Kitchen workstreams
- Secure Phase 1 cutover branch: `phase1-cutover-v3`
- UI polish branch: `phase1-ui-polish`
- Kitchen Dashboard branch: `phase2-kitchen-dashboard`
- Phase 2A draft PR: #21 `Phase 2A: merchant-style kitchen dashboard`
- Obsidian brain node branch: `obsidian-brain-node-v1`
- Bodeguetto Content Engine (NEW 2026-08-15): store-signal → content pipeline for @bodeguetto TikTok — see `brain/Projects/Bodeguetto Content Engine.md`. Local repo `/opt/data/projects/bodeguetto-content-engine`; remote pending owner creation (PRIVATE). Phase 1 (signals + capture missions) acceptance-tested. No publishing.

## Kitchen Dashboard status
Phase 2A currently provides:
- authenticated staff entry via `?staff=1`
- staff roles accepted by the backend: `kitchen`, `manager`, `admin`
- four live lanes: New / Cooking / Ready / Done
- authenticated order polling
- elapsed-order timers and urgency states
- pickup/delivery indicators
- one-tap legal state transitions
- connection/sync status
- optional audible new-order alert
- stale unresolved tickets separated into a `Needs Review` workflow instead of being silently deleted/closed

First Supabase Auth staff/admin user has been provisioned and confirmed working in preview. Never record its password here.

## Supabase production baseline
- Project ref: `cbpdiiyzzmbavsymjysb`
- Customer/order Edge Function: `superkitchen`
- Live infrastructure check on 2026-08-08 reported `superkitchen` version 27; inspect live source before assuming version equivalence with a branch.
- Direct anonymous order-list/order-board access is blocked.
- Server controls authoritative menu pricing.
- Orders use an audited server-enforced state machine.
- RLS is enabled with deny-by-default posture for direct client database access.
- Durable order audit and rate-limit protections exist.
- Telegram Mini App `initData` is verified server-side when a valid fresh bot secret is configured.
- Delivery validation/address handling is part of the staged cutover contract; coordinate frontend/backend deployment together.

## Hermes / machine observer
- Dedicated read-only Edge Function `superkitchen-ops` version 2 is deployed and ACTIVE.
- Supabase reports `verify_jwt=true` for `superkitchen-ops`.
- Observer roles accepted by the function: `agent_observer`, `manager`, `admin`.
- The endpoint is GET-only and returns non-PII operational summaries: order counts, status counts, last-24h gross sales excluding cancelled orders, delivery-type counts, audit-transition counts, recent order references/timestamps, and freshness/age indicators.
- It does not return customer names, phones, addresses, notes, or Telegram identities.
- Dedicated Hermes Auth user `kingdom-hermes@agentmail.to` is confirmed and has protected `app_metadata.role=agent_observer`.
- Hermes must not receive the Supabase service-role key for this workflow.
- Hermes still needs its observer email/password plus the project publishable key configured only in its protected VPS environment before the authenticated smoke test can run.
- VPS smoke-check client: `scripts/hermes-ops-check.mjs`.
- Setup/security contract: `docs/agent-context/HERMES_ACCESS.md`.

## Telegram
- Customer bot: `@Anthonysuperkitchen_bot`
- Historical token was exposed in Git history and has been revoked. Never recover or reuse it.
- A replacement token exists outside the repository.
- Mini App frontend and command bot are separate runtimes.
- Command handlers live in `server/bot-v2/`; the bot requires a persistent Node host and `TELEGRAM_TOKEN` supplied only as a server-side secret.
- Do not run two Telegram long-polling instances for the same bot token. `409 Conflict` on `getUpdates` means another poller/webhook owns updates.

## Frontend/deployment
- Vercel project has been created for Super Kitchen and production from `main` has been observed working.
- Preview deployments are used for feature branches before production.
- GitHub Pages/tracked `dist/` has permanent source↔build consistency checks.
- Do not point production to feature branches during testing.

## Public website (root `index.html`)
- Served on Vercel: `https://anthony-supermarket.vercel.app` (manual CLI deploys; `vercel.json` at repo root forces static output). GitHub Pages URL is DEAD — do not link it.
- Single-file bilingual (EN/ES) storefront: hero, Shop by Department (photo cards), Weekly Specials, Menu (embedded catalog), Pricing Hub (iframe → `pricing-hub/index.html`, canonical copy of `apps/pricing-hub/`), Visit Us (map/hours/call).
- v6 responsive (2026-08-17): hamburger drawer nav on mobile, Order-on-Telegram CTAs (nav + hero → `t.me/Anthonysuperkitchen_bot`), safe-area/dvh/touch-target CSS, scroll-padding, reveal fallback (reduced-motion + timeout).
- Sales page `sales.html` — v2 rebuild (issue #31 DONE): Three.js removed, CSS scroll-snap product rack driven by `data/sale.json` (7 Rummo shapes), recipes + poster retained, bilingual.
- IG links hub `links.html` — bilingual Linktree-style page for the Instagram bio (same Vercel origin).
- Policies: `terms.html` + `privacy.html` on the main site AND on `anthony-policies.vercel.app` (now has index page; separate manual deploy).
- Weekly Specials computed from embedded catalog (`SPECIALS` + `renderSpecials()`).

## Super Kitchen miniapp + staff portal
- Customer app: `https://anthony-supermarket-superkitchen.vercel.app` (git-linked to main, rootDir `apps/superkitchen`, framework vite, `vercel.json` pins build).
- Staff portal (2026-08-17): append `?staff=1` → Supabase Auth login (email/password) → role-gated dashboard: Kitchen tab (order lanes recibido/preparando/listo/completado/cancelado, 20s poll, audited transitions via `staff_update_order_status`) + Store tab (manager/admin: 24h gross sales, by-status, pickup/delivery, recent orders, transition counts via `superkitchen-ops`). Code in `apps/superkitchen/src/{components/AdminApp,StaffLogin,KitchenBoard,StoreBoard}.jsx` + `lib/{supabaseClient,staffApi}.js`.
- Known issue: `MINIAPP_URL` const in live `superkitchen` edge fn points at dead GitHub Pages URL — needs a careful function redeploy (diff live source first).
- Vercel env set: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (prod + preview).

## Pricing Hub (staff pricing / invoice pipeline)
- App: `apps/pricing-hub/index.html`; the website iframes the synced copy at root `pricing-hub/index.html`. Both must stay identical — `scripts/verify-pricing-hub.js` enforces it.
- **v2 (2026-08-19):** UI rebuilt on a Supabase data layer with the embedded arrays as an offline fallback that renders first, so the hub never blank-screens. Tabs: Catalog, Approval Queue, Price Changes, Export. Adds per-item price-history timeline, cost-variance flags, price-gun label export (`item_name,upc,price,department`) and catalog CSV export. Vendor/invoice/category/search filters, the 65% markup slider and `.99` rounding all retained.
- **Kingdom OS dependency (do not break):** the OS collector parses this file every 2h and its write-back endpoint patches item lines in place. `const VENDORS = {…}` and `const ALL_ITEMS = […]` are kept byte-for-byte in one-object-per-line format; the verifier asserts that contract structurally.
- Embedded dataset: 157 items · 3 vendors · 9 invoices. (Earlier notes said 4 vendors; the registry has 3 — Super Trading, Hershey's Ice Cream, Family Food Distributors.)
- Retail edits are **server-authoritative**: the browser proposes, `PATCH /api/pricing/products/:id/retail` decides, and the database records who changed it. With no server reachable, edits are session-local and labelled as such.

## Invoice pricing pipeline (Supabase)
- Migrations: `supabase/migrations/20260812013000_add_invoice_pricing_pipeline.sql` (tables, SHA-256 idempotency, UPCs as text) and `20260819213000_reconcile_pricing_hub_dataset.sql` (hub-shape columns, private storage bucket, immutable-history trigger, approval transaction, label export).
- **Not yet applied to production.** Applying it is an owner-approved deployment step.
- Seed: `node scripts/seed-pricing-from-hub.js` reads the embedded arrays and writes a reviewable SQL seed to `supabase/seed/pricing_hub_seed.sql`. `--check` fails on drift; `--apply` upserts via the server-side service role. Ids are UUIDv5 of natural keys, so it is idempotent.
- Reconciliation result: 157 hub rows → **146 products · 157 invoice lines · 11 price transitions**. The 11 are repeat purchases of the same vendor SKU, which are price changes rather than duplicate products. Historical invoices carry status `backfilled` — never `approved` — because no manager approved them.
- Endpoints live under `/api/pricing` (`server/pricing-router.js`). Three identities: a Supabase manager/admin JWT (the only one that may approve), a shared `PRICING_MANAGER_TOKEN` (read/extract, cannot approve), and `PRICING_AGENT_KEY` for Hermes (calculator only).
- Service-role key is read only by `server/pricing-store.js`, server-side. It is never bundled for the browser, the Telegram runtime, or a general-purpose VPS agent.
- Invoice scans live in a **private** Supabase Storage bucket (`pricing-invoices`), reachable only via 5-minute signed URLs. Scans are never committed to this repo.
- Telegram `/price` and `/caseprice` are allowlist-gated calculators; unlisted chats get no response at all.
- **PR #32 is superseded, not merged** — it was 16 commits stale and would have wiped the 157-item catalog and corrupted `server/index.js`. See `brain/Decisions/2026-08-19-pricing-hub-v2-supabase-cutover.md`.
- Verification: `node scripts/test-pricing-migrations.js` applies both migrations to a throwaway PostgreSQL instance and asserts the SQL guarantees; `node --test server/pricing-engine.test.js server/pricing-pipeline.test.js` covers the math and a full end-to-end run.

## Phase 2 roadmap
- #17: Merchant Operations Platform epic
- #18: Kitchen Dashboard MVP
- #19: Admin / Manager Dashboard MVP
- #20: Customer tracking, realtime operations, reliability

Recommended sequence:
1. Finish/test Kitchen Dashboard with one controlled real order.
2. Verify DB status transitions and audit log.
3. Finish secure production cutover.
4. Build Admin/Manager Dashboard.
5. Add customer status tracking/Telegram notifications.
6. Add payment/delivery/POS/inventory integrations only after the order lifecycle is stable.

## Data caution
Production contains older unresolved orders from earlier testing/usage. Do not bulk-complete or delete them automatically. Review explicitly and preserve audit history.
