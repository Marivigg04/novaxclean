export default function PreferencesTab() {
  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h3 className="mb-5 text-xl font-bold">Comunicaciones</h3>
        <div className="space-y-4 rounded-2xl border border-[var(--color-app-panel-border)] p-6 bg-[var(--color-base-surface)]">
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <p className="font-bold group-hover:text-[var(--color-brand)] transition-colors">Boletín de noticias mensual</p>
              <p className="text-sm text-[var(--color-base-text)]/65 mt-1">Recibe novedades y nuevos productos ecofriendly.</p>
            </div>
            <input type="checkbox" className="h-5 w-5 rounded border-[var(--color-outline-variant)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]" defaultChecked />
          </label>
          <hr className="border-[var(--color-app-panel-border)]" />
          <label className="flex items-center justify-between cursor-pointer group">
            <div>
              <p className="font-bold group-hover:text-[var(--color-brand)] transition-colors">Promociones exclusivas</p>
              <p className="text-sm text-[var(--color-base-text)]/65 mt-1">Ofertas de descuento basadas en tu historial de compras.</p>
            </div>
            <input type="checkbox" className="h-5 w-5 rounded border-[var(--color-outline-variant)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]" defaultChecked />
          </label>
        </div>
      </div>

      <div>
        <h3 className="mb-5 text-xl font-bold">Configuración Regional</h3>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[var(--color-base-text)]/80">Idioma Preferido</span>
            <select className="w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-3.5 text-sm font-medium outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-all">
              <option>Español (Latinoamérica)</option>
              <option>Inglés (Estados Unidos)</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[var(--color-base-text)]/80">Moneda Referencial</span>
            <select className="w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-3.5 text-sm font-medium outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] transition-all">
              <option>USD ($) - Dólar</option>
              <option>EUR (€) - Euro</option>
              <option>VES (Bs) - Bolívar</option>
            </select>
          </label>
        </div>
      </div>
      
      <div className="pt-4 flex justify-end gap-4">
        <button className="rounded-xl px-6 py-3 font-bold text-[var(--color-base-text)]/80 hover:bg-[var(--color-app-panel-hover)] transition-colors">
          Descartar
        </button>
        <button className="rounded-xl bg-[var(--color-brand)] px-6 py-3 font-bold text-white shadow-[0_8px_16px_-8px_rgba(47,94,162,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all">
          Guardar Cambios
        </button>
      </div>
    </div>
  );
}
