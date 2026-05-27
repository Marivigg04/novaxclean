import { shippingRows } from './data';

export default function ShippingTable() {
  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 cloud-shadow">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h3 className="text-headline-md font-bold text-primary">Seguimiento de Envíos</h3>
        <button className="text-label-md font-bold text-secondary hover:underline" type="button">
          Ver todos los envíos
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-outline-variant">
            <tr className="text-label-md uppercase tracking-tighter text-on-surface-variant">
              <th className="pb-4 font-bold">Pedido</th>
              <th className="pb-4 font-bold">Destino</th>
              <th className="pb-4 font-bold">Estado</th>
              <th className="pb-4 font-bold">ETA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/30 text-body-md">
            {shippingRows.map((row) => (
              <tr key={row.order} className="group transition-colors hover:bg-surface-container-low">
                <td className="py-4 font-bold text-primary">{row.order}</td>
                <td className="py-4">{row.destination}</td>
                <td className="py-4">
                  <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-bold ${row.statusClass}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${row.dotClass}`} />
                    {row.status}
                  </span>
                </td>
                <td className="py-4">{row.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
