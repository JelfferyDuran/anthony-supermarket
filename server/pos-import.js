'use strict';

// NRS POS sales CSV parser.
//
// NRS (National Retail Solutions) has no public API — the merchant portal offers
// CSV download reporting only — so sales arrive as periodic file uploads. The
// export's column names vary between report types and the store's reports come
// back in a mix of English and Spanish, so columns are resolved by header alias
// rather than by position.
//
// Column aliases, numeric coercion, summary-row skipping and the void/refund
// conventions deliberately mirror `nrs/nrs-analyze.py`, which already processes
// these exports for the daily briefing. The two paths must agree about what a
// row means, or the financial dashboard and the daily briefing would report
// different sales for the same day.
//
// This parser NEVER invents a value. A file whose required columns cannot be
// resolved is rejected with the header it actually saw, so a changed export
// format surfaces as an error rather than as silently wrong revenue.

const crypto = require('crypto');

// Ordered alias lists. A header matches if it CONTAINS one of these, which is
// how the Python analyzer matches too.
const COLUMNS = {
  date: ['date', 'fecha', 'day'],
  time: ['time', 'hora'],
  item: ['item', 'product', 'producto', 'desc', 'description', 'plu'],
  upc: ['upc', 'barcode', 'sku', 'codigo'],
  quantity: ['qty', 'quantity', 'cantidad', 'units'],
  unitPrice: ['unit price', 'price', 'precio', 'rate'],
  total: ['line total', 'ext', 'total', 'amount', 'monto', 'sales'],
  payment: ['payment', 'tender', 'method', 'forma', 'pay'],
  void: ['void', 'anul', 'cancel'],
  refund: ['refund', 'return', 'devol'],
  department: ['dept', 'department', 'departamento', 'category', 'grupo'],
  cashier: ['cashier', 'employee', 'operator', 'clerk', 'vendedor']
};

// Rows that are report furniture rather than sales.
const SUMMARY_MARKERS = ['grand total', 'total sales', 'report total', 'page '];

// Non-sale drawer events. They are counted, never treated as revenue.
const DRAWER_EVENTS = new Set([
  'NO SALE', 'NO SALE / DRAWER', 'OPEN DRAWER', 'PAID OUT', 'PAID IN', 'CASH IN', 'CASH OUT'
]);

const TRUTHY = new Set(['y', 'yes', '1', 'true', 'void', 'anulado', 'refund', 'return', 'devolucion']);

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

// Splits one CSV line, honouring quoted fields and doubled quotes.
function splitLine(line, delimiter) {
  const cells = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') { cell += '"'; i++; }
        else quoted = false;
      } else cell += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === delimiter) {
      cells.push(cell); cell = '';
    } else {
      cell += ch;
    }
  }
  cells.push(cell);
  return cells.map(value => value.trim());
}

// NRS exports have appeared with comma, semicolon and tab delimiters. Pick the
// one that yields the most columns on the header line.
function detectDelimiter(headerLine) {
  let best = ',';
  let bestCount = 0;
  for (const delimiter of [',', ';', '\t', '|']) {
    const count = splitLine(headerLine, delimiter).length;
    if (count > bestCount) { bestCount = count; best = delimiter; }
  }
  return best;
}

function toNumber(value) {
  if (value == null) return 0;
  const text = String(value).trim().replace(/[$,\s]/g, '');
  if (text === '' || text === '-' || text === '--' || text.toUpperCase() === 'N/A') return 0;
  // Parenthesised negatives: (12.34) means -12.34 on some NRS reports.
  const parenthesised = /^\((.*)\)$/.exec(text);
  const normalized = parenthesised ? `-${parenthesised[1]}` : text;
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function normalizeName(value) {
  return String(value == null ? '' : value).replace(/\s+/g, ' ').trim().toUpperCase();
}

// UPCs stay text and keep their leading zeros.
function normalizeUpc(value) {
  const digits = String(value == null ? '' : value).replace(/\D/g, '');
  return digits.length >= 6 ? digits : null;
}

function isTruthy(value) {
  return TRUTHY.has(String(value == null ? '' : value).trim().toLowerCase());
}

// Accepts the date formats seen on NRS exports. Returns YYYY-MM-DD or null —
// never a guess.
function parseDate(value) {
  const text = String(value == null ? '' : value).trim();
  if (!text) return null;

  let match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(text);
  if (match) return iso(match[1], match[2], match[3]);

  match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/.exec(text);
  if (match) {
    const first = Number(match[1]);
    const second = Number(match[2]);
    const year = match[3].length === 2 ? `20${match[3]}` : match[3];
    // A first component above 12 can only be a day, so D/M/Y is certain — this
    // shows up on the Spanish-language reports. Otherwise the value is genuinely
    // ambiguous and the US convention wins, because NRS is a US POS. That choice
    // is only ever made when both readings are valid dates.
    if (first > 12 && second <= 12) return iso(year, second, first);
    return iso(year, first, second);
  }
  return null;
}

function iso(year, month, day) {
  const y = Number(year), m = Number(month), d = Number(day);
  if (!y || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function findColumn(header, aliases) {
  for (let i = 0; i < header.length; i++) {
    for (const alias of aliases) {
      if (header[i].includes(alias)) return i;
    }
  }
  return null;
}

// Parses an NRS CSV export into sale rows plus a summary.
//
// Throws when the file has no header, or when neither an item nor a total column
// can be found — a file that cannot be understood must not become revenue.
function parsePosCsv(text, { fallbackDate = null } = {}) {
  const clean = String(text).replace(/^﻿/, '');
  const lines = clean.split(/\r?\n/).filter(line => line.trim() !== '');
  if (!lines.length) throw new Error('The CSV file is empty');

  const delimiter = detectDelimiter(lines[0]);
  const header = splitLine(lines[0], delimiter).map(cell => cell.toLowerCase());

  const columns = {};
  for (const [key, aliases] of Object.entries(COLUMNS)) {
    columns[key] = findColumn(header, aliases);
  }
  // The UPC aliases overlap the item aliases on some exports ('item upc').
  // If both resolved to the same column, treat it as the item column only.
  if (columns.upc !== null && columns.upc === columns.item) columns.upc = null;

  if (columns.item === null && columns.upc === null) {
    throw new Error(`Could not find an item or UPC column. Header was: ${header.join(', ')}`);
  }
  if (columns.total === null && columns.unitPrice === null) {
    throw new Error(`Could not find a sales total or price column. Header was: ${header.join(', ')}`);
  }

  const rows = [];
  const skipped = [];
  let drawerEvents = 0;
  let voidTotal = 0;
  let refundTotal = 0;
  let grossSales = 0;

  for (let index = 1; index < lines.length; index++) {
    const cells = splitLine(lines[index], delimiter);
    const joined = cells.join(' ').toLowerCase();
    if (SUMMARY_MARKERS.some(marker => joined.includes(marker))) continue;

    const at = key => (columns[key] !== null && columns[key] < cells.length ? cells[columns[key]] : '');

    const itemName = String(at('item') || at('upc') || '').trim();
    if (!itemName) { skipped.push({ row: index + 1, reason: 'no item description' }); continue; }

    const normalized = normalizeName(itemName);
    if (DRAWER_EVENTS.has(normalized)) { drawerEvents++; continue; }

    const soldAt = parseDate(at('date')) || fallbackDate;
    if (!soldAt) { skipped.push({ row: index + 1, reason: 'no readable sale date' }); continue; }

    const quantityRaw = toNumber(at('quantity'));
    const unitPrice = columns.unitPrice !== null ? toNumber(at('unitPrice')) : null;
    let lineTotal = columns.total !== null ? toNumber(at('total')) : 0;

    // Derive the total when the export gives only price and quantity.
    if (!lineTotal && unitPrice && quantityRaw) lineTotal = Math.round(unitPrice * quantityRaw * 100) / 100;
    // A line with no quantity column still moved one unit if it has money on it.
    const quantity = quantityRaw || (lineTotal ? 1 : 0);

    let isVoid = isTruthy(at('void'));
    let isRefund = isTruthy(at('refund'));
    // A negative total means money went back to the customer. When the export
    // has no explicit void column, that is a refund.
    if (lineTotal < 0 && !isVoid) isRefund = true;

    if (isVoid) voidTotal += Math.abs(lineTotal);
    else if (isRefund) refundTotal += Math.abs(lineTotal);
    else grossSales += lineTotal;

    rows.push({
      sold_at: soldAt,
      upc: normalizeUpc(at('upc')) || normalizeUpc(itemName),
      item_name: itemName,
      normalized_name: normalized,
      department: String(at('department') || '').trim() || null,
      quantity: Math.abs(quantity),
      unit_price: unitPrice || null,
      gross_sales: Math.round(lineTotal * 100) / 100,
      payment_method: classifyPayment(at('payment')),
      cashier: String(at('cashier') || '').trim() || null,
      is_void: isVoid,
      is_refund: isRefund,
      source_row: index + 1
    });
  }

  const dates = rows.map(row => row.sold_at).sort();
  return {
    rows,
    skipped,
    summary: {
      delimiter,
      header,
      resolved_columns: Object.fromEntries(Object.entries(columns).filter(([, value]) => value !== null)),
      row_count: lines.length - 1,
      imported_count: rows.length,
      skipped_count: skipped.length,
      drawer_events: drawerEvents,
      gross_sales: Math.round(grossSales * 100) / 100,
      void_total: Math.round(voidTotal * 100) / 100,
      refund_total: Math.round(refundTotal * 100) / 100,
      period_start: dates[0] || null,
      period_end: dates[dates.length - 1] || null
    }
  };
}

function classifyPayment(value) {
  const text = String(value == null ? '' : value).trim().toUpperCase();
  if (!text) return null;
  if (/CASH|EFECTIVO|EFECT/.test(text)) return 'CASH';
  if (/CARD|CREDIT|DEBIT|VISA|MASTER|AMEX|DISCOVER|TARJETA/.test(text)) return 'CARD';
  if (/EBT|SNAP|WIC/.test(text)) return 'EBT';
  if (/CHECK|CHEQUE/.test(text)) return 'CHECK';
  if (/GIFT/.test(text)) return 'GIFT';
  return text.split(/\s+/)[0];
}

// Ties parsed rows to catalog products.
//
// A UPC match is evidence. A name match is a convenience and is recorded as such
// so a margin figure can always be traced back to how it was linked. Neither
// changes a price — matching here only attributes cost to revenue.
function matchProducts(rows, products) {
  const byUpc = new Map();
  const byName = new Map();
  for (const product of products) {
    if (product.upc) byUpc.set(String(product.upc).replace(/\D/g, ''), product.id);
    const key = normalizeName(product.name);
    // An ambiguous name maps to nothing rather than to an arbitrary product.
    if (byName.has(key) && byName.get(key) !== product.id) byName.set(key, null);
    else if (!byName.has(key)) byName.set(key, product.id);
  }

  let matched = 0;
  for (const row of rows) {
    let productId = row.upc ? byUpc.get(row.upc) : undefined;
    let method = productId ? 'upc' : null;
    if (!productId) {
      const candidate = byName.get(row.normalized_name);
      if (candidate) { productId = candidate; method = 'name'; }
    }
    row.product_id = productId || null;
    row.match_method = productId ? method : null;
    if (productId) matched++;
  }
  return { matched, unmatched: rows.length - matched };
}

module.exports = { matchProducts, normalizeName, normalizeUpc, parseDate, parsePosCsv, sha256, toNumber };
