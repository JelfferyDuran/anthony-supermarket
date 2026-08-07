# Anthony's Super Kitchen — Phase 1 Security Baseline

## Purpose
This document defines the minimum production-safety baseline for the Super Kitchen Mini App before expanding kitchen, admin, inventory, or AI capabilities.

## Verified current architecture
- Frontend: React + Vite in `apps/superkitchen`
- Public frontend deployment: GitHub Pages
- Backend: Supabase Edge Function `superkitchen`
- Database: Supabase Postgres `public.orders`
- Telegram handoff: `@Anthonysuperkitchen_bot`

## Verified strengths
- Authoritative product lookup occurs server-side.
- Client-provided prices are not trusted for final order totals.
- Quantity is clamped server-side.
- Product/meat/side IDs are validated against a server-side menu definition.
- RLS is enabled on `public.orders`.

## Verified risks
### Critical privacy boundary
Current RLS policies allow `SELECT` on all `orders` rows to the public role. The active Edge Function also exposes unauthenticated `GET /orders` and `GET /orders/:id` routes. Order rows contain customer name and optional phone information.

### Public mutation abuse
Order creation is intentionally public but currently has no explicit rate-limit or Telegram identity validation. This permits spam/fake-order abuse unless another upstream control exists.

### Deployment integrity
Production has no recorded Supabase migration history. Database security changes therefore need to be introduced as versioned migrations with rollback notes.

### Edge Function authentication
`superkitchen` currently runs with `verify_jwt=false`. This can be acceptable for intentionally public endpoints only when sensitive routes implement their own strong authentication.

## Role model
1. Anonymous customer
   - Read menu/public configuration only
   - Create a constrained order
   - No broad order read access

2. Telegram customer
   - Same permissions as anonymous customer plus access to orders tied to verified Telegram identity/order capability

3. Kitchen staff
   - Read active kitchen orders
   - Update allowed kitchen states only
   - Cannot modify authoritative prices or grant roles

4. Manager/Admin
   - Product/menu management
   - Refund/cancel/admin workflows
   - Staff management
   - Audited access

5. Bot/Service
   - Server-to-server access only
   - Dedicated secret/service identity
   - Least privilege

## Mandatory guardrails
- Default deny for sensitive reads and writes.
- Never trust client price, total, role, Telegram user ID, or order ownership claims.
- Validate Telegram `initData` server-side before treating Telegram identity as authenticated.
- Use explicit staff/admin authorization for privileged endpoints.
- Remove public database SELECT access to customer order rows.
- Keep service-role credentials server-side only.
- Rate-limit public order creation and reject oversized payloads.
- Add idempotency/duplicate-order protection before payment integration.
- Log consequential staff/admin state changes.
- Keep rollback instructions for DDL and Edge Function releases.
- No destructive production migration without a verified recovery path.

## Safe implementation sequence
1. Build protected read paths in a branch/staging environment.
2. Add versioned RLS migration denying public order SELECT.
3. Move privileged reads to authenticated server-side access.
4. Validate customer order access through Telegram identity or an unguessable capability token.
5. Add staff/admin roles and audit logging.
6. Add abuse controls for public order creation.
7. Test customer ordering, bot handoff, kitchen flow, and rollback.
8. Deploy production only after verification.

## Gold Star Phase 1 exit gate
Phase 1 cannot be Gold unless:
- Security & Safety >= 16/20
- Integrity >= 12/15
- No known public customer-data exposure remains
- Production changes are versioned and reversible
