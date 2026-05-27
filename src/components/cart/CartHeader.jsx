export default function CartHeader({ onBackToLanding }) {
  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface-container-lowest shadow-sm">
      <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between px-4 py-4 md:px-16">
        <div className="flex items-center gap-8">
          <button className="flex items-center gap-3" type="button" onClick={onBackToLanding}>
            <img
              alt="NovaxClean Logo"
              className="h-10 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY9WX5RCerwHXn4XDK8ir8ZzsZ3G_dglhe8QEZ1mUyIN_taGiyoh2VuIrtvL3jr_S_aSRTWVtiSYQCK3zoV4Ddn1IM6ec8VJjisH0a49EViOKuZmfi8L9zRkxN-ygT1GFZSgbkW43fTYV8v0tpcdjYFJw3DXIqJkTw7QQcsfo0rMEDnFWnc_wJUiW4alccm8L9VG1I6MjLWa_HViB7_Q5X5FOQyoO9cXoAypb-GqgjPDwkYY738dxGmSV_bJqgV9bv9L_eee_KqWM"
            />
            <span className="text-headline-md font-bold text-primary">NovaxClean</span>
          </button>
          <nav className="hidden gap-6 md:flex">
            <a className="text-label-md font-semibold text-on-surface-variant transition-colors hover:text-secondary" href="#catalogo">Catálogo</a>
            <a className="text-label-md font-semibold text-on-surface-variant transition-colors hover:text-secondary" href="#informacion">Información</a>
            <a className="text-label-md font-semibold text-on-surface-variant transition-colors hover:text-secondary" href="#empresa">Empresa</a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 border-b-2 border-secondary pb-1 text-label-md font-bold text-secondary" type="button">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
            Carrito
            <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] text-on-secondary">3</span>
          </button>
          <button className="rounded-lg bg-primary px-6 py-2 text-label-md font-bold text-on-primary transition-all hover:opacity-90 active:scale-95" type="button" onClick={onBackToLanding}>
            Iniciar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
