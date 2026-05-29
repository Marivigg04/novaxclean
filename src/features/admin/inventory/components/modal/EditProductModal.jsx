import { useEffect, useState } from 'react';
import { X, Save } from 'lucide-react';

export default function EditProductModal({ isOpen = false, product = null, onClose = () => {}, onSubmit = () => {} }) {
  const [form, setForm] = useState({ stock: '', price: '' });

  useEffect(() => {
    if (!isOpen || !product) {
      setForm({ stock: '', price: '' });
      return;
    }

    setForm({ stock: String(product.stock ?? ''), price: String(product.price ?? '') });
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((c) => ({ ...c, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const stock = form.stock === '' ? product.stock : parseInt(form.stock, 10);
    const price = form.price === '' ? product.price : parseFloat(form.price);

    if (Number.isNaN(stock) || stock < 0) return alert('Stock inválido.');
    if (Number.isNaN(price) || price < 0) return alert('Precio inválido.');

    onSubmit({ ...product, stock, price });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button
        type="button"
        className="fixed inset-0 h-full w-full bg-black/55 backdrop-blur-sm"
        aria-label="Cerrar modal"
        onClick={onClose}
      />

      <form onSubmit={handleSubmit} className="relative z-10 w-full max-w-md overflow-visible rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-[0_20px_55px_-30px_rgba(16,32,58,0.8)]">
        <div className="flex items-start justify-between border-b border-[var(--color-app-panel-border)] px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-base-text)]/50">Editar producto</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--color-base-text)]">{product.name}</h3>
          </div>

          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--color-base-text)]/60 transition-colors hover:bg-[var(--color-app-panel-hover)]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Stock</span>
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2 text-sm outline-none"
                placeholder="0"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Precio</span>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2 text-sm outline-none"
                placeholder="0.00"
              />
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)]/80 transition-colors hover:bg-[var(--color-app-panel-hover)]">Cancelar</button>

            <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110">
              <Save className="h-4 w-4" />
              Guardar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
