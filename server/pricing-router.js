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

const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MANAGER_ROLES = new Set(['manager', 'admin']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, ALLOWED_TYPES.has(file.mimetype))
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
  const ocrUrl = process.env.PRICING_OCR_WEBHOOK_URL || '';
  const ocrToken = process.env.PRICING_OCR_WEBHOOK_TOKEN || '';

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
    ocrConfigured: Boolean(ocrUrl),
    storeConfigured: Boolean(store),
    localDemo,
    maxUploadMb: MAX_UPLOAD_BYTES / (1024 * 1024),
    acceptedTypes: [...ALLOWED_TYPES]
  }));

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
      const hash = sha256(req.file.buffer);
      const existing = await store.findInvoiceByHash(hash);
      if (existing) {
        return res.json({ invoice: existing, duplicate: true, lines: await store.listInvoiceLines(existing.id) });
      }

      const objectPath = await store.putInvoiceObject(hash, req.file.buffer, req.file.mimetype);
      const invoice = await store.createInvoice({
        vendor_id: req.body.vendor_id || null,
        invoice_number: req.body.invoice_number || null,
        invoice_date: req.body.invoice_date || null,
        source_object_path: objectPath,
        source_sha256: hash,
        status: ocrUrl ? 'extracting' : 'uploaded'
      });

      if (!ocrUrl) {
        return res.status(202).json({
          invoice,
          lines: [],
          warning: 'Stored privately, but OCR is not configured so no lines were extracted.',
          code: 'OCR_NOT_CONFIGURED'
        });
      }

      const extracted = await callOcr(req.file, req.body);
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
      // Without this the approval gate has nothing to reconcile against and
      // would wave through an invoice whose lines do not add up.
      const reconciled = await store.updateInvoice(invoice.id, {
        invoice_subtotal: priced.reconciliation.invoice_subtotal,
        extracted_line_sum: priced.reconciliation.extracted_line_sum,
        reconciliation_variance: priced.reconciliation.variance,
        line_count: lines.length,
        status: 'needs_review'
      });

      return res.json({ invoice: reconciled || invoice, lines, reconciliation: priced.reconciliation });
    } catch (error) {
      return fail(res, error, 'invoice intake');
    }
  });

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

  // ── Legacy path kept for the existing Hermes integration ───────────────────
  router.post('/invoices/extract', limitWrites, authorize('manager'), upload.single('invoice'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'A supported PDF or image invoice is required' });
    if (!ocrUrl) return res.status(503).json({ error: 'OCR is not configured', code: 'OCR_NOT_CONFIGURED' });
    try {
      return res.json(priceInvoice(await callOcr(req.file, req.body)));
    } catch (error) {
      console.error('Pricing OCR failed:', error.message);
      return res.status(502).json({ error: 'Invoice extraction failed', detail: error.message });
    }
  });

  async function callOcr(file, fields) {
    const body = new FormData();
    body.append('invoice', new Blob([file.buffer], { type: file.mimetype }), file.originalname);
    body.append('vendor_name', fields.vendor_name || '');
    body.append('invoice_number', fields.invoice_number || '');
    const headers = ocrToken ? { Authorization: `Bearer ${ocrToken}` } : {};
    const response = await fetchImpl(ocrUrl, { method: 'POST', headers, body, signal: AbortSignal.timeout(45000) });
    if (!response.ok) throw new Error(`OCR service returned HTTP ${response.status}`);
    return response.json();
  }

  router.use((error, _req, res, next) => {
    if (error instanceof multer.MulterError) return res.status(400).json({ error: error.message });
    if (error) return res.status(400).json({ error: 'Unsupported invoice file' });
    return next();
  });

  return router;
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
