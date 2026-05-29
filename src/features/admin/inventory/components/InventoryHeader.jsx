import { FileDown, Search, Plus } from 'lucide-react';
import PageHeader from '@/shared/PageHeader';

export default function InventoryHeader({ search, setSearch, onNew = () => {}, onReport = () => {} }) {
  return (
    <PageHeader title="Inventario" subtitle="Controla stock, alertas y valor del inventario.">
      <div className="flex w-full flex-col gap-3 xl:w-auto">
        <button
          type="button"
          onClick={onReport}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap self-end rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-4 py-3 text-sm font-semibold text-[var(--color-base-text)] transition-colors hover:bg-[var(--color-app-panel-hover)]"
        >
          <FileDown className="h-4 w-4" />
          Generar Reporte
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-[280px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-base-text)]/45" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="w-full rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] py-3 pl-10 pr-4 text-sm text-[var(--color-base-text)] outline-none transition-colors placeholder:text-[var(--color-base-text)]/38 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
          />
        </div>

        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-brand)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(16,32,58,0.5)] transition-transform hover:scale-[0.99] active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nuevo producto
        </button>
        </div>
      </div>
    </PageHeader>
  );
}
