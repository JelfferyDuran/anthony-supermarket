/* Barcode finder shared by review lines and product cards: public-database
   lookup (Open Food Facts, server-side), one-tap pick, and a typed-digits
   fallback that is wired whether or not the lookup found anything. */

import { esc, icon, toast, setBusy } from './ui.js';

const VALID = /^[0-9]{8}$|^[0-9]{12,14}$/;

// box: an empty element to render into. Returns nothing; calls onSaved(upc).
export function mountUpcFinder(box, { ctx, productId, query, onSaved }) {
  const fieldId = 'upc-' + Math.random().toString(36).slice(2, 9);
  box.innerHTML =
    '<div class="upc-finder">' +
      '<button type="button" class="btn small" data-upc-find>' + icon('barcode') + 'Find UPC</button>' +
      '<div class="upc-results" data-upc-results></div>' +
      '<form class="upc-manual" data-upc-manual>' +
        '<label class="sr-only" for="' + fieldId + '">Barcode digits</label>' +
        '<input id="' + fieldId + '" inputmode="numeric" autocomplete="off" placeholder="…or type the barcode digits">' +
        '<button type="submit" class="btn small ghost">Save</button>' +
      '</form>' +
    '</div>';

  const results = box.querySelector('[data-upc-results]');
  const findBtn = box.querySelector('[data-upc-find]');
  const form = box.querySelector('[data-upc-manual]');

  async function save(code, btn) {
    setBusy(btn, true, 'Saving…');
    try {
      await ctx.api.setProductUpc(productId, code);
      const p = ctx.state.products.find((x) => String(x.id) === String(productId));
      if (p) p.upc = code;
      toast(icon('check') + ' <b>UPC saved</b> — ' + esc(code), 'ok');
      await ctx.afterAction({ products: true });
      if (onSaved) onSaved(code);
    } catch (e) {
      toast('Could not save the UPC: ' + esc(e.message), 'err');
      setBusy(btn, false);
    }
  }

  findBtn.addEventListener('click', async () => {
    setBusy(findBtn, true, 'Looking up…');
    results.innerHTML = '';
    try {
      const cands = await ctx.api.lookupUpc(query);
      results.innerHTML = cands.length
        ? '<div class="muted small">Tap the one that matches the package:</div>' + cands.map((c, i) =>
            '<button type="button" class="pick" data-cand="' + i + '">' +
              '<span class="pick-main"><b class="mono">' + esc(c.code) + '</b> ' + esc(c.name || 'Unknown product') + '</span>' +
              (c.brands ? '<span class="pick-sub">' + esc(c.brands) + '</span>' : '') +
            '</button>').join('')
        : '<div class="muted small">No barcodes found online. Type the digits printed on the package below.</div>';
      results.querySelectorAll('[data-cand]').forEach((b) => {
        b.addEventListener('click', () => save(cands[Number(b.dataset.cand)].code, b));
      });
    } catch (e) {
      results.innerHTML = '<div class="muted small">Lookup failed: ' + esc(e.message) + '. You can still type the digits.</div>';
    } finally {
      setBusy(findBtn, false);
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    const digits = (input.value || '').replace(/\D/g, '');
    if (!VALID.test(digits)) {
      toast('Type the barcode digits exactly as printed (8, 12, 13 or 14 digits).', 'err');
      input.focus();
      return;
    }
    save(digits, form.querySelector('button'));
  });
}
