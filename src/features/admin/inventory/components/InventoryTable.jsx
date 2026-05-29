import { ArrowUpDown, Filter, PencilLine, Trash2 } from 'lucide-react';
import RoundedSelect from './RoundedSelect';

function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function StatusBadge({ status }) {
  const styles = {
    'En stock': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15',
    'Stock bajo': 'bg-amber-500/12 text-amber-600 border-amber-500/15',
    Agotado: 'bg-rose-500/10 text-rose-600 border-rose-500/15',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export default function InventoryTable({
  filteredProducts = [],
  category,
  setCategory,
  status,
  setStatus,
  categories = [],
  statuses = [],
  sortOrder,
  setSortOrder,
  onDeleteRequest = () => {},
  onEditRequest = () => {},
}) {
  return (
    <section className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-6">
      <div className="flex flex-col gap-4 border-b border-[var(--color-app-panel-border)] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-base-text)]/72">
          <div className="inline-flex items-center gap-2">
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

        <button
          type="button"
          onClick={() => setSortOrder((current) => (current === 'asc' ? 'desc' : 'asc'))}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)] transition-colors hover:bg-[var(--color-app-panel-hover)]"
        >
          <ArrowUpDown className="h-4 w-4" />
          Stock {sortOrder === 'asc' ? 'ascendente' : 'descendente'}
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--color-app-panel-border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--color-app-panel-border)] text-left">
            <thead className="bg-[var(--color-base-bg)] text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-base-text)]/60">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3 text-center">Mínimo</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-app-panel-border)] bg-[var(--color-base-surface)]">
              {filteredProducts.map((product) => (
                <tr key={product.sku} className="transition-colors hover:bg-[var(--color-app-panel-hover)]/50">
                  <td className="px-4 py-4">
                    <div className="font-semibold text-[var(--color-base-text)]">{product.name}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--color-base-text)]/70">{product.sku}</td>
                  <td className="px-4 py-4 text-sm text-[var(--color-base-text)]/70">{product.category}</td>
                  <td className="px-4 py-4 text-center text-sm font-semibold text-[var(--color-base-text)]">{product.stock}</td>
                  <td className="px-4 py-4 text-center text-sm text-[var(--color-base-text)]/70">{product.minimum}</td>
                  <td className="px-4 py-4 text-sm font-medium text-[var(--color-base-text)]">{formatCurrency(product.price)}</td>
                  <td className="px-4 py-4"><StatusBadge status={product.status} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-3 text-[var(--color-base-text)]/65">
                      <button
                        type="button"
                        onClick={() => onEditRequest(product)}
                        className="transition-colors hover:text-[var(--color-brand)]"
                        aria-label={`Editar ${product.name}`}
                      >
                        <PencilLine className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRequest(product)}
                        className="transition-colors hover:text-rose-600"
                        aria-label={`Eliminar ${product.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
