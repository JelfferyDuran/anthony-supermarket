# Evidence ledger — 2026-09-05

| Claim family | Source / provenance | Confidence and limitation |
|---|---|---|
| Current architecture | Main commit `dfb38b633f8116270d833997f3eaee882dfe363c`; root index/package/Vercel config, kitchen App/checkout/API, catalog README, current state, recursive tree | High for source/configuration at that revision; does not prove deployed backend equivalence |
| Active work | GitHub open PR collection: #13,16,21,28,29,30,33,41,46; #33 diff | High for observed PR state; earlier test claims remain attributed, not rerun |
| Critical loading failure | Live Vercel storefront browser: renderer throws; `body.className=loading`; menu empty; screenshot | High for reproduced environment; affected share of actual customers unknown |
| Domain/hours inconsistency | [Legacy Anthony’s](https://www.anthonyssupermarket.com/) browser and extraction; Vercel storefront browser | High for displayed inconsistency; correct hours and account ownership unknown |
| Local search factors | Google, [local ranking](https://support.google.com/business/answer/7091?hl=en), retrieved 2026-09-05 | High; no guaranteed ranking gain |
| Intent metric definitions | Google, [Business Profile performance](https://support.google.com/business/answer/9918094?hl=en), retrieved 2026-09-05 | High; Anthony’s private account metrics not retrieved |
| Review integrity | Google, [reviews](https://support.google.com/business/answer/3474122?hl=en), retrieved 2026-09-05 | High; use genuine requests, not incentives/review gating |
| Competitor neighborhood presence | Seabra, [locations](https://seabrafoods.com/pages/seabra-foods-locations-information) and [circulars](https://seabrafoods.com/pages/weekly-special-circulars-in-store-only), retrieved 2026-09-05 | High for published presence/features; no conversion or fulfillment measurement |
| ShopRite journey | [Kearny Square indexed category](https://www.shoprite.com/sm/pickup/rsid/166/categories/diabetes-friendly/snacks-id-229370), retrieved 2026-09-05 | Moderate; indexed first-party result, direct opening failed |
| Guest ordering | Baymard, [guest checkout](https://baymard.com/blog/make-guest-checkout-prominent), 2023-01-17; [delayed account creation](https://baymard.com/blog/delayed-account-creation), 2023-09-19 | Strong general UX evidence; local grocery applicability is an inference, not a numerical uplift estimate |
| Performance criteria | Google web.dev, [Web Vitals](https://web.dev/articles/vitals), updated 2024-10-31 | High; field metrics and lab tests differ |
| Motion accessibility | W3C, [SC 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), updated 2025-09-16 | High; Level AAA criterion, not blanket conformance certification |
| Hosting choice | [Vercel Hobby](https://vercel.com/docs/plans/hobby), [Cloudflare billing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/), [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/), retrieved 2026-09-05 | High for current terms; actual commercial deployment account/bill not verified |
| Modern design references | [Linear](https://linear.app/), [Framer](https://www.framer.com/), retrieved 2026-09-05 | Reference direction only; no grocery conversion evidence |
| Financial target | User reports 250–300 customers/day | Definition, date series, basket, contribution and daily shortfall remain insufficient data |

## Outstanding gaps that affect decisions

- Owner-confirmed domain, store/kitchen hours, current menu/offer availability.
- Correct Vercel project/account and Cloudflare DNS ownership/configuration.
- Fresh authenticated manager/backend verification; no production test order performed.
- Private aggregate POS/settlement/contribution and website funnel baseline.
- Real product/food photography and prototype visual/accessibility QA.

## Search record and stopping rule

First pass: official local ranking and Core Web Vitals; Kearny supermarket/pickup competitors. Follow-up: guest checkout, static hosting/commercial-use boundaries, W3C motion, Google intent definitions, existing Anthony’s domain, current source/PR divergence. Two-site HTTP checks and live browser inspection resolved the principal availability and hours discrepancies. Stopped broad research because the next material uncertainties require owner data/runtime access, not more generic conversion articles.
