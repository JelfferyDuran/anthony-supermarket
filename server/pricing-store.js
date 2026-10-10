'use strict';

// Server-only Supabase access for the pricing pipeline.
//
// This module is the ONLY place a service-role key is read, and it lives behind
// the Node server. It is never bundled for the browser and never handed to the
// Telegram runtime. Browser clients reach this data through the authenticated
// endpoints in pricing-router.js, which is what makes pricing writes
// server-authoritative rather than client-authoritative.

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const INVOICE_BUCKET = process.env.PRICING_INVOICE_BUCKET || 'pricing-invoices';

let cachedClient = null;

function isConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getClient() {
  if (!isConfigured()) return null;
  if (!cachedClient) {
    cachedClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return cachedClient;
}

// Auth calls get their own throwaway client. supabase-js keeps the signed-in
// session on the client instance and then sends it as the Authorization header
// on every later PostgREST request — so signing in on the cached data client
// silently downgrades this process from service_role to `authenticated`, the
// role the pricing migrations revoke. Symptom: one successful login makes every
// later store query fail with "permission denied for table ..." until restart.
function createAuthClient() {
  const key = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!process.env.SUPABASE_URL || !key) return null;
  return createClient(process.env.SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function unwrap(result, action) {
  if (result.error) {
    const error = new Error(`${action} failed: ${result.error.message}`);
    error.cause = result.error;
    throw error;
  }
  return result.data;
}

// A store instance is passed into the router so tests can substitute an
// in-memory double without touching Supabase or the network.
function createPricingStore(client = getClient()) {
  if (!client) return null;

  return {
    bucket: INVOICE_BUCKET,

    async findInvoiceByHash(hash) {
      const rows = unwrap(
        await client.from('pricing_invoices').select('*').eq('source_sha256', hash).limit(1),
        'invoice lookup'
      );
      return rows[0] || null;
    },

    // Uploads the scan to a PRIVATE bucket. The object path is derived from the
    // content hash, so a re-upload of the same scan overwrites itself instead of
    // creating a second copy of the same document.
    async putInvoiceObject(hash, buffer, contentType) {
      const objectPath = `${hash.slice(0, 2)}/${hash}`;
      unwrap(
        await client.storage.from(INVOICE_BUCKET).upload(objectPath, buffer, { contentType, upsert: true }),
        'invoice upload'
      );
      return objectPath;
    },

    // Short-lived signed URL so the review UI can display the source scan
    // without the bucket ever being public.
    async signInvoiceObject(objectPath, expiresInSeconds = 300) {
      const data = unwrap(
        await client.storage.from(INVOICE_BUCKET).createSignedUrl(objectPath, expiresInSeconds),
        'invoice signing'
      );
      return data.signedUrl;
    },

    async createInvoice(record) {
      const rows = unwrap(await client.from('pricing_invoices').insert(record).select(), 'invoice insert');
      return rows[0];
    },

    async replaceInvoiceLines(invoiceId, lines) {
      unwrap(await client.from('pricing_invoice_lines').delete().eq('invoice_id', invoiceId), 'line reset');
      if (!lines.length) return [];
      return unwrap(
        await client.from('pricing_invoice_lines').insert(lines.map(line => ({ ...line, invoice_id: invoiceId }))).select(),
        'line insert'
      );
    },

    async updateInvoice(invoiceId, patch) {
      const rows = unwrap(
        await client.from('pricing_invoices').update(patch).eq('id', invoiceId).select(),
        'invoice update'
      );
      return rows[0] || null;
    },

    async getInvoice(invoiceId) {
      const rows = unwrap(
        await client.from('pricing_invoices').select('*').eq('id', invoiceId).limit(1),
        'invoice fetch'
      );
      return rows[0] || null;
    },

    async listInvoiceLines(invoiceId) {
      return unwrap(
        await client.from('pricing_invoice_lines').select('*').eq('invoice_id', invoiceId).order('line_number'),
        'line fetch'
      );
    },

    // Line exceptions: a manager marks lines rejected (short delivery, damaged,
    // wrong/duplicate line) or reopens them for review. Rejected lines stay on
    // the record but are excluded from approval — the approval RPC's bulk
    // sweep and pending-line check only touch needs_review, so the approved
    // total reconciles against the printed subtotal without them. Reopening
    // clears the manager's note; the OCR flag is not restored (it no longer
    // matters once a human has dispositioned the line).
    async updateLineReviews({ invoiceId, lines, reviewedBy }) {
      const out = [];
      for (const line of lines || []) {
        const status = String(line.review_status || '');
        if (!line.id) throw new Error('line id is required');
        if (!['rejected', 'needs_review'].includes(status)) {
          throw new Error(`line ${line.id}: status must be rejected or needs_review`);
        }
        const note = line.review_note != null ? String(line.review_note).slice(0, 500) : null;
        const patch = status === 'rejected'
          ? {
              review_status: 'rejected',
              review_reason: note || 'Rejected by manager',
              approved_by: reviewedBy || null,
              approved_at: new Date().toISOString()
            }
          : { review_status: 'needs_review', review_reason: null, approved_by: null, approved_at: null };
        const rows = unwrap(
          await client.from('pricing_invoice_lines')
            .update(patch)
            .eq('invoice_id', invoiceId)
            .eq('id', line.id)
            .in('review_status', ['needs_review', 'rejected'])
            .select('id, review_status, review_reason'),
          'line review update'
        );
        if (!rows.length) throw new Error(`line ${line.id}: not found or already approved`);
        out.push(rows[0]);
      }
      return out;
    },

    // Closes an invoice whose lines were all rejected (e.g. the delivery never
    // arrived at all). Refuses when anything is still pending or approved, so
    // a half-reviewed invoice cannot be closed by accident.
    async closeInvoiceAsRejected({ invoiceId, closedBy }) {
      const lines = unwrap(
        await client.from('pricing_invoice_lines').select('id, review_status').eq('invoice_id', invoiceId),
        'line status check'
      );
      if (!lines.length) throw new Error('invoice has no lines to close');
      if (lines.some(l => l.review_status === 'needs_review')) {
        throw new Error('invoice still has lines awaiting review');
      }
      if (lines.some(l => l.review_status === 'approved')) {
        throw new Error('invoice already has approved lines');
      }
      const rows = unwrap(
        await client.from('pricing_invoices')
          .update({ status: 'rejected', approved_by: closedBy || null, approved_at: new Date().toISOString() })
          .eq('id', invoiceId)
          .in('status', ['uploaded', 'extracting', 'needs_review'])
          .select('id, status'),
        'invoice close'
      );
      if (!rows.length) throw new Error('invoice not found or already closed');
      return rows[0];
    },

    // Everything that needs a human decision, newest invoice first.
    async listReviewQueue(limit = 200) {
      return unwrap(
        await client
          .from('pricing_invoice_lines')
          .select('*, pricing_invoices(invoice_number, invoice_date, vendor_id, status, invoice_subtotal)')
          .eq('review_status', 'needs_review')
          .order('invoice_id')
          .order('line_number')
          .limit(limit),
        'review queue fetch'
      );
    },

    async listProducts(limit = 2000) {
      return unwrap(
        await client.from('pricing_products').select('*').eq('active', true).order('name').limit(limit),
        'product fetch'
      );
    },

    async listPriceHistory(productId, limit = 50) {
      return unwrap(
        await client
          .from('pricing_price_history')
          .select('*')
          .eq('product_id', productId)
          .order('changed_at', { ascending: false })
          .limit(limit),
        'price history fetch'
      );
    },

    // Single authoritative retail write. Routed through an RPC so the product
    // update and its immutable history row commit together, and so the check
    // constraints (price at/above cost, approver recorded) run inside the
    // transaction rather than in application code that could be bypassed.
    async setProductRetail({ productId, retailPrice, approvedBy, reason }) {
      const rows = unwrap(
        await client.rpc('pricing_set_product_retail', {
          p_product_id: productId,
          p_retail_price: retailPrice,
          p_approved_by: approvedBy || null,
          p_reason: reason || null
        }),
        'retail update'
      );
      return Array.isArray(rows) ? rows[0] : rows;
    },

    // Catalog UPC assignment. Normalized to digits; EAN-13 with a leading zero
    // collapses to the 12-digit UPC-A. Written by a signed-in approver so the
    // label printer and product matching can trust it.
    async setProductUpc({ productId, upc }) {
      let clean = String(upc || '').replace(/\D/g, '');
      if (clean.length === 13 && clean.startsWith('0')) clean = clean.slice(1);
      if (!/^[0-9]{8}$|^[0-9]{12,14}$/.test(clean)) {
        throw new Error('a valid numeric UPC/EAN/GTIN is required');
      }
      const rows = unwrap(
        await client.from('pricing_products').update({ upc: clean }).eq('id', productId).select('id, upc'),
        'UPC update'
      );
      if (!rows.length) throw new Error('product not found');
      return rows[0];
    },

    // Approval transaction: reviewed lines -> products + immutable history +
    // label batch + invoice marked imported, all or nothing.
    async approveInvoice({ invoiceId, approvedBy, lines }) {
      const rows = unwrap(
        await client.rpc('pricing_approve_invoice', {
          p_invoice_id: invoiceId,
          p_approved_by: approvedBy || null,
          p_lines: lines
        }),
        'invoice approval'
      );
      return Array.isArray(rows) ? rows[0] : rows;
    },

    // ── POS sales import ───────────────────────────────────────────────────
    async findPosBatchByHash(hash) {
      const rows = unwrap(
        await client.from('pos_import_batches').select('*').eq('source_sha256', hash).limit(1),
        'POS batch lookup'
      );
      return rows[0] || null;
    },

    async createPosBatch(record) {
      const rows = unwrap(await client.from('pos_import_batches').insert(record).select(), 'POS batch insert');
      return rows[0];
    },

    async insertPosSales(batchId, rows) {
      if (!rows.length) return 0;
      // Chunked so a large monthly export does not exceed the request limit.
      for (let i = 0; i < rows.length; i += 500) {
        unwrap(
          await client.from('pos_sales').insert(rows.slice(i, i + 500).map(row => ({ ...row, batch_id: batchId }))),
          'POS sales insert'
        );
      }
      return rows.length;
    },

    async listPosBatches(limit = 50) {
      return unwrap(
        await client.from('pos_import_batches').select('*').order('created_at', { ascending: false }).limit(limit),
        'POS batch listing'
      );
    },

    // ── Financial reporting ────────────────────────────────────────────────
    async vendorSpend(from, to) {
      return unwrap(await client.rpc('pricing_vendor_spend', { p_from: from || null, p_to: to || null }), 'vendor spend');
    },

    async invoiceAging(asOf) {
      return unwrap(await client.rpc('pricing_invoice_aging', { p_as_of: asOf || null }), 'invoice aging');
    },

    async marginBy(dimension, from, to) {
      return unwrap(
        await client.rpc('pricing_margin_by', { p_dimension: dimension, p_from: from || null, p_to: to || null }),
        'margin report'
      );
    },

    async pnlSummary(from, to) {
      const data = unwrap(await client.rpc('pricing_pnl_summary', { p_from: from || null, p_to: to || null }), 'P&L summary');
      return Array.isArray(data) ? data[0] : data;
    },

    async priceIncreaseAlerts(sinceDays) {
      return unwrap(await client.rpc('pricing_increase_alerts', { p_since_days: sinceDays }), 'price increase alerts');
    },

    async listLabelRows(invoiceId) {
      return unwrap(
        await client.rpc('pricing_label_rows', { p_invoice_id: invoiceId || null }),
        'label export'
      );
    }
  };
}

module.exports = { INVOICE_BUCKET, createAuthClient, createPricingStore, getClient, isConfigured, sha256 };
