# Decision proposal — reliable local shopping with optional depth

Date: 2026-09-05. Status: proposed for owner review; not a production release.

The root storefront reproduced a failure in which WebGL initialization prevents menu startup and leaves a full-page loading overlay. Decoration must be independent of business functionality. A narrow patch isolates initialization and restores zoom/readable page content.

The intended growth architecture retains existing order/pricing authority and builds an isolated public storefront around kitchen, offers, and visit actions. Optional CSS depth should support those tasks. It must not require an app install, replace HTML text, or gate browsing on graphics support.

Research and implementation sequence: [[docs/growth/CONVERSION_PLAN]]. Evidence and limitations: [[docs/growth/EVIDENCE]]. The concept has no live prices, telemetry, or ordering.

Before release: confirm domain and contradictory hours; isolate public output from internal files; reconcile older PRs with newer manager/pricing code; test the order lifecycle and rollback path. Current Vercel project access is incomplete and Cloudflare has not been inspected.

Hermes continuation: consume this handoff and existing observer data only within current permissions. Do not promote, invent offer prices, or mark financial gains without observed evidence.
