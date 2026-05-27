import { useEffect, useState } from 'react';
import LandingPage from './components/landing/LandingPage';
import CatalogPage from './components/catalog/CatalogPage';
import CartPage from './components/cart/CartPage';
import AuthPage from './components/AuthPage';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (window.location.hash === '#catalogo') {
      return 'catalogo';
    }

    if (window.location.hash === '#carrito') {
      return 'carrito';
    }

    if (window.location.hash === '#auth') {
      return 'auth';
    }

    return 'landing';
  });

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#catalogo') {
        setCurrentView('catalogo');
        return;
      }

      if (window.location.hash === '#carrito') {
        setCurrentView('carrito');
        return;
      }

      if (window.location.hash === '#auth') {
        setCurrentView('auth');
        return;
      }

      setCurrentView('landing');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view, hash = '') => {
    setCurrentView(view);
    window.location.hash = hash;
  };

  if (currentView === 'catalogo') {
    return <CatalogPage onBackToLanding={() => navigateTo('landing')} onOpenCart={() => navigateTo('carrito', '#carrito')} />;
  }

  if (currentView === 'carrito') {
    return <CartPage onBackToLanding={() => navigateTo('landing')} onBackToCatalog={() => navigateTo('catalogo', '#catalogo')} />;
  }

  if (currentView === 'auth') {
    return <AuthPage onBackToLanding={() => navigateTo('landing')} />;
  }

  return <LandingPage onExploreCatalog={() => navigateTo('catalogo', '#catalogo')} onOpenCart={() => navigateTo('carrito', '#carrito')} onOpenAuth={() => navigateTo('auth', '#auth')} />;
}