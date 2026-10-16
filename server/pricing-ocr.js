'use strict';

// Invoice extraction. Turns a scan into candidate line items for human review.
//
// Provider order:
//   1. Local PaddleOCR container (PRICING_PADDLE_URL, default
//      http://localhost:8120) — the owner's 2026-09-04 choice. PP-OCRv5 runs on
//      the store's own machine, so an invoice never leaves the store. Raw OCR
//      lines are parsed into the invoice schema by the coordinate parser below
//      (ported from scripts/parse-invoice-items.py, validated against PEIMCO
//      and Triunfo scans).
//   2. A configured webhook (PRICING_OCR_WEBHOOK_URL) — the PR #32 contract.
//      Setting a URL is an explicit operator choice. This is the path to
//      `server/ocr-webhook.js`, which has been validated against a real Family
//      Food invoice (16/16 lines, line-total sum exact), and which also offers
//      OpenRouter and keeps the provider key off the app server.
//   3. Gemini Flash directly via GEMINI_API_KEY — the owner's 2026-08-19 choice.
//      Reads images and PDFs and returns structured JSON with nothing extra to
//      deploy. Used when PaddleOCR is unreachable and no webhook is configured.
//
// Nothing here approves anything. Every extracted line lands in `needs_review`
// and a manager resolves it against the source scan. That boundary is the whole
// point: a model reading a smudged invoice must not be able to move a shelf
// price on its own.
//
// PRIVACY NOTE (owner is aware): Google's FREE tier may use submitted content to
// improve their products. Invoices are internal business documents. If that
// becomes unacceptable, the paid tier carries no training use — or switch to the
// local PaddleOCR provider, which sends nothing outside the store.

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const REQUEST_TIMEOUT_MS = 180000;

// ─── Local PaddleOCR provider ─────────────────────────────────────────
// The store's own container (docker/paddleocr → anthony-paddleocr) runs
// PP-OCRv5 on CPU and speaks POST /ocr/b64 with {"image": <base64>,
// "filename": ...}, returning raw lines as {"lines":[{text,score,box}],
// "full_text": ...}. The parsers below turn those raw lines into the invoice
// schema using the coordinate logic validated by scripts/parse-invoice-items.py.
const PADDLE_DEFAULT_URL = 'http://localhost:8120';
// Rows whose y-centers differ by at most this many px are one line item.
const PADDLE_Y_TOL = 12;
// Header words → column name (Triunfo-style invoices; other layouts fall back
// to the generic row splitter).
const PADDLE_HEADER_KEYS = {
  'item code': 'code',
  'ordered': 'ordered',
  'shipped': 'shipped',
  'description': 'name',
  'pack size': 'pack',
  'upc code': 'upc',
  'case/unit': 'unit',
  'weight': 'weight',
  'unit price': 'price',
  'extended': 'extended',
  'extende': 'extended',
  'ext': 'extended',
  'price': 'price',
  'upc': 'upc',
  'case': 'unit'
};
// Summary rows never become items.
const PADDLE_TOTAL_MARKERS = /(^|\s)(TOTAL|SUBTOTAL|GRAND|BALANCE|AMOUNT DUE)(\s|$)/i;

// The shape the pricing engine expects back. Declared to the model as a response
// schema so it returns parseable JSON rather than prose that needs scraping.
const INVOICE_SCHEMA = {
  type: 'object',
  properties: {
    invoice: {
      type: 'object',
      properties: {
        vendor_name: { type: 'string' },
        invoice_number: { type: 'string' },
        invoice_date: { type: 'string', description: 'ISO date YYYY-MM-DD if legible, else empty' },
        subtotal: { type: 'number' }
      }
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          line_number: { type: 'integer' },
          vendor_sku: { type: 'string', description: "The vendor's item number as printed, else empty" },
          upc: { type: 'string', description: 'Digits only, leading zeros preserved, else empty' },
          description: { type: 'string' },
          department: { type: 'string' },
          cases: { type: 'number', description: 'Quantity of cases on the line' },
          units: { type: 'number', description: 'Units per case' },
          total: { type: 'number', description: 'Line total in dollars' },
          confidence: { type: 'number', description: '0 to 1, how legible this line was' },
          note: { type: 'string', description: 'Anything ambiguous, handwritten, or crossed out' }
        },
        required: ['line_number', 'description', 'total', 'confidence']
      }
    }
  },
  required: ['invoice', 'items']
};

// The instruction is deliberately conservative: transcribe, never infer. An
// invented UPC or pack size is worse than a blank one, because a blank stops a
// human while an invention sails through review looking plausible.
const PROMPT = [
  'You are transcribing a wholesale grocery invoice for a small supermarket.',
  '',
  'Rules:',
  '- Transcribe ONLY what is printed. Never infer, complete, or correct a value.',
  '- If a field is illegible, missing, or ambiguous, leave it empty and say why in "note".',
  '- Never invent a UPC, item number, or pack size. An empty field is correct; a guess is not.',
  '- Preserve UPC leading zeros exactly. Return digits only.',
  '- "cases" is how many cases were bought; "units" is units per case. If the invoice shows',
  '  only one quantity and you cannot tell which it is, put it in "cases", set "units" to 0,',
  '  and note the ambiguity.',
  '- "total" is the line total in dollars, not the unit price.',
  '- Set "confidence" below 0.9 for anything handwritten, smudged, crossed out, or uncertain.',
  '- Include every line item, including credits and refunds (negative totals).',
  '- Do not include shipping, tax, or summary rows as items; put the invoice subtotal in',
  '  invoice.subtotal instead.'
].join('\n');

function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

function isWebhookConfigured() {
  return Boolean(process.env.PRICING_OCR_WEBHOOK_URL);
}

// PaddleOCR is the local, private choice, but choosing it is an operator
// decision: an unset PRICING_PADDLE_URL means "not chosen", never "assume
// localhost". A default that always reported configured would make every
// deployment advertise a reader it may not be running.
function paddleUrl() {
  const raw = (process.env.PRICING_PADDLE_URL || '').trim();
  if (!raw) return '';
  // A bare flag ("1", "on", "true") means the container on its standard port.
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) return PADDLE_DEFAULT_URL;
  return raw.replace(/\/+$/, '');
}

function isPaddleConfigured() {
  return Boolean(paddleUrl());
}

function isConfigured() {
  return isPaddleConfigured() || isWebhookConfigured() || isGeminiConfigured();
}

function activeProvider() {
  if (isPaddleConfigured()) return 'paddle';
  if (isWebhookConfigured()) return 'webhook';
  if (isGeminiConfigured()) return 'gemini';
  return null;
}

// Reachability probe for startup logging and health checks. Extraction does not
// call this — it detects a dead service by failing and falling through, which
// costs nothing when PaddleOCR is up. Any HTTP answer counts as reachable: the
// service has no guaranteed root route, so a 404 still means it is listening.
async function probePaddle(fetchImpl = globalThis.fetch, timeoutMs = 2000) {
  if (!isPaddleConfigured()) return { ok: false, reason: 'not configured' };
  try {
    const response = await fetchImpl(paddleUrl(), { signal: AbortSignal.timeout(timeoutMs) });
    return { ok: true, status: response && response.status };
  } catch (error) {
    return { ok: false, reason: (error && error.message) || String(error) };
  }
}

// Gemini accepts PDFs and images as inline base64 data.
async function extractWithGemini(file, fields, fetchImpl) {
  const model = DEFAULT_MODEL;
  const url = `${GEMINI_ENDPOINT}/${encodeURIComponent(model)}:generateContent`;

  const hint = [
    fields.vendor_name ? `The vendor is stated to be: ${fields.vendor_name}.` : '',
    fields.invoice_number ? `The invoice number is stated to be: ${fields.invoice_number}.` : ''
  ].filter(Boolean).join(' ');

  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Header auth rather than a query parameter, so the key cannot leak into
      // proxy logs or error messages that echo the URL.
      'x-goog-api-key': process.env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: hint ? `${PROMPT}\n\n${hint}` : PROMPT },
          { inline_data: { mime_type: file.mimetype, data: file.buffer.toString('base64') } }
        ]
      }],
      generationConfig: {
        temperature: 0,
        response_mime_type: 'application/json',
        response_schema: INVOICE_SCHEMA
      }
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      if (body && body.error && body.error.message) detail = body.error.message;
    } catch (_) { /* non-JSON error body */ }
    // The free tier is rate limited (roughly 15/minute). Say so plainly rather
    // than surfacing a bare 429, so whoever is scanning knows to wait.
    if (response.status === 429) {
      throw new Error(`Gemini free-tier rate limit reached — wait a minute and retry (${detail})`);
    }
    throw new Error(`Gemini extraction failed: ${detail}`);
  }

  const body = await response.json();
  const text = body
    && body.candidates
    && body.candidates[0]
    && body.candidates[0].content
    && body.candidates[0].content.parts
    && body.candidates[0].content.parts[0]
    && body.candidates[0].content.parts[0].text;

  if (!text) {
    const reason = body && body.candidates && body.candidates[0] && body.candidates[0].finishReason;
    throw new Error(`Gemini returned no content${reason ? ` (${reason})` : ''}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (_) {
    throw new Error('Gemini returned a response that was not valid JSON');
  }
  return normalize(parsed, 'gemini', model);
}

async function extractWithWebhook(file, fields, fetchImpl) {
  const body = new FormData();
  body.append('invoice', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
  body.append('vendor_name', fields.vendor_name || '');
  body.append('invoice_number', fields.invoice_number || '');
  const token = process.env.PRICING_OCR_WEBHOOK_TOKEN;
  const response = await fetchImpl(process.env.PRICING_OCR_WEBHOOK_URL, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`OCR service returned HTTP ${response.status}`);
  return normalize(await response.json(), 'webhook', process.env.PRICING_OCR_WEBHOOK_URL);
}

// ─── PaddleOCR raw-line → invoice parser ─────────────────────────────
// Port of scripts/parse-invoice-items.py's self-calibrating approach:
// find the header row, derive column x-centers from it, group OCR cells into
// rows by y-center (≤ PADDLE_Y_TOL), and assign each cell to its nearest
// column. Works on photos taken at different angles/scales.

function boxCx(box) { return (box[0][0] + box[2][0]) / 2; }
function boxCy(box) { return (box[0][1] + box[2][1]) / 2; }

function paddleFindColumns(lines) {
  let headerY = null;
  for (const l of lines) {
    const key = l.text.replace(/\s+/g, ' ').trim().toLowerCase();
    if (key === 'item code') { headerY = boxCy(l.box); break; }
  }
  if (headerY == null) return null;
  const cols = {};
  for (const l of lines) {
    if (Math.abs(boxCy(l.box) - headerY) > 25) continue;
    const key = l.text.replace(/\s+/g, ' ').trim().toLowerCase();
    if (PADDLE_HEADER_KEYS[key] && !(PADDLE_HEADER_KEYS[key] in cols)) {
      cols[PADDLE_HEADER_KEYS[key]] = boxCx(l.box);
    }
  }
  if (!('code' in cols) || !('name' in cols) || !('price' in cols)) return null;
  return cols;
}

function paddleItemRows(lines, headerY) {
  const body = lines.filter(l => boxCy(l.box) > headerY + 10);
  const rows = [];
  for (const l of body.sort((a, b) => boxCy(a.box) - boxCy(b.box))) {
    let placed = false;
    for (const row of rows) {
      if (Math.abs(row.y - boxCy(l.box)) <= PADDLE_Y_TOL) {
        row.cells.push(l);
        row.ys.push(boxCy(l.box));
        row.y = row.ys.reduce((a, b) => a + b, 0) / row.ys.length;
        placed = true;
        break;
      }
    }
    if (!placed) rows.push({ y: boxCy(l.box), ys: [boxCy(l.box)], cells: [l] });
  }
  return rows;
}

function paddleCellFor(row, colX, centers) {
  // Nearest-center assignment: a cell only claims a column if that column is
  // genuinely the nearest (prevents a long product name bleeding sideways).
  let best = null, bd = 1e9;
  for (const l of row.cells) {
    const d = Math.abs(boxCx(l.box) - colX);
    if (centers.some(c => c !== colX && Math.abs(boxCx(l.box) - c) < d)) continue;
    if (d < bd) { best = l; bd = d; }
  }
  return best ? (best.text.trim() || null) : null;
}

function paddleRowToItem(row, cols, index) {
  // Per-row drift calibration: photos skew, so columns drift with y. Every
  // Triunfo-style item row prints 'CASE' in the Case/Unit column — anchor on it.
  let drift = 0;
  if ('unit' in cols) {
    for (const l of row.cells) {
      if (l.text.trim().toUpperCase() === 'CASE') { drift = boxCx(l.box) - cols.unit; break; }
    }
  }
  const rcols = {};
  for (const k of Object.keys(cols)) rcols[k] = cols[k] + drift;
  const centers = Array.from(new Set(Object.values(rcols))).sort((a, b) => a - b);

  const rowText = row.cells.map(c => c.text).join(' ');
  if (PADDLE_TOTAL_MARKERS.test(rowText)) return null;

  const name = paddleCellFor(row, rcols.name, centers);
  if (!name || !/[A-Za-z]{3}/.test(name)) return null;

  const code = paddleCellFor(row, rcols.code, centers);
  const pack = paddleCellFor(row, rcols.pack, centers);
  const upc = paddleCellFor(row, rcols.upc, centers);

  // price: numeric cell closest to the price OR extended column center
  // (some invoices print the price under either header after photo drift).
  const priceCenter = rcols.price;
  const extCenter = ('extended' in rcols) ? rcols.extended : priceCenter + 60;
  let priceTxt = null, bd = 1e9;
  for (const l of row.cells) {
    const t = l.text.trim().replace(/,/g, '.');
    if (/^\d+\.\d{2}$/.test(t)) {
      const d = Math.min(Math.abs(boxCx(l.box) - priceCenter), Math.abs(boxCx(l.box) - extCenter));
      if (d < bd) { priceTxt = t; bd = d; }
    }
  }

  // qty: Ordered and Shipped columns sit close together; sweep the x-band and
  // take the largest numeric as the case count.
  let qty = null;
  if ('ordered' in rcols && 'shipped' in rcols) {
    const lo = Math.min(rcols.ordered, rcols.shipped) - 18;
    const hi = Math.max(rcols.ordered, rcols.shipped) + 18;
    const cands = [];
    for (const l of row.cells) {
      if (lo <= boxCx(l.box) && boxCx(l.box) <= hi) {
        const t = l.text.trim().replace(/,/g, '.');
        if (/^\d+(\.\d+)?$/.test(t)) cands.push(parseFloat(t));
      }
    }
    if (cands.length) qty = Math.max(...cands);
  }

  const price = priceTxt != null ? parseFloat(priceTxt) : null;
  if (qty == null && price == null) return null;

  const packMatch = /^\s*(\d+)\s*[xX]/.exec(pack || '');
  const units = packMatch ? parseInt(packMatch[1], 10) : null;

  const missing = [];
  if (price == null) missing.push('price');
  if (qty == null) missing.push('qty');
  if (!upc) missing.push('UPC');

  return {
    line_number: index + 1,
    vendor_sku: code || '',
    upc: String(upc || '').replace(/\D/g, ''),
    description: name,
    department: '',
    cases: qty || 0,
    units: units || 0,
    total: qty != null && price != null ? Math.round(qty * price * 100) / 100 : (price || 0),
    confidence: Math.min(...row.cells.map(c => Number.isFinite(c.score) ? c.score : 0)),
    review_reason: missing.length ? `PaddleOCR local — verify ${missing.join(', ')}` : undefined
  };
}

// Generic fallback for invoices without a Triunfo-style header: group lines
// into rows, then classify cells by content (longest text = description,
// rightmost 2-decimal number = total, 8+ digits = UPC, "NxM" = pack size).
function paddleGenericItems(lines) {
  const rows = [];
  for (const l of lines.sort((a, b) => boxCy(a.box) - boxCy(b.box))) {
    let placed = false;
    for (const row of rows) {
      if (Math.abs(row.y - boxCy(l.box)) <= PADDLE_Y_TOL) {
        row.cells.push(l);
        row.ys.push(boxCy(l.box));
        row.y = row.ys.reduce((a, b) => a + b, 0) / row.ys.length;
        placed = true;
        break;
      }
    }
    if (!placed) rows.push({ y: boxCy(l.box), ys: [boxCy(l.box)], cells: [l] });
  }
  const items = [];
  rows.forEach((row, index) => {
    row.cells.sort((a, b) => boxCx(a.box) - boxCx(b.box));
    const rowText = row.cells.map(c => c.text).join(' ');
    if (PADDLE_TOTAL_MARKERS.test(rowText)) return;
    const texts = row.cells.map(c => c.text.trim()).filter(Boolean);
    const name = texts.find(t => /[A-Za-z]{3}/.test(t));
    if (!name) return;
    const numerics = row.cells
      .map(c => ({ x: boxCx(c.box), t: c.text.trim().replace(/,/g, '.') }))
      .filter(c => /^\d+(\.\d{1,2})?$/.test(c.t));
    const lastNumeric = numerics[numerics.length - 1];
    const confidence = Math.min(...row.cells.map(c => Number.isFinite(c.score) ? c.score : 0));
    if (!lastNumeric || !/\.\d{2}$/.test(lastNumeric.t)) {
      // no clean dollar total — still surface it for review rather than drop it
      items.push({
        line_number: index + 1, vendor_sku: '', upc: '', description: name, department: '',
        cases: 0, units: 0, total: 0, confidence,
        review_reason: 'PaddleOCR local — no dollar total found, needs manual entry'
      });
      return;
    }
    const total = parseFloat(lastNumeric.t);
    const upcText = texts.find(t => /^\d{8,14}$/.test(t.replace(/\D/g, '')) && t.replace(/\D/g, '').length >= 8);
    const packMatch = texts.find(t => /^\d+\s*[xX]\s*\d/i.test(t));
    const units = packMatch ? parseInt(packMatch, 10) : 0;
    items.push({
      line_number: index + 1, vendor_sku: '', upc: String(upcText || '').replace(/\D/g, ''),
      description: name, department: '', cases: 0, units, total, confidence,
      review_reason: 'PaddleOCR local — generic layout, verify qty/pack'
    });
  });
  return items;
}

async function extractWithPaddle(file, fields, fetchImpl) {
  const url = paddleUrl();
  const response = await fetchImpl(`${url}/ocr/b64`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image: file.buffer.toString('base64'),
      filename: file.originalname || 'invoice'
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });
  if (!response.ok) throw new Error(`PaddleOCR service returned HTTP ${response.status}`);
  let body;
  try { body = await response.json(); } catch (_) { throw new Error('PaddleOCR returned a non-JSON response'); }
  const lines = Array.isArray(body && body.lines) ? body.lines : [];
  if (!lines.length) throw new Error('PaddleOCR returned no text lines');

  const cols = paddleFindColumns(lines);
  let items;
  if (cols) {
    const headerY = Math.min(...lines
      .filter(l => PADDLE_HEADER_KEYS[l.text.replace(/\s+/g, ' ').trim().toLowerCase()])
      .map(l => boxCy(l.box)));
    items = paddleItemRows(lines, headerY)
      .map((row, i) => paddleRowToItem(row, cols, i))
      .filter(Boolean);
  } else {
    items = paddleGenericItems(lines);
  }

  const invoiceNumber = fields.invoice_number
    || (() => {
      const m = /#?\s*([A-Z]{2,4}[- ]?\d{5,}|INV[A-Z0-9-]+)/i.exec(body.full_text || '');
      return m ? m[1] : '';
    })();
  const subtotal = Math.round(items.reduce((s, i) => s + i.total, 0) * 100) / 100;

  return {
    invoice: {
      vendor_name: str(fields.vendor_name),
      invoice_number: str(invoiceNumber),
      invoice_date: str(fields.invoice_date),
      subtotal
    },
    items,
    _provider: 'paddle',
    _model: process.env.PRICING_PADDLE_MODEL || 'PP-OCRv5-local'
  };
}

// Coerces a provider's output into the engine's expected shape. A model that
// returns a string where a number belongs must not blow up the pipeline — the
// line simply fails the engine's checks and goes to review, which is correct.
function normalize(payload, provider, model) {
  const invoice = (payload && payload.invoice) || {};
  const items = Array.isArray(payload && payload.items) ? payload.items : [];
  return {
    invoice: {
      vendor_name: str(invoice.vendor_name),
      invoice_number: str(invoice.invoice_number),
      invoice_date: str(invoice.invoice_date),
      subtotal: num(invoice.subtotal)
    },
    items: items.map((item, index) => ({
      line_number: Number.isFinite(Number(item.line_number)) ? Number(item.line_number) : index + 1,
      vendor_sku: str(item.vendor_sku),
      upc: String(item.upc == null ? '' : item.upc).replace(/\D/g, ''),
      description: str(item.description),
      department: str(item.department),
      cases: num(item.cases),
      units: num(item.units),
      total: num(item.total),
      confidence: clamp01(item.confidence),
      // The model's own note about what was unclear travels with the line so the
      // reviewer sees it next to the number they are checking.
      review_reason: str(item.note) || undefined
    })),
    _provider: provider,
    _model: model || null
  };
}

function str(value) {
  return String(value == null ? '' : value).trim();
}

function num(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function clamp01(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.min(1, Math.max(0, number));
}

// Extracts a scan. Throws when no provider is configured — callers report that
// as OCR_NOT_CONFIGURED and still store the scan privately, so nothing is lost.
async function extractInvoice(file, fields = {}, { fetch: fetchImpl = globalThis.fetch } = {}) {
  // Readers are tried in preference order and a failure falls through to the
  // next one, so a stopped PaddleOCR container degrades to Gemini instead of
  // failing every scan. A provider that is not chosen is never attempted.
  const chain = [];
  if (isPaddleConfigured()) chain.push(['paddle', extractWithPaddle]);
  if (isWebhookConfigured()) chain.push(['webhook', extractWithWebhook]);
  if (isGeminiConfigured()) chain.push(['gemini', extractWithGemini]);

  if (!chain.length) {
    const error = new Error('No OCR provider is configured');
    error.code = 'OCR_NOT_CONFIGURED';
    throw error;
  }

  const failures = [];
  for (const [provider, extract] of chain) {
    try {
      const result = await extract(file, fields, fetchImpl);
      // Only a fallback is worth reporting: the happy path is unchanged.
      if (failures.length) {
        result._fallback_from = failures.map(f => f.provider).join(' -> ');
        result._fallback_reason = failures[failures.length - 1].message;
      }
      return result;
    } catch (error) {
      if (error && error.code === 'OCR_NOT_CONFIGURED') throw error;
      failures.push({ provider, message: (error && error.message) || String(error) });
    }
  }

  // One configured reader keeps its own message: the operator needs "the Gemini
  // key is wrong", not a generic chain failure.
  if (failures.length === 1) {
    const error = new Error(failures[0].message);
    error.code = 'OCR_PROVIDER_FAILED';
    error.provider = failures[0].provider;
    throw error;
  }

  const error = new Error(
    `Every OCR provider failed \u2014 ${failures.map(f => `${f.provider}: ${f.message}`).join('; ')}`
  );
  error.code = 'OCR_ALL_PROVIDERS_FAILED';
  error.failures = failures;
  throw error;
}

module.exports = {
  DEFAULT_MODEL,
  INVOICE_SCHEMA,
  PROMPT,
  activeProvider,
  extractInvoice,
  isConfigured,
  isGeminiConfigured,
  isPaddleConfigured,
  isWebhookConfigured,
  normalize,
  probePaddle
};
