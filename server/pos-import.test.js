'use strict';

// Tests for the NRS POS CSV parser. Fixtures are invented, non-sensitive rows
// shaped like the exports the store actually receives — including the awkward
// ones: Spanish headers, a semicolon delimiter, parenthesised negatives, report
// footers, and drawer events.

const test = require('node:test');
const assert = require('node:assert/strict');
const { matchProducts, normalizeUpc, parseDate, parsePosCsv, toNumber } = require('./pos-import');

const BASIC = [
  'Date,Item Description,UPC,Qty,Unit Price,Line Total,Payment,Cashier,Department',
  '08/15/2026,Sample Coffee 12/10oz,0074471000500,2,5.99,11.98,CASH,Ana,Tea/Coffee',
  '08/15/2026,Sample Rice 20/2lb,0012000001260,1,3.99,3.99,VISA CREDIT,Ana,Rice',
  '08/15/2026,NO SALE,,0,0,0,,Ana,',
  'Grand Total,,,,,15.97,,,'
].join('\n');

// ── Numeric and date coercion ────────────────────────────────────────────────

test('strips currency formatting and handles parenthesised negatives', () => {
  assert.equal(toNumber('$1,234.56'), 1234.56);
  assert.equal(toNumber('(12.34)'), -12.34);
  assert.equal(toNumber('N/A'), 0);
  assert.equal(toNumber('--'), 0);
  assert.equal(toNumber(''), 0);
});

test('reads the date formats these exports use, and refuses the rest', () => {
  assert.equal(parseDate('08/15/2026'), '2026-08-15');
  // Unambiguous D/M/Y: 15 cannot be a month.
  assert.equal(parseDate('15/08/2026'), '2026-08-15');
  // Genuinely ambiguous, so the US convention applies (NRS is a US POS).
  assert.equal(parseDate('05/08/2026'), '2026-05-08');
  assert.equal(parseDate('8/5/26'), '2026-08-05');
  assert.equal(parseDate('2026-08-15'), '2026-08-15');
  assert.equal(parseDate('not a date'), null);
  assert.equal(parseDate(''), null);
});

test('keeps UPC leading zeros and rejects fragments', () => {
  assert.equal(normalizeUpc('0074471000500'), '0074471000500');
  assert.equal(normalizeUpc('0-74471-00050-0'), '0744710005 00'.replace(/\s/g, ''));
  assert.equal(normalizeUpc('123'), null);
  assert.equal(normalizeUpc(''), null);
});

// ── Parsing ──────────────────────────────────────────────────────────────────

test('parses a standard export and totals it', () => {
  const { rows, summary } = parsePosCsv(BASIC);
  assert.equal(rows.length, 2);
  assert.equal(summary.gross_sales, 15.97);
  assert.equal(summary.drawer_events, 1, 'NO SALE counted, not sold');
  assert.equal(summary.period_start, '2026-08-15');
  assert.equal(rows[0].upc, '0074471000500');
  assert.equal(rows[0].payment_method, 'CASH');
  assert.equal(rows[1].payment_method, 'CARD');
});

test('drops report footer rows instead of counting them as sales', () => {
  const { rows } = parsePosCsv(BASIC);
  assert.ok(!rows.some(row => /grand total/i.test(row.item_name)));
});

test('reads Spanish headers and a semicolon delimiter', () => {
  const csv = [
    'Fecha;Producto;Cantidad;Precio;Monto;Forma de pago',
    '15/08/2026;Cafe Bustelo;2;5,00;10.00;EFECTIVO'
  ].join('\n');
  const { rows, summary } = parsePosCsv(csv);
  assert.equal(summary.delimiter, ';');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].item_name, 'Cafe Bustelo');
  assert.equal(rows[0].payment_method, 'CASH');
  assert.equal(rows[0].gross_sales, 10.00);
});

test('honours quoted fields containing the delimiter', () => {
  const csv = [
    'Date,Item,Qty,Total',
    '08/15/2026,"Rice, Jasmine 8/80oz",1,12.99'
  ].join('\n');
  const { rows } = parsePosCsv(csv);
  assert.equal(rows[0].item_name, 'Rice, Jasmine 8/80oz');
  assert.equal(rows[0].gross_sales, 12.99);
});

test('derives the line total when the export gives only price and quantity', () => {
  const csv = ['Date,Item,Qty,Unit Price', '08/15/2026,Sample,3,2.50'].join('\n');
  const { rows } = parsePosCsv(csv);
  assert.equal(rows[0].gross_sales, 7.50);
});

test('flags voids and refunds, keeps them, and excludes them from gross sales', () => {
  const csv = [
    'Date,Item,Qty,Line Total,Void,Refund',
    '08/15/2026,Sold,1,10.00,N,N',
    '08/15/2026,Voided,1,4.00,Y,N',
    '08/15/2026,Returned,1,3.00,N,Y'
  ].join('\n');
  const { rows, summary } = parsePosCsv(csv);
  assert.equal(rows.length, 3, 'voids and refunds are retained, not dropped');
  assert.equal(summary.gross_sales, 10.00);
  assert.equal(summary.void_total, 4.00);
  assert.equal(summary.refund_total, 3.00);
});

test('treats a negative total as a refund when there is no void column', () => {
  const csv = ['Date,Item,Qty,Line Total', '08/15/2026,Returned,1,(6.50)'].join('\n');
  const { rows, summary } = parsePosCsv(csv);
  assert.equal(rows[0].is_refund, true);
  assert.equal(summary.refund_total, 6.50);
  assert.equal(summary.gross_sales, 0);
});

test('falls back to a supplied date when the export has no date column', () => {
  const csv = ['Item,Qty,Total', 'Sample,1,5.00'].join('\n');
  const { rows } = parsePosCsv(csv, { fallbackDate: '2026-08-15' });
  assert.equal(rows[0].sold_at, '2026-08-15');
});

test('skips undated rows rather than inventing a date', () => {
  const csv = ['Item,Qty,Total', 'Sample,1,5.00'].join('\n');
  const { rows, skipped } = parsePosCsv(csv);
  assert.equal(rows.length, 0);
  assert.equal(skipped.length, 1);
  assert.match(skipped[0].reason, /sale date/);
});

test('rejects a file whose columns cannot be resolved instead of guessing', () => {
  assert.throws(() => parsePosCsv('alpha,beta,gamma\n1,2,3'), /Could not find an item or UPC column/);
  assert.throws(() => parsePosCsv('Item,Cashier\nSample,Ana'), /sales total or price column/);
  assert.throws(() => parsePosCsv(''), /empty/);
});

test('reports the header it saw so a changed export format is diagnosable', () => {
  try {
    parsePosCsv('alpha,beta\n1,2');
    assert.fail('should have thrown');
  } catch (error) {
    assert.match(error.message, /alpha, beta/);
  }
});

test('tolerates a UTF-8 BOM', () => {
  const { rows } = parsePosCsv('﻿' + BASIC);
  assert.equal(rows.length, 2);
});

// ── Product matching ─────────────────────────────────────────────────────────

test('matches on UPC as evidence and on name only as a convenience', () => {
  const { rows } = parsePosCsv(BASIC);
  const products = [
    { id: 'p1', name: 'Something Else', upc: '0074471000500' },
    { id: 'p2', name: 'Sample Rice 20/2lb', upc: null }
  ];
  const result = matchProducts(rows, products);
  assert.equal(result.matched, 2);
  assert.equal(rows[0].product_id, 'p1');
  assert.equal(rows[0].match_method, 'upc');
  assert.equal(rows[1].product_id, 'p2');
  assert.equal(rows[1].match_method, 'name');
});

test('an ambiguous product name matches nothing rather than the wrong product', () => {
  const csv = ['Date,Item,Qty,Total', '08/15/2026,Duplicate Name,1,5.00'].join('\n');
  const { rows } = parsePosCsv(csv);
  matchProducts(rows, [
    { id: 'p1', name: 'Duplicate Name', upc: null },
    { id: 'p2', name: 'Duplicate Name', upc: null }
  ]);
  assert.equal(rows[0].product_id, null);
  assert.equal(rows[0].match_method, null);
});

test('an unmatched row is left unmatched, never attributed to a guess', () => {
  const { rows } = parsePosCsv(BASIC);
  const result = matchProducts(rows, []);
  assert.equal(result.matched, 0);
  assert.equal(result.unmatched, 2);
  assert.ok(rows.every(row => row.product_id === null));
});
