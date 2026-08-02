import { useMemo, useState } from 'react';

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

  // final_item_price = base_price + selected_premium_addons_total
  const unitPrice = product.basePrice + (selectedMeat?.priceDelta || 0);
  const lineTotal = unitPrice * qty;

  const handleAdd = () => {
    if (product.allowMeatChoice && !selectedMeat) {
      setError('Please choose a meat.');
      return;
    }
    if (product.allowSideChoice && !selectedSide) {
      setError('Please choose a side.');
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
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        <h2>{product.name}</h2>
        <p className="modal-base">Base ${product.basePrice.toFixed(2)}</p>

        {product.allowMeatChoice && (
          <div className="option-group">
            <label className="option-label">Meat</label>
            <div className="option-grid">
              {menuData.meats.map(m => (
                <button
                  key={m.id}
                  className={`option-chip ${meatId === m.id ? 'selected' : ''}`}
                  onClick={() => { setMeatId(m.id); setError(''); }}
                >
                  {m.name}
                  {m.priceDelta > 0 && <span className="premium-tag">+${m.priceDelta.toFixed(2)}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.allowSideChoice && (
          <div className="option-group">
            <label className="option-label">Side</label>
            <div className="option-grid">
              {menuData.sides.map(s => (
                <button
                  key={s.id}
                  className={`option-chip ${sideId === s.id ? 'selected' : ''}`}
                  onClick={() => { setSideId(s.id); setError(''); }}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="qty-row">
          <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
          <span className="qty-value">{qty}</span>
          <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="modal-footer">
          <div className="line-total">${lineTotal.toFixed(2)}</div>
          <button className="btn btn-primary btn-lg" onClick={handleAdd}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
