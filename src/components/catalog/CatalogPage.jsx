import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { footerLinks } from './data';
import Header from '../layout/Header';
import CatalogHeader from './CatalogHeader';
import FilterBar from './FilterBar';
import ProductGrid from './ProductGrid';
import Footer from '../layout/Footer';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '../../context/CartContext';
import { supabase } from '../../lib/supabase';

export default function CatalogPage({ onOpenCart, onOpenAuth }) {
  const { addToCart } = useCart();
  const [dbProducts, setDbProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeFilter, setActiveFilter] = useState('Todos');
  const [guestPromptVisible, setGuestPromptVisible] = useState(false);
  const [guestPromptClosing, setGuestPromptClosing] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('q') ?? '';

  useEffect(() => {
    let active = true;

    async function fetchCatalogData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch products, ratings and categories in parallel
        const [productsRes, ratingsRes, categoriesRes] = await Promise.all([
          supabase.from('products').select('*, categories(name), badges(name)'),
          supabase.from('product_ratings_view').select('*'),
          supabase.from('categories').select('*')
        ]);

        if (!active) return;

        if (productsRes.error) throw productsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        // Process ratings
        const ratingsMap = {};
        if (ratingsRes.data) {
          ratingsRes.data.forEach((r) => {
            ratingsMap[r.product_id] = {
              rating_avg: r.rating_avg,
              rating_count: r.rating_count,
            };
          });
        }

        // Keep a set of categories that have products, or just keep them all
        const categoriesData = categoriesRes.data || [];
        setDbCategories(categoriesData);

        // Map products to the frontend structure
        const mappedProducts = (productsRes.data || []).map((p) => {
          const ratingInfo = ratingsMap[p.id] || { rating_avg: 5.0, rating_count: 0 };
          const badgeName = p.badges?.name || p.badge || null;
          
          let badgeClass = '';
          if (badgeName === 'Nuevo') {
            badgeClass = 'bg-secondary text-on-secondary';
          } else if (badgeName === 'Eco-Friendly') {
            badgeClass = 'bg-on-tertiary-container text-tertiary-fixed';
          }

          return {
            id: p.id,
            sku: p.sku,
            name: p.name,
            price: `$${Number(p.price).toFixed(2)}`,
            rawPrice: Number(p.price),
            description: p.description,
            rating: `${Number(ratingInfo.rating_avg).toFixed(1)} (${ratingInfo.rating_count})`,
            badge: badgeName,
            badgeClass,
            image: p.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDggHlEKI9-BAayU1IMtm4itoyS8PkdZy58CXdhpwhZpYUs8D4fye14Dag42sn-5ZF1176u2sgE2UzoXiYtC2om9xsn3Pf7xKfUiS7ASFbiZNagl5drU2fbnjfFZ3W5Y4GfXC1XVZLFDL3RMt4_DOAoE6BThi4_c9gOEc8pnzNtK6dSbGZt2HmQO-ZgmVpKpQjAI3JBO5QAAHVhyAAGMPN-KyYgbH45nWjAl_oE7SXU1i9BRlN-swa35AqgJVPugC7VjPscdA4v9CM',
            category: p.categories?.name || '',
            category_id: p.category_id,
          };
        });

        setDbProducts(mappedProducts);
      } catch (err) {
        console.error('Error fetching catalog data:', err);
        if (active) {
          setError(err.message || 'Error al conectar con la base de datos');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchCatalogData();

    return () => {
      active = false;
    };
  }, []);

  // Dynamically build filter chips from actual categories in the DB
  const filterChips = useMemo(() => {
    return ['Todos', ...dbCategories.map((c) => c.name), 'Ecológicos'];
  }, [dbCategories]);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return dbProducts.filter((product) => {
      const matchesFilter =
        activeFilter === 'Todos' ||
        (activeFilter === 'Ecológicos'
          ? product.badge === 'Eco-Friendly'
          : product.category === activeFilter);

      if (!matchesFilter) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const searchableText = [product.name, product.description, product.category, product.badge]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [dbProducts, activeFilter, searchQuery]);

  const { isAuthenticated } = useAuth();
  const searchSuggestions = useMemo(
    () => Array.from(new Set(dbProducts.flatMap((product) => [product.name, product.category].filter(Boolean)))),
    [dbProducts],
  );

  useEffect(() => {
    if (!guestPromptVisible) {
      return undefined;
    }

    const timer = window.setTimeout(() => setGuestPromptClosing(true), 3200);
    return () => window.clearTimeout(timer);
  }, [guestPromptVisible]);

  useEffect(() => {
    if (!guestPromptClosing) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setGuestPromptVisible(false);
      setGuestPromptClosing(false);
    }, 220);

    return () => window.clearTimeout(timer);
  }, [guestPromptClosing]);

  const hideGuestPrompt = () => {
    if (!guestPromptVisible || guestPromptClosing) {
      return;
    }

    setGuestPromptVisible(false);
    setGuestPromptClosing(false);
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      setGuestPromptClosing(false);
      setGuestPromptVisible(true);
      return;
    }

    addToCart(product, 1);

    if (typeof onOpenCart === 'function') {
      onOpenCart();
    }
  };

  const updateSearchQuery = (nextValue) => {
    const nextParams = new URLSearchParams(searchParams);

    if (nextValue.trim()) {
      nextParams.set('q', nextValue.trim());
    } else {
      nextParams.delete('q');
    }

    setSearchParams(nextParams, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-surface">
        <Header
          onOpenCart={onOpenCart}
          onOpenAuth={onOpenAuth}
          searchValue={searchQuery}
          onSearchChange={updateSearchQuery}
          onSearchSubmit={() => {}}
          searchSuggestions={[]}
          showCartButton
        />
        <main className="mx-auto w-full max-w-[1600px] px-4 pt-[88px] pb-10 md:px-16">
          <CatalogHeader searchValue={searchQuery} onSearchChange={updateSearchQuery} onSearchSubmit={() => {}} />
          
          {/* Skeleton Filter Bar */}
          <div className="mb-8 flex gap-3 overflow-x-auto pb-2 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 w-28 shrink-0 rounded-full bg-surface-container-high" />
            ))}
          </div>

          {/* Skeleton Product Grid */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex h-[420px] flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-surface-variant/50" />
                <div className="flex-1 p-8 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-1/2 rounded bg-surface-variant" />
                    <div className="h-6 w-1/4 rounded bg-surface-variant" />
                  </div>
                  <div className="h-4 w-full rounded bg-surface-variant" />
                  <div className="h-4 w-3/4 rounded bg-surface-variant" />
                  <div className="flex justify-between items-center pt-4">
                    <div className="h-5 w-1/4 rounded bg-surface-variant" />
                    <div className="h-10 w-10 rounded-full bg-surface-variant" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer links={footerLinks} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-on-surface">
        <Header
          onOpenCart={onOpenCart}
          onOpenAuth={onOpenAuth}
          searchValue={searchQuery}
          onSearchChange={updateSearchQuery}
          onSearchSubmit={() => {}}
          searchSuggestions={[]}
          showCartButton
        />
        <main className="mx-auto w-full max-w-[1600px] px-4 pt-[88px] pb-10 md:px-16 flex flex-col items-center justify-center min-h-[60vh]">
          <div className="max-w-md text-center p-8 rounded-2xl border border-error/20 bg-error-container/10 backdrop-blur-md">
            <span className="material-symbols-outlined text-error text-6xl mb-4">error</span>
            <h2 className="text-headline-lg font-bold text-error mb-2">Error de conexión</h2>
            <p className="text-body-md text-on-surface-variant mb-6">{error}</p>
            <button
              type="button"
              className="rounded-xl bg-primary px-6 py-3 font-bold text-on-primary transition-transform hover:scale-[0.98] active:scale-95"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </main>
        <Footer links={footerLinks} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Header
        onOpenCart={onOpenCart}
        onOpenAuth={onOpenAuth}
        searchValue={searchQuery}
        onSearchChange={updateSearchQuery}
        onSearchSubmit={() => {}}
        searchSuggestions={searchSuggestions}
        showCartButton
      />
      <main className="mx-auto w-full max-w-[1600px] px-4 pt-[88px] pb-10 md:px-16">
        <CatalogHeader searchValue={searchQuery} onSearchChange={updateSearchQuery} onSearchSubmit={() => {}} />
        <FilterBar filters={filterChips} activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        
        {visibleProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="material-symbols-outlined text-outline text-6xl mb-4">inventory_2</span>
            <h3 className="text-headline-md font-bold text-on-surface mb-2">No se encontraron productos</h3>
            <p className="text-body-md text-on-surface-variant max-w-sm">
              No hay productos disponibles para este filtro o término de búsqueda en este momento.
            </p>
          </div>
        ) : (
          <ProductGrid products={visibleProducts} onAddToCart={handleAddToCart} />
        )}
      </main>
      <Footer links={footerLinks} />

      {guestPromptVisible ? (
        <div className={`fixed inset-x-0 top-6 z-[60] mx-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest px-5 py-4 shadow-2xl shadow-black/20 backdrop-blur ${guestPromptClosing ? 'guest-prompt-exit' : 'guest-prompt-entrance'}`}>
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-secondary">
              <span className="material-symbols-outlined">lock</span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-on-surface">Debes iniciar sesión o registrarte para comprar</p>
              <p className="mt-1 text-sm text-on-surface-variant">Accede a tu cuenta para añadir productos al carrito y finalizar tu pedido.</p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-on-primary transition-transform hover:scale-[0.98]"
                  onClick={() => {
                    hideGuestPrompt();
                    if (typeof onOpenAuth === 'function') {
                      onOpenAuth();
                    }
                  }}
                >
                  Iniciar sesión
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-outline-variant px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-surface-container"
                  onClick={() => {
                    hideGuestPrompt();
                    if (typeof onOpenAuth === 'function') {
                      onOpenAuth();
                    }
                  }}
                >
                  Registrarme
                </button>
              </div>
            </div>

            <button
              type="button"
              className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              aria-label="Cerrar aviso"
              onClick={hideGuestPrompt}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}