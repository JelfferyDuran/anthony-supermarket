import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const edge = readFileSync('supabase/functions/superkitchen/index.ts', 'utf8');
const migration = readFileSync('supabase/migrations/20260810013000_add_privacy_safe_site_traffic.sql', 'utf8');
const adminSource = readFileSync('apps/superkitchen/src/admin/AdminApp.jsx', 'utf8');
const pricing = readFileSync('supabase/functions/_shared/invoicePricing.ts', 'utf8');

for (const handler of ['handleAdminOverview', 'handleAdminAudit', 'handlePricingPreview', 'handleAdminInsights']) {
  const start = edge.indexOf(`async function ${handler}`);
  assert.notEqual(start, -1, `${handler} must exist`);
  const opening = edge.slice(start, start + 260);
  assert.match(opening, /requireManager\(req\)/, `${handler} must require manager/admin authorization`);
}

assert.match(migration, /alter table public\.site_traffic_events enable row level security/i);
assert.match(migration, /revoke all on table public\.site_traffic_events from anon, authenticated/i);
const trafficColumns = migration.match(/create table if not exists public\.site_traffic_events\s*\(([\s\S]*?)\);/i)?.[1] || '';
assert.ok(trafficColumns, 'Traffic table definition must be present');
assert.doesNotMatch(trafficColumns, /\b(name|email|phone|telefono|address|direccion|notes|notas|telegram|ip_address|user_agent)\b/i,
  'Traffic schema must stay free of customer PII and raw network identifiers');
assert.doesNotMatch(adminSource, /SUPABASE_SERVICE_ROLE_KEY|sb_secret_|service_role/,
  'Admin browser source must not contain elevated credentials');
assert.match(adminSource, /translate="no"/,
  'Brand identifiers must be explicitly excluded from translation');
assert.doesNotMatch(edge, /\bsalesToday\b|\baverageTicket\b/,
  'Unpaid order value must not be labeled as settled sales or tickets');
assert.match(edge, /orderValueToday/);
assert.match(edge, /averageOrder/);
assert.match(edge, /timeZone:\s*"America\/New_York"/,
  'Traffic hours must be aggregated in the store timezone');
assert.match(pricing, /case quantity × case cost does not match line amount/,
  'Invoice line math must reconcile before pricing');
assert.match(pricing, /Invoice total does not match the sum of reviewed line amounts/,
  'Invoice total must reconcile before pricing');
assert.match(pricing, /status:\s*noCharge \? "no_charge" : "review_required"/,
  'Pricing output must remain blocked for no-charge samples and require human approval otherwise');

console.log('Admin authorization, traffic privacy, credential, and brand-translation guardrails passed.');
