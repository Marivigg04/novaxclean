export default function CartRecommendations({ items }) {
  return (
    <section className="cart-subtle-float mt-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-headline-md font-semibold text-primary">Productos similares</h2>
        <a className="text-label-md font-bold text-secondary hover:underline" href="/catalogo">
          Ver catálogo 
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="grid gap-6 md:col-span-2 md:grid-cols-2">
          {items.slice(0, 2).map((item) => (
            <article key={item.name} className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-4 transition-all hover:shadow-lg">
              <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-surface-container">
                <img alt={item.name} className="h-full w-full object-cover" src={item.image} />
              </div>
              <p className="text-label-md font-bold text-primary">{item.name}</p>
              <p className="text-xs text-on-surface-variant">{item.subtitle}</p>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="font-black text-primary">{item.price}</span>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-on-secondary transition-transform hover:scale-110" type="button">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </article>
          ))}
        </div>

        {items.map((item) => (
          <article key={item.name} className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-4 transition-all hover:shadow-lg">
            <div className="mb-4 aspect-square overflow-hidden rounded-lg bg-surface-container">
              <img alt={item.name} className="h-full w-full object-cover" src={item.image} />
            </div>
            <p className="text-label-md font-bold text-primary">{item.name}</p>
            <p className="text-xs text-on-surface-variant">{item.subtitle}</p>
            <div className="mt-auto flex items-center justify-between pt-4">
              <span className="font-black text-primary">{item.price}</span>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-on-secondary transition-transform hover:scale-110" type="button">
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
