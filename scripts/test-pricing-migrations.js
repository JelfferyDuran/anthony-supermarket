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
  '20260819213000_reconcile_pricing_hub_dataset.sql'
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
  ['duplicate key value violates unique constraint "pricing_products_hub_item_id_key"', 'hub item ids stay unique']
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

function psqlFile(file, extra = '') {
  return run(`${psql} -h ${sockDir} -p ${port} -U postgres -q ${extra} -f ${file}`, { allowFailure: true });
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

  let failures = 0;
  for (const [needle, label] of REQUIRED_GUARDS) {
    const ok = output.includes(needle);
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
