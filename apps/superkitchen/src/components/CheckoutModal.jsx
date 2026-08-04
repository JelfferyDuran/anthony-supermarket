import { useState } from 'react';
import { createOrder } from '../lib/api.js';

export default function CheckoutModal({ cart, menuData, onClose, onPlaced }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('pickup');
  const [notas, setNotas] = useState('');
  const [state, setState] = useState('form'); // form | submitting | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const [orderId, setOrderId] = useState('');

  const handlePlace = async () => {
    if (!nombre.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    setState('submitting');
    setErrorMsg('');
    try {
      const res = await createOrder({
        items: cart.items,
        customer: { nombre: nombre.trim(), telefono: telefono.trim() },
        tipoEntrega,
        notas: notas.trim(),
      });
      setOrderId(res.orderId);
      setState('done');
      // Telegram deep link: https://t.me/Anthonysuperkitchen_bot?start=ORDER_<orderId>
      const botUrl = menuData.brand.botUrl || 'https://t.me/Anthonysuperkitchen_bot';
      const deepLink = `${botUrl}?start=ORDER_${res.orderId}`;
      // Open the bot (works inside Telegram webview too)
      window.open(deepLink, '_blank');
    } catch (e) {
      setErrorMsg(e.message || 'Something went wrong placing your order.');
      setState('form');
    }
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
            <p className="order-confirm">
              Order <strong>#{orderId}</strong> — continue it in Telegram with the bot.
            </p>
            <pre className="order-summary">{buildSummary()}</pre>
            <div className="modal-footer">
              <button className="btn btn-primary btn-lg" onClick={onPlaced}>Done</button>
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
                {state === 'submitting' ? 'Placing…' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
