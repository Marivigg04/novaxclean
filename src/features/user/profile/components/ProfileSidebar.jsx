import { useNavigate } from 'react-router-dom';
import { LogOut, User, MapPin, Package, CreditCard, Settings, Moon, Sun } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';

const items = [
  { key: 'perfil', label: 'Mi Perfil', icon: User },
  { key: 'pedidos', label: 'Mis Pedidos', icon: Package },
  { key: 'direcciones', label: 'Direcciones', icon: MapPin },
  { key: 'pagos', label: 'Métodos de Pago', icon: CreditCard },
  { key: 'preferencias', label: 'Preferencias', icon: Settings },
];

export default function ProfileSidebar({ active = 'perfil', onSelect = () => {} }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
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
    <aside className="w-full shrink-0 flex flex-col justify-between rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-4 shadow-lg lg:w-[280px]">
      <div>
        <div className="mb-6 px-2 pt-2">
          <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-base-text)]/50">Cuenta</p>
          <h2 className="mt-1 text-2xl font-bold text-[var(--color-base-text)]">Mi Dashboard</h2>
        </div>

        <nav className="space-y-1.5">
          {items.map((item) => {
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(item.key)}
                className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-all font-bold ${
                  isActive
                    ? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)] shadow-sm'
                    : 'text-[var(--color-base-text)]/70 hover:bg-[var(--color-app-panel-hover)] hover:text-[var(--color-base-text)]'
                }`}
              >
                <item.icon className="h-[22px] w-[22px]" />
                <span className="text-[15px]">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-10 space-y-2 border-t border-[var(--color-app-panel-border)] pt-6">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[15px] font-bold text-[var(--color-base-text)]/70 transition-all hover:bg-[var(--color-app-panel-hover)] hover:text-[var(--color-base-text)]"
        >
          {theme === 'dark' ? <Sun className="h-[22px] w-[22px]" /> : <Moon className="h-[22px] w-[22px]" />}
          Tema {theme === 'dark' ? 'Claro' : 'Oscuro'}
        </button>
        
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-[15px] font-bold text-error/80 transition-all hover:bg-error-container/30 hover:text-error"
        >
          <LogOut className="h-[22px] w-[22px]" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
