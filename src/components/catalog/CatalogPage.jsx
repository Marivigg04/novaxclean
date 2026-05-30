import { useEffect, useMemo, useState } from 'react';
import { cartItems, filterChips, footerLinks, products } from './data';
import Header from '../layout/Header';
import CatalogHeader from './CatalogHeader';
import FilterBar from './FilterBar';
import ProductGrid from './ProductGrid';
import MiniCart from './MiniCart';
import Footer from '../layout/Footer';
import { useAuth } from '@/context/AuthContext';
import ProfileSidebar from '@/features/user/profile/components/ProfileSidebar';

export default function CatalogPage({ onOpenCart, onOpenAuth }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [guestPromptVisible, setGuestPromptVisible] = useState(false);
  const [guestPromptClosing, setGuestPromptClosing] = useState(false);

  const visibleProducts = useMemo(() => {
    if (activeFilter === 'Todos') {
      return products;
    }

    if (activeFilter === 'Ecológicos') {
      return products.filter((product) => product.badge === 'Eco-Friendly');
    }

    return products;
  }, [activeFilter]);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!guestPromptVisible) {
      return undefined;
    }

    const timer = window.setTimeout(() => setGuestPromptClosing(true), 3200);
    return () => window.clearTimeout(timer);
  }, [guestPromptVisible]);

  useEffect(() => {
    if (!guestPromptClosing) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setGuestPromptVisible(false);
      setGuestPromptClosing(false);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [guestPromptClosing]);

  const hideGuestPrompt = () => {
    if (!guestPromptVisible || guestPromptClosing) {
      return;
    }

    setGuestPromptVisible(false);
    setGuestPromptClosing(false);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      setGuestPromptClosing(false);
      setGuestPromptVisible(true);
      return;
    }

    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {isAuthenticated ? (
        <>
          <ProfileSidebar />
          <Header onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} showCartButton={false} showSearch={false} showThemeToggle={false} showBrand={false} showNavigationLinks={false} showUserName={false} className="md:left-72" />
          <main className="mx-auto w-full max-w-[1600px] px-4 pt-[88px] pb-10 md:px-16 md:pl-80">
            <CatalogHeader />
            <FilterBar filters={filterChips} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <ProductGrid products={visibleProducts} onAddToCart={handleAddToCart} />
          </main>
        </>
      ) : (
        <>
          <Header onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} showCartButton={false} />
          <main className="mx-auto w-full max-w-[1600px] px-4 pt-[88px] pb-10 md:px-16">
            <CatalogHeader />
            <FilterBar filters={filterChips} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <ProductGrid products={visibleProducts} onAddToCart={handleAddToCart} />
          </main>
        </>
      )}

      {isAuthenticated ? (
        <MiniCart
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onToggle={() => setIsCartOpen((value) => !value)}
          items={cartItems}
        />
      ) : null}
      {isAuthenticated ? (
        <div className="md:pl-72">
          <Footer links={footerLinks} />
        </div>
      ) : (
        <Footer links={footerLinks} />
      )}

      {guestPromptVisible ? (
        <div className={`fixed inset-x-0 top-6 z-[60] mx-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur ${guestPromptClosing ? 'guest-prompt-exit' : 'guest-prompt-entrance'}`}>
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-secondary">
              <span className="material-symbols-outlined">lock</span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-on-surface">Debes iniciar sesión o registrarte para comprar</p>
              <p className="mt-1 text-sm text-on-surface-variant">Accede a tu cuenta para añadir productos al carrito y finalizar tu pedido.</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-transform hover:scale-[0.98]"
                  onClick={() => {
                    hideGuestPrompt();
                    if (typeof onOpenAuth === 'function') {
                      onOpenAuth();
                    }
                  }}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container"
                  onClick={() => {
                    hideGuestPrompt();
                    if (typeof onOpenAuth === 'function') {
                      onOpenAuth();
                    }
                  }}
                >
                  Registrarme
                </button>
              </div>
            </div>

            <button
              type="button"
              className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              aria-label="Cerrar aviso"
              onClick={hideGuestPrompt}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}