# STORE FACTS — Anthony's Supermarket (single source of truth)

> **Purpose:** One canonical place for every public-facing business fact so no agent
> invents, guesses, or copies a stale value from an old doc, prototype, or the legacy site.
>
> **Rule:** If a value here disagrees with any other file in the repo, **this file wins**.
> If a value is marked `OWNER-CONFIRM`, do **not** publish it until the owner confirms —
> use the "current published" value and flag the conflict.
>
> Last audited: 2026-10-26 by Hermes (repo-wide grep + external listings).

## 1. Identity

| Fact | Canonical value | Status |
|---|---|---|
| Store display name | **Anthony's Supermarket** | ✅ consistent repo-wide |
| Kitchen sub-brand | **Anthony's Super Kitchen** | ✅ used for the food/ordering surface |
| Legacy web brand | "Anthony's Shop and Save Supermarket" | ⚠️ only on the legacy site — do not use in new copy |
| Instagram | **@anthony_supermarket** | ✅ consistent |
| Address | **288 Kearny Ave, Kearny, NJ 07032** | ✅ verified (legacy site contact, WIC locator, Birdeye, Loc8NearMe) |
| Phone | **(201) 428-1745** | ✅ verified (legacy site, Loc8NearMe, repo) |
| Years in business | "Serving the Kearny community for 9 years" | 🟠 **OWNER-CONFIRM** — appears in `index.html`, `links.html`, `PRESENTATION_GUIDE.md`; may be stale |

> Note: `(973) 471-3252` in the repo is a **supplier** phone (Peimco invoice), not the store.

## 2. Hours — 🟠 OWNER-CONFIRM (highest-priority conflict)

| Source | Mon–Sat | Sunday |
|---|---|---|
| Repo `README.md`, `CLAUDE_PROMPT.md` | 7AM–8PM | **CLOSED** |
| Repo `index.html` JSON-LD `openingHoursSpecification` | 07:00–20:00 | **00:00–00:00 (closed)** |
| Repo `index.html` hero / `assets/promos/.../flyer.html` | "**Open Daily**" / "Abrimos todos los días" | — |
| Legacy `www.anthonyssupermarket.com` | **Closed** all 7 days (broken template) | **Closed** |
| Birdeye listing (external) | 7:00 AM–8:00 PM | **8:00 AM–3:00 PM** |
| Loc8NearMe (external) | 7AM–8PM | not stated |

**Best evidence:** Mon–Sat **7:00 AM–8:00 PM** is agreed by every source. **Sunday is
unresolved** — repo says CLOSED, an external directory says 8AM–3PM. Confirm Sunday
(and any holiday) hours before changing copy or structured data.

## 3. Public web presence

| Surface | URL | Notes |
|---|---|---|
| Legacy site | https://www.anthonyssupermarket.com/ | Live but stale; shows all days Closed. Ownership/DNS unverified. |
| GitHub Pages | https://jelfferyduran.github.io/anthony-supermarket/ | Referenced in `README.md` |
| Vercel | `anthony-supermarket.vercel.app` | Referenced in repo history; project access incomplete |

🟠 **OWNER-CONFIRM:** which single domain customers should be sent to, and who controls DNS.

## 4. Commercial rules (authoritative)

- **Pricing rule:** `Retail = Base Cost × 1.70` (70% markup), then `.99` shelf rounding.
  - Source of truth: `AGENTS.md`, `HERMES_COMPLETION_NOTES.md`, `brain/Decisions/2026-08-12-*`.
  - The **65%** figure in `ARCHITECTURE.md`, `CONSOLIDATION_COMPLETE.md`, `PRESENTATION_GUIDE.md`,
    `ROADMAP.md` is **stale** — do not reintroduce it.
- **Canonical catalog:** **283 active products** in Supabase (as of 2026-08-21 snapshot in
  `CURRENT_STATE.md`). Older "93 products" / "88 products" counts are historical and refer to
  the static site / invoice seed, not the live catalog.
- **Invoice → price flow:** invoice upload is *evidence*, never approval. OCR/extraction and
  manager approval are separate gates. Server/DB is authoritative.

## 5. Bots & runtimes

| Bot | Handle | Notes |
|---|---|---|
| Kitchen / ordering | **@Anthonysuperkitchen_bot** | 8 refs in repo — treat as canonical |
| Invoice intake | **@Anthonysinvoicebot** | 2 refs |

🟠 **OWNER-CONFIRM:** confirm which handle is live for each purpose before pointing customers at it.

## 6. How to use this file

1. Read this before writing any customer-facing copy, schema, ad, or bot message.
2. If you need a value not listed here, add it with a `✅ verified (source)` or
   `🟠 OWNER-CONFIRM` tag — never publish an unverified guess.
3. When the owner confirms an `OWNER-CONFIRM` item, update the row, remove the tag, and note
   the change in `docs/agent-context/SESSION_LOG.md`.
