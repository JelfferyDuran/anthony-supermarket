import { useState } from 'react';
import { createOrder } from '../lib/api.js';

export default function CheckoutModal({ cart, menuData, onClose, onPlaced }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('pickup');
  const [notas, setNotas] = useState('');
  const [state, setState] = useState('form'); // form | submitting | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const [orderId, setOrderId] = useState('');
  const [deepLink, setDeepLink] = useState('');

  const handlePlace = async () => {
    const cleanName = nombre.trim();
    const cleanPhone = telefono.trim();
    const cleanAddress = direccion.trim();

    if (!cleanName) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (tipoEntrega === 'delivery' && !cleanPhone) {
      setErrorMsg('Please enter a phone number for delivery.');
      return;
    }
    if (tipoEntrega === 'delivery' && !cleanAddress) {
      setErrorMsg('Please enter the delivery address.');
      return;
    }

    setState('submitting');
    setErrorMsg('');
    try {
      const res = await createOrder({
        items: cart.items,
        customer: {
          nombre: cleanName,
          telefono: cleanPhone,
          direccion: tipoEntrega === 'delivery' ? cleanAddress : '',
        },
        tipoEntrega,
        notas: notas.trim(),
      });
      setOrderId(res.orderId);
      const botUrl = menuData.brand.botUrl || 'https://t.me/Anthonysuperkitchen_bot';
      setDeepLink(`${botUrl}?start=ORDER_${res.orderId}`);
      setState('done');
    } catch (e) {
      setErrorMsg(e.message || 'Something went wrong placing your order.');
      setState('form');
    }
  };

  const openTelegramReceipt = () => {
    if (!deepLink) return;
    const webApp = window.Telegram?.WebApp;
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(deepLink);
      return;
    }
    window.open(deepLink, '_blank', 'noopener,noreferrer');
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
                <>
                  <p className="order-pickup-note">🚚 Delivery — we'll contact you when it's on the way.</p>
                  <p className="order-pickup-note">📍 {direccion.trim()}</p>
                </>
              ) : (
                <p className="order-pickup-note">📦 Pickup at 288 Kearny Ave, Kearny NJ — we'll have it ready for you!</p>
              )}
            </div>
            <pre className="order-summary">{buildSummary()}</pre>
            <p className="order-confirm">
              Continue in Telegram to view the protected receipt, or tap Done to return to the menu.
            </p>
            <div className="modal-footer">
              <button className="btn btn-primary btn-lg" onClick={openTelegramReceipt}>Continue in Telegram</button>
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
              maxLength={80}
            />

            <label className="field-label">Phone {tipoEntrega === 'delivery' ? '*' : '(optional)'}</label>
            <input
              className="field-input"
              value={telefono}
              onChange={e => setTelefono(e.target.value)}
              placeholder="(201) 555-0123"
              inputMode="tel"
              maxLength={32}
            />

            <label className="field-label">Order type</label>
            <div className="option-grid">
              <button className={`option-chip ${tipoEntrega === 'pickup' ? 'selected' : ''}`} onClick={() => setTipoEntrega('pickup')}>📦 Pickup</button>
              <button className={`option-chip ${tipoEntrega === 'delivery' ? 'selected' : ''}`} onClick={() => setTipoEntrega('delivery')}>🚚 Delivery</button>
            </div>

            {tipoEntrega === 'delivery' ? (
              <>
                <label className="field-label">Delivery address *</label>
                <input
                  className="field-input"
                  value={direccion}
                  onChange={e => setDireccion(e.target.value)}
                  placeholder="Street address, apartment/unit, city"
                  autoComplete="street-address"
                  maxLength={220}
                />
              </>
            ) : null}

            <label className="field-label">Notes (optional)</label>
            <textarea
              className="field-input"
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Allergies, special requests…"
              rows={2}
              maxLength={500}
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
