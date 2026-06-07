import { Filter } from 'lucide-react';
import RoundedSelect from '@/features/admin/inventory/components/RoundedSelect';

export default function MaterialsFilters({
  category,
  setCategory,
  status,
  setStatus,
  categories = [],
  statuses = [],
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand)]">Filtros</p>
          <h3 className="text-base font-bold text-[var(--color-base-text)]">Categoría y estado</h3>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full lg:w-auto text-sm text-[var(--color-base-text)]/72">
          <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
            <div className="inline-flex items-center gap-2 font-medium text-[var(--color-base-text)]/80">
              <Filter className="h-4 w-4 text-[var(--color-brand)]" />
              <span>Filtrar por:</span>
            </div>

            {((category && category !== 'Todos') || status !== 'Todos') && (
              <button
                type="button"
                onClick={() => {
                  setCategory('');
                  setStatus('Todos');
                }}
                className="text-xs font-semibold text-[var(--color-brand)] hover:text-[var(--color-brand)]/80 hover:underline sm:ml-2 cursor-pointer transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:items-center sm:gap-3 sm:w-auto">
            <RoundedSelect
              value={category}
              onChange={setCategory}
              options={categories.map((item) => ({ value: item, label: item }))}
              placeholder="Categoría"
              className="w-full sm:min-w-[220px]"
            />

            <RoundedSelect
              value={status}
              onChange={setStatus}
              options={statuses.map((item) => ({ value: item, label: item }))}
              placeholder="Estado"
              className="w-full sm:min-w-[180px]"
            />
          </div>

          <div className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)] shadow-sm whitespace-nowrap">
            Ordena desde los encabezados de la tabla
          </div>
        </div>
      </div>
    </section>
  );
}