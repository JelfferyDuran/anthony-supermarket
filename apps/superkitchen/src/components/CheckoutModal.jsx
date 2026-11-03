import { useState } from 'react';
import { createOrder } from '../lib/api.js';
import { getTelegramDisplayName, telegramHaptic } from '../lib/telegram.js';

export default function CheckoutModal({ cart, menuData, onClose, onPlaced }) {
  const [nombre, setNombre] = useState(() => getTelegramDisplayName());
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [tipoEntrega, setTipoEntrega] = useState('pickup');
  const [notas, setNotas] = useState('');
  const [state, setState] = useState('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [orderId, setOrderId] = useState('');
  const [deepLink, setDeepLink] = useState('');

  const chooseOrderType = type => {
    telegramHaptic('selection');
    setTipoEntrega(type);
    setErrorMsg('');
  };

  const handlePlace = async () => {
    const cleanName = nombre.trim();
    const cleanPhone = telefono.trim();
    const cleanAddress = direccion.trim();

    if (!cleanName) {
      telegramHaptic('error');
      setErrorMsg('Please enter your name.');
      return;
    }
    if (tipoEntrega === 'delivery' && !cleanPhone) {
      telegramHaptic('error');
      setErrorMsg('Please enter a phone number for delivery.');
      return;
    }
    if (tipoEntrega === 'delivery' && !cleanAddress) {
      telegramHaptic('error');
      setErrorMsg('Please enter the delivery address.');
      return;
    }

    setState('submitting');
    setErrorMsg('');
    telegramHaptic('medium');

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
      telegramHaptic('success');
    } catch (e) {
      setErrorMsg(e.message || 'Something went wrong placing your order.');
      setState('form');
      telegramHaptic('error');
    }
  };

  const openTelegramReceipt = () => {
    if (!deepLink) return;
    telegramHaptic('selection');
    const webApp = window.Telegram?.WebApp;
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(deepLink);
      return;
    }
    window.open(deepLink, '_blank', 'noopener,noreferrer');
  };

  const buildSummary = () =>
    cart.items.map(i =>
      `${i.qty}x ${i.name} — $${(i.unitPrice * i.qty).toFixed(2)}` +
      (i.meat ? `\n${i.meat.name}${i.meat.priceDelta > 0 ? ` +$${i.meat.priceDelta.toFixed(2)}` : ''}` : '') +
      (i.side ? ` · ${i.side.name}` : '')
    ).join('\n\n');

  return (
    <div className="modal-overlay" onClick={state === 'form' ? onClose : undefined}>
      <section className="modal checkout-sheet" onClick={e => e.stopPropagation()} aria-label="Checkout">
        <div className="sheet-handle" aria-hidden="true" />

        {state === 'done' ? (
          <div className="checkout-done">
            <div className="success-mark" aria-hidden="true">✓</div>
            <span className="section-eyebrow">ORDER RECEIVED</span>
            <h2>You're all set.</h2>
            <p className="checkout-lead">Anthony's Super Kitchen has your order.</p>

            <div className="order-id-box">
              <div className="order-id-label">ORDER REFERENCE</div>
              <div className="order-id-value">{orderId}</div>
              {tipoEntrega === 'delivery' ? (
                <div className="fulfillment-summary">
                  <strong>🚚 Delivery</strong>
                  <span>{direccion.trim()}</span>
                  <small>We'll contact you when the order is on the way.</small>
                </div>
              ) : (
                <div className="fulfillment-summary">
                  <strong>📦 Pickup</strong>
                  <span>288 Kearny Ave, Kearny NJ 07032</span>
                  <small>Keep your order reference handy for pickup.</small>
                </div>
              )}
            </div>

            <div className="receipt-card">
              <div className="receipt-card-head">
                <span>Order summary</span>
                <strong>${cart.totals.subtotal.toFixed(2)}</strong>
              </div>
              <pre className="order-summary">{buildSummary()}</pre>
            </div>

            <p className="order-confirm">Open the protected Telegram receipt for your order reference and current status.</p>
            <div className="done-actions">
              <button type="button" className="btn btn-primary btn-lg" onClick={openTelegramReceipt}>Open Telegram receipt</button>
              <button type="button" className="btn btn-secondary btn-lg" onClick={onPlaced}>Back to menu</button>
            </div>
          </div>
        ) : (
          <>
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close">✕</button>
            <div className="checkout-head">
              <span className="section-eyebrow">FINAL STEP</span>
              <h2>Checkout</h2>
              <p>Choose how you want your food, then confirm your contact details.</p>
            </div>

            <div className="fulfillment-toggle" role="group" aria-label="Order type">
              <button
                type="button"
                className={`fulfillment-card ${tipoEntrega === 'pickup' ? 'selected' : ''}`}
                onClick={() => chooseOrderType('pickup')}
                aria-pressed={tipoEntrega === 'pickup'}
              >
                <span className="fulfillment-icon" aria-hidden="true">📦</span>
                <span><strong>Pickup</strong><small>288 Kearny Ave</small></span>
              </button>
              <button
                type="button"
                className={`fulfillment-card ${tipoEntrega === 'delivery' ? 'selected' : ''}`}
                onClick={() => chooseOrderType('delivery')}
                aria-pressed={tipoEntrega === 'delivery'}
              >
                <span className="fulfillment-icon" aria-hidden="true">🚚</span>
                <span><strong>Delivery</strong><small>Address required</small></span>
              </button>
            </div>

            {tipoEntrega === 'pickup' && (
              <div className="pickup-callout">
                <span aria-hidden="true">📍</span>
                <div><strong>Pickup location</strong><span>{menuData.brand.address}</span></div>
              </div>
            )}

            <div className="checkout-fields">
              <label className="field-label" htmlFor="checkout-name">Name *</label>
              <input
                id="checkout-name"
                className="field-input"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                maxLength={80}
              />

              <label className="field-label" htmlFor="checkout-phone">Phone {tipoEntrega === 'delivery' ? '*' : '(optional)'}</label>
              <input
                id="checkout-phone"
                className="field-input"
                value={telefono}
                onChange={e => setTelefono(e.target.value)}
                placeholder="(201) 555-0123"
                inputMode="tel"
                autoComplete="tel"
                maxLength={32}
              />

              {tipoEntrega === 'delivery' && (
                <>
                  <label className="field-label" htmlFor="checkout-address">Delivery address *</label>
                  <input
                    id="checkout-address"
                    className="field-input"
                    value={direccion}
                    onChange={e => setDireccion(e.target.value)}
                    placeholder="Street address, apartment/unit, city"
                    autoComplete="street-address"
                    maxLength={220}
                  />
                </>
              )}

              <label className="field-label" htmlFor="checkout-notes">Notes <span>(optional)</span></label>
              <textarea
                id="checkout-notes"
                className="field-input"
                value={notas}
                onChange={e => setNotas(e.target.value)}
                placeholder="Allergies or special requests"
                rows={3}
                maxLength={500}
              />
            </div>

            {errorMsg && <p className="error-text checkout-error" role="alert">{errorMsg}</p>}

            <div className="modal-footer sticky-sheet-footer checkout-footer">
              <div>
                <span className="footer-total-label">Order total</span>
                <div className="line-total">${cart.totals.subtotal.toFixed(2)}</div>
              </div>
              <button type="button" className="btn btn-primary btn-lg place-order-btn" onClick={handlePlace} disabled={state === 'submitting'}>
                {state === 'submitting' ? 'Placing order…' : 'Place order'}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
