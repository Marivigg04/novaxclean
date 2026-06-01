import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../layout/Header';
import HeroSection from './HeroSection';
import BenefitsSection from './BenefitsSection';
import InfoSection from './InfoSection';
import CompanySection from './CompanySection';
import ContactSection from './ContactSection';
import Footer from '../layout/Footer';
import { footerLinks } from './content';
import { products } from '../catalog/data';

export default function LandingPage({ onExploreCatalog, onOpenCart, onOpenAuth, initialSection }) {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const searchSuggestions = Array.from(
    new Set(products.flatMap((product) => [product.name, product.category].filter(Boolean))),
  );

  useEffect(() => {
    if (!initialSection || typeof document === 'undefined') {
      return undefined;
    }

    const target = document.getElementById(initialSection);

    if (!target) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialSection]);

  const handleSearchSubmit = (nextQuery = searchValue) => {
    const query = String(nextQuery ?? '').trim();
    navigate(query ? `/catalogo?q=${encodeURIComponent(query)}` : '/catalogo');
  };

  return (
    <div className="bg-background text-on-surface">
      <Header
        onOpenCart={onOpenCart}
        onOpenAuth={onOpenAuth}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        searchSuggestions={searchSuggestions}
        showCartButton
      />
      <main className="pt-16 lg:pt-20">
        <HeroSection onExploreCatalog={onExploreCatalog} onOpenAuth={onOpenAuth} />
        <BenefitsSection />
        <InfoSection />
        <CompanySection />
        <ContactSection />
      </main>
      <Footer links={footerLinks} />
    </div>
  );
}