'use strict';

// NRS Gmail report -> Supabase POS importer.
//
// Reads the daily Sales_History CSVs grabbed from Gmail (nrs_sales_YYYY-MM-DD.csv
// in ../nrs/inbox/), parses each with the shared pos-import.js parser, dedupes
// by source sha256 against pos_import_batches, then inserts one pos_import_batches
// row + its pos_sales rows. Rows are tied to pricing_products via matchProducts
// (UPC = evidence, name = convenience, recorded in match_method).
//
// Usage:
//   node pos-db-import.js            # import all nrs_sales_*.csv not yet imported
//   node pos-db-import.js --dry-run  # parse + report without writing
//
// Env: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (server/.env)

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { parsePosCsv, matchProducts, sha256 } = require('./pos-import.js');

const INBOX = path.join(__dirname, '..', 'nrs', 'inbox');
const DRY = process.argv.includes('--dry-run');
const BACKFILL = process.argv.includes('--backfill-upc');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (load server/.env)');
  process.exit(1);
}

const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

function unwrap(result, action) {
  if (result.error) throw new Error(`${action} failed: ${result.error.message}`);
  return result.data;
}

// date from filename nrs_sales_2026-08-18.csv
function dateFromFilename(name) {
  const m = /nrs_sales_(\d{4}-\d{2}-\d{2})\.csv/.exec(name);
  return m ? m[1] : null;
}

// The email report header is UPC,Name,"Total Qty","Total Amount". The shared
// parser resolves aliases in order and 'total' would match "Total Qty" first —
// so rename the columns so qty lands on qty, amount lands on amount, and the
// product-name column lands on an alias the parser recognizes ('name' is NOT
// in the parser's item aliases; without this rename, the UPC column becomes
// the item name and every product match fails).
function fixHeader(text) {
  const lines = text.split(/\r?\n/);
  if (!lines.length) return text;
  lines[0] = lines[0]
    .replace(/"Total Qty"/gi, '"Qty"')
    .replace(/"Total Amount"/gi, '"Amount"')
    .replace(/\bName\b/g, 'Item');
  return lines.join('\n');
}

const STOP = new Set(['THE','AND','IN','OF','FOR','WITH','X','PK','CT','OZ','LB','16OZ','18CT','1GAL','24','12','48','20','10','8','15','14','6']);

function tokens(name) {
  return String(name || '').toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/)
    .filter(t => t.length >= 3 && !STOP.has(t));
}

// POS names are short ("VAN CAMPS TUNA") vs hub names long ("Van Camps
// Yellowfin Tuna in Oil 48/5oz"). Match when EVERY significant POS token
// appears in the hub name — POS is the short side, so all-tokens-must-hit
// is strict enough to avoid false positives (Goya BUTTER Beans must NOT
// match Goya LENTIL Beans; they differ on a required token).
function fuzzyMatchSales(name, products) {
  const pt = tokens(name);
  if (!pt.length) return null;
  let best = null, bestScore = 0;
  for (const p of products) {
    const ht = new Set(tokens(p.name));
    if (pt.every(t => ht.has(t)) && pt.length > bestScore) { bestScore = pt.length; best = p; }
  }
  return best;
}

async function main() {
  const files = fs.readdirSync(INBOX).filter(f => /^nrs_sales_\d{4}-\d{2}-\d{2}\.csv$/.test(f)).sort();
  if (!files.length) {
    console.log('No nrs_sales_*.csv files in', INBOX);
    return;
  }
  console.log(`📦 ${files.length} daily sales files found`);

  // Existing hashes (dedupe)
  const { data: existing } = await client.from('pos_import_batches').select('source_sha256');
  const seen = new Set((existing || []).map(r => r.source_sha256));

  // Products for matching
  const products = unwrap(await client.from('pricing_products').select('id, name, upc'), 'load products');

  let batches = 0, rowsTotal = 0, grossTotal = 0, skippedFiles = 0, matchedTotal = 0, upcBackfilled = 0;
  for (const fname of files) {
    const rawText = fs.readFileSync(path.join(INBOX, fname), 'utf8');
    const text = fixHeader(rawText);
    const hash = sha256(Buffer.from(rawText));
    if (seen.has(hash)) {
      console.log(`  = ${fname} already imported (${hash.slice(0, 10)}…)`);
      skippedFiles++;
      continue;
    }
    const fallbackDate = dateFromFilename(fname);
    let parsed;
    try {
      parsed = parsePosCsv(text, { fallbackDate });
    } catch (err) {
      console.error(`  ✗ ${fname}: ${err.message}`);
      continue;
    }
    const { rows, summary } = parsed;
    matchProducts(rows, products);
    // fuzzy fallback for unmatched rows
    for (const row of rows) {
      if (!row.product_id) {
        const fuzzy = fuzzyMatchSales(row.item_name, products);
        if (fuzzy) { row.product_id = fuzzy.id; row.match_method = 'name'; }
      }
    }
    // UPC backfill: sales rows carry UPCs the hub lacks. Store on the product
    // so future imports match by UPC (evidence), not just name.
    const backfilledIds = new Set();
    if (BACKFILL) {
      for (const row of rows) {
        if (row.product_id && row.upc && !backfilledIds.has(row.product_id)) {
          const prod = products.find(p => p.id === row.product_id);
          if (prod && !prod.upc) {
            const res = await client.from('pricing_products')
              .update({ upc: row.upc }).eq('id', prod.id);
            if (!res.error) { prod.upc = row.upc; upcBackfilled++; backfilledIds.add(row.product_id); }
          }
        }
      }
    }
    const matched = rows.filter(r => r.product_id).length;
    if (DRY) {
      console.log(`  ▶ ${fname}: ${summary.imported_count} rows, $${summary.gross_sales.toFixed(2)} gross, ${matched} matched`);
      continue;
    }
    const batch = unwrap(await client.from('pos_import_batches').insert({
      filename: fname,
      source_sha256: hash,
      period_start: summary.period_start,
      period_end: summary.period_end,
      row_count: summary.row_count,
      imported_count: summary.imported_count,
      gross_sales: summary.gross_sales,
      void_total: summary.void_total,
      refund_total: summary.refund_total
    }).select().single(), `insert batch ${fname}`);
    // chunk inserts (rows can be 1000+)
    for (let i = 0; i < rows.length; i += 500) {
      const chunk = rows.slice(i, i + 500).map(r => ({ ...r, batch_id: batch.id }));
      unwrap(await client.from('pos_sales').insert(chunk), `insert pos_sales ${fname}`);
    }
    batches++;
    rowsTotal += rows.length;
    grossTotal += summary.gross_sales;
    matchedTotal += matched;
    console.log(`  ✓ ${fname}: ${rows.length} rows, $${summary.gross_sales.toFixed(2)} gross, ${matched} product-matched`);
  }

  console.log(`\n✅ ${DRY ? 'DRY RUN' : 'imported'}: ${batches} batches, ${rowsTotal} sales rows, $${grossTotal.toFixed(2)} gross, ${matchedTotal} product-matched (${skippedFiles} already-imported skipped${BACKFILL ? `, ${upcBackfilled} UPCs backfilled` : ''})`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
