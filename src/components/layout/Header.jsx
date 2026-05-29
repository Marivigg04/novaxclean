import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { navigationLinks } from '../landing/content';
import { ThemeToggle } from '../../shared/ThemeToggle';
import UserAvatarIcon from '../../shared/UserAvatarIcon';
import { useAuth } from '../../context/AuthContext';
import Notification from '../../shared/Notification';
import { inventoryProducts } from '../../features/admin/inventory/data/mockup';

export default function Header({ onOpenCart, onOpenAuth, showCartButton = true, showSearch = true, className = '' }) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notifications = useMemo(() => {
    const lowStock = inventoryProducts
      .filter((product) => product.status === 'Stock bajo')
      .slice(0, 3)
      .map((product, index) => ({
        id: `low-${product.sku}`,
        type: 'warning',
        title: 'Stock bajo',
        message: `${product.name} tiene ${product.stock} unidades y requiere reposición pronto.`,
        time: `${index + 1} h atrás`,
      }));

    const outOfStock = inventoryProducts
      .filter((product) => product.status === 'Agotado')
      .slice(0, 3)
      .map((product, index) => ({
        id: `out-${product.sku}`,
        type: 'danger',
        title: 'Producto agotado',
        message: `${product.name} se agotó y ya no está disponible en inventario.`,
        time: `${index + 2} h atrás`,
      }));

    return [...lowStock, ...outOfStock];
  }, []);

  const handleLogout = () => {
    logout();
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
            <div className="relative flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  aria-label="Notificaciones"
                  onClick={() => setNotificationsOpen((current) => !current)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
                </button>

                {notificationsOpen ? (
                  <Notification notifications={notifications} onClose={() => setNotificationsOpen(false)} />
                ) : null}
              </div>

              <div className="relative">
                <div className="flex items-center gap-3 rounded-full px-3 py-1 text-sm font-medium">
                  <UserAvatarIcon avatar={user?.avatar} name={user?.name} size="sm" />
                  <span className="hidden sm:inline">{user?.name}</span>
                </div>
              </div>
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