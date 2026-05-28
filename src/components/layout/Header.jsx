import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigationLinks } from '../landing/content';
import { ThemeToggle } from '../../shared/ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export default function Header({ onOpenCart, onOpenAuth, showCartButton = true, showSearch = true, className = '' }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 border-b border-outline-variant bg-surface/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-surface/80 transition-all duration-300 ${className}`}>
      <nav className="mx-auto flex w-full max-w-[1280px] items-center gap-4 px-4 py-4 md:px-16 md:py-5">
        {!isAuthenticated && (
          <div className="shrink-0">
            <span className="text-lg font-bold">NovaxClean</span>
          </div>
        )}

        {showSearch ? (
          <div className="hidden min-w-0 flex-[1_1_900px] items-center gap-3 rounded-full border border-outline-variant bg-surface-container px-4 py-1 lg:flex lg:max-w-none">
          <span className="material-symbols-outlined shrink-0 text-outline">search</span>
          <input
            className="min-w-0 flex-[1_1_700px] border-none bg-transparent pr-3 text-xs placeholder:text-xs focus:ring-0"
            placeholder="Busca productos..."
            type="text"
          />
          <button className="shrink-0 whitespace-nowrap rounded-full bg-primary px-4 py-1 !text-xs !leading-none font-normal text-on-primary transition-all duration-200 ease-out hover:scale-110 hover:shadow-xl hover:shadow-primary/30 active:scale-95" type="button">
            Buscar
          </button>
          </div>
        ) : null}

        {!isAuthenticated && (
          <div className="hidden flex-none items-center gap-6 lg:flex">
            {navigationLinks.map((link) => (
              <a
                key={link.label}
                className="text-label-md font-bold text-on-surface-variant transition-colors hover:text-secondary"
                href={link.href}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <div className="relative">
              <button
                className="flex items-center gap-3 rounded-full px-3 py-1 text-sm font-medium hover:bg-surface-container"
                onClick={() => setMenuOpen((s) => !s)}
                type="button"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-on-primary font-bold">{user?.avatar ?? user?.name?.[0]}</div>
                <span className="hidden sm:inline">{user?.name}</span>
              </button>

              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-40 rounded-md border border-outline-variant bg-surface-container-lowest shadow-lg">
                  <button className="w-full px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </div>
              ) : null}
            </div>
          ) : (
            <button className="hidden rounded-xl bg-secondary px-6 py-2 font-bold text-on-secondary shadow-sm transition-transform duration-100 hover:scale-95 lg:block" type="button" onClick={onOpenAuth}>
              Iniciar sesión
            </button>
          )}

          {/* hide cart when authenticated */}
          {!isAuthenticated && showCartButton ? (
            <button className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-2 font-bold text-on-secondary shadow-sm transition-transform duration-100 hover:scale-95" type="button" onClick={onOpenCart}>
              <span className="material-symbols-outlined">shopping_cart</span>
              Carrito
            </button>
          ) : null}
        </div>
      </nav>
    </header>
  );
}