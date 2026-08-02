import { useState } from 'react';

function CartLine({ item, cart }) {
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(item.qty);

  return (
    <div className="cart-line">
      <div className="cart-line-info">
        <div className="cart-line-name">{item.name}</div>
        {item.meat && <div className="cart-line-opt">Meat: {item.meat.name}{item.meat.priceDelta > 0 ? ` +$${item.meat.priceDelta.toFixed(2)}` : ''}</div>}
        {item.side && <div className="cart-line-opt">Side: {item.side.name}</div>}
        <div className="cart-line-price">${item.unitPrice.toFixed(2)} each</div>
      </div>
      <div className="cart-line-actions">
        {editing ? (
          <div className="qty-row small">
            <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <span className="qty-value">{qty}</span>
            <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
            <button className="btn btn-small" onClick={() => { cart.updateItem(item.key, { qty }); setEditing(false); }}>✓</button>
          </div>
        ) : (
          <button className="btn btn-small" onClick={() => setEditing(true)}>Edit qty</button>
        )}
        <button className="btn btn-small btn-danger" onClick={() => cart.removeItem(item.key)}>Remove</button>
      </div>
      <div className="cart-line-total">${(item.unitPrice * item.qty).toFixed(2)}</div>
    </div>
  );
}

export default function CartScreen({ cart, onBack, onCheckout }) {
  return (
    <div className="cart-screen">
      <button className="btn btn-back" onClick={onBack}>← Back to menu</button>
      <h2>Your Cart</h2>
      {cart.items.length === 0 ? (
        <p className="empty-cart">Your cart is empty. Add something tasty!</p>
      ) : (
        <>
          <div className="cart-lines">
            {cart.items.map(item => (
              <CartLine key={item.key} item={item} cart={cart} />
            ))}
          </div>
          <div className="cart-summary">
            <div className="cart-summary-row"><span>Subtotal</span><span>${cart.totals.subtotal.toFixed(2)}</span></div>
            <div className="cart-summary-row total"><span>Total</span><span>${cart.totals.subtotal.toFixed(2)}</span></div>
          </div>
          <div className="cart-actions">
            <button className="btn btn-secondary" onClick={cart.clearCart}>Clear cart</button>
            <button className="btn btn-primary btn-lg" onClick={onCheckout}>Continue in Telegram →</button>
          </div>
        </>
      )}
    </div>
  );
}
