export default function CartRecommendations({ items }) {
  return (
    <section className="mt-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="text-headline-md font-semibold text-primary">Optimiza tu Stock (Recomendaciones B2B)</h2>
        <a className="text-label-md font-bold text-secondary hover:underline" href="#catalogo">
          Ver catálogo mayorista
        </a>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl bg-primary-container p-6 text-on-primary-container md:col-span-2">
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-bold tracking-wider text-on-secondary">OFERTA VOLUMEN</span>
              <h3 className="mt-4 text-headline-md font-bold">Kit de Sanitización Industrial</h3>
              <p className="mt-2 text-body-md opacity-80">Ahorra un 15% adicional al completar el lote de 24 unidades.</p>
            </div>
            <button className="mt-8 self-start rounded-lg bg-surface-container-lowest px-6 py-2 font-bold text-primary transition-all hover:bg-secondary hover:text-on-secondary" type="button">
              Añadir al Lote
            </button>
          </div>
          <div className="absolute -right-10 -bottom-10 opacity-20 transition-transform group-hover:scale-110">
            <span className="material-symbols-outlined text-[180px]">inventory_2</span>
          </div>
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
