import { useMemo, useState } from 'react';
import menuData from './data/menu.json';
import { useCart } from './store/useCart.js';
import MenuScreen from './components/MenuScreen.jsx';
import CustomizeModal from './components/CustomizeModal.jsx';
import CartScreen from './components/CartScreen.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';

const CATEGORY_ORDER = ['Yaroas', 'Chimis', 'Mofongos', 'Pica Pollo'];

export default function App() {
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
          onClick={() => setScreen('cart')}
          disabled={cart.totals.count === 0}
        >
          🛍️ {cart.totals.count > 0 ? cart.totals.count : ''}
        </button>
      </header>

      {screen === 'menu' && (
        <MenuScreen
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onCustomize={setCustomizing}
        />
      )}

      {screen === 'cart' && (
        <CartScreen
          cart={cart}
          onBack={() => setScreen('menu')}
          onCheckout={() => setCheckoutOpen(true)}
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
