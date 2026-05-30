import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const paymentMethods = [
  { id: 'tarjeta', label: 'Tarjeta corporativa', description: 'Visa, Mastercard o American Express' },
  { id: 'transferencia', label: 'Transferencia bancaria', description: 'Confirmación al acreditar el pago' },
  { id: 'pagomovil', label: 'Pago Móvil', description: 'Pago rápido desde tu banco o app móvil' },
];

export default function CartCheckoutModal({ isOpen, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [fulfillment, setFulfillment] = useState('delivery');
  const [addressMode, setAddressMode] = useState('registered');
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
  });

  const storePickupInfo = {
    address: 'Av. Principal 123, Torre Corporativa, Caracas, Distrito Capital',
    weekdayHours: 'Lunes a viernes de 8:00 am a 6:00 pm',
    saturdayHours: 'Sábados de 9:00 am a 1:00 pm',
  };

  const transferInfo = {
    bank: 'Banco Nacional de Comercio',
    accountHolder: 'NovaxClean C.A.',
    accountNumber: '0102-0201-20-1234567890',
    rif: 'J-12345678-9',
    reference: 'Pedido + nombre del cliente',
  };

  const paymentMobileInfo = {
    bank: 'Banco Nacional de Comercio',
    phone: '0412-555-7890',
    idNumber: 'J-12345678-9',
    beneficiary: 'NovaxClean C.A.',
    reference: 'Pedido + nombre del cliente',
  };

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

  const userSummary = [
    { label: 'Nombre', value: user?.name || 'No disponible' },
    { label: 'Correo', value: user?.email || 'No disponible' },
    { label: 'Teléfono', value: user?.phone || 'No disponible' },
  ];

  const registeredAddress = user?.address || 'No hay dirección registrada para esta cuenta';

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
            <p className="mt-2 text-body-md text-on-surface-variant">Selecciona un método de pago y revisa los datos registrados para continuar con la orden.</p>
          </div>

          <button className="rounded-xl border border-outline-variant px-3 py-2 text-label-md font-bold text-on-surface-variant transition-colors hover:bg-surface-container-lowest" type="button" onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div className="cart-scrollbar max-h-[calc(100dvh-11rem)] overflow-y-auto px-6 py-6 md:px-8">
          <form className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="min-w-0 rounded-2xl border border-outline-variant bg-surface-container-low p-5 md:p-6">
              <h4 className="mb-4 text-headline-md font-semibold text-primary">Datos registrados del usuario</h4>

              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
                    {String(user?.avatar ?? user?.name?.[0] ?? 'U').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-label-md font-bold text-primary">{user?.name || 'Usuario no autenticado'}</p>
                    <p className="text-sm text-on-surface-variant">{isAuthenticated ? 'Datos sincronizados desde tu sesión' : 'Inicia sesión para ver tus datos registrados'}</p>
                  </div>
                </div>

                <dl className="grid gap-3">
                  {userSummary.map((item) => (
                    <div key={item.label} className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
                      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">{item.label}</dt>
                      <dd className="mt-1 break-words text-body-md font-semibold text-primary">{item.value}</dd>
                    </div>
                  ))}
                </dl>
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

                {fulfillment === 'pickup' && (
                  <div className="mt-4 rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
                    <p className="text-label-md font-bold text-primary">Retiro en tienda</p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Dirección</p>
                        <p className="mt-1 text-body-md font-semibold text-primary">{storePickupInfo.address}</p>
                      </div>
                      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Horario</p>
                        <p className="mt-1 text-body-md font-semibold text-primary">{storePickupInfo.weekdayHours}</p>
                        <p className="mt-1 text-body-md font-semibold text-primary">{storePickupInfo.saturdayHours}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {fulfillment === 'delivery' && (
                <div className="mt-6">
                  <p className="mb-3 text-label-md font-semibold text-on-surface-variant">Dirección de entrega</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${addressMode === 'registered' ? 'border-secondary bg-secondary/10' : 'border-outline-variant bg-surface-container-lowest'}`}>
                      <input className="mt-1" name="addressMode" type="radio" value="registered" checked={addressMode === 'registered'} onChange={() => setAddressMode('registered')} />
                      <div className="min-w-0">
                        <p className="font-semibold text-primary">Usar dirección registrada</p>
                        <p className="text-sm text-on-surface-variant break-words">{registeredAddress}</p>
                      </div>
                    </label>
                    <label className={`flex min-w-0 cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${addressMode === 'new' ? 'border-secondary bg-secondary/10' : 'border-outline-variant bg-surface-container-lowest'}`}>
                      <input className="mt-1" name="addressMode" type="radio" value="new" checked={addressMode === 'new'} onChange={() => setAddressMode('new')} />
                      <div className="min-w-0">
                        <p className="font-semibold text-primary">Registrar una nueva dirección</p>
                        <p className="text-sm text-on-surface-variant">Úsala solo para este pedido.</p>
                      </div>
                    </label>
                  </div>

                  {addressMode === 'new' && (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <label className="min-w-0 md:col-span-2">
                        <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Dirección nueva</span>
                        <input
                          className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary"
                          placeholder="Calle, número, colonia, referencia"
                          type="text"
                          value={newAddress.street}
                          onChange={(event) => setNewAddress((current) => ({ ...current, street: event.target.value }))}
                        />
                      </label>
                      <label className="min-w-0">
                        <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Ciudad</span>
                        <input
                          className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary"
                          placeholder="Ciudad"
                          type="text"
                          value={newAddress.city}
                          onChange={(event) => setNewAddress((current) => ({ ...current, city: event.target.value }))}
                        />
                      </label>
                      <label className="min-w-0">
                        <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Código postal</span>
                        <input
                          className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary"
                          placeholder="00000"
                          type="text"
                          value={newAddress.postalCode}
                          onChange={(event) => setNewAddress((current) => ({ ...current, postalCode: event.target.value }))}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {fulfillment === 'delivery' && (
                <label className="mt-6 block min-w-0">
                  <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Notas adicionales</span>
                  <textarea className="min-h-28 w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="Indicaciones de acceso, horario, referencia interna..." />
                </label>
              )}
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

              {paymentMethod === 'tarjeta' && (
                <div className="mt-4 rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
                  <p className="text-label-md font-bold text-primary">Datos de la tarjeta corporativa</p>
                  <div className="mt-3 grid gap-4 md:grid-cols-2">
                    <label className="min-w-0 md:col-span-2">
                      <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Titular de la tarjeta</span>
                      <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="Nombre del titular" type="text" />
                    </label>
                    <label className="min-w-0 md:col-span-2">
                      <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Número de tarjeta</span>
                      <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="0000 0000 0000 0000" type="text" inputMode="numeric" />
                    </label>
                    <label className="min-w-0">
                      <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">Vencimiento</span>
                      <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="MM/AA" type="text" inputMode="numeric" />
                    </label>
                    <label className="min-w-0">
                      <span className="mb-2 block text-label-md font-semibold text-on-surface-variant">CVV</span>
                      <input className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-body-md text-on-surface outline-none transition-colors placeholder:text-on-surface-variant/60 focus:border-secondary" placeholder="123" type="password" inputMode="numeric" />
                    </label>
                  </div>
                </div>
              )}

              {paymentMethod === 'transferencia' && (
                <div className="mt-4 rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
                  <p className="text-label-md font-bold text-primary">Datos para transferencia</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Banco</p>
                      <p className="mt-1 text-body-md font-semibold text-primary">{transferInfo.bank}</p>
                    </div>
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Titular</p>
                      <p className="mt-1 text-body-md font-semibold text-primary">{transferInfo.accountHolder}</p>
                    </div>
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Cuenta</p>
                      <p className="mt-1 text-body-md font-semibold text-primary">{transferInfo.accountNumber}</p>
                    </div>
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">RIF</p>
                      <p className="mt-1 text-body-md font-semibold text-primary">{transferInfo.rif}</p>
                    </div>
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Referencia sugerida</p>
                      <p className="mt-1 text-body-md font-semibold text-primary">{transferInfo.reference}</p>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'pagomovil' && (
                <div className="mt-4 rounded-2xl border border-secondary/30 bg-secondary/10 p-4">
                  <p className="text-label-md font-bold text-primary">Datos para Pago Móvil</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Banco</p>
                      <p className="mt-1 text-body-md font-semibold text-primary">{paymentMobileInfo.bank}</p>
                    </div>
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Teléfono</p>
                      <p className="mt-1 text-body-md font-semibold text-primary">{paymentMobileInfo.phone}</p>
                    </div>
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Cédula / RIF</p>
                      <p className="mt-1 text-body-md font-semibold text-primary">{paymentMobileInfo.idNumber}</p>
                    </div>
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Beneficiario</p>
                      <p className="mt-1 text-body-md font-semibold text-primary">{paymentMobileInfo.beneficiary}</p>
                    </div>
                    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-3 sm:col-span-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-on-surface-variant">Referencia sugerida</p>
                      <p className="mt-1 text-body-md font-semibold text-primary">{paymentMobileInfo.reference}</p>
                    </div>
                  </div>
                </div>
              )}

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
                <button className="w-full rounded-xl bg-primary px-4 py-3 text-body-md font-bold text-on-primary shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60" type="button" disabled={!isAuthenticated || paymentMethod === ''}>
                  {isAuthenticated ? 'Confirmar pago' : 'Inicia sesión para continuar'}
                </button>
              </div>

              <p className="mt-4 text-xs text-on-surface-variant">Antes de confirmar, selecciona un método de pago y verifica que tu sesión esté activa.</p>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
}