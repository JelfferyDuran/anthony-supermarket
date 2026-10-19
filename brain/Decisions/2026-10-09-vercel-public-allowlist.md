# Decision — The Vercel deploy publishes an allowlist, never the repo root

Date: 2026-10-09
Status: accepted (owner requested the fix; production promotion pending owner go)

## Context

- `vercel.json` had `outputDirectory: "."` with no build step of its own. The `anthony-pricing-hub` deployment therefore served every tracked file. The owner confirmed on 2026-10-09 that the cost files and server source were publicly downloadable.
- What was reachable included:
  - server source;
  - `invoices/` and `nrs/` POS exports;
  - `apps/pricing-hub/index.html`, with the embedded cost ledger;
  - `apps/pricing-store/index.html`;
  - the `manual-intake-*` / `goya-*` records in `pricing-hub/` (vendor costs, case prices, vendor account number);
  - internal docs.
- The 2026-09-11 Pages fix only scoped the (disabled) GitHub Pages workflow. The Vercel side stayed open, as tracked under the 2026-09-05 "public-only packaging" P0 gate.

## Decision

- `vercel.json` runs `node scripts/build-public-site.js` and serves only `public-build/`.
- The script copies an explicit allowlist:
  - public pages: `index.html`, `links.html`, `privacy.html`, `terms.html`, `sales.html`;
  - `data/sale.json`;
  - the Loading Dock client: `pricing-hub/index.html`, `game.css`, `js/*.js`;
  - `assets/` media types only, so `.md`, `.txt`, `.py` and `.zip` promo working files stay out.
- Data and records never live in a published folder. The Pricing Hub intake records moved (`git mv`, history kept) to `invoices/pricing-hub-records/`.
- CI check **Public site guard** runs on every PR and every push to `main`. It fails if:
  - internals or data files appear in the output;
  - `vercel.json` stops pointing at the allowlisted build;
  - the API function config disappears;
  - a published page references a file that is not published.

## Why

- **Allowlist over `.vercelignore`.** A denylist fails open: any new folder or file is public until someone remembers to exclude it. An allowlist fails closed, and the reference check turns the one downside, a forgotten public file, into a red CI run instead of a broken page.
  - `.vercelignore` would also have to keep `server/` available to the function bundle while hiding it from static output, which it can't express.
  - It is not clear that it applies to Git-sourced deployments at all.
- **A copy step over moving the site into `public/`.** URLs, the Docker image, `scripts/` and other agents' paths stay untouched. Before and after `vercel build`, the 50 published files are byte-identical and the API function bundle is unchanged.

## Guardrails / rollback

- To publish a new top-level file, image type or folder, add it to the allowlist in `scripts/build-public-site.js` on purpose. New `pricing-hub/js/*.js` modules are included automatically.
- Do not set `outputDirectory` back to `.`. Do not move records into `pricing-hub/`, `assets/` or `data/`.
- Rollback: redeploy the previous production deployment, or revert `vercel.json`. Both re-expose the repo, so prefer fixing forward.
- Treat everything served before promotion as disclosed. Old deployment URLs keep serving their files unless Deployment Protection covers them; review them after promotion.

## Related PRs / issues

- PR #54, branch `fix/vercel-public-allowlist` (draft; production promotion only on owner go)
- The root `vercel.json` also governs Vercel project `kingdom-os` (Git-connected, root directory = repo root). Merging to `main` deploys it to production.
- 2026-09-05 CURRENT_STATE P0 gate "public-only packaging"; issue #28
- `brain/Decisions/2026-09-11-pages-private-repo.md` (the Pages-side counterpart)
