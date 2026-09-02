# Invoice pricing and SuperApp boundary

Decision: keep the staff pricing system in `anthony-supermarket` and the Enatega-derived customer/delivery clients in `anthony-superapp`.

The Pricing Hub is authoritative for invoice evidence, vendor aliases, UPC matching, cost-per-unit math, retail approval, price history, and price-gun exports. The SuperApp consumes only approved catalog and price data. This prevents an ordering client or OCR result from silently changing store prices.

Retail remains base unit cost × 1.70 unless the owner explicitly overrides it. Unclear product identity, UPC, pack size, quantity, or invoice arithmetic blocks approval.
