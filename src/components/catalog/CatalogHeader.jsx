export default function CatalogHeader() {
  return (
    <header className="mb-8 flex flex-col items-end justify-between gap-6 md:flex-row md:items-end">
      <div>
        <h1 className="mb-2 text-headline-xl font-bold text-primary">Catálogo de Productos</h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">
          Soluciones químicas de alta precisión para limpieza industrial y residencial. Purity, reliability, efficiency.
        </p>
      </div>

      <div className="relative w-full max-w-md">
        <input
          className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-5 py-3 pr-12 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
          placeholder="Buscar producto..."
          type="text"
        />
        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline">search</span>
      </div>
    </header>
  );
}