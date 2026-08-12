# Shared Agent Session Log

Append-only operational handoffs. Do not store secrets, passwords, tokens, service keys, or customer PII here.

## 2026-08-08 12:12 ET â€” ChatGPT
- Goal: establish one canonical repository-based knowledge/handoff layer for all authorized agents.
- Changed: added root `AGENTS.md`, `CURRENT_STATE.md`, `OPERATING_RULES.md`, and `HANDOFF_PROTOCOL.md`.
- Verified: current Super Kitchen work includes secure cutover, UI polish, and Phase 2A Kitchen Dashboard; protected staff login is working in preview; repository has permanent security/build guardrails.
- Not verified / blockers: persistent Telegram command-bot host still needs to be treated as a separate runtime and verified independently; do not infer it from Mini App availability.
- Security or rollback notes: no secrets are stored in the knowledge base; agents must use scoped credentials and PR workflows.
- PR/issue/commit: knowledge branch `agent-knowledge-base-v1`; Phase 2 epic #17; Kitchen #18; Admin #19; operations #20; KDS PR #21.
- Next safe action: merge this documentation-only knowledge layer, then configure Hermes with a repository-scoped GitHub credential and have it read `AGENTS.md` at startup.

## 2026-08-08 15:21 ET â€” ChatGPT
- Goal: give Hermes useful operational visibility without handing the VPS a Supabase service-role key or production mutation authority.
- Changed: created `superkitchen-ops` as a separate GET-only Edge Function, added `agent_observer` authorization, added `scripts/hermes-ops-check.mjs`, documented `HERMES_ACCESS.md`, and added permanent CI guards for JWT verification, PII exclusion, read-only behavior, and service-role exclusion from the Hermes client.
- Verified: Supabase deployed `superkitchen-ops`; later validation aligned the live function to version 2 ACTIVE with `verify_jwt=true`; CI #88 passed the observer Deno type-check and security invariants. Live `superkitchen` was reported as version 27 during the same infrastructure work.
- Security or rollback notes: customer/order function was not modified; no database schema was changed; observer endpoint contains no mutation routes and no customer PII fields. Rollback is isolated to disabling/removing `superkitchen-ops`.
- PR/issue: observer PR #23 merged into `main`; onboarding checklist #24 tracks runtime activation.
- Next safe action: provision the dedicated Hermes observer identity and run the authenticated VPS smoke test.

## 2026-08-08 22:02 ET â€” ChatGPT
- Goal: activate the dedicated Hermes observer identity without broadening its authority.
- Changed: no schema or application code changes. Updated only protected Auth app metadata for the dedicated machine account.
- Verified: `kingdom-hermes@agentmail.to` exists in Supabase Auth, is email-confirmed, and now has `app_metadata.role=agent_observer`.
- Not verified / blocker: Hermes has not yet demonstrated an authenticated request from the VPS because its password and publishable key still need to be configured in `/opt/data/anthony-ops.env` and `scripts/hermes-ops-check.mjs` still needs to be run there.
- Security notes: no password, publishable key, service-role key, or customer PII was written to GitHub. Hermes remains GET-only through `superkitchen-ops`; do not grant `SUPABASE_SERVICE_ROLE_KEY`.
- Next safe action: configure the observer email/password and publishable key directly on the Hermes VPS, run the smoke test, then record only the non-secret pass/fail result.

## 2026-08-09 00:07 ET â€” ChatGPT
- Goal: add Obsidian as the shared human/agent brain and lightweight backup workflow without creating duplicate writable knowledge stores.
- Changed: made the repository root the intended Obsidian vault, added `brain/00 - Anthony HQ.md`, Inbox/Decisions/Sessions/Attachments workspaces, updated `AGENTS.md` and the handoff protocol, ignored local `.obsidian/` state, and added Shared Brain CI guards for file types, size, obvious secrets, and canonical entry points.
- Verified: implementation is isolated to repository knowledge/workflow files; no runtime application, database, pricing, auth, or customer-order behavior was changed.
- Not verified / blocker: Obsidian itself has not yet been opened against the repo on the Hermes VPS/desktop; local UI/plugin state remains intentionally outside Git.
- Security or rollback notes: no credentials or customer PII belong in the vault; brain attachments are limited to approved lightweight formats under 2 MB; live infrastructure remains authoritative over notes.
- Branch: `obsidian-brain-node-v1`.
- Next safe action: run Brain CI, merge if green, then have Hermes pull `main` and open/use the repository root as its Obsidian vault.

## 2026-08-09 20:30 ET â€” Hermes
- Goal: upgrade the public storefront website (owner request, option 1) without breaking the bilingual single-file app.
- Changed: root `index.html` gained a Shop-by-Department section (4 photo cards using new `assets/depts/*.webp` images), a Weekly Specials section computed from the embedded catalog (`SPECIALS`, `findCatalogItem()`, `renderSpecials()` â€” no hardcoded prices), nav links for both sections, an embedded Google Map in Visit Us, and a scroll-spy update. Also fixed a latent init bug: `setLang(sl)` ran before `filterTags` was defined, which threw and left the page stuck on the loading overlay for returning visitors with a saved language; the saved-language restore now runs after init.
- Verified: `node --check` on extracted JS passes; browser regression confirms 6 special cards with real catalog prices, EN/ES toggle translates all new sections, department cards switch menu tabs, map iframe loads, all 4 WebP images load, no JS console errors.
- Not verified / blockers: not yet merged or deployed; final visual brightness of department photos is AI-generated imagery (not real store photos); the observer smoke test remains blocked on the missing VPS password/publishable key.
- Security or rollback notes: no secrets, service-role keys, or customer PII added; images are local WebP assets; rollback is a revert of this branch.
- Branch: `website-v5-departments-specials`.
- Next safe action: review and merge the PR, confirm GH Pages deploy, then continue Phase 2A kitchen dashboard (PR #21) per owner sequencing.

- 2026-08-10: Added NRS POS daily sales intelligence pipeline (`nrs/`). Analyzer (nrs-analyze.py) reads NRS portal CSV exports from nrs/inbox/, computes daily KPIs + leak flags (voids/refunds/no-sales/discounts/cashier stats/trend anomalies), appends to nrs/data/daily_history.json, writes briefing to nrs/reports/. Daily Hermes cron "Anthony's NRS Daily Sales Report" (07:30 ET) attempts browser fetch of mystore.nrsplus.com CSV Download report, falls back to manual inbox drop. Creds go in nrs/.env (NRS_USER/NRS_PASS, gitignored).

## 2026-08-12 00:15 ET â€” Codex
- Goal: establish a safe invoice-photo/PDF to unit-cost, retail-price, product database, and price-gun label workflow while separating the operational system from the Enatega customer app.
- Changed: added a server-only Supabase migration for vendors, products, vendor SKUs, invoices, extracted lines, price history, and label batches; documented the controlled workflow and repository boundary; installed the reusable `anthony-invoice-pricing` Codex skill; opened draft SuperApp PR #4 with the Anthony PWA identity and brand boundary.
- Verified: the skill passed `quick_validate.py`; a two-line fixture preserved a leading-zero UPC, calculated $48 / 24 = $2 unit cost and $3.40 retail, exported only the approved row, and blocked the ambiguous row. SuperApp manifest JSON was written through GitHub's contents API.
- Not verified / blockers: the SQL migration has not been applied; no OCR provider, upload API, approval transaction, or Pricing Hub UI is connected; SuperApp could not be cloned locally due Windows Git TLS credential-provider failure, so no full build ran. Mobile configuration still contains upstream Expo identifiers and map configuration and must not be released.
- Security or rollback notes: pricing tables are RLS-enabled and grant no direct anon/authenticated access; invoice images must remain private; OCR cannot auto-approve prices. Roll back by reverting this feature branch and closing draft PR #4; no production database or deployment changed.
- PR/issue/commit: `anthony-supermarket` branch `feature/invoice-pricing-pipeline`; `anthony-superapp` draft PR #4.
- Next safe action: review the migration, implement authenticated manager/admin upload-review-approve endpoints, then replace mobile credentials/assets surface by surface and run full builds.

## 2026-08-12 00:45 ET â€” Codex
- Goal: make the invoice workflow visible as a safe demo and establish a permanent GitHub registry for agent-created skills.
- Changed: replaced the placeholder Pricing Hub with an interactive invoice-review demo; added the `anthony-invoice-pricing` skill registry and standing registration rule to `AGENTS.md`.
- Verified: headless Chromium loaded the page, rendered two extracted lines, preserved one approved/one review-blocked state, downloaded `price-gun-T-100.csv`, and reported no console errors. Screenshot captured in the Codex task outputs.
- Not verified / blockers: demo extraction is fixture-based; real PDF/image OCR, private storage, authenticated approval, and production database writes remain unconnected.
- Security or rollback notes: the demo does not upload files or write a database. Revert the Pricing Hub file and registry commit to roll back.
- PR/issue/commit: draft PR #32.
- Next safe action: connect private object upload and server-side OCR behind manager/admin authentication, preserving the current review gates.

## 2026-08-12 01:35 ET â€” Codex
- Goal: connect the Pricing Hub and Hermes/Telegram to one authoritative pricing formula while improving the staff demo workflow.
- Changed: added a shared decimal-safe pricing engine, authenticated calculation and invoice-extraction routes, OCR webhook adapter, API-aware Pricing Hub states, and allowlisted Telegram `/price` and `/caseprice` commands. Updated the custom-skill registry and workflow contract.
- Verified: three pricing-engine tests pass; Node syntax checks pass; local API capability and calculation smoke checks returned multiplier 1.70 and $4.23 for $2.49 unit cost.
- Not verified / blockers: no production deployment or Telegram chat smoke test was performed; real invoice OCR needs a protected webhook configuration; private storage and database approval transactions remain pending.
- Security or rollback notes: Telegram pricing commands are restricted by chat ID and perform no writes; the agent key and manager token remain server-side; no credentials or invoice data were committed. npm reports inherited vulnerabilities in the existing Telegram dependency chain, including two critical findings with no upstream fix currently offered.
- PR/issue/commit: draft PR #32 on `feature/invoice-pricing-pipeline`.
- Next safe action: configure protected OCR and Telegram allowlist secrets in a staging runtime, test with a non-sensitive invoice, then implement private storage and audited approval writes.
