export default function CartTable({ items, onBackToCatalog }) {
  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest cloud-shadow">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-outline-variant bg-surface-container-low">
            <tr>
              <th className="px-6 py-4 text-label-md font-semibold text-on-surface-variant">Producto</th>
              <th className="px-6 py-4 text-label-md font-semibold text-on-surface-variant">Precio</th>
              <th className="px-6 py-4 text-label-md font-semibold text-on-surface-variant">Cantidad</th>
              <th className="px-6 py-4 text-right text-label-md font-semibold text-on-surface-variant">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {items.map((item) => (
              <tr key={item.name} className="group transition-colors hover:bg-surface-container-lowest">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container">
                      <img alt={item.name} className="h-full w-full object-cover" src={item.image} />
                    </div>
                    <div>
                      <p className="text-body-md font-bold text-primary">{item.name}</p>
                      <p className="mt-1 text-label-md text-on-surface-variant">Ref: {item.ref}</p>
                      <button className="mt-2 flex items-center gap-1 text-xs font-bold text-error hover:underline" type="button">
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 text-body-md font-medium text-on-surface">{item.price}</td>
                <td className="px-6 py-6">
                  <div className="flex w-fit items-center rounded-lg border border-outline">
                    <button className="px-2 py-1 hover:bg-surface-variant" type="button">-</button>
                    <input className="w-10 border-none bg-transparent text-center text-label-md focus:ring-0" type="text" value={item.quantity} readOnly />
                    <button className="px-2 py-1 hover:bg-surface-variant" type="button">+</button>
                  </div>
                  {item.stockLabel ? <span className="mt-1 block text-[10px] font-bold text-secondary">{item.stockLabel}</span> : null}
                </td>
                <td className="px-6 py-6 text-right text-body-md font-bold text-primary">{item.subtotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-stretch justify-between gap-4 bg-surface-container-low p-6 lg:flex-row lg:items-center">
        <button className="flex items-center gap-2 text-label-md font-bold text-secondary hover:underline" type="button" onClick={onBackToCatalog}>
          <span className="material-symbols-outlined">arrow_back</span>
          Seguir Comprando
        </button>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="rounded-lg border border-secondary px-4 py-2 text-label-md font-bold text-secondary transition-colors hover:bg-surface-container-lowest" type="button">
            Vaciar Carrito
          </button>
          <button className="rounded-lg bg-secondary px-4 py-2 text-label-md font-bold text-on-secondary transition-colors hover:opacity-90" type="button">
            Actualizar Stock
          </button>
        </div>
      </div>
    </section>
  );
}
