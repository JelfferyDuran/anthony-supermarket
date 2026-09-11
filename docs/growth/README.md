# Growth review pack

- [Conversion strategy, source evidence, architecture and release gates](CONVERSION_PLAN.md)
- [Interactive bilingual design concept](concept.html) — open the downloaded HTML in a browser; self-contained, no live order submission or telemetry.
- [Research evidence ledger](EVIDENCE.md)

The concept is an illustrative design review, not a deployed site or a claim of current product availability. Buttons demonstrate department selection, language, motion control, navigation, and public directions/phone links. No invoice imagery is used.

The accompanying root-storefront patch fixes the reproduced WebGL/loading dependency and restores page zoom. It does not merge the earlier PRs, remove all internal surfaces, change business hours, migrate the stack, or deploy production. Those remain explicit gates in the plan.

## Verification

Run `node --test scripts/test-storefront-resilience.cjs` from the repository root. It checks missing Three.js, failed WebGL construction, reduced motion, and inline-script syntax. The existing kitchen build is unchanged.

Current live storefront was inspected in the cloud browser. Prototype browser review was unavailable because the browser blocks local/data URLs. Static HTML/dictionary/link/syntax checks do not substitute for mobile visual review or a complete end-to-end order test. Review at 390, 768, and 1440 px, EN/ES, 200% zoom, reduced motion, and keyboard navigation in an authorized preview before release.

This documentation and code are published for review on a feature branch based on current main through the GitHub connector. The local folder is a scoped review workspace, not a full clone or a second Obsidian vault.
