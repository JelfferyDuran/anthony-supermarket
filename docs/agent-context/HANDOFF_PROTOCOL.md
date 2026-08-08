# Cross-Agent Handoff Protocol

Purpose: keep ChatGPT, Hermes, Codex, Claude, and other authorized agents synchronized through Git rather than private memory.

## At session start
Every agent must:
1. Pull the latest repository state.
2. Read root `AGENTS.md`.
3. Read `CURRENT_STATE.md` and `OPERATING_RULES.md`.
4. Inspect relevant open PRs/issues and live infrastructure when the task depends on current deployment state.
5. Treat stale local notes as advisory only.

## During work
- Create/use an appropriately named branch.
- Keep changes scoped to the task.
- Record decisions in code/docs rather than relying on chat memory.
- Do not commit credentials or PII.
- Do not mark something `live`, `fixed`, or `verified` unless it was actually tested or observed.

## Required handoff after material work
If architecture, deployment, security, data model, active workstreams, or operating behavior changes:
1. Update `CURRENT_STATE.md`.
2. Append one entry to `SESSION_LOG.md`.
3. Reference related issue/PR numbers.
4. State what was verified, what remains unverified, and the next safe action.

## Session-log format
```md
## YYYY-MM-DD HH:MM ET — <agent/name>
- Goal:
- Changed:
- Verified:
- Not verified / blockers:
- Security or rollback notes:
- PR/issue/commit:
- Next safe action:
```

## Conflict rule
When two agents disagree:
1. Live infrastructure observation beats memory.
2. Current merged code/migrations beat old local code.
3. A newer verified handoff beats an older unverified handoff.
4. Never resolve disagreement by overwriting production blindly; investigate first.

## Ownership rule
Agents do not own the business or infrastructure. They operate under bounded permissions delegated by the owner. Do not broaden permissions simply because a task is inconvenient with current access.
