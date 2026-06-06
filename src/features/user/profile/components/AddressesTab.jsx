import { useState } from 'react';
import { Plus, Home, Briefcase } from 'lucide-react';

export default function AddressesTab() {
  const [addresses, setAddresses] = useState([
    { id: 1, type: 'Mi Casa', icon: Home, location: 'Av. Libertador 123, Edificio Nova, Apto 4B, Caracas, 1050', isDefault: true },
    { id: 2, type: 'Oficina', icon: Briefcase, location: 'Torre Empresarial Centro, Piso 8, Oficina 801, Caracas, 1010', isDefault: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [newAddress, setNewAddress] = useState({ type: '', location: '', isDefault: false });
  const [editingId, setEditingId] = useState(null);

  function handleOpenModal() {
    setNewAddress({ type: '', location: '', isDefault: false });
    setEditingId(null);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(address) {
    setNewAddress({ type: address.type, location: address.location, isDefault: !!address.isDefault });
    setEditingId(address.id);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      setIsModalOpen(false);
    }, 260);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const icon = newAddress.type.toLowerCase().includes('oficina') ? Briefcase : Home;
    const payload = { type: newAddress.type || 'Dirección', icon, location: newAddress.location, isDefault: !!newAddress.isDefault };

    if (editingId != null) {
      setAddresses((current) => {
        let updated = current.map((a) => (a.id === editingId ? { ...a, ...payload } : a));
        if (payload.isDefault) {
          updated = updated.map((a) => (a.id === editingId ? { ...a, isDefault: true } : { ...a, isDefault: false }));
        }
        return updated;
      });
    } else {
      const nextId = addresses.length ? Math.max(...addresses.map((a) => a.id)) + 1 : 1;
      const addressToAdd = { id: nextId, ...payload };
      setAddresses((current) => {
        let updated = [...current];
        if (addressToAdd.isDefault) {
          updated = updated.map((a) => ({ ...a, isDefault: false }));
        }
        return [...updated, addressToAdd];
      });
    }

    // animate closing then unmount and reset editingId
    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      setIsModalOpen(false);
      setEditingId(null);
    }, 260);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Mis Direcciones</h3>
        <button onClick={handleOpenModal} className="flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-95 active:scale-90">
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
              <button onClick={() => handleOpenEditModal(address)} className="text-[var(--color-brand)] hover:opacity-80 transition-opacity">Editar</button>
              <button className="text-red-500 hover:opacity-80 transition-opacity" onClick={() => setAddresses((cur) => cur.filter((a) => a.id !== address.id))}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen ? (
        <div onClick={handleCloseModal} className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 ${isClosing ? 'cart-modal-overlay-exit' : 'cart-modal-overlay-enter'}`}>
          <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl ${isClosing ? 'cart-modal-panel-exit' : 'cart-modal-panel-enter'}`}>
            <h4 className="mb-4 text-lg font-bold">{editingId ? 'Editar dirección' : 'Agregar nueva dirección'}</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">Tipo (Casa / Oficina)</label>
                <input className="w-full rounded-lg border px-3 py-2" value={newAddress.type} onChange={(e) => setNewAddress((c) => ({ ...c, type: e.target.value }))} required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold">Dirección</label>
                <textarea className="w-full rounded-lg border px-3 py-2" rows={3} value={newAddress.location} onChange={(e) => setNewAddress((c) => ({ ...c, location: e.target.value }))} required />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
                <span className="text-sm font-semibold">Marcar como dirección principal</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={newAddress.isDefault}
                  onClick={() => setNewAddress((c) => ({ ...c, isDefault: !c.isDefault }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    newAddress.isDefault ? 'bg-[var(--color-brand)]' : 'bg-surface-container-high'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      newAddress.isDefault ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={handleCloseModal} className="rounded-xl px-4 py-2">Cancelar</button>
                <button type="submit" className="rounded-xl bg-[var(--color-brand)] px-4 py-2 text-white font-bold">{editingId ? 'Guardar cambios' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
