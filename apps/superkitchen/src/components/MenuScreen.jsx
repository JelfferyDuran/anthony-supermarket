import { useState } from 'react';

// Category -> emoji fallback (products carry their own emoji; this covers tabs)
const CATEGORY_EMOJI = {
  Yaroas: '🌮',
  Chimis: '🍔',
  Mofongos: '🥘',
  'Pica Pollo': '🍗',
};

function ProductCard({ product, onCustomize }) {
  const [imgError, setImgError] = useState(false);
  const emoji = product.emoji || '🍽️';
  return (
    <div className="product-card">
      {product.imageUrl && !imgError ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="product-image"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="product-image product-image-fallback" aria-hidden="true">
          <span className="product-emoji">{emoji}</span>
        </div>
      )}
      <div className="product-info">
        <h3>{product.name}</h3>
        {product.description && <p className="product-desc">{product.description}</p>}
        <div className="product-badges">
          {product.allowMeatChoice && <span className="badge">Choose meat</span>}
          {product.allowSideChoice && <span className="badge">Choose side</span>}
        </div>
        <p className="product-price">From ${product.basePrice.toFixed(2)}</p>
      </div>
      <button className="btn btn-primary" onClick={() => onCustomize(product)}>
        Customize
      </button>
    </div>
  );
}

export default function MenuScreen({ categories, activeCategory, setActiveCategory, onCustomize }) {
  const active = categories.find(c => c.name === activeCategory) || categories[0];
  return (
    <div className="menu-screen">
      <nav className="category-tabs">
        {categories.map(c => (
          <button
            key={c.name}
            className={`category-tab ${c.name === activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.name)}
          >
            <span className="category-tab-emoji">{CATEGORY_EMOJI[c.name] || ''}</span>
            {c.name}
          </button>
        ))}
      </nav>
      <div className="product-grid">
        {active?.products.map(p => (
          <ProductCard key={p.id} product={p} onCustomize={onCustomize} />
        ))}
      </div>
    </div>
  );
}
