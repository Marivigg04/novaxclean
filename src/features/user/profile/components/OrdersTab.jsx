export default function OrdersTab() {
  const orders = [
    { id: '#NX-9032', date: '25 May 2026', total: '$145.00', status: 'Entregado', items: 3 },
    { id: '#NX-8941', date: '12 May 2026', total: '$32.50', status: 'En camino', items: 1 },
    { id: '#NX-8722', date: '04 May 2026', total: '$89.90', status: 'Entregado', items: 2 },
  ];

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
              <tr key={order.id} className="hover:bg-[var(--color-base-bg)] transition-colors">
                <td className="px-6 py-5 font-bold text-[var(--color-brand)]">{order.id}</td>
                <td className="px-6 py-5">{order.date}</td>
                <td className="px-6 py-5 font-semibold text-base">{order.total}</td>
                <td className="px-6 py-5">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                    order.status === 'Entregado' ? 'bg-[#0f2854]/10 text-[#0f2854] dark:bg-[#7b90c2]/20 dark:text-[#7b90c2]' : 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="font-bold text-[var(--color-brand)] hover:underline">Ver detalle</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
