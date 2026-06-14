import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import Carousel from './auth/Carousel';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';

const carouselData = [
  { title: "Precisión en Limpieza", desc: "Soluciones avanzadas de higiene para el hogar y la empresa." },
  { title: "Calidad Garantizada", desc: "Equipos especializados que aseguran un ambiente libre de patógenos." },
  { title: "Soporte 24/7", desc: "Gestión integral de servicios con atención personalizada." }
];

// Reusable premium custom toast notifications matching the application theme
const showCustomToast = {
  success: (message) => {
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.9 }}
        animate={t.visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="flex items-center gap-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/10 dark:bg-emerald-500/5 backdrop-blur-xl px-5 py-4 shadow-[0_20px_50px_-20px_rgba(16,32,58,0.4)] max-w-md w-full sm:w-[380px]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90 dark:bg-surface-container-lowest shadow-sm ring-1 ring-black/5">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80 uppercase tracking-widest">Éxito</p>
          <p className="mt-0.5 text-sm font-semibold text-on-surface leading-tight">{message}</p>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="rounded-full p-1.5 text-emerald-700/50 hover:bg-black/5 dark:hover:bg-white/5 dark:text-emerald-400/50 hover:text-on-surface transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    ), { position: 'top-center' });
  },
  error: (message) => {
    toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.9 }}
        animate={t.visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20, scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="flex items-center gap-4 rounded-2xl border border-rose-500/15 bg-rose-500/10 dark:bg-rose-500/5 backdrop-blur-xl px-5 py-4 shadow-[0_20px_50px_-20px_rgba(16,32,58,0.4)] max-w-md w-full sm:w-[380px]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90 dark:bg-surface-container-lowest shadow-sm ring-1 ring-black/5">
          <AlertCircle className="h-5 w-5 text-rose-600" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-rose-700/80 dark:text-rose-400/80 uppercase tracking-widest">Error</p>
          <p className="mt-0.5 text-sm font-semibold text-on-surface leading-tight">{message}</p>
        </div>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="rounded-full p-1.5 text-rose-700/50 hover:bg-black/5 dark:hover:bg-white/5 dark:text-rose-400/50 hover:text-on-surface transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    ), { position: 'top-center' });
  },
  loading: (message) => {
    return toast.custom((t) => (
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-high/90 backdrop-blur-xl px-5 py-4 shadow-[0_20px_50px_-20px_rgba(16,32,58,0.4)] max-w-md w-full sm:w-[380px]"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/95 dark:bg-surface-container-lowest shadow-sm ring-1 ring-black/5">
          <Loader2 className="h-5 w-5 text-secondary animate-spin" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-outline uppercase tracking-widest">Procesando</p>
          <p className="mt-0.5 text-sm font-semibold text-on-surface leading-tight">{message}</p>
        </div>
      </motion.div>
    ), { position: 'top-center', duration: Infinity });
  }
};

export default function AuthPage({ onBackToLanding, onAuthSuccess }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % carouselData.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const { login, register, loginWithGoogle } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    const toastId = showCustomToast.loading('Redirigiendo a Google...');
    try {
      await loginWithGoogle();
      toast.dismiss(toastId);
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      showCustomToast.error(err.message || 'Error al iniciar sesión con Google.');
      setLoading(false);
    }
  };

  const handleLogin = async (creds) => {
    if (!creds?.email || !creds?.password) {
      showCustomToast.error('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    const toastId = showCustomToast.loading('Iniciando sesión...');
    try {
      await login(creds.email, creds.password);
      toast.dismiss(toastId);
      showCustomToast.success('¡Bienvenido de nuevo!');
      
      if (typeof onAuthSuccess === 'function') {
        const userStr = window.localStorage.getItem('user');
        const userObj = userStr ? JSON.parse(userStr) : null;
        const role = userObj?.role || 'User';
        onAuthSuccess(role);
      }
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      showCustomToast.error(err.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ name, email, password }) => {
    if (!name || !email || !password) {
      showCustomToast.error('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    const toastId = showCustomToast.loading('Creando cuenta...');
    try {
      await register(email, password, name);
      toast.dismiss(toastId);
      showCustomToast.success('¡Registro exitoso! Ya puedes iniciar sesión.');
      setIsLogin(true);
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      showCustomToast.error(err.message || 'Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 pt-16 md:pt-4 text-on-surface transition-colors">
      <button 
        disabled={loading}
        className="absolute left-4 top-4 rounded-full border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-surface-container-low z-10 disabled:opacity-50 cursor-pointer" 
        type="button" 
        onClick={onBackToLanding}
      >
        Volver al inicio
      </button>
      <main className="flex flex-col md:flex-row h-auto md:h-[600px] w-full max-w-[1000px] overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl">
        <Carousel data={carouselData} currentIndex={currentSlide} onDotClick={setCurrentSlide} />
        
        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-surface-container-lowest p-6 sm:p-10 py-12 md:py-0">
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
                {isLogin ? (
                  <LoginForm 
                    onToggle={() => !loading && setIsLogin(false)} 
                    onLogin={handleLogin} 
                    onGoogleLogin={handleGoogleLogin}
                  />
                ) : (
                  <RegisterForm 
                    onToggle={() => !loading && setIsLogin(true)} 
                    onGoogleRegister={handleGoogleLogin} 
                    onRegister={handleRegister}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
