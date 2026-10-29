# STORE FACTS — Anthony's Supermarket (single source of truth)

> **Purpose:** One canonical place for every public-facing business fact so no agent
> invents, guesses, or copies a stale value from an old doc, prototype, or the legacy site.
>
> **Rule:** If a value here disagrees with any other file in the repo, **this file wins**.
> If a value is marked `OWNER-CONFIRM`, do **not** publish it until the owner confirms —
> use the "current published" value and flag the conflict.
>
> Last audited: 2026-10-26 by Hermes (repo-wide grep + external listings).
> **Owner confirmation round 2026-10-25** resolved the three open items (hours, domain,
> years in business) — see §1, §2, §3. All three are now ✅.

## 1. Identity

| Fact | Canonical value | Status |
|---|---|---|
| Store display name | **Anthony's Supermarket** | ✅ consistent repo-wide |
| Kitchen sub-brand | **Anthony's Super Kitchen** | ✅ used for the food/ordering surface |
| Legacy web brand | "Anthony's Shop and Save Supermarket" | ⚠️ only on the legacy site — do not use in new copy |
| Instagram | **@anthony_supermarket** | ✅ consistent |
| Address | **288 Kearny Ave, Kearny, NJ 07032** | ✅ verified (legacy site contact, WIC locator, Birdeye, Loc8NearMe) |
| Phone | **(201) 428-1745** | ✅ verified (legacy site, Loc8NearMe, repo) |
| Years in business | **Since 2012** (≈14 years as of 2026) | ✅ **OWNER-CONFIRMED 2026-10-25** — copy should read "Serving the Kearny community since 2012". The old "for 9 years" string is stale and has been corrected repo-wide. |

> Note: `(973) 471-3252` in the repo is a **supplier** phone (Peimco invoice), not the store.

## 2. Hours — ✅ OWNER-CONFIRMED 2026-10-25

| Day | Hours |
|---|---|
| **Monday–Saturday** | **7:00 AM – 8:00 PM** |
| **Sunday** | **8:00 AM – 3:00 PM** |

**Resolved:** Sunday is **8AM–3PM**, not closed. The repo previously said CLOSED (README,
CLAUDE_PROMPT, index.html JSON-LD, hero copy "Open Daily") while an external directory
(Birdeye) already listed 8AM–3PM. All repo copy and structured data now match.
**Holiday hours remain unconfirmed** — flag rather than guess.

## 3. Public web presence

| Surface | URL | Notes |
|---|---|---|
| **Canonical public domain** | **https://anthonyshopandsave.com** | ✅ **OWNER-CONFIRMED 2026-10-25** — owned by the owner, DNS managed **through Cloudflare**. This is the address customers should be given. |
| Legacy site | https://www.anthonyssupermarket.com/ | Live but stale (shows all days Closed). Do **not** treat as canonical; superseded by anthonyshopandsave.com. |
| GitHub Pages | https://jelfferyduran.github.io/anthony-supermarket/ | Build/preview surface only — not customer-facing. |
| Vercel | `anthony-supermarket.vercel.app` | Deployment/preview surface. anthonyshopandsave.com should resolve (via Cloudflare) to the production deployment. |

**Do not** publish `www.anthonyssupermarket.com` or the legacy "Shop and Save" branding in
new customer-facing copy.

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
