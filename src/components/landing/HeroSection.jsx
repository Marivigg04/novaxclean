import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sparkles, Microscope } from 'lucide-react';
import logoOf2 from '../../assets/Logo OF2.png';
import { heroStats } from './content';

export default function HeroSection({ onExploreCatalog, onOpenAuth }) {
  const logoRef = useRef(null);
  const ring1Ref = useRef(null);
  const ring2Ref = useRef(null);
  const bubble1Ref = useRef(null);
  const bubble2Ref = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    // Configurar estados iniciales
    gsap.set(logoRef.current, { 
      scale: 0.3, 
      rotationY: -135, 
      rotationX: 30, 
      opacity: 0,
      z: -200 
    });
    gsap.set([ring1Ref.current, ring2Ref.current], { scale: 0, opacity: 0 });
    gsap.set([bubble1Ref.current, bubble2Ref.current], { scale: 0, opacity: 0 });
    gsap.set(particlesRef.current, { scale: 0, opacity: 0, xPercent: -50, yPercent: -50 });

    const tl = gsap.timeline({ delay: 0.4 });
    const mm = gsap.matchMedia();
    const logoEl = logoRef.current;

    // Inclinación 3D interactiva en Hover (Escritorio)
    const handleMouseMove = (e) => {
      if (!logoEl) return;
      const rect = logoEl.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      const rotateY = (x / (rect.width / 2)) * 16;
      const rotateX = -(y / (rect.height / 2)) * 16;
      
      gsap.to(logoEl, {
        rotationY: rotateY,
        rotationX: rotateX,
        scale: 1.04,
        duration: 0.3,
        ease: 'power2.out'
      });
    };
    
    const handleMouseLeave = () => {
      if (!logoEl) return;
      gsap.to(logoEl, {
        rotationY: 0,
        rotationX: 0,
        scale: 1,
        duration: 0.6,
        ease: 'power2.out'
      });
    };

    mm.add("(min-width: 768px)", () => {
      // 1. Entrada de anillos de fondo
      tl.to(
        [ring1Ref.current, ring2Ref.current],
        {
          scale: (index) => (index === 0 ? 1.15 : 1.3),
          opacity: (index) => (index === 0 ? 0.8 : 0.25),
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.1,
        }
      );

      // 2. Entrada del logo con rotación 3D e impacto elástico
      tl.to(
        logoRef.current,
        {
          scale: 1,
          rotationY: 0,
          rotationX: 0,
          z: 0,
          opacity: 1,
          duration: 1.5,
          ease: 'elastic.out(1, 0.75)',
        },
        '-=0.7'
      );

      // 3. Disparo del spray limpio al "impactar" el logo
      tl.add(() => {
        const totalParticles = particlesRef.current.length;
        particlesRef.current.forEach((particle, index) => {
          if (!particle) return;

          const baseAngle = (index / totalParticles) * 2 * Math.PI;
          const angle = baseAngle + (Math.random() - 0.5) * 0.5;
          const distance = 110 + Math.random() * 110;
          const targetX = Math.cos(angle) * distance;
          const targetY = Math.sin(angle) * distance;
          const gravity = 30 + Math.random() * 40;

          gsap.fromTo(
            particle,
            { x: 0, y: 0, scale: 0.3, opacity: 0.9, xPercent: -50, yPercent: -50 },
            {
              x: targetX,
              y: targetY + gravity,
              scale: 1.2 + Math.random() * 0.5,
              opacity: 0,
              duration: 1.0 + Math.random() * 0.5,
              delay: Math.random() * 0.1,
              ease: 'power3.out',
            }
          );
        });
      }, '-=0.9');

      // 4. Entrada de los iconos flotantes
      tl.to(
        [bubble1Ref.current, bubble2Ref.current],
        {
          scale: 1,
          opacity: 1,
          duration: 0.9,
          stagger: 0.2,
          ease: 'back.out(1.8)',
        },
        '-=0.7'
      );

      // 5. Animaciones continuas
      tl.add(() => {
        gsap.to(bubble1Ref.current, { y: -18, x: 8, duration: 5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        gsap.to(bubble2Ref.current, { y: 18, x: -8, duration: 6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.5 });
        gsap.to(ring1Ref.current, { scale: 1.22, opacity: 0.9, duration: 2.5, yoyo: true, repeat: -1, ease: 'sine.inOut' });
        gsap.to(ring2Ref.current, { scale: 1.38, opacity: 0.35, duration: 3.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 0.4 });
      });

      if (logoEl) {
        logoEl.addEventListener('mousemove', handleMouseMove);
        logoEl.addEventListener('mouseleave', handleMouseLeave);
      }
    });

    mm.add("(max-width: 767px)", () => {
      // Animación súper liviana para móviles
      tl.to(
        [ring1Ref.current, ring2Ref.current],
        {
          scale: (index) => (index === 0 ? 1.15 : 1.3),
          opacity: (index) => (index === 0 ? 0.8 : 0.25),
          duration: 0.5,
          ease: 'power2.out',
        }
      );

      tl.to(
        logoRef.current,
        {
          scale: 1,
          rotationY: 0,
          rotationX: 0,
          z: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power2.out',
        },
        '-=0.3'
      );

      tl.to(
        [bubble1Ref.current, bubble2Ref.current],
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
        },
        '-=0.3'
      );
    });

    return () => {
      tl.kill();
      mm.revert();
      if (logoEl) {
        logoEl.removeEventListener('mousemove', handleMouseMove);
        logoEl.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <section
      id="catalogo"
      className="relative flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary-container px-4 md:px-16"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="bubble-anim absolute left-[10%] top-20 h-32 w-32 rounded-full bg-white blur-3xl" />
        <div className="bubble-anim absolute bottom-40 right-[15%] h-48 w-48 rounded-full bg-secondary-container blur-3xl" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-8 md:gap-12 pt-24 pb-10 md:pt-32 md:pb-20 lg:py-24 lg:grid-cols-2">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left justify-center text-on-primary order-2 lg:order-1 mt-6 lg:mt-0">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 backdrop-blur-md">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            <span className="text-label-md font-semibold">Nueva línea ecológica disponible</span>
          </div>

          <h1 className="mb-4 text-headline-lg sm:text-headline-xl font-bold leading-tight text-white md:text-[56px]">
            Limpieza que <span className="text-secondary-fixed-dim">brilla</span> en cada rincón.
          </h1>

          <p className="mb-8 max-w-lg text-body-md md:text-body-lg text-white/90">
            En <span className="font-bold">NovaxClean</span> creamos productos de limpieza profesionales para tu hogar y negocio. Fórmulas potentes, aromas frescos y resultados que se sienten.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
            <button className="w-full sm:w-auto rounded-xl bg-white px-8 py-4 text-headline-md font-bold text-primary shadow-xl transition-transform hover:scale-105" type="button" onClick={onExploreCatalog}>
              Explorar catálogo
            </button>
            <button className="w-full sm:w-auto rounded-xl border border-white/40 px-8 py-4 text-headline-md font-bold text-white transition-colors hover:bg-white/10" type="button" onClick={onOpenAuth}>
              Iniciar sesión / registrarse
            </button>
          </div>

          <div className="mt-12 lg:mt-16 grid grid-cols-3 gap-4 md:gap-6 border-t border-white/20 pt-8 w-full max-w-md lg:max-w-none">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-headline-lg font-bold">{stat.value}</p>
                <p className="text-label-md uppercase tracking-widest text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center order-1 lg:order-2 w-full px-4 sm:px-0">
          <div className="group relative aspect-square w-full max-w-[280px] sm:max-w-[360px] md:max-w-[420px] lg:max-w-lg" style={{ perspective: '1200px' }}>
            <div ref={ring1Ref} className="absolute inset-0 rounded-full border border-white/20 bg-white/10" />
            <div ref={ring2Ref} className="absolute inset-0 rounded-full bg-white/5" />

            <div ref={logoRef} className="coin-shell animated-glass-panel cloud-shadow relative z-20 flex h-full w-full items-center justify-center overflow-hidden rounded-full">
              <img src={logoOf2} alt="Logo" className="w-[90%] h-[90%] object-contain" />
            </div>

            {/* Gotas de spray con refracción y highlight especular */}
            {Array.from({ length: 14 }).map((_, i) => {
              // 4 categorías de tamaño para distribución natural
              const sizeMap = [
                'h-1.5 w-1.5',  // tiny mist
                'h-2.5 w-2.5',  // small
                'h-4 w-4',      // medium
                'h-5 w-5',      // large
              ];
              const highlightSize = [
                'h-0.5 w-0.5',
                'h-1 w-1',
                'h-1.5 w-1.5',
                'h-2 w-2',
              ];
              const sizeIdx = i % 4;
              const sizeClass = sizeMap[sizeIdx];
              const hlClass = highlightSize[sizeIdx];
              
              return (
                <div
                  key={i}
                  ref={(el) => (particlesRef.current[i] = el)}
                  className={`absolute left-1/2 top-1/2 ${sizeClass} rounded-full opacity-0 pointer-events-none z-30`}
                  style={{
                    background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95) 0%, rgba(224,242,254,0.7) 25%, rgba(125,211,252,0.4) 55%, rgba(56,189,248,0.6) 80%, rgba(14,165,233,0.3) 100%)',
                    boxShadow: 'inset -1px -1px 3px rgba(0,0,0,0.12), inset 1px 1px 2px rgba(255,255,255,0.6), 0 1px 4px rgba(56,189,248,0.25)',
                    border: '0.5px solid rgba(255,255,255,0.5)',
                  }}
                >
                  {/* Specular highlight — simula reflexión de luz */}
                  <div
                    className={`absolute left-[18%] top-[15%] ${hlClass} rounded-full`}
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 60%, transparent 100%)',
                      filter: 'blur(0.3px)',
                    }}
                  />
                </div>
              );
            })}

            <div ref={bubble1Ref} className="cloud-shadow absolute -right-4 -top-4 lg:-right-10 lg:-top-10 flex h-16 w-16 lg:h-24 lg:w-24 items-center justify-center rounded-full bg-secondary-container">
              <Sparkles className="h-7 w-7 lg:h-10 lg:w-10 text-on-secondary-container" />
            </div>

            <div ref={bubble2Ref} className="cloud-shadow animated-glass-panel absolute -bottom-4 -left-4 lg:-bottom-10 lg:-left-10 flex h-20 w-20 lg:h-32 lg:w-32 items-center justify-center rounded-2xl">
              <Microscope className="h-9 w-9 lg:h-14 lg:w-14 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}