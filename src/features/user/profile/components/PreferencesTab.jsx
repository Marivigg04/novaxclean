import { useState, useEffect } from 'react';
import { showInventoryToast } from '@/features/admin/inventory/components/toastService';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

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

export default function PreferencesTab() {
  const { user } = useAuth();
  const [newsletter, setNewsletter] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currency, setCurrency] = useState('USD ($) - Dólar');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    async function loadPreferences() {
      try {
        const { data, error } = await supabase
          .from('user_preferences')
          .select('newsletter, promotions, currency')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') {
            console.error('Error fetching preferences:', error);
          }
        } else if (data) {
          setNewsletter(data.newsletter);
          setPromotions(data.promotions);
          setCurrency(data.currency === 'VES' ? 'VES (Bs) - Bolívar' : 'USD ($) - Dólar');
        }
      } catch (err) {
        console.error('Error loading preferences:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPreferences();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      const dbCurrency = currency === 'VES (Bs) - Bolívar' ? 'VES' : 'USD';
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          newsletter,
          promotions,
          currency: dbCurrency,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;

      showInventoryToast({
        type: 'success',
        title: 'Cambios guardados',
        message: 'Tus preferencias se actualizaron correctamente.',
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      showInventoryToast({
        type: 'error',
        title: 'Error al guardar',
        message: 'No se pudieron actualizar tus preferencias.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-8 h-8 border-4 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-5 text-xl font-bold">Comunicaciones</h3>
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
        <h3 className="mb-5 text-xl font-bold">Configuración Regional</h3>
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
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-brand)] px-6 py-3 font-bold text-white shadow-[0_8px_16px_-8px_rgba(47,94,162,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
        >
          {isSaving && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
