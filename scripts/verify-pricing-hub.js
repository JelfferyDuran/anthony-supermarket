const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { loadPricingHubSeed } = require('../server/pricing-hub-seed');

const repoRoot = path.resolve(__dirname, '..');
const hubPath = path.join(repoRoot, 'apps', 'pricing-hub', 'index.html');
const serverPath = path.join(repoRoot, 'server', 'pricing-hub-api.js');
const html = fs.readFileSync(hubPath, 'utf8');
const server = fs.readFileSync(serverPath, 'utf8');
const seed = loadPricingHubSeed(hubPath);

function expectContains(label, haystack, needle) {
  assert.ok(
    haystack.includes(needle),
    `${label} is missing required text: ${needle}`
  );
}

expectContains('pricing hub html', html, 'const VENDORS =');
expectContains('pricing hub html', html, 'const ALL_ITEMS =');
expectContains('pricing hub html', html, 'id="authPanel"');
expectContains('pricing hub html', html, 'id="arcadePanel"');
expectContains('pricing hub html', html, 'id="activityFeed"');
expectContains('pricing hub html', html, 'id="watchList"');
expectContains('pricing hub html', html, 'id="vendorFreshness"');
expectContains('pricing hub html', html, 'signInPricingHub');
expectContains('pricing hub html', html, 'claimMissionXp');
expectContains('pricing hub html', html, 'approveItem');
expectContains('pricing hub html', html, 'rejectItem');
expectContains('pricing hub html', html, 'drawSparkline');
expectContains('pricing hub html', html, 'prefers-reduced-motion');
expectContains('pricing hub html', html, 'canvas[data-spark]');

expectContains('pricing api', server, '/api/pricing/health');
expectContains('pricing api', server, '/api/pricing/login');
expectContains('pricing api', server, '/api/pricing/catalog');
expectContains('pricing api', server, '/api/pricing/review-queue');
expectContains('pricing api', server, '/api/pricing/audit');
expectContains('pricing api', server, '/api/pricing/margin-watch');
expectContains('pricing api', server, '/api/pricing/import/csv');
expectContains('pricing api', server, '/api/pricing/invoices');

assert.ok(Array.isArray(seed.items), 'embedded items must parse as an array');
assert.ok(seed.items.length > 0, 'embedded catalog must not be empty');
assert.ok(seed.vendors && Object.keys(seed.vendors).length > 0, 'embedded vendors must not be empty');

console.log(`Verified pricing hub contract: ${seed.items.length} items across ${Object.keys(seed.vendors).length} vendors`);
