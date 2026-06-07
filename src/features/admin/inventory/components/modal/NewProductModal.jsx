import { useEffect, useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import RoundedSelect from '@/features/admin/inventory/components/RoundedSelect';

export default function NewProductModal({ isOpen = false, onClose = () => {}, onSubmit = () => {}, categories = [] }) {
  const [form, setForm] = useState({ name: '', stock: '', category: '', price: '' });
  const [error, setError] = useState('');
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timeoutId;
    let closingTimeoutId;

    if (isOpen) {
      const renderTimeout = setTimeout(() => {
        setIsRendered(true);
        setIsClosing(false);
      }, 0);
      return () => clearTimeout(renderTimeout);
    }

    if (isRendered) {
      closingTimeoutId = setTimeout(() => {
        setIsClosing(true);
      }, 0);
      timeoutId = window.setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 240);
    }

    return () => {
      if (closingTimeoutId) clearTimeout(closingTimeoutId);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [isOpen, isRendered]);

  useEffect(() => {
    if (!isOpen) {
      setForm({ name: '', stock: '', category: '', price: '' });
      setError('');
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((c) => ({ ...c, [name]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('El nombre es requerido.');
    const stock = parseInt(form.stock, 10);
    if (Number.isNaN(stock) || stock < 0) return setError('Stock inválido.');
    const category = form.category || (categories[0] ?? 'General');
    const price = parseFloat(form.price) || 0;

    onSubmit({ name: form.name.trim(), sku: `NEW-${Date.now()}`, category, stock, minimum: 0, price, status: stock > 0 ? 'En stock' : 'Agotado' });
    onClose();
  };

  return (
    <div className={`fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm ${isClosing ? 'cart-modal-overlay-exit' : 'cart-modal-overlay-enter'}`} role="dialog" aria-modal="true" onClick={onClose}>
      <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()} className={`relative z-10 w-full max-w-md overflow-visible rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-[0_20px_55px_-30px_rgba(16,32,58,0.8)] ${isClosing ? 'cart-modal-panel-exit' : 'cart-modal-panel-enter'}`}>
        <div className="flex items-start justify-between border-b border-[var(--color-app-panel-border)] px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-base-text)]/50">Nuevo producto</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--color-base-text)]">Agregar producto</h3>
          </div>

          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--color-base-text)]/60 transition-colors hover:bg-[var(--color-app-panel-hover)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <label className="block mb-3">
            <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Nombre</span>
            <input name="name" value={form.name} onChange={handleChange} className="mt-2 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2 text-sm outline-none" placeholder="Nombre del producto" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Stock</span>
              <input name="stock" value={form.stock} onChange={handleChange} className="mt-2 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2 text-sm outline-none" placeholder="0" />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Categoría</span>
              <RoundedSelect
                value={form.category}
                onChange={(nextCategory) => setForm((current) => ({ ...current, category: nextCategory }))}
                options={categories.map((c) => ({ value: c, label: c }))}
                placeholder="Seleccionar"
                className="mt-2"
              />
            </label>
          </div>

          <label className="block mt-3">
            <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Precio</span>
            <input name="price" value={form.price} onChange={handleChange} className="mt-2 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2 text-sm outline-none" placeholder="0.00" />
          </label>

          {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}

          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)]/80 transition-colors hover:bg-[var(--color-app-panel-hover)]">Cancelar</button>

            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110">
              <PlusCircle className="h-4 w-4" />
              Agregar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
