import { cartItems, footerLinks, recommendedItems } from './data';
import Header from '../landing/Header';
import CartTable from './CartTable';
import CartSummary from './CartSummary';
import CartRecommendations from './CartRecommendations';
import CartFooter from './CartFooter';
import CartCheckoutModal from './CartCheckoutModal';

import { useState } from 'react';

const initialCartItems = cartItems.map((item) => ({ ...item }));

const getPriceValue = (price) => Number(price.replace(/[^0-9.]/g, ''));

const formatCurrency = (value) => `$${value.toFixed(2)}`;

export default function CartPage({ onBackToLanding, onBackToCatalog, onOpenCart, onOpenAuth }) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [items, setItems] = useState(initialCartItems);

  const subtotalValue = items.reduce((total, item) => total + getPriceValue(item.subtotal), 0);
  const shippingValue = 0;
  const taxesValue = subtotalValue * 0.16;
  const totalValue = subtotalValue + shippingValue + taxesValue;

  const updateQuantity = (itemName, delta) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.name !== itemName) {
          return item;
        }

        const nextQuantity = Math.max(1, item.quantity + delta);
        const priceValue = getPriceValue(item.price);

        return {
          ...item,
          quantity: nextQuantity,
          subtotal: formatCurrency(priceValue * nextQuantity),
          pulse: delta > 0 ? 'increase' : 'decrease',
        };
      }),
    );

    window.setTimeout(() => {
      setItems((currentItems) =>
        currentItems.map((item) => (item.name === itemName ? { ...item, pulse: '' } : item)),
      );
    }, 180);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header onBackToLanding={onBackToLanding} onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pb-10 pt-[104px] md:px-16 md:pt-[112px]">
        <div className="cart-entrance mb-10">
          <h1 className="mb-2 text-headline-xl font-bold text-primary">Tu Carrito de Compras</h1>
          <p className="text-body-md text-on-surface-variant">Revisa tus productos y optimiza tu inventario para este periodo.</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="cart-entrance w-full lg:w-2/3">
            <CartTable items={items} onBackToCatalog={onBackToCatalog} onDecreaseQuantity={(itemName) => updateQuantity(itemName, -1)} onIncreaseQuantity={(itemName) => updateQuantity(itemName, 1)} />
          </div>

          <div className="cart-entrance-delayed w-full lg:w-1/3">
            <CartSummary subtotal={subtotalValue} shipping={shippingValue} taxes={taxesValue} total={totalValue} onOpenCheckout={() => setIsCheckoutOpen(true)} />
          </div>
        </div>

        <div className="cart-entrance-delayed">
          <CartRecommendations items={recommendedItems} />
        </div>
      </main>
      <CartFooter links={footerLinks} onBackToLanding={onBackToLanding} />
      <CartCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}
