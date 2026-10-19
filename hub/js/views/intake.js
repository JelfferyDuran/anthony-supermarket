/* Intake — upload an invoice (camera or file), watch it upload and get read,
   and rescue scans that were stored but never read. Upload state lives at
   module level so leaving the tab mid-upload doesn't lose it. */

import { esc, icon, toast, setBusy, emptyState, plural } from '../ui.js';

const OK_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const MAX_BYTES = 10 * 1024 * 1024;

const upload = { phase: 'idle', pct: 0, name: '', ctrl: null, startedAt: 0 };
let hostRef = null;

function onIntake() { return /^#\/intake/.test(location.hash || ''); }

function progressHtml() {
  if (upload.phase === 'idle') return '';
  const reading = upload.phase === 'reading';
  return '<div class="card upload-progress" role="status">' +
    '<div class="up-ring' + (reading ? ' spin' : '') + '" style="--p:' + (reading ? 100 : upload.pct) + '"><span>' +
      (reading ? icon('file') : upload.pct + '%') + '</span></div>' +
    '<div class="up-text"><b>' + (reading ? 'Reading the invoice…' : 'Uploading…') + '</b>' +
      '<span class="muted small">' + esc(upload.name) + '</span>' +
      '<span class="muted small">' + (reading ? 'This usually takes 30–90 seconds. You can keep working; we\'ll open it when it\'s ready.' : 'Sending the scan securely.') + '</span></div>' +
    '<button type="button" class="btn small ghost" data-cancel>Cancel</button>' +
  '</div>';
}

function paintProgress() {
  if (!hostRef || !hostRef.isConnected) return;
  const slot = hostRef.querySelector('[data-progress]');
  if (!slot) return;
  slot.innerHTML = progressHtml();
  const c = slot.querySelector('[data-cancel]');
  if (c) c.addEventListener('click', () => upload.ctrl && upload.ctrl.abort());
  const pick = hostRef.querySelector('[data-pickers]');
  if (pick) pick.classList.toggle('disabled', upload.phase !== 'idle');
}

async function handleFile(ctx, file) {
  if (upload.phase !== 'idle') { toast('One invoice at a time — wait for the current one to finish.'); return; }
  if (!file) return;
  if (!OK_TYPES.has(file.type)) { toast('Use a PDF, JPEG, PNG or WebP file.', 'err'); return; }
  if (file.size > MAX_BYTES) { toast('That file is over the 10 MB limit.', 'err'); return; }

  Object.assign(upload, { phase: 'uploading', pct: 0, name: file.name, ctrl: new AbortController(), startedAt: Date.now() });
  paintProgress();
  try {
    const res = await ctx.api.uploadInvoice(file, {}, {
      signal: upload.ctrl.signal,
      onProgress: (f) => {
        if (upload.phase === 'uploading' && f >= 0.999) upload.phase = 'reading';
        else if (upload.phase === 'uploading') upload.pct = Math.round(f * 100);
        paintProgress();
      },
    });
    Object.assign(upload, { phase: 'idle', ctrl: null });
    paintProgress();
    await ctx.afterAction({ queue: true });
    const inv = res && res.invoice;
    const number = inv && inv.invoice_number ? '#' + esc(inv.invoice_number) : 'This scan';

    if (res && res.duplicate) {
      if (res.rescuable) {
        toast(number + ' was stored before but never read. Use <b>Read again</b> below.', 'err');
        if (onIntake()) ctx.render();
        return;
      }
      if (inv && inv.status === 'needs_review') {
        toast(number + ' is already uploaded — opening it.', 'ok');
        ctx.go('/review/' + inv.id);
      } else {
        toast(number + ' is already in the system (' + esc(inv ? inv.status : 'done') + ').', 'ok');
      }
      return;
    }
    if (res && (res.code === 'OCR_NOT_CONFIGURED' || res.warning)) {
      toast('<b>Stored, but not read:</b> ' + esc(res.warning || 'the invoice reader is not configured.'), 'err');
      if (onIntake()) ctx.render();
      return;
    }
    const n = res && res.lines ? res.lines.length : 0;
    toast(icon('check') + ' <b>' + number + ' read</b> — ' + plural(n, 'line') + ' ready to review.', 'ok');
    if (inv && (onIntake() || Date.now() - upload.startedAt < 120000)) ctx.go('/review/' + inv.id);
  } catch (e) {
    Object.assign(upload, { phase: 'idle', ctrl: null });
    paintProgress();
    if (/cancel/i.test(e.message)) toast('Upload cancelled.');
    else {
      toast('<b>Upload failed:</b> ' + esc(e.message) + ' If the scan was stored, it will show under Stuck scans.', 'err');
      ctx.afterAction({ queue: true }).then(() => { if (onIntake()) ctx.render(); }).catch(() => {});
    }
  }
}

function rescueError(e) {
  const code = e.data && e.data.code;
  if (code === 'NOT_STUCK') return 'It is still being read. Give it a few minutes, then try again.';
  if (code === 'NO_SCAN') return 'No scan is on file for it. Upload the invoice again.';
  if (code === 'UNREADABLE_SCAN') return 'The stored file is not a PDF or photo the reader accepts. Upload a clearer copy.';
  if (code === 'OCR_NOT_CONFIGURED' || e.status === 503) return 'The invoice reader is not set up on this deployment.';
  return e.message;
}

export function render(ctx, route, host) {
  hostRef = host;
  const g = ctx.state.game;
  const rescue = g && g.missions ? g.missions.find((m) => m.key === 'rescue_intake') : null;
  const stuck = (rescue && rescue.items) || [];

  host.innerHTML =
    '<header class="page-head"><h1>Intake</h1><p class="muted">Add a delivery invoice. Its lines go to the Review line once they are read.</p></header>' +
    '<section class="card drop" data-drop>' +
      '<div class="drop-inner">' + icon('upload', 'lg') +
        '<h2>Upload an invoice</h2>' +
        '<p class="muted small">PDF, JPEG, PNG or WebP · up to 10 MB · you can also drop a file here</p>' +
        '<div class="btn-row" data-pickers>' +
          '<label class="btn primary">' + icon('camera') + 'Take a photo' +
            '<input type="file" accept="image/*" capture="environment" class="sr-only" data-file></label>' +
          '<label class="btn">' + icon('file') + 'Choose a file' +
            '<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" class="sr-only" data-file></label>' +
        '</div>' +
      '</div>' +
    '</section>' +
    '<div data-progress></div>' +
    '<section class="card">' +
      '<h2 class="card-h">' + icon('alert') + 'Stuck scans' + (stuck.length ? ' <span class="count-pill">' + stuck.length + '</span>' : '') + '</h2>' +
      (stuck.length
        ? '<p class="muted small">Stored but never read, so their lines never reached review. Read each one again.</p>' +
          '<ul class="stuck-list">' + stuck.map((s) =>
            '<li><div><b>' + esc(s.label) + '</b><span class="muted small">' + esc([s.status === 'uploaded' ? 'never read' : 'read stopped halfway',
              s.ageDays != null ? (s.ageDays === 0 ? 'today' : s.ageDays + ' days ago') : null].filter(Boolean).join(' · ')) + '</span></div>' +
            (s.hasScan
              ? '<button type="button" class="btn small" data-rescue="' + esc(s.id) + '">' + icon('refresh') + 'Read again</button>'
              : '<span class="tag muted">No scan on file</span>') + '</li>').join('') + '</ul>'
        : emptyState('check', 'No stuck scans', 'Every stored invoice has been read.')) +
    '</section>';

  paintProgress();
  host.querySelectorAll('[data-file]').forEach((input) => input.addEventListener('change', () => {
    const f = input.files && input.files[0];
    input.value = '';
    handleFile(ctx, f);
  }));

  const drop = host.querySelector('[data-drop]');
  ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => handleFile(ctx, e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]));

  host.querySelectorAll('[data-rescue]').forEach((b) => b.addEventListener('click', async () => {
    setBusy(b, true, 'Reading… (up to 90s)');
    try {
      const res = await ctx.api.rescueInvoice(b.dataset.rescue);
      toast(icon('check') + ' <b>Scan read</b> — ' + plural(res && res.lines ? res.lines.length : 0, 'line') + ' ready to review.', 'ok');
      await ctx.afterAction({ queue: true });
      ctx.go('/review/' + b.dataset.rescue);
    } catch (e) {
      setBusy(b, false);
      toast(esc(rescueError(e)), 'err');
      ctx.afterAction({}).catch(() => {});
    }
  }));
}

