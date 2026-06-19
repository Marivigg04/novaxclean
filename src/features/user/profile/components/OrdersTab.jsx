import { useCallback, useEffect, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Loader2,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { showInventoryToast } from '@/features/admin/inventory/components/toastService';
import { fetchUserOrders } from '@/features/user/profile/data/userService';
import { formatCurrency } from '@/utils/currencyFormatter';
import { useExchangeRate } from '@/hooks/useExchangeRate';

const PAYMENT_LABELS = {
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
  pagomovil: 'Pago móvil',
};

function getStatusStyles(status) {
  switch (status) {
    case 'Entregado':
      return {
        badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300',
        dot: 'bg-emerald-500',
      };
    case 'En camino':
      return {
        badge: 'bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300',
        dot: 'bg-sky-500',
      };
    case 'Pago Procesado':
    case 'Preparando':
      return {
        badge: 'bg-amber-500/10 text-amber-800 border-amber-500/20 dark:text-amber-300',
        dot: 'bg-amber-500',
      };
    default:
      return {
        badge: 'bg-[var(--color-brand)]/10 text-[var(--color-brand)] border-[var(--color-brand)]/20',
        dot: 'bg-[var(--color-brand)]',
      };
  }
}

function getFulfillmentLabel(mode) {
  if (mode === 'pickup') return 'Retiro en tienda';
  if (mode === 'delivery') return 'Envío a domicilio';
  return 'Entrega';
}

function OrderStatusBadge({ status }) {
  const styles = getStatusStyles(status);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${styles.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      {status}
    </span>
  );
}

function OrderMetaItem({ icon: Icon, label, value, align = 'left' }) {
  return (
    <div className={`min-w-0 ${align === 'right' ? 'text-right' : ''}`}>
      <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-base-text)]/50">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-[var(--color-base-text)]">{value}</p>
    </div>
  );
}

function OrderCard({ order, isExpanded, onToggle, rate, currencyPref }) {
  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod ?? '—';

  return (
    <article className="group overflow-hidden rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] shadow-sm transition-all duration-200 hover:border-[var(--color-brand)]/40 hover:shadow-md">
      <div className="border-b border-[var(--color-app-panel-border)]/60 bg-[var(--color-base-bg)]/40 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-base-text)]/50">
                  Pedido
                </p>
                <p className="truncate text-base font-extrabold text-[var(--color-brand)]">{order.id}</p>
              </div>
            </div>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 px-5 py-4 sm:grid-cols-3">
        <OrderMetaItem icon={CalendarDays} label="Fecha" value={order.date} />
        <OrderMetaItem icon={ShoppingBag} label="Artículos" value={`${order.items} ${order.items === 1 ? 'artículo' : 'artículos'}`} />
        <OrderMetaItem icon={Truck} label="Entrega" value={getFulfillmentLabel(order.fulfillmentMode)} align="right" />
      </div>

      <div className="mx-5 flex items-center justify-between gap-3 rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-base-text)]/50">Total pagado</p>
          <p className="text-lg font-extrabold text-[var(--color-base-text)]">{formatCurrency(order.totalRaw, rate, currencyPref)}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-3 py-2 text-xs font-bold text-[var(--color-brand)] transition-colors hover:bg-[var(--color-app-panel-hover)]"
        >
          {isExpanded ? 'Ocultar' : 'Ver detalle'}
          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isExpanded ? (
        <div className="space-y-4 border-t border-[var(--color-app-panel-border)]/60 px-5 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-base-text)]/50">Método de pago</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-base-text)]">{paymentLabel}</p>
            </div>
            <div className="rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-base-text)]/50">Modalidad</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-base-text)]">{getFulfillmentLabel(order.fulfillmentMode)}</p>
            </div>
          </div>

          {order.deliveryAddress ? (
            <div className="rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-base-text)]/50">
                <MapPin className="h-3.5 w-3.5" />
                Dirección de entrega
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-base-text)]/80">{order.deliveryAddress}</p>
            </div>
          ) : null}

          {order.lineItems?.length ? (
            <div className="overflow-hidden rounded-xl border border-[var(--color-app-panel-border)]">
              <div className="border-b border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-3 py-2">
                <p className="text-xs font-bold text-[var(--color-base-text)]">Productos incluidos</p>
              </div>
              <ul className="divide-y divide-[var(--color-app-panel-border)]">
                {order.lineItems.map((item, index) => (
                  <li key={`${order.orderId}-${item.name}-${index}`} className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm">
                    <span className="min-w-0 truncate font-medium text-[var(--color-base-text)]">{item.name}</span>
                    <span className="shrink-0 rounded-full bg-[var(--color-brand)]/10 px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand)]">
                      x{item.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function OrdersTab() {
  const { user } = useAuth();
  const { rate } = useExchangeRate();
  const currencyPref = user?.currency || 'VES';
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

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
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-12 text-sm text-[var(--color-base-text)]/70">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--color-brand)]" />
        Cargando tus pedidos...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h3 className="text-xl font-bold">Mis Pedidos</h3>
          <p className="mt-1 text-sm text-[var(--color-base-text)]/60">Consulta el historial de compras de tu cuenta.</p>
        </header>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-6 py-14 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-brand)]/10 text-[var(--color-brand)]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <p className="text-base font-bold text-[var(--color-base-text)]">Sin pedidos todavía</p>
          <p className="mt-2 max-w-sm text-sm text-[var(--color-base-text)]/65">
            Cuando completes una compra con tu cuenta, tus pedidos aparecerán aquí en tarjetas fáciles de revisar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Mis Pedidos</h3>
          <p className="mt-1 text-sm text-[var(--color-base-text)]/60">
            Revisa el estado, total y detalle de tus compras.
          </p>
        </div>
        <span className="rounded-full bg-[var(--color-brand)]/10 px-3 py-1 text-sm font-bold text-[var(--color-brand)]">
          {orders.length} pedido{orders.length === 1 ? '' : 's'}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {orders.map((order) => (
          <OrderCard
            key={order.orderId}
            order={order}
            rate={rate}
            currencyPref={currencyPref}
            isExpanded={expandedOrderId === order.id}
            onToggle={() => setExpandedOrderId((current) => (current === order.id ? null : order.id))}
          />
        ))}
      </div>
    </div>
  );
}
