# pricing-integrations

Manager/admin-only Phase D integration surface.

- Supabase Edge Function with `verify_jwt=true`.
- Re-verifies the caller and reads authorization only from protected `app_metadata`.
- GET: inventory balances/count sessions, safe product lookup, approved aliases, unmatched POS summary.
- POST: start/save/complete/cancel count sessions and register exact POS aliases.
- Service-role credential stays inside the function.
- POS aliasing is exact evidence only; conflicts remain unmatched rather than guessed.

Production deployment was observed ACTIVE as version 1 on 2026-08-21. Source merge reconciles Git with that deployed function; it is not a new cutover by itself.
