# Phase 3 Plan — Pricing Hub V3 "Catalog Arcade"

## Goal
Upgrade the Pricing Hub V2 into a daily operational tool that still reads as a serious pricing workspace:
- add a restrained game layer tied only to real actions
- add auditability and backend hardening
- keep the single-file hub usable offline with embedded data
- preserve the embedded `VENDORS` / `ALL_ITEMS` contract used by the OS collector

## Scope
### Frontend
- Add XP, level names, streaks, achievement badges, count-up metrics, progress rings, freshness heat, mission card, and small inline price-history charts.
- Keep motion subtle and disable or reduce it when `prefers-reduced-motion` is set.
- Keep game UI layered on top of the pricing data, never replacing the core table.
- Preserve offline behavior when the hub is opened as a static file.

### Backend
- Add structured JSON error handling, request logging, health checks, and graceful shutdown.
- Add input validation, login/inventory rate limiting, pagination/search, audit log access, margin watch, CSV dry-run validation, duplicate-invoice detection, and item history endpoints.
- Keep service-role access server-only and deny-by-default for direct client access.

### Data / Migrations
- Add only new migrations for pricing-hub tables or extensions.
- Do not edit applied migrations.
- Keep 70% markup server-authoritative and preserve SHA-256 idempotency where used.

### Tests / Verification
- Extend server tests in `server/`.
- Extend `scripts/verify-pricing-hub.js` so it checks the hub contract and the new backend surface.
- Verify the existing suite still passes.

## Delivery Order
1. Confirm the existing data contract and current server behavior.
2. Add backend primitives and tests.
3. Layer the frontend game UI on top of the existing pricing hub.
4. Add/adjust migrations only if the new endpoints require persisted tables.
5. Run the full server test suite and verification script.
6. Update agent context and handoff notes, then open the PR.
