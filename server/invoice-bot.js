#!/usr/bin/env node
'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// Anthony's Invoice Bot — STANDALONE (no kitchen code)
// ─────────────────────────────────────────────────────────────────────────────
// A dedicated Telegram bot that ONLY handles vendor invoice intake:
//
//   📎 user sends PDF/photo  →  download  →  save to vault RAW_UPLOADS
//                              →  POST to /api/pricing/invoices (dedupe + OCR
//                                 + 70% pricing + needs_review)
//                              →  reply to sender with result
//                              →  sync to Hermes (home channel + queue file)
//
// This bot is intentionally separate from the SuperKitchen ordering bot. The
// kitchen bot lives in index.js (TELEGRAM_TOKEN); THIS bot owns the invoice
// token and its own long-poll loop so the two never collide.
//
// Zero runtime deps: uses Node >= 18 global fetch + long-polling getUpdates.
//
// Env (loaded from server/.env + /opt/data/.env):
//   ANTHONY_INVOICE_BOT_TOKEN  (the BotFather token for @Anthonysinvoicebot)
//   PRICING_TELEGRAM_CHAT_IDS  (allowlist; also HERMES_CHAT_ID is added)
//   PRICING_MANAGER_TOKEN      (to call /api/pricing/invoices)
//   HUB_API                    (default http://127.0.0.1:3401 — VPS host port of anthony-supermarket-server)
//   INVOICE_VAULT_DIR          (RAW_UPLOADS dir; default the Obsidian vault)
//   TELEGRAM_BOT_TOKEN         (KFS bot — used to sync to the home channel)
//   TELEGRAM_HOME_CHANNEL      (where Hermes sync messages are delivered)
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const http = require('http');

// ── Load env (server/.env first, then /opt/data/.env) ─────────────────────
function loadEnv(file) {
  try {
    const txt = fs.readFileSync(file, 'utf8');
    for (const line of txt.split('\n')) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch { /* ignore missing */ }
}
loadEnv(path.join(__dirname, '.env'));
loadEnv('/opt/data/.env');

const TOKEN = process.env.ANTHONY_INVOICE_BOT_TOKEN || process.env.TELEGRAM_TOKEN || '';
const HUB_API = process.env.HUB_API || 'http://127.0.0.1:3401';
const MANAGER_TOKEN = process.env.PRICING_MANAGER_TOKEN || '';
const HOME_CHANNEL = process.env.TELEGRAM_HOME_CHANNEL || '';
const KFS_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''; // for Hermes sync
const SYNC_QUEUE = process.env.INVOICE_SYNC_QUEUE || '/opt/data/hub-branch/nrs/invoice-sync.jsonl';
const VAULT_DIR = process.env.INVOICE_VAULT_DIR ||
  '/opt/data/obsidian-vault-git/06 - Clients & Projects/Anthony_Supermarket_Dashboard/Anthony_SuperApp_Upgraded/ANTHONYS_SUPERMARKET_AI/03_INVOICES/RAW_UPLOADS';
const ALLOWED = new Set(
  [process.env.HERMES_CHAT_ID, ...(process.env.PRICING_TELEGRAM_CHAT_IDS || '').split(',')]
    .map(v => String(v || '').trim()).filter(Boolean)
);
const ALLOWED_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

if (!TOKEN) {
  console.error('✗ ANTHONY_INVOICE_BOT_TOKEN not set — cannot start invoice bot');
  process.exit(1);
}

fs.mkdirSync(path.dirname(SYNC_QUEUE), { recursive: true });
fs.mkdirSync(VAULT_DIR, { recursive: true });

// ── Telegram API helpers (long-poll) ───────────────────────────────────────
const API = `https://api.telegram.org/bot${TOKEN}`;
async function tg(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {})
  });
  const j = await res.json();
  if (!j.ok) throw new Error(`TG ${method}: ${j.description || 'error'}`);
  return j.result;
}
async function sendMsg(chatId, text, extra = {}) {
  return tg('sendMessage', { chat_id: chatId, text, ...extra });
}

// ── File download ───────────────────────────────────────────────────────────
async function downloadFile(fileId) {
  const f = await tg('getFile', { file_id: fileId });
  const url = `${API}/${f.file_path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${f.file_path}: HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ── Vault save (named like the invoice-grabber convention) ─────────────────
function safeName(s) { return String(s || 'invoice').replace(/[^A-Za-z0-9._-]+/g, '_'); }
function vaultPath(filename, buf) {
  // Try to pull vendor + invoice number from filename; fall back to timestamp.
  const m = /^(.+?)[_-]?(\d{4,})\.(pdf|jpg|jpeg|png|webp|heic)$/i.exec(filename);
  const base = m ? `${safeName(m[1])}_${m[2]}` : `Invoice_${Date.now()}`;
  let p = path.join(VAULT_DIR, `${base}.${(m ? m[3] : 'pdf').toLowerCase()}`);
  let i = 1;
  while (fs.existsSync(p)) { p = path.join(VAULT_DIR, `${base}_${i++}.${(m ? m[3] : 'pdf').toLowerCase()}`); }
  return p;
}

// ── Supabase ingest (same path the hub uses) ───────────────────────────────
async function ingestInvoice(buf, filename, mime) {
  const form = new FormData();
  form.append('invoice', new Blob([buf], { type: mime }), filename);
  const res = await fetch(`${HUB_API}/api/pricing/invoices`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${MANAGER_TOKEN}` },
    body: form
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

// ── Hermes sync: home-channel ping + queue line ────────────────────────────
async function syncToHermes(entry) {
  const line = JSON.stringify({ ...entry, ts: new Date().toISOString() });
  try { fs.appendFileSync(SYNC_QUEUE, line + '\n'); } catch (e) { console.error('queue write failed:', e.message); }
  if (KFS_BOT_TOKEN && HOME_CHANNEL) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${KFS_BOT_TOKEN}/sendMessage`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: HOME_CHANNEL, text: entry.hermesMsg, parse_mode: 'Markdown' })
      });
      if (!res.ok) console.error('home sync failed:', await res.text());
    } catch (e) { console.error('home sync error:', e.message); }
  }
}

// ── Process one incoming invoice ───────────────────────────────────────────
async function processInvoice(msg) {
  const chatId = msg.chat.id;
  if (!ALLOWED.has(String(chatId))) {
    console.log(`⛔ unauthorized sender ${chatId} tried to send an invoice`);
    return; // silent — don't confirm the feature exists
  }
  const doc = msg.document;
  const photo = msg.photo && msg.photo.length ? msg.photo[msg.photo.length - 1] : null;
  const fileId = doc ? doc.file_id : (photo ? photo.file_id : null);
  const mime = doc ? doc.mime_type : 'image/jpeg';
  const fname = doc ? (doc.file_name || 'invoice.pdf') : `invoice_${Date.now()}.jpg`;

  if (!fileId) return sendMsg(chatId, '📄 Send a PDF or photo of the vendor invoice.');
  if (doc && !ALLOWED_MIME.has(mime)) return sendMsg(chatId, '⚠️ Unsupported file type. Send a PDF, or JPG/PNG/WEBP photo.');

  const sent = await sendMsg(chatId, '🧾 Invoice received — processing…');
  const msgId = sent.message_id;
  const edit = (text) => tg('editMessageText', { chat_id: chatId, message_id: msgId, text, parse_mode: 'Markdown' });

  try {
    const buf = await downloadFile(fileId);
    const saved = vaultPath(fname, buf);
    fs.writeFileSync(saved, buf);
    console.log(`💾 saved ${saved} (${buf.length} bytes)`);

    const { status, body } = await ingestInvoice(buf, path.basename(saved), mime);
    if (status !== 200) {
      return edit(`⚠️ Store failed (HTTP ${status}): ${body.error || 'unknown'}`);
    }
    if (body.duplicate) {
      const dup = body.invoice?.invoice_number || '?';
      await edit(`♻️ Invoice #${dup} was already stored (duplicate). No changes made.`);
      return syncToHermes({ kind: 'duplicate', invoiceNumber: dup, sender: chatId, file: saved });
    }
    const invNum = body.invoice?.invoice_number || '?';
    const lines = body.lines?.length ?? 0;
    const variance = body.reconciliation?.variance;
    const varNote = typeof variance === 'number' && Math.abs(variance) > 0.01
      ? `\n⚠️ Variance $${variance.toFixed(2)} — needs review`
      : '\n✅ Lines reconcile.';
    await edit(
      `✅ Invoice #${invNum} stored.\n` +
      `📄 ${lines} line(s) → priced at 70% rule, *needs_review*.${varNote}`
    );
    await syncToHermes({
      kind: 'new', invoiceNumber: invNum, lines, variance,
      file: saved, sender: chatId,
      hermesMsg: `📥 *New invoice from the bot*\n#${invNum} · ${lines} lines · variance ${typeof variance === 'number' ? '$' + variance.toFixed(2) : 'n/a'}\nSaved: \`${saved}\``
    });
  } catch (e) {
    console.error('process error:', e.message);
    await edit(`❌ Processing failed: ${String(e.message).slice(0, 200)}`).catch(() => {});
  }
}

// ── Long-poll loop ─────────────────────────────────────────────────────────
let offset = 0;
async function poll() {
  try {
    const updates = await tg('getUpdates', { offset, timeout: 50, allowed_updates: ['message'] });
    for (const u of updates || []) {
      offset = u.update_id + 1;
      const msg = u.message;
      if (!msg) continue;
      if (msg.document || (msg.photo && msg.photo.length)) {
        processInvoice(msg).catch(e => console.error('invoice handler:', e.message));
      } else if (msg.text && /^\/start/.test(msg.text)) {
        sendMsg(msg.chat.id,
          '📄 *Anthony\'s Invoice Bot*\n\n' +
          'Send a vendor invoice as a **PDF or photo** and I\'ll:\n' +
          '• store it privately\n• extract lines (OCR)\n• price at the 70% rule\n• flag for review\n\n' +
          'Authorized users only.'
        ).catch(() => {});
      }
    }
  } catch (e) {
    console.error('poll error:', e.message);
    await new Promise(r => setTimeout(r, 3000)); // backoff on network hiccups
  }
  setTimeout(poll, 250);
}

console.log(`📄 Anthony's Invoice Bot starting (allowlist: ${[...ALLOWED].join(', ')})`);
console.log(`   vault: ${VAULT_DIR}`);
console.log(`   hub:   ${HUB_API}`);
poll();
