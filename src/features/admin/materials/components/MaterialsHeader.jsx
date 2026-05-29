import { FileDown, Plus, Search } from 'lucide-react';

const views = [
  { value: 'insumos', label: 'Inventario de Insumos' },
  { value: 'formulas', label: 'Fórmulas de Producción' },
];

export default function MaterialsHeader({ search, setSearch, activeView, setActiveView, onNew = () => {}, onReport = () => {} }) {
  const placeholder = activeView === 'formulas' ? 'Buscar fórmula o SKU...' : 'Buscar por nombre o SKU...';

  return (
    <div className="flex w-full flex-col gap-3 xl:w-auto">
      <button
        type="button"
        onClick={onReport}
        className="inline-flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap self-end rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-base-text)] transition-colors hover:bg-[var(--color-app-panel-hover)]"
      >
        <FileDown className="h-4 w-4" />
        Generar Reporte
      </button>

      <div className="flex w-full flex-col gap-3 xl:w-auto xl:flex-row xl:flex-nowrap xl:items-center">
        <div className="relative w-full xl:w-[320px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-base-text)]/45" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={placeholder}
            className="h-12 w-full rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] py-3 pl-10 pr-4 text-sm text-[var(--color-base-text)] outline-none transition-colors placeholder:text-[var(--color-base-text)]/38 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
          />
        </div>

        <div className="inline-flex h-12 w-full min-w-[260px] overflow-hidden rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-1 xl:w-auto">
          {views.map((view) => {
            const isActive = activeView === view.value;

            return (
              <button
                key={view.value}
                type="button"
                onClick={() => setActiveView(view.value)}
                className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors xl:flex-none ${
                  isActive
                    ? 'bg-[var(--color-base-surface)] text-[var(--color-brand)] shadow-sm'
                    : 'text-[var(--color-base-text)]/65 hover:bg-[var(--color-base-surface)] hover:text-[var(--color-base-text)]'
                }`}
              >
                {view.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onNew}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[var(--color-brand)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(16,32,58,0.5)] transition-transform hover:scale-[0.99] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nuevo Insumo
        </button>
      </div>
    </div>
  );
}