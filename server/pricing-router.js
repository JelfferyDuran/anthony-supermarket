'use strict';

// HTTP surface for the invoice pricing pipeline.
//
// Everything that can change a price lives behind this router, and this router
// is the only path the browser has to the pricing tables. The Pricing Hub holds
// no Supabase credentials of its own: it reads through these endpoints and
// writes through them, which is what keeps pricing server-authoritative.
//
// Identity comes in three flavours and they are NOT interchangeable:
//   * Supabase session JWT with a manager/admin role — the only identity that
//     may APPROVE, because an approval must be attributable to a real person.
//   * PRICING_MANAGER_TOKEN — a server-to-server operator token. It can read and
//     extract, but it cannot approve: there is no auth.users row to record.
//   * PRICING_AGENT_KEY — Hermes. Calculator only. It never reaches a write.

const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const {
  HUB_PREVIEW_MARKUP_PCT,
  MAX_RECONCILIATION_VARIANCE,
  RETAIL_MULTIPLIER,
  approvalReadiness,
  priceInvoice,
  retailFromUnitCost,
  roundMoney,
  suggestedRetail,
  unitCostFromCase
} = require('./pricing-engine');
const { createPricingStore, isConfigured, sha256 } = require('./pricing-store');
const { matchProducts, parsePosCsv } = require('./pos-import');
const ocr = require('./pricing-ocr');
const intake = require('./pricing-intake');

const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const POS_TYPES = new Set(['text/csv', 'application/vnd.ms-excel', 'text/plain', 'application/csv', 'application/octet-stream']);
const MAX_POS_BYTES = 20 * 1024 * 1024;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MANAGER_ROLES = new Set(['manager', 'admin']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, ALLOWED_TYPES.has(file.mimetype))
});

// POS exports are plain CSV. Browsers and OSes label them inconsistently, so the
// type check is permissive and the parser is the real gate: a file it cannot
// understand is rejected with the header it saw.
const posUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_POS_BYTES, files: 1 },
  fileFilter: (_req, file, callback) =>
    callback(null, POS_TYPES.has(file.mimetype) || /\.csv$/i.test(file.originalname || ''))
});

function timingSafeEqualText(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  if (!a.length || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function bearerToken(req) {
  return String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
}

// Modest in-process rate limit on the mutation paths. Externally reachable write
// endpoints must not be free to hammer.
function createRateLimiter({ windowMs = 60_000, max = 30 } = {}) {
  const hits = new Map();
  return (req, res, next) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const bucket = (hits.get(key) || []).filter(time => now - time < windowMs);
    if (bucket.length >= max) {
      return res.status(429).json({ error: 'Too many pricing requests; slow down.' });
    }
    bucket.push(now);
    hits.set(key, bucket);
    if (hits.size > 5000) hits.clear();
    return next();
  };
}

function createPricingRouter(options = {}) {
  const router = express.Router();
  const store = options.store !== undefined ? options.store : (isConfigured() ? createPricingStore() : null);
  const verifyUser = options.verifyUser || defaultVerifyUser;
  const fetchImpl = options.fetch || globalThis.fetch;

  const managerToken = process.env.PRICING_MANAGER_TOKEN || '';
  const agentKey = process.env.PRICING_AGENT_KEY || '';

  // Local demo access is only ever granted outside production AND only when no
  // credential is configured at all, so a misconfigured production box fails
  // closed rather than open.
  const localDemo = process.env.NODE_ENV !== 'production' && !managerToken && !agentKey;

  const limitWrites = createRateLimiter({ windowMs: 60_000, max: 30 });

  // Resolves the caller to an identity, or null. `mode` is the least privilege
  // the route needs: 'calculate' | 'manager' | 'approver'.
  async function resolveIdentity(req, mode) {
    const token = bearerToken(req);

    if (mode === 'calculate' && agentKey && timingSafeEqualText(req.headers['x-pricing-agent-key'], agentKey)) {
      return { kind: 'agent', userId: null };
    }
    if (token && managerToken && timingSafeEqualText(token, managerToken)) {
      return { kind: 'operator', userId: null };
    }
    if (token) {
      const user = await verifyUser(token).catch(() => null);
      if (user && MANAGER_ROLES.has(user.role)) {
        return { kind: 'manager', userId: user.id, email: user.email };
      }
    }
    if (localDemo) return { kind: 'local-demo', userId: null };
    return null;
  }

  const authorize = mode => async (req, res, next) => {
    let identity;
    try {
      identity = await resolveIdentity(req, mode);
    } catch (error) {
      console.error('Pricing auth check failed:', error.message);
      return res.status(503).json({ error: 'Pricing authentication is unavailable' });
    }
    if (!identity) {
      const configured = managerToken || agentKey || isConfigured();
      return res.status(configured ? 401 : 503).json({
        error: configured ? 'Not authorized for pricing' : 'Pricing authentication is not configured'
      });
    }
    // Approving writes a price and must name a person. A shared operator token
    // or the local demo identity is deliberately not enough.
    if (mode === 'approver' && !identity.userId) {
      return res.status(403).json({
        error: 'Approving a price requires a signed-in manager or admin account',
        code: 'APPROVER_IDENTITY_REQUIRED'
      });
    }
    req.pricingIdentity = identity;
    return next();
  };

  function requireStore(res) {
    if (!store) {
      res.status(503).json({ error: 'Pricing database is not configured', code: 'STORE_NOT_CONFIGURED' });
      return false;
    }
    return true;
  }

  function fail(res, error, action) {
    console.error(`Pricing ${action} failed:`, error.message);
    return res.status(400).json({ error: error.message });
  }

  // ── Capability probe ───────────────────────────────────────────────────────
  router.get('/config', (_req, res) => res.json({
    multiplier: RETAIL_MULTIPLIER,
    hubPreviewMarkupPct: HUB_PREVIEW_MARKUP_PCT,
    reconciliationTolerance: MAX_RECONCILIATION_VARIANCE,
    ocrConfigured: ocr.isConfigured(),
    ocrProvider: ocr.activeProvider(),
    storeConfigured: Boolean(store),
    localDemo,
    maxUploadMb: MAX_UPLOAD_BYTES / (1024 * 1024),
    acceptedTypes: [...ALLOWED_TYPES]
  }));

  // ── Manager sign-in for the hub UI ─────────────────────────────────────────
  // Exchanges email/password for a Supabase session token the browser stores
  // locally and sends as Bearer. Only sign-in is exposed here — the token is
  // verified by Supabase Auth on every subsequent call (defaultVerifyUser).
  router.post('/login', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    try {
      const { getClient } = require('./pricing-store');
      const { data, error } = await getClient().auth.signInWithPassword({ email, password });
      if (error || !data.session) return res.status(401).json({ error: 'invalid credentials' });
      return res.json({
        token: data.session.access_token,
        email: data.user.email,
        role: (data.user.app_metadata && data.user.app_metadata.role) || ''
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  });

  // ── Calculator (no writes, no database) ────────────────────────────────────
  router.post('/calculate', authorize('calculate'), (req, res) => {
    try {
      const unitCost = req.body.lineTotal != null ? unitCostFromCase(req.body) : Number(req.body.unitCost);
      const markupPct = req.body.markupPct != null ? Number(req.body.markupPct) : HUB_PREVIEW_MARKUP_PCT;
      return res.json({
        unitCost,
        retailPrice: retailFromUnitCost(unitCost),
        shelfPrice: suggestedRetail(unitCost, markupPct),
        multiplier: RETAIL_MULTIPLIER,
        markupPct
      });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  });

  // ── Catalog reads for the hub ──────────────────────────────────────────────
  router.get('/products', authorize('manager'), async (_req, res) => {
    if (!requireStore(res)) return;
    try {
      return res.json({ products: await store.listProducts() });
    } catch (error) {
      return fail(res, error, 'product listing');
    }
  });

  router.get('/products/:id/history', authorize('manager'), async (req, res) => {
    if (!requireStore(res)) return;
    try {
      return res.json({ history: await store.listPriceHistory(req.params.id) });
    } catch (error) {
      return fail(res, error, 'history listing');
    }
  });

  // ── Authoritative retail edit ──────────────────────────────────────────────
  // This is where the hub's per-item price edit lands. The browser proposes; the
  // database function decides whether the write is legal.
  router.patch('/products/:id/retail', limitWrites, authorize('approver'), async (req, res) => {
    if (!requireStore(res)) return;
    const retailPrice = roundMoney(Number(req.body.retailPrice));
    if (!Number.isFinite(retailPrice) || retailPrice < 0) {
      return res.status(400).json({ error: 'retailPrice must be zero or greater' });
    }
    try {
      const product = await store.setProductRetail({
        productId: req.params.id,
        retailPrice,
        approvedBy: req.pricingIdentity.userId,
        reason: req.body.reason || 'Pricing Hub manual edit'
      });
      return res.json({ product });
    } catch (error) {
      return fail(res, error, 'retail update');
    }
  });

  // ── Review queue ───────────────────────────────────────────────────────────
  router.get('/queue', authorize('manager'), async (_req, res) => {
    if (!requireStore(res)) return;
    try {
      return res.json({ lines: await store.listReviewQueue() });
    } catch (error) {
      return fail(res, error, 'queue listing');
    }
  });

  // ── Invoice intake ─────────────────────────────────────────────────────────
  // Upload -> SHA-256 -> private storage -> OCR -> priced lines land needs_review.
  // A duplicate scan short-circuits on the hash instead of creating a second
  // invoice, so a double-tap on the upload button is harmless.
  router.post('/invoices', limitWrites, authorize('manager'), upload.single('invoice'), async (req, res) => {
    if (!requireStore(res)) return;
    if (!req.file) return res.status(400).json({ error: 'A supported PDF or image invoice is required' });

    try {
      const result = await ingestInvoice(req.file, req.body, { channel: 'hub' });
      if (result.duplicate) {
        return res.json({ invoice: result.invoice, duplicate: true, lines: result.lines });
      }
      if (result.code === 'OCR_NOT_CONFIGURED') {
        return res.status(202).json({
          invoice: result.invoice,
          lines: [],
          warning: 'Stored privately, but OCR is not configured so no lines were extracted.',
          code: 'OCR_NOT_CONFIGURED'
        });
      }
      return res.json({ invoice: result.invoice, lines: result.lines, reconciliation: result.reconciliation });
    } catch (error) {
      return fail(res, error, 'invoice intake');
    }
  });

  // The one path a scan takes, whichever channel it arrived on. Hub uploads and
  // chat submissions MUST share this: two code paths would eventually disagree
  // about what gets stored, deduped, or sent to review.
  async function ingestInvoice(file, fields = {}, context = {}) {
    const hash = sha256(file.buffer);
    const existing = await store.findInvoiceByHash(hash);
    if (existing) {
      return { invoice: existing, duplicate: true, lines: await store.listInvoiceLines(existing.id) };
    }

    // The scan is stored BEFORE extraction is attempted, so a reader outage
    // never loses the document — the lines can be entered by hand instead.
    const objectPath = await store.putInvoiceObject(hash, file.buffer, file.mimetype);
    const invoice = await store.createInvoice({
      vendor_id: fields.vendor_id || null,
      invoice_number: fields.invoice_number || null,
      invoice_date: fields.invoice_date || null,
      source_object_path: objectPath,
      source_sha256: hash,
      source_channel: context.channel || 'hub',
      source_sender_ref: context.senderRef || null,
      status: ocr.isConfigured() ? 'extracting' : 'uploaded'
    });

    if (!ocr.isConfigured()) {
      return { invoice, lines: [], code: 'OCR_NOT_CONFIGURED' };
    }

    const extracted = await callOcr(file, fields);
    const priced = priceInvoice(extracted);
    const lines = await store.replaceInvoiceLines(invoice.id, priced.items.map(item => ({
      line_number: item.line_number,
      raw_text: item.description,
      vendor_sku: item.vendor_sku || null,
      extracted_upc: item.upc || null,
      extracted_description: item.description,
      case_quantity: item.case_quantity || null,
      units_per_case: item.units_per_case || null,
      line_total: item.line_total,
      calculated_unit_cost: item.unit_cost,
      proposed_retail_price: item.final_retail_price,
      ocr_confidence: item.ocr_confidence,
      // OCR never matches a product. Matching is a separate, evidence-based step.
      matched_product_id: null,
      match_method: 'ocr',
      review_status: 'needs_review',
      review_reason: item.review_reason || null
    })));

    // Persist the invoice's own stated subtotal alongside the extracted sum.
    // Without this the approval gate has nothing to reconcile against and would
    // wave through an invoice whose lines do not add up.
    const reconciled = await store.updateInvoice(invoice.id, {
      invoice_subtotal: priced.reconciliation.invoice_subtotal,
      extracted_line_sum: priced.reconciliation.extracted_line_sum,
      reconciliation_variance: priced.reconciliation.variance,
      line_count: lines.length,
      status: 'needs_review'
    });

    return { invoice: reconciled || invoice, lines, reconciliation: priced.reconciliation };
  }

  // Short-lived signed link to the source scan for the review UI.
  router.get('/invoices/:id/source', authorize('manager'), async (req, res) => {
    if (!requireStore(res)) return;
    try {
      const invoice = await store.getInvoice(req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      if (!invoice.source_object_path) {
        return res.status(404).json({ error: 'This invoice was backfilled from the hub and has no scan on file' });
      }
      return res.json({ url: await store.signInvoiceObject(invoice.source_object_path), expiresInSeconds: 300 });
    } catch (error) {
      return fail(res, error, 'source signing');
    }
  });

  // ── Approval ───────────────────────────────────────────────────────────────
  // The blocking gate runs here for a clear error message, and again inside the
  // database transaction, which is what actually enforces it.
  router.post('/invoices/:id/approve', limitWrites, authorize('approver'), async (req, res) => {
    if (!requireStore(res)) return;
    const lines = Array.isArray(req.body.lines) ? req.body.lines : [];
    if (!lines.length) return res.status(400).json({ error: 'At least one reviewed line is required' });

    try {
      const invoice = await store.getInvoice(req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

      // An invoice that already imported is done. Re-submitting it is a no-op,
      // not a validation error — a reviewer double-tapping Approve, or a retried
      // request, must not surface as a failure.
      if (invoice.status === 'imported') {
        return res.json({ result: { invoice_id: invoice.id, status: 'imported', applied: 0, already_imported: true } });
      }

      const { blockers } = approvalReadiness({ invoiceSubtotal: invoice.invoice_subtotal, lines });
      if (blockers.length) {
        return res.status(422).json({ error: 'Invoice is not ready to approve', blockers });
      }

      const result = await store.approveInvoice({
        invoiceId: req.params.id,
        approvedBy: req.pricingIdentity.userId,
        lines
      });
      return res.json({ result });
    } catch (error) {
      return fail(res, error, 'invoice approval');
    }
  });

  // ── Price-gun / label export ───────────────────────────────────────────────
  router.get('/export/labels', authorize('manager'), async (req, res) => {
    if (!requireStore(res)) return;
    try {
      const rows = await store.listLabelRows(req.query.invoiceId || null);
      const csv = ['item_name,upc,price,department']
        .concat(rows.map(row => [row.item_name, row.upc, Number(row.price).toFixed(2), row.department].map(csvCell).join(',')))
        .join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="price-gun-labels.csv"');
      return res.send(csv);
    } catch (error) {
      return fail(res, error, 'label export');
    }
  });

  // ── Chat-channel intake (Telegram / WhatsApp) ──────────────────────────────
  // The owner may send a scan straight from chat. It lands in the SAME queue as
  // a hub upload and is subject to the same rule: arriving is evidence, not
  // approval. Authorisation is the channel's own allowlist — a chat sender is
  // never a Supabase identity, so this route cannot approve anything, only
  // deposit a scan for a manager to review.
  router.post('/intake/:channel', limitWrites, upload.single('invoice'), async (req, res) => {
    if (!requireStore(res)) return;

    const channel = String(req.params.channel || '').toLowerCase();
    const sender = req.body.sender || req.headers['x-intake-sender'] || '';

    // The shared secret proves the request came from the bot bridge rather than
    // from anyone who guessed the URL. The allowlist then proves WHICH sender.
    const bridgeKey = process.env.PRICING_INTAKE_BRIDGE_KEY || '';
    if (!bridgeKey || !timingSafeEqualText(req.headers['x-intake-bridge-key'], bridgeKey)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const check = intake.validateSubmission({ channel, sender, file: req.file });
    if (!check.ok) {
      console.warn(`Pricing intake refused (${check.code}) on channel ${channel}`);
      return res.status(check.status).json({ error: check.error, code: check.code });
    }

    try {
      const result = await ingestInvoice(req.file, {
        vendor_name: req.body.vendor_name,
        invoice_number: req.body.invoice_number,
        invoice_date: req.body.invoice_date
      }, {
        channel,
        // The sender's identity is reduced to a fingerprint: the pipeline needs
        // to know the channel and that it is the same sender, not the number.
        senderRef: intake.senderFingerprint(channel, sender)
      });

      return res.json({
        ok: true,
        duplicate: Boolean(result.duplicate),
        invoice_id: result.invoice.id,
        lines: (result.lines || []).length,
        // Wording the bridge can relay verbatim without overstating what happened.
        message: intake.acknowledgement({
          lineCount: (result.lines || []).length,
          duplicate: Boolean(result.duplicate),
          invoiceNumber: result.invoice.invoice_number,
          ocrConfigured: ocr.isConfigured()
        })
      });
    } catch (error) {
      return fail(res, error, 'chat intake');
    }
  });

  // ── POS sales import ───────────────────────────────────────────────────────
  // NRS exports CSV only, so sales arrive as periodic uploads. The batch hash
  // makes a re-upload of the same export a no-op instead of double-counting a
  // day's sales — which matters because the daily fetch job and a manual drop
  // can both deliver the same file.
  router.post('/pos/import', limitWrites, authorize('approver'), posUpload.single('sales'), async (req, res) => {
    if (!requireStore(res)) return;
    if (!req.file) return res.status(400).json({ error: 'A POS sales CSV export is required' });

    try {
      const hash = sha256(req.file.buffer);
      const existing = await store.findPosBatchByHash(hash);
      if (existing) {
        return res.json({ batch: existing, duplicate: true });
      }

      let parsed;
      try {
        parsed = parsePosCsv(req.file.buffer.toString('utf8'), { fallbackDate: req.body.sale_date || null });
      } catch (error) {
        // A format the parser cannot read must not become revenue. Report what
        // it saw so a changed NRS export is diagnosable rather than mysterious.
        return res.status(422).json({ error: error.message, code: 'POS_FORMAT_UNRECOGNIZED' });
      }

      if (!parsed.rows.length) {
        return res.status(422).json({
          error: 'No sales rows could be read from this export',
          code: 'POS_NO_ROWS',
          skipped: parsed.skipped.slice(0, 20),
          summary: parsed.summary
        });
      }

      const products = await store.listProducts();
      const match = matchProducts(parsed.rows, products);

      const batch = await store.createPosBatch({
        filename: req.file.originalname || null,
        source_sha256: hash,
        period_start: parsed.summary.period_start,
        period_end: parsed.summary.period_end,
        row_count: parsed.summary.row_count,
        imported_count: parsed.rows.length,
        matched_count: match.matched,
        gross_sales: parsed.summary.gross_sales,
        void_total: parsed.summary.void_total,
        refund_total: parsed.summary.refund_total,
        imported_by: req.pricingIdentity.userId
      });
      await store.insertPosSales(batch.id, parsed.rows);

      return res.json({
        batch,
        summary: parsed.summary,
        matched: match.matched,
        unmatched: match.unmatched,
        skipped: parsed.skipped.slice(0, 20)
      });
    } catch (error) {
      return fail(res, error, 'POS import');
    }
  });

  router.get('/pos/batches', authorize('manager'), async (_req, res) => {
    if (!requireStore(res)) return;
    try {
      return res.json({ batches: await store.listPosBatches() });
    } catch (error) {
      return fail(res, error, 'POS batch listing');
    }
  });

  // ── Financials ─────────────────────────────────────────────────────────────
  // One call assembles the dashboard so the browser makes a single request and
  // every panel describes the same period.
  router.get('/financials', authorize('manager'), async (req, res) => {
    if (!requireStore(res)) return;
    const from = normalizeDate(req.query.from);
    const to = normalizeDate(req.query.to);
    const dimension = ['item', 'category', 'vendor'].includes(req.query.dimension) ? req.query.dimension : 'category';

    try {
      const [summary, vendorSpend, aging, margin, alerts] = await Promise.all([
        store.pnlSummary(from, to),
        store.vendorSpend(from, to),
        store.invoiceAging(null),
        store.marginBy(dimension, from, to),
        store.priceIncreaseAlerts(Number(req.query.alertDays) || 90)
      ]);
      return res.json({ period: { from, to }, dimension, summary, vendorSpend, aging, margin, alerts });
    } catch (error) {
      return fail(res, error, 'financial report');
    }
  });

  // ── Legacy path kept for the existing Hermes integration ───────────────────
  router.post('/invoices/extract', limitWrites, authorize('manager'), upload.single('invoice'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'A supported PDF or image invoice is required' });
    if (!ocr.isConfigured()) return res.status(503).json({ error: 'OCR is not configured', code: 'OCR_NOT_CONFIGURED' });
    try {
      return res.json(priceInvoice(await callOcr(req.file, req.body)));
    } catch (error) {
      console.error('Pricing OCR failed:', error.message);
      return res.status(502).json({ error: 'Invoice extraction failed', detail: error.message });
    }
  });

  // Provider selection lives in pricing-ocr.js: Gemini when a key is set,
  // otherwise the webhook contract from PR #32.
  async function callOcr(file, fields) {
    return ocr.extractInvoice(file, fields, { fetch: fetchImpl });
  }

  router.use((error, _req, res, next) => {
    if (error instanceof multer.MulterError) return res.status(400).json({ error: error.message });
    if (error) return res.status(400).json({ error: 'Unsupported invoice file' });
    return next();
  });

  return router;
}

// Accepts only an ISO date from a query string; anything else becomes null so a
// malformed parameter narrows nothing rather than erroring deep in SQL.
function normalizeDate(value) {
  const text = String(value == null ? '' : value).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

// Quotes a CSV cell only when it needs it, so the price-gun importer sees clean
// values for the common case.
function csvCell(value) {
  const text = String(value == null ? '' : value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Verifies a Supabase session JWT and extracts the caller's role. Roles live in
// app_metadata, which only the server can set — user_metadata is user-writable
// and must never be trusted for authorization.
async function defaultVerifyUser(token) {
  if (!isConfigured()) return null;
  const { getClient } = require('./pricing-store');
  const { data, error } = await getClient().auth.getUser(token);
  if (error || !data || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email,
    role: data.user.app_metadata && data.user.app_metadata.role
  };
}

module.exports = { createPricingRouter, csvCell };
