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

function PasswordField({ name, label, value, onChange, placeholder, showPasswords, onToggleVisibility }) {
  return (
    <Field label={label}>
      <div className="relative">
        <input
          name={name}
          type={showPasswords ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          className="w-full rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3 pr-12 text-sm text-[var(--color-base-text)] outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
          placeholder={placeholder}
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-base-text)]/55 transition-colors hover:bg-[var(--color-app-panel-hover)] hover:text-[var(--color-base-text)]"
          aria-label={showPasswords ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </Field>
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
        <p className="mt-1 text-sm text-[var(--color-base-text)]/62">Protege tu cuenta.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <PasswordField
            name="currentPassword"
            label="Contraseña actual"
            value={security.currentPassword}
            onChange={handleChange}
            placeholder="Ingresa tu contraseña actual"
            showPasswords={showPasswords}
            onToggleVisibility={() => setShowPasswords((current) => !current)}
          />

          <div className="hidden md:block" />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <PasswordField
            name="newPassword"
            label="Nueva contraseña"
            value={security.newPassword}
            onChange={handleChange}
            placeholder="Mínimo 8 caracteres"
            showPasswords={showPasswords}
            onToggleVisibility={() => setShowPasswords((current) => !current)}
          />

          <PasswordField
            name="confirmPassword"
            label="Confirmar contraseña"
            value={security.confirmPassword}
            onChange={handleChange}
            placeholder="Repite la contraseña nueva"
            showPasswords={showPasswords}
            onToggleVisibility={() => setShowPasswords((current) => !current)}
          />
        </div>

        <div className="space-y-3">
          <Toggle
            checked={security.twoFactorEnabled}
            onChange={(value) => setSecurity((current) => ({ ...current, twoFactorEnabled: value }))}
            label="Verificación en dos pasos"
            description="Solicita un código adicional al iniciar sesión."
          />
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
