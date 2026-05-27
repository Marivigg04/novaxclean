import { navigationLinks } from './content';

export default function Header({ onExploreCatalog, onOpenCart }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-outline-variant bg-surface/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-surface/80 transition-all duration-300">
      <nav className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-4 md:px-16">
        <div className="flex items-center gap-4">
          <img
            alt="NovaxClean Logo"
            className="h-10 w-auto"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY9WX5RCerwHXn4XDK8ir8ZzsZ3G_dglhe8QEZ1mUyIN_taGiyoh2VuIrtvL3jr_S_aSRTWVtiSYQCK3zoV4Ddn1IM6ec8VJjisH0a49EViOKuZmfi8L9zRkxN-ygT1GFZSgbkW43fTYV8v0tpcdjYFJw3DXIqJkTw7QQcsfo0rMEDnFWnc_wJUiW4alccm8L9VG1I6MjLWa_HViB7_Q5X5FOQyoO9cXoAypb-GqgjPDwkYY738dxGmSV_bJqgV9bv9L_eee_KqWM"
          />

          <div className="hidden items-center rounded-full border border-outline-variant bg-surface-container px-4 py-2 md:flex">
            <span className="material-symbols-outlined mr-2 text-outline">search</span>
            <input
              className="w-64 border-none bg-transparent text-body-md focus:ring-0"
              placeholder="Busca productos de limpieza..."
              type="text"
            />
            <button className="rounded-full bg-primary px-4 py-1 text-label-md font-bold text-on-primary">
              Buscar
            </button>
          </div>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {navigationLinks.map((link, index) => (
            <a
              key={link.label}
              className={`text-label-md font-bold transition-colors ${
                index === 0
                  ? 'border-b-2 border-secondary pb-1 text-secondary'
                  : 'text-on-surface-variant hover:text-secondary'
              }`}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="hidden rounded-xl border border-primary px-4 py-2 font-bold text-primary transition-colors hover:bg-surface-variant lg:block" type="button" onClick={onExploreCatalog}>
            Ver catálogo
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