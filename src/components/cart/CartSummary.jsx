export default function CartSummary() {
  return (
    <aside className="sticky top-24 rounded-xl border border-outline-variant bg-surface-container-lowest p-6 cloud-shadow">
      <h2 className="mb-6 text-headline-md font-semibold text-primary">Resumen del Pedido</h2>

      <div className="mb-6 space-y-4">
        <div className="flex justify-between text-body-md text-on-surface-variant">
          <span>Subtotal</span>
          <span>$376.30</span>
        </div>
        <div className="flex justify-between text-body-md text-on-surface-variant">
          <span>Envío Industrial (Logística Propia)</span>
          <span className="font-bold text-secondary">Gratis</span>
        </div>
        <div className="flex justify-between text-body-md text-on-surface-variant">
          <span>Impuestos (IVA 16%)</span>
          <span>$60.21</span>
        </div>
        <div className="flex items-baseline justify-between border-t border-outline-variant pt-4">
          <span className="text-headline-md font-bold text-primary">Total</span>
          <span className="text-headline-md font-black text-primary">$436.51</span>
        </div>
      </div>

      <div className="mb-6 rounded-lg border-l-4 border-secondary bg-surface-container p-4">
        <p className="mb-1 flex items-center gap-2 text-label-md font-bold text-secondary">
          <span className="material-symbols-outlined text-[18px]">local_shipping</span>
          Envío B2B Express
        </p>
        <p className="text-xs text-on-surface-variant">Entrega programada para el próximo martes en tu almacén central.</p>
      </div>

      <button className="mb-4 w-full rounded-xl bg-primary py-4 text-body-lg font-bold text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-95" type="button">
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
