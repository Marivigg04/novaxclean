import Header from '../layout/Header';
import HeroSection from './HeroSection';
import BenefitsSection from './BenefitsSection';
import InfoSection from './InfoSection';
import CompanySection from './CompanySection';
import ContactSection from './ContactSection';
import Footer from '../layout/Footer';
import { footerLinks } from './content';

export default function LandingPage({ onExploreCatalog, onOpenCart, onOpenAuth }) {
  return (
    <div className="bg-background text-on-surface">
      <Header onOpenCart={onOpenCart} onOpenAuth={onOpenAuth} showCartButton={false} />
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