import { useMemo } from 'react';
import { motion } from 'framer-motion';
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
  sortField = 'stock',
  sortDirection = 'desc',
  onSortChange = () => {},
  onSortDirectionChange = () => {},
  onDeleteRequest = () => {},
  onEditRequest = () => {},
  page = 1,
  pageCount = 1,
  onPageChange = () => {},
}) {
  const sortableColumns = useMemo(
    () => [
      { value: 'name', label: 'Producto', align: 'left' },
      { value: 'sku', label: 'SKU', align: 'left' },
      { value: 'category_name', label: 'Categoría', align: 'left' },
      { value: 'stock', label: 'Stock', align: 'center' },
      { value: 'minimum_stock', label: 'Mínimo', align: 'center' },
      { value: 'price', label: 'Precio', align: 'left' },
      { value: 'status', label: 'Estado', align: 'left' },
    ],
    [],
  );

  const handleHeaderSort = (field) => {
    if (field === sortField) {
      onSortDirectionChange((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      onSortChange(field);
      onSortDirectionChange('asc');
    }
  };

  return (
    <section className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-6">
      <div className="flex flex-col gap-4 border-b border-[var(--color-app-panel-border)] pb-4 lg:flex-row lg:items-center lg:justify-between">
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
        </div>

        <div className="hidden md:inline-flex items-center gap-2 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)] shadow-sm">
          <ArrowUpDown className="h-4 w-4 text-[var(--color-base-text)]/60" />
          Haz clic en un encabezado para ordenar
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="mt-4 hidden md:block overflow-hidden rounded-2xl border border-[var(--color-app-panel-border)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--color-app-panel-border)] text-left">
            <thead className="bg-[var(--color-base-bg)] text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-base-text)]/60">
              <tr>
                {sortableColumns.map((column) => {
                  const isActive = sortField === column.value;

                  return (
                    <th
                      key={column.value}
                      className={`px-4 py-3 ${column.align === 'center' ? 'text-center' : 'text-left'}`}
                    >
                      <button
                        type="button"
                        onClick={() => handleHeaderSort(column.value)}
                        className={`inline-flex items-center gap-2 transition-colors hover:text-[var(--color-base-text)] ${column.align === 'center' ? 'justify-center' : 'justify-start'}`}
                      >
                        <span>{column.label}</span>
                        <span className={`inline-flex items-center justify-center transition-transform ${isActive && sortDirection === 'desc' ? 'rotate-180' : ''}`}>
                          <ArrowUpDown className={`h-3.5 w-3.5 ${isActive ? 'text-[var(--color-brand)]' : ''}`} />
                        </span>
                      </button>
                    </th>
                  );
                })}

                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-app-panel-border)] bg-[var(--color-base-surface)]">
              {filteredProducts.map((product, index) => (
                <motion.tr
                  key={product.id || product.sku}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut', delay: index * 0.025 }}
                  className="transition-colors hover:bg-[var(--color-app-panel-hover)]/50"
                >
                  <td className="px-4 py-4">
                    <div className="font-semibold text-[var(--color-base-text)]">{product.name}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--color-base-text)]/70">{product.sku}</td>
                  <td className="px-4 py-4 text-sm text-[var(--color-base-text)]/70">{product.category_name}</td>
                  <td className="px-4 py-4 text-center text-sm font-semibold text-[var(--color-base-text)]">{product.stock}</td>
                  <td className="px-4 py-4 text-center text-sm text-[var(--color-base-text)]/70">{product.minimum_stock}</td>
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
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 space-y-3 md:hidden">
        {filteredProducts.map((product, index) => (
          <motion.div 
            key={product.id || product.sku} 
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut', delay: index * 0.03 }}
            className="rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-bold text-[var(--color-base-text)] text-sm">{product.name}</h4>
                <p className="mt-1 text-xs text-[var(--color-base-text)]/55">SKU: {product.sku}</p>
              </div>
              <StatusBadge status={product.status} />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 border-y border-[var(--color-app-panel-border)]/55 py-2 text-xs">
              <div>
                <span className="text-[var(--color-base-text)]/50 block">Categoría</span>
                <span className="font-medium text-[var(--color-base-text)]">{product.category_name}</span>
              </div>
              <div>
                <span className="text-[var(--color-base-text)]/50 block">Precio</span>
                <span className="font-bold text-[var(--color-brand)]">{formatCurrency(product.price)}</span>
              </div>
              <div>
                <span className="text-[var(--color-base-text)]/50 block">Stock Actual</span>
                <span className="font-semibold text-[var(--color-base-text)]">{product.stock}</span>
              </div>
              <div>
                <span className="text-[var(--color-base-text)]/50 block">Stock Mínimo</span>
                <span className="font-medium text-[var(--color-base-text)]">{product.minimum_stock}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-4 text-[var(--color-base-text)]/65">
              <button
                type="button"
                onClick={() => onEditRequest(product)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-brand)]"
                aria-label={`Editar ${product.name}`}
              >
                <PencilLine className="h-4 w-4" />
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDeleteRequest(product)}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600"
                aria-label={`Eliminar ${product.name}`}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </button>
            </div>
          </motion.div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-6 text-center text-sm text-[var(--color-base-text)]/50 italic">
            No se encontraron productos.
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
