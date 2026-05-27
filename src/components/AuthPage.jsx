import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Carousel from './auth/Carousel';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';

const carouselData = [
  { title: "Precisión en Limpieza", desc: "Soluciones avanzadas de higiene para el hogar y la empresa." },
  { title: "Calidad Garantizada", desc: "Equipos especializados que aseguran un ambiente libre de patógenos." },
  { title: "Soporte 24/7", desc: "Gestión integral de servicios con atención personalizada." }
];

export default function AuthPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((p) => (p + 1) % carouselData.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#f6faff] min-h-screen flex items-center justify-center p-4">
      <main className="w-full max-w-[1000px] h-[600px] bg-white rounded-xl shadow-2xl flex overflow-hidden border border-gray-200">
        <Carousel data={carouselData} currentIndex={currentSlide} onDotClick={setCurrentSlide} />
        
        <div className="flex-1 bg-white flex items-center justify-center overflow-hidden relative">
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
                {isLogin ? <LoginForm onToggle={() => setIsLogin(false)} /> : <RegisterForm onToggle={() => setIsLogin(true)} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}