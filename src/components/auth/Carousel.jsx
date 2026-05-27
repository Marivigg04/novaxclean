import { motion, AnimatePresence } from 'framer-motion';

export default function Carousel({ data, currentIndex, onDotClick }) {
  return (
    <div className="hidden md:flex flex-1 bg-[#0f2854] items-center justify-center p-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      
      <div className="relative z-10 text-center text-white space-y-6 w-full">
        {/* Usamos AnimatePresence para la animación de salida/entrada */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex} // Es vital para que sepa que el contenido cambió
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="space-y-4"
          >
            <h2 className="text-3xl font-bold">{data[currentIndex].title}</h2>
            <p className="text-blue-100 max-w-xs mx-auto leading-relaxed">{data[currentIndex].desc}</p>
          </motion.div>
        </AnimatePresence>

        {/* Indicadores de puntos */}
        <div className="flex justify-center gap-2">
          {data.map((_, index) => (
            <button
              key={index}
              onClick={() => onDotClick(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}