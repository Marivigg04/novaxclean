import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, MapPin, Package, CreditCard, Settings, Moon, Sun, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import logoAumc from '@/assets/Logo AUMC.png';
import logoAumo from '@/assets/Logo AUMO.png';

const items = [
  { key: 'perfil', label: 'Mi Perfil', icon: User, to: '/perfil' },
  { key: 'pedidos', label: 'Mis Pedidos', icon: Package, to: '/perfil?tab=pedidos' },
  { key: 'direcciones', label: 'Direcciones', icon: MapPin, to: '/perfil?tab=direcciones' },
  { key: 'pagos', label: 'Métodos de Pago', icon: CreditCard, to: '/perfil?tab=pagos' },
  { key: 'catalogo', label: 'Catálogo', icon: ShoppingCart, to: '/catalogo' },
  { key: 'preferencias', label: 'Preferencias', icon: Settings, to: '/perfil?tab=preferencias' },
];

export default function ProfileSidebar({ active, onSelect = () => {} }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col overflow-hidden border-r border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] text-[var(--color-base-text)] shadow-2xl" style={{ fontFamily: 'Inter, sans-serif' }} aria-label="Sidebar de usuario">
      <div className="flex h-20 items-center border-b border-[var(--color-app-panel-border)] px-5">
        <div className="flex items-center gap-3">
          <img alt="Logo AUMC" src={logoAumc} className="sidebar-logo-light h-20 w-20 rounded-xl object-cover" />
          <img alt="Logo AUMO" src={logoAumo} className="sidebar-logo-dark h-20 w-20 rounded-xl object-cover" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-base-text)]/50">Cuenta</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--color-base-text)]">Mi Dashboard</h2>
          </div>
        </div>
      </div>

      <nav className="px-3 py-4 pb-6">
        {items.map((item) => {
          // determine active by current pathname and tab query
          const isActive = (() => {
            try {
              const locPath = location.pathname;
              const params = new URLSearchParams(location.search);
              if (item.to) {
                const toUrl = new URL(item.to, 'http://example');
                if (toUrl.pathname === locPath) {
                  // if `to` has a tab, compare with current tab
                  const toTab = toUrl.searchParams.get('tab');
                  const locTab = params.get('tab');
                  if (toTab) {
                    return toTab === locTab;
                  }

                  // `to` has no tab: only active when the current location also has no tab
                  if (locTab) {
                    return false;
                  }

                  return true;
                }
                }
                } catch (e) {
              // fallback
            }
                // only fallback to provided `active` prop when it's explicitly provided
                return typeof active !== 'undefined' ? active === item.key : false;
          })();
          const Icon = item.icon;

          const handleClick = () => {
            if (item.to) {
              navigate(item.to);
              return;
            }

            // fallback: if no `to`, navigate to perfil and select
            navigate('/perfil');
            onSelect(item.key);
          };

          return (
            <button
              key={item.key}
              type="button"
              onClick={handleClick}
              className="group relative mb-2 flex w-full items-center gap-3 overflow-hidden rounded-xl px-3 py-3 text-left transition-all duration-200 focus:outline-none"
              style={{
                backgroundColor: isActive ? 'color-mix(in srgb, var(--color-brand) 16%, transparent)' : 'transparent',
                color: isActive ? 'var(--color-base-text)' : 'color-mix(in srgb, var(--color-base-text) 72%, transparent)',
                boxShadow: isActive ? 'inset 0 0 0 1px var(--color-app-panel-border)' : 'none',
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className={`absolute left-0 top-2 bottom-2 w-1 origin-center rounded-r-full bg-[var(--color-brand)] transition-all duration-200 ${isActive ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 group-hover:scale-y-100 group-hover:opacity-100'}`} />
              <Icon className="relative z-10 h-[22px] w-[22px]" />
              <span className="relative z-10 flex-1 text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 border-t border-[var(--color-app-panel-border)] px-3 py-4 pb-6">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-[var(--color-base-text)]/70 transition-all hover:bg-[var(--color-app-panel-hover)] hover:text-[var(--color-base-text)]"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          Tema {theme === 'dark' ? 'Claro' : 'Oscuro'}
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-error/80 transition-all hover:bg-error-container/30 hover:text-error"
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
