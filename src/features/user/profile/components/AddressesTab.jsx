import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Home, Briefcase, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { showInventoryToast } from '@/features/admin/inventory/components/toastService';
import {
  deleteUserAddress,
  fetchUserAddresses,
  insertUserAddress,
  updateUserAddress,
} from '@/features/user/profile/data/userService';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMap, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const CARACAS_DEFAULT = { lat: 10.4806, lng: -66.9036 };

const addressPinIcon = L.divIcon({
  className: 'novax-address-pin-icon',
  html: `
    <div style="position:relative; width:36px; height:42px;">
      <!-- Sombra del pin en el suelo -->
      <div style="position:absolute; bottom:-2px; left:10px; width:16px; height:6px; background:rgba(0,0,0,0.35); border-radius:50%; filter:blur(1.5px);"></div>
      <!-- Pin SVG con sombra de elevación -->
      <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="position:absolute; top:0; left:0; filter:drop-shadow(0px 4px 6px rgba(0,0,0,0.2));">
        <path d="M18 2C9.16 2 2 9.16 2 18C2 28.5 18 40 18 40C18 40 34 28.5 34 18C34 9.16 26.84 2 18 2Z" fill="var(--color-brand, #24a3ff)" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
        <circle cx="18" cy="18" r="6" fill="white"/>
      </svg>
    </div>
  `,
  iconSize: [36, 42],
  iconAnchor: [18, 42],
});

async function reverseGeocode(lat, lng) {
  try {
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', String(lat));
    url.searchParams.set('lon', String(lng));
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('addressdetails', '1');
    url.searchParams.set('email', 'novaxclean-app-geo@outlook.com');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Accept-Language': 'es' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data?.display_name || null;
  } catch (err) {
    console.error('Error reverse geocoding:', err);
    return null;
  }
}

function MapClickHandler({ onMapClick }) {
  const map = useMap();
  useMapEvent('click', (event) => {
    map.panTo(event.latlng);
    if (onMapClick) {
      onMapClick(event.latlng);
    }
  });
  return null;
}

function MapCenterListener({ onCenterChange }) {
  const map = useMap();
  useMapEvent('moveend', () => {
    if (onCenterChange) {
      onCenterChange(map.getCenter());
    }
  });
  return null;
}

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] != null && center[1] != null) {
      const currentCenter = map.getCenter();
      const dist = Math.abs(currentCenter.lat - center[0]) + Math.abs(currentCenter.lng - center[1]);
      if (dist > 0.0001) {
        map.setView(center, map.getZoom());
      }
    }
  }, [center, map]);
  return null;
}

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
  const [newAddress, setNewAddress] = useState({
    type: '',
    location: '',
    isDefault: false,
    latitude: CARACAS_DEFAULT.lat,
    longitude: CARACAS_DEFAULT.lng,
  });
  const [editingId, setEditingId] = useState(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const debounceTimeoutRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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
    isFirstRender.current = true;
    setNewAddress({
      type: '',
      location: '',
      isDefault: addresses.length === 0,
      latitude: CARACAS_DEFAULT.lat,
      longitude: CARACAS_DEFAULT.lng,
    });
    setEditingId(null);
    setIsModalOpen(true);
  }

  function handleOpenEditModal(address) {
    isFirstRender.current = true;
    setNewAddress({
      type: address.type,
      location: address.location,
      isDefault: !!address.isDefault,
      latitude: address.latitude || CARACAS_DEFAULT.lat,
      longitude: address.longitude || CARACAS_DEFAULT.lng,
    });
    setEditingId(address.id);
    setIsModalOpen(true);
  }

  function handleCloseModal() {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    setIsClosing(true);
    window.setTimeout(() => {
      setIsClosing(false);
      setIsModalOpen(false);
    }, 260);
  }

  const handleMapMoveEnd = useCallback((latlng) => {
    if (!latlng) return;
    const { lat, lng } = latlng;
    
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(async () => {
      setNewAddress((c) => ({
        ...c,
        latitude: lat,
        longitude: lng,
      }));
      
      setIsGeocoding(true);
      try {
        const addressName = await reverseGeocode(lat, lng);
        if (addressName) {
          setNewAddress((c) => ({
            ...c,
            location: addressName,
          }));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsGeocoding(false);
      }
    }, 2000);
  }, []);

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
        latitude: newAddress.latitude,
        longitude: newAddress.longitude,
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
          <div onClick={(e) => e.stopPropagation()} className={`w-full max-w-4xl rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl ${isClosing ? 'cart-modal-panel-exit' : 'cart-modal-panel-enter'}`}>
            <h4 className="mb-4 text-lg font-bold text-[var(--color-base-text)]">{editingId ? 'Editar dirección' : 'Agregar nueva dirección'}</h4>
            
            <div className="grid gap-6 md:grid-cols-2">
              {/* Columna Izquierda: Formulario */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-[var(--color-base-text)]">Tipo (Casa / Oficina)</label>
                  <input
                    className="w-full rounded-lg border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-3 py-2 text-sm outline-none text-[var(--color-base-text)] focus:border-[var(--color-brand)]"
                    placeholder="Ej. Mi Casa, Oficina Principal"
                    value={newAddress.type}
                    onChange={(e) => setNewAddress((c) => ({ ...c, type: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-semibold text-[var(--color-base-text)]">Dirección</label>
                    {isGeocoding && (
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-brand)] font-medium">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Obteniendo dirección...
                      </span>
                    )}
                  </div>
                  <textarea
                    className="w-full rounded-lg border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-3 py-2 text-sm outline-none text-[var(--color-base-text)] focus:border-[var(--color-brand)]"
                    rows={4}
                    value={newAddress.location}
                    onChange={(e) => setNewAddress((c) => ({ ...c, location: e.target.value }))}
                    placeholder="Haz clic en el mapa para autocompletar o escribe aquí"
                    required
                  />
                  <p className="mt-1 text-xs text-[var(--color-base-text)]/60">
                    Puedes editar la dirección obtenida para agregar más detalles (Apto, Piso, etc.)
                  </p>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b border-outline-variant/30">
                  <span className="text-sm font-semibold text-[var(--color-base-text)]">Marcar como dirección principal</span>
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

                <div className="mt-6 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="rounded-xl px-4 py-2 text-sm font-semibold border border-[var(--color-app-panel-border)] hover:bg-[var(--color-app-panel-hover)] text-[var(--color-base-text)] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isGeocoding}
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-4 py-2 text-sm text-white font-bold transition-transform hover:scale-98 active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                  >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {editingId ? 'Guardar cambios' : 'Guardar'}
                  </button>
                </div>
              </form>

              {/* Columna Derecha: Mapa */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-[var(--color-base-text)]">Ubicación en el Mapa</label>
                  <span className="text-xs text-[var(--color-base-text)]/60 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[var(--color-brand)]" />
                    Arrastra el mapa para centrar tu dirección
                  </span>
                </div>
                <div className="h-[300px] sm:h-[350px] md:h-[400px] rounded-xl border border-[var(--color-app-panel-border)] overflow-hidden relative shadow-inner">
                  <MapContainer
                    center={[newAddress.latitude, newAddress.longitude]}
                    zoom={15}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                    preferCanvas
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapClickHandler onMapClick={handleMapMoveEnd} />
                    <MapCenterListener onCenterChange={handleMapMoveEnd} />
                    <MapUpdater center={[newAddress.latitude, newAddress.longitude]} />
                  </MapContainer>
                  
                  {/* Pin Centrado Estático Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[400]" style={{ transform: 'translateY(-21px)' }}>
                    <div style={{ position: 'relative', width: '36px', height: '42px' }}>
                      {/* Sombra del pin en el suelo */}
                      <div style={{ position: 'absolute', bottom: '-2px', left: '10px', width: '16px', height: '6px', background: 'rgba(0,0,0,0.35)', borderRadius: '50%', filter: 'blur(1.5px)' }}></div>
                      {/* Pin SVG con sombra de elevación */}
                      <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', top: 0, left: 0, filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.2))' }}>
                        <path d="M18 2C9.16 2 2 9.16 2 18C2 28.5 18 40 18 40C18 40 34 28.5 34 18C34 9.16 26.84 2 18 2Z" fill="var(--color-brand, #24a3ff)" stroke="white" strokeWidth="2.5" strokeLinejoin="round"/>
                        <circle cx="18" cy="18" r="6" fill="white"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
