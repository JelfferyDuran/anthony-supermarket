# Decision — GitHub Pages stays disabled; Vercel is the public site

Date: 2026-09-11
Status: accepted

## Context

- Repo `JelfferyDuran/anthony-supermarket` is **private** (Free plan). The GitHub Pages API returns 404 for the pages site, and the Pages deploy action fails with "Get Pages site failed. Please verify that the repository has Pages enabled..." (Pages API 422/Not Found).
- Since 2026-09-05 every push to `main` burned a failing "Deploy to GitHub Pages" run (~11-16s each) — chronic red CI caused by Pages being unenableable on this repo, not by any code defect.
- `anthony-supermarket.vercel.app` is the live public site and remains the canonical public surface.

## Decision

- Keep GitHub Pages **disabled**. The deploy workflow (`.github/workflows/deploy.yml`) is `disabled_manually` (`gh workflow disable`).
- Keep the workflow file in the repo but fixed: it now stages only the public surface — root html (`index.html links.html privacy.html terms.html sales.html`), `assets/`, `pricing-hub/` — instead of `path: '.'`, which would have published `server/`, `docs/`, `invoices/`, `nrs/`, `data/` if ever enabled.
- Re-enable only if the repo ever goes public or Pages becomes provisionable on this account's plan.

## Why

- Pages cannot be enabled on this repo today; the workflow could never succeed and only generated noise/failing runs.
- Public-only staging removes the risk that a future re-enable publishes internal files.
- Vercel already serves the public site; there is no requirement for a second static host.

## Guardrails / rollback

- Rollback: `gh workflow enable deploy.yml` (or Actions tab) if the repo goes public; the workflow will publish only the staged public surface.
- Do not change the workflow to `path: '.'` without the public-release gate (issue #28 public-only packaging).
- `pages-build-deployment` is GitHub's built-in site-build workflow and stays inert while Pages is disabled.

## Related PRs / issues

- Commit `e1ba4b7` — ci(pages): stage only public files; disable Pages workflow
- Issue #28 — public-only packaging / selective reconciliation (release gate)
