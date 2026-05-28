export default function SideNavBar({ links }) {
  return (
    <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-64 shrink-0 border-r border-outline-variant bg-surface-container-low p-4 lg:flex lg:flex-col">
      <div className="mb-8 px-1">
        <p className="mb-1 text-label-md uppercase tracking-widest text-outline">Panel Admin</p>
        <h3 className="text-headline-md font-black text-primary">Gestión</h3>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <a
            key={link.label}
            className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-colors ${
              link.active
                ? 'translate-x-1 bg-secondary-container font-bold text-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-variant'
            }`}
            href={link.href}
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            <span className="text-label-md">{link.label}</span>
          </a>
        ))}
      </nav>

      <button className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-secondary py-3 font-bold text-on-secondary shadow-sm transition-all hover:brightness-110 active:scale-95">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          add_circle
        </span>
        Nuevo Producto
      </button>

      <div className="mt-auto space-y-2 border-t border-outline-variant pt-4">
        <a className="flex items-center gap-4 rounded-xl px-4 py-3 text-on-surface-variant transition-colors hover:bg-surface-variant" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-label-md">Configuración</span>
        </a>
        <a className="flex items-center gap-4 rounded-xl px-4 py-3 text-error transition-colors hover:bg-error-container" href="#">
          <span className="material-symbols-outlined">logout</span>
          <span className="text-label-md">Cerrar Sesión</span>
        </a>
      </div>
    </aside>
  );
}