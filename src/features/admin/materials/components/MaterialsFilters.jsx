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

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-base-text)]/72">
            <div className="inline-flex items-center gap-2 whitespace-nowrap">
              <Filter className="h-4 w-4" />
              <span>Filtros:</span>
            </div>

            <RoundedSelect
              value={category}
              onChange={setCategory}
              options={categories.map((item) => ({ value: item, label: item }))}
              placeholder="Seleccionar categoría"
              className="min-w-[220px]"
            />

            <RoundedSelect
              value={status}
              onChange={setStatus}
              options={statuses.map((item) => ({ value: item, label: item }))}
              placeholder="Todos"
              className="min-w-[180px]"
            />
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)]">
            <span>Ordena desde los encabezados de la tabla</span>
          </div>
        </div>
      </div>
    </section>
  );
}