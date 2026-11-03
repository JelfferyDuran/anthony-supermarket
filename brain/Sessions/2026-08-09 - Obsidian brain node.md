# Obsidian Brain Node — 2026-08-09

## Goal
Add Obsidian as the primary human/agent working-memory interface without creating a second conflicting copy of project knowledge.

## Architecture
- Repository root = Obsidian vault.
- `brain/` = writable working-memory space.
- `docs/agent-context/` = canonical operational state/handoff layer.
- GitHub = versioned backup, collaboration, review, rollback.
- Live infrastructure = runtime source of truth.

## Added
- Brain HQ/home page
- Inbox
- Decisions
- Sessions
- Attachments policy
- `.obsidian/` ignored
- Agent read order updated
- Cross-agent handoff protocol updated
- Shared Brain CI guard

## Guardrails
- no credentials or customer PII in the vault
- brain files limited to approved lightweight formats
- 2 MB maximum per brain file
- no tracked Obsidian local/plugin/workspace state
- material changes still require `CURRENT_STATE.md` + `SESSION_LOG.md`

## Next operational step
On Hermes or any desktop with Obsidian installed, pull `main` and open the repository root as the vault. Do not create a separate synced copy unless a separate disaster-recovery design is intentionally introduced.
