import { ThemeToggle } from '../../shared/ThemeToggle';

export default function ForgotPasswordForm({ onBack, onSubmit, loading = false }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    const email = event.currentTarget.email.value.trim();
    if (onSubmit) onSubmit(email);
  };

  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute right-0 top-0">
        <ThemeToggle />
      </div>

      <h1 className="mb-2 pr-14 text-3xl font-bold text-primary">Recuperar acceso</h1>
      <p className="mb-6 text-on-surface-variant">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
      </p>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-sm font-semibold text-primary">Correo electrónico</label>
          <input
            name="email"
            required
            type="email"
            disabled={loading}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary disabled:opacity-60"
            placeholder="nombre@empresa.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-primary py-3 font-semibold text-on-primary transition-colors hover:bg-primary-container cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Enviando enlace…' : 'Enviar enlace de recuperación'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          type="button"
          disabled={loading}
          className="font-bold text-secondary hover:underline cursor-pointer disabled:opacity-60"
          onClick={onBack}
        >
          Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}
