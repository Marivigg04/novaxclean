import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('novaxclean_cart');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse cart from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('novaxclean_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      let nextCart;

      if (existingIndex > -1) {
        nextCart = prev.map((item, idx) => {
          if (idx !== existingIndex) return item;
          const nextQty = item.quantity + quantity;
          return {
            ...item,
            quantity: nextQty,
            subtotal: `$${(item.rawPrice * nextQty).toFixed(2)}`,
            pulse: 'increase',
          };
        });
      } else {
        const refLabel = `${product.sku} | ${product.category || 'Limpieza'}`;
        nextCart = [
          ...prev,
          {
            id: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            rawPrice: product.rawPrice,
            quantity,
            subtotal: `$${(product.rawPrice * quantity).toFixed(2)}`,
            image: product.image,
            ref: refLabel,
            pulse: '',
          },
        ];
      }

      return nextCart;
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id !== productId) return item;

        const nextQuantity = Math.max(1, item.quantity + delta);
        return {
          ...item,
          quantity: nextQuantity,
          subtotal: `$${(item.rawPrice * nextQuantity).toFixed(2)}`,
          pulse: delta > 0 ? 'increase' : 'decrease',
        };
      })
    );

    // Reset pulse effect after short delay
    setTimeout(() => {
      setCart((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, pulse: '' } : item))
      );
    }, 180);
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = cart.reduce((total, item) => total + item.rawPrice * item.quantity, 0);
  const taxes = subtotal * 0.16;
  const total = subtotal + taxes;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        taxes,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
