# Anthony's Supermarket — Agent Entry Point

This repository is the canonical shared context for AI agents working on Anthony's Supermarket systems.

## Required read order before making changes
1. `docs/agent-context/CURRENT_STATE.md`
2. `docs/agent-context/OPERATING_RULES.md`
3. `docs/agent-context/HANDOFF_PROTOCOL.md`
4. If operating from Hermes/VPS automation: `docs/agent-context/HERMES_ACCESS.md`
5. Relevant code, migrations, issues, and PRs for the task.

Do not rely on cached local memory when repository state disagrees with it. Pull/rebase first and treat the repository plus live infrastructure checks as source of truth.

## Core rule
Build fast where mistakes are reversible. Build deliberately where consequences are irreversible.

## Authority boundaries
- Never commit secrets, tokens, passwords, service-role keys, customer PII, or private credentials.
- Never expose Supabase service-role credentials to browser code, Telegram clients, or general-purpose VPS agents.
- Never give a machine identity more privilege than its task requires.
- Do not bypass authentication, RLS, audit logging, server-authoritative pricing, or state-machine validation.
- Use branches and pull requests for meaningful code changes.
- Production deployments, destructive database changes, secret rotation, role escalation, and irreversible actions require an explicit validated deployment path and rollback plan.
- An agent may prepare or test a deployment, but must not silently destroy data or weaken safeguards.

## Shared-context duty
After materially changing architecture, deployment state, security posture, active branches/PRs, data model, or operational workflow, update `docs/agent-context/CURRENT_STATE.md` and append a short entry to `docs/agent-context/SESSION_LOG.md` in the same PR.

## Project priorities
1. Secure and reliable customer ordering.
2. Kitchen operations dashboard.
3. Admin/manager dashboard.
4. Customer tracking and notifications.
5. Payments/delivery only after order lifecycle is stable.
6. Later integration into the wider Anthony's SuperApp/inventory/POS ecosystem.

## Business pricing rule
Unless the owner explicitly overrides it for a task: Retail Price = Base Cost × 1.70. For multi-packs, calculate cost per unit and retail per unit. If pack size, cost, item identity, or invoice math is ambiguous, stop and ask rather than guess.
