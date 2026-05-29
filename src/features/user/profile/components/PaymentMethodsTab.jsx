import { Plus } from 'lucide-react';

export default function PaymentMethodsTab() {
  const methods = [
    { id: 1, last4: '4242', brand: 'Visa', exp: '12/28', isDefault: true },
    { id: 2, last4: '5555', brand: 'Mastercard', exp: '08/27', isDefault: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">Métodos de Pago</h3>
        <button className="flex items-center gap-2 rounded-xl border border-[var(--color-brand)] px-4 py-2 text-sm font-bold text-[var(--color-brand)] transition-all hover:bg-[var(--color-brand)] hover:text-white active:scale-95">
          <Plus className="h-4 w-4" />
          Añadir Tarjeta
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {methods.map((method) => (
          <div key={method.id} className="flex items-center justify-between rounded-2xl border border-[var(--color-app-panel-border)] p-6 transition-all hover:border-[var(--color-brand)] bg-[var(--color-base-surface)]">
            <div className="flex items-center gap-5">
              <div className="flex h-12 w-16 items-center justify-center rounded-xl bg-[var(--color-surface-container)] font-bold text-[var(--color-primary)]">
                {method.brand}
              </div>
              <div>
                <p className="font-bold">•••• •••• •••• {method.last4}</p>
                <p className="text-sm font-medium text-[var(--color-base-text)]/60">Vence: {method.exp}</p>
              </div>
            </div>
            {method.isDefault ? (
              <span className="rounded-md bg-[var(--color-brand)]/10 px-2 py-1 text-xs font-bold text-[var(--color-brand)]">Por defecto</span>
            ) : (
              <button className="text-sm font-bold text-[var(--color-base-text)]/70 hover:text-[var(--color-brand)] transition-colors">Establecer</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
