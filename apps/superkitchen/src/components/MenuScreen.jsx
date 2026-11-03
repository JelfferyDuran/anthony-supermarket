import { useState } from 'react';

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
    <article className="product-card">
      <div className="product-media">
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
        <span className="product-price-pill">${product.basePrice.toFixed(2)}</span>
      </div>

      <div className="product-content">
        <div className="product-info">
          <div className="product-title-row">
            <h3>{product.name}</h3>
            <span className="made-fresh-dot" aria-label="Made to order" title="Made to order" />
          </div>
          {product.description && <p className="product-desc">{product.description}</p>}
          <div className="product-badges">
            {product.allowMeatChoice && <span className="badge">Meat choice</span>}
            {product.allowSideChoice && <span className="badge">Side choice</span>}
          </div>
        </div>

        <button type="button" className="btn btn-primary product-cta" onClick={() => onCustomize(product)}>
          <span>Customize</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </article>
  );
}

export default function MenuScreen({ categories, activeCategory, setActiveCategory, onCustomize }) {
  const active = categories.find(c => c.name === activeCategory) || categories[0];

  return (
    <main className="menu-screen">
      <nav className="category-tabs" aria-label="Menu categories">
        {categories.map(c => (
          <button
            type="button"
            key={c.name}
            className={`category-tab ${c.name === activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.name)}
            aria-pressed={c.name === activeCategory}
          >
            <span className="category-tab-emoji" aria-hidden="true">{CATEGORY_EMOJI[c.name] || ''}</span>
            {c.name}
          </button>
        ))}
      </nav>

      <div className="menu-section-head">
        <div>
          <span className="section-eyebrow">MADE TO ORDER</span>
          <h2>{active?.name}</h2>
        </div>
        <span className="section-count">{active?.products.length || 0} items</span>
      </div>

      <div className="product-grid">
        {active?.products.map(p => (
          <ProductCard key={p.id} product={p} onCustomize={onCustomize} />
        ))}
      </div>
    </main>
  );
}
