import Header from './Header';
import HeroSection from './HeroSection';
import BenefitsSection from './BenefitsSection';
import InfoSection from './InfoSection';
import CompanySection from './CompanySection';
import ContactSection from './ContactSection';
import Footer from './Footer';

export default function LandingPage({ onExploreCatalog, onOpenCart }) {
  return (
    <div className="bg-background text-on-surface">
      <Header onExploreCatalog={onExploreCatalog} onOpenCart={onOpenCart} />
      <main className="pt-24">
        <HeroSection onExploreCatalog={onExploreCatalog} />
        <BenefitsSection />
        <InfoSection />
        <CompanySection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}