import { salesBars } from './data';

export default function SalesChart() {
  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 cloud-shadow">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-headline-md font-bold text-primary">Distribución de Ventas</h3>
          <p className="text-label-md text-on-surface-variant">Rendimiento por categoría de producto</p>
        </div>
        <select className="rounded-full border-none bg-surface-container px-4 py-2 text-label-md text-primary focus:ring-1 focus:ring-primary">
          <option>Últimos 30 días</option>
          <option>Este Trimestre</option>
          <option>Año Fiscal</option>
        </select>
      </div>

      <div className="relative flex h-64 items-end gap-4 overflow-hidden px-4">
        <div className="absolute bottom-0 left-0 h-px w-full bg-outline-variant/30" />
        {salesBars.map((bar) => (
          <div key={bar.label} className="group flex flex-1 flex-col items-center gap-2">
            <div className={`w-full rounded-t-lg bg-primary-container opacity-20 transition-all group-hover:opacity-40 ${bar.accent}`} />
            <div className={`w-full rounded-t-lg bg-primary shadow-lg transition-all ${bar.height}`} />
            <span className="mt-2 text-[10px] font-bold uppercase text-on-surface-variant">{bar.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
