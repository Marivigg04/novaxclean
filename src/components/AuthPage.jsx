import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Carousel from './auth/Carousel';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';

const carouselData = [
  { title: "Precisión en Limpieza", desc: "Soluciones avanzadas de higiene para el hogar y la empresa." },
  { title: "Calidad Garantizada", desc: "Equipos especializados que aseguran un ambiente libre de patógenos." },
  { title: "Soporte 24/7", desc: "Gestión integral de servicios con atención personalizada." }
];

export default function AuthPage({ onBackToLanding, onAuthSuccess }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % carouselData.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const { login } = useAuth();

  const handleLogin = (creds) => {
    const ADMIN_EMAIL = 'admin@novaxclean.com';
    const ADMIN_PASSWORD = 'Admin1234';

    if (creds?.email === ADMIN_EMAIL && creds?.password === ADMIN_PASSWORD) {
      try {
        window.localStorage.setItem('isAdmin', 'true');
      } catch (e) {
        // ignore
      }
      // inform auth context so Header updates immediately
      try {
        login();
      } catch (e) {
        // ignore
      }

      if (typeof onAuthSuccess === 'function') {
        onAuthSuccess();
      }
      return;
    }

    alert('Credenciales inválidas para admin. Usa admin@novaxclean.com / Admin1234');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 text-on-surface transition-colors">
      <button className="absolute left-4 top-4 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-surface-container-low" type="button" onClick={onBackToLanding}>
        Volver al inicio
      </button>
      <main className="flex h-[600px] w-full max-w-[1000px] overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-2xl">
        <Carousel data={carouselData} currentIndex={currentSlide} onDotClick={setCurrentSlide} />
        
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-surface-container-lowest">
          <div className="w-full h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div 
                key={isLogin ? "login" : "register"} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {isLogin ? <LoginForm onToggle={() => setIsLogin(false)} onLogin={handleLogin} /> : <RegisterForm onToggle={() => setIsLogin(true)} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
