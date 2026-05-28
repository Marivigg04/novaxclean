import { useMemo, useState } from 'react';
import { cartItems, filterChips, footerLinks, products, sidebarLinks } from './data';
import Header from '../landing/Header';
import SideNavBar from './SideNavBar';
import CatalogHeader from './CatalogHeader';
import FilterBar from './FilterBar';
import ProductGrid from './ProductGrid';
import MiniCart from './MiniCart';
import CatalogFooter from './CatalogFooter';

export default function CatalogPage({ onBackToLanding, onOpenCart, onOpenAuth }) {
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

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} />
      <div className="flex pt-[72px]">
        <SideNavBar links={sidebarLinks} />
        <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-10 md:px-16">
          <CatalogHeader />
          <FilterBar filters={filterChips} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <ProductGrid products={visibleProducts} />
        </main>
      </div>

      <MiniCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onToggle={() => setIsCartOpen((value) => !value)}
        items={cartItems}
      />
      <CatalogFooter links={footerLinks} onBackToLanding={onBackToLanding} />
    </div>
  );
}