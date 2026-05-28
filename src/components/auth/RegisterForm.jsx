import { ThemeToggle } from '../../shared/ThemeToggle';

export default function RegisterForm({ onToggle }) {
  return (
    <div className="relative mx-auto w-full max-w-[360px]">
      <div className="absolute right-0 top-0">
        <ThemeToggle />
      </div>

      <h1 className="mb-2 pr-14 text-3xl font-bold text-primary">Crear Cuenta</h1>
      <p className="mb-6 text-on-surface-variant">Únete a la red de limpieza NovaxClean.</p>
      
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {/* Nombre completo */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-primary">Nombre completo</label>
          <input className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary" placeholder="Ej. Juan Perez" type="text" />
        </div>
        
        {/* Correo */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-primary">Correo electrónico</label>
          <input className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary" placeholder="nombre@empresa.com" type="email" />
        </div>
        
        {/* Contraseña */}
        <div>
          <label className="mb-1 block text-sm font-semibold text-primary">Contraseña</label>
          <input className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition-colors focus:border-secondary focus:ring-2 focus:ring-secondary" placeholder="••••••••" type="password" />
        </div>

        <button className="mt-2 w-full rounded-lg bg-primary py-3 font-semibold text-on-primary transition-colors hover:bg-primary-container">Registrarse</button>
      </form>

      <div className="mt-6 text-center">
        <button className="font-bold text-secondary hover:underline" onClick={onToggle}>¿Ya tienes cuenta? Inicia sesión</button>
      </div>
    </div>
  );
}