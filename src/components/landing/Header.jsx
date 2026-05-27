import { navigationLinks } from './content';

export default function Header({ onOpenCart, onOpenAuth }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-outline-variant bg-surface/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-surface/80 transition-all duration-300">
      <nav className="mx-auto flex w-full max-w-[1280px] items-center gap-6 px-4 py-4 md:px-16 md:py-5">
        <div className="shrink-0">
          <span className="text-lg font-bold">NovaxClean</span>
        </div>

        <div className="hidden min-w-0 flex-1 lg:flex-[6] items-center rounded-full border border-outline-variant bg-surface-container px-4 py-1 lg:flex">
          <span className="material-symbols-outlined mr-2 text-outline">search</span>
          <input
            className="min-w-0 flex-1 border-none bg-transparent text-xs placeholder:text-xs focus:ring-0"
            placeholder="Busca productos de limpieza..."
            type="text"
          />
          <button className="rounded-full bg-primary px-2.5 py-1.5 !text-xs !leading-none font-normal text-on-primary">
            Buscar
          </button>
        </div>

        <div className="hidden items-center gap-6 lg:flex flex-none">
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

        <div className="ml-auto flex items-center gap-3 shrink-0">
          <button className="hidden rounded-xl bg-secondary px-6 py-2 font-bold text-on-secondary shadow-sm transition-transform duration-100 hover:scale-95 lg:block" type="button" onClick={onOpenAuth}>
            Iniciar sesión
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-secondary px-6 py-2 font-bold text-on-secondary shadow-sm transition-transform duration-100 hover:scale-95" type="button" onClick={onOpenCart}>
            <span className="material-symbols-outlined">shopping_cart</span>
            Carrito
          </button>
        </div>
      </nav>
    </header>
  );
}