'use strict';

// Tests for the invoice extraction adapter. No network: the Gemini and webhook
// calls are driven through an injected fetch, so the request shape and the
// response handling are both asserted without a key or a live service.

const test = require('node:test');
const assert = require('node:assert/strict');

const ENV_KEYS = ['GEMINI_API_KEY', 'GEMINI_MODEL', 'PRICING_OCR_WEBHOOK_URL', 'PRICING_OCR_WEBHOOK_TOKEN'];

// Loads the adapter under a specific environment and restores it afterwards.
// Awaits the body before restoring: an async test would otherwise run against a
// torn-down environment and see "no provider configured".
async function withEnv(values, run) {
  const saved = {};
  for (const key of ENV_KEYS) { saved[key] = process.env[key]; delete process.env[key]; }
  Object.assign(process.env, values);
  delete require.cache[require.resolve('./pricing-ocr')];
  const ocr = require('./pricing-ocr');
  try {
    return await run(ocr);
  } finally {
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
    delete require.cache[require.resolve('./pricing-ocr')];
  }
}

const FILE = { buffer: Buffer.from('%PDF-1.4 sample invoice'), mimetype: 'application/pdf', originalname: 'sample.pdf' };

function geminiReply(payload) {
  return async () => ({
    ok: true,
    status: 200,
    json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(payload) }] } }] })
  });
}

// ── Provider selection ───────────────────────────────────────────────────────

test('reports no provider when nothing is configured', () => withEnv({}, ocr => {
  assert.equal(ocr.isConfigured(), false);
  assert.equal(ocr.activeProvider(), null);
}));

test('a Gemini key alone is enough to be configured', () => withEnv({ GEMINI_API_KEY: 'k' }, ocr => {
  assert.equal(ocr.isConfigured(), true);
  assert.equal(ocr.activeProvider(), 'gemini');
}));

test('falls back to the webhook contract when there is no Gemini key', () => withEnv({ PRICING_OCR_WEBHOOK_URL: 'https://ocr.test/x' }, ocr => {
  assert.equal(ocr.activeProvider(), 'webhook');
}));

test('Gemini wins when both are configured', () => withEnv({ GEMINI_API_KEY: 'k', PRICING_OCR_WEBHOOK_URL: 'https://ocr.test/x' }, ocr => {
  assert.equal(ocr.activeProvider(), 'gemini');
}));

test('extraction refuses with a recognisable code when unconfigured', () => withEnv({}, async ocr => {
  await assert.rejects(() => ocr.extractInvoice(FILE), error => error.code === 'OCR_NOT_CONFIGURED');
}));

// ── Gemini request shape ─────────────────────────────────────────────────────

test('sends the key as a header, never in the URL', () => withEnv({ GEMINI_API_KEY: 'secret-key' }, async ocr => {
  let seen = null;
  await ocr.extractInvoice(FILE, {}, {
    fetch: async (url, init) => {
      seen = { url, init };
      return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: '{"invoice":{},"items":[]}' }] } }] }) };
    }
  });

  assert.ok(!seen.url.includes('secret-key'), 'the API key must not appear in the URL');
  assert.equal(seen.init.headers['x-goog-api-key'], 'secret-key');
}));

test('asks for deterministic structured JSON and sends the file inline', () => withEnv({ GEMINI_API_KEY: 'k' }, async ocr => {
  let body = null;
  await ocr.extractInvoice(FILE, { vendor_name: 'Sample Wholesale' }, {
    fetch: async (_url, init) => {
      body = JSON.parse(init.body);
      return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: '{"invoice":{},"items":[]}' }] } }] }) };
    }
  });

  assert.equal(body.generationConfig.temperature, 0, 'transcription must not be creative');
  assert.equal(body.generationConfig.response_mime_type, 'application/json');
  assert.ok(body.generationConfig.response_schema, 'a response schema is declared');
  const parts = body.contents[0].parts;
  assert.match(parts[0].text, /Never invent a UPC/);
  assert.match(parts[0].text, /Sample Wholesale/, 'the stated vendor is passed as a hint');
  assert.equal(parts[1].inline_data.mime_type, 'application/pdf');
  assert.equal(Buffer.from(parts[1].inline_data.data, 'base64').toString(), '%PDF-1.4 sample invoice');
}));

// ── Gemini response handling ─────────────────────────────────────────────────

test('normalizes a well-formed extraction', () => withEnv({ GEMINI_API_KEY: 'k' }, async ocr => {
  const result = await ocr.extractInvoice(FILE, {}, {
    fetch: geminiReply({
      invoice: { vendor_name: 'Sample Wholesale', invoice_number: 'S-1', subtotal: 96 },
      items: [{ line_number: 1, upc: '0-74471-00050-0', description: 'Coffee', cases: 2, units: 12, total: 96, confidence: 0.97 }]
    })
  });
  assert.equal(result.invoice.subtotal, 96);
  assert.equal(result.items[0].upc, '0744710005 00'.replace(/\s/g, ''), 'UPC separators stripped, zeros kept');
  assert.equal(result.items[0].cases, 2);
  assert.equal(result._provider, 'gemini');
  assert.equal(result._model, 'gemini-2.5-flash');
}));

test("carries the model's own uncertainty note onto the line for the reviewer", () => withEnv({ GEMINI_API_KEY: 'k' }, async ocr => {
  const result = await ocr.extractInvoice(FILE, {}, {
    fetch: geminiReply({ invoice: {}, items: [{ line_number: 1, description: 'Smudged', total: 10, confidence: 0.4, note: 'handwritten, quantity unclear' }] })
  });
  assert.equal(result.items[0].review_reason, 'handwritten, quantity unclear');
  assert.equal(result.items[0].confidence, 0.4);
}));

test('coerces junk field types instead of crashing the pipeline', () => withEnv({ GEMINI_API_KEY: 'k' }, async ocr => {
  const result = await ocr.extractInvoice(FILE, {}, {
    fetch: geminiReply({ invoice: { subtotal: 'not a number' }, items: [{ description: 'X', total: 'oops', confidence: 5 }] })
  });
  assert.equal(result.invoice.subtotal, 0);
  assert.equal(result.items[0].total, 0);
  assert.equal(result.items[0].confidence, 1, 'confidence is clamped into 0..1');
  assert.equal(result.items[0].line_number, 1, 'a missing line number falls back to position');
}));

test('explains a free-tier rate limit in words the scanner can act on', () => withEnv({ GEMINI_API_KEY: 'k' }, async ocr => {
  await assert.rejects(
    () => ocr.extractInvoice(FILE, {}, {
      fetch: async () => ({ ok: false, status: 429, json: async () => ({ error: { message: 'Quota exceeded' } }) })
    }),
    /rate limit reached/
  );
}));

test('surfaces a refusal or truncated response rather than returning empty lines', () => withEnv({ GEMINI_API_KEY: 'k' }, async ocr => {
  await assert.rejects(
    () => ocr.extractInvoice(FILE, {}, {
      fetch: async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ finishReason: 'SAFETY' }] }) })
    }),
    /no content \(SAFETY\)/
  );
}));

test('rejects non-JSON output instead of guessing at it', () => withEnv({ GEMINI_API_KEY: 'k' }, async ocr => {
  await assert.rejects(
    () => ocr.extractInvoice(FILE, {}, {
      fetch: async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: 'Here is your invoice!' }] } }] }) })
    }),
    /not valid JSON/
  );
}));

// ── Webhook fallback ─────────────────────────────────────────────────────────

test('the webhook fallback posts multipart and honours its bearer token', () => withEnv(
  { PRICING_OCR_WEBHOOK_URL: 'https://ocr.test/extract', PRICING_OCR_WEBHOOK_TOKEN: 'tok' },
  async ocr => {
    let seen = null;
    const result = await ocr.extractInvoice(FILE, { vendor_name: 'V' }, {
      fetch: async (url, init) => {
        seen = { url, init };
        return { ok: true, status: 200, json: async () => ({ invoice: { subtotal: 10 }, items: [] }) };
      }
    });
    assert.equal(seen.url, 'https://ocr.test/extract');
    assert.equal(seen.init.headers.Authorization, 'Bearer tok');
    assert.ok(seen.init.body instanceof FormData);
    assert.equal(result._provider, 'webhook');
    assert.equal(result.invoice.subtotal, 10);
  }
));
