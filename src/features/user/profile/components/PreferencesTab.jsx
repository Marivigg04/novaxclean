import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { showInventoryToast } from '@/features/admin/inventory/components/toastService';
import { fetchUserPreferences, updateUserPreferences } from '@/features/user/profile/data/userService';

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD ($) - Dólar' },
  { value: 'VES', label: 'VES (Bs) - Bolívar' },
];

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-[var(--color-brand)]' : 'bg-surface-container-high'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function PreferencesTab({ embedded = false }) {
  const { user, refreshUser } = useAuth();
  const [newsletter, setNewsletter] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadPreferences = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const prefs = await fetchUserPreferences(user.id);
      setNewsletter(prefs.newsletter);
      setPromotions(prefs.promotions);
      setCurrency(prefs.currency);
    } catch (error) {
      showInventoryToast({
        type: 'delete',
        title: 'Error de carga',
        message: error.message || 'No se pudieron cargar tus preferencias.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const selectedCurrencyLabel = CURRENCY_OPTIONS.find((option) => option.value === currency)?.label ?? CURRENCY_OPTIONS[0].label;

  const handleSave = async () => {
    if (!user?.id) {
      showInventoryToast({
        type: 'delete',
        title: 'Sesión requerida',
        message: 'Inicia sesión para guardar preferencias.',
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateUserPreferences(user.id, { newsletter, promotions, currency });
      await refreshUser();
      showInventoryToast({
        type: 'success',
        title: 'Cambios guardados',
        message: 'Tus preferencias se actualizaron correctamente.',
      });
    } catch (error) {
      showInventoryToast({
        type: 'delete',
        title: 'Error al guardar',
        message: error.message || 'No se pudieron guardar tus preferencias.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center gap-2 text-sm text-[var(--color-base-text)]/70 ${embedded ? 'py-6' : 'rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-10'}`}>
        <Loader2 className="h-5 w-5 animate-spin" />
        Cargando preferencias...
      </div>
    );
  }

  const content = (
    <>
      <div>
        <h4 className="mb-4 text-base font-bold text-[var(--color-base-text)]">Comunicaciones</h4>
        <div className="space-y-4 rounded-2xl border border-[var(--color-app-panel-border)] p-6 bg-[var(--color-base-surface)]">
          <div className="flex items-center justify-between gap-4 rounded-lg p-2">
            <div>
              <p className="font-bold">Boletín de noticias mensual</p>
              <p className="text-sm text-[var(--color-base-text)]/65 mt-1">Recibe novedades y nuevos productos ecofriendly.</p>
            </div>
            <ToggleSwitch checked={newsletter} onChange={setNewsletter} />
          </div>

          <hr className="border-[var(--color-app-panel-border)]" />

          <div className="flex items-center justify-between gap-4 rounded-lg p-2">
            <div>
              <p className="font-bold">Promociones exclusivas</p>
              <p className="text-sm text-[var(--color-base-text)]/65 mt-1">Ofertas de descuento basadas en tu historial de compras.</p>
            </div>
            <ToggleSwitch checked={promotions} onChange={setPromotions} />
          </div>
        </div>
      </div>

      <div>
        <h4 className="mb-4 text-base font-bold text-[var(--color-base-text)]">Configuración regional</h4>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[var(--color-base-text)]/80">Moneda Referencial</span>
              <div className="relative">
                <button
                  type="button"
                  aria-expanded={currencyOpen}
                  className="w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-3.5 text-left text-sm font-medium outline-none flex items-center justify-between"
                  onClick={() => setCurrencyOpen((s) => !s)}
                >
                  <span>{selectedCurrencyLabel}</span>
                  <span className={`material-symbols-outlined ml-3 transition-transform duration-200 ${currencyOpen ? 'rotate-180' : ''}`} aria-hidden>
                    expand_more
                  </span>
                </button>

                {currencyOpen ? (
                  <ul role="listbox" className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-lg">
                    {CURRENCY_OPTIONS.map((option) => (
                      <li
                        key={option.value}
                        role="option"
                        tabIndex={0}
                        className="cursor-pointer px-4 py-3 transition-colors duration-150 hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)] focus-visible:bg-[var(--color-brand)]/10 focus-visible:text-[var(--color-brand)]"
                        onClick={() => {
                          setCurrency(option.value);
                          setCurrencyOpen(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setCurrency(option.value);
                            setCurrencyOpen(false);
                          }
                        }}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-4">
        <button
          type="button"
          onClick={loadPreferences}
          className="rounded-xl border border-[var(--color-app-panel-border)] px-6 py-3 font-bold transition-all hover:bg-[var(--color-app-panel-hover)]"
        >
          Descartar
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSave}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-6 py-3 font-bold text-white shadow-[0_8px_16px_-8px_rgba(47,94,162,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Guardar Cambios
        </button>
      </div>
    </>
  );

  if (embedded) {
    return <div className="space-y-8">{content}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-1 text-xl font-bold text-[var(--color-base-text)]">Preferencias</h3>
        <p className="text-sm text-[var(--color-base-text)]/60">Comunicaciones y configuración regional.</p>
      </div>
      {content}
    </div>
  );
}
