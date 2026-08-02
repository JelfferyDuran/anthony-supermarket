import { useState } from 'react';

function ProductCard({ product, onCustomize }) {
  const [imgError, setImgError] = useState(false);
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
          🍽️
        </div>
      )}
      <div className="product-info">
        <h3>{product.name}</h3>
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
