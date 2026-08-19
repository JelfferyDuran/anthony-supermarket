#!/usr/bin/env node
'use strict';

// Applies the pricing migrations to a throwaway PostgreSQL cluster and runs
// supabase/tests/pricing_pipeline_test.sql against it.
//
// This exists because the pricing pipeline's real guarantees — deny-by-default
// RLS, SHA-256 upload idempotency, immutable price history, the $0.01
// reconciliation tolerance, and the all-or-nothing approval transaction — live
// in SQL, not in JavaScript. Checking them by reading the migration is not the
// same as running it.
//
// Exits 0 when every assertion holds, 2 when PostgreSQL is unavailable (a skip,
// not a failure), and 1 on any assertion failure.

const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const MIGRATION_DIR = path.join(REPO_ROOT, 'supabase', 'migrations');
const TEST_DIR = path.join(REPO_ROOT, 'supabase', 'tests');
const MIGRATIONS = [
  '20260812013000_add_invoice_pricing_pipeline.sql',
  '20260819213000_reconcile_pricing_hub_dataset.sql',
  '20260819230000_add_pos_sales_and_financials.sql',
  '20260819234500_add_intake_channel_provenance.sql'
];

// Each entry is a negative case: the substring that must appear in psql output
// for the corresponding guard to count as proven.
const REQUIRED_GUARDS = [
  ['RERUN OK', 'migrations are re-runnable'],
  ['duplicate key value violates unique constraint "pricing_invoices_source_sha256_key"', 'SHA-256 upload idempotency'],
  ['is below unit cost', 'retail cannot be set below cost'],
  ['is not sold and cannot carry a retail price', 'internal items cannot be priced'],
  ['pricing_price_history rows are immutable', 'price history is immutable'],
  ['an approver is required', 'approval requires an approver'],
  ['fuzzy matches cannot approve', 'unmatched lines cannot be approved'],
  ['exceeds the $0.01 tolerance', 'reconciliation tolerance enforced'],
  ['"status": "imported"', 'clean approval commits'],
  ['"already_imported": true', 'approval is idempotent'],
  ['duplicate key value violates unique constraint "pricing_products_hub_item_id_key"', 'hub item ids stay unique'],
  // Phase C: POS import and financial reporting.
  ['duplicate key value violates unique constraint "pos_import_batches_source_sha256_key"', 'POS batch idempotency'],
  ['violates check constraint "pos_sales_match_method"', 'POS match method stays auditable'],
  ['violates check constraint "pricing_invoice_chat_sender_recorded"', 'a chat scan must record which sender it came from'],
  ['violates check constraint "pricing_invoice_source_channel"', 'unknown intake channels are refused']
];

// Financial figures asserted against hand-computed values. Each entry is a
// regex the psql output must contain.
const REQUIRED_FIGURES = [
  [/aug5_expect_2\s*\|\s*aug15_expect_3[\s\S]*?2\.0000\s*\|\s*3\.0000/, 'cost_at resolves the cost in effect on the sale date'],
  [/INV-AUG\s*\|\s*2026-07-20\s*\|\s*2026-08-10\s*\|\s*600\.00\s*\|\s*9\s*\|\s*overdue_8_14/, 'NET21 aging buckets an invoice 9 days late'],
  [/Tea\/Coffee\s*\|\s*20\.000\s*\|\s*119\.80\s*\|\s*50\.0+\s*\|\s*69\.80+/, 'COGS valued per-date: 10x$2.00 + 10x$3.00 = $50.00'],
  [/"gross_sales": 129\.80/, 'P&L gross sales excludes the void'],
  [/"cost_of_goods": 50\.0+/, 'P&L cost of goods'],
  [/"gross_profit": 79\.80*/, 'P&L gross profit'],
  [/"costed_revenue_share": 92\.30/, 'P&L reports what share of revenue has a known cost'],
  [/"vendor_spend": 0,/, 'P&L scopes vendor spend to the period (August = $0, both invoices are July)'],
  [/"vendor_spend": 1000\.00/, 'P&L vendor spend over the full range'],
  [/"invoice_count": 2/, 'P&L invoice count over the full range'],
  [/void_rows_retained\s*[\s\S]*?\n\s*1/, 'voids are retained rather than deleted']
];

function findPgBin(name) {
  const direct = spawnSync('which', [name], { encoding: 'utf8' });
  if (direct.status === 0) return direct.stdout.trim();
  const versions = ['17', '16', '15', '14'];
  for (const version of versions) {
    const candidate = `/usr/lib/postgresql/${version}/bin/${name}`;
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

const initdb = findPgBin('initdb');
const pgCtl = findPgBin('pg_ctl');
const psql = findPgBin('psql');
if (!initdb || !pgCtl || !psql) {
  console.log('SKIP | PostgreSQL binaries not found; migration behavior test not run.');
  process.exit(2);
}

// initdb refuses to run as root. When this runs as root (containers, CI images)
// fall back to an unprivileged account that can own the data directory.
const runningAsRoot = typeof process.getuid === 'function' && process.getuid() === 0;
let ownerUser = null;
if (runningAsRoot) {
  for (const candidate of ['postgres', 'nobody']) {
    if (spawnSync('id', ['-u', candidate]).status === 0) { ownerUser = candidate; break; }
  }
  if (!ownerUser) {
    console.log('SKIP | running as root with no unprivileged account to own the cluster.');
    process.exit(2);
  }
}

const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pricing-pg-'));
const dataDir = path.join(workDir, 'data');
const sockDir = path.join(workDir, 'run');
const port = '55432';
fs.mkdirSync(dataDir);
fs.mkdirSync(sockDir);

function run(command, { allowFailure = false } = {}) {
  const argv = ownerUser ? ['su', ownerUser, '-c', command] : ['sh', '-c', command];
  const result = spawnSync(argv[0], argv.slice(1), { encoding: 'utf8' });
  const output = `${result.stdout || ''}${result.stderr || ''}`;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`command failed: ${command}\n${output}`);
  }
  return output;
}

function psqlFile(file, extra = '', database = 'postgres') {
  return run(`${psql} -h ${sockDir} -p ${port} -U postgres -d ${database} -q ${extra} -f ${file}`, { allowFailure: true });
}

function createDatabase(name) {
  run(`${psql} -h ${sockDir} -p ${port} -U postgres -q -c "create database ${name}"`);
}

let started = false;
try {
  if (ownerUser) {
    execFileSync('chown', ['-R', ownerUser, workDir]);
    // The test SQL \i-includes a migration, so the owner account must be able to
    // traverse into the repo checkout.
    execFileSync('chmod', ['755', workDir]);
  }
  fs.chmodSync(dataDir, 0o700);

  run(`${initdb} -D ${dataDir} -U postgres --auth=trust`);
  run(`${pgCtl} -D ${dataDir} -o "-k ${sockDir} -p ${port} -c listen_addresses=" -l ${workDir}/pg.log start`);
  started = true;

  let output = '';
  output += psqlFile(path.join(TEST_DIR, 'local_harness.sql'));
  for (const migration of MIGRATIONS) {
    output += psqlFile(path.join(MIGRATION_DIR, migration));
  }
  if (/^psql:.*ERROR/m.test(output)) {
    console.error(output);
    console.error('FAIL | migrations did not apply cleanly.');
    process.exit(1);
  }
  console.log('PASS | both pricing migrations apply to a clean database');

  output = psqlFile(path.join(TEST_DIR, 'pricing_pipeline_test.sql'), `-v migration_dir=${MIGRATION_DIR}`);
  // The financials suite asserts exact totals, so it gets a clean database of
  // its own: fixtures from the pipeline suite would otherwise be counted into
  // vendor spend and quietly change every figure.
  createDatabase('financials');
  psqlFile(path.join(TEST_DIR, 'local_harness.sql'), '', 'financials');
  for (const migration of MIGRATIONS) {
    psqlFile(path.join(MIGRATION_DIR, migration), '', 'financials');
  }
  output += psqlFile(path.join(TEST_DIR, 'financials_test.sql'), '', 'financials');

  let failures = 0;
  for (const [needle, label] of REQUIRED_GUARDS) {
    const ok = output.includes(needle);
    console.log(`${ok ? 'PASS' : 'FAIL'} | ${label}`);
    if (!ok) failures++;
  }

  // A paid invoice must not appear in the aging report at all.
  const agingBlock = (output.match(/--- 4\. NET21 aging[\s\S]*?--- 5\./) || [''])[0];
  const paidExcluded = agingBlock.length > 0 && !agingBlock.includes('INV-JUL');
  console.log(`${paidExcluded ? 'PASS' : 'FAIL'} | paid invoices are excluded from aging`);
  if (!paidExcluded) failures++;

  for (const [pattern, label] of REQUIRED_FIGURES) {
    const ok = pattern.test(output);
    console.log(`${ok ? 'PASS' : 'FAIL'} | ${label}`);
    if (!ok) failures++;
  }

  // RLS posture is asserted structurally rather than by error text.
  const rlsDisabled = /pricing_\w+\s*\|\s*f/.test(output);
  console.log(`${rlsDisabled ? 'FAIL' : 'PASS'} | RLS enabled on every pricing table`);
  if (rlsDisabled) failures++;

  const grantLine = output.match(/anon_or_authenticated_grants[\s\S]*?\n\s*(\d+)/);
  const noGrants = grantLine && grantLine[1] === '0';
  console.log(`${noGrants ? 'PASS' : 'FAIL'} | no anon/authenticated grants on pricing tables`);
  if (!noGrants) failures++;

  if (failures) {
    console.error(output);
    console.log(`${failures} CHECKS FAILED`);
    process.exit(1);
  }
  console.log('ALL MIGRATION CHECKS PASSED');
} finally {
  if (started) run(`${pgCtl} -D ${dataDir} -m immediate stop`, { allowFailure: true });
  fs.rmSync(workDir, { recursive: true, force: true });
}
