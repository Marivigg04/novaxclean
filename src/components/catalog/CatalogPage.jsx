import { useMemo, useState } from 'react';
import { cartItems, filterChips, footerLinks, products } from './data';
import Header from '../layout/Header';
import CatalogHeader from './CatalogHeader';
import FilterBar from './FilterBar';
import ProductGrid from './ProductGrid';
import MiniCart from './MiniCart';
import Footer from '../layout/Footer';

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

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} />
      <main className="mx-auto w-full max-w-[1280px] px-4 pt-[88px] pb-10 md:px-16">
        <CatalogHeader />
        <FilterBar filters={filterChips} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        <ProductGrid products={visibleProducts} />
      </main>

      <MiniCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onToggle={() => setIsCartOpen((value) => !value)}
        items={cartItems}
      />
      <Footer links={footerLinks} />
    </div>
  );
}