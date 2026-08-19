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
chk(!!VENDORS["Family Food Distributors"], "VENDORS has Family Food Distributors");
chk(!!VENDORS["Family Food Distributors"].invoices["90772340"] && !!VENDORS["Family Food Distributors"].invoices["90772444"] && !!VENDORS["Family Food Distributors"].invoices["90772312"], 'VENDORS has all 3 FFD invoices');
chk(Array.isArray(ALL_ITEMS) && ALL_ITEMS.length === 157, 'ALL_ITEMS length = 157 (105 prior + 52 new; got ' + ALL_ITEMS.length + ')');

const hers = ALL_ITEMS.filter(i => i.vendor === "Hershey's Ice Cream");
chk(hers.length === 12, "Hershey's items = 12 (got " + hers.length + ')');
const cost = hers.reduce((s, i) => s + i.boxes * i.boxPrice, 0);
chk(Math.abs(cost - 234.42) < 0.001, 'Hershey\'s total cost = $234.42 (got $' + cost.toFixed(2) + ')');
const fee = hers.find(i => i.name === 'Delivery Fee');
chk(!!fee && fee.internal === true, 'Delivery Fee is internal (not for sale)');
chk(new Set(ALL_ITEMS.map(i => i.id)).size === ALL_ITEMS.length, 'All item ids unique');
chk(hers.every(i => i.invoice === 'INVE0023460478'), 'All items tagged with invoice #');

// --- Family Food Distributors 8/19/26 bundle ---
const ffd = ALL_ITEMS.filter(i => i.vendor === "Family Food Distributors");
chk(ffd.length === 52, "Family Food items = 52 (got " + ffd.length + ')');
const ffdCost = ffd.reduce((s, i) => s + i.boxes * i.boxPrice, 0);
chk(Math.abs(ffdCost - 2594.94) < 0.001, 'Family Food total cost = $2,594.94 (got $' + ffdCost.toFixed(2) + ')');
const noCharge = ffd.find(i => i.invoice === '90772312');
chk(!!noCharge && noCharge.internal === true && noCharge.boxPrice === 0, 'No-charge tuna (90772312) is internal @ $0');
chk(ffd.every(i => ['90772340', '90772444', '90772312'].includes(i.invoice)), 'All FFD items tagged with a valid invoice #');
chk(ffd.every(i => i.itemNo !== '—'), 'All FFD items carry vendor item numbers (no guessed codes)');
// spot-check hub math on a few FFD rows (65% markup default)
const spot = {
  170: { cpu: 3.1392, retail: 4.99 },   // Saba Ultra Long Pads 12/16ct
  181: { cpu: 2.0615, retail: 2.99 },   // Van Camps Yellowfin Tuna 48/5oz
  194: { cpu: 1.088,  retail: 1.99 },   // Allegra Rigatoni 20/16oz
  203: { cpu: 2.9125, retail: 4.99 },   // ILE Sabora Pasta 12/17.6oz
  209: { cpu: 2.34,   retail: 3.99 },   // Nestle PE Morochas 30/6.35oz
  215: { cpu: 5.7,    retail: 8.99 },   // Mama Tere Papa Criolla (FZ) 6/32oz
};
for (const [id, e] of Object.entries(spot)) {
  const it = ALL_ITEMS.find(i => i.id === +id);
  chk(it && Math.abs(it.costPerUnit - e.cpu) < 0.0001, `FFD id ${id} costPerUnit=${e.cpu} (got ${it && it.costPerUnit})`);
  chk(it && it.retail === e.retail, `FFD id ${id} retail=${e.retail} (got ${it && it.retail})`);
}
const ffdSellable = ffd.filter(i => !i.internal);
const ffdRev = ffdSellable.reduce((s, i) => s + calcBoxRev(i), 0);
const ffdProfit = ffdSellable.reduce((s, i) => s + calcBoxProfit(i), 0);
console.log('--- FFD hub calc (65% markup default) ---');
console.log('FFD retail cost: $' + ffdSellable.reduce((s, i) => s + i.boxes * i.boxPrice, 0).toFixed(2));
console.log('Projected revenue: $' + ffdRev.toFixed(2));
console.log('Projected profit:  $' + ffdProfit.toFixed(2));
console.log('Gross margin: ' + ((ffdProfit / ffdRev) * 100).toFixed(1) + '%');

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
