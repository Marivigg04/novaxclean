export default function LoginForm({ onToggle }) {
  return (
    <div className="max-w-[360px] mx-auto w-full">
      <h1 className="text-3xl font-bold text-[#001337] mb-2">Bienvenido</h1>
      <p className="text-gray-600 mb-6">Accede a tu panel de gestión.</p>
      
      <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
        {/* Correo */}
        <div>
          <label className="block text-sm font-semibold text-[#001337] mb-1">Correo electrónico</label>
          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="nombre@empresa.com" type="email" />
        </div>
        
        {/* Contraseña */}
        <div>
          <label className="block text-sm font-semibold text-[#001337] mb-1">Contraseña</label>
          <input className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" type="password" />
        </div>

        <button className="w-full bg-[#001337] text-white py-3 rounded-lg hover:bg-blue-900 transition-all font-semibold mt-2">Iniciar Sesión</button>
      </form>

      <div className="mt-6 text-center">
        <button className="text-blue-600 font-bold hover:underline" onClick={onToggle}>¿No tienes cuenta? Crea una</button>
      </div>
    </div>
  );
}