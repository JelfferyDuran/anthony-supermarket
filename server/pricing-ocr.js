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
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
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
  'extended amount': 'extended',
  'extended': 'extended',
  'extende': 'extended',
  'ext': 'extended',
  'price': 'price',
  'upc': 'upc',
  'case': 'unit'
};
// Summary rows never become items.
const PADDLE_TOTAL_MARKERS = /(^|\s)(TOTAL|SUBTOTAL|GRAND|BALANCE|AMOUNT DUE)(\s|$)/i;
// OCR truncates long header cells ('Extended Amount' → 'Extended Amoun'), so
// alias the observed truncations back to canonical column keys.
const PADDLE_HEADER_ALIASES = {
  'extended amoun': 'extended',
  'extended amoun.': 'extended',
  'extend': 'extended',
  'unit price': 'price',
  'unit pri': 'price',
  'pack siz': 'pack',
  'upc cod': 'upc'
};
function paddleHeaderKey(text) {
  const k = text.replace(/\s+/g, ' ').trim().toLowerCase();
  // Return the CANONICAL column key ('item code' → 'code'), not the raw
  // header text — callers index cols.code/cols.name/cols.price.
  if (PADDLE_HEADER_KEYS[k]) return PADDLE_HEADER_KEYS[k];
  if (PADDLE_HEADER_ALIASES[k]) return PADDLE_HEADER_ALIASES[k];
  return null;
}

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

const PADDLE_FURNITURE = /^(signature|date|bill\s*to|ship\s*to|remit\s*to|sold\s*to|terms?|page\s*\d+|item\s*code|ordered|shipped|description|pack\s*size|upc\s*code|case|case\s*\/\s*unit|weight|unit\s*price|extended|ite|sub-?total|total)[:\s]*$/i;
// Footer/body furniture that must never become a line item, matched anywhere
// in a row (the anchored PADDLE_FURNITURE above misses 'Total Weight:').
const PADDLE_FOOTER = /(signature|total\s*weight|total\s*pieces|customer\s*#|fuel\s*charge|grand\s*total|amount\s*due)/i;

// The printed number sits in its own box next to an 'Invoice #:' label, so no
// text-line regex can see it; read it geometrically, right of the label.
function paddleInvoiceNumber(lines) {
  const norm = l => l.text.replace(/\s+/g, ' ').trim().toLowerCase();
  for (const l of lines) {
    if (!/^(invoice|inv|order|bill)\b[^]*?(#|no\b|number)/.test(norm(l))) continue;
    const y = boxCy(l.box), x = boxCx(l.box);
    const near = lines
      .filter(o => o !== l && Math.abs(boxCy(o.box) - y) <= PADDLE_Y_TOL * 2 && boxCx(o.box) > x)
      .sort((a, b) => boxCx(a.box) - boxCx(b.box));
    for (const o of near) {
      const m = /\d{4,}/.exec(o.text);
      if (m) return m[0];
    }
  }
  return '';
}

function paddleFindColumns(lines) {
  const norm = l => l.text.replace(/\s+/g, ' ').trim().toLowerCase();
  let anchor = null;
  for (const l of lines) if (norm(l) === 'item code') { anchor = l; break; }
  if (!anchor) return null;
  // Photos of these invoices are tilted ~1.3-1.8 deg. That moves a header
  // label ~29px vertically across the 946px-wide header, which is wider than
  // the old fixed +/-25px window, so 'unit price' was dropped and the whole
  // page fell through to the generic splitter. Measure the tilt from the
  // header cells themselves and window along the printed row instead.
  const slope = paddleHeaderSlope(lines, norm, anchor);
  // Try the measured tilt first; if the window still comes up short (tilt
  // estimate off, or a scan with no tilt) fall back to an axis-aligned window
  // — the behaviour that parsed two of these three pages before.
  for (const s of (slope ? [slope, 0] : [0])) {
    const skewY = l => boxCy(l.box) - s * boxCx(l.box);
    const anchorY = skewY(anchor);
    const tol = Math.max(25, Math.min(70, paddleRowPitch(lines) * 3));
    const cands = [];
    for (const l of lines) {
      const col = paddleHeaderKey(norm(l));
      if (!col) continue;
      cands.push({ col, x: boxCx(l.box), d: Math.abs(skewY(l) - anchorY) });
    }
    // Nearest label wins, so a data-row 'CASE' cell can never outrank the real
    // 'Case/Unit' header when both land inside the window.
    cands.sort((a, b) => a.d - b.d);
    const cols = {};
    for (const c of cands) {
      if (c.d > tol) continue;
      if (!(c.col in cols)) cols[c.col] = c.x;
    }
    if ('code' in cols && 'name' in cols && 'price' in cols) {
      return { cols, slope: s, headerY: anchorY, tol };
    }
  }
  return null;
}

// Median pairwise tilt of the header labels (px of y per px of x). The median
// ignores one or two labels that sit off-baseline on a wrapped header.
function paddleHeaderSlope(lines, norm, anchor) {
  // Only cells near the anchor's own y can be header labels. Data rows carry a
  // 'CASE' cell that also matches a header key; letting those in poisoned the
  // tilt estimate and pushed the price column out of the window on pages that
  // used to parse fine.
  const ay = boxCy(anchor.box);
  const cells = lines
    .filter(l => paddleHeaderKey(norm(l)) && Math.abs(boxCy(l.box) - ay) <= 40)
    .map(l => ({ x: boxCx(l.box), y: boxCy(l.box) }));
  const slopes = [];
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const dx = cells[j].x - cells[i].x;
      if (Math.abs(dx) < 200) continue;
      slopes.push((cells[j].y - cells[i].y) / dx);
    }
  }
  if (!slopes.length) return 0;
  slopes.sort((a, b) => a - b);
  const m = slopes[Math.floor(slopes.length / 2)];
  return Math.abs(m) > 0.15 ? 0 : m;
}

// Typical vertical gap between text lines, used to size the header window.
function paddleRowPitch(lines) {
  const ys = lines.map(l => boxCy(l.box)).sort((a, b) => a - b);
  const gaps = [];
  for (let i = 1; i < ys.length; i++) { const g = ys[i] - ys[i - 1]; if (g > 2) gaps.push(g); }
  if (!gaps.length) return 14;
  gaps.sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)];
}

function paddleItemRows(lines, found) {
  const { slope, headerY, tol } = found;
  const norm = l => l.text.replace(/\s+/g, ' ').trim().toLowerCase();
  const skewY = l => boxCy(l.box) - slope * boxCx(l.box);
  // Drop the header's own cells (they are not items) but keep a data-row 'CASE'
  // cell, which lives far below the header window and drives drift calibration.
  const inHeaderWindow = l => paddleHeaderKey(norm(l)) && Math.abs(skewY(l) - headerY) <= tol;
  const body = lines.filter(l => !inHeaderWindow(l) && skewY(l) > headerY + Math.max(10, tol * 0.4));
  const rows = [];
  for (const l of body.sort((a, b) => skewY(a) - skewY(b))) {
    let placed = false;
    for (const row of rows) {
      if (Math.abs(row.y - skewY(l)) <= PADDLE_Y_TOL) {
        row.cells.push(l);
        row.ys.push(skewY(l));
        row.y = row.ys.reduce((a, b) => a + b, 0) / row.ys.length;
        placed = true;
        break;
      }
    }
    if (!placed) rows.push({ y: skewY(l), ys: [skewY(l)], cells: [l] });
  }
  // Drop label rows: the leftmost cell of a real line item is its code, so a
  // row that starts with 'Signature:' / 'Date:' is footer furniture even when
  // address text rides along on the same visual line.
  return rows.filter(row => {
    const cells = row.cells.slice().sort((a, b) => boxCx(a.box) - boxCx(b.box));
    if (cells.some(c => PADDLE_FOOTER.test(c.text))) return false;
    if (cells.length && PADDLE_FURNITURE.test(cells[0].text.trim())) return false;
    return cells.some(c => {
      const t = c.text.trim();
      return /[A-Za-z]{3}/.test(t) && !PADDLE_FURNITURE.test(t);
    });
  });
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
  // Unit price and line total live in separate columns; when the Extended
  // column is detected, read each from its own column center instead of
  // sweeping both (a 0.00 extended cell must stay 0.00, not fall back to
  // qty × unit price).
  let priceTxt = null, bd = 1e9;
  let extTxt = null, xd = 1e9;
  for (const l of row.cells) {
    const t = l.text.trim().replace(/,/g, '.');
    if (/^\d+\.\d{2}$/.test(t)) {
      const dPrice = Math.abs(boxCx(l.box) - priceCenter);
      const dExt = Math.abs(boxCx(l.box) - extCenter);
      if (dPrice < bd) { priceTxt = t; bd = dPrice; }
      if (dExt < xd) { extTxt = t; xd = dExt; }
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
  const extNum = extTxt != null ? parseFloat(extTxt) : null;
  if (qty == null && price == null && extNum == null) return null;

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
    total: ('extended' in rcols) && extNum != null ? extNum : (qty != null && price != null ? Math.round(qty * price * 100) / 100 : (price || 0)),
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
    // Column labels and page furniture ('CASE', 'Signature:', 'Date:') are not
    // products, even when a stray number lands on the same row.
    if (PADDLE_FURNITURE.test((rowText || '').trim()) || PADDLE_FOOTER.test(rowText || '')) return;
    const texts = row.cells.map(c => c.text.trim()).filter(Boolean);
    const name = texts.find(t => /[A-Za-z]{3}/.test(t));
    if (!name) return;
    const numerics = row.cells
      .map(c => ({ x: boxCx(c.box), t: c.text.trim().replace(/,/g, '.') }))
      .filter(c => /^\d+(\.\d{1,2})?$/.test(c.t));
    const lastNumeric = numerics[numerics.length - 1];
    const confidence = Math.min(...row.cells.map(c => Number.isFinite(c.score) ? c.score : 0));
    if (!lastNumeric || !/\.\d{2}$/.test(lastNumeric.t)) {
      // No money token on this row: it is page furniture (bill-to, address,
      // terms, column labels), not a line item. Emitting it as a zero-value
      // 'needs manual entry' product is what put 'Bill To:' and '288 Kearny
      // Ave' in the review queue. Abstain instead of inventing a product.
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

  const found = paddleFindColumns(lines);
  let items;
  if (found) {
    items = paddleItemRows(lines, found)
      .map((row, i) => paddleRowToItem(row, found.cols, i))
      .filter(Boolean);
  } else {
    items = paddleGenericItems(lines);
  }

  const invoiceNumber = fields.invoice_number
    || paddleInvoiceNumber(lines)
    || (() => {
      // Digits only, and only after a '#'. The looser pattern matched header
      // words and produced 'NJ 07032' / 'Invoice' for #20060979.
      const m = /#\s*(\d{5,})/.exec(body.full_text || '');
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
