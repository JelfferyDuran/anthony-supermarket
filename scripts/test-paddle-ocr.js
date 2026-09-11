'use strict';
// Test harness: run the pricing-ocr pipeline against the LOCAL PaddleOCR
// container with a real invoice scan. Usage:
//   node scripts/test-paddle-ocr.js <image-path> [vendor] [invoiceNo]
process.env.PRICING_PADDLE_URL = process.env.PRICING_PADDLE_URL || 'http://localhost:8120';
const fs = require('fs');
const path = require('path');
const ocr = require('../server/pricing-ocr.js');

const imgPath = process.argv[2];
const vendor = process.argv[3] || 'Peruvian Import Co';
const invNo = process.argv[4] || 'TEST';
if (!imgPath || !fs.existsSync(imgPath)) {
  console.error('USAGE: node scripts/test-paddle-ocr.js <image-path> [vendor] [invoiceNo]');
  process.exit(1);
}

const buf = fs.readFileSync(imgPath);
const file = { buffer: buf, mimetype: 'image/jpeg', originalname: path.basename(imgPath) };

(async () => {
  console.log('PROVIDER ACTIVE:', ocr.activeProvider());
  const started = Date.now();
  const res = await ocr.extractInvoice(file, { vendor_name: vendor, invoice_number: invNo });
  console.log(`OK in ${Date.now() - started}ms | provider=${res._provider} model=${res._model}`);
  console.log('INVOICE:', JSON.stringify(res.invoice));
  console.log('ITEMS:', res.items.length);
  for (const it of res.items) {
    console.log(
      `${String(it.line_number).padStart(3)} | ${(it.description || '?').padEnd(42)} | qty=${String(it.cases).padStart(3)} | upc=${(it.upc || '-').padEnd(13)} | total=${String(it.total).padStart(9)} | conf=${it.confidence.toFixed(2)} | ${it.review_reason || ''}`
    );
  }
  const sum = Math.round(res.items.reduce((s, i) => s + i.total, 0) * 100) / 100;
  console.log('SUM LINE TOTALS:', sum);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
