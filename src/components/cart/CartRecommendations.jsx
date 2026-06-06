import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function CartRecommendations({ items = [] }) {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const container = carouselRef.current;
      const scrollAmount = container.clientWidth;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="cart-subtle-float mt-12 mb-8">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-headline-md font-bold text-primary">Productos similares recomendados</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">Agrega otros artículos esenciales a tu orden.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface active:scale-95 shadow-sm"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface-container-lowest text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface active:scale-95 shadow-sm"
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={carouselRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 hide-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <article
            key={item.name}
            className="flex w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-start shrink-0 flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 transition-all hover:border-[var(--color-brand)]/40 hover:shadow-lg group"
          >
            <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-surface-container relative">
              <img alt={item.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" src={item.image} />
            </div>
            <p className="text-label-md font-bold text-primary group-hover:text-[var(--color-brand)] transition-colors truncate">{item.name}</p>
            <p className="text-xs text-on-surface-variant mt-0.5 truncate">{item.subtitle}</p>
            <div className="mt-auto flex items-center justify-between pt-4">
              <span className="font-extrabold text-primary">{item.price}</span>
              <button
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-on-secondary shadow-md transition-all hover:scale-110 active:scale-90 hover:bg-primary"
                type="button"
                aria-label="Agregar al carrito"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
