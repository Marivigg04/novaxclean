import { useState } from 'react';
import { footerLinks, recommendedItems } from './data';
import Header from '../layout/Header';
import CartTable from './CartTable';
import CartSummary from './CartSummary';
import CartRecommendations from './CartRecommendations';
import Footer from '../layout/Footer';
import CartCheckoutModal from './CartCheckoutModal';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function CartPage({ onBackToCatalog, onOpenCart, onOpenAuth }) {
  const { isAuthenticated } = useAuth();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, taxes, total } = useCart();

  const shippingValue = 0;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} />
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pb-10 pt-[104px] md:px-16 md:pt-[112px]">
        <div className="cart-entrance mb-10">
          <h1 className="mb-2 text-headline-xl font-bold text-primary">Tu Carrito de Compras</h1>
          <p className="text-body-md text-on-surface-variant">Revisa tus productos y optimiza tu inventario para este periodo.</p>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-md">
            <span className="material-symbols-outlined text-outline text-7xl mb-4">shopping_cart</span>
            <h2 className="text-headline-lg font-bold text-primary mb-2">Tu carrito está vacío</h2>
            <p className="text-body-md text-on-surface-variant max-w-sm mb-8">
              Parece que aún no has agregado productos a tu carrito de compras.
            </p>
            <button
              type="button"
              className="rounded-xl bg-primary px-6 py-3 font-bold text-on-primary shadow-lg transition-transform hover:scale-[0.98] active:scale-95"
              onClick={onBackToCatalog}
            >
              Explorar Catálogo
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="cart-entrance w-full lg:w-2/3">
              <CartTable
                items={cart}
                onBackToCatalog={onBackToCatalog}
                onDecreaseQuantity={(itemId) => updateQuantity(itemId, -1)}
                onIncreaseQuantity={(itemId) => updateQuantity(itemId, 1)}
                onRemoveItem={removeFromCart}
                onClearCart={clearCart}
              />
            </div>

            <div className="cart-entrance-delayed w-full lg:w-1/3">
              <CartSummary
                subtotal={subtotal}
                shipping={shippingValue}
                taxes={taxes}
                total={total}
                onOpenCheckout={() => setIsCheckoutOpen(true)}
              />
            </div>
          </div>
        )}

        <div className="cart-entrance-delayed mt-10">
          <CartRecommendations items={recommendedItems} />
        </div>
      </main>

      <Footer links={footerLinks} />

      <CartCheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} onGoToCatalog={onBackToCatalog} />
    </div>
  );
}
