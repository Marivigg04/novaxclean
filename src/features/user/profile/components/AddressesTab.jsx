import { useCallback, useEffect, useState } from 'react';
import { Plus, Home, Briefcase, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { showInventoryToast } from '@/features/admin/inventory/components/toastService';
import {
  deleteUserAddress,
  fetchUserAddresses,
  insertUserAddress,
  updateUserAddress,
} from '@/features/user/profile/data/userService';

function pickAddressIcon(type) {
  return type?.toLowerCase().includes('oficina') ? Briefcase : Home;
}

function mapAddressForView(row) {
  return {
    ...row,
    icon: pickAddressIcon(row.type),
    location: row.location_details ?? row.location,
  };
}

export default function AddressesTab() {
  const { user, refreshUser } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [newAddress, setNewAddress] = useState({ type: '', location: '', isDefault: false });
  const [editingId, setEditingId] = useState(null);

  const loadAddresses = useCallback(async () => {
    if (!user?.id) {
      setAddresses([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const rows = await fetchUserAddresses(user.id);
      setAddresses(rows.map(mapAddressForView));
    } catch (error) {
      showInventoryToast({
        type: 'delete',
        title: 'Error de carga',
        message: error.message || 'No se pudieron cargar tus direcciones.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  function handleOpenModal() {
    setNewAddress({ type: '', location: '', isDefault: addresses.length === 0 });
    setEditingId(null);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(address) {
    setNewAddress({
      type: address.type,
      location: address.location,
      isDefault: !!address.isDefault,
    });
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

  async function handleSubmit(e) {
    e.preventDefault();

    if (!user?.id) {
      showInventoryToast({
        type: 'delete',
        title: 'Sesión requerida',
        message: 'Inicia sesión para guardar direcciones.',
      });
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        type: newAddress.type || 'Dirección',
        location: newAddress.location,
        isDefault: !!newAddress.isDefault,
      };

      if (editingId != null) {
        await updateUserAddress(user.id, editingId, payload);
      } else {
        await insertUserAddress(user.id, payload);
      }

      await loadAddresses();
      await refreshUser();

      showInventoryToast({
        type: 'success',
        title: editingId ? 'Dirección actualizada' : 'Dirección guardada',
        message: 'Tu dirección se guardó correctamente en tu cuenta.',
      });

      setIsClosing(true);
      window.setTimeout(() => {
        setIsClosing(false);
        setIsModalOpen(false);
        setEditingId(null);
      }, 260);
    } catch (error) {
      showInventoryToast({
        type: 'delete',
        title: 'Error al guardar',
        message: error.message || 'No se pudo guardar la dirección.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(addressId) {
    if (!user?.id) return;

    try {
      await deleteUserAddress(user.id, addressId);
      await loadAddresses();
      await refreshUser();
      showInventoryToast({
        type: 'success',
        title: 'Dirección eliminada',
        message: 'La dirección se eliminó de tu cuenta.',
      });
    } catch (error) {
      showInventoryToast({
        type: 'delete',
        title: 'Error al eliminar',
        message: error.message || 'No se pudo eliminar la dirección.',
      });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Mis Direcciones</h3>
        <button
          type="button"
          onClick={handleOpenModal}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-2 text-sm font-bold text-white transition-transform hover:scale-95 active:scale-90"
        >
          <Plus className="h-4 w-4" />
          Nueva Dirección
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-10 text-sm text-[var(--color-base-text)]/70">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando direcciones...
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-10 text-center text-sm text-[var(--color-base-text)]/70">
          Aún no tienes direcciones guardadas. Agrega la primera para usarla en tus pedidos.
        </div>
      ) : (
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
                <button type="button" onClick={() => handleOpenEditModal(address)} className="text-[var(--color-brand)] hover:opacity-80 transition-opacity">Editar</button>
                <button type="button" className="text-red-500 hover:opacity-80 transition-opacity" onClick={() => handleDelete(address.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}

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
                <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-2 text-white font-bold disabled:opacity-60">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingId ? 'Guardar cambios' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
