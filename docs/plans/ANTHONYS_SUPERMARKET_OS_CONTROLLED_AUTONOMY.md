# Anthony's Supermarket OS — Controlled Autonomy Master Plan
Date: 2026-10-09 | Status: PROPOSED / DOCUMENTATION ONLY

## Source of truth and tracking
Notion Kanban: https://app.notion.com/p/b9a32fe065e84780adc83589fd1459b5
GitHub existing issues: #48 (Pricing Hub intake/Paddle), #45 (manager/POS/catalog boundaries), #38 (prior V2).
This document is a planning handoff, not evidence that functionality is complete.

## Vision
Evolve Pricing Hub into a complete Supermarket Operating System: shared catalog, purchasing, invoice verification, supplier management, inventory/receiving, hybrid pricing, sales/POS, profitability, AI operations and governance. Deliver incrementally; preserve verified existing features.

## Decisions
- Database: read-only audit before schema changes; preserve trustworthy structures.
- Rollout: parallel previews, feature gates, owner-approved promotion; no automatic deployment.
- POS: later integration milestone. Existing NRS-derived data and Phase D may already be present: audit first, avoid duplicate implementation.
- Pricing: default 70% markup with approved category/product overrides; versioned .09/.99 rounding policy requiring explicit sign-off.
- Price publication: ALWAYS requires explicit authenticated human approval for exact immutable proposal version. AI never publishes prices.
- Invoice OCR is evidence only. Printed subtotal must be independently extracted or manually verified; never derive invoice subtotal from OCR line sums to prove reconciliation.
- Service-role credentials stay server-only; never in browser, agents or committed files.
- Grocery catalog and Super Kitchen hot-food menu remain separate until an approved mapping contract.
- All agent permissions default deny. Agents cannot change policy, approve their own actions, move money or bypass release gates.

## Proposed architecture
Modular application with experience layer (dashboard, invoices, catalog, pricing, approvals, inventory, analytics, admin); server-side identity and RBAC; domain modules (catalog, purchasing, invoice evidence, pricing, inventory ledger, sales adapters, analytics); persistence and append-only audit; policy decision point + narrowly scoped execution gateway; orchestration with Hermes, Muse, specialist agents and independent QA.

Separate source evidence, extracted observations, verified cost, price proposal, approval and published price. Each event is versioned, attributable, idempotent and traceable. Receipt of invoice is not proof of physical goods received.

## Autonomy tiers
L0 observe; L1 recommend/draft; L2 preauthorized reversible internal actions within limits; L3 specifically delegated operational actions after supervised pilot; L4 coordinated multi-agent routine operations after reliability/security gates. Per-agent, per-action grants only; no global autonomy elevation. Price publication always human-gated.

Policy records: actor/service identity, permitted action, SKU/category/location, amount/unit cap, cumulative daily exposure, evidence/freshness requirements, expiry, reversibility, approval requirement, version, rate limit and emergency stop. Fail closed on ambiguity. Record policy decisions and execution outcomes.

## Roadmap / acceptance
P0 Read-only audit: inspect main, PRs, issues, deployments, auth, schema, invoice/Paddle, NRS/Phase D, security, agent handoffs. Exit: evidence-backed gap/defect register, no writes.
P1 Foundation: reliable authentication, shared identifiers, RBAC, audit events, responsive command center. Exit: role tests and protected routes pass.
P2 Pricing & purchasing: independent reconciliation, verified costs, hybrid proposals, human approval, label/export. Exit: missing OCR row blocks approval; no unauthorized publication.
P3 Inventory: receiving vs invoicing, unit conversions, stock movements, counts, spoilage. Exit: reconciled ledger and traceability.
P4 L2 pilot: safe drafts/housekeeping, scoped policy engine, idempotency, kill switch. Exit: supervised test and audit proof.
P5 POS: provider-specific adapter, sales/returns reconciliation and inventory movement; verify existing NRS work first. Exit: measured reconciliation.
P6 L3 delegation: owner-defined thresholds and supervised operations. Exit: owner approval + anomaly suspension.
P7 L4: multi-agent coordination with isolation, independent validation, failure containment and periodic recertification. Exit: reliability/security evidence.

## First cycle: audit only
1. Hermes: inspect active lanes, latest main, handoffs, issues/PRs; identify duplicates and blockers.
2. Security: reproduce login failure and verify service-role delivery without printing secrets.
3. Muse: inspect Paddle extraction and independent printed subtotal; missing-row regression test design.
4. Product: map canonical SKUs, NRS aliases, Phase D inventory and Super Kitchen boundary.
5. QA: baseline tests and evidence-only report.
No code, schema, credentials, production or pricing changes without separately approved implementation scope.

## Handoff requirements
Each task: task ID, owner lane, dependency, branch, evidence, changed files, tests, blockers, release status, next step. Preserve Hermes visibility and document observed facts separately from proposed features.

## Obsidian
This Markdown file is Obsidian-compatible. Obsidian vault destination is not connected/confirmed; import or synchronize only after vault location is provided. Notion is the task board; GitHub is the durable technical plan. Avoid conflicting independent task edits.
