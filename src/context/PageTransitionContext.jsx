import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const PageTransitionContext = createContext(null);

const LOADER_DURATION = 500; // ms que dura el loader antes de cambiar de página
const EXIT_DURATION = 250;   // ms del fade-out del loader después del cambio

export function PageTransitionProvider({ children }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef(null);

  const navigateTo = useCallback((to) => {
    if (timerRef.current) return; // evita navegaciones duplicadas

    // 1. Mostrar el loader
    setIsLoading(true);

    // 2. Esperar que la animación de entrada tenga tiempo de verse
    timerRef.current = setTimeout(() => {
      // 3. Cambiar la ruta MIENTRAS el loader sigue visible
      navigate(to);
      window.scrollTo(0, 0);

      // 4. Esperar un poco más y ocultar el loader (fade-out)
      setTimeout(() => {
        setIsLoading(false);
        timerRef.current = null;
      }, EXIT_DURATION);
    }, LOADER_DURATION);
  }, [navigate]);

  return (
    <PageTransitionContext.Provider value={{ navigateTo }}>
      {/* Overlay de transición — siempre por encima de todo */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="page-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/85 backdrop-blur-md"
          >
            {/* Barra de progreso superior */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: LOADER_DURATION / 1000, ease: 'easeInOut' }}
              style={{ transformOrigin: 'left' }}
              className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-secondary to-secondary-container"
            />

            {/* Spinner + Branding */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, delay: 0.06 }}
              className="flex flex-col items-center gap-5"
            >
              <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 rounded-full border-2 border-primary/20 animate-ping" />
                <div className="w-11 h-11 rounded-full border-4 border-surface-container-high border-t-secondary animate-spin" />
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-lg font-black tracking-widest text-primary dark:text-primary-fixed">
                  NovaxClean
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-outline font-semibold">
                  cargando…
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </PageTransitionContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePageTransition() {
  const ctx = useContext(PageTransitionContext);
  const navigate = useNavigate();
  // Fallback seguro: si no hay contexto (ej: fuera del provider), usa navigate directamente
  if (!ctx) return { navigateTo: navigate };
  return ctx;
}
