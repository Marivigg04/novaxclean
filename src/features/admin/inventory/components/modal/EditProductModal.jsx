import { useEffect, useRef, useState } from 'react';
import { X, Save, ImagePlus, Loader2 } from 'lucide-react';
import RoundedSelect from '@/features/admin/inventory/components/RoundedSelect';
import { uploadProductImage } from '@/features/admin/inventory/data/inventoryService';

export default function EditProductModal({
  isOpen = false,
  product = null,
  onClose = () => {},
  onSubmit = () => {},
  categories = [],
  badges = [],
}) {
  const [form, setForm] = useState({
    sku: '',
    name: '',
    category_id: '',
    description: '',
    price: '',
    stock: '',
    minimum_stock: '',
    badge_id: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const fileInputRef = useRef(null);

  // ── Transition management ──────────────────────────────────────────────
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

  // ── Reset/Initialize on open ───────────────────────────────────────────
  useEffect(() => {
    if (isOpen && product) {
      setForm({
        sku: product.sku ?? '',
        name: product.name ?? '',
        category_id: product.category_id ?? '',
        description: product.description ?? '',
        price: String(product.price ?? ''),
        stock: String(product.stock ?? ''),
        minimum_stock: String(product.minimum_stock ?? ''),
        badge_id: product.badge_id ?? '',
      });
      setImageFile(null);
      setImagePreview(product.image_url ?? null);
      setError('');
      setLoading(false);
    } else if (!isOpen) {
      // Optional: reset when closed
      setImageFile(null);
      setImagePreview(null);
      setError('');
      setLoading(false);
    }
  }, [isOpen, product]);

  if (!isRendered || !product) return null;

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((c) => ({ ...c, [name]: value }));
    setError('');
  };

  const handleSelectChange = (field, value) => {
    setForm((c) => ({ ...c, [field]: value }));
    setError('');
  };

  // ── Image handling ─────────────────────────────────────────────────────
  const processFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5 MB.');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const handleFileChange = (e) => {
    processFile(e.target.files?.[0]);
    if (e.target) e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    processFile(e.dataTransfer.files?.[0]);
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setImageFile(null);
    setImagePreview(null);
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.sku.trim()) return setError('El SKU es requerido.');
    if (!form.name.trim()) return setError('El nombre es requerido.');

    const price = parseFloat(form.price);
    if (Number.isNaN(price) || price < 0) return setError('El precio debe ser un número válido mayor o igual a 0.');

    const stock = parseInt(form.stock, 10);
    if (Number.isNaN(stock) || stock < 0) return setError('El stock debe ser un número entero mayor o igual a 0.');

    const minimumStock = parseInt(form.minimum_stock, 10);
    if (Number.isNaN(minimumStock) || minimumStock < 0) return setError('El stock mínimo debe ser un número entero mayor o igual a 0.');

    setLoading(true);
    setError('');

    try {
      // Upload image if a new one was selected
      let imageUrl = product.image_url;
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile);
      } else if (!imagePreview) {
        // If imagePreview is null and there's no imageFile, it means the user removed the image
        imageUrl = null;
      }

      // Call parent handler
      await onSubmit({
        ...product, // preserve id and other unchanged fields
        sku: form.sku.trim(),
        name: form.name.trim(),
        category_id: form.category_id || null,
        description: form.description.trim() || null,
        price,
        stock,
        minimum_stock: minimumStock,
        badge_id: form.badge_id || null,
        image_url: imageUrl,
      });

      onClose();
    } catch (err) {
      setError(err.message || 'Ocurrió un error al actualizar el producto.');
    } finally {
      setLoading(false);
    }
  };

  // ── Category & Badge options for RoundedSelect ─────────────────────────
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const badgeOptions = [
    { value: '', label: 'Sin badge' },
    ...badges.map((b) => ({ value: b.id, label: b.name })),
  ];

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div
      className={`fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm ${isClosing ? 'cart-modal-overlay-exit' : 'cart-modal-overlay-enter'}`}
      role="dialog"
      aria-modal="true"
      onClick={!loading ? onClose : undefined}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className={`relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-[0_20px_55px_-30px_rgba(16,32,58,0.8)] ${isClosing ? 'cart-modal-panel-exit' : 'cart-modal-panel-enter'}`}
        style={{ maxHeight: 'min(92vh, 780px)' }}
      >
        {/* ── Header ────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--color-app-panel-border)] px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-base-text)]/50">
              Editar producto
            </p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--color-base-text)]">
              {product.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-2 text-[var(--color-base-text)]/60 transition-colors hover:bg-[var(--color-app-panel-hover)] disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Row 1: SKU + Nombre */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium text-[var(--color-base-text)]/75">
                SKU <span className="text-rose-500">*</span>
              </span>
              <input
                name="sku"
                value={form.sku}
                onChange={handleChange}
                disabled={loading}
                className="mt-2 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-brand)] disabled:opacity-50"
                placeholder="DET-5L-001"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-[var(--color-base-text)]/75">
                Nombre <span className="text-rose-500">*</span>
              </span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                className="mt-2 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-brand)] disabled:opacity-50"
                placeholder="Nombre del producto"
              />
            </label>
          </div>

          {/* Row 2: Categoría + Badge */}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Categoría</span>
              <RoundedSelect
                value={form.category_id}
                onChange={(val) => handleSelectChange('category_id', val)}
                options={categoryOptions}
                placeholder="Seleccionar"
                className="mt-2"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Badge</span>
              <RoundedSelect
                value={form.badge_id}
                onChange={(val) => handleSelectChange('badge_id', val)}
                options={badgeOptions}
                placeholder="Sin badge"
                className="mt-2"
              />
            </label>
          </div>

          {/* Row 3: Descripción */}
          <label className="block">
            <span className="block text-sm font-medium text-[var(--color-base-text)]/75">Descripción</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              disabled={loading}
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-brand)] disabled:opacity-50"
              placeholder="Descripción del producto…"
            />
          </label>

          {/* Row 4: Precio + Stock + Stock Mínimo */}
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="block text-sm font-medium text-[var(--color-base-text)]/75">
                Precio <span className="text-rose-500">*</span>
              </span>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                disabled={loading}
                className="mt-2 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-brand)] disabled:opacity-50"
                placeholder="0.00"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-[var(--color-base-text)]/75">
                Stock <span className="text-rose-500">*</span>
              </span>
              <input
                name="stock"
                value={form.stock}
                onChange={handleChange}
                disabled={loading}
                className="mt-2 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-brand)] disabled:opacity-50"
                placeholder="0"
              />
            </label>

            <label className="block">
              <span className="block text-sm font-medium text-[var(--color-base-text)]/75">
                Mínimo <span className="text-rose-500">*</span>
              </span>
              <input
                name="minimum_stock"
                value={form.minimum_stock}
                onChange={handleChange}
                disabled={loading}
                className="mt-2 w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2 text-sm outline-none transition-colors focus:border-[var(--color-brand)] disabled:opacity-50"
                placeholder="5"
              />
            </label>
          </div>

          {/* Row 5: Image Upload */}
          <div>
            <span className="block text-sm font-medium text-[var(--color-base-text)]/75 mb-2">
              Imagen del producto
            </span>
            <div
              className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-[var(--color-base-bg)] transition-colors cursor-pointer ${
                imagePreview
                  ? 'border-[var(--color-brand)]/30 p-3'
                  : 'border-[var(--color-app-panel-border)] p-6 hover:border-[var(--color-brand)]/50'
              } ${loading ? 'pointer-events-none opacity-50' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {imagePreview ? (
                <div className="relative flex items-center gap-4 w-full">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="h-24 w-24 shrink-0 rounded-lg object-cover border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--color-base-text)]">
                      {imageFile ? imageFile.name : 'Imagen actual'}
                    </p>
                    {imageFile && (
                      <p className="mt-1 text-xs text-[var(--color-base-text)]/50">
                        {(imageFile.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="shrink-0 rounded-full p-1.5 text-[var(--color-base-text)]/50 transition-colors hover:bg-rose-500/10 hover:text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <ImagePlus className="h-8 w-8 text-[var(--color-base-text)]/25" />
                  <p className="mt-2 text-sm text-[var(--color-base-text)]/50">
                    Arrastra una imagen o haz clic para seleccionar
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--color-base-text)]/35">
                    PNG, JPG, WEBP (máx. 5 MB)
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Error */}
          {error ? <p className="text-xs text-rose-600">{error}</p> : null}
        </div>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-[var(--color-app-panel-border)] px-5 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)]/80 transition-colors hover:bg-[var(--color-app-panel-hover)] disabled:opacity-40"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
