export default function ProductCard({ product }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest cloud-shadow transition-all duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-variant">
        <img
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          data-alt="Product image for NovaxClean"
          src={product.image}
        />

        {product.badge ? (
          <div className="absolute left-4 top-4">
            <span className={`rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${product.badgeClass}`}>
              {product.badge}
            </span>
          </div>
        ) : null}
      </div>

      <div className="p-6">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h4 className="text-headline-md font-semibold text-primary">{product.name}</h4>
          <span className="text-headline-md font-bold text-primary">{product.price}</span>
        </div>

        <p className="mb-6 text-body-md text-on-surface-variant">{product.description}</p>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 text-secondary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              star
            </span>
            <span className="text-label-md font-semibold">{product.rating}</span>
          </div>

          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-on-primary shadow-md transition-all hover:bg-secondary active:scale-90" type="button">
            <span className="material-symbols-outlined">add_shopping_cart</span>
          </button>
        </div>
      </div>
    </article>
  );
}