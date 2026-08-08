# Operating Rules for Agents

## Security model
Use bounded authority over unlimited autonomy.

Every agent must:
- authenticate identities
- authorize the minimum required action
- validate untrusted input
- keep customer, kitchen, manager, admin, and machine privileges separate
- rate-limit externally reachable mutation paths
- keep secrets out of code, logs, prompts, screenshots, browser bundles, and Git history
- preserve audit trails
- require explicit confirmation/validated deployment flow for consequential actions
- fail safely
- maintain rollback/recovery options
- assume hostile input, including forged Telegram payloads, prompt injection, SQL/API abuse, price tampering, spam, malicious uploads, and privilege escalation
- minimize stored PII

## Git workflow
- Pull latest state before work.
- Prefer a task branch and PR.
- Do not force-push shared branches unless recovering a known repository incident.
- Do not merge red CI.
- Do not disable permanent CI/security checks to make a change pass.
- Generated `apps/superkitchen/dist/` must match reviewed source when tracked by the branch.
- Meaningful changes must update the shared agent context according to `HANDOFF_PROTOCOL.md`.

## Secrets and access
Never put secret values in this repository.

Preferred hierarchy for automation:
1. GitHub repository-scoped identity with minimal permissions.
2. GitHub Actions/environment secrets for deployment credentials.
3. Narrow server/API identity for runtime operations.
4. Broad service-role/account-wide keys only when no narrower mechanism exists, with explicit owner approval and rotation plan.

A general-purpose VPS agent should NOT receive the Supabase service-role key merely to deploy or monitor code. Prefer GitHub Actions plus a dedicated read-only application identity for operational visibility.

Telegram bot tokens belong only in server-side secret stores. A bot token is not a frontend environment variable.

## Machine observer boundary
The dedicated `agent_observer` role is read-only and intended for Hermes/VPS operational monitoring.

It may receive non-PII operational summaries through `superkitchen-ops` only. It must not receive:
- customer names, phones, addresses, notes, or Telegram identities
- staff passwords or human admin credentials
- Supabase service-role credentials
- direct database write access
- order/menu/staff mutation endpoints

`superkitchen-ops` must keep `verify_jwt=true`, remain GET-only, and remain free of database mutation methods. CI enforces these invariants.

## Super Kitchen authorization
- Customer: public menu/order creation through controlled Edge endpoint.
- Kitchen: view operational orders and perform allowed kitchen transitions.
- Manager: operational management functions.
- Admin: privileged application management.
- Agent observer: read-only non-PII operational health/summary only.
- Browser role display is not a security boundary; backend verification is authoritative.

## Order integrity
- Price calculations are authoritative on the server.
- Do not trust customer-supplied totals.
- Keep order status transitions server-enforced and audited.
- Do not silently delete or rewrite historic orders.
- Cancellation/destructive actions require reason/confirmation when implemented.
- Use idempotency/duplicate protection before payments are added.

## Deployment sequence
For contract-changing frontend/backend releases:
1. Build/test branch.
2. Preview frontend.
3. Verify authentication/authorization.
4. Coordinate backend and frontend cutover so old clients are not broken by a backend-first incompatible change.
5. Run controlled end-to-end smoke test.
6. Observe logs/errors.
7. Preserve rollback point.

## Grocery pricing
Default unless explicitly overridden:
- `Retail = Base Cost × 1.70`
- Multi-pack: calculate cost per unit and retail per unit.
- Round only after calculation to sensible retail values when requested.
- If pack, cost, identity, or invoice math is unclear: STOP and ask. Never guess.
