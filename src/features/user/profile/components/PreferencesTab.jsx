import { useState } from 'react';
import { showInventoryToast } from '@/features/admin/inventory/components/toastService';

function ToggleSwitch({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors" aria-pressed={checked}>
      <span className={`absolute inset-0 rounded-full ${checked ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-base-text)]/20'}`} />
      <span className={`relative inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function PreferencesTab() {
  const [newsletter, setNewsletter] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [currency, setCurrency] = useState('USD ($) - Dólar');

  return (
    <div className="max-w-3xl space-y-8">
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
                  <span>{currency}</span>
                  <span className={`material-symbols-outlined ml-3 transition-transform duration-200 ${currencyOpen ? 'rotate-180' : ''}`} aria-hidden>
                    expand_more
                  </span>
                </button>

                {currencyOpen ? (
                  <ul role="listbox" className="absolute z-40 mt-2 w-full overflow-hidden rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-lg">
                    <li role="option" tabIndex={0} className="cursor-pointer px-4 py-3 transition-colors duration-150 hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)] focus-visible:bg-[var(--color-brand)]/10 focus-visible:text-[var(--color-brand)]" onClick={() => { setCurrency('USD ($) - Dólar'); setCurrencyOpen(false); }} onKeyDown={(e) => { if (e.key === 'Enter') { setCurrency('USD ($) - Dólar'); setCurrencyOpen(false); } }}>
                      USD ($) - Dólar
                    </li>
                    <li role="option" tabIndex={0} className="cursor-pointer px-4 py-3 transition-colors duration-150 hover:bg-[var(--color-brand)]/10 hover:text-[var(--color-brand)] focus-visible:bg-[var(--color-brand)]/10 focus-visible:text-[var(--color-brand)]" onClick={() => { setCurrency('VES (Bs) - Bolívar'); setCurrencyOpen(false); }} onKeyDown={(e) => { if (e.key === 'Enter') { setCurrency('VES (Bs) - Bolívar'); setCurrencyOpen(false); } }}>
                      VES (Bs) - Bolívar
                    </li>
                  </ul>
                ) : null}
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-4">
        <button className="rounded-xl bg-[var(--color-brand)] px-6 py-3 font-bold text-white shadow-[0_8px_16px_-8px_rgba(47,94,162,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all">
          Descartar
        </button>
        <button
          type="button"
          onClick={() => {
            showInventoryToast({
              type: 'success',
              title: 'Cambios guardados',
              message: 'Tus preferencias se actualizaron correctamente.',
            });
          }}
          className="rounded-xl bg-[var(--color-brand)] px-6 py-3 font-bold text-white shadow-[0_8px_16px_-8px_rgba(47,94,162,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
