import { Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { formatCurrency } from '../../utils/currencyFormatter';

export default function CartTable({
  items,
  onBackToCatalog,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onRemoveItem,
  onClearCart,
}) {
  const { user } = useAuth();
  const { rate } = useExchangeRate();
  const currencyPref = user?.currency || 'VES';

  return (
    <section className="cart-subtle-float overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-lg">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-outline-variant bg-surface-container-low/65">
            <tr>
              <th className="px-6 py-4.5 text-label-md font-bold uppercase tracking-wider text-on-surface-variant">Producto</th>
              <th className="px-6 py-4.5 text-label-md font-bold uppercase tracking-wider text-on-surface-variant">Precio</th>
              <th className="px-6 py-4.5 text-center text-label-md font-bold uppercase tracking-wider text-on-surface-variant">
                <span className="inline-flex w-full justify-center">Cantidad</span>
              </th>
              <th className="px-6 py-4.5 text-right text-label-md font-bold uppercase tracking-wider text-on-surface-variant">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/60">
            {items.map((item) => (
              <tr key={item.id} className="group transition-colors hover:bg-surface-container-lowest">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-container border border-outline-variant/30">
                      <img alt={item.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" src={item.image} />
                    </div>
                    <div>
                      <p className="text-body-md font-bold text-primary group-hover:text-[var(--color-brand)] transition-colors">{item.name}</p>
                      <p className="mt-1 text-label-md text-on-surface-variant">Ref: {item.ref}</p>
                      <button
                        className="mt-2.5 flex items-center gap-1.5 text-xs font-bold text-error/80 hover:text-error transition-colors"
                        type="button"
                        onClick={() => onRemoveItem?.(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 text-body-md font-semibold text-on-surface">{formatCurrency(item.rawPrice, rate, currencyPref)}</td>
                <td className="px-6 py-6 align-middle text-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`cart-quantity-control ${item.pulse === 'increase' ? 'cart-quantity-control-increase' : item.pulse === 'decrease' ? 'cart-quantity-control-decrease' : ''}`}>
                      <button className="cart-quantity-button" type="button" onClick={() => onDecreaseQuantity(item.id)} aria-label={`Disminuir cantidad de ${item.name}`}>
                        -
                      </button>
                      <input className="cart-quantity-input" type="text" value={item.quantity} readOnly />
                      <button className="cart-quantity-button" type="button" onClick={() => onIncreaseQuantity(item.id)} aria-label={`Aumentar cantidad de ${item.name}`}>
                        +
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 text-right text-body-md font-extrabold text-primary">
                  <span className="cart-subtotal-value">{formatCurrency(item.rawPrice * item.quantity, rate, currencyPref)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="block md:hidden divide-y divide-outline-variant/60">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 p-5 items-start bg-surface-container-lowest group">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-surface-container border border-outline-variant/30">
              <img alt={item.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" src={item.image} />
            </div>
            
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div>
                <p className="text-body-md font-bold text-primary truncate">{item.name}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Ref: {item.ref}</p>
              </div>

              <div className="flex items-center justify-between gap-4 mt-1">
                <span className="text-body-md font-semibold text-on-surface">{formatCurrency(item.rawPrice, rate, currencyPref)}</span>
                <div className={`cart-quantity-control ${item.pulse === 'increase' ? 'cart-quantity-control-increase' : item.pulse === 'decrease' ? 'cart-quantity-control-decrease' : ''}`}>
                  <button className="cart-quantity-button" type="button" onClick={() => onDecreaseQuantity(item.id)} aria-label={`Disminuir cantidad de ${item.name}`}>
                    -
                  </button>
                  <input className="cart-quantity-input" type="text" value={item.quantity} readOnly />
                  <button className="cart-quantity-button" type="button" onClick={() => onIncreaseQuantity(item.id)} aria-label={`Aumentar cantidad de ${item.name}`}>
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 pt-3 mt-1 border-t border-outline-variant/30">
                <button
                  className="flex items-center gap-1.5 text-xs font-bold text-error/80 hover:text-error transition-colors"
                  type="button"
                  onClick={() => onRemoveItem?.(item.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Eliminar
                </button>
                <span className="text-body-md font-extrabold text-primary">{formatCurrency(item.rawPrice * item.quantity, rate, currencyPref)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-stretch justify-between gap-4 bg-surface-container-low/40 p-6 border-t border-outline-variant/60 lg:flex-row lg:items-center">
        <button className="rounded-xl border border-secondary px-5 py-2.5 text-label-md font-bold text-secondary transition-all hover:bg-surface-container-low active:scale-[0.98]" type="button" onClick={onBackToCatalog}>
          Seguir Comprando
        </button>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="rounded-xl border border-outline-variant px-5 py-2.5 text-label-md font-bold text-on-surface-variant transition-all hover:bg-surface-container-low active:scale-[0.98]"
            type="button"
            onClick={onClearCart}
          >
            Vaciar Carrito
          </button>
        </div>
      </div>
    </section>
  );
}
