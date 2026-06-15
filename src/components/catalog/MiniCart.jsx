import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/currencyFormatter';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { useAuth } from '../../context/AuthContext';

export default function MiniCart({ isOpen, onToggle, onClose, items }) {
  const navigate = useNavigate();
  const { rate } = useExchangeRate();
  const { user } = useAuth();
  const currencyPref = user?.currency || 'VES';

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const miniCart = document.getElementById('mini-cart');

      if (miniCart && !miniCart.contains(event.target)) {
        onClose();
      }
    };

    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50" id="mini-cart">
      <button
        className="group flex items-center gap-2 rounded-full bg-primary p-4 text-on-primary shadow-2xl transition-all hover:scale-110 active:scale-95"
        type="button"
        onClick={onToggle}
      >
        <div className="relative">
          <span className="material-symbols-outlined text-2xl">shopping_cart</span>
          <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-error text-[10px] text-white">
            {items.length}
          </span>
        </div>
        <span className="hidden pr-1 text-label-md font-bold md:block">Ver Carrito</span>
      </button>

      <div
        className={`absolute bottom-20 right-0 w-80 rounded-2xl border border-outline-variant bg-white p-4 shadow-2xl glass-panel ${isOpen ? '' : 'hidden'}`}
        id="cart-popup"
      >
        <h5 className="px-1 text-headline-md font-bold text-primary">Tu Compra</h5>

        <div className="max-h-60 space-y-4 overflow-y-auto px-1 py-4">
          {items.map((item) => (
            <div key={item.name} className="flex items-center gap-4 border-b border-outline-variant pb-3">
              <div className="h-12 w-12 overflow-hidden rounded-lg bg-surface-variant" />
              <div className="flex-1">
                <p className="text-label-md font-bold text-on-surface">{item.name}</p>
                <p className="text-sm text-outline">
                  {item.quantity} x {formatCurrency(item.price, rate, currencyPref)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-outline-variant px-1 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-label-md text-on-surface-variant">Total</span>
            <span className="text-headline-md font-bold text-primary">
              {formatCurrency(items.reduce((sum, item) => sum + (item.price * item.quantity), 0), rate, currencyPref)}
            </span>
          </div>
          <button
            className="w-full rounded-xl bg-primary py-3 font-bold text-on-primary transition-all hover:brightness-110"
            type="button"
            onClick={() => {
              try {
                onClose();
              } catch (e) {
                // ignore
              }
              navigate('/carrito');
            }}
          >
            Finalizar Pedido
          </button>
        </div>
      </div>
    </div>
  );
}