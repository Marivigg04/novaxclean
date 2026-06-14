import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ThemeToggle } from '../../shared/ThemeToggle';

export default function ResetPasswordForm({ onSubmit, loading = false, invalidLink = false, onBackToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (onSubmit) {
      onSubmit({
        newPassword: form.newPassword.value,
        confirmPassword: form.confirmPassword.value,
      });
    }
  };

  if (invalidLink) {
    return (
      <div className="relative mx-auto w-full max-w-[360px] text-center">
        <div className="absolute right-0 top-0">
          <ThemeToggle />
        </div>
        <h1 className="mb-2 pr-14 text-3xl font-bold text-primary">Enlace inválido</h1>
        <p className="mb-6 text-on-surface-variant">
          El enlace de recuperación expiró o ya fue usado. Solicita uno nuevo desde el inicio de sesión.
        </p>
        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full rounded-lg bg-primary py-3 font-semibold text-on-primary transition-colors hover:bg-primary-container cursor-pointer"
        >
          Ir al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute right-0 top-0">
        <ThemeToggle />
      </div>

      <h1 className="mb-2 pr-14 text-3xl font-bold text-primary">Nueva contraseña</h1>
      <p className="mb-6 text-on-surface-variant">Define una contraseña segura para tu cuenta.</p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-semibold text-primary">Nueva contraseña</label>
          <div className="relative">
            <input
              name="newPassword"
              required
              minLength={8}
              disabled={loading}
              type={showPassword ? 'text' : 'password'}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-4 pr-12 py-3 text-on-surface outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary disabled:opacity-60"
              placeholder="Mínimo 8 caracteres"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-primary">Confirmar contraseña</label>
          <div className="relative">
            <input
              name="confirmPassword"
              required
              minLength={8}
              disabled={loading}
              type={showConfirm ? 'text' : 'password'}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-4 pr-12 py-3 text-on-surface outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary disabled:opacity-60"
              placeholder="Repite la contraseña"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
              aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-primary py-3 font-semibold text-on-primary transition-colors hover:bg-primary-container cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Actualizando…' : 'Restablecer contraseña'}
        </button>
      </form>
    </div>
  );
}
