// Shared extractor for the Pricing Hub's embedded data arrays.
//
// The hub is a single self-contained HTML file whose <script> block declares
// `const VENDORS = {...}` and `const ALL_ITEMS = [...]`. Several consumers read
// those arrays without a browser:
//   - scripts/verify-pricing-hub.js  (data verification)
//   - scripts/seed-pricing-from-hub.js (Supabase seed)
//   - the Kingdom OS collector (external, Hermes-owned — parses the same file)
//
// Extraction is deliberately literal-only: it slices out the two declarations by
// brace matching and evaluates just those, so UI/runtime code in the same script
// block can change freely without breaking the mirror contract.
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const HUB_APP_PATH = path.join(REPO_ROOT, 'apps', 'pricing-hub', 'index.html');
const HUB_SITE_PATH = path.join(REPO_ROOT, 'pricing-hub', 'index.html');

// Walks forward from the opening bracket and returns the index just past its
// match, skipping brackets that appear inside strings, template literals or
// comments so item names like `7" Pan 500ct` or '// note' cannot break the scan.
function findDeclarationEnd(source, openIndex) {
  const open = source[openIndex];
  const close = open === '{' ? '}' : ']';
  let depth = 0;
  for (let i = openIndex; i < source.length; i++) {
    const ch = source[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      i++;
      while (i < source.length && source[i] !== quote) {
        if (source[i] === '\\') i++;
        i++;
      }
      continue;
    }
    if (ch === '/' && source[i + 1] === '/') {
      while (i < source.length && source[i] !== '\n') i++;
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      i = source.indexOf('*/', i + 2);
      if (i === -1) break;
      i++;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  throw new Error(`unterminated ${open}${close} literal starting at index ${openIndex}`);
}

function extractDeclaration(source, name, openChar) {
  const marker = new RegExp(`const\\s+${name}\\s*=\\s*\\${openChar}`);
  const match = marker.exec(source);
  if (!match) throw new Error(`hub file is missing a "const ${name} = ${openChar}" declaration`);
  const openIndex = match.index + match[0].length - 1;
  return source.slice(openIndex, findDeclarationEnd(source, openIndex));
}

// Returns { VENDORS, ALL_ITEMS } read straight out of the hub HTML.
function readHubData(hubPath = HUB_APP_PATH) {
  const html = fs.readFileSync(hubPath, 'utf8');
  const vendors = extractDeclaration(html, 'VENDORS', '{');
  const items = extractDeclaration(html, 'ALL_ITEMS', '[');
  const context = vm.createContext(Object.create(null));
  return vm.runInContext(`({ VENDORS: ${vendors}, ALL_ITEMS: ${items} })`, context, {
    filename: hubPath,
    timeout: 5000
  });
}

// Extracts and evaluates the hub's own pricing functions so verification tests
// the code that actually ships, rather than a copy of it that can drift.
// The block is delimited by the PRICING MATH / VARIANCE banner comments.
function readHubMath(hubPath = HUB_APP_PATH, { markup = 65, serverProducts = new Map(), customRetail = {} } = {}) {
  const html = fs.readFileSync(hubPath, 'utf8');
  const start = html.indexOf('// ════════ PRICING MATH ════════');
  const end = html.indexOf('// ════════ VARIANCE ════════');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('hub file is missing its PRICING MATH section banners');
  }
  const source = html.slice(start, end);
  const context = vm.createContext({ customRetail, currentMarkup: markup, server: { products: serverProducts } });
  vm.runInContext(source, context, { filename: `${hubPath}#pricing-math`, timeout: 5000 });
  return vm.runInContext('({ roundRetail, calcRetail, costOf, calcBoxRev, calcBoxProfit, calcMargin, fmt })', context);
}

module.exports = { HUB_APP_PATH, HUB_SITE_PATH, REPO_ROOT, readHubData, readHubMath };
