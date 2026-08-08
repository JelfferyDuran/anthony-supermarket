import { useMemo, useState } from 'react';
import { telegramHaptic } from '../lib/telegram.js';

export default function CustomizeModal({ product, menuData, cart, onClose }) {
  const [meatId, setMeatId] = useState('');
  const [sideId, setSideId] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  const selectedMeat = useMemo(
    () => menuData.meats.find(m => m.id === meatId) || null,
    [meatId, menuData.meats]
  );
  const selectedSide = useMemo(
    () => menuData.sides.find(s => s.id === sideId) || null,
    [sideId, menuData.sides]
  );

  const unitPrice = product.basePrice + (selectedMeat?.priceDelta || 0);
  const lineTotal = unitPrice * qty;

  const chooseMeat = id => {
    telegramHaptic('selection');
    setMeatId(id);
    setError('');
  };

  const chooseSide = id => {
    telegramHaptic('selection');
    setSideId(id);
    setError('');
  };

  const changeQty = delta => {
    telegramHaptic('light');
    setQty(current => Math.max(1, current + delta));
  };

  const handleAdd = () => {
    if (product.allowMeatChoice && !selectedMeat) {
      telegramHaptic('error');
      setError('Choose your meat to continue.');
      return;
    }
    if (product.allowSideChoice && !selectedSide) {
      telegramHaptic('error');
      setError('Choose your side to continue.');
      return;
    }

    cart.addItem({
      productId: product.id,
      name: product.name,
      basePrice: product.basePrice,
      meat: selectedMeat,
      side: selectedSide,
      qty,
      unitPrice,
    });
    telegramHaptic('success');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <section className="modal customize-sheet" onClick={e => e.stopPropagation()} aria-label={`Customize ${product.name}`}>
        <div className="sheet-handle" aria-hidden="true" />
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="customize-product-head">
          <img src={product.imageUrl} alt="" className="customize-thumb" />
          <div>
            <span className="section-eyebrow">CUSTOMIZE YOUR ORDER</span>
            <h2>{product.name}</h2>
            <p className="modal-base">Starts at ${product.basePrice.toFixed(2)}</p>
          </div>
        </div>

        {product.allowMeatChoice && (
          <div className="option-group option-step">
            <div className="option-label-row">
              <span className="option-step-number">1</span>
              <div>
                <span className="option-label">Choose your meat</span>
                <span className="option-helper">Premium choices add $2.00</span>
              </div>
            </div>
            <div className="option-grid">
              {menuData.meats.map(m => (
                <button
                  type="button"
                  key={m.id}
                  className={`option-chip ${meatId === m.id ? 'selected' : ''}`}
                  onClick={() => chooseMeat(m.id)}
                  aria-pressed={meatId === m.id}
                >
                  <span>{m.name}</span>
                  {m.priceDelta > 0 && <span className="premium-tag">+${m.priceDelta.toFixed(2)}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.allowSideChoice && (
          <div className="option-group option-step">
            <div className="option-label-row">
              <span className="option-step-number">{product.allowMeatChoice ? '2' : '1'}</span>
              <div>
                <span className="option-label">Choose your side</span>
                <span className="option-helper">Pick one included side</span>
              </div>
            </div>
            <div className="option-grid">
              {menuData.sides.map(s => (
                <button
                  type="button"
                  key={s.id}
                  className={`option-chip ${sideId === s.id ? 'selected' : ''}`}
                  onClick={() => chooseSide(s.id)}
                  aria-pressed={sideId === s.id}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="quantity-panel">
          <div>
            <span className="option-label">Quantity</span>
            <span className="option-helper">How many would you like?</span>
          </div>
          <div className="qty-row">
            <button type="button" className="qty-btn" onClick={() => changeQty(-1)} aria-label="Decrease quantity">−</button>
            <span className="qty-value" aria-live="polite">{qty}</span>
            <button type="button" className="qty-btn" onClick={() => changeQty(1)} aria-label="Increase quantity">+</button>
          </div>
        </div>

        {error && <p className="error-text" role="alert">{error}</p>}

        <div className="modal-footer sticky-sheet-footer">
          <div>
            <span className="footer-total-label">Item total</span>
            <div className="line-total">${lineTotal.toFixed(2)}</div>
          </div>
          <button type="button" className="btn btn-primary btn-lg add-cart-btn" onClick={handleAdd}>
            Add to cart
          </button>
        </div>
      </section>
    </div>
  );
}
