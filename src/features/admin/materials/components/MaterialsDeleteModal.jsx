import { Trash2, X } from 'lucide-react';

export default function MaterialsDeleteModal({ isOpen = false, item = null, title = '', description = '', onClose = () => {}, onConfirm = () => {} }) {
  if (!isOpen || !item) return null;

  const label = item.name ?? item.product ?? 'este registro';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <button type="button" className="fixed inset-0 h-full w-full bg-black/55 backdrop-blur-sm" aria-label="Cerrar modal" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-[0_20px_55px_-30px_rgba(16,32,58,0.8)]">
        <div className="flex items-start justify-between border-b border-[var(--color-app-panel-border)] px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-base-text)]/50">{title}</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--color-base-text)]">¿Eliminar este registro?</h3>
          </div>

          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--color-base-text)]/60 transition-colors hover:bg-[var(--color-app-panel-hover)] hover:text-[var(--color-base-text)]" aria-label="Cerrar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-500/15 bg-rose-500/8 p-4">
            <Trash2 className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <p className="text-sm font-medium text-[var(--color-base-text)]">{description || 'Esta acción eliminará el registro de la lista.'}</p>
              <p className="mt-1 text-sm text-[var(--color-base-text)]/72">¿Estás seguro de que quieres eliminar {label}?</p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-2xl px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)]/80 transition-colors hover:bg-[var(--color-app-panel-hover)]">
              Cancelar
            </button>

            <button type="button" onClick={() => onConfirm(item)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-500">
              <Trash2 className="h-4 w-4" />
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}