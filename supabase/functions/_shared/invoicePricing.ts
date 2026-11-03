export type InvoiceInput = {
  vendor?: unknown;
  invoiceNumber?: unknown;
  invoiceDate?: unknown;
  invoiceTotal?: unknown;
  pages?: unknown;
  noCharge?: unknown;
};

export type InvoiceLineInput = {
  name?: unknown;
  upc?: unknown;
  quantity?: unknown;
  caseCost?: unknown;
  packQty?: unknown;
  lineAmount?: unknown;
};

export type PricingPreviewInput = {
  invoice?: InvoiceInput;
  items?: InvoiceLineInput[];
};

export class InvoicePricingError extends Error {}

function fail(message: string): never {
  throw new InvoicePricingError(message);
}

function roundRetailUp(value: number) {
  const dollars = Math.floor(value);
  const first = dollars + 0.49;
  const second = dollars + 0.99;
  const rounded = value <= first ? first : (value <= second ? second : dollars + 1.49);
  return Math.round(rounded * 100) / 100;
}

export function buildPricingPreview(body: PricingPreviewInput) {
  if (!Array.isArray(body?.items) || body.items.length < 1 || body.items.length > 200) {
    fail("Provide between 1 and 200 invoice lines");
  }

  const invoice = body.invoice || {};
  const vendor = String(invoice.vendor || "").trim();
  const invoiceNumber = String(invoice.invoiceNumber || "").trim();
  const invoiceDate = String(invoice.invoiceDate || "").trim();
  const invoiceTotal = Number(invoice.invoiceTotal);
  const pages = Number(invoice.pages);
  const noCharge = invoice.noCharge === true;
  if (vendor.length < 2 || vendor.length > 120) fail("Vendor identity is required");
  if (!/^[A-Za-z0-9._/# -]{1,64}$/.test(invoiceNumber)) fail("Invoice or order number is required");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(invoiceDate) || Number.isNaN(Date.parse(`${invoiceDate}T12:00:00Z`))) fail("Valid invoice date is required");
  if (!Number.isFinite(invoiceTotal) || invoiceTotal < 0 || invoiceTotal > 1000000) fail("Valid invoice total is required");
  if (!Number.isInteger(pages) || pages < 1 || pages > 100) fail("Valid invoice page count is required");
  if (noCharge && invoiceTotal !== 0) fail("No-charge invoices must reconcile to $0.00");

  const items = [];
  let calculatedTotal = 0;
  for (let index = 0; index < body.items.length; index += 1) {
    const raw = body.items[index] || {};
    const name = String(raw.name || "").trim();
    const upc = String(raw.upc || "").trim();
    const quantity = Number(raw.quantity);
    const caseCost = Number(raw.caseCost);
    const packQty = Number(raw.packQty);
    const lineAmount = Number(raw.lineAmount);
    if (!name || name.length > 140) fail(`Line ${index + 1}: product identity is required`);
    if (upc && !/^[A-Za-z0-9 -]{4,32}$/.test(upc)) fail(`Line ${index + 1}: UPC is invalid`);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) fail(`Line ${index + 1}: valid case quantity is required`);
    if (!Number.isFinite(caseCost) || caseCost < 0 || caseCost > 100000) fail(`Line ${index + 1}: valid case cost is required`);
    if (!Number.isInteger(packQty) || packQty < 1 || packQty > 10000) fail(`Line ${index + 1}: confirm whole units per case before pricing`);
    if (!Number.isFinite(lineAmount) || lineAmount < 0 || lineAmount > 1000000) fail(`Line ${index + 1}: valid line amount is required`);
    const expectedLineAmount = Math.round(quantity * caseCost * 100) / 100;
    if (Math.abs(expectedLineAmount - lineAmount) > 0.01) fail(`Line ${index + 1}: case quantity × case cost does not match line amount`);
    if (noCharge && (caseCost !== 0 || lineAmount !== 0)) fail(`Line ${index + 1}: no-charge invoice lines must be $0.00`);
    if (!noCharge && caseCost <= 0) fail(`Line ${index + 1}: positive case cost is required; $0 samples must be marked no-charge`);
    calculatedTotal += lineAmount;

    const costPerUnit = noCharge ? null : Math.round((caseCost / packQty) * 10000) / 10000;
    const exactRetail = noCharge ? null : Math.round((Number(costPerUnit) * 1.70) * 10000) / 10000;
    items.push({
      name,
      upc,
      quantity,
      caseCost: Math.round(caseCost * 100) / 100,
      packQty,
      lineAmount: Math.round(lineAmount * 100) / 100,
      costPerUnit,
      exactRetail,
      suggestedRetail: noCharge ? null : roundRetailUp(Number(exactRetail)),
      markupMultiplier: 1.70,
      noCharge,
    });
  }

  calculatedTotal = Math.round(calculatedTotal * 100) / 100;
  if (Math.abs(calculatedTotal - invoiceTotal) > 0.01) fail("Invoice total does not match the sum of reviewed line amounts");
  return {
    status: noCharge ? "no_charge" : "review_required",
    invoice: { vendor, invoiceNumber, invoiceDate, invoiceTotal: Math.round(invoiceTotal * 100) / 100, pages, noCharge },
    reconciliation: { calculatedTotal, difference: Math.round((invoiceTotal - calculatedTotal) * 100) / 100 },
    items,
  };
}
