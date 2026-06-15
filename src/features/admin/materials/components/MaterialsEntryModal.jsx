import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { PlusCircle, Save, X, Trash2 } from 'lucide-react';
import { useScrollLock } from '@/hooks/useScrollLock';

function buildInitialForm(type, item) {
  if (type === 'formula') {
    return {
      product: item?.product ?? '',
      sku: item?.sku ?? `FP-${Date.now()}`,
      category: item?.category ?? '',
      yieldLabel: item?.yieldLabel ?? '',
      batchSize: item?.batchSize ? String(item.batchSize) : '',
      status: item?.status ?? 'Lista',
      ingredients: item?.ingredients?.length
        ? item.ingredients.map((ingredient) => ({
            id: `${ingredient.sku ?? ingredient.name}-${ingredient.qty}`,
            materialSku: ingredient.sku ?? '',
            qty: String(ingredient.qty ?? ''),
          }))
        : [{ id: 'ingredient-0', materialSku: '', qty: '' }],
      notes: item?.notes ?? '',
    };
  }

  return {
    name: item?.name ?? '',
    sku: item?.sku ?? `MP-${Date.now()}`,
    category: item?.category ?? '',
    stock: item?.stock ?? '',
    minimum: item?.minimum ?? '',
    unit: item?.unit ?? '',
    unitCost: item?.unitCost ?? '',
    supplier: item?.supplier ?? '',
    status: item?.status ?? 'En stock',
  };
}

export default function MaterialsEntryModal({
  isOpen = false,
  type = 'material',
  mode = 'create',
  item = null,
  categories = [],
  statuses = [],
  materialOptions = [],
  onClose = () => {},
  onSubmit = () => {},
}) {
  const [form, setForm] = useState(() => buildInitialForm(type, item));
  const [error, setError] = useState('');
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

  const handleSubmit = (event) => {
    event.preventDefault();

    if (type === 'formula') {
      if (!form.product.trim()) return setError('El nombre de la fórmula es requerido.');
      if (!form.sku.trim()) return setError('El SKU es requerido.');
      if (!form.category.trim()) return setError('La categoría es requerida.');

      const ingredients = formulaIngredients
        .map((ingredient) => {
          const material = materialOptions.find((option) => option.sku === ingredient.materialSku);
          const qty = parseFloat(ingredient.qty);

          return {
            sku: material?.sku ?? '',
            name: material?.name ?? '',
            qty,
            unit: material?.unit ?? '',
            unitCost: material?.unitCost ?? 0,
          };
        })
        .filter((ingredient) => ingredient.sku && !Number.isNaN(ingredient.qty) && ingredient.qty > 0);

      if (!ingredients.length) return setError('Agrega al menos un insumo válido en el desglose BOM.');

      const estimatedCost = ingredients.reduce((total, ingredient) => total + ingredient.qty * ingredient.unitCost, 0);
      const formulaStatus =
        form.status !== 'Lista'
          ? form.status
          : ingredients.some((ingredient) => materialOptions.find((option) => option.sku === ingredient.sku)?.status === 'Agotado')
            ? 'En ajuste'
            : ingredients.some((ingredient) => materialOptions.find((option) => option.sku === ingredient.sku)?.status === 'Stock bajo')
              ? 'En revisión'
              : 'Lista';

      onSubmit({
        ...(item ?? {}),
        product: form.product.trim(),
        sku: form.sku.trim(),
        category: form.category,
        yieldLabel: form.yieldLabel.trim(),
        batchSize: form.batchSize.trim(),
        estimatedCost,
        status: formulaStatus,
        ingredients,
        notes: form.notes.trim(),
      });
      onClose();
      return;
    }

    if (!form.name.trim()) return setError('El nombre es requerido.');
    if (!form.sku.trim()) return setError('El SKU es requerido.');
    if (!form.category.trim()) return setError('La categoría es requerida.');

    const stock = parseInt(form.stock, 10);
    const minimum = parseInt(form.minimum, 10);
    const unitCost = parseFloat(form.unitCost);

    if (Number.isNaN(stock) || stock < 0) return setError('Stock inválido.');
    if (Number.isNaN(minimum) || minimum < 0) return setError('Stock mínimo inválido.');
    if (Number.isNaN(unitCost) || unitCost < 0) return setError('Costo unitario inválido.');

    const status = stock === 0 ? 'Agotado' : stock <= minimum ? 'Stock bajo' : 'En stock';

    onSubmit({
      ...(item ?? {}),
      name: form.name.trim(),
      sku: form.sku.trim(),
      category: form.category,
      stock,
      minimum,
      unit: form.unit.trim(),
      unitCost,
      supplier: form.supplier.trim(),
      status,
    });
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden p-4"
      role="dialog"
      aria-modal="true"
      data-lenis-prevent
    >
      <button type="button" className="fixed inset-0 h-full w-full bg-black/55 backdrop-blur-sm" aria-label="Cerrar modal" onClick={onClose} />

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

          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--color-base-text)]/60 transition-colors hover:bg-[var(--color-app-panel-hover)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="cart-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain p-5" data-lenis-prevent>
          {type === 'formula' ? (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Producto terminado</span>
                <input name="product" value={form.product} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none" placeholder="Nombre del producto" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">SKU de fórmula</span>
                <input name="sku" value={form.sku} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none whitespace-nowrap" placeholder="FP-001" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Categoría</span>
                <select name="category" value={form.category} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none">
                  <option value="">Seleccionar</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Rinde</span>
                <input name="yieldLabel" value={form.yieldLabel} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none" placeholder="1 lote / 100 unidades" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Tamaño del lote</span>
                <input name="batchSize" value={form.batchSize} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none" placeholder="100 unidades" />
              </label>

              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Estado inicial</span>
                <select name="status" value={form.status} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none">
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
                    const selectedMaterial = materialOptions.find((option) => option.sku === ingredient.materialSku);

                    return (
                      <div key={ingredient.id} className="grid gap-2 rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-2 md:grid-cols-[1fr_120px_auto] md:items-end">
                        <label className="block min-w-0">
                          <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-base-text)]/55">Insumo #{index + 1}</span>
                          <select
                            value={ingredient.materialSku}
                            onChange={(event) => updateIngredient(ingredient.id, { materialSku: event.target.value })}
                            className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-4 text-sm outline-none"
                          >
                            <option value="">Seleccionar insumo</option>
                            {materialOptions.map((material) => (
                              <option key={material.sku} value={material.sku}>
                                {material.name} · {material.sku}
                              </option>
                            ))}
                          </select>
                          {selectedMaterial ? <p className="mt-1 text-xs text-[var(--color-base-text)]/55">{selectedMaterial.unit} · {selectedMaterial.category}</p> : null}
                        </label>

                        <label className="block">
                          <span className="block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-base-text)]/55">Cantidad</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={ingredient.qty}
                            onChange={(event) => updateIngredient(ingredient.id, { qty: event.target.value })}
                            className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-4 text-sm outline-none"
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
                <textarea name="notes" value={form.notes} onChange={handleChange} className="mt-2 min-h-28 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3 text-sm outline-none" placeholder="Observaciones, proceso o detalles técnicos" />
              </label>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Nombre</span>
                <input name="name" value={form.name} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none" placeholder="Nombre del insumo" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">SKU</span>
                <input name="sku" value={form.sku} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none whitespace-nowrap" placeholder="MP-001" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Categoría</span>
                <select name="category" value={form.category} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none">
                  <option value="">Seleccionar</option>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Stock</span>
                <input name="stock" value={form.stock} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none" placeholder="0" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Stock mínimo</span>
                <input name="minimum" value={form.minimum} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none" placeholder="0" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Unidad</span>
                <input name="unit" value={form.unit} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none" placeholder="Kg / Litros / Unidades" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Costo unitario</span>
                <input name="unitCost" value={form.unitCost} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none" placeholder="0.00" />
              </label>

              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Proveedor</span>
                <input name="supplier" value={form.supplier} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none" placeholder="Empresa proveedora" />
              </label>

              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Estado</span>
                <select name="status" value={form.status} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none">
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t border-[var(--color-app-panel-border)] px-5 py-4">
          {error ? <p className="mb-3 text-xs text-red-600">{error}</p> : null}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)]/80 transition-colors hover:bg-[var(--color-app-panel-hover)]">Cancelar</button>

            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110">
              {mode === 'create' ? <PlusCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {mode === 'create' ? 'Agregar' : 'Guardar'}
            </button>
          </div>
        </div>
      </form>
    </div>,
    document.body,
  );
}
