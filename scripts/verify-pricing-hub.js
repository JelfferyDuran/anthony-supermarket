// Verification harness for apps/pricing-hub/index.html
// Extracts the real <script> block, stubs the DOM, runs it via new Function, asserts data.
const fs = require('fs');
const path = '/opt/data/anthony-supermarket/apps/pricing-hub/index.html';
const html = fs.readFileSync(path, 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.error('NO SCRIPT BLOCK FOUND'); process.exit(1); }

// --- DOM stubs (no-op element proxies) ---
function el() {
  const t = () => ({});
  return new Proxy({}, { get: (_, p) => {
    if (p === 'classList') return { add: t, remove: t, toggle: t };
    if (p === 'style') return { setProperty: t, display: '' };
    if (p === 'addEventListener') return t;
    if (p === 'innerHTML') return '';
    if (p === 'value') return '';
    if (p === 'textContent') return '';
    if (typeof p === 'symbol') return undefined;
    return t;
  }, set: () => true });
}
const doc = { getElementById: () => el() };
global.document = doc;
global.window = {};
global.FileReader = class { readAsDataURL() {} };
global.fetch = async () => ({ json: async () => ({ content: [] }) });
global.alert = () => {};

// --- run the app script and expose internals ---
const script = m[1].replace(/<\/script>/gi, '');
const app = new Function(script + `
  ;return { VENDORS, ALL_ITEMS, roundRetail, calcRetail, calcBoxRev, calcBoxProfit, calcMargin, currentMarkup };
`);
let ctx;
try {
  ctx = app();
} catch (e) {
  console.error('SCRIPT RUNTIME FAILED:', e.message);
  process.exit(1);
}
const { VENDORS, ALL_ITEMS, calcRetail, calcBoxRev, calcBoxProfit } = ctx;

// --- assertions ---
const pass = (cond, msg) => console.log((cond ? 'PASS' : 'FAIL') + ' | ' + msg);
let fails = 0;
const chk = (cond, msg) => { pass(cond, msg); if (!cond) fails++; };

chk(!!VENDORS["Hershey's Ice Cream"], "VENDORS has Hershey's Ice Cream");
chk(!!VENDORS["Hershey's Ice Cream"].invoices.INVE0023460478, 'VENDORS has invoice INVE0023460478');
chk(Array.isArray(ALL_ITEMS) && ALL_ITEMS.length === 105, 'ALL_ITEMS length = 105 (93 prior + 12 new; got ' + ALL_ITEMS.length + ')');

const hers = ALL_ITEMS.filter(i => i.vendor === "Hershey's Ice Cream");
chk(hers.length === 12, "Hershey's items = 12 (got " + hers.length + ')');
const cost = hers.reduce((s, i) => s + i.boxes * i.boxPrice, 0);
chk(Math.abs(cost - 234.42) < 0.001, 'Hershey\'s total cost = $234.42 (got $' + cost.toFixed(2) + ')');
const fee = hers.find(i => i.name === 'Delivery Fee');
chk(!!fee && fee.internal === true, 'Delivery Fee is internal (not for sale)');
chk(new Set(ALL_ITEMS.map(i => i.id)).size === ALL_ITEMS.length, 'All item ids unique');
chk(hers.every(i => i.invoice === 'INVE0023460478'), 'All items tagged with invoice #');

const exp = {
  158: { cpu: 4.83, retail: 7.99, units: 3 },
  159: { cpu: 4.83, retail: 7.99, units: 3 },
  165: { cpu: 2.2042, retail: 3.99, units: 24 },
  166: { cpu: 1.83, retail: 2.99, units: 12 },
  168: { cpu: 0.46, retail: 0.99, units: 48 },
  169: { cpu: 5.0, retail: 0, units: 1 },
};
for (const [id, e] of Object.entries(exp)) {
  const it = ALL_ITEMS.find(i => i.id === +id);
  chk(it && Math.abs(it.costPerUnit - e.cpu) < 0.0001, `id ${id} costPerUnit=${e.cpu} (got ${it && it.costPerUnit})`);
  chk(it && it.retail === e.retail, `id ${id} retail=${e.retail} (got ${it && it.retail})`);
  chk(it && it.units === e.units, `id ${id} units=${e.units} (got ${it && it.units})`);
}
// live hub math at default 65% markup
chk(calcRetail(ALL_ITEMS.find(i => i.id === 158)) === 7.99, 'calcRetail scround = 7.99');
chk(calcRetail(ALL_ITEMS.find(i => i.id === 165)) === 3.99, 'calcRetail twix = 3.99');

const sellable = hers.filter(i => !i.internal);
const totRev = sellable.reduce((s, i) => s + calcBoxRev(i), 0);
const totProfit = sellable.reduce((s, i) => s + calcBoxProfit(i), 0);
console.log('--- hub calc (65% markup default) ---');
console.log('Hershey\'s retail cost: $' + sellable.reduce((s, i) => s + i.boxes * i.boxPrice, 0).toFixed(2));
console.log('Projected revenue: $' + totRev.toFixed(2));
console.log('Projected profit:  $' + totProfit.toFixed(2));
console.log('Gross margin: ' + ((totProfit / totRev) * 100).toFixed(1) + '%');
console.log('ROI on invoice: ' + ((totProfit / cost) * 100).toFixed(0) + '%');

console.log(fails === 0 ? 'ALL CHECKS PASSED ✅' : fails + ' CHECKS FAILED ❌');
process.exit(fails === 0 ? 0 : 1);
