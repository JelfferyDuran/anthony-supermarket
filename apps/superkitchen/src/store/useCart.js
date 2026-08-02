import { useCallback, useMemo, useState } from 'react';

/**
 * Cart state for the Super Kitchen Mini App.
 * Cart items look like:
 * {
 *   key: string,           // unique line id
 *   productId, name, basePrice,
 *   meat: {id,name,priceDelta} | null,
 *   side: {id,name} | null,
 *   qty: number,
 *   unitPrice: number,     // base + meat delta
 * }
 */
export function useCart() {
  const [items, setItems] = useState([]);

  const addItem = useCallback((item) => {
    setItems(prev => {
      const existing = prev.find(
        i => i.productId === item.productId &&
             i.meat?.id === item.meat?.id &&
             i.side?.id === item.side?.id
      );
      if (existing) {
        return prev.map(i =>
          i.key === existing.key ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      return [...prev, { ...item, key: `${item.productId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }];
    });
  }, []);

  const updateItem = useCallback((key, patch) => {
    setItems(prev => prev.map(i => (i.key === key ? { ...i, ...patch } : i)));
  }, []);

  const removeItem = useCallback((key) => {
    setItems(prev => prev.filter(i => i.key !== key));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
    return {
      subtotal,
      count: items.reduce((sum, i) => sum + i.qty, 0),
    };
  }, [items]);

  return { items, addItem, updateItem, removeItem, clearCart, totals };
}
