import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { showCustomToast } from '../shared/customToast';
import Carousel from './auth/Carousel';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import ForgotPasswordForm from './auth/ForgotPasswordForm';

const carouselData = [
  { title: 'Precisión en Limpieza', desc: 'Soluciones avanzadas de higiene para el hogar y la empresa.' },
  { title: 'Calidad Garantizada', desc: 'Equipos especializados que aseguran un ambiente libre de patógenos.' },
  { title: 'Soporte 24/7', desc: 'Gestión integral de servicios con atención personalizada.' },
];

export default function AuthPage({ onBackToLanding, onAuthSuccess }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [authView, setAuthView] = useState('login');
  const [loading, setLoading] = useState(false);

  const { user, login, register, loginWithGoogle, resetPassword } = useAuth();

  // Auto-redirect if user is already authenticated (critical for OAuth redirects)
  useEffect(() => {
    if (user) {
      if (typeof onAuthSuccess === 'function') {
        onAuthSuccess(user.role);
      }
    }
  }, [user, onAuthSuccess]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % carouselData.length), 5000);
    return () => clearInterval(timer);
  }, []);

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
      setAuthView('login');
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      showCustomToast.error(err.message || 'Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    if (!email) {
      showCustomToast.error('Ingresa tu correo electrónico.');
      return;
    }

    setLoading(true);
    const toastId = showCustomToast.loading('Enviando enlace de recuperación...');
    try {
      await resetPassword(email);
      toast.dismiss(toastId);
      showCustomToast.success('Revisa tu correo para restablecer tu contraseña.');
      setAuthView('login');
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      showCustomToast.error(err.message || 'No se pudo enviar el enlace de recuperación.');
    } finally {
      setLoading(false);
    }
  };

  const viewKey = authView === 'login' ? 'login' : authView === 'register' ? 'register' : 'forgot';

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
                key={viewKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {authView === 'login' ? (
                  <LoginForm
                    onToggle={() => !loading && setAuthView('register')}
                    onLogin={handleLogin}
                    onGoogleLogin={handleGoogleLogin}
                    onForgotPassword={() => !loading && setAuthView('forgot')}
                    loading={loading}
                  />
                ) : null}

                {authView === 'register' ? (
                  <RegisterForm
                    onToggle={() => !loading && setAuthView('login')}
                    onGoogleRegister={handleGoogleLogin}
                    onRegister={handleRegister}
                  />
                ) : null}

                {authView === 'forgot' ? (
                  <ForgotPasswordForm
                    onBack={() => !loading && setAuthView('login')}
                    onSubmit={handleForgotPassword}
                    loading={loading}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
