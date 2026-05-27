import { sidebarLinks } from './data';

export default function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-screen w-64 flex-col border-r border-outline-variant bg-surface-container-low p-4 md:flex dark:bg-primary-container">
      <div className="mb-8 px-1">
        <h1 className="text-headline-md font-black text-primary dark:text-on-primary-container">Panel Admin</h1>
        <p className="text-label-md text-on-surface-variant opacity-70">Gestión NovaxClean</p>
      </div>

      <nav className="flex-1 space-y-2">
        {sidebarLinks.map((link) => (
          <a
            key={link.label}
            className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-all ${
              link.active
                ? 'translate-x-1 bg-secondary-container font-bold text-on-secondary-container dark:bg-secondary dark:text-on-secondary'
                : 'text-on-surface-variant hover:bg-surface-variant dark:hover:bg-primary'
            }`}
            href="#"
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            <span className="text-label-md">{link.label}</span>
          </a>
        ))}
      </nav>

      <div className="border-t border-outline-variant/30 pt-6">
        <button className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-label-md font-bold text-on-primary transition-all hover:opacity-90" type="button">
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nuevo Producto
        </button>
        <a className="flex items-center gap-4 rounded-xl px-4 py-3 text-on-surface-variant transition-colors hover:bg-surface-variant dark:hover:bg-primary" href="#">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-label-md">Configuración</span>
        </a>
        <a className="flex items-center gap-4 rounded-xl px-4 py-3 text-on-surface-variant transition-colors hover:bg-surface-variant dark:hover:bg-primary" href="#">
          <span className="material-symbols-outlined">logout</span>
          <span className="text-label-md">Cerrar Sesión</span>
        </a>
      </div>
    </aside>
  );
}
