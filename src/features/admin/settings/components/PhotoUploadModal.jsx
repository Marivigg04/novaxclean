import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Upload, X, FileImage } from 'lucide-react';

export default function PhotoUploadModal({ isOpen = false, onClose = () => {}, onSubmit = () => {} }) {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setFiles([]);
    }
  }

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

  const fileSummary = useMemo(() => {
    if (!files.length) return 'No se han seleccionado archivos.';
    if (files.length === 1) return files[0].name;
    return `${files.length} archivos seleccionados`;
  }, [files]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (files.length) onSubmit(files);
    onClose();
  };

  const handlePickFiles = () => {
    fileInputRef.current?.click();
  };

  if (!isRendered) return null;

  return (
    // Contenedor principal: z-index alto, posición fija que ocupa toda la pantalla y centra el contenido
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 ${isClosing ? 'cart-modal-overlay-exit' : 'cart-modal-overlay-enter'}`}>
      
      {/* Overlay: Fondo oscuro semi-transparente */}
      <button
        type="button"
        className="fixed inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-sm transition-opacity"
        aria-label="Cerrar modal"
        onClick={onClose}
      />

      {/* Tarjeta del Modal: Se usa max-w-md para evitar que se estire y mantener un tamaño compacto */}
      <div className={`relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-[0_18px_45px_-28px_rgba(16,32,58,0.65)] ${isClosing ? 'cart-modal-panel-exit' : 'cart-modal-panel-enter'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-6 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-base-text)]/50">Subir foto</p>
            <h3 className="text-lg font-semibold text-[var(--color-base-text)]">Selecciona una imagen</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[var(--color-base-text)]/60 transition-colors hover:bg-[var(--color-app-panel-hover)] hover:text-[var(--color-base-text)]"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body del formulario */}
        <form className="flex flex-col gap-5 p-6" onSubmit={handleSubmit}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
          />

          {/* Área de selección estilo "Dropzone" */}
          <button
            type="button"
            onClick={handlePickFiles}
            className="group flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-8 transition-all hover:border-[var(--color-brand)]/50 hover:bg-[var(--color-app-panel-hover)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-base-surface)] text-[var(--color-brand)] shadow-sm transition-transform group-hover:scale-105">
              <ImagePlus className="h-6 w-6" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-semibold text-[var(--color-base-text)]">Haz clic para elegir archivos</span>
              <span className="mt-1 block text-xs text-[var(--color-base-text)]/55">JPG, PNG, WEBP o GIF</span>
            </div>
          </button>

          {/* Resumen de archivos */}
          <div className="flex w-full items-center gap-3 rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3 text-sm text-[var(--color-base-text)]/80">
            <FileImage className="h-4 w-4 shrink-0 text-[var(--color-brand)]" />
            <span className="truncate">{fileSummary}</span>
          </div>

          {/* Botones de acción */}
          <div className="mt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)]/80 transition-colors hover:bg-[var(--color-app-panel-hover)]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!files.length}
            >
              <Upload className="h-4 w-4" />
              Subir archivos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}