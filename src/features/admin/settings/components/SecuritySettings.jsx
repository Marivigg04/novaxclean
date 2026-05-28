import { useMemo, useState } from 'react';
import { Eye, EyeOff, ShieldCheck, Save } from 'lucide-react';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--color-base-text)]/70">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-4 text-left transition-colors hover:bg-[var(--color-app-panel-hover)]"
    >
      <div>
        <p className="text-sm font-semibold text-[var(--color-base-text)]">{label}</p>
        <p className="mt-1 text-xs text-[var(--color-base-text)]/60">{description}</p>
      </div>

      <span
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-base-text)]/20'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  );
}

export default function SecuritySettings({ initialSecurity, onSave = () => {} }) {
  const fallbackSecurity = useMemo(
    () => ({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: true,
      sessionProtection: true,
      ...initialSecurity,
    }),
    [initialSecurity],
  );

  const [security, setSecurity] = useState(fallbackSecurity);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSecurity((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(security);
  };

  return (
    <section className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-6 shadow-[0_12px_30px_-20px_rgba(16,32,58,0.35)] md:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[var(--color-base-text)]">Seguridad</h3>
        <p className="mt-1 text-sm text-[var(--color-base-text)]/62">Protege tu cuenta y tus sesiones activas.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Contraseña actual">
            <input
              name="currentPassword"
              type={showPasswords ? 'text' : 'password'}
              value={security.currentPassword}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3 text-sm text-[var(--color-base-text)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
              placeholder="Ingresa tu contraseña actual"
            />
          </Field>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setShowPasswords((current) => !current)}
              className="mb-0.5 inline-flex items-center gap-2 rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3 text-sm font-semibold text-[var(--color-base-text)] transition-colors hover:bg-[var(--color-app-panel-hover)]"
            >
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPasswords ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nueva contraseña">
            <input
              name="newPassword"
              type={showPasswords ? 'text' : 'password'}
              value={security.newPassword}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3 text-sm text-[var(--color-base-text)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
              placeholder="Mínimo 8 caracteres"
            />
          </Field>

          <Field label="Confirmar contraseña">
            <input
              name="confirmPassword"
              type={showPasswords ? 'text' : 'password'}
              value={security.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3 text-sm text-[var(--color-base-text)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
              placeholder="Repite la contraseña nueva"
            />
          </Field>
        </div>

        <div className="space-y-3">
          <Toggle
            checked={security.twoFactorEnabled}
            onChange={(value) => setSecurity((current) => ({ ...current, twoFactorEnabled: value }))}
            label="Verificación en dos pasos"
            description="Solicita un código adicional al iniciar sesión."
          />

          <Toggle
            checked={security.sessionProtection}
            onChange={(value) => setSecurity((current) => ({ ...current, sessionProtection: value }))}
            label="Protección de sesión"
            description="Cierra sesiones inactivas automáticamente."
          />
        </div>

        <div className="rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-[var(--color-app-panel-hover)] p-2 text-[var(--color-brand)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-base-text)]">Sesiones activas</p>
              <p className="mt-1 text-sm text-[var(--color-base-text)]/65">1 sesión en este dispositivo y 2 en móviles recientes.</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(16,32,58,0.45)] transition-transform hover:scale-[0.99] active:scale-[0.98]"
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </button>
        </div>
      </form>
    </section>
  );
}
