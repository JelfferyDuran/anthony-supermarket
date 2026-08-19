#!/usr/bin/env node
'use strict';

// Reconciles the LIVE Pricing Hub dataset into the Supabase pricing schema.
//
// The hub is still the system of record today: 157 items / 3 vendors / 9
// invoices live as JS arrays inside apps/pricing-hub/index.html, and the Kingdom
// OS collector parses that same file. This script reads those arrays and derives
// the equivalent database rows so Supabase can take over as the source of truth
// without a hand-typed re-entry of the whole catalog.
//
// Modes:
//   (default)  write a reviewable SQL seed to supabase/seed/pricing_hub_seed.sql
//   --check    regenerate in memory and fail if the committed seed is stale
//   --apply    upsert straight into Supabase using the server-side service role
//
// SQL-by-default is deliberate. A catalog seed is a data migration; it should be
// readable in a diff and runnable against a scratch database before it is
// pointed at production.
//
// Identity is derived, not random: every vendor, invoice, and product id is a
// UUIDv5 of a stable natural key, so re-running produces byte-identical output
// and re-seeding updates rows instead of duplicating them.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { HUB_APP_PATH, REPO_ROOT, readHubData } = require('./lib/hub-data');
const { RETAIL_MULTIPLIER, roundCost, roundMoney, suggestedRetail } = require('../server/pricing-engine');

const SEED_PATH = path.join(REPO_ROOT, 'supabase', 'seed', 'pricing_hub_seed.sql');

// Fixed namespace for this project's derived ids. Any UUID works as a namespace;
// what matters is that it never changes, or every id would shift.
const NAMESPACE = 'b8f1c0de-1f2a-4c3b-9d4e-5a6b7c8d9e0f';

// The hub writes an em dash when a vendor did not print an item number. It means
// "unknown", and must never be stored as if it were a real SKU.
const UNKNOWN = '—';

function uuidv5(name, namespace = NAMESPACE) {
  const namespaceBytes = Buffer.from(namespace.replace(/-/g, ''), 'hex');
  const hash = crypto.createHash('sha1').update(Buffer.concat([namespaceBytes, Buffer.from(name, 'utf8')])).digest();
  hash[6] = (hash[6] & 0x0f) | 0x50; // version 5
  hash[8] = (hash[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = hash.subarray(0, 16).toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function normalizeName(value) {
  return String(value).toLowerCase().replace(/\s+/g, ' ').trim();
}

function cleanSku(value) {
  const sku = String(value == null ? '' : value).trim();
  return !sku || sku === UNKNOWN ? null : sku;
}

// Invoice labels carry their date as "#90772340 — 8/19/26".
function invoiceDateFromLabel(label) {
  const match = /(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(String(label || ''));
  if (!match) return null;
  const [, month, day, rawYear] = match;
  const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function sqlText(value) {
  if (value == null) return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value) {
  if (value == null || value === '' || !Number.isFinite(Number(value))) return 'null';
  return String(Number(value));
}

function sqlIntArray(values) {
  if (!values || !values.length) return "'{}'";
  return `'{${values.map(Number).join(',')}}'`;
}

function sqlBool(value) {
  return value ? 'true' : 'false';
}

// Turns the hub arrays into the row sets the schema expects.
//
// The central reconciliation: ALL_ITEMS is an invoice-line LEDGER, not a product
// catalog. When the same vendor item number appears on two invoices it is one
// physical product bought twice — the second purchase is a price CHANGE, not a
// second product. Seeding those as separate products would fragment the catalog
// and leave the price-history timeline empty for exactly the items that have a
// history. So repeat purchases collapse into one product and their earlier
// occurrences are emitted as history rows.
//
// Rows whose vendor item number is unknown ('—') are never merged: without a SKU
// there is no evidence two lines are the same product, and guessing would be a
// silent catalog edit.
function buildSeed(hub) {
  const { VENDORS, ALL_ITEMS } = hub;
  const vendors = [];
  const invoices = [];
  const products = [];
  const vendorProducts = [];
  const lines = [];
  const history = [];
  const warnings = [];
  const notes = [];

  const vendorIdByName = new Map();
  for (const [name, meta] of Object.entries(VENDORS)) {
    const id = uuidv5(`vendor:${normalizeName(name)}`);
    vendorIdByName.set(name, id);
    vendors.push({ id, name, normalized_name: normalizeName(name), label: meta.label || name });
  }

  const invoiceIdByKey = new Map();
  const invoiceDateByKey = new Map();
  const linesByInvoice = new Map();
  for (const [vendorName, meta] of Object.entries(VENDORS)) {
    for (const [invoiceNumber, invoiceMeta] of Object.entries(meta.invoices || {})) {
      const key = `${vendorName}::${invoiceNumber}`;
      const id = uuidv5(`invoice:${normalizeName(vendorName)}:${invoiceNumber}`);
      const invoiceDate = invoiceDateFromLabel(invoiceMeta.label);
      invoiceIdByKey.set(key, id);
      invoiceDateByKey.set(key, invoiceDate);
      invoices.push({
        id,
        vendor_id: vendorIdByName.get(vendorName),
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        display_label: invoiceMeta.label || `#${invoiceNumber}`,
        // No scan exists for these; the hash keys the natural identity so a later
        // real upload of the same invoice collides instead of duplicating.
        source_sha256: crypto.createHash('sha256').update(`hub-seed:${normalizeName(vendorName)}:${invoiceNumber}`).digest('hex')
      });
      linesByInvoice.set(id, []);
    }
  }

  // ── Group hub rows into products ───────────────────────────────────────────
  const groups = new Map();
  for (const item of ALL_ITEMS) {
    if (!vendorIdByName.has(item.vendor)) {
      warnings.push(`item ${item.id} (${item.name}) references unregistered vendor "${item.vendor}"`);
      continue;
    }
    if (!invoiceIdByKey.has(`${item.vendor}::${item.invoice}`)) {
      warnings.push(`item ${item.id} (${item.name}) references unregistered invoice "${item.invoice}"`);
      continue;
    }
    const sku = cleanSku(item.itemNo);
    // Unknown item number => its own product, keyed by hub id.
    const key = sku ? `${item.vendor}::${sku}` : `hub-row::${item.id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  const sortKey = item => `${invoiceDateByKey.get(`${item.vendor}::${item.invoice}`) || '0000-00-00'}::${String(item.id).padStart(6, '0')}`;

  for (const [key, rawOccurrences] of groups) {
    const occurrences = [...rawOccurrences].sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : 1));

    // Refuse to merge when the pack size differs: the same item number against a
    // different unit count means the vendor changed the pack (or the transcription
    // is wrong). Either way a human decides, so they stay separate products.
    const packs = new Set(occurrences.map(item => Number(item.units)));
    let cohorts = [occurrences];
    if (packs.size > 1) {
      warnings.push(`${key} appears with ${packs.size} different pack sizes (${[...packs].join(', ')}); kept as separate products`);
      cohorts = occurrences.map(item => [item]);
    }

    for (const cohort of cohorts) {
      const current = cohort[cohort.length - 1];
      const productId = uuidv5(`product:hub:${current.id}`);

      if (cohort.length > 1) {
        const first = cohort[0];
        notes.push(`${current.name} (item #${cleanSku(current.itemNo)}) bought ${cohort.length}x — hub ids ${cohort.map(i => i.id).join(' → ')}`);
        if (Math.abs(costOf(first) - costOf(current)) > 0.0001) {
          notes.push(`  cost moved $${costOf(first).toFixed(4)} → $${costOf(current).toFixed(4)}`);
        }
      }

      products.push({
        id: productId,
        hub_item_id: current.id,
        hub_item_ids: cohort.map(item => item.id),
        name: current.name,
        category: current.cat,
        department: current.cat,
        units_per_case: Number(current.units) || null,
        current_unit_cost: costOf(current),
        current_retail_price: retailOf(current),
        internal: Boolean(current.internal),
        flagged: Boolean(current.flagged),
        flag_reason: current.flagged ? 'Flagged in the Pricing Hub for owner review' : null,
        source: 'hub-backfill'
      });

      const sku = cleanSku(current.itemNo);
      if (sku) {
        vendorProducts.push({
          vendor_id: vendorIdByName.get(current.vendor),
          vendor_sku: sku,
          product_id: productId,
          units_per_case: Number(current.units) || null,
          source_invoice_number: current.invoice
        });
      }

      // Every occurrence stays a line on its own invoice — the ledger is the
      // evidence and must not be collapsed.
      for (let index = 0; index < cohort.length; index++) {
        const item = cohort[index];
        const invoiceId = invoiceIdByKey.get(`${item.vendor}::${item.invoice}`);
        const bucket = linesByInvoice.get(invoiceId);
        bucket.push({
          invoice_id: invoiceId,
          line_number: bucket.length + 1,
          extracted_description: item.name,
          vendor_sku: cleanSku(item.itemNo),
          case_quantity: Number(item.boxes) || null,
          units_per_case: Number(item.units) || null,
          line_total: roundMoney(Number(item.boxes) * Number(item.boxPrice)),
          calculated_unit_cost: costOf(item),
          proposed_retail_price: retailOf(item),
          matched_product_id: productId,
          match_method: 'hub-backfill',
          review_status: 'backfilled'
        });

        // A repeat purchase is a price transition. Emit one immutable history row
        // per move so the hub's timeline is populated from real evidence.
        if (index > 0) {
          const previous = cohort[index - 1];
          history.push({
            source_key: `hub-backfill:${previous.id}->${item.id}`,
            product_id: productId,
            previous_unit_cost: costOf(previous),
            new_unit_cost: costOf(item),
            previous_retail_price: retailOf(previous),
            new_retail_price: retailOf(item) ?? 0,
            changed_at: invoiceDateByKey.get(`${item.vendor}::${item.invoice}`)
          });
        }
      }
    }
  }

  for (const invoice of invoices) {
    const bucket = linesByInvoice.get(invoice.id) || [];
    lines.push(...bucket);
    invoice.line_count = bucket.length;
    invoice.extracted_line_sum = roundMoney(bucket.reduce((sum, line) => sum + line.line_total, 0));
    invoice.invoice_subtotal = invoice.extracted_line_sum;
    invoice.reconciliation_variance = 0;
  }

  products.sort((a, b) => a.hub_item_id - b.hub_item_id);
  vendorProducts.sort((a, b) => (a.vendor_sku < b.vendor_sku ? -1 : 1));
  history.sort((a, b) => (a.source_key < b.source_key ? -1 : 1));

  return { vendors, invoices, products, vendorProducts, lines, history, warnings, notes };
}

// Cost per unit recomputed from the invoice figures. The hub stores this rounded
// to 3 decimals for display; the schema keeps 4, and the invoice arithmetic is
// the authority. Differences are reported, never more than a twentieth of a cent.
function costOf(item) {
  const totalUnits = Number(item.boxes) * Number(item.units);
  if (!totalUnits) return roundCost(item.costPerUnit);
  return roundCost((Number(item.boxes) * Number(item.boxPrice)) / totalUnits);
}

// Stored retail wins when the owner set one; otherwise fall back to the hub's own
// shelf suggestion. Internal supplies are never sold and carry no retail.
function retailOf(item) {
  if (item.internal) return null;
  return item.retail > 0 ? roundMoney(item.retail) : suggestedRetail(costOf(item));
}

function renderSql(seed) {
  const out = [];
  out.push('-- GENERATED FILE — do not edit by hand.');
  out.push('-- Regenerate with: node scripts/seed-pricing-from-hub.js');
  out.push('--');
  out.push('-- Backfills the Supabase pricing schema from the embedded Pricing Hub arrays');
  out.push('-- in apps/pricing-hub/index.html. Ids are UUIDv5 of stable natural keys, so');
  out.push('-- this file is idempotent: running it twice updates rows rather than');
  out.push('-- duplicating them.');
  out.push('--');
  out.push(`-- Source: ${seed.vendors.length} vendors · ${seed.invoices.length} invoices · ${seed.products.length} products · ${seed.lines.length} invoice lines · ${seed.history.length} price transitions`);
  if (seed.notes.length) {
    out.push('--');
    out.push('-- Repeat purchases collapsed into one product (the later invoice is current):');
    for (const note of seed.notes) out.push(`--   ${note}`);
  }
  out.push('');
  out.push('begin;');
  out.push('');

  out.push('-- ── Vendors ────────────────────────────────────────────────────────────────');
  for (const vendor of seed.vendors) {
    out.push(`insert into public.pricing_vendors (id, name, normalized_name) values (${sqlText(vendor.id)}, ${sqlText(vendor.name)}, ${sqlText(vendor.normalized_name)})`);
    out.push('  on conflict (id) do update set name = excluded.name, normalized_name = excluded.normalized_name, updated_at = now();');
  }
  out.push('');

  out.push('-- ── Products ───────────────────────────────────────────────────────────────');
  for (const product of seed.products) {
    out.push('insert into public.pricing_products (id, hub_item_id, hub_item_ids, name, category, department, units_per_case, current_unit_cost, current_retail_price, internal, flagged, flag_reason, source) values (');
    out.push(`  ${sqlText(product.id)}, ${sqlNumber(product.hub_item_id)}, ${sqlIntArray(product.hub_item_ids)}, ${sqlText(product.name)}, ${sqlText(product.category)}, ${sqlText(product.department)},`);
    out.push(`  ${sqlNumber(product.units_per_case)}, ${sqlNumber(product.current_unit_cost)}, ${sqlNumber(product.current_retail_price)}, ${sqlBool(product.internal)}, ${sqlBool(product.flagged)}, ${sqlText(product.flag_reason)}, ${sqlText(product.source)})`);
    out.push('  on conflict (id) do update set hub_item_id = excluded.hub_item_id, hub_item_ids = excluded.hub_item_ids, name = excluded.name, category = excluded.category,');
    out.push('    department = excluded.department, units_per_case = excluded.units_per_case, current_unit_cost = excluded.current_unit_cost,');
    out.push('    current_retail_price = excluded.current_retail_price, internal = excluded.internal, flagged = excluded.flagged,');
    out.push('    flag_reason = excluded.flag_reason, source = excluded.source, updated_at = now();');
  }
  out.push('');

  out.push('-- ── Invoices (backfilled: shelved before the approval flow existed) ────────');
  for (const invoice of seed.invoices) {
    out.push('insert into public.pricing_invoices (id, vendor_id, invoice_number, invoice_date, display_label, source_sha256, invoice_subtotal, extracted_line_sum, reconciliation_variance, line_count, status) values (');
    out.push(`  ${sqlText(invoice.id)}, ${sqlText(invoice.vendor_id)}, ${sqlText(invoice.invoice_number)}, ${invoice.invoice_date ? sqlText(invoice.invoice_date) : 'null'}, ${sqlText(invoice.display_label)},`);
    out.push(`  ${sqlText(invoice.source_sha256)}, ${sqlNumber(invoice.invoice_subtotal)}, ${sqlNumber(invoice.extracted_line_sum)}, ${sqlNumber(invoice.reconciliation_variance)}, ${sqlNumber(invoice.line_count)}, 'backfilled')`);
    out.push('  on conflict (id) do update set vendor_id = excluded.vendor_id, invoice_number = excluded.invoice_number, invoice_date = excluded.invoice_date,');
    out.push('    display_label = excluded.display_label, invoice_subtotal = excluded.invoice_subtotal, extracted_line_sum = excluded.extracted_line_sum,');
    out.push('    reconciliation_variance = excluded.reconciliation_variance, line_count = excluded.line_count, status = excluded.status;');
  }
  out.push('');

  out.push('-- ── Vendor SKU links (item numbers printed on the invoice) ─────────────────');
  for (const link of seed.vendorProducts) {
    out.push(`insert into public.pricing_vendor_products (vendor_id, vendor_sku, product_id, units_per_case, source_invoice_number) values (${sqlText(link.vendor_id)}, ${sqlText(link.vendor_sku)}, ${sqlText(link.product_id)}, ${sqlNumber(link.units_per_case)}, ${sqlText(link.source_invoice_number)})`);
    out.push('  on conflict (vendor_id, vendor_sku) do update set product_id = excluded.product_id, units_per_case = excluded.units_per_case, source_invoice_number = excluded.source_invoice_number;');
  }
  out.push('');

  out.push('-- ── Invoice lines ──────────────────────────────────────────────────────────');
  out.push('-- Replaced wholesale per invoice so a regenerated seed cannot leave orphans.');
  const invoiceIds = [...new Set(seed.lines.map(line => line.invoice_id))];
  for (const invoiceId of invoiceIds) {
    out.push(`delete from public.pricing_invoice_lines where invoice_id = ${sqlText(invoiceId)};`);
  }
  for (const line of seed.lines) {
    out.push('insert into public.pricing_invoice_lines (invoice_id, line_number, extracted_description, vendor_sku, case_quantity, units_per_case, line_total, calculated_unit_cost, proposed_retail_price, matched_product_id, match_method, review_status) values (');
    out.push(`  ${sqlText(line.invoice_id)}, ${sqlNumber(line.line_number)}, ${sqlText(line.extracted_description)}, ${sqlText(line.vendor_sku)}, ${sqlNumber(line.case_quantity)}, ${sqlNumber(line.units_per_case)},`);
    out.push(`  ${sqlNumber(line.line_total)}, ${sqlNumber(line.calculated_unit_cost)}, ${sqlNumber(line.proposed_retail_price)}, ${sqlText(line.matched_product_id)}, ${sqlText(line.match_method)}, 'backfilled');`);
  }
  out.push('');
  out.push('-- ── Price history derived from repeat purchases ────────────────────────────');
  out.push('-- One immutable row per observed cost/retail move. source_key makes the');
  out.push('-- backfill re-runnable without ever rewriting a history row.');
  for (const row of seed.history) {
    out.push('insert into public.pricing_price_history (source_key, product_id, previous_unit_cost, new_unit_cost, previous_retail_price, new_retail_price, retail_multiplier, changed_at) values (');
    out.push(`  ${sqlText(row.source_key)}, ${sqlText(row.product_id)}, ${sqlNumber(row.previous_unit_cost)}, ${sqlNumber(row.new_unit_cost)}, ${sqlNumber(row.previous_retail_price)}, ${sqlNumber(row.new_retail_price)},`);
    out.push(`  ${sqlNumber(RETAIL_MULTIPLIER)}, ${row.changed_at ? sqlText(row.changed_at) : 'now()'})`);
    out.push('  on conflict (source_key) where source_key is not null do nothing;');
  }
  out.push('');
  out.push('commit;');
  out.push('');
  return out.join('\n');
}

async function applyToSupabase(seed) {
  const { createPricingStore, isConfigured } = require('../server/pricing-store');
  if (!isConfigured()) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in the server environment to --apply');
  }
  const store = createPricingStore();
  const client = require('../server/pricing-store').getClient();

  const upsert = async (table, rows, onConflict) => {
    if (!rows.length) return;
    for (let i = 0; i < rows.length; i += 200) {
      const { error } = await client.from(table).upsert(rows.slice(i, i + 200), { onConflict });
      if (error) throw new Error(`${table} upsert failed: ${error.message}`);
    }
    console.log(`upserted ${rows.length} row(s) into ${table}`);
  };

  await upsert('pricing_vendors', seed.vendors.map(({ label, ...row }) => row), 'id');
  await upsert('pricing_products', seed.products, 'id');
  await upsert('pricing_invoices', seed.invoices.map(row => ({ ...row, status: 'backfilled' })), 'id');
  await upsert('pricing_vendor_products', seed.vendorProducts, 'vendor_id,vendor_sku');
  for (const invoiceId of [...new Set(seed.lines.map(l => l.invoice_id))]) {
    await store.replaceInvoiceLines(invoiceId, seed.lines.filter(l => l.invoice_id === invoiceId).map(({ invoice_id, ...row }) => row));
  }
  console.log(`upserted ${seed.lines.length} invoice line(s)`);
  if (seed.history.length) {
    const { error } = await client.from('pricing_price_history')
      .upsert(seed.history.map(row => ({ ...row, retail_multiplier: RETAIL_MULTIPLIER })), { onConflict: 'source_key', ignoreDuplicates: true });
    if (error) throw new Error(`pricing_price_history upsert failed: ${error.message}`);
    console.log(`upserted ${seed.history.length} price transition(s)`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const hub = readHubData(HUB_APP_PATH);
  const seed = buildSeed(hub);

  console.log(`Pricing Hub source : ${hub.ALL_ITEMS.length} hub rows · ${seed.vendors.length} vendors · ${seed.invoices.length} invoices`);
  console.log(`Reconciled         : ${seed.products.length} products · ${seed.lines.length} invoice lines · ${seed.history.length} price transitions`);
  for (const note of seed.notes) console.log(`NOTE | ${note}`);
  for (const warning of seed.warnings) console.warn(`WARN | ${warning}`);

  // Every hub row must survive as an invoice line. Products may legitimately be
  // fewer (repeat purchases collapse), but a dropped LINE means lost evidence.
  if (seed.lines.length !== hub.ALL_ITEMS.length) {
    console.error(`FAIL | ${hub.ALL_ITEMS.length - seed.lines.length} hub row(s) did not map to an invoice line; refusing to emit a partial seed.`);
    process.exit(1);
  }
  const mappedHubIds = new Set(seed.products.flatMap(product => product.hub_item_ids));
  const missing = hub.ALL_ITEMS.filter(item => !mappedHubIds.has(item.id));
  if (missing.length) {
    console.error(`FAIL | hub id(s) ${missing.map(i => i.id).join(', ')} are not reachable from any product.`);
    process.exit(1);
  }

  if (args.includes('--apply')) {
    await applyToSupabase(seed);
    console.log('SEED APPLIED');
    return;
  }

  const sql = renderSql(seed);
  if (args.includes('--check')) {
    const existing = fs.existsSync(SEED_PATH) ? fs.readFileSync(SEED_PATH, 'utf8') : '';
    if (existing !== sql) {
      console.error('FAIL | supabase/seed/pricing_hub_seed.sql is stale. Run: node scripts/seed-pricing-from-hub.js');
      process.exit(1);
    }
    console.log('PASS | committed seed matches the current hub data');
    return;
  }

  fs.mkdirSync(path.dirname(SEED_PATH), { recursive: true });
  fs.writeFileSync(SEED_PATH, sql);
  console.log(`Wrote ${path.relative(REPO_ROOT, SEED_PATH)} (${sql.split('\n').length} lines)`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
