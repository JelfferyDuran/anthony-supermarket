import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('index.html', 'utf8');
const inlineScripts = Array.from(html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi), match => match[1]);

assert.ok(inlineScripts.length, 'Storefront must contain inline application code');
for (const code of inlineScripts) new Function(code);

assert.doesNotMatch(html, /pricing-frame|src="pricing-hub\/index\.html"|href="#pricing"|goToPricing\s*\(/,
  'Internal Pricing Hub must not be exposed from the public storefront');
assert.match(html, /data-brand translate="no">Anthony(?:&#x27;|')s/,
  'Official Anthony brand lockups must be outside translation');
assert.match(html, /\[data-en\]:not\(\[data-brand\]\)/,
  'Language switching must exclude brand-bound elements');
assert.match(html, /\.dept-card\[data-dept\][\s\S]*keydown[\s\S]*event\.key==="Enter"[\s\S]*event\.key===" "/,
  'Department cards must support Enter and Space');
assert.match(html, /\/api\/traffic/);
assert.match(html, /navigator\.globalPrivacyControl===true/,
  'Traffic signal must honor Global Privacy Control');
assert.match(html, /language:cl/,
  'Traffic signal must report the storefront language selected by the customer');
assert.match(html, /var itemName=t\(item\.en\|\|item\.nombre,item\.es/,
  'Curated generic product translations must remain available in Spanish mode');
assert.doesNotMatch(html, /class="item-name" translate="no"/,
  'Generic product names must not be frozen in English');
assert.doesNotMatch(html, /Prices from the live Pricing Hub|Precios del Pricing Hub en vivo/);
assert.doesNotMatch(html, /Inventory Cost|Costo Inventario|Projected Profit|Ganancia Proyectada/,
  'Wholesale costs and profit projections must not appear on the public storefront');
assert.doesNotMatch(html, /invCost|profit:c|retail:r/,
  'Public JavaScript must not compute misleading internal accounting values');

console.log('Storefront syntax, internal-tool boundary, brand i18n, keyboard, and traffic guards passed.');
