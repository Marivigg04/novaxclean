const items = [
  { key: 'perfil', label: 'Perfil', icon: 'person' },
  { key: 'seguridad', label: 'Seguridad', icon: 'shield' },
  { key: 'notificaciones', label: 'Notificaciones', icon: 'notifications' },
];

export default function SettingsSidebar({ active = 'perfil', onSelect = () => {} }) {
  return (
    <aside className="w-full shrink-0 rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-3 shadow-[0_12px_30px_-20px_rgba(16,32,58,0.35)] md:w-[240px]">
      <div className="mb-4 px-2 pt-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-base-text)]/45">Ajustes</p>
        <h2 className="mt-1 text-lg font-semibold text-[var(--color-base-text)]">Administración</h2>
      </div>

      <nav className="space-y-1">
        {items.map((item) => {
          const isActive = active === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${
                isActive
                  ? 'bg-[var(--color-app-panel-hover)] text-[var(--color-base-text)] shadow-sm'
                  : 'text-[var(--color-base-text)]/68 hover:bg-[var(--color-app-panel-hover)] hover:text-[var(--color-base-text)]'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
