# Anthony's Supermarket — Brain HQ

This page is the human + agent navigation hub for the Anthony's Supermarket Obsidian vault.

> The repository root is the vault. GitHub is the versioned backup/collaboration ledger. Live infrastructure remains authoritative for runtime state.

## Start here
- [[AGENTS|Agent Entry Point]]
- [[docs/agent-context/CURRENT_STATE|Current State]]
- [[docs/agent-context/OPERATING_RULES|Operating Rules]]
- [[docs/agent-context/HANDOFF_PROTOCOL|Handoff Protocol]]
- [[docs/agent-context/SESSION_LOG|Shared Session Log]]
- [[docs/agent-context/HERMES_ACCESS|Hermes Access]]

## Working brain
- [[brain/Inbox/README|Inbox]] — raw ideas, captures, things to sort
- [[brain/Decisions/README|Decisions]] — important choices and why
- [[brain/Sessions/README|Sessions]] — lightweight session notes and handoffs
- [[brain/Attachments/README|Attachments]] — small supporting files only

## Active build roadmap
- [[docs/growth/CONVERSION_PLAN|Digital growth and conversion plan — September 2026 review]]
- Kitchen Dashboard — Phase 2A
- Admin / Manager Dashboard — Phase 2B
- Customer tracking + reliability — Phase 2C
- Payments / delivery / POS / inventory after the order lifecycle is stable

## Rules
1. Never store passwords, tokens, service-role keys, private credentials, or customer PII in this vault.
2. Use Markdown for knowledge whenever possible.
3. Keep attachments small and operationally useful.
4. Material architecture/deployment/security changes must still update `CURRENT_STATE.md` and `SESSION_LOG.md`.
5. Agents work through branches/PRs; do not use the vault to bypass Git review or CI.
6. If a note conflicts with live infrastructure, verify live state before acting.

## Obsidian setup
Open the **repository root** as the Obsidian vault. Local Obsidian UI/plugin state lives in `.obsidian/` and is intentionally not committed.
