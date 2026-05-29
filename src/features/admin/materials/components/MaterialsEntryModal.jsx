import { useEffect, useMemo, useState } from 'react';
import { PlusCircle, Save, X } from 'lucide-react';

function buildInitialForm(type, item) {
  if (type === 'formula') {
    return {
      product: item?.product ?? '',
      sku: item?.sku ?? `FP-${Date.now()}`,
      category: item?.category ?? '',
      yieldLabel: item?.yieldLabel ?? '',
      estimatedCost: item?.estimatedCost ? String(item.estimatedCost) : '',
      status: item?.status ?? 'Lista',
      ingredientsText: item?.ingredients?.map((ingredient) => `${ingredient.name} | ${ingredient.qty}`).join('\n') ?? '',
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
  onClose = () => {},
  onSubmit = () => {},
}) {
  const [form, setForm] = useState(() => buildInitialForm(type, item));
  const [error, setError] = useState('');

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

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (type === 'formula') {
      if (!form.product.trim()) return setError('El nombre de la fórmula es requerido.');
      if (!form.sku.trim()) return setError('El SKU es requerido.');
      if (!form.category.trim()) return setError('La categoría es requerida.');

      const estimatedCost = parseFloat(form.estimatedCost);
      if (Number.isNaN(estimatedCost) || estimatedCost < 0) return setError('Costo estimado inválido.');

      const ingredients = form.ingredientsText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [name, qty] = line.split('|').map((part) => part.trim());
          return { name: name ?? '', qty: qty ?? '' };
        })
        .filter((ingredient) => ingredient.name && ingredient.qty);

      if (!ingredients.length) return setError('Agrega al menos un insumo en el desglose BOM.');

      onSubmit({
        ...(item ?? {}),
        product: form.product.trim(),
        sku: form.sku.trim(),
        category: form.category,
        yieldLabel: form.yieldLabel.trim(),
        estimatedCost,
        status: form.status,
        ingredients,
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

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button type="button" className="fixed inset-0 h-full w-full bg-black/55 backdrop-blur-sm" aria-label="Cerrar modal" onClick={onClose} />

      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-2xl overflow-visible rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-[0_20px_55px_-30px_rgba(16,32,58,0.8)]">
        <div className="flex items-start justify-between border-b border-[var(--color-app-panel-border)] px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-base-text)]/50">{title}</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--color-base-text)]">{type === 'formula' ? 'Configurar fórmula' : 'Registrar insumo'}</h3>
          </div>

          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--color-base-text)]/60 transition-colors hover:bg-[var(--color-app-panel-hover)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {type === 'formula' ? (
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Producto terminado</span>
                <input name="product" value={form.product} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none" placeholder="Nombre del producto" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">SKU</span>
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
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Costo estimado</span>
                <input name="estimatedCost" value={form.estimatedCost} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none" placeholder="0.00" />
              </label>

              <label className="block">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Estado</span>
                <select name="status" value={form.status} onChange={handleChange} className="mt-2 h-11 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 text-sm outline-none">
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>

              <label className="block md:col-span-2">
                <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Desglose BOM</span>
                <textarea name="ingredientsText" value={form.ingredientsText} onChange={handleChange} className="mt-2 min-h-40 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3 text-sm outline-none" placeholder={'Ingrediente | cantidad\nIngrediente | cantidad'} />
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

          {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}

          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)]/80 transition-colors hover:bg-[var(--color-app-panel-hover)]">Cancelar</button>

            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110">
              {mode === 'create' ? <PlusCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {mode === 'create' ? 'Agregar' : 'Guardar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}