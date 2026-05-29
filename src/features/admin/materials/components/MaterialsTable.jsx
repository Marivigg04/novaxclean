import { PencilLine, Trash2 } from 'lucide-react';

const inventoryStatusStyles = {
  'En stock': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15',
  'Stock bajo': 'bg-amber-500/12 text-amber-600 border-amber-500/15',
  Agotado: 'bg-rose-500/10 text-rose-600 border-rose-500/15',
};

const formulaStatusStyles = {
  Lista: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/15',
  'En revisión': 'bg-sky-500/10 text-sky-600 border-sky-500/15',
  'En ajuste': 'bg-amber-500/12 text-amber-600 border-amber-500/15',
};

function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function StatusBadge({ status, formula = false }) {
  const styles = formula ? formulaStatusStyles : inventoryStatusStyles;
  const className = styles[status] ?? 'bg-[var(--color-brand)]/10 text-[var(--color-brand)] border-[var(--color-brand)]/15';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function ActionButtons({ label, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-3 text-[var(--color-base-text)]/65">
      <button type="button" onClick={onEdit} className="transition-colors hover:text-[var(--color-brand)]" aria-label={`Editar ${label}`}>
        <PencilLine className="h-4 w-4" />
      </button>
      <button type="button" onClick={onDelete} className="transition-colors hover:text-rose-600" aria-label={`Eliminar ${label}`}>
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function MaterialsTable({ activeView = 'insumos', filteredRows = [], page = 1, pageCount = 1, onPageChange = () => {}, onEditRequest = () => {}, onDeleteRequest = () => {} }) {
  const data = filteredRows;

  return (
    <section className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-6">
      <div className="overflow-hidden rounded-2xl border border-[var(--color-app-panel-border)]">
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y divide-[var(--color-app-panel-border)] text-left ${activeView === 'insumos' ? 'min-w-[1320px]' : 'min-w-[1180px]'}`}>
            <thead className="bg-[var(--color-base-bg)] text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-base-text)]/60">
              {activeView === 'insumos' ? (
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Materia Prima</th>
                  <th className="whitespace-nowrap px-4 py-3">SKU</th>
                  <th className="whitespace-nowrap px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-center">Stock Actual</th>
                  <th className="px-4 py-3 text-center">Stock Mínimo</th>
                  <th className="whitespace-nowrap px-4 py-3">Unidad</th>
                  <th className="px-4 py-3 text-right">Costo Unitario</th>
                  <th className="whitespace-nowrap px-4 py-3">Proveedor</th>
                  <th className="whitespace-nowrap px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              ) : (
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Producto terminado</th>
                  <th className="whitespace-nowrap px-4 py-3">SKU</th>
                  <th className="whitespace-nowrap px-4 py-3">Categoría</th>
                  <th className="whitespace-nowrap px-4 py-3">Rinde</th>
                  <th className="px-4 py-3">Desglose BOM</th>
                  <th className="px-4 py-3 text-right">Costo estimado</th>
                  <th className="whitespace-nowrap px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              )}
            </thead>

            <tbody className="divide-y divide-[var(--color-app-panel-border)] bg-[var(--color-base-surface)]">
              {activeView === 'insumos' ? (
                data.map((item) => (
                  <tr key={item.sku} className="transition-colors hover:bg-[var(--color-app-panel-hover)]/50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[var(--color-base-text)]">{item.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--color-base-text)]/70">{item.sku}</td>
                    <td className="px-4 py-4 text-sm text-[var(--color-base-text)]/70">{item.category}</td>
                    <td className="px-4 py-4 text-center text-sm font-semibold text-[var(--color-base-text)]">{item.stock}</td>
                    <td className="px-4 py-4 text-center text-sm text-[var(--color-base-text)]/70">{item.minimum}</td>
                    <td className="px-4 py-4 text-sm text-[var(--color-base-text)]/70">{item.unit}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-[var(--color-base-text)]">{formatCurrency(item.unitCost)} US$</td>
                    <td className="px-4 py-4 text-sm text-[var(--color-base-text)]/70">{item.supplier}</td>
                    <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-4"><ActionButtons label={item.name} onEdit={() => onEditRequest(item)} onDelete={() => onDeleteRequest(item)} /></td>
                  </tr>
                ))
              ) : (
                data.map((item) => (
                  <tr key={item.sku} className="transition-colors hover:bg-[var(--color-app-panel-hover)]/50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[var(--color-base-text)]">{item.product}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--color-base-text)]/70">{item.sku}</td>
                    <td className="px-4 py-4 text-sm text-[var(--color-base-text)]/70">{item.category}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-[var(--color-base-text)]">{item.yieldLabel}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {item.ingredients.map((ingredient) => (
                          <span
                            key={`${item.sku}-${ingredient.name}`}
                            className="inline-flex rounded-full border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-2.5 py-1 text-xs font-medium text-[var(--color-base-text)]/78"
                          >
                            {ingredient.name} · {ingredient.qty}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-[var(--color-base-text)]">{formatCurrency(item.estimatedCost)} US$</td>
                    <td className="px-4 py-4"><StatusBadge status={item.status} formula /></td>
                    <td className="px-4 py-4"><ActionButtons label={item.product} onEdit={() => onEditRequest(item)} onDelete={() => onDeleteRequest(item)} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pageCount > 1 ? (
        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--color-base-text)]/68">
            Página {page} de {pageCount}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-2 text-sm font-semibold text-[var(--color-base-text)] transition-colors hover:bg-[var(--color-app-panel-hover)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={page === pageCount}
              className="rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-2 text-sm font-semibold text-[var(--color-base-text)] transition-colors hover:bg-[var(--color-app-panel-hover)] disabled:cursor-not-allowed disabled:opacity-45"
            >
              Siguiente
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}