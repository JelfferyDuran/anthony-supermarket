# Pricing Hub V3 — Catalog Arcade

## Context
Phase 3 for the Anthony's Supermarket Pricing Hub adds a restrained game layer on top of the existing single-file catalog, plus backend hardening and auditability.

## What changed
- Added an arcade dashboard with XP, levels, streaks, badges, mission progress, freshness, margin watch, and activity feed.
- Added manager sign-in, duplicate invoice handling, inline scan preview, and inline price-history charts to the hub UI.
- Added a pricing-hub Express API, persistent store, seed extraction from the embedded hub catalog, tests, verification script, and a Supabase migration.

## Verification
- `node --check` passed on the new server files and test file.
- `node scripts/verify-pricing-hub.js` passed.
- `npm test` in `server/` passed with 7 tests.

## Notes
- Offline/static-file mode still works because the hub keeps the embedded `VENDORS` and `ALL_ITEMS` contract.
- Server-side persistence uses a dedicated JSON state file for dev/local use until the Supabase-backed tables are wired in deployment.
