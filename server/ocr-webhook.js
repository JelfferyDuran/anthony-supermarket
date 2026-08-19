#!/usr/bin/env node
/**
 * OCR webhook for the Pricing Hub V2 pipeline (PR #39).
 *
 * Implements the contract expected by `server/pricing-router.js`:
 *   POST /  (multipart: field "invoice" = image/PDF, optional "vendor_name", "invoice_number")
 *   → 200 { invoice:{...}, items:[{line_number, vendor_sku, upc, description,
 *         case_quantity, units_per_case, line_total, ocr_confidence, ...}] }
 *
 * Provider (first available wins):
 *   1. GEMINI_API_KEY        → Google Gemini (direct API, free tier friendly)
 *   2. OPENROUTER_API_KEY    → OpenRouter with a vision model (default google/gemini-2.5-flash)
 * Model override: OCR_MODEL. Optional bearer auth: PRICING_OCR_WEBHOOK_TOKEN.
 * Port: OCR_PORT (default 8799). Zero runtime dependencies (Node >= 20).
 */
const http = require('http');
const crypto = require('crypto');

const PORT = Number(process.env.OCR_PORT || 8799);
const TOKEN = process.env.PRICING_OCR_WEBHOOK_TOKEN || '';
const GEMINI_KEY = process.env.GEMINI_API_KEY || '';
const OR_KEY = process.env.OPENROUTER_API_KEY || '';
const MODEL = process.env.OCR_MODEL || 'google/gemini-2.5-flash';
const MAX_BYTES = 12 * 1024 * 1024;

// ---------------------------------------------------------------------------
// Minimal multipart/form-data parser (single file + text fields)
function parseMultipart(buf, boundary) {
  const parts = [];
  const delim = Buffer.from('--' + boundary);
  let pos = 0;
  while (true) {
    const start = buf.indexOf(delim, pos);
    if (start === -1) break;
    const after = start + delim.length;
    if (buf.subarray(after, after + 2).toString() === '--') break; // closing
    const lineEnd = buf.indexOf('\r\n', after);          // CRLF ending the boundary line
    if (lineEnd === -1) break;
    const headerStart = lineEnd + 2;                     // part headers begin after it
    const headersEnd = buf.indexOf('\r\n\r\n', headerStart);
    if (headersEnd === -1) break;
    const hdr = buf.subarray(headerStart, headersEnd).toString();
    const dataStart = headersEnd + 4;
    let dataEnd = buf.indexOf('\r\n' + delim, dataStart);
    if (dataEnd === -1) dataEnd = buf.length;
    parts.push({ headers: hdr, data: buf.subarray(dataStart, dataEnd) });
    pos = dataEnd + 2;
  }
  const fields = {};
  let file = null;
  for (const p of parts) {
    const nameMatch = /name="([^"]+)"/.exec(p.headers);
    if (!nameMatch) continue;
    const fnameMatch = /filename="([^"]*)"/.exec(p.headers);
    if (fnameMatch) {
      file = { field: nameMatch[1], filename: fnameMatch[1], data: p.data,
               type: /Content-Type:\s*([^\r\n]+)/.exec(p.headers)?.[1]?.trim() || 'application/octet-stream' };
    } else {
      fields[nameMatch[1]] = p.data.toString('utf8');
    }
  }
  return { fields, file };
}

// ---------------------------------------------------------------------------
// Provider calls
async function callGemini(imageB64, mime, extra) {
  const parts = [{ inlineData: { mimeType: mime, data: imageB64 } }];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL.replace(/^[^/]+\//, '')}:generateContent?key=${GEMINI_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: PROMPT(extra) }, ...parts] }],
      generationConfig: { temperature: 0, responseMimeType: 'application/json' },
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const j = await res.json();
  const text = j?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
  return text;
}

async function callOpenRouter(imageB64, mime, extra) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OR_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: [
        { type: 'text', text: PROMPT(extra) },
        { type: 'image_url', image_url: { url: `data:${mime};base64,${imageB64}` } },
      ] }],
      response_format: { type: 'json_object' },
      temperature: 0,
      max_tokens: 4000,
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!res.ok) throw new Error(`OpenRouter HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const j = await res.json();
  return j?.choices?.[0]?.message?.content || '';
}

function PROMPT(extra) {
  return `You are an invoice OCR engine. Transcribe this vendor invoice EXACTLY — do not interpret, correct, or guess.
Return ONLY JSON (no markdown) with this shape:
{
  "invoice": { "vendor_name": "", "invoice_number": "", "invoice_date": "", "terms": "", "subtotal": 0, "tax": 0, "total": 0 },
  "items": [
    { "line_number": 1, "vendor_sku": "", "upc": "", "description": "", "case_quantity": 1,
      "units_per_case": 1, "line_total": 0, "ocr_confidence": 0.9 }
  ]
}
Rules:
- upc: the printed product barcode, as TEXT including leading zeros. Empty string if absent — never invent one.
- vendor_sku: the vendor's item number column. Empty if absent.
- case_quantity: number of cases (qty column).
- units_per_case: the pack size first number (e.g. "24/14 oz" → 24; "8/3pk" → 8; "12/16 ct" → 12).
- line_total: the extended Amount column for that line (qty × unit price when only unit price shown).
- description: verbatim product name including pack notation.
- ocr_confidence: 0.0–1.0 estimate of how legible the line was.
- total: the printed invoice total; 0 if none printed. Handwritten margin math is NOT the total.
- If a value is missing or illegible, leave the field empty — never guess.
${extra.vendor_name ? `The operator provided vendor_name: ${extra.vendor_name}` : ''}
${extra.invoice_number ? `The operator provided invoice_number: ${extra.invoice_number}` : ''}`;
}

// ---------------------------------------------------------------------------
function shapeJson(text) {
  const cleaned = text.replace(/^```(json)?/i, '').replace(/```$/, '').trim();
  try { return JSON.parse(cleaned); } catch (e) {
    const m = /(\{[\s\S]*\})/.exec(cleaned);
    if (m) return JSON.parse(m[1]);
    throw new Error('model did not return JSON');
  }
}

const server = http.createServer(async (req, res) => {
  const send = (code, obj) => {
    res.writeHead(code, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(obj));
  };
  try {
    if (req.method !== 'POST') return send(405, { error: 'POST only' });
    if (TOKEN) {
      const auth = req.headers.authorization || '';
      const expected = 'Bearer ' + TOKEN;
      const ok = auth.length === expected.length && crypto.timingSafeEqual(Buffer.from(auth), Buffer.from(expected));
      if (!ok) return send(401, { error: 'unauthorized' });
    }
    if (!GEMINI_KEY && !OR_KEY) return send(503, { error: 'OCR provider not configured', code: 'OCR_NOT_CONFIGURED' });

    const chunks = [];
    let size = 0;
    for await (const c of req) { chunks.push(c); size += c.length; if (size > MAX_BYTES) return send(413, { error: 'file too large' }); }
    const buf = Buffer.concat(chunks);
    const ct = req.headers['content-type'] || '';
    const bm = /boundary=(?:"([^"]+)"|([^;]+))/.exec(ct);
    if (!bm) return send(400, { error: 'multipart/form-data required' });
    const { fields, file } = parseMultipart(buf, bm[1] || bm[2]);
    if (!file) return send(400, { error: 'missing invoice file field' });

    const b64 = file.data.toString('base64');
    const text = GEMINI_KEY
      ? await callGemini(b64, file.type, fields)
      : await callOpenRouter(b64, file.type, fields);
    const parsed = shapeJson(text);
    const payload = {
      invoice: { vendor_name: parsed.invoice?.vendor_name || fields.vendor_name || '', invoice_number: parsed.invoice?.invoice_number || fields.invoice_number || '', invoice_date: parsed.invoice?.invoice_date || '', terms: parsed.invoice?.terms || '', subtotal: parsed.invoice?.subtotal || 0, tax: parsed.invoice?.tax || 0, total: parsed.invoice?.total || 0 },
      items: Array.isArray(parsed.items) ? parsed.items : [],
      provider: GEMINI_KEY ? 'gemini' : 'openrouter',
      model: MODEL,
    };
    return send(200, payload);
  } catch (e) {
    return send(502, { error: 'OCR extraction failed', detail: String(e.message || e).slice(0, 500) });
  }
});

server.listen(PORT, () => {
  console.log(`pricing-ocr webhook on :${PORT} (provider: ${GEMINI_KEY ? 'gemini' : OR_KEY ? 'openrouter' : 'NONE'}, model: ${MODEL})`);
});
