import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, Search, X, Sparkles, ArrowRight, ShoppingCart, Home, BookOpen, Package, MapPin, Settings, Menu, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '../../shared/ThemeToggle';
import UserAvatarIcon from '../../shared/UserAvatarIcon';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Notification from '../../shared/Notification';
import { inventoryProducts } from '../../features/admin/inventory/data/mockup';
import { usePageTransition } from '../../context/PageTransitionContext';
import logoAumc from '../../assets/Logo AUMC.png';
import logoAumo from '../../assets/Logo AUMO.png';
import { useAdminNotifications } from '../../features/admin/notifications/hooks/useAdminNotifications';

export default function Header({
  onOpenCart,
  onOpenAuth,
  onToggleSidebar,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  searchSuggestions = [],
  showCartButton = true,
  showSearch = true,
  showThemeToggle = true,
  showBrand = true,
  showNavigationLinks = true,
  showUserName = true,
  className = '',
}) {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const isAdmin = isAuthenticated && user?.role === 'Admin';
  const { notifications: rawNotifications, unreadCount, markAsRead } = useAdminNotifications();
  const navigate = usePageTransition().navigateTo;
  const location = useLocation();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isItemActive = (href) => {
    const locPath = location.pathname;
    const params = new URLSearchParams(location.search);
    
    if (href === '/') {
      return locPath === '/';
    }
    
    const pathAndQuery = href.split('?');
    const path = pathAndQuery[0];
    const query = pathAndQuery[1];
    
    if (path !== locPath) return false;
    
    if (query) {
      const itemParams = new URLSearchParams(query);
      const itemTab = itemParams.get('tab');
      const currentTab = params.get('tab');
      return itemTab === currentTab;
    } else {
      const currentTab = params.get('tab');
      return !currentTab || currentTab === 'perfil';
    }
  };
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        const isTrigger = event.target.closest('.user-menu-trigger');
        if (!isTrigger) {
          setMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  const popularSearches = ['AquaForce Ultra', 'EcoShine Pro', 'NovaFiber Set', 'Desinfectantes', 'Ecológicos'];
  const matchingSuggestions = (searchSuggestions || [])
    .filter((suggestion) =>
      suggestion.toLowerCase().includes(searchValue.trim().toLowerCase())
    )
    .slice(0, 5);

  const displayedSuggestions = searchValue.trim() ? matchingSuggestions : popularSearches;

  const matchingProducts = inventoryProducts
    .filter((product) =>
      product.name.toLowerCase().includes(searchValue.trim().toLowerCase())
    )
    .slice(0, 3);

  const handleSuggestionClick = (suggestion) => {
    if (typeof onSearchChange === 'function') {
      onSearchChange(suggestion);
    }
    if (typeof onSearchSubmit === 'function') {
      onSearchSubmit(suggestion);
    }
    setIsFocused(false);
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="font-extrabold text-primary dark:text-primary-fixed">{part}</span>
      ) : (
        part
      )
    );
  };

  const navItems = [
    { label: 'Inicio', href: '/', icon: Home },
    { label: 'Catálogo', href: '/catalogo', icon: BookOpen },
  ];

  if (isAuthenticated && (!user || user.role !== 'Admin')) {
    navItems.push(
      { label: 'Mis Pedidos', href: '/perfil?tab=pedidos', icon: Package },
      { label: 'Direcciones', href: '/perfil?tab=direcciones', icon: MapPin },
      { label: 'Preferencias', href: '/perfil?tab=preferencias', icon: Settings },
      { label: 'Seguridad', href: '/perfil?tab=seguridad', icon: Shield }
    );
  }

  const notifications = isAdmin ? rawNotifications.map(n => ({
    ...n,
    time: new Date(n.created_at).toLocaleDateString() + ' ' + new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })) : [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      <header
        style={{
          left: isAdmin && !isMobile ? 'calc(var(--sidebar-width, 0px) - 1px)' : 0,
          top: 0,
        }}
        className={`fixed right-0 z-30 border-b border-outline-variant bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80 transition-all duration-300 ${className}`}
      >
        <nav className={`mx-auto flex w-full max-w-none items-center gap-2 md:gap-3 px-3 md:px-16 ${isAdmin ? 'h-20' : 'py-4 md:py-5'}`}>
          {/* Hamburger Menu button on the left for admin (mobile) */}
          {isAdmin && onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface md:hidden transition-colors shrink-0"
              aria-label="Abrir menú de administración"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* Hamburger Menu button on the left for mobile/tablet (client/visitor) */}
          {!isAdmin && showNavigationLinks && (
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container hover:text-on-surface xl:hidden transition-colors shrink-0"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {showBrand && (!isAuthenticated || user?.role !== 'Admin' || isMobile) && (
            <motion.div layoutId={isAdmin || isMobile ? undefined : "header-brand"} className="shrink-0 flex items-center gap-2">
                <div className="hidden sm:block shrink-0">
                  <img alt="Logo NovaxClean" src={logoAumc} className="logo-light h-13 w-13 object-contain" />
                  <img alt="Logo NovaxClean" src={logoAumo} className="logo-dark h-13 w-13 object-contain" />
                </div>
                <span className="font-bold text-secondary dark:text-white">NovaxClean</span>
            </motion.div>
          )}

          {showSearch ? (
            <motion.div
              ref={searchRef}
              layout={isMobile ? false : "position"}
              layoutId={isMobile ? undefined : "header-search-bar"}
              className="relative hidden min-w-0 lg:block z-40"
              animate={isMobile ? {} : {
                flexBasis: isFocused ? '520px' : '280px',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <motion.form
                animate={{
                  backgroundColor: isFocused
                    ? 'var(--color-surface-container-lowest)'
                    : 'var(--color-surface-container)',
                  borderColor: isFocused
                    ? 'var(--color-primary)'
                    : 'var(--color-outline-variant)',
                  boxShadow: isFocused
                    ? '0 10px 25px -5px rgba(47, 94, 162, 0.12), 0 0 0 3px rgba(47, 94, 162, 0.12)'
                    : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                }}
                className="flex items-center gap-3 rounded-full border px-4 py-1.5 transition-all duration-200"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (typeof onSearchSubmit === 'function') {
                    onSearchSubmit(searchValue);
                  }
                  setIsFocused(false);
                }}
              >
                <motion.div
                  animate={{
                    scale: isFocused ? 1.05 : 1,
                    color: isFocused ? 'var(--color-primary)' : 'var(--color-outline)',
                  }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center justify-center shrink-0"
                >
                  <Search className="w-4 h-4" />
                </motion.div>

                <input
                  className="site-search-input min-w-0 flex-1 border-none bg-transparent pr-3 text-xs placeholder:text-xs text-on-surface focus:ring-0 focus:outline-none"
                  placeholder="Busca productos..."
                  type="search"
                  maxLength={40}
                  value={searchValue}
                  onFocus={() => setIsFocused(true)}
                  onChange={(event) => {
                    if (typeof onSearchChange === 'function') {
                      onSearchChange(event.target.value);
                    }
                  }}
                />

                <AnimatePresence>
                  {searchValue && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      type="button"
                      onClick={() => {
                        if (typeof onSearchChange === 'function') {
                          onSearchChange('');
                        }
                        if (typeof onSearchSubmit === 'function') {
                          onSearchSubmit('');
                        }
                      }}
                      className="p-1 rounded-full hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors duration-150 shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="shrink-0 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-bold text-on-primary transition-all duration-150 hover:shadow-lg hover:shadow-primary/25"
                  type="submit"
                >
                  Buscar
                </motion.button>
              </motion.form>

              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl border border-outline-variant bg-surface-container-lowest/95 backdrop-blur-md shadow-2xl p-4 overflow-hidden"
                  >
                    <div className="flex flex-col gap-4">
                      {displayedSuggestions.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-outline">
                            <Sparkles className="w-3 h-3 text-secondary animate-pulse" />
                            <span>{searchValue.trim() ? 'Sugerencias' : 'Búsquedas Populares'}</span>
                          </div>
                          <div className="space-y-0.5">
                            {displayedSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSuggestionClick(suggestion);
                                }}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-on-surface hover:bg-surface-container rounded-xl transition-all duration-150 text-left group"
                              >
                                <div className="flex items-center gap-3">
                                  <Search className="w-3.5 h-3.5 text-outline group-hover:text-primary transition-colors duration-150" />
                                  <span className="truncate">{highlightMatch(suggestion, searchValue.trim())}</span>
                                </div>
                                <ArrowRight className="w-3.5 h-3.5 text-outline opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {displayedSuggestions.length > 0 && (
                        <div className="border-t border-outline-variant/40 my-0.5" />
                      )}

                      <div>
                        <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-outline">
                          {searchValue.trim() ? 'Productos que coinciden' : 'Productos Recomendados'}
                        </div>
                        {matchingProducts.length > 0 ? (
                          <div className="grid grid-cols-1 gap-1">
                            {matchingProducts.map((product) => (
                              <button
                                key={product.sku}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSuggestionClick(product.name);
                                }}
                                className="flex items-center gap-3 p-2 text-left rounded-xl hover:bg-surface-container transition-all duration-150 border border-transparent hover:border-outline-variant/40 group"
                              >
                                <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors duration-150 shrink-0 font-bold text-[10px]">
                                  {product.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-bold text-on-surface truncate group-hover:text-primary transition-colors duration-150">{product.name}</h4>
                                  <p className="text-[9px] text-outline truncate">{product.category}</p>
                                </div>
                                <span className="text-xs font-extrabold text-secondary shrink-0">${product.price.toFixed(2)}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="px-3 py-2 text-xs text-outline italic">No se encontraron productos</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : null}

          {showNavigationLinks && (!isAuthenticated || user?.role !== 'Admin') && (
            <motion.div layoutId={isMobile ? undefined : "header-nav-container"} className="hidden flex-none items-center gap-3 xl:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.div layoutId={isMobile ? undefined : `header-nav-item-${item.label}`} key={item.label} className="flex">
                    <button
                      type="button"
                      onClick={() => navigate(item.href)}
                      className={`group flex items-center h-10 px-3 rounded-full border transition-all duration-200 ${
                        isItemActive(item.href)
                          ? 'bg-primary/10 hover:bg-primary/20 border-primary/30 hover:border-primary text-primary'
                          : 'bg-surface-container/40 hover:bg-surface-container border-outline-variant/30 hover:border-outline-variant/80 text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                      <span className="max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 group-hover:ml-2 overflow-hidden whitespace-nowrap transition-all duration-300 ease-out text-xs font-bold uppercase tracking-wider">
                        {item.label}
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          <motion.div layoutId={isAdmin || isMobile ? undefined : "header-actions-container"} className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 md:gap-3">
            {showThemeToggle ? (
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
            ) : null}

            {/* show cart button based on prop */}
            {showCartButton ? (
              <button
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-on-secondary shadow-sm transition-all duration-150 hover:scale-105 hover:shadow-lg hover:shadow-secondary/25 active:scale-95 shrink-0"
                type="button"
                onClick={onOpenCart}
                aria-label="Carrito"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white shadow-sm border border-secondary">
                    {cartCount}
                  </span>
                )}
              </button>
            ) : null}
            {isAuthenticated ? (
              <div className="relative flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Notificaciones"
                    onClick={() => setNotificationsOpen((current) => !current)}
                    className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationsOpen && (
                      <Notification notifications={notifications} onClose={() => setNotificationsOpen(false)} onMarkAsRead={markAsRead} />
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((s) => !s)}
                    className="user-menu-trigger flex items-center gap-3 rounded-full px-3 py-1.5 text-sm font-medium hover:bg-surface-container transition-colors"
                  >
                    <UserAvatarIcon avatar={user?.avatar} name={user?.name} size="sm" />
                    {showUserName ? <span className="hidden sm:inline font-bold">{user?.name}</span> : null}
                  </button>

                  <AnimatePresence>
                    {menuOpen && (
                      <motion.div
                        ref={menuRef}
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 mt-2 w-56 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-outline-variant bg-surface-container/50">
                          <p className="text-sm font-bold text-primary truncate">{user?.name}</p>
                          <p className="text-xs text-on-surface-variant truncate mt-0.5">{user?.role === 'Admin' ? 'Administrador' : 'Usuario Preatorio'}</p>
                        </div>
                        <div className="p-1.5">
                          {user?.role === 'Admin' ? (
                            <button className="w-full text-left px-3 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container rounded-lg transition-colors" onClick={() => { setMenuOpen(false); navigate('/admin'); }}>
                              Panel de Control
                            </button>
                          ) : (
                            <button className="w-full text-left px-3 py-2.5 text-sm font-medium text-on-surface hover:bg-surface-container rounded-lg transition-colors" onClick={() => { setMenuOpen(false); navigate('/perfil'); }}>
                              Mi Perfil
                            </button>
                          )}
                          <button className="w-full text-left px-3 py-2.5 text-sm font-medium text-error hover:bg-error-container/50 rounded-lg transition-colors mt-1" onClick={() => { setMenuOpen(false); handleLogout(); }}>
                            Cerrar sesión
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <button className="rounded-full bg-secondary px-4 sm:px-5 py-2 text-[11px] sm:text-xs font-bold text-on-secondary shadow-sm transition-all duration-150 hover:scale-105 hover:shadow-lg hover:shadow-secondary/25 active:scale-95 shrink-0" type="button" onClick={onOpenAuth}>
                Iniciar sesión
              </button>
            )}
          </motion.div>
        </nav>
      </header>

      {/* Mobile navigation sidebar panel */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-50 bg-black xl:hidden"
            />

            {/* Slide-out Sidebar Drawer from the Left */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 top-0 z-50 flex h-dvh w-[280px] flex-col border-r border-outline-variant bg-[var(--color-base-surface)] p-6 shadow-2xl xl:hidden"
            >
              {/* Header of the sidebar */}
              <div className="flex items-center justify-between pb-6 border-b border-outline-variant/60">
                <div className="flex items-center gap-2">
                  <img src={logoAumc} alt="Logo" className="logo-light h-8 w-8 object-contain" />
                  <img src={logoAumo} alt="Logo" className="logo-dark h-8 w-8 object-contain" />
                  <span className="text-md font-bold tracking-tight text-on-surface">Menú</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items list */}
              <nav className="flex-1 space-y-2 py-6 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href);
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        navigate(item.href);
                        setMobileSidebarOpen(false);
                      }}
                      className={`flex w-full items-center gap-4 px-4 py-3 rounded-2xl border transition-all ${
                        active
                          ? 'bg-primary/10 border-primary/30 text-primary font-bold shadow-sm'
                          : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-outline'}`} />
                      <span className="text-sm font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Footer of the sidebar with ThemeToggle inside */}
              <div className="border-t border-outline-variant/60 pt-6 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-outline uppercase tracking-wider">Modo oscuro</span>
                <ThemeToggle />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}