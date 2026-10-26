# REPO CONSOLIDATION PLAN — make the repo agent-ready

> Audited 2026-10-26 by Hermes. Goal: any agent (Hermes, Claude Code, Codex, ChatGPT)
> can pick up a request — "work on the website", "fix pricing", "update the menu" —
> and know **exactly** which file to touch, which facts are true, and which work is already done.
>
> This is a **plan of record**, not a merge. Items are ordered by leverage.

## A. What is blocking other agents right now

| # | Problem | Why it blocks | Fix |
|---|---|---|---|
| A1 | **No single canonical entry point.** 7 `index.html` files (`/`, `/hub`, `/pricing-hub`, `/apps/pricing-hub`, `/apps/pricing-store`, `/apps/superkitchen`, `/apps/superkitchen/dist`) plus root `links.html`, `sales.html`, `terms.html`, `privacy.html`. | An agent asked to "work on the website" cannot tell which is live. | Declare the canonical surface per purpose in `AGENTS.md` + a short `docs/agent-context/ENTRYPOINTS.md`. |
| A2 | **Duplicated pricing hub** at both `pricing-hub/` and `apps/pricing-hub/`. | Two copies drift; edits land in the dead one. | Pick one, redirect/deprecate the other. |
| A3 | **Stale root docs contradict current state.** `ARCHITECTURE.md`, `CONSOLIDATION_COMPLETE.md`, `PRESENTATION_GUIDE.md`, `ROADMAP.md`, `VERIFICATION.md`, `AGENT_TASKS.md` still carry the **65% markup**, "93 products", "9 years", old bot handles, etc. | Agents read the most prominent file and copy a wrong fact. | Archive to `_archive/` (as `CLAUDE_PROMPT.md` already asks) and leave pointers. |
| A4 | **Secrets risk in the working tree.** `server/.env.bak_debug`, `server/.env.bak_env`, `deploy/pricing-hub/.env.prod.pulled`, `deploy/pricing-hub/.env.pulled` are untracked but **not gitignored** — one `git add -A` leaks credentials. | Blocker + security incident risk. | Extend `.gitignore` (done in this PR) and purge the files locally. |
| A5 | **Branch sprawl.** 53 remote branches; only 9 merged. 8 open PRs (#59, #33, #30, #29, #28, #21, #16, #13) overlap the same website/kitchen surfaces with no declared order. | Agents duplicate work and produce conflicting PRs. | Triage: merge #59, then close/supersede the rest with a one-line rationale each. |
| A6 | **Local `main` drifts.** Working copy was 2 commits behind `origin/main`; untracked `apps/invoice-pipeline/`, `deploy/`, `docs/knowledge/`, `.worktrees/`, `*.bak*` litter the tree. | Agents branch from stale state. | `git pull`, decide each untracked dir (track / gitignore / delete). |

## B. Inconsistent business facts (see `STORE_FACTS.md`)

| Fact | Conflicting values | Resolution |
|---|---|---|
| **Sunday hours** | Repo: CLOSED · Birdeye: 8AM–3PM · legacy site: Closed all days | 🟠 owner must confirm |
| **"Open Daily" vs Mon–Sat** | `index.html` hero + pasta flyer say "Open Daily"; README/schema say Mon–Sat + Sun closed | Fix copy once Sunday is confirmed |
| **Markup** | ×1.70 authoritative vs **65%** in 4 stale docs | Delete 65% everywhere |
| **Product count** | 283 canonical (Supabase) vs 93 / 88 in old docs | Point docs at live catalog |
| **Years in business** | "9 years" in site copy | 🟠 owner confirm |
| **Canonical domain** | legacy `.com` vs GitHub Pages vs Vercel | 🟠 owner confirm |
| **Store name** | "Anthony's Supermarket" vs "Shop and Save" vs "Super Kitchen" | Use STORE_FACTS mapping |

## C. Recommended order of work

1. **Merge PR #59** — isolated, additive, `MERGEABLE/CLEAN` (see below). Safe.
2. **Merge this PR** (consolidation docs + `.gitignore` hardening).
3. Purge local secret-risk files and confirm `.gitignore` covers them.
4. Archive stale root docs to `_archive/`; leave a pointer in `README.md`.
5. Write `docs/agent-context/ENTRYPOINTS.md`; add it + `STORE_FACTS.md` to the `AGENTS.md` read order.
6. Triage the 8 open PRs → merge or close with rationale.
7. Owner confirms the 🟠 items in `STORE_FACTS.md`; propagate the confirmed values.

## D. PR #59 assessment (kitchen OS staging)

- Title: *WIP: Kitchen OS v2 staging prototype and Hermes import*
- `feature/kitchen-os-v2-staging` → `main` · **OPEN, not draft** · **MERGEABLE / CLEAN**
- +424 / −0 across **27 files**, all under `prototypes/kitchen-os-v2/` — **purely additive**,
  touches no production path, no config, no secrets.
- Contents: prototype (`index.html`, `studio.js`, `tv.html`, `server.py`), seed data,
  screenshots, and handoff docs (`HERMES_HANDOFF.md`, `IMPORT_HANDOFF.md`, `IMPLEMENTATION_STATUS.md`).
- **Verdict:** safe to merge as an isolated staging prototype. It does not consolidate
  anything on its own — treat it as one input, not the fix.
