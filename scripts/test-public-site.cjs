'use strict';

// Guard for the public Vercel output built by scripts/build-public-site.js.
// Fails if the deploy could publish repo internals or cost data again, or if a
// published page references a file the allowlist leaves out.
// Run with: node --test scripts/test-public-site.cjs

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { build } = require('./build-public-site');

const ROOT = path.resolve(__dirname, '..');
const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'public-site-'));
const { published } = build(outDir);
test.after(() => fs.rmSync(outDir, { recursive: true, force: true }));

test('vercel.json publishes the allowlisted build, never the repo root', () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8'));
  assert.equal(cfg.outputDirectory, 'public-build');
  assert.match(cfg.buildCommand || '', /node scripts\/build-public-site\.js/);
  // Without a rewrite Vercel routes only ONE segment after /api/pricing to a
  // function: /invoices/:id/approve, /products/:id/history and friends 404.
  // The rewrite must carry the full path to a function that exists and is
  // configured (today api/pricing-fn.js, which restores it from __path).
  const rewrite = (cfg.rewrites || []).find(r => r.source === '/api/pricing/:path*');
  assert.ok(rewrite, 'the /api/pricing/:path* rewrite must stay configured');
  const target = rewrite.destination.split('?')[0].replace(/^\//, '') + '.js';
  assert.ok(fs.existsSync(path.join(ROOT, target)), `rewrite target ${target} must exist`);
  assert.ok(cfg.functions && cfg.functions[target], `rewrite target ${target} must stay configured`);
  assert.ok(rewrite.destination.includes(':path*') || target === 'api/pricing/[...path].js',
    'the rewrite must pass the full /api/pricing path on');
});

test('the build refuses to clean the repository itself', () => {
  assert.throws(() => build(ROOT), /refusing to build/);
  assert.throws(() => build(path.dirname(ROOT)), /refusing to build/);
});

test('the Pricing Hub client and the public pages ship', () => {
  const required = [
    'index.html', 'links.html', 'privacy.html', 'terms.html', 'sales.html', 'data/sale.json',
    'pricing-hub/index.html', 'pricing-hub/game.css',
    'pricing-hub/js/api.js', 'pricing-hub/js/boot.js', 'pricing-hub/js/hud.js',
    'pricing-hub/js/world.js', 'pricing-hub/js/zones.js', 'pricing-hub/js/game.js',
  ];
  for (const rel of required) assert.ok(published.includes(rel), `${rel} must be published`);
});

test('no repo internals, records or data files are published', () => {
  const internalDir = /^(server|api|invoices|nrs|docs|brain|supabase|apps|scripts|docker|node_modules|\.github|\.git)\//;
  const internalFile = /(^|\/)(\.env[^/]*|package(-lock)?\.json|vercel\.json|[^/]*\.(md|csv|tsv|sql|py|zip|jsonl|log))$/i;
  const records = /manual-intake|-items\.(csv|json)$/i;
  const leaks = published.filter(rel => internalDir.test(rel) || internalFile.test(rel) || records.test(rel));
  assert.deepEqual(leaks, []);
  assert.deepEqual(published.filter(rel => rel.endsWith('.json')), ['data/sale.json'], 'the only published JSON is the promo feed');
});

test('the published promo feed carries no cost fields', () => {
  const body = fs.readFileSync(path.join(outDir, 'data', 'sale.json'), 'utf8');
  assert.doesNotMatch(body, /"(cost|unitCost|costPerUnit|caseCost|boxPrice|markupPct|margin|customer_no)"\s*:/i);
});

// Local references a published page needs at runtime. External URLs, anchors,
// templated values and /api/* (served by the function, not static) are skipped.
function localRefs(rel, text) {
  const refs = [];
  const add = value => {
    const v = value.trim().split('#')[0].split('?')[0];
    if (!v || /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(v) || /[${}]/.test(v) || v.startsWith('/api/')) return;
    refs.push(v);
  };
  if (rel.endsWith('.html')) {
    for (const m of text.matchAll(/\s(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)) add(m[1]);
    for (const m of text.matchAll(/fetch\(\s*["'`]([^"'`]+)["'`]/g)) add(m[1]);
  }
  if (rel.endsWith('.js')) {
    for (const m of text.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s*)["'](\.{1,2}\/[^"']+)["']/gm)) add(m[1]);
  }
  if (rel.endsWith('.css') || rel.endsWith('.html')) {
    for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) add(m[1]);
  }
  return refs;
}

test('every local reference in published HTML, JS and CSS resolves', () => {
  const missing = [];
  for (const rel of published.filter(f => /\.(html|js|css)$/.test(f))) {
    const text = fs.readFileSync(path.join(outDir, rel), 'utf8');
    for (const ref of localRefs(rel, text)) {
      const base = ref.startsWith('/') ? outDir : path.join(outDir, path.dirname(rel));
      let target = path.join(base, ref);
      if (ref.endsWith('/')) target = path.join(target, 'index.html');
      if (!fs.existsSync(target)) missing.push(`${rel} -> ${ref}`);
    }
  }
  assert.deepEqual(missing, []);
});
