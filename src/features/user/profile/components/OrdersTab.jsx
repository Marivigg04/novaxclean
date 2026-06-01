import { useState } from 'react';

export default function OrdersTab() {
  const orders = [
    { id: '#NX-9032', date: '25 May 2026', total: '$145.00', status: 'Entregado', items: 3 },
    { id: '#NX-8941', date: '12 May 2026', total: '$32.50', status: 'En camino', items: 1 },
    { id: '#NX-8722', date: '04 May 2026', total: '$89.90', status: 'Entregado', items: 2 },
  ];
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Historial de Pedidos</h3>
        <button className="text-sm font-bold text-[var(--color-brand)] hover:opacity-80 transition-opacity">Ver todos</button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-app-panel-border)] cart-scrollbar">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)]">
            <tr>
              <th className="px-6 py-4 font-semibold">Pedido ID</th>
              <th className="px-6 py-4 font-semibold">Fecha</th>
              <th className="px-6 py-4 font-semibold">Total</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 font-semibold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-app-panel-border)]">
            {orders.map((order) => (
              <>
                <tr key={order.id} className="hover:bg-[var(--color-base-bg)] transition-colors">
                  <td className="px-6 py-5 font-bold text-[var(--color-brand)]">{order.id}</td>
                  <td className="px-6 py-5">{order.date}</td>
                  <td className="px-6 py-5 font-semibold text-base">{order.total}</td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                      order.status === 'Entregado' ? 'bg-white/90 text-[#0f2854] border border-[#0f2854]/12 shadow-sm dark:bg-white dark:text-[#0f2854] dark:border-[#0f2854]/10' : 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId((current) => (current === order.id ? null : order.id))}
                      className="font-bold text-[var(--color-brand)] hover:underline"
                    >
                      Ver detalle
                    </button>
                  </td>
                </tr>
                {selectedOrderId === order.id ? (
                  <tr>
                    <td className="px-6 pb-5 pt-0" colSpan={5}>
                      <div className="rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-5 py-4 text-sm text-[var(--color-base-text)]/80">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--color-base-text)]">Pedido {order.id}</p>
                            <p className="mt-1">Fecha: {order.date} · Total: {order.total} · Artículos: {order.items}</p>
                          </div>
                          <button type="button" onClick={() => setSelectedOrderId(null)} className="rounded-full border border-[var(--color-app-panel-border)] px-3 py-1.5 text-xs font-semibold text-[var(--color-base-text)] transition-colors hover:bg-[var(--color-app-panel-hover)]">
                            Cerrar
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : null}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
