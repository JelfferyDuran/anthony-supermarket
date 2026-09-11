'use strict';

// Tests for the invoice extraction adapter. No network: the Gemini and webhook
// calls are driven through an injected fetch, so the request shape and the
// response handling are both asserted without a key or a live service.

const test = require('node:test');
const assert = require('node:assert/strict');

const ENV_KEYS = ['GEMINI_API_KEY', 'GEMINI_MODEL', 'PRICING_OCR_WEBHOOK_URL', 'PRICING_OCR_WEBHOOK_TOKEN', 'PRICING_PADDLE_URL'];

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

// An explicitly configured webhook URL is an operator decision about which
// reader to use, so it takes precedence over the built-in direct call.
test('a configured webhook wins over the in-process Gemini path', () => withEnv({ GEMINI_API_KEY: 'k', PRICING_OCR_WEBHOOK_URL: 'https://ocr.test/x' }, async ocr => {
  assert.equal(ocr.activeProvider(), 'webhook');
  let calledUrl = null;
  await ocr.extractInvoice(FILE, {}, {
    fetch: async (url) => { calledUrl = url; return { ok: true, status: 200, json: async () => ({ invoice: {}, items: [] }) }; }
  });
  assert.equal(calledUrl, 'https://ocr.test/x', 'the webhook was called, not Gemini');
}));

test('extraction refuses with a recognisable code when unconfigured', () => withEnv({}, async ocr => {
  await assert.rejects(() => ocr.extractInvoice(FILE), error => error.code === 'OCR_NOT_CONFIGURED');
}));

// ── PaddleOCR (local, opt-in) ────────────────────────────────────────────────

// The container on :8120 is the private choice, but it is a choice: an unset
// URL must not make every deployment advertise a reader it is not running.
test('PaddleOCR is opt-in, not assumed from a default URL', () => withEnv({}, ocr => {
  assert.equal(ocr.isPaddleConfigured(), false);
  assert.equal(ocr.isConfigured(), false);
  assert.equal(ocr.activeProvider(), null);
}));

test('configuring the local container makes PaddleOCR the preferred reader', () => withEnv({ PRICING_PADDLE_URL: 'http://localhost:8120/' }, ocr => {
  assert.equal(ocr.isConfigured(), true);
  assert.equal(ocr.activeProvider(), 'paddle', 'and it outranks Gemini');
}));

test('a bare flag resolves to the container on its standard port', () => withEnv({ PRICING_PADDLE_URL: '1' }, async ocr => {
  let calledUrl = null;
  await ocr.extractInvoice(FILE, {}, {
    fetch: async (url) => {
      calledUrl = url;
      return { ok: true, status: 200, json: async () => ({ lines: [{ text: 'Widget 3.99', score: 0.99, box: [[0, 0], [10, 0], [10, 10], [0, 10]] }] }) };
    }
  });
  assert.equal(calledUrl, 'http://localhost:8120/ocr/b64');
}));

// The bug this guards: with no trailer, a stopped container used to fail the
// whole scan even though a working key was configured.
test('a dead PaddleOCR container falls through to Gemini instead of failing the scan', () => withEnv(
  { PRICING_PADDLE_URL: 'http://localhost:8120', GEMINI_API_KEY: 'k' },
  async ocr => {
    const result = await ocr.extractInvoice(FILE, {}, {
      fetch: async (url) => {
        if (String(url).includes('8120')) throw new Error('connect ECONNREFUSED 127.0.0.1:8120');
        return { ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: '{"invoice":{},"items":[]}' }] } }] }) };
      }
    });
    assert.equal(result._provider, 'gemini', 'the scan was still read');
    assert.equal(result._fallback_from, 'paddle');
    assert.match(result._fallback_reason, /ECONNREFUSED/);
  }
));

test('a PaddleOCR HTTP error is reported, not swallowed, when it is the only reader', () => withEnv(
  { PRICING_PADDLE_URL: 'http://localhost:8120' },
  async ocr => {
    await assert.rejects(
      () => ocr.extractInvoice(FILE, {}, {
        fetch: async () => ({ ok: false, status: 500, json: async () => ({}) })
      }),
      error => error.code === 'OCR_PROVIDER_FAILED' && error.provider === 'paddle' && /HTTP 500/.test(error.message)
    );
  }
));

test('when every configured reader fails, the error names each one', () => withEnv(
  { PRICING_PADDLE_URL: 'http://localhost:8120', GEMINI_API_KEY: 'k' },
  async ocr => {
    await assert.rejects(
      () => ocr.extractInvoice(FILE, {}, { fetch: async () => { throw new Error('offline'); } }),
      error => error.code === 'OCR_ALL_PROVIDERS_FAILED'
        && /paddle: offline/.test(error.message)
        && /gemini: offline/.test(error.message)
        && error.failures.length === 2
    );
  }
));

test('the probe reports reachability without throwing', () => withEnv({ PRICING_PADDLE_URL: 'http://localhost:8120' }, async ocr => {
  const down = await ocr.probePaddle(async () => { throw new Error('ECONNREFUSED'); });
  assert.equal(down.ok, false);
  assert.match(down.reason, /ECONNREFUSED/);
  // The service has no guaranteed root route, so any answer proves it is up.
  const up = await ocr.probePaddle(async () => ({ ok: true, status: 404 }));
  assert.equal(up.ok, true);
}));

test('the probe says so plainly when PaddleOCR was never chosen', () => withEnv({}, async ocr => {
  const result = await ocr.probePaddle(async () => ({ ok: true }));
  assert.deepEqual(result, { ok: false, reason: 'not configured' });
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
