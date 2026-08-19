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

    // Everything that needs a human decision, newest invoice first.
    async listReviewQueue(limit = 200) {
      return unwrap(
        await client
          .from('pricing_invoice_lines')
          .select('*, pricing_invoices(invoice_number, invoice_date, vendor_id, status)')
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

    async listLabelRows(invoiceId) {
      return unwrap(
        await client.rpc('pricing_label_rows', { p_invoice_id: invoiceId || null }),
        'label export'
      );
    }
  };
}

module.exports = { INVOICE_BUCKET, createPricingStore, getClient, isConfigured, sha256 };
