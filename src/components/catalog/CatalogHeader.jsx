export default function CatalogHeader({ searchValue, onSearchChange, onSearchSubmit }) {
  return (
    <header className="mb-8 flex flex-col items-end justify-between gap-6 md:flex-row md:items-end">
      <div className="mt-10">
        <h1 className="mb-2 text-3xl font-bold text-primary">Catálogo de Productos</h1>
        <p className="max-w-2xl text-body-lg text-on-surface-variant">
          Soluciones químicas de alta precisión para limpieza industrial y residencial. Purity, reliability, efficiency.
        </p>
      </div>

      <form
        className="relative w-full max-w-md"
        onSubmit={(event) => {
          event.preventDefault();
          if (typeof onSearchSubmit === 'function') {
            onSearchSubmit();
          }
        }}
      >
        <input
          className="site-search-input w-full rounded-xl border-2 border-black/50 bg-surface-container-lowest px-5 py-3 pr-12 text-on-surface shadow-sm outline-none transition-all duration-300 ease-out focus:border-black focus:ring-4 focus:ring-black/15 focus:shadow-[0_0_0_1px_rgba(0,0,0,0.2)]"
          placeholder="Buscar producto..."
          type="search"
          maxLength={40}
          value={searchValue}
          onChange={(event) => {
            if (typeof onSearchChange === 'function') {
              onSearchChange(event.target.value);
            }
          }}
        />
        <button
          aria-label="Buscar productos"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-primary"
          type="submit"
        >
          <span className="material-symbols-outlined">search</span>
        </button>
      </form>
    </header>
  );
}