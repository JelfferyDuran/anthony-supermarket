import { useMemo, useState } from 'react';
import menuData from './data/menu.json';
import { useCart } from './store/useCart.js';
import MenuScreen from './components/MenuScreen.jsx';
import CustomizeModal from './components/CustomizeModal.jsx';
import CartScreen from './components/CartScreen.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import AdminApp from './components/AdminApp.jsx';

const CATEGORY_ORDER = ['Yaroas', 'Chimis', 'Mofongos', 'Pica Pollo'];

// Staff portal entry: https://<miniapp>/?staff=1
const IS_STAFF = new URLSearchParams(window.location.search).get('staff') === '1';

export default function App() {
  if (IS_STAFF) return <AdminApp />;
  const cart = useCart();
  const [activeCategory, setActiveCategory] = useState(CATEGORY_ORDER[0]);
  const [screen, setScreen] = useState('menu'); // 'menu' | 'cart'
  const [customizing, setCustomizing] = useState(null); // product object
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const categories = useMemo(() => {
    const byName = {};
    menuData.products.forEach(p => {
      if (!byName[p.category]) byName[p.category] = [];
      byName[p.category].push(p);
    });
    return CATEGORY_ORDER.filter(c => byName[c]).map(c => ({ name: c, products: byName[c] }));
  }, []);

  const goCart = () => {
    setScreen('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="brand-row">
          <img src="logo.jpg" alt="Anthony's Super Kitchen logo" className="brand-logo" />
          <div>
            <h1>{menuData.brand.name}</h1>
            <p className="subtitle">{menuData.brand.subtitle}</p>
          </div>
        </div>
        <button
          className="cart-badge"
          onClick={goCart}
          disabled={cart.totals.count === 0}
        >
          🛍️ {cart.totals.count > 0 ? cart.totals.count : ''}
        </button>
      </header>

      {screen === 'menu' && (
        <div className="screen screen-menu">
          <section className="hero-banner">
            <div className="hero-text">
              <span className="hero-kicker">🔥 HECHO FRESCO · DOMINICAN FAST FOOD</span>
              <h2>Order ahead, skip the line.</h2>
              <p>Pick up at <strong>288 Kearny Ave, Kearny NJ</strong> — or get it delivered.</p>
            </div>
            <div className="hero-badges">
              <span className="hero-badge">🕐 7AM–8PM</span>
              <span className="hero-badge">📞 (201) 428-1745</span>
            </div>
          </section>

          <MenuScreen
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            onCustomize={setCustomizing}
          />
        </div>
      )}

      {screen === 'cart' && (
        <div className="screen screen-cart">
          <CartScreen
            cart={cart}
            onBack={() => setScreen('menu')}
            onCheckout={() => setCheckoutOpen(true)}
          />
        </div>
      )}

      {/* Sticky bottom cart bar (menu screen only, items exist) */}
      {screen === 'menu' && cart.totals.count > 0 && (
        <button className="sticky-cart" onClick={goCart}>
          <span className="sticky-cart-icon">🛍️</span>
          <span className="sticky-cart-label">View Cart · {cart.totals.count} {cart.totals.count === 1 ? 'item' : 'items'}</span>
          <span className="sticky-cart-total">${cart.totals.total.toFixed(2)}</span>
        </button>
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
