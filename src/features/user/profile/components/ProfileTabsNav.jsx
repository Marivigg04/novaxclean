import { Link, useLocation } from 'react-router-dom';
import { MapPin, Package, UserRound } from 'lucide-react';

const PROFILE_TABS = [
  { id: 'perfil', label: 'Mi perfil', href: '/perfil?tab=perfil', icon: UserRound },
  { id: 'pedidos', label: 'Mis pedidos', href: '/perfil?tab=pedidos', icon: Package },
  { id: 'direcciones', label: 'Direcciones', href: '/perfil?tab=direcciones', icon: MapPin },
];

export default function ProfileTabsNav() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const currentTab = params.get('tab') || 'perfil';

  return (
    <nav
      aria-label="Secciones del panel de usuario"
      className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-2"
    >
      {PROFILE_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <Link
            key={tab.id}
            to={tab.href}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors ${
              isActive
                ? 'bg-[var(--color-brand)] text-white shadow-sm'
                : 'text-[var(--color-base-text)]/75 hover:bg-[var(--color-app-panel-hover)]'
            }`}
          >
            <Icon className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
