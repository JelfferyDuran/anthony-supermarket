'use strict';

// Server-authoritative pricing math for the invoice pipeline.
//
// One markup rule, locked by the owner on 2026-08-19: retail is cost x 1.70.
//
// These two constants are the same rule expressed two ways — a multiplier for
// deriving an approved price, and a percentage for the hub's slider — and they
// must stay in agreement. They used to disagree (1.70 in the vault, 65% in the
// hub), which meant the browser previewed one price while the server approved
// another; closing that gap is what the 2026-08-19 decision did.
const RETAIL_MULTIPLIER = normalizeMultiplier(process.env.PRICING_RETAIL_MULTIPLIER, 1.70);
const HUB_PREVIEW_MARKUP_PCT = Math.round((RETAIL_MULTIPLIER - 1) * 100);

// Reconciliation tolerance between an invoice's stated subtotal and the sum of
// its extracted lines. Anything wider blocks approval.
const MAX_RECONCILIATION_VARIANCE = 0.01;

const MIN_OCR_CONFIDENCE = 0.90;

function normalizeMultiplier(raw, fallback) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return value;
}

function finiteNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${field} must be a number`);
  return number;
}

// Currency rounding. Scales to integer cents before rounding so values that land
// on a float boundary (2.675 -> 2.67 under naive Math.round) settle correctly.
function roundMoney(value) {
  const cents = finiteNumber(value, 'value') * 100;
  return Math.round(cents + (cents >= 0 ? Number.EPSILON * 100 : -Number.EPSILON * 100)) / 100;
}

// Cost-per-unit keeps four decimals: fractional cents are real at case scale and
// must not be rounded away before the retail multiplier is applied.
function roundCost(value) {
  return Math.round((finiteNumber(value, 'unit cost') + Number.EPSILON) * 10000) / 10000;
}

// UPCs are text everywhere. This strips separators for comparison but never
// trims leading zeros, which are significant.
function normalizeUpc(value) {
  return String(value == null ? '' : value).replace(/\D/g, '');
}

// The store's shelf convention: every retail price ends in .99.
// Mirrors the Pricing Hub's roundRetail() exactly so the browser preview and the
// server never disagree about what a suggested price is.
function roundRetail(price) {
  const value = finiteNumber(price, 'price');
  const base = Math.floor(value);
  return value - base >= 0.5 ? base + 0.99 : Math.max(0.99, base - 1 + 0.99);
}

function retailFromUnitCost(unitCost, multiplier = RETAIL_MULTIPLIER) {
  const cost = finiteNumber(unitCost, 'unit cost');
  if (cost < 0) throw new Error('unit cost cannot be negative');
  return roundMoney(cost * normalizeMultiplier(multiplier, RETAIL_MULTIPLIER));
}

// The shelf-ready suggestion the hub shows: cost marked up, then snapped to .99.
function suggestedRetail(unitCost, markupPct = HUB_PREVIEW_MARKUP_PCT) {
  const cost = finiteNumber(unitCost, 'unit cost');
  if (cost < 0) throw new Error('unit cost cannot be negative');
  if (cost === 0) return 0;
  return roundRetail(cost * (1 + finiteNumber(markupPct, 'markup') / 100));
}

function unitCostFromCase({ lineTotal, caseQuantity, unitsPerCase, lineDiscount = 0, allocatedCharges = 0 }) {
  const total = finiteNumber(lineTotal, 'line total');
  const cases = finiteNumber(caseQuantity, 'case quantity');
  const units = finiteNumber(unitsPerCase, 'units per case');
  const discount = finiteNumber(lineDiscount, 'line discount');
  const charges = finiteNumber(allocatedCharges, 'allocated charges');
  if (cases <= 0 || units <= 0) throw new Error('case quantity and units per case must be positive');
  if (total < 0 || discount < 0 || charges < 0) throw new Error('invoice amounts cannot be negative');
  return roundCost((total - discount + charges) / (cases * units));
}

// Variance of a new cost against the last known cost for the same product.
// Returns null when there is no prior cost to compare against — a first sighting
// is not a price change.
function costVariance(previousUnitCost, newUnitCost) {
  if (previousUnitCost == null || previousUnitCost === '') return null;
  const previous = finiteNumber(previousUnitCost, 'previous unit cost');
  const next = finiteNumber(newUnitCost, 'new unit cost');
  const delta = roundCost(next - previous);
  return {
    previous_unit_cost: roundCost(previous),
    new_unit_cost: roundCost(next),
    delta,
    percent: previous === 0 ? null : Math.round((delta / previous) * 10000) / 100,
    direction: delta > 0 ? 'increase' : delta < 0 ? 'decrease' : 'flat'
  };
}

function priceInvoiceLine(item, position = 0) {
  const reasons = [];
  const upc = normalizeUpc(item.upc || item.extracted_upc);
  const confidence = finiteNumber(item.ocr_confidence ?? item.confidence ?? 0, 'OCR confidence');
  if (!upc) reasons.push('missing UPC');
  if (confidence < MIN_OCR_CONFIDENCE) reasons.push(`OCR confidence below ${MIN_OCR_CONFIDENCE.toFixed(2)}`);

  let unitCost = 0;
  try {
    unitCost = item.explicit_unit_cost != null
      ? roundCost(finiteNumber(item.explicit_unit_cost, 'explicit unit cost'))
      : unitCostFromCase({
        lineTotal: item.line_total ?? item.total,
        caseQuantity: item.case_quantity ?? item.cases,
        unitsPerCase: item.units_per_case ?? item.units,
        lineDiscount: item.line_discount,
        allocatedCharges: item.allocated_charges
      });
  } catch (error) {
    reasons.push(error.message);
  }

  const variance = costVariance(item.previous_unit_cost, unitCost);
  if (variance && Math.abs(variance.delta) > 0) reasons.push(`cost ${variance.direction} vs last invoice`);

  // OCR and fuzzy matching can suggest but never approve. A line only stays
  // 'approved' if the caller asked for it AND nothing needs a human.
  const requestedStatus = item.status || item.review_status || 'needs_review';
  return {
    line_number: item.line_number || position + 1,
    vendor_sku: item.vendor_sku || '',
    upc,
    description: item.description || item.extracted_description || '',
    department: item.department || '',
    case_quantity: Number(item.case_quantity ?? item.cases ?? 0),
    units_per_case: Number(item.units_per_case ?? item.units ?? 0),
    line_total: roundMoney(Number(item.line_total ?? item.total ?? 0)),
    unit_cost: unitCost,
    final_retail_price: retailFromUnitCost(unitCost),
    suggested_shelf_price: suggestedRetail(unitCost),
    retail_multiplier: RETAIL_MULTIPLIER,
    ocr_confidence: confidence,
    variance,
    status: reasons.length || requestedStatus !== 'approved' ? 'needs_review' : 'approved',
    review_reason: [...reasons, item.review_reason].filter(Boolean).join('; ')
  };
}

function priceInvoice(payload) {
  const invoice = payload.invoice || {};
  const items = (payload.items || []).map(priceInvoiceLine);
  const extractedLineSum = roundMoney(items.reduce((sum, item) => sum + item.line_total, 0));
  const invoiceSubtotal = roundMoney(Number(invoice.subtotal ?? invoice.invoice_subtotal ?? extractedLineSum));
  const variance = roundMoney(invoiceSubtotal - extractedLineSum);
  return {
    invoice: { ...invoice, invoice_subtotal: invoiceSubtotal },
    items,
    reconciliation: {
      invoice_subtotal: invoiceSubtotal,
      extracted_line_sum: extractedLineSum,
      variance,
      within_tolerance: Math.abs(variance) <= MAX_RECONCILIATION_VARIANCE,
      tolerance: MAX_RECONCILIATION_VARIANCE
    }
  };
}

// Gate applied immediately before an approval transaction is allowed to run.
//
// This is deliberately NOT the extraction gate. At extraction the question is
// "can this OCR output be trusted?" — hence the UPC and confidence checks. By
// approval time a manager has already resolved identity by matching a product,
// so the questions are only: is every line matched, is the money sane, and do
// the lines add up to the invoice? Reusing the extraction gate here would reject
// a correctly reviewed line just because the vendor never printed a UPC, which
// is the normal case for 42 of the store's current items.
//
// The database enforces the same rules inside the transaction. This runs first
// only so the reviewer gets a readable list instead of a raw SQL error.
function approvalReadiness({ invoiceSubtotal, lines }) {
  const blockers = [];
  const rows = Array.isArray(lines) ? lines : [];

  if (!rows.length) {
    blockers.push('no reviewed lines were submitted');
    return { blockers, lineSum: 0, variance: 0 };
  }

  const unmatched = rows.filter(line => !line.product_id);
  if (unmatched.length) {
    blockers.push(`${unmatched.length} line(s) still need review: no product matched`);
  }

  for (const line of rows) {
    const label = line.line_number == null ? 'a line' : `line ${line.line_number}`;
    const unitCost = Number(line.unit_cost);
    if (!Number.isFinite(unitCost) || unitCost < 0) {
      blockers.push(`${label} has an invalid unit cost`);
      continue;
    }
    // Internal supplies are not sold, so they carry no retail to compare.
    if (line.internal) continue;
    const retail = Number(line.retail_price);
    if (!Number.isFinite(retail)) {
      blockers.push(`${label} has no retail price`);
    } else if (retail < unitCost) {
      blockers.push(`${label} is priced below cost`);
    }
  }

  const lineSum = roundMoney(rows.reduce((sum, line) => sum + Number(line.line_total || 0), 0));
  const subtotal = invoiceSubtotal == null ? lineSum : roundMoney(Number(invoiceSubtotal));
  const variance = roundMoney(subtotal - lineSum);
  if (Math.abs(variance) > MAX_RECONCILIATION_VARIANCE) {
    blockers.push(`reconciliation variance $${variance.toFixed(2)} exceeds $${MAX_RECONCILIATION_VARIANCE.toFixed(2)}`);
  }

  return { blockers, lineSum, variance };
}

// Gate applied to a freshly EXTRACTED invoice, before a human has reviewed it.
// Returns a list of blocking reasons; empty means the invoice may be approved.
function approvalBlockers(priced) {
  const blockers = [];
  if (!priced.reconciliation.within_tolerance) {
    blockers.push(`reconciliation variance $${priced.reconciliation.variance.toFixed(2)} exceeds $${MAX_RECONCILIATION_VARIANCE.toFixed(2)}`);
  }
  const unresolved = priced.items.filter(item => item.status !== 'approved');
  if (unresolved.length) {
    blockers.push(`${unresolved.length} line(s) still need review`);
  }
  const belowCost = priced.items.filter(item => item.status === 'approved' && item.final_retail_price < item.unit_cost);
  if (belowCost.length) {
    blockers.push(`${belowCost.length} line(s) priced below cost`);
  }
  return blockers;
}

module.exports = {
  HUB_PREVIEW_MARKUP_PCT,
  MAX_RECONCILIATION_VARIANCE,
  MIN_OCR_CONFIDENCE,
  RETAIL_MULTIPLIER,
  approvalBlockers,
  approvalReadiness,
  costVariance,
  normalizeUpc,
  priceInvoice,
  priceInvoiceLine,
  retailFromUnitCost,
  roundCost,
  roundMoney,
  roundRetail,
  suggestedRetail,
  unitCostFromCase
};
