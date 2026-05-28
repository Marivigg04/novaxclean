import { cartItems, footerLinks, recommendedItems } from './data';
import Header from '../layout/Header';
import CartTable from './CartTable';
import CartSummary from './CartSummary';
import CartRecommendations from './CartRecommendations';
import Footer from '../layout/Footer';

export default function CartPage({ onBackToLanding, onBackToCatalog, onOpenCart, onOpenAuth }) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} showCartButton={false} />
      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-10 pt-24 md:px-16">
        <div className="mb-10">
          <h1 className="mb-2 text-headline-xl font-bold text-primary">Tu Carrito de Compras</h1>
          <p className="text-body-md text-on-surface-variant">Revisa tus productos y optimiza tu inventario para este periodo.</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full lg:w-2/3">
            <CartTable items={cartItems} onBackToCatalog={onBackToCatalog} />
          </div>

          <div className="w-full lg:w-1/3">
            <CartSummary />
          </div>
        </div>

        <CartRecommendations items={recommendedItems} />
      </main>
      <Footer links={footerLinks} />
    </div>
  );
}
