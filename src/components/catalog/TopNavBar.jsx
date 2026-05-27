export default function TopNavBar({ links, onBackToLanding, onOpenCart }) {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-4 md:px-16">
        <div className="flex items-center gap-4">
          <img
            alt="NovaxClean Logo"
            className="h-10 w-auto"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY9WX5RCerwHXn4XDK8ir8ZzsZ3G_dglhe8QEZ1mUyIN_taGiyoh2VuIrtvL3jr_S_aSRTWVtiSYQCK3zoV4Ddn1IM6ec8VJjisH0a49EViOKuZmfi8L9zRkxN-ygT1GFZSgbkW43fTYV8v0tpcdjYFJw3DXIqJkTw7QQcsfo0rMEDnFWnc_wJUiW4alccm8L9VG1I6MjLWa_HViB7_Q5X5FOQyoO9cXoAypb-GqgjPDwkYY738dxGmSV_bJqgV9bv9L_eee_KqWM"
          />
          <button className="text-headline-md font-bold text-primary" type="button" onClick={onBackToLanding}>NovaxClean</button>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((link, index) => (
            <a
              key={link.label}
              className={`text-label-md transition-colors hover:text-secondary ${
                index === 0 ? 'border-b-2 border-secondary pb-1 font-bold text-secondary' : 'text-on-surface-variant'
              }`}
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-label-md font-semibold text-on-surface-variant transition-colors hover:text-secondary" type="button" onClick={onOpenCart}>
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="hidden sm:inline">Carrito</span>
          </button>
          <button className="rounded-xl bg-primary px-5 py-2 text-label-md font-semibold text-on-primary transition-all hover:opacity-90 active:scale-95">
            Iniciar sesión
          </button>
        </div>
      </div>
    </nav>
  );
}