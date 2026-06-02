import { useEffect } from 'react';
import Header from '../layout/Header';
import HeroSection from './HeroSection';
import BenefitsSection from './BenefitsSection';
import InfoSection from './InfoSection';
import CompanySection from './CompanySection';
import ContactSection from './ContactSection';
import Footer from '../layout/Footer';
import { footerLinks } from './content';

export default function LandingPage({ onExploreCatalog, onOpenCart, onOpenAuth, initialSection }) {
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

  return (
    <div className="bg-background text-on-surface">
      <Header onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} showCartButton />
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