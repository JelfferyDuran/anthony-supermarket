# Current State — Anthony's Supermarket

Last updated: 2026-08-08

This file is operational context, not a secret store. Verify live state before consequential actions.

## Repository
- Canonical repo: `JelfferyDuran/anthony-supermarket`
- Default branch: `main`
- Customer/KDS code: `apps/superkitchen`
- Supabase code/migrations: `supabase/`
- Isolated Telegram bot v2 runtime: `server/bot-v2/`

## Current Super Kitchen workstreams
- Secure Phase 1 cutover branch: `phase1-cutover-v3`
- UI polish branch: `phase1-ui-polish`
- Kitchen Dashboard branch: `phase2-kitchen-dashboard`
- Phase 2A draft PR: #21 `Phase 2A: merchant-style kitchen dashboard`
- Hermes observer branch: `agent-observer-access-v1`

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
- Dedicated read-only Edge Function `superkitchen-ops` version 1 is deployed and ACTIVE.
- Supabase reports `verify_jwt=true` for `superkitchen-ops`.
- Observer roles accepted by the function: `agent_observer`, `manager`, `admin`.
- The endpoint is GET-only and returns non-PII operational summaries: order counts, status counts, last-24h gross sales excluding cancelled orders, delivery-type counts, audit-transition counts, recent order references/timestamps, and freshness/age indicators.
- It does not return customer names, phones, addresses, notes, or Telegram identities.
- A dedicated Hermes Auth user with `app_metadata.role=agent_observer` still needs to be created before Hermes can authenticate to this endpoint.
- Hermes must not receive the Supabase service-role key for this workflow.
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
At the time this file was created, production contained older unresolved orders from earlier testing/usage. Do not bulk-complete or delete them automatically. Review explicitly and preserve audit history.
