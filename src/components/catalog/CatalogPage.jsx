import { useMemo, useState } from 'react';
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

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {isAuthenticated ? (
        <>
          <ProfileSidebar />
          <Header onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} showCartButton={false} showSearch={false} showThemeToggle={false} showBrand={false} showNavigationLinks={false} showUserName={false} className="md:left-72" />
          <main className="mx-auto w-full max-w-[1600px] px-4 pt-[88px] pb-10 md:px-16 md:pl-80">
            <CatalogHeader />
            <FilterBar filters={filterChips} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <ProductGrid products={visibleProducts} />
          </main>
        </>
      ) : (
        <>
          <Header onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} showCartButton={false} />
          <main className="mx-auto w-full max-w-[1600px] px-4 pt-[88px] pb-10 md:px-16">
            <CatalogHeader />
            <FilterBar filters={filterChips} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
            <ProductGrid products={visibleProducts} />
          </main>
        </>
      )}

      <MiniCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onToggle={() => setIsCartOpen((value) => !value)}
        items={cartItems}
      />
      {isAuthenticated ? (
        <div className="md:pl-72">
          <Footer links={footerLinks} />
        </div>
      ) : (
        <Footer links={footerLinks} />
      )}
    </div>
  );
}