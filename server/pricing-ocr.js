'use strict';

// Invoice extraction. Turns a scan into candidate line items for human review.
//
// Provider order:
//   1. A configured webhook (PRICING_OCR_WEBHOOK_URL) — the PR #32 contract.
//      Setting a URL is an explicit operator choice, so it wins. This is the
//      path to `server/ocr-webhook.js`, which has been validated against a real
//      Family Food invoice (16/16 lines, line-total sum exact), and which also
//      offers OpenRouter and keeps the provider key off the app server.
//   2. Gemini Flash directly via GEMINI_API_KEY — the owner's 2026-08-19 choice.
//      Reads images and PDFs and returns structured JSON with nothing extra to
//      deploy. Used when no webhook URL is configured.
//
// Nothing here approves anything. Every extracted line lands in `needs_review`
// and a manager resolves it against the source scan. That boundary is the whole
// point: a model reading a smudged invoice must not be able to move a shelf
// price on its own.
//
// PRIVACY NOTE (owner is aware): Google's FREE tier may use submitted content to
// improve their products. Invoices are internal business documents. If that
// becomes unacceptable, the paid tier carries no training use — or switch to the
// local Tesseract/PaddleOCR webhook, which sends nothing outside the store.

const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const REQUEST_TIMEOUT_MS = 45000;

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

function isConfigured() {
  return isGeminiConfigured() || isWebhookConfigured();
}

function activeProvider() {
  if (isWebhookConfigured()) return 'webhook';
  if (isGeminiConfigured()) return 'gemini';
  return null;
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
  if (isWebhookConfigured()) return extractWithWebhook(file, fields, fetchImpl);
  if (isGeminiConfigured()) return extractWithGemini(file, fields, fetchImpl);
  const error = new Error('No OCR provider is configured');
  error.code = 'OCR_NOT_CONFIGURED';
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
  isWebhookConfigured,
  normalize
};
