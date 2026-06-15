import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { PlusCircle, Save, X, Trash2, Loader2 } from 'lucide-react';
import { useScrollLock } from '@/hooks/useScrollLock';
import { uploadProductImage } from '@/features/admin/inventory/data/inventoryService';

function buildInitialForm(type, item) {
  if (type === 'formula') {
    return {
      product_id: item?.product_id ?? '',
      sku: item?.sku ?? `FP-${Date.now()}`,
      yield_label: item?.yield_label ?? '',
      batch_size: item?.batch_size ? String(item.batch_size) : '',
      status: item?.status ?? 'Lista',
      notes: item?.notes ?? '',
      ingredients: item?.ingredients?.length
        ? item.ingredients.map((ingredient) => ({
            id: `${ingredient.material_id}-${ingredient.qty}`,
            material_id: ingredient.material_id ?? '',
            qty: String(ingredient.qty ?? ''),
          }))
        : [{ id: 'ingredient-0', material_id: '', qty: '' }],
    };
  }

  return {
    name: item?.name ?? '',
    sku: item?.sku ?? `MP-${Date.now()}`,
    category_id: item?.category_id ?? '',
    stock: item?.stock != null ? String(item.stock) : '',
    minimum_stock: item?.minimum_stock != null ? String(item.minimum_stock) : '',
    unit: item?.unit ?? '',
    unit_cost: item?.unit_cost != null ? String(item.unit_cost) : '',
    supplier_id: item?.supplier_id ?? '',
  };
}

export default function MaterialsEntryModal({
  isOpen = false,
  type = 'material',
  mode = 'create',
  item = null,
  categories = [],
  suppliers = [],
  statuses = [],
  materialOptions = [],
  productOptions = [],
  onClose = () => {},
  onSubmit = () => {},
  loading: externalLoading = false,
}) {
  const [form, setForm] = useState(() => buildInitialForm(type, item));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const formulaIngredients = Array.isArray(form.ingredients) ? form.ingredients : [{ id: 'ingredient-0', materialSku: '', qty: '' }];

  useScrollLock(isOpen);

  const title = useMemo(() => {
    if (type === 'formula') {
      return mode === 'create' ? 'Nueva fórmula' : 'Editar fórmula';
    }

    return mode === 'create' ? 'Nuevo insumo' : 'Editar insumo';
  }, [mode, type]);

  useEffect(() => {
    if (!isOpen) {
      setForm(buildInitialForm(type, item));
      setError('');
      setLoading(false);
      return;
    }

    setForm(buildInitialForm(type, item));
    setError('');
  }, [isOpen, item, type]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const updateIngredient = (ingredientId, patch) => {
    setForm((current) => ({
      ...current,
      ingredients: (Array.isArray(current.ingredients) ? current.ingredients : []).map((ingredient) => (ingredient.id === ingredientId ? { ...ingredient, ...patch } : ingredient)),
    }));
    setError('');
  };

  const addIngredient = () => {
    setForm((current) => ({
      ...current,
      ingredients: [...(Array.isArray(current.ingredients) ? current.ingredients : []), { id: `ingredient-${Date.now()}`, materialSku: '', qty: '' }],
    }));
  };

  const removeIngredient = (ingredientId) => {
    setForm((current) => ({
      ...current,
      ingredients: (Array.isArray(current.ingredients) ? current.ingredients : []).length > 1
        ? (Array.isArray(current.ingredients) ? current.ingredients : []).filter((ingredient) => ingredient.id !== ingredientId)
        : (Array.isArray(current.ingredients) ? current.ingredients : []),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // ── Formula submit (Supabase) ───────────────────────────
    if (type === 'formula') {
      if (!form.product_id) return setError('El producto terminado es requerido.');
      if (!form.sku.trim()) return setError('El SKU es requerido.');

      const ingredients = formulaIngredients
        .map((ingredient) => {
          const material = materialOptions.find((option) => option.id === ingredient.material_id);
          const qty = parseFloat(ingredient.qty);

          return {
            material_id: material?.id ?? '',
            qty,
            unit_cost: material?.unit_cost ?? 0,
            status: material?.status ?? '',
          };
        })
        .filter((ingredient) => ingredient.material_id && !Number.isNaN(ingredient.qty) && ingredient.qty > 0);

      if (!ingredients.length) return setError('Agrega al menos un insumo válido en el desglose BOM.');

      const formulaStatus =
        form.status !== 'Lista'
          ? form.status
          : ingredients.some((ingredient) => ingredient.status === 'Agotado')
            ? 'En ajuste'
            : ingredients.some((ingredient) => ingredient.status === 'Stock bajo')
              ? 'En revisión'
              : 'Lista';

      setLoading(true);
      setError('');

      try {
        await onSubmit({
          ...(item ?? {}),
          product_id: form.product_id,
          sku: form.sku.trim(),
          yield_label: form.yield_label.trim(),
          yield_units: 1, // Defaulting to 1 as per discussion
          batch_size: form.batch_size.trim(),
          status: formulaStatus,
          ingredients,
          notes: form.notes.trim(),
        });
        onClose();
      } catch (err) {
        setError(err.message || 'Ocurrió un error al guardar la fórmula.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── Material submit (Supabase) ───────────────────────────────────────
    if (!form.name.trim()) return setError('El nombre es requerido.');
    if (!form.sku.trim()) return setError('El SKU es requerido.');

    const stock = parseFloat(form.stock);
    const minimum_stock = parseFloat(form.minimum_stock);
    const unit_cost = parseFloat(form.unit_cost);

    if (Number.isNaN(stock) || stock < 0) return setError('Stock inválido.');
    if (Number.isNaN(minimum_stock) || minimum_stock < 0) return setError('Stock mínimo inválido.');
    if (Number.isNaN(unit_cost) || unit_cost < 0) return setError('Costo unitario inválido.');
    if (!form.unit.trim()) return setError('La unidad es requerida.');

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        ...(item ?? {}),
        name: form.name.trim(),
        sku: form.sku.trim(),
        category_id: form.category_id || null,
        stock,
        minimum_stock,
        unit: form.unit.trim(),
        unit_cost,
        supplier_id: form.supplier_id || null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al guardar el insumo.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // ── Build select options from [{id, name}] objects ─────────────────────
  const categoryOptions = Array.isArray(categories)
    ? categories.filter((c) => typeof c === 'object' && c.id).map((c) => ({ value: c.id, label: c.name }))
    : [];
  const supplierOptions = Array.isArray(suppliers)
    ? suppliers.map((s) => ({ value: s.id, label: s.name }))
    : [];

  // For formulas that still use string categories
  const formulaCategoryStrings = Array.isArray(categories)
    ? categories.filter((c) => typeof c === 'string')
    : [];

  const isSubmitting = loading || externalLoading;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden p-4"
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
    >
      <button type="button" className="fixed inset-0 h-full w-full bg-black/55 backdrop-blur-sm" aria-label="Cerrar modal" onClick={!isSubmitting ? onClose : undefined} />

      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        data-lenis-prevent
        className="relative z-10 flex h-[min(90dvh,calc(100dvh-2rem))] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-[0_20px_55px_-30px_rgba(16,32,58,0.8)]"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--color-app-panel-border)] px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-base-text)]/50">{title}</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--color-base-text)]">{type === 'formula' ? 'Configurar fórmula' : 'Registrar insumo'}</h3>
          </div>

          <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-full p-2 text-[var(--color-base-text)]/60 transition-colors hover:bg-[var(--color-app-panel-hover)] disabled:opacity-40">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="cart-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-5" data-lenis-prevent>
          {type === 'formula' ? (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Producto terminado</span>
                <select name="product_id" value={form.product_id} onChange={handleChange} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none disabled:opacity-50">
                  <option value="">Seleccionar producto</option>
                  {productOptions.map((prod) => <option key={prod.id} value={prod.id}>{prod.name} ({prod.category_name})</option>)}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">SKU de fórmula</span>
                <input name="sku" value={form.sku} onChange={handleChange} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none whitespace-nowrap disabled:opacity-50" placeholder="FP-001" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Rinde (ej. 1 lote / 100 unidades)</span>
                <input name="yield_label" value={form.yield_label} onChange={handleChange} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none disabled:opacity-50" placeholder="1 lote / 100 unidades" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Tamaño del lote</span>
                <input name="batch_size" value={form.batch_size} onChange={handleChange} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none disabled:opacity-50" placeholder="100 unidades" />
              </label>

              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Estado inicial</span>
                <select name="status" value={form.status} onChange={handleChange} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none disabled:opacity-50">
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>

              <div className="md:col-span-2 rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-3">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Desglose BOM</span>
                  <button type="button" onClick={addIngredient} className="rounded-lg border border-[var(--color-app-panel-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-base-text)] transition-colors hover:bg-[var(--color-app-panel-hover)]">Agregar insumo</button>
                </div>

                <div className="cart-scrollbar max-h-56 space-y-2 overflow-y-auto overscroll-contain pr-1" data-lenis-prevent>
                  {formulaIngredients.map((ingredient, index) => {
                    const selectedMaterial = materialOptions.find((option) => option.id === ingredient.material_id);

                    return (
                      <div key={ingredient.id} className="grid gap-2 rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-2 md:grid-cols-[1fr_120px_auto] md:items-end">
                        <label className="block min-w-0">
                          <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-base-text)]/55">Insumo #{index + 1}</span>
                          <select
                            value={ingredient.material_id}
                            onChange={(event) => updateIngredient(ingredient.id, { material_id: event.target.value })}
                            disabled={isSubmitting}
                            className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-4 text-sm outline-none disabled:opacity-50"
                          >
                            <option value="">Seleccionar insumo</option>
                            {materialOptions.map((material) => (
                              <option key={material.id} value={material.id}>
                                {material.name} · {material.sku}
                              </option>
                            ))}
                          </select>
                          {selectedMaterial ? <p className="mt-1 text-xs text-[var(--color-base-text)]/55">{selectedMaterial.unit} · {selectedMaterial.category_name ?? selectedMaterial.category}</p> : null}
                        </label>

                        <label className="block">
                          <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-base-text)]/55">Cantidad</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={ingredient.qty}
                            onChange={(event) => updateIngredient(ingredient.id, { qty: event.target.value })}
                            disabled={isSubmitting}
                            className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-4 text-sm outline-none disabled:opacity-50"
                            placeholder="0"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => removeIngredient(ingredient.id)}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--color-app-panel-border)] px-3 text-sm font-semibold text-[var(--color-base-text)]/70 transition-colors hover:bg-[var(--color-app-panel-hover)]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Quitar
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Notas de producción</span>
                <textarea name="notes" value={form.notes} onChange={handleChange} disabled={isSubmitting} className="mt-2 min-h-28 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3 text-sm outline-none disabled:opacity-50" placeholder="Observaciones, proceso o detalles técnicos" />
              </label>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Nombre <span className="text-rose-500">*</span></span>
                <input name="name" value={form.name} onChange={handleChange} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none disabled:opacity-50" placeholder="Nombre del insumo" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">SKU <span className="text-rose-500">*</span></span>
                <input name="sku" value={form.sku} onChange={handleChange} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none whitespace-nowrap disabled:opacity-50" placeholder="MP-001" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Categoría</span>
                <select name="category_id" value={form.category_id} onChange={handleChange} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none disabled:opacity-50">
                  <option value="">Seleccionar</option>
                  {categoryOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Stock <span className="text-rose-500">*</span></span>
                <input name="stock" value={form.stock} onChange={handleChange} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none disabled:opacity-50" placeholder="0" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Stock mínimo <span className="text-rose-500">*</span></span>
                <input name="minimum_stock" value={form.minimum_stock} onChange={handleChange} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none disabled:opacity-50" placeholder="0" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Unidad <span className="text-rose-500">*</span></span>
                <input name="unit" value={form.unit} onChange={handleChange} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none disabled:opacity-50" placeholder="Kg / Litros / Unidades" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Costo unitario <span className="text-rose-500">*</span></span>
                <input name="unit_cost" value={form.unit_cost} onChange={handleChange} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none disabled:opacity-50" placeholder="0.00" />
              </label>

              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Proveedor</span>
                <select name="supplier_id" value={form.supplier_id} onChange={handleChange} disabled={isSubmitting} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none disabled:opacity-50">
                  <option value="">Sin proveedor</option>
                  {supplierOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </label>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--color-app-panel-border)] px-5 py-4">
          {error ? <p className="mb-3 text-xs text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)]/80 transition-colors hover:bg-[var(--color-app-panel-hover)] disabled:opacity-40">Cancelar</button>

            <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 disabled:opacity-60">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                <>
                  {mode === 'create' ? <PlusCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {mode === 'create' ? 'Agregar' : 'Guardar'}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>,
    document.body,
  );
}
