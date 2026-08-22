# pricing-catalog

Read-only approved Pricing Hub catalog surface for Phase D consumers.

- Supabase Edge Function with `verify_jwt=true`.
- GET/OPTIONS only.
- Returns approved active sellable product identity + retail price.
- Never returns cost, vendor invoice internals, service-role credentials, or mutation capability.
- Binding business rule remains cost × 1.70; callers consume the approved retail price and do not recalculate it.

Production deployment was observed ACTIVE as version 1 on 2026-08-21. Source merge reconciles Git with that deployed function; it is not a new cutover by itself.
