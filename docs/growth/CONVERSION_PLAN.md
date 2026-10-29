# Anthony’s digital growth plan

**Prepared for Noel Durán · 5 September 2026 · Decision draft, not a deployment authorization**

## Recommendation

Build a fast, bilingual neighborhood-market website around three actions: **browse Dominican food, see approved offers, and visit the store**. Graduate the first action to reliable browser ordering after the kitchen’s order lifecycle is verified. Use subtle CSS depth and optional interaction to make the store memorable; never make a customer navigate a 3D world to find a price or complete an order.

The commercial objective is incremental contribution from fulfilled purchases and repeat business. A visually impressive website is an acquisition and service tool, not evidence that the supermarket will become profitable. The reported 250–300 customers/day is a starting observation; whether that means people entering or completed transactions remains unverified.

**First release priority:** fix discovery accuracy and the storefront’s reproduced loading failure, separate internal information from public output, establish truthful measurement, then test the new design. Preserve the newer pricing and manager infrastructure already on main rather than merging older stacked work wholesale.

## 1. Verified audit and implications

Repository reviewed through the authenticated GitHub connector at `dfb38b633f8116270d833997f3eaee882dfe363c`. The local historical worktrees are stale; ordinary Git fetch failed for lack of credentials. Current files were read at the pinned commit. No production database query, order, or configuration change was performed.

| Finding | Evidence | Business implication / action |
|---|---|---|
| Live storefront fails when WebGL cannot initialize | Browser at `anthony-supermarket.vercel.app`: WebGL context error, body remains `loading`, menu and stats empty; screenshot shows loading screen | P0: decoration cannot gate browsing. Prepare and test an isolated fallback fix. This is reproduced in this browser, not a claim about failure frequency across customers. |
| Two different public experiences | Vercel root and `www.anthonyssupermarket.com` both return HTTP 200; Vercel footer links to the latter | Verify ownership, choose one canonical customer domain, preserve redirects and existing search value. |
| Hours contradict each other | Legacy domain visibly shows all seven days Closed. Vercel hero says Open Daily; its Visit section says Sunday CLOSED | **RESOLVED 2026-10-25** — owner confirmed Mon–Sat 7AM–8PM, Sun 8AM–3PM; canonical domain `anthonyshopandsave.com` (owned via Cloudflare). Copy + structured data corrected. Holiday hours still unconfirmed — flag, do not guess. |
| Public/internal boundaries are still mixed | Main `index.html` includes Pricing Hub iframe, cost/value/profit strip, and an internal 1.65 stats calculation | Selectively reconcile #28 on current main. Remove public cost/profit output and calculator exposure. Do not use these figures as audited inventory or profit. |
| Deployment packaging is too broad | Root `vercel.json` has outputDirectory `.`; Pages workflow uploads `.`; no root `.vercelignore` in inspected tree; repo contains business data and internal apps | P0 release gate: explicit public asset allowlist and isolated build output. This is a configuration risk, not proof every private file is publicly retrievable. Do not probe or republish business files as an exposure demonstration. |
| Ordering is fragmented | Root legacy `/api/orders` flow; separate React Super Kitchen uses Supabase Edge Function; Telegram is prominently promoted | Choose one supported customer order contract. Browser ordering first, Telegram optional. Verify actual server behavior before promising fulfillment. |
| Checkout makes unsupported commitments in source | Super Kitchen checkout offers delivery and says it will text customers; phone is optional; post-submit opens Telegram automatically | Verify capability or remove claim/option. Submitted, accepted, fulfilled, and paid are separate states. |
| Existing backend is more advanced than the earlier handoff | Current context documents live Pricing Hub A–D, NRS CSV ingestion, safe catalog API, manager inventory/alias workflow; current source has manager components | Extend these systems. Do not build a second invoice authority or duplicate admin dashboard. Live state is dated August 21 and needs fresh authenticated verification before cutover. |
| Financial reporting has coverage limits | August 21 context records low POS-to-product match coverage and requires `costed_revenue_share` | Show coverage beside any margin measure. Unmatched departments cannot be assigned guessed unit costs. These historic figures are not current measurements. |
| Hosting account visibility is incomplete | Connected Vercel team reports Hobby and no projects, while both public URLs respond | Cannot verify project ownership, active build settings, production commit, billing account, or rollback target from this connector. No Cloudflare configuration was inspected. |

The uploaded invoice scans are private test material and were not used as website assets or fresh pricing evidence.

### Open work reconciliation

| PR | Observed status / relationship | Treatment |
|---|---|---|
| #28 storefront v6 | Open, non-draft, targets main | Extract current-needed brand, privacy, and public/internal cleanup. Re-review against current main; old green checks do not certify a new merge. |
| #29 admin | Draft, targets older kitchen branch | Do not merge over newer manager/pricing work. Compare functionality and port only verified gaps. |
| #13 → #16 → #21 | Draft ordering/UI/kitchen stack | Reconcile with current source and live Edge Function; preserve controlled-order gate. |
| #30 | Draft production-readiness remediation | Review overlapping order/security fixes before implementing duplicate remediation. |
| #33 sales CSS 3D | Draft | Reuse the DOM-based depth idea after code review. Reported performance numbers are branch-author results, not independently remeasured here. Reconfirm offer economics and dated campaign validity. |
| #41 / #46 | Open pricing integration / continuity documentation | Preserve newer pricing work and reconcile handoff notes. Do not blindly replace current state with older text. |

## 2. What the research supports

Google identifies relevance, distance, and prominence/popularity as local ranking factors. Accurate business information, hours, photos, and reviews matter. A new 3D design cannot overcome incorrect opening hours or a broken destination. Start with Business Profile accuracy and the canonical domain. [Google local ranking guidance](https://support.google.com/business/answer/7091?hl=en).

Seabra operates at 180 Schuyler Avenue in Kearny and exposes an online catalog and in-store circulars. ShopRite’s indexed Kearny Square journey includes pickup-slot selection, categories, and a circular. International groceries and weekly offers alone are not distinctive. Test Anthony’s combination of Dominican kitchen food, specific products, bilingual service, and neighborhood convenience. Competitor conversion rates, local search volume, and delivery coverage were not verified. [Seabra locations](https://seabrafoods.com/pages/seabra-foods-locations-information), [Seabra circulars](https://seabrafoods.com/pages/weekly-special-circulars-in-store-only), [ShopRite indexed Kearny journey](https://www.shoprite.com/sm/pickup/rsid/166/categories/diabetes-friendly/snacks-id-229370).

Baymard’s original checkout research supports making guest checkout prominent and postponing account creation. Apply this direction to Anthony’s; its broad ecommerce abandonment findings are not a local-grocery forecast. Do not require an app install, Telegram account, or marketing signup to place a browser order. [Guest checkout research](https://baymard.com/blog/make-guest-checkout-prominent), [Delayed account creation](https://baymard.com/blog/delayed-account-creation).

Google’s field performance targets are LCP ≤2.5 seconds, INP ≤200 milliseconds, and CLS ≤0.1 at the 75th percentile, evaluated separately on mobile and desktop. Use lab tests before release and real-user data afterwards; a Lighthouse score does not establish actual INP or conversion lift. [Web Vitals](https://web.dev/articles/vitals).

W3C describes motion-triggered dizziness and distraction and recommends disabling unnecessary interaction animation or respecting reduced-motion preferences. Its animation-from-interactions criterion is Level AAA; we adopt the behavior as a product requirement without claiming complete WCAG conformance. [W3C motion guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html).

### Modern design without a generic AI appearance

Current first-party sites such as [Linear](https://linear.app/) and [Framer](https://www.framer.com/) are useful design references, not evidence of grocery conversion performance or a ranking of trends. Borrow clear hierarchy, restrained motion, strong typography, and responsive product presentation. Anthony’s should use its own approved identity: forest green, warm cream, a restrained orange accent, real shelf/food photography, and natural bilingual writing. Avoid generic generated food, fabricated testimonials, fake urgency, and novelty interactions that hide the task.

## 3. Customer experience and content contract

### Information architecture

- **Home:** specific food/value proposition; location; verified open/closed state; main kitchen action; offers and directions; a concise introduction to four departments.
- **Kitchen:** current menu, readable names/portions/options, authoritative prices, actual ordering availability, pickup instructions, visible call fallback. Keep browsing available while ordering is paused.
- **Offers:** approved active campaigns with product identity, pack/weight, price, terms, validity, and channel. Never reuse an August offer as a current September offer without approval.
- **Visit:** verified store/kitchen hours, holiday exceptions, phone, accessible directions link, real storefront photo. Load map only when useful.
- **Later:** catering/family meals only after capacity and offer economics are verified; grocery pickup only after item availability and substitution handling work.
- **Staff:** separate protected entry and APIs; invoices, costs, approvals, staff roles, and business metrics never enter the public asset bundle.

### Above-the-fold design

Suggested headline: **Your neighborhood market. A taste of home.** Spanish: **Tu mercado de siempre. El sabor de casa.** Follow with specific Dominican food and grocery copy, not claims of lowest prices. The kitchen button initially says “Explore the kitchen / Ver la cocina.” Change it to “Order for pickup / Pedir para recoger” only when the operational gate passes. Secondary actions: approved offers and directions. Keep address readable on a phone without opening a menu.

Use one hero illustration or verified food photograph. A small CSS market display may have subtle layered depth; everything containing names, prices, or actions remains real HTML. On phones, present a simple vertical layout. Provide a motion switch, honor operating-system reduced motion, avoid scroll hijacking/autoplay audio, and keep touch gestures native. No endless particle background or full-screen loading animation.

The companion `concept.html` is a self-contained bilingual design prototype. It intentionally has no live prices, order submission, analytics, or stock claims. Its department selector and motion control demonstrate the interaction direction. It is not a production storefront.

### Content governance

Store brand names, official product names, logos, UPCs, addresses, and legal names as immutable fields. Translate generic product descriptors, interface labels, help/error text, and navigation with a reviewed EN/ES dictionary. Apply `translate="no"` to brand spans, not whole product cards. Test both languages through confirmation and empty/error states. Use stable IDs, never translated names, as cart keys.

Capture actual storefront, counter, top dishes, portion sizes, grocery aisles, and products. Obtain appropriate permission for identifiable people. Preserve original brand artwork; do not regenerate the logo. Real food photography and current operating details are a launch content dependency, not something to invent.

## 4. Architecture decision

**Keep Supabase and the existing React/Vite kitchen. Do not adopt Next.js or a new database solely for visual fashion.** Create an isolated public storefront build using HTML-first pages, modular styles/scripts, and approved catalog snapshots. Vite can package the frontend without requiring a large client-only application. Reevaluate server rendering only for a concrete indexed-page or personalization requirement.

| Layer | Proposed responsibility |
|---|---|
| Public storefront | Fast HTML, EN/ES routes, approved offers, directions, optional CSS depth; allowlisted output such as `dist/storefront` |
| Customer kitchen | Existing React/Vite UI, guest/browser ordering, optional Telegram continuation, server-confirmed order receipt |
| Order authority | Existing verified Supabase function/state machine; server prices, valid modifiers, idempotency, capacity and availability checks |
| Grocery catalog | Existing `pricing-catalog` approved retail projection; never expose invoice costs or merge grocery data with kitchen menu indiscriminately |
| Manager workspace | Existing manager/pricing UI with role-checked APIs; expand missing workflows after reconciling #29 with main |
| Insights | Aggregate traffic intent + server order outcomes + separately reconciled POS/settlement information; explicit coverage/freshness |
| Hermes | Repo handoffs and bounded non-PII observer summaries; proposes improvements, never silently approves prices or controls production |

Public prices are published from approved server data; clients do not apply markups. Existing binding pricing rule is cost per sellable unit ×1.70. Existing rounding behavior must be reviewed for parity before any migration; do not change it in a marketing redesign. Campaign publishing needs approver, approved price/quantity terms, start/end or explicit validity policy, stock/availability status, and rollback to the previous revision.

### Hosting choice

Prefer the current Vercel workflow **if the correct commercial account/project can be verified**, because migration adds risk without automatically improving conversion. Vercel Hobby is restricted to personal non-commercial use; the connected Hobby team is not a verified commercial hosting solution for this business. [Vercel Hobby documentation](https://vercel.com/docs/plans/hobby).

Cloudflare Workers Static Assets is a credible low-cost alternative for an isolated static storefront. Static asset requests/storage have no additional charge; dynamic Worker execution follows its own limits and billing. This does not make Supabase, email/SMS, domains, or other services free. Keep the kitchen backend unchanged for a first frontend move. [Cloudflare static-assets billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/).

Use one authoritative frontend host per application. If Cloudflare manages DNS in front of a Vercel origin, validate the supported DNS/TLS arrangement and authenticated-cache behavior. Do not add a second CDN or migrate DNS simply to appear more advanced. No DNS, hosting-plan purchase, or production switch is part of this draft.

## 5. Conversion and financial measurement

### Metrics that answer business questions

| Metric | Definition / integrity boundary |
|---|---|
| Eligible kitchen visits | Defined measured visits to the kitchen during ordering availability; disclose opt-out and bot filtering coverage |
| Checkout start rate | Visits with checkout start / eligible kitchen visits; deduplicate consistently |
| Accepted order rate | Server-accepted unique orders / eligible kitchen visits; report cross-session limitations |
| Fulfillment rate | Fulfilled / accepted orders from the same sufficiently mature cohort |
| Net settled sales | Reconciled settled receipts less refunds; exclude sales tax collected on behalf of authorities; unavailable until payment/POS mapping is verified |
| Incremental contribution | Incremental net sales minus incremental goods, packaging, payment/channel fees, promotions, delivery and labor costs; avoid subtracting discounts twice |
| Store intent | Direction and call-button clicks, separately labeled; not visits, calls completed, or revenue |
| Offer redemption | Staff/POS-confirmed redemption of a campaign code; attributable association, not proof of causality |
| Repeat purchase | Returning fulfilled buyers among a defined eligible cohort/window, only where supported identity and consent permit measurement |
| Data quality | Coverage, freshness, cancellations, missing outcomes, costed revenue share, and sample size visible alongside metrics |

Google explicitly measures call-button clicks and direction requests; do not label them as completed calls or people entering the store. [Business Profile definitions](https://support.google.com/business/answer/9918094?hl=en).

For Insights, separate **Discovery**, **Ordering**, **Store offers**, and **Data health**. Do not show invented growth percentages or “0 sales” when no feed is connected. Compare matching weekdays and operating hours, annotate closures/promotions, and retain America/New_York reporting boundaries with UTC event storage.

Proposed events: `menu_view`, `offer_view`, `order_start`, `checkout_start`, `order_submitted`, `order_accepted`, `order_fulfilled`, `order_cancelled`, `payment_settled`, `directions_click`, `call_click`, `offer_redeemed`. Browser events are untrusted; operational outcomes come from server/audit/settlement records and are deduplicated by immutable event/order references. Do not emit `purchase` from a button click.

Minimize analytics fields to approved campaign/source enums, route, UI language, coarse device class, event type and timestamp. Do not collect raw search strings, names, notes, full referrer URLs, customer identifiers, addresses, or raw IPs into marketing analytics. Honor DNT/GPC and any applicable consent choice; separate essential order processing from optional analytics. Use aggregate counts where possible. If session IDs are introduced, document their retention and privacy basis first; cookieless does not mean unrestricted tracking. Proposed raw-event retention is 30 days pending policy review; retain aggregate reporting longer only with a defined business need.

### Model the sales gap before setting traffic targets

Required additional fulfilled purchases/day = daily contribution shortfall ÷ incremental contribution per extra purchase. Required measured eligible visits/day = required additional fulfilled purchases ÷ measured fulfilled-order rate. These are planning identities, not forecasts. Increased basket size or repeat frequency can help without increasing daily footfall proportionally.

**Insufficient data:** the actual shortfall, net average basket, incremental contribution, usable kitchen capacity, measured website traffic, funnel baseline, repeat rate, and settled-payment mapping. Request a current 28-day aggregate POS summary and operating-cost baseline privately; do not publish raw records. Older NRS import context cannot establish today’s economics.

## 6. Test plan and rollout sequence

| Phase | Concrete deliverable | Acceptance gate |
|---|---|---|
| 0 — Recover trust | Resilience patch; verified hours/domain map; reconcile public/internal removal | Menu usable when WebGL/CDN fails; zoom works; no conflicting hours; public bundle excludes business data |
| 1 — Establish baseline | Read-only Insights definitions and measured events; approved offer publishing contract | Counts reconcile with known fixtures and server records; missing data labeled; no PII in telemetry |
| 2 — New frontend preview | Bilingual HTML-first design with optional depth, real assets, clear paths | Mobile/desktop/keyboard/reduced-motion checks; no blank screen; no price/stock invented; correct primary destination |
| 3 — Controlled ordering | One verified end-to-end order with owner coordination | Accepted → kitchen → ready → fulfilled audit trail; failure preserves cart; idempotent retry; honest receipt; rollback documented |
| 4 — First acquisition cycle | Correct Business Profile destination, one approved local offer, matching landing page, opt-in repeat channel | Staff can fulfill and record redemption; spend cap approved separately; settled contribution measurable |
| 5 — Experiment and expand | Test copy/offer first, optional depth second; evaluate repeat behavior | Sufficient sample, stable operations, no deterioration in contribution or usability; otherwise retain simpler experience |

These phases are ordered work packages, not promised delivery dates. Shipping speed depends on domain access, verified content, deployment ownership, and kitchen availability.

### Initial experiment backlog

1. **Specific kitchen proposition:** Dominican dish/portion imagery and clear pickup instructions versus generic supermarket hero. Primary outcome: fulfilled orders per eligible visit. Guardrails: cancellation rate, preparation delay, contribution per order.
2. **Useful grocery offer:** one approved dinner-related offer versus generic catalog traffic. Primary outcome: confirmed redemptions and contribution after offer cost. Do not infer value from offer clicks alone.
3. **Optional CSS depth:** same content/CTA with depth on versus off, only after functional baseline. Primary outcome: task completion/fulfilled order rate. Guardrails: mobile performance, accessibility, bounce/abandonment definitions.
4. **Post-fulfillment retention:** voluntary weekly-offer signup versus no prompt. Primary outcome: attributable repeat fulfilled purchases over a defined window; monitor unsubscribe/complaint rate.

At low traffic, begin with five representative usability sessions as qualitative feedback, not statistical proof. For quantitative tests, select one primary metric, minimum worthwhile effect and sample size from the observed baseline before launch. Run through complete weekly cycles; do not repeatedly peek and declare a winner. A before/after result is directional because weather, seasonality, pay cycles, and promotions confound it. No universal “high conversion” percentage is promised.

### Release gates and rollback

- Build an allowlisted public directory; verify forbidden roots (`nrs`, internal pricing copies, `server`, `supabase`, `brain`, operational docs) never ship as static assets.
- Test production-equivalent routes, EN/ES, real mobile sizes, keyboard focus, 200% zoom, reduced motion, failed images/CDN/WebGL, slow API, declined/invalid order, and duplicate submission.
- Verify approved catalog freshness and unavailable/closed handling. No payment/delivery promise before operational support is proven.
- Confirm exact project, branch, domain, current production deployment ID, and last-known-good rollback target. A kitchen preview does not verify the root storefront.
- Keep preview authenticated where available and non-indexed; keep production data out of test runs.
- Use backwards-compatible API contracts and staged migrations. Record frontend rollback separately from database recovery; reverting JavaScript does not undo data mutations.
- Obtain owner approval of the concrete preview and deployment path before production promotion. Watch failures/accepted orders afterward; disable order intake safely on critical failure while leaving menu/phone/directions available.

## 7. What is needed from Noel at review

1. Confirm actual store and kitchen hours, including Sundays, and which custom domain you control and want customers to use.
2. Provide/authorize the current aggregate transaction and contribution baseline so growth targets are defensible.
3. Approve real photography, current menu/offer content, and fulfillment capabilities.
4. Identify the correct hosting project/account or connect its scoped access; choose a commercial Vercel path or Cloudflare preview after the design review.

No credential should be pasted into chat or source code. These inputs do not block the research, prototype, or isolated resilience patch; they gate truthful content and production launch.

## Evidence limits and research record

Research combined pinned repository code/configuration, current open PR metadata, read-only HTTP checks, live browser inspection, official Google/W3C/hosting documentation, Baymard original UX research, and first-party local competitor pages. Discovery searches covered local ranking, Core Web Vitals, Kearny grocery/pickup, guest checkout, and static hosting costs; follow-up inspected the conflicting Anthony’s domain and reproduced the WebGL failure. Research stopped once these consequential decisions had primary evidence or explicit gaps. There is no evidence here for a guaranteed uplift, competitor conversion rate, current store margin, exact local demand volume, or 3D-induced sales lift.

All web sources were accessed 5 September 2026. Dynamic pages may change. Baymard guest-checkout article is dated 17 January 2023; Web Vitals page states updated 31 October 2024; W3C motion guidance states updated 16 September 2025. Other cited pages were treated as current retrieved documentation rather than assigned invented publication dates.
