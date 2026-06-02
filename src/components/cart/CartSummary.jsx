const formatMoney = (value) => `$${value.toFixed(2)}`;

export default function CartSummary({ subtotal, shipping, taxes, total, onOpenCheckout }) {
  return (
    <aside className="sticky top-24 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 cloud-shadow">
      <h2 className="mb-6 text-headline-md font-semibold text-primary">Resumen del Pedido</h2>

      <div className="mb-6 space-y-4">
        <div className="flex min-w-0 justify-between gap-4 text-body-md text-on-surface-variant">
          <span>Subtotal</span>
          <span>{formatMoney(subtotal)}</span>
        </div>
        <div className="flex min-w-0 justify-between gap-4 text-body-md text-on-surface-variant">
          <span className="min-w-0 break-words">Envío</span>
          <span className="font-bold text-secondary">{shipping === 0 ? 'Gratis' : formatMoney(shipping)}</span>
        </div>
        <div className="flex min-w-0 justify-between gap-4 text-body-md text-on-surface-variant">
          <span>Impuestos (IVA 16%)</span>
          <span>{formatMoney(taxes)}</span>
        </div>
        <div className="flex min-w-0 items-baseline justify-between gap-4 border-t border-outline-variant pt-4">
          <span className="text-headline-md font-bold text-primary">Total</span>
          <span className="text-headline-md font-black text-primary">{formatMoney(total)}</span>
        </div>
      </div>

      <div className="mb-6 rounded-lg border-l-4 border-secondary bg-surface-container p-4">
        <p className="mb-1 flex items-center gap-2 text-label-md font-bold text-secondary">
          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          Envío gratis desde $25
        </p>
        <p className="break-words text-xs text-on-surface-variant">Agrega un poco más a tu carrito y obtén envío gratis en tu pedido.</p>
      </div>

      <button className="mb-4 w-full rounded-xl bg-primary py-4 text-body-lg font-bold text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-95" type="button" onClick={onOpenCheckout}>
        Confirmar y Finalizar Pedido
      </button>

      <div className="flex items-center justify-center gap-4 text-outline">
        <span className="material-symbols-outlined">verified_user</span>
        <span className="material-symbols-outlined">credit_card</span>
        <span className="material-symbols-outlined">account_balance</span>
      </div>
    </aside>
  );
}
