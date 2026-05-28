import { useEffect, useState } from 'react';

const paymentMethods = [
  { id: 'tarjeta', label: 'Tarjeta corporativa', description: 'Visa, Mastercard o American Express' },
  { id: 'transferencia', label: 'Transferencia bancaria', description: 'Confirmación al acreditar el pago' },
  { id: 'factura', label: 'Pago contra factura', description: 'Disponible para clientes registrados' },
];

export default function CartCheckoutModal({ isOpen, onClose }) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [fulfillment, setFulfillment] = useState('delivery');

  useEffect(() => {
    let timeoutId;

    if (isOpen) {
      setIsRendered(true);
      setIsClosing(false);
      return undefined;
    }

    if (isRendered) {
      setIsClosing(true);
      timeoutId = window.setTimeout(() => {
        setIsRendered(false);
        setIsClosing(false);
      }, 240);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isOpen, isRendered]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isRendered) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRendered, onClose]);

  if (!isRendered) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-primary/50 px-4 py-6 backdrop-blur-sm md:items-center ${isClosing ? 'cart-modal-overlay-exit' : 'cart-modal-overlay-enter'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      onClick={onClose}
    >
      <div
        className={`cart-scrollbar my-auto max-h-[calc(100dvh-3rem)] w-full max-w-5xl overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-lowest shadow-2xl ${isClosing ? 'cart-modal-panel-exit' : 'cart-modal-panel-enter'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant bg-surface-container-low px-6 py-5 md:px-8">
          <div className="min-w-0">
            <p className="mb-1 text-label-md font-bold uppercase tracking-[0.14em] text-secondary">Checkout</p>
            <h3 id="checkout-title" className="text-headline-md font-bold text-primary">Confirma tu pedido</h3>
            <p className="mt-2 text-body-md text-on-surface-variant">Selecciona un método de pago y completa los datos para continuar con la orden.</p>
          </div>

          <button className="rounded-full border border-outline-variant px-3 py-2 text-label-md font-bold text-on-surface-variant transition-colors hover:bg-surface-container-lowest" type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="cart-scrollbar max-h-[calc(100dvh-11rem)] overflow-y-auto px-6 py-6 md:px-8">
          <form className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low p-5 md:p-6">
              <h4 className="mb-4 text-headline-md font-semibold text-primary">Datos del cliente y entrega</h4>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="min-w-0">
                  <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Nombre completo</span>
                  <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="Nombre y apellido" type="text" />
                </label>
                <label className="min-w-0">
                  <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Empresa</span>
                  <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="Razón social" type="text" />
                </label>
                <label className="min-w-0">
                  <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Correo</span>
                  <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="correo@empresa.com" type="email" />
                </label>
                <label className="min-w-0">
                  <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Teléfono</span>
                  <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="+34 600 000 000" type="tel" />
                </label>
                <label className="min-w-0 md:col-span-2">
                  <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Dirección</span>
                  <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="Calle, número, colonia, referencia" type="text" />
                </label>
                <label className="min-w-0">
                  <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Ciudad</span>
                  <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="Ciudad" type="text" />
                </label>
                <label className="min-w-0">
                  <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Código postal</span>
                  <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="00000" type="text" />
                </label>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-label-md font-semibold text-on-surface-variant">Modalidad de entrega</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${fulfillment === 'pickup' ? 'border-secondary bg-secondary/10' : 'border-outline-variant bg-surface-container-lowest'}`}>
                    <input className="mt-1" name="fulfillment" type="radio" value="pickup" checked={fulfillment === 'pickup'} onChange={() => setFulfillment('pickup')} />
                    <div className="min-w-0">
                      <p className="font-semibold text-primary">Pick Up</p>
                      <p className="text-sm text-on-surface-variant">Retiro en almacén para recogida directa.</p>
                    </div>
                  </label>
                  <label className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${fulfillment === 'delivery' ? 'border-secondary bg-secondary/10' : 'border-outline-variant bg-surface-container-lowest'}`}>
                    <input className="mt-1" name="fulfillment" type="radio" value="delivery" checked={fulfillment === 'delivery'} onChange={() => setFulfillment('delivery')} />
                    <div className="min-w-0">
                      <p className="font-semibold text-primary">Delivery</p>
                      <p className="text-sm text-on-surface-variant">Envío directo a la dirección indicada.</p>
                    </div>
                  </label>
                </div>
              </div>

              <label className="mt-6 block min-w-0">
                <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Notas adicionales</span>
                <textarea className="min-h-28 w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="Indicaciones de acceso, horario, referencia interna..." />
              </label>
            </section>

            <section className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low p-5 md:p-6">
              <h4 className="mb-4 text-headline-md font-semibold text-primary">Métodos de pago</h4>
              <p className="mb-4 text-body-md text-on-surface-variant">Elige una opción. Debe quedar seleccionada para continuar.</p>

              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label key={method.id} className={`flex min-w-0 cursor-pointer gap-3 rounded-2xl border p-4 transition-colors ${paymentMethod === method.id ? 'border-secondary bg-secondary/10' : 'border-outline-variant bg-surface-container-lowest'}`}>
                    <input className="mt-1 shrink-0" name="paymentMethod" type="radio" value={method.id} checked={paymentMethod === method.id} onChange={() => setPaymentMethod(method.id)} />
                    <div className="min-w-0">
                      <p className="font-semibold text-primary">{method.label}</p>
                      <p className="text-sm text-on-surface-variant">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                <div className="flex items-center justify-between gap-3 border-b border-outline-variant pb-3">
                  <span className="text-body-md text-on-surface-variant">Subtotal</span>
                  <span className="text-body-md font-semibold text-primary">$376.30</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-outline-variant py-3">
                  <span className="text-body-md text-on-surface-variant">Impuestos</span>
                  <span className="text-body-md font-semibold text-primary">$60.21</span>
                </div>
                <div className="flex items-center justify-between gap-3 pt-3">
                  <span className="text-headline-md font-bold text-primary">Total</span>
                  <span className="text-headline-md font-black text-primary">$436.51</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button className="w-full rounded-xl border border-outline-variant px-4 py-3 text-body-md font-bold text-on-surface-variant transition-colors hover:bg-surface-container-lowest" type="button" onClick={onClose}>
                  Cancelar
                </button>
                <button className="w-full rounded-xl bg-primary px-4 py-3 text-body-md font-bold text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-95" type="button" disabled={paymentMethod === ''}>
                  Confirmar pago
                </button>
              </div>

              <p className="mt-4 text-xs text-on-surface-variant">Antes de confirmar, selecciona un método de pago y completa los campos obligatorios.</p>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
}