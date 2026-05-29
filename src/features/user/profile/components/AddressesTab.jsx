import { Plus, Home, Briefcase } from 'lucide-react';

export default function AddressesTab() {
  const addresses = [
    { id: 1, type: 'Mi Casa', icon: Home, location: 'Av. Libertador 123, Edificio Nova, Apto 4B, Caracas, 1050', isDefault: true },
    { id: 2, type: 'Oficina', icon: Briefcase, location: 'Torre Empresarial Centro, Piso 8, Oficina 801, Caracas, 1010', isDefault: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Mis Direcciones</h3>
        <button className="flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-95 active:scale-90">
          <Plus className="h-4 w-4" />
          Nueva Dirección
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {addresses.map((address) => (
          <div key={address.id} className="relative rounded-2xl border border-[var(--color-app-panel-border)] p-6 transition-all hover:border-[var(--color-brand)] hover:shadow-md bg-[var(--color-base-surface)]">
            {address.isDefault && (
              <span className="absolute right-4 top-4 rounded bg-[var(--color-brand)]/10 px-2 py-1 text-xs font-bold text-[var(--color-brand)]">
                Principal
              </span>
            )}
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
              <address.icon className="h-6 w-6" />
            </div>
            <h4 className="mb-2 text-lg font-bold">{address.type}</h4>
            <p className="mb-6 text-sm leading-relaxed text-[var(--color-base-text)]/70">{address.location}</p>
            <div className="flex gap-4 text-sm font-bold">
              <button className="text-[var(--color-brand)] hover:opacity-80 transition-opacity">Editar</button>
              <button className="text-red-500 hover:opacity-80 transition-opacity">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
