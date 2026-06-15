import { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { showInventoryToast } from '@/features/admin/inventory/components/toastService';
import { fetchUserOrders } from '@/features/user/profile/data/userService';

export default function OrdersTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const loadOrders = useCallback(async () => {
    if (!user?.id) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const rows = await fetchUserOrders(user.id);
      setOrders(rows);
    } catch (error) {
      showInventoryToast({
        type: 'delete',
        title: 'Error de carga',
        message: error.message || 'No se pudieron cargar tus pedidos.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-10 text-sm text-[var(--color-base-text)]/70">
        <Loader2 className="h-5 w-5 animate-spin" />
        Cargando pedidos...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <h3 className="text-xl font-bold">Historial de Pedidos</h3>
        <div className="rounded-2xl border border-dashed border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-10 text-center text-sm text-[var(--color-base-text)]/70">
          Aún no tienes pedidos registrados en tu cuenta.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Historial de Pedidos</h3>
        <span className="text-sm font-bold text-[var(--color-brand)]">{orders.length} pedido{orders.length === 1 ? '' : 's'}</span>
      </div>

      <div className="space-y-4 md:hidden">
        {orders.map((order) => {
          const isExpanded = selectedOrderId === order.id;
          return (
            <div
              key={order.id}
              className="rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-5 shadow-sm transition-all duration-200"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-app-panel-border)]/50 pb-3">
                <span className="font-extrabold text-sm text-[var(--color-brand)]">{order.id}</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  order.status === 'Entregado' ? 'bg-white/90 text-[#0f2854] border border-[#0f2854]/12 shadow-sm dark:bg-white dark:text-[#0f2854]' : 'bg-[var(--color-brand)]/10 text-[var(--color-brand)]'
                }`}>
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-3 py-4 text-xs">
                <div>
                  <p className="text-outline uppercase tracking-wider text-[10px] font-semibold">Fecha</p>
                  <p className="font-semibold text-[var(--color-base-text)] mt-0.5">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-outline uppercase tracking-wider text-[10px] font-semibold">Total</p>
                  <p className="font-bold text-sm text-[var(--color-base-text)] mt-0.5">{order.total}</p>
                </div>
                <div>
                  <p className="text-outline uppercase tracking-wider text-[10px] font-semibold">Artículos</p>
                  <p className="font-semibold text-[var(--color-base-text)] mt-0.5">{order.items} {order.items === 1 ? 'artículo' : 'artículos'}</p>
                </div>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedOrderId((current) => (current === order.id ? null : order.id))}
                    className="font-bold text-xs text-[var(--color-brand)] hover:underline"
                  >
                    {isExpanded ? 'Ocultar detalle' : 'Ver detalle'}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-2 rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4 text-xs text-[var(--color-base-text)]/80">
                  <p className="font-bold text-[var(--color-base-text)]">Detalles del pedido</p>
                  {order.deliveryAddress ? (
                    <p className="mt-2"><span className="font-semibold">Dirección:</span> {order.deliveryAddress}</p>
                  ) : null}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(null)}
                      className="rounded-full border border-[var(--color-app-panel-border)] px-3 py-1.5 text-[10px] font-bold text-[var(--color-base-text)] transition-colors bg-[var(--color-base-surface)] hover:bg-[var(--color-app-panel-hover)]"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden md:block overflow-x-auto rounded-2xl border border-[var(--color-app-panel-border)] cart-scrollbar">
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
                  <tr key={`${order.id}-detail`}>
                    <td className="px-6 pb-5 pt-0" colSpan={5}>
                      <div className="rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-5 py-4 text-sm text-[var(--color-base-text)]/80">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-[var(--color-base-text)]">Pedido {order.id}</p>
                            <p className="mt-1">Fecha: {order.date} · Total: {order.total} · Artículos: {order.items}</p>
                            {order.deliveryAddress ? (
                              <p className="mt-1">Dirección: {order.deliveryAddress}</p>
                            ) : null}
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
