import { useMemo, useState } from 'react';
import menuData from './data/menu.json';
import { useCart } from './store/useCart.js';
import MenuScreen from './components/MenuScreen.jsx';
import CustomizeModal from './components/CustomizeModal.jsx';
import CartScreen from './components/CartScreen.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import { telegramHaptic } from './lib/telegram.js';

const CATEGORY_ORDER = ['Yaroas', 'Chimis', 'Mofongos', 'Pica Pollo'];

export default function App() {
  const cart = useCart();
  const [activeCategory, setActiveCategory] = useState(CATEGORY_ORDER[0]);
  const [screen, setScreen] = useState('menu');
  const [customizing, setCustomizing] = useState(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const categories = useMemo(() => {
    const byName = {};
    menuData.products.forEach(p => {
      if (!byName[p.category]) byName[p.category] = [];
      byName[p.category].push(p);
    });
    return CATEGORY_ORDER.filter(c => byName[c]).map(c => ({ name: c, products: byName[c] }));
  }, []);

  const openCart = () => {
    if (!cart.totals.count) return;
    telegramHaptic('selection');
    setScreen('cart');
  };

  const openCustomize = product => {
    telegramHaptic('light');
    setCustomizing(product);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand-row">
          <img src="logo.jpg" alt="Anthony's Super Kitchen logo" className="brand-logo" />
          <div className="brand-copy">
            <h1>{menuData.brand.name}</h1>
            <p className="subtitle">288 Kearny Ave · Made to order</p>
          </div>
        </div>
        <button
          type="button"
          className="cart-badge"
          onClick={openCart}
          disabled={cart.totals.count === 0}
          aria-label={`Open cart${cart.totals.count ? ` with ${cart.totals.count} items` : ''}`}
        >
          <span className="cart-icon" aria-hidden="true">🛍</span>
          {cart.totals.count > 0 && <span className="cart-count">{cart.totals.count}</span>}
        </button>
      </header>

      {screen === 'menu' && (
        <>
          <section className="order-hero" aria-label="Order Anthony's Super Kitchen">
            <div>
              <span className="hero-kicker">ANTHONY'S SUPERMARKET · KEARNY</span>
              <h2>Dominican favorites, hot & made your way.</h2>
              <p>Choose your meat, pick your sides, and place the order right from Telegram.</p>
            </div>
            <div className="hero-service-row" aria-label="Available order types">
              <span>📦 Pickup</span>
              <span>🚚 Delivery</span>
            </div>
          </section>

          <MenuScreen
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={category => {
              telegramHaptic('selection');
              setActiveCategory(category);
            }}
            onCustomize={openCustomize}
          />

          <footer className="customer-footer">
            <span>Anthony's Super Kitchen</span>
            <span>{menuData.brand.phone}</span>
          </footer>

          {cart.totals.count > 0 && (
            <button type="button" className="floating-cart-bar" onClick={openCart}>
              <span className="floating-cart-main">
                <span className="floating-cart-count">{cart.totals.count}</span>
                <span>View cart</span>
              </span>
              <strong>${cart.totals.subtotal.toFixed(2)}</strong>
            </button>
          )}
        </>
      )}

      {screen === 'cart' && (
        <CartScreen
          cart={cart}
          onBack={() => {
            telegramHaptic('selection');
            setScreen('menu');
          }}
          onCheckout={() => {
            telegramHaptic('medium');
            setCheckoutOpen(true);
          }}
        />
      )}

      {customizing && (
        <CustomizeModal
          product={customizing}
          menuData={menuData}
          cart={cart}
          onClose={() => setCustomizing(null)}
        />
      )}

      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          menuData={menuData}
          onClose={() => setCheckoutOpen(false)}
          onPlaced={() => {
            setCheckoutOpen(false);
            cart.clearCart();
            setScreen('menu');
          }}
        />
      )}
    </div>
  );
}
