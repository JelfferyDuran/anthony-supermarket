# Public and Internal Surface Boundary

Date: 2026-08-09

## Decision
The customer storefront displays only customer-facing catalog prices and approved product information. Invoice processing, base costs, markup calculations, employee label reports, traffic analytics, store settings, staff roles, and audit data belong in the authenticated manager console.

Public summary metrics may describe the shopping experience, but must not expose inventory cost, internal retail-value accounting, projected profit, or margin data.

## Translation boundary
Interface copy, descriptions, and generic product names switch through explicit curated English/Spanish catalog fields. Official store names, logos, addresses, phone numbers, UPCs, and brand tokens remain invariant; no automatic translator is allowed to rewrite them.

## Traffic boundary
The storefront may send a minimal page-activity event to the protected Insights endpoint. The event contains only path, referrer domain, coarse device class, selected storefront language, and timestamp. It excludes customer/order PII, full IP addresses, and raw user agents, and respects both Do Not Track and Global Privacy Control.

## Rollback
The storefront change is one isolated HTML revision. Reverting it restores the prior public links and wording; it does not change production orders, invoice records, authentication, or database pricing.
