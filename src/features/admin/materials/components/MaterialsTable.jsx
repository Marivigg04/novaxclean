import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, PencilLine, Trash2 } from 'lucide-react';

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

export default function MaterialsTable({
  activeView = 'insumos',
  filteredRows = [],
  page = 1,
  pageCount = 1,
  sortField = 'stock',
  sortDirection = 'desc',
  onSortChange = () => {},
  onSortDirectionChange = () => {},
  onPageChange = () => {},
  onEditRequest = () => {},
  onDeleteRequest = () => {},
}) {
  const data = filteredRows;

  const sortableColumns = useMemo(
    () => (
      activeView === 'insumos'
        ? [
            { value: 'name', label: 'Materia Prima', align: 'left' },
            { value: 'sku', label: 'SKU', align: 'left' },
            { value: 'category_name', label: 'Categoría', align: 'left' },
            { value: 'stock', label: 'Stock', align: 'center' },
            { value: 'minimum_stock', label: 'Mínimo', align: 'center' },
            { value: 'unit', label: 'Unidad', align: 'left' },
            { value: 'unit_cost', label: 'Costo Unitario', align: 'right' },
            { value: 'supplier_name', label: 'Proveedor', align: 'left' },
            { value: 'status', label: 'Estado', align: 'left' },
          ]
        : [
            { value: 'product_name', label: 'Producto Terminado', align: 'left' },
            { value: 'sku', label: 'SKU Fórmula', align: 'left' },
            { value: 'category_name', label: 'Categoría', align: 'left' },
            { value: 'yield_label', label: 'Rinde', align: 'left' },
            { value: 'ingredients', label: 'Ingredientes', align: 'left' },
            { value: 'estimated_cost', label: 'Costo Estimado', align: 'right' },
            { value: 'status', label: 'Estado', align: 'left' },
          ]
    ),
    [activeView],
  );

  const handleHeaderSort = (field) => {
    if (field === sortField) {
      onSortDirectionChange((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    onSortChange(field);
    onSortDirectionChange('asc');
  };

  return (
    <section className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-6">
      <div className="flex flex-col gap-4 border-b border-[var(--color-app-panel-border)] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)]">
          <ArrowUpDown className="h-4 w-4" />
          Haz clic en un encabezado para ordenar
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block mt-4 overflow-hidden rounded-2xl border border-[var(--color-app-panel-border)]">
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y divide-[var(--color-app-panel-border)] text-left ${activeView === 'insumos' ? 'min-w-[1320px]' : 'min-w-[1160px]'}`}>
            <thead className="bg-[var(--color-base-bg)] text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-base-text)]/60">
              <tr>
                {sortableColumns.map((column) => (
                  <th key={column.value} className={`px-4 py-3 ${column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'}`}>
                    <button
                      type="button"
                      onClick={() => handleHeaderSort(column.value)}
                      className={`inline-flex items-center gap-2 transition-colors hover:text-[var(--color-base-text)] ${column.align === 'center' ? 'justify-center' : column.align === 'right' ? 'justify-end' : 'justify-start'}`}
                    >
                      <span>{column.label}</span>
                      <span className={`inline-flex items-center justify-center transition-transform ${sortField === column.value && sortDirection === 'desc' ? 'rotate-180' : ''}`}>
                        <ArrowUpDown className={`h-3.5 w-3.5 ${sortField === column.value ? 'text-[var(--color-brand)]' : ''}`} />
                      </span>
                    </button>
                  </th>
                ))}

                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-app-panel-border)] bg-[var(--color-base-surface)]">
              {activeView === 'insumos' ? (
                data.map((item, index) => (
                  <motion.tr
                    key={item.id || item.sku}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut', delay: index * 0.025 }}
                    className="transition-colors hover:bg-[var(--color-app-panel-hover)]/50"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[var(--color-base-text)]">{item.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--color-base-text)]/70">{item.sku}</td>
                    <td className="px-4 py-4 text-sm text-[var(--color-base-text)]/70">{item.category_name}</td>
                    <td className="px-4 py-4 text-center text-sm font-semibold text-[var(--color-base-text)]">{item.stock}</td>
                    <td className="px-4 py-4 text-center text-sm text-[var(--color-base-text)]/70">{item.minimum_stock}</td>
                    <td className="px-4 py-4 text-sm text-[var(--color-base-text)]/70">{item.unit}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-[var(--color-base-text)]">{formatCurrency(item.unit_cost)} US$</td>
                    <td className="px-4 py-4 text-sm text-[var(--color-base-text)]/70">{item.supplier_name}</td>
                    <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-4"><ActionButtons label={item.name} onEdit={() => onEditRequest(item)} onDelete={() => onDeleteRequest(item)} /></td>
                  </motion.tr>
                ))
              ) : (
                data.map((item, index) => (
                  <motion.tr
                    key={item.id || item.sku}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut', delay: index * 0.025 }}
                    className="transition-colors hover:bg-[var(--color-app-panel-hover)]/50"
                  >
                    <td className="px-4 py-4">
                      <div className="font-semibold text-[var(--color-base-text)]">{item.product_name}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-[var(--color-base-text)]/70">{item.sku}</td>
                    <td className="px-4 py-4 text-sm text-[var(--color-base-text)]/70">{item.category_name}</td>
                    <td className="px-4 py-4 text-sm text-[var(--color-base-text)]/70">{item.yield_label}</td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        {item.ingredients?.map((ingredient) => (
                          <span
                            key={`${item.sku}-${ingredient.name}`}
                            className="inline-flex rounded-full border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-2.5 py-1 text-xs font-medium text-[var(--color-base-text)]/78"
                          >
                            {ingredient.name} · {ingredient.qty}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium text-[var(--color-base-text)]">{formatCurrency(item.estimated_cost)} US$</td>
                    <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-4"><ActionButtons label={item.product_name} onEdit={() => onEditRequest(item)} onDelete={() => onDeleteRequest(item)} /></td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List View */}
      <div className="mt-4 space-y-3 md:hidden">
        {activeView === 'insumos' ? (
          data.map((item, index) => (
            <motion.div
              key={item.id || item.sku}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.03 }}
              className="rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-[var(--color-base-text)] text-sm">{item.name}</h4>
                  <p className="mt-1 text-xs text-[var(--color-base-text)]/55">SKU: {item.sku}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--color-app-panel-border)]/55 pt-3 text-xs">
                <div>
                  <span className="text-[var(--color-base-text)]/50 block">Categoría</span>
                  <span className="font-medium text-[var(--color-base-text)]">{item.category_name}</span>
                </div>
                <div>
                  <span className="text-[var(--color-base-text)]/50 block">Costo Unitario</span>
                  <span className="font-bold text-[var(--color-brand)]">{formatCurrency(item.unit_cost)} US$</span>
                </div>
                <div>
                  <span className="text-[var(--color-base-text)]/50 block">Stock Actual</span>
                  <span className="font-semibold text-[var(--color-base-text)]">{item.stock} {item.unit}</span>
                </div>
                <div>
                  <span className="text-[var(--color-base-text)]/50 block">Stock Mínimo</span>
                  <span className="font-medium text-[var(--color-base-text)]">{item.minimum_stock} {item.unit}</span>
                </div>
              </div>

              <div className="mt-2.5 border-t border-[var(--color-app-panel-border)]/35 pt-2.5 text-xs">
                <span className="text-[var(--color-base-text)]/50 block">Proveedor</span>
                <span className="font-medium text-[var(--color-base-text)]">{item.supplier_name}</span>
              </div>

              <div className="mt-3.5 flex items-center justify-end gap-4 border-t border-[var(--color-app-panel-border)]/45 pt-3 text-[var(--color-base-text)]/65">
                <button
                  type="button"
                  onClick={() => onEditRequest(item)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand)]"
                  aria-label={`Editar ${item.name}`}
                >
                  <PencilLine className="h-4 w-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRequest(item)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600"
                  aria-label={`Eliminar ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          data.map((item, index) => (
            <motion.div
              key={item.id || item.sku}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.03 }}
              className="rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-bold text-[var(--color-base-text)] text-sm">{item.product_name}</h4>
                  <p className="mt-1 text-xs text-[var(--color-base-text)]/55">SKU: {item.sku}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--color-app-panel-border)]/55 pt-3 text-xs">
                <div>
                  <span className="text-[var(--color-base-text)]/50 block">Categoría</span>
                  <span className="font-medium text-[var(--color-base-text)]">{item.category_name}</span>
                </div>
                <div>
                  <span className="text-[var(--color-base-text)]/50 block">Costo Estimado</span>
                  <span className="font-bold text-[var(--color-brand)]">{formatCurrency(item.estimated_cost)} US$</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[var(--color-base-text)]/50 block">Rinde</span>
                  <span className="font-medium text-[var(--color-base-text)]">{item.yield_label}</span>
                </div>
              </div>

              <div className="mt-3 border-t border-[var(--color-app-panel-border)]/35 pt-3">
                <span className="text-[var(--color-base-text)]/50 block text-[10px] uppercase font-semibold tracking-wider mb-2">Ingredientes de Fórmula</span>
                <div className="flex flex-wrap gap-1.5">
                  {item.ingredients?.map((ingredient) => (
                    <span
                      key={`${item.sku}-${ingredient.name}`}
                      className="inline-flex items-center rounded-lg border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-2 py-1 text-[10px] font-medium text-[var(--color-base-text)]/80"
                    >
                      {ingredient.name} <span className="ml-1 opacity-60">· {ingredient.qty}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-end gap-4 border-t border-[var(--color-app-panel-border)]/45 pt-3 text-[var(--color-base-text)]/65">
                <button
                  type="button"
                  onClick={() => onEditRequest(item)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand)]"
                  aria-label={`Editar ${item.product}`}
                >
                  <PencilLine className="h-4 w-4" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRequest(item)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-rose-600"
                  aria-label={`Eliminar ${item.product}`}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </motion.div>
          ))
        )}

        {data.length === 0 && (
          <div className="rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-6 text-center text-sm text-[var(--color-base-text)]/50 italic">
            No se encontraron registros.
          </div>
        )}
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