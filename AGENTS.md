# Anthony's Supermarket — Agent Entry Point

This repository is the canonical shared context for AI agents working on Anthony's Supermarket systems and is designed to be opened directly as the Anthony's Obsidian vault.

## Required read order before making changes
1. `brain/00 - Anthony HQ.md`
2. `docs/agent-context/CURRENT_STATE.md`
3. `docs/agent-context/OPERATING_RULES.md`
4. `docs/agent-context/HANDOFF_PROTOCOL.md`
5. If operating from Hermes/VPS automation: `docs/agent-context/HERMES_ACCESS.md`
6. Relevant brain notes, code, migrations, issues, and PRs for the task.

Do not rely on cached local memory when repository state disagrees with it. Pull/rebase first and treat the repository plus live infrastructure checks as source of truth.

## Obsidian brain model
- Open the **repository root** as the Obsidian vault; do not create a second synced copy of the same knowledge tree.
- `brain/` is the writable working-memory area for inbox notes, decisions, sessions, and small attachments.
- `docs/agent-context/` remains the canonical operational state/handoff layer.
- GitHub provides version history, backup, collaboration, review, and rollback.
- Live infrastructure remains authoritative for runtime state. If a vault note conflicts with live state, verify live state and then correct the note.
- Local `.obsidian/` settings/plugins/workspace state are ignored and must not be committed.

## Core rule
Build fast where mistakes are reversible. Build deliberately where consequences are irreversible.

## Authority boundaries
- Never commit secrets, tokens, passwords, service-role keys, customer PII, or private credentials.
- Never expose Supabase service-role credentials to browser code, Telegram clients, or general-purpose VPS agents.
- Never give a machine identity more privilege than its task requires.
- Do not bypass authentication, RLS, audit logging, server-authoritative pricing, or state-machine validation.
- Use branches and pull requests for meaningful code/brain changes.
- Production deployments, destructive database changes, secret rotation, role escalation, and irreversible actions require an explicit validated deployment path and rollback plan.
- An agent may prepare or test a deployment, but must not silently destroy data or weaken safeguards.

## Shared-context duty
After materially changing architecture, deployment state, security posture, active branches/PRs, data model, or operational workflow:
1. Update `docs/agent-context/CURRENT_STATE.md`.
2. Append a short entry to `docs/agent-context/SESSION_LOG.md`.
3. Add/update a linked note in `brain/Decisions/` or `brain/Sessions/` when the reasoning/history is useful to humans or future agents.

## Project priorities
1. Secure and reliable customer ordering.
2. Kitchen operations dashboard.
3. Admin/manager dashboard.
4. Customer tracking and notifications.
5. Payments/delivery only after order lifecycle is stable.
6. Later integration into the wider Anthony's SuperApp/inventory/POS ecosystem.

## Business pricing rule
Unless the owner explicitly overrides it for a task: Retail Price = Base Cost × 1.70. For multi-packs, calculate cost per unit and retail per unit. If pack size, cost, item identity, or invoice math is ambiguous, stop and ask rather than guess.
