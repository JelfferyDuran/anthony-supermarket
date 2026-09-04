# PR Draft — Pricing Hub V3 — Catalog Arcade (game layer + hardening)

## Summary
This PR upgrades the Pricing Hub V2 into a daily-use pricing workspace with a restrained game layer, stronger backend hygiene, and more operator-facing tooling.

## What changes
- Adds real-metric XP, levels, streaks, achievements, and mission progress to the hub UI.
- Adds audit/feed surfaces, price history charts, margin watch, and better search/pagination.
- Hardens the Node/Express backend with structured errors, validation, request logging, rate limiting, and graceful shutdown.
- Extends validation and verification so the hub still works offline with embedded data and keeps the existing `VENDORS` / `ALL_ITEMS` contract intact.

## Verification
- Run `npm test` in `server/`.
- Run `node scripts/verify-pricing-hub.js`.
- Manually check the hub UI in both networked and static-file/offline mode.

## Notes
- No production deployment is included.
- No applied Supabase migrations are edited.
- Server-authoritative 70% markup remains unchanged.
