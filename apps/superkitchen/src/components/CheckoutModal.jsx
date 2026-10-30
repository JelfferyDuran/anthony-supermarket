import { useState } from 'react';
import { createOrder } from '../lib/api.js';

export default function CheckoutModal({ cart, menuData, onClose, onPlaced }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('pickup');
  const [pickupTime, setPickupTime] = useState('');
  const [notas, setNotas] = useState('');
  const [state, setState] = useState('form'); // form | submitting | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const [orderId, setOrderId] = useState('');

  const handlePlace = async () => {
    if (!nombre.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (tipoEntrega === 'delivery' && !direccion.trim()) {
      setErrorMsg('Please enter a delivery address.');
      return;
    }
    setState('submitting');
    setErrorMsg('');
    try {
      // Capture Telegram session so the API can verify + get the user id,
      // enabling the bot to DM this customer about their order.
      let telegramInitData = '';
      try {
        telegramInitData = window.Telegram?.WebApp?.initData || '';
      } catch { /* not in Telegram — anonymous order, no DM relay */ }

      const res = await createOrder({
        items: cart.items,
        customer: {
          nombre: nombre.trim(),
          telefono: telefono.trim(),
        },
        tipoEntrega,
        direccion: tipoEntrega === 'delivery' ? direccion.trim() : '',
        pickupTime: tipoEntrega === 'pickup' ? pickupTime.trim() : '',
        notas: notas.trim(),
        telegramInitData,
      });
      setOrderId(res.orderId);
      setState('done');
      // NOTE: do NOT auto-open the bot link here. window.open() with a t.me URL
      // blanks the Mini App WebView on iOS (black screen). The user taps
      // "Continue in Telegram" instead, which uses Telegram.WebApp.openTelegramLink.
    } catch (e) {
      setErrorMsg(e.message || 'Something went wrong placing your order.');
      setState('form');
    }
  };

  const openBotLink = () => {
    const botUrl = (menuData && menuData.brand && menuData.brand.botUrl) || 'https://t.me/Anthonysuperkitchen_bot';
    const deepLink = `${botUrl}?start=ORDER_${orderId}`;
    try {
      const wa = window.Telegram && window.Telegram.WebApp;
      if (wa && typeof wa.openTelegramLink === 'function') {
        wa.openTelegramLink(deepLink);
        return;
      }
    } catch { /* fall through to window.open */ }
    window.open(deepLink, '_blank');
  };

  const buildSummary = () =>
    cart.items.map(i =>
      `${i.qty}x ${i.name} - $${(i.unitPrice * i.qty).toFixed(2)}` +
      (i.meat ? `\nMeat: ${i.meat.name}${i.meat.priceDelta > 0 ? ` +$${i.meat.priceDelta.toFixed(2)}` : ''}` : '') +
      (i.side ? `\nSide: ${i.side.name}` : '')
    ).join('\n\n');

  return (
    <div className="modal-overlay" onClick={state === 'form' ? onClose : undefined}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {state === 'done' ? (
          <>
            <h2>✅ Order Placed!</h2>
            <div className="order-id-box">
              <div className="order-id-label">YOUR ORDER #</div>
              <div className="order-id-value">{orderId}</div>
              {tipoEntrega === 'delivery' ? (
                <p className="order-pickup-note">🚚 Delivery — we'll text you when it's on the way.</p>
              ) : (
                <p className="order-pickup-note">
                  📦 Pickup at 288 Kearny Ave, Kearny NJ
                  {pickupTime ? ` — ready around ${pickupTime}` : ' — we\'ll have it ready for you!'}
                </p>
              )}
            </div>
            <pre className="order-summary">{buildSummary()}</pre>
            <p className="order-confirm">
              Tap <strong>Continue in Telegram</strong> to confirm with the bot, or just come by!
            </p>
            <div className="modal-footer">
              <button className="btn btn-primary btn-lg" onClick={openBotLink}>📲 Continue in Telegram</button>
              <button className="btn btn-lg" onClick={onPlaced}>Done</button>
            </div>
          </>
        ) : (
          <>
            <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
            <h2>Checkout</h2>

            <label className="field-label">Name *</label>
            <input
              className="field-input"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Your name"
            />

            <label className="field-label">Phone (optional)</label>
            <input
              className="field-input"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="(201) 555-0123"
              inputMode="tel"
            />

            <label className="field-label">Order type</label>
            <div className="option-grid">
              <button className={`option-chip ${tipoEntrega === 'pickup' ? 'selected' : ''}`} onClick={() => setTipoEntrega('pickup')}>📦 Pickup</button>
              <button className={`option-chip ${tipoEntrega === 'delivery' ? 'selected' : ''}`} onClick={() => setTipoEntrega('delivery')}>🚚 Delivery</button>
            </div>

            {tipoEntrega === 'delivery' && (
              <>
                <label className="field-label">Delivery address *</label>
                <input
                  className="field-input"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  placeholder="Street, apt, city, zip"
                />
              </>
            )}

            {tipoEntrega === 'pickup' && (
              <>
                <label className="field-label">Pickup time (optional)</label>
                <input
                  className="field-input"
                  type="time"
                  value={pickupTime}
                  onChange={e => setPickupTime(e.target.value)}
                />
                <p className="field-hint">Leave blank and we&apos;ll have it ready as soon as possible.</p>
              </>
            )}

            <label className="field-label">Notes (optional)</label>
            <textarea
              className="field-input"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Allergies, special requests…"
              rows={2}
            />

            {errorMsg && <p className="error-text">{errorMsg}</p>}

            <div className="modal-footer">
              <div className="line-total">${cart.totals.subtotal.toFixed(2)}</div>
              <button className="btn btn-primary btn-lg" onClick={handlePlace} disabled={state === 'submitting'}>
                {state === 'submitting' ? '⏳ Placing…' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
