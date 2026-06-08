import { FileDown, Search, Plus, Truck } from 'lucide-react';
import PageHeader from '@/shared/PageHeader';

export default function InventoryHeader({ search, setSearch, onNew = () => {}, onReport = () => {}, onReplenish = () => {} }) {
  return (
    <PageHeader title="Inventario" subtitle="Controla stock, alertas y valor del inventario.">
      <div className="flex w-full flex-col gap-3 xl:flex-row xl:items-end xl:justify-between xl:gap-4">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:flex-1 xl:min-w-0">
          <div className="relative w-full sm:flex-1 sm:min-w-[320px] xl:max-w-[520px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-base-text)]/45" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o SKU..."
              aria-label="Buscar productos por nombre o SKU"
              className="w-full rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] py-3 pl-10 pr-4 text-sm text-[var(--color-base-text)] outline-none transition-colors placeholder:text-[var(--color-base-text)]/38 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 self-end w-full justify-end sm:w-auto">
          <button
            type="button"
            onClick={onReport}
            title="Generar Reporte"
            aria-label="Generar Reporte de inventario"
            className="group inline-flex h-11 w-11 sm:h-12 sm:w-auto shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-0 sm:pl-2 sm:pr-4 text-sm font-semibold text-[var(--color-base-text)] transition-all duration-300 hover:bg-[var(--color-app-panel-hover)] hover:border-blue-500/40 hover:shadow-md hover:shadow-blue-500/5 active:scale-95 shadow-sm"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/8 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white dark:group-hover:bg-blue-500 group-hover:scale-105 shadow-sm">
              <FileDown className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
            </div>
            <span className="hidden sm:inline pr-1 transition-colors duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Generar Reporte</span>
          </button>

          <button
            type="button"
            onClick={onReplenish}
            title="Reabastecer"
            aria-label="Reabastecer productos"
            className="group inline-flex h-11 w-11 sm:h-12 sm:w-auto shrink-0 items-center justify-center gap-2.5 whitespace-nowrap rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-0 sm:pl-2 sm:pr-4 text-sm font-semibold text-[var(--color-base-text)] transition-all duration-300 hover:bg-[var(--color-app-panel-hover)] hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/5 active:scale-95 shadow-sm"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/8 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 transition-all duration-300 group-hover:bg-emerald-600 group-hover:text-white dark:group-hover:bg-emerald-500 group-hover:scale-105 shadow-sm">
              <Truck className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
            <span className="hidden sm:inline pr-1 transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">Reabastecer</span>
          </button>
          <button
            type="button"
            onClick={onNew}
            aria-label="Agregar nuevo producto"
            className="inline-flex h-11 sm:h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-[var(--color-brand)] px-4 sm:py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(16,32,58,0.5)] transition-transform hover:scale-[0.99] active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo producto</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>
    </PageHeader>
  );
}
