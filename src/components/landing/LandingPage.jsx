import Header from './Header';
import HeroSection from './HeroSection';
import BenefitsSection from './BenefitsSection';
import InfoSection from './InfoSection';
import CompanySection from './CompanySection';
import ContactSection from './ContactSection';
import Footer from './Footer';

export default function LandingPage({ onExploreCatalog, onOpenCart, onOpenAuth }) {
  return (
    <div className="bg-background text-on-surface">
      <Header onExploreCatalog={onExploreCatalog} onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} />
      <main className="pt-16 lg:pt-20">
        <HeroSection onExploreCatalog={onExploreCatalog} onOpenAuth={onOpenAuth} />
        <BenefitsSection />
        <InfoSection />
        <CompanySection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}