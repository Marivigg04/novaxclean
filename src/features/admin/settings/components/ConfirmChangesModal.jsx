import { useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, X } from 'lucide-react';

export default function ConfirmChangesModal({ isOpen = false, onClose = () => {}, onConfirm = () => {} }) {
  const [step, setStep] = useState('confirm');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStep('confirm');
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  const handleConfirmPassword = (event) => {
    event.preventDefault();

    if (!password.trim()) {
      setError('Debes ingresar tu contraseña para continuar.');
      return;
    }

    onConfirm(password);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <button
        type="button"
        className="fixed inset-0 h-full w-full bg-black/55 backdrop-blur-sm"
        aria-label="Cerrar modal"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-[0_20px_55px_-30px_rgba(16,32,58,0.8)]">
        <div className="flex items-start justify-between border-b border-[var(--color-app-panel-border)] px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-base-text)]/50">Confirmación</p>
            <h3 className="mt-1 text-lg font-semibold text-[var(--color-base-text)]">
              {step === 'confirm' ? '¿Guardar cambios?' : 'Confirma con tu contraseña'}
            </h3>
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

        {step === 'confirm' ? (
          <div className="px-5 py-5">
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-brand)]" />
              <p className="text-sm text-[var(--color-base-text)]/80">Estas seguro de estos cambios?</p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setStep('password')}
                className="rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:brightness-110"
              >
                Si
              </button>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)]/80 transition-colors hover:bg-[var(--color-app-panel-hover)]"
              >
                No
              </button>
            </div>
          </div>
        ) : (
          <form className="px-5 py-5" onSubmit={handleConfirmPassword}>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-[var(--color-base-text)]/75">Contraseña</span>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-base-text)]/45" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError('');
                  }}
                  className="w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] py-2.5 pl-9 pr-3 text-sm text-[var(--color-base-text)] outline-none transition-colors focus:border-[var(--color-brand)]"
                  placeholder="Ingresa tu contraseña"
                  autoFocus
                />
              </div>
            </label>

            {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)]/80 transition-colors hover:bg-[var(--color-app-panel-hover)]"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-xl bg-[var(--color-brand)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:brightness-110"
              >
                Confirmar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}