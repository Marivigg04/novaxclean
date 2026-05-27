import { inventoryMetrics, inventorySummary } from './data';

export default function InventoryMetrics() {
  return (
    <section className="relative overflow-hidden rounded-xl bg-primary p-6 text-on-primary cloud-shadow">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-secondary opacity-10" />
      <h3 className="mb-4 text-headline-md font-bold">Métricas de Inventario</h3>

      <div className="relative z-10 space-y-6">
        {inventoryMetrics.map((metric) => (
          <div key={metric.label}>
            <div className="mb-2 flex justify-between text-label-md opacity-80">
              <span>{metric.label}</span>
              <span>{metric.value}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-on-primary/10">
              <div className={`${metric.barClass} h-full rounded-full`} style={{ width: metric.barWidth }} />
            </div>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-4 pt-4">
          {inventorySummary.map((item) => (
            <div key={item.label} className="rounded-lg border border-on-primary/10 bg-on-primary/5 p-4">
              <p className="text-[10px] uppercase opacity-60">{item.label}</p>
              <p className="text-headline-md font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
