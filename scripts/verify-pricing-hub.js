// Verification harness for the Pricing Hub.
//
// Loads the embedded VENDORS/ALL_ITEMS arrays and the hub's OWN pricing
// functions out of apps/pricing-hub/index.html, then asserts the dataset and the
// shelf math against figures taken from the paper invoices.
//
// Two things this protects, beyond the numbers:
//   * the embedded arrays keep the exact shape the Kingdom OS collector parses
//   * the root pricing-hub/index.html copy the website iframes stays in sync
//
// Run with: node scripts/verify-pricing-hub.js
const fs = require('fs');
const path = require('path');
const { HUB_APP_PATH, HUB_SITE_PATH, REPO_ROOT, readHubData, readHubMath } = require('./lib/hub-data');

const { VENDORS, ALL_ITEMS } = readHubData(HUB_APP_PATH);
// Verify the shipped functions, not a reimplementation of them: a copy here
// could agree with itself while the page does something else entirely.
const { calcRetail, calcBoxRev, calcBoxProfit, costOf } = readHubMath(HUB_APP_PATH, { markup: 65 });

// --- assertions ---
const pass = (cond, msg) => console.log((cond ? 'PASS' : 'FAIL') + ' | ' + msg);
let fails = 0;
const chk = (cond, msg) => { pass(cond, msg); if (!cond) fails++; };

chk(!!VENDORS["Hershey's Ice Cream"], "VENDORS has Hershey's Ice Cream");
chk(!!VENDORS["Hershey's Ice Cream"].invoices.INVE0023460478, 'VENDORS has invoice INVE0023460478');
chk(!!VENDORS["Family Food Distributors"], "VENDORS has Family Food Distributors");
chk(!!VENDORS["Family Food Distributors"].invoices["90747231"] && !!VENDORS["Family Food Distributors"].invoices["90747476"] && !!VENDORS["Family Food Distributors"].invoices["90772340"] && !!VENDORS["Family Food Distributors"].invoices["90772444"] && !!VENDORS["Family Food Distributors"].invoices["90772312"], 'VENDORS has all 5 FFD invoices');
chk(!!VENDORS["Family Food"] === false, 'Legacy "Family Food" vendor key removed (merged)');
chk(Array.isArray(ALL_ITEMS) && ALL_ITEMS.length === 157, 'ALL_ITEMS length = 157 (105 prior + 52 new; got ' + ALL_ITEMS.length + ')');

const hers = ALL_ITEMS.filter(i => i.vendor === "Hershey's Ice Cream");
chk(hers.length === 12, "Hershey's items = 12 (got " + hers.length + ')');
const cost = hers.reduce((s, i) => s + i.boxes * i.boxPrice, 0);
chk(Math.abs(cost - 234.42) < 0.001, 'Hershey\'s total cost = $234.42 (got $' + cost.toFixed(2) + ')');
const fee = hers.find(i => i.name === 'Delivery Fee');
chk(!!fee && fee.internal === true, 'Delivery Fee is internal (not for sale)');
chk(new Set(ALL_ITEMS.map(i => i.id)).size === ALL_ITEMS.length, 'All item ids unique');
chk(hers.every(i => i.invoice === 'INVE0023460478'), 'All items tagged with invoice #');

// --- Family Food Distributors (5 invoices: 2 prior 6/24/26 + 3 today 8/19/26) ---
const ffd = ALL_ITEMS.filter(i => i.vendor === "Family Food Distributors");
chk(ffd.length === 109, "Family Food items = 109 (57 prior + 52 today; got " + ffd.length + ')');
const TODAY = ['90772340', '90772444', '90772312'];
const ffdToday = ffd.filter(i => TODAY.includes(i.invoice));
const ffdCost = ffdToday.reduce((s, i) => s + i.boxes * i.boxPrice, 0);
chk(Math.abs(ffdCost - 2594.94) < 0.001, 'Family Food today cost = $2,594.94 (got $' + ffdCost.toFixed(2) + ')');
const noCharge = ffd.find(i => i.invoice === '90772312');
chk(!!noCharge && noCharge.internal === false && noCharge.retail === 4.99 && noCharge.flagged === true, 'Refund tuna (90772312) sellable @ $4.99 reference-priced, flagged');
chk(ffd.every(i => ['90747231', '90747476', '90772340', '90772444', '90772312'].includes(i.invoice)), 'All FFD items tagged with a valid invoice #');
chk(ffd.every(i => i.itemNo !== '—'), 'All FFD items carry vendor item numbers (no guessed codes)');
const lentejon = ALL_ITEMS.find(i => i.id === 198);
chk(!!lentejon && lentejon.name === 'Mama Tere Lentejon', 'id 198 renamed to Mama Tere Lentejon (typo fix, matches prior invoice)');
const vcOld = ALL_ITEMS.find(i => i.id === 157), vcNew = ALL_ITEMS.find(i => i.id === 181);
chk(vcOld.retail === 3.99 && vcNew.retail === 2.99 && vcNew.boxPrice < vcOld.boxPrice, 'Van Camps 48/5oz price drop reflected (113.55 → 98.95, retail 3.99 → 2.99)');
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


// ── v2 structural contract ───────────────────────────────────────────────────
// The Kingdom OS collector parses this file. These checks fail loudly if a UI
// change reshapes the data it depends on.
const appHtml = fs.readFileSync(HUB_APP_PATH, 'utf8');
chk(/const VENDORS = \{/.test(appHtml), 'VENDORS declaration present for the Kingdom OS mirror');
chk(/const ALL_ITEMS = \[/.test(appHtml), 'ALL_ITEMS declaration present for the Kingdom OS mirror');
chk(appHtml.includes("{id:1,"), 'ALL_ITEMS keeps one-object-per-line item formatting');
chk(/id:221,itemNo:"1155"/.test(appHtml), 'last item line is still patchable in place by the OS write-back');
chk(!/<script[^>]+src=/i.test(appHtml), 'hub stays self-contained (no external scripts)');
chk(!/https?:\/\/(?!t\.me)[^"'\s]*\.(js|css)/i.test(appHtml), 'hub loads no remote stylesheets or scripts');

// ── v2 feature surface ───────────────────────────────────────────────────────
for (const [needle, label] of [
  ['id="vendorSelect"', 'vendor selector present'],
  ['id="invoiceSelect"', 'invoice filter present'],
  ['id="catTabs"', 'category chips present'],
  ['id="searchInput"', 'item search present'],
  ['id="markupSlider"', 'markup slider present'],
  ['value="65"', 'markup slider defaults to 65%'],
  ['id="queueList"', 'approval queue present'],
  ['id="varianceList"', 'price-change view present'],
  ['id="exportLabelsBtn"', 'price-gun export present'],
  ['id="exportCsvBtn"', 'CSV export present'],
  ['item_name\',\'upc\',\'price\',\'department', 'price-gun export uses the four documented columns'],
  ['function renderTimeline', 'price history timeline present']
]) {
  chk(appHtml.includes(needle), label);
}

// ── Offline fallback ─────────────────────────────────────────────────────────
// The arrays must render without any network call: the owner never gets a blank
// page because the API is down.
chk(/embedded arrays render first/i.test(appHtml) || /unconditionally/i.test(appHtml),
  'boot renders embedded data before contacting the server');

// ── Site copy stays in sync ──────────────────────────────────────────────────
// The website iframes pricing-hub/index.html; a drift here ships stale prices.
const siteHtml = fs.existsSync(HUB_SITE_PATH) ? fs.readFileSync(HUB_SITE_PATH, 'utf8') : null;
chk(siteHtml !== null, 'root pricing-hub/index.html exists (iframe target)');
chk(siteHtml === appHtml, 'root pricing-hub/index.html matches apps/pricing-hub/index.html');

console.log(fails === 0 ? 'ALL CHECKS PASSED ✅' : fails + ' CHECKS FAILED ❌');
process.exit(fails === 0 ? 0 : 1);
