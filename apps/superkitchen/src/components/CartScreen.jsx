import { useState } from 'react';
import { telegramHaptic } from '../lib/telegram.js';

function CartLine({ item, cart }) {
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(item.qty);

  const adjustQty = delta => {
    telegramHaptic('light');
    setQty(current => Math.max(1, current + delta));
  };

  const saveQty = () => {
    cart.updateItem(item.key, { qty });
    telegramHaptic('success');
    setEditing(false);
  };

  const removeItem = () => {
    telegramHaptic('warning');
    cart.removeItem(item.key);
  };

  return (
    <article className="cart-line">
      <div className="cart-line-info">
        <div className="cart-line-top">
          <div className="cart-line-name">{item.name}</div>
          <div className="cart-line-total">${(item.unitPrice * item.qty).toFixed(2)}</div>
        </div>
        <div className="cart-line-options">
          {item.meat && <span>{item.meat.name}{item.meat.priceDelta > 0 ? ` +$${item.meat.priceDelta.toFixed(2)}` : ''}</span>}
          {item.side && <span>{item.side.name}</span>}
          <span>{item.qty} × ${item.unitPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="cart-line-actions">
        {editing ? (
          <div className="qty-row small">
            <button type="button" className="qty-btn" onClick={() => adjustQty(-1)} aria-label="Decrease quantity">−</button>
            <span className="qty-value">{qty}</span>
            <button type="button" className="qty-btn" onClick={() => adjustQty(1)} aria-label="Increase quantity">+</button>
            <button type="button" className="btn btn-small btn-save" onClick={saveQty}>Save</button>
          </div>
        ) : (
          <button type="button" className="btn btn-small" onClick={() => { telegramHaptic('selection'); setEditing(true); }}>Edit quantity</button>
        )}
        <button type="button" className="btn btn-small btn-danger" onClick={removeItem}>Remove</button>
      </div>
    </article>
  );
}

export default function CartScreen({ cart, onBack, onCheckout }) {
  return (
    <main className="cart-screen">
      <div className="cart-screen-head">
        <button type="button" className="icon-back-btn" onClick={onBack} aria-label="Back to menu">←</button>
        <div>
          <span className="section-eyebrow">YOUR ORDER</span>
          <h2>Cart</h2>
        </div>
        <span className="cart-screen-count">{cart.totals.count}</span>
      </div>

      {cart.items.length === 0 ? (
        <div className="empty-cart">
          <span aria-hidden="true">🛍️</span>
          <h3>Your cart is empty</h3>
          <p>Go back and add something hot from the kitchen.</p>
          <button type="button" className="btn btn-primary" onClick={onBack}>Browse menu</button>
        </div>
      ) : (
        <>
          <div className="cart-lines">
            {cart.items.map(item => (
              <CartLine key={item.key} item={item} cart={cart} />
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-row"><span>Items</span><span>{cart.totals.count}</span></div>
            <div className="cart-summary-row"><span>Subtotal</span><span>${cart.totals.subtotal.toFixed(2)}</span></div>
            <div className="cart-summary-row total"><span>Total</span><span>${cart.totals.subtotal.toFixed(2)}</span></div>
            <p className="cart-summary-note">Choose pickup or delivery on the next step.</p>
          </div>

          <div className="cart-actions">
            <button type="button" className="btn btn-secondary" onClick={() => { telegramHaptic('warning'); cart.clearCart(); }}>Clear</button>
            <button type="button" className="btn btn-primary btn-lg cart-checkout-btn" onClick={onCheckout}>
              <span>Checkout</span>
              <strong>${cart.totals.subtotal.toFixed(2)}</strong>
            </button>
          </div>
        </>
      )}
    </main>
  );
}
