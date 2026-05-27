import { useEffect, useState } from 'react';
import LandingPage from './components/landing/LandingPage';
import CatalogPage from './components/catalog/CatalogPage';
import CartPage from './components/cart/CartPage';

export default function App() {
  const getViewFromHash = () => {
    if (window.location.hash === '#catalogo') {
      return 'catalogo';
    }

    if (window.location.hash === '#carrito') {
      return 'carrito';
    }

    return 'landing';
  };

  const [currentView, setCurrentView] = useState(getViewFromHash);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentView(getViewFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (currentView === 'catalogo') {
    return <CatalogPage onBackToLanding={() => (window.location.hash = '')} onOpenCart={() => (window.location.hash = '#carrito')} />;
  }

  if (currentView === 'carrito') {
    return <CartPage onBackToLanding={() => (window.location.hash = '')} onBackToCatalog={() => (window.location.hash = '#catalogo')} />;
  }

  return <LandingPage onExploreCatalog={() => (window.location.hash = '#catalogo')} onOpenCart={() => (window.location.hash = '#carrito')} />;
}