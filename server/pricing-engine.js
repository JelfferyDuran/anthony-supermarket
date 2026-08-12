'use strict';

const RETAIL_MULTIPLIER = 1.70;

function finiteNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${field} must be a number`);
  return number;
}

function roundMoney(value) {
  return Math.round((finiteNumber(value, 'value') + Number.EPSILON) * 100) / 100;
}

function normalizeUpc(value) {
  return String(value || '').replace(/\D/g, '');
}

function retailFromUnitCost(unitCost) {
  const cost = finiteNumber(unitCost, 'unit cost');
  if (cost < 0) throw new Error('unit cost cannot be negative');
  return roundMoney(cost * RETAIL_MULTIPLIER);
}

function unitCostFromCase({ lineTotal, caseQuantity, unitsPerCase, lineDiscount = 0, allocatedCharges = 0 }) {
  const total = finiteNumber(lineTotal, 'line total');
  const cases = finiteNumber(caseQuantity, 'case quantity');
  const units = finiteNumber(unitsPerCase, 'units per case');
  const discount = finiteNumber(lineDiscount, 'line discount');
  const charges = finiteNumber(allocatedCharges, 'allocated charges');
  if (cases <= 0 || units <= 0) throw new Error('case quantity and units per case must be positive');
  if (total < 0 || discount < 0 || charges < 0) throw new Error('invoice amounts cannot be negative');
  return roundMoney((total - discount + charges) / (cases * units));
}

function priceInvoiceLine(item, position = 0) {
  const reasons = [];
  const upc = normalizeUpc(item.upc || item.extracted_upc);
  const confidence = finiteNumber(item.ocr_confidence ?? item.confidence ?? 0, 'OCR confidence');
  if (!upc) reasons.push('missing UPC');
  if (confidence < 0.90) reasons.push('OCR confidence below 0.90');
  let unitCost = 0;
  try {
    unitCost = item.explicit_unit_cost != null
      ? roundMoney(finiteNumber(item.explicit_unit_cost, 'explicit unit cost'))
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
  const requestedStatus = item.status || item.review_status || 'needs_review';
  return {
    line_number: item.line_number || position + 1,
    vendor_sku: item.vendor_sku || '', upc,
    description: item.description || item.extracted_description || '',
    department: item.department || '',
    case_quantity: Number(item.case_quantity ?? item.cases ?? 0),
    units_per_case: Number(item.units_per_case ?? item.units ?? 0),
    line_total: roundMoney(Number(item.line_total ?? item.total ?? 0)),
    unit_cost: unitCost,
    final_retail_price: retailFromUnitCost(unitCost),
    retail_multiplier: RETAIL_MULTIPLIER,
    ocr_confidence: confidence,
    status: reasons.length || requestedStatus !== 'approved' ? 'needs_review' : 'approved',
    review_reason: [...reasons, item.review_reason].filter(Boolean).join('; ')
  };
}

function priceInvoice(payload) {
  const invoice = payload.invoice || {};
  const items = (payload.items || []).map(priceInvoiceLine);
  const extractedLineSum = roundMoney(items.reduce((sum, item) => sum + item.line_total, 0));
  const invoiceSubtotal = roundMoney(Number(invoice.subtotal ?? invoice.invoice_subtotal ?? extractedLineSum));
  return { invoice: { ...invoice, invoice_subtotal: invoiceSubtotal }, items, reconciliation: {
    invoice_subtotal: invoiceSubtotal, extracted_line_sum: extractedLineSum,
    variance: roundMoney(invoiceSubtotal - extractedLineSum)
  }};
}

module.exports = { RETAIL_MULTIPLIER, normalizeUpc, priceInvoice, priceInvoiceLine, retailFromUnitCost, roundMoney, unitCostFromCase };
