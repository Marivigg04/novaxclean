import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { companyStats } from './content';

gsap.registerPlugin(ScrollTrigger);

export default function CompanySection() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación de textos del lado izquierdo (deslizan hacia arriba)
      gsap.from('.company-info > *', {
        scrollTrigger: {
          trigger: '.company-info',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });

      // Animación escalonada de las estadísticas del lado derecho
      gsap.from('.company-stat-card', {
        scrollTrigger: {
          trigger: '.company-stats-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        scale: 0.85,
        y: 40,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.4)',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} id="empresa" className="relative overflow-hidden bg-surface-container-low py-20 text-on-surface">
      <div className="absolute right-0 top-0 h-full w-1/3 skew-x-12 bg-secondary/10 translate-x-20" />

      <div className="relative z-10 mx-auto max-w-[1280px] px-4 md:px-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="company-info flex flex-col items-start">
            <div className="mb-6 inline-block rounded-full border border-outline-variant px-4 py-1 text-label-md text-on-surface-variant">La empresa</div>
            <h2 className="mb-4 text-headline-xl font-bold">Novax Clean</h2>
            <p className="mb-8 text-body-lg italic text-secondary">"Limpieza que cuida, cuidado que se siente."</p>
            <p className="mb-10 text-body-lg leading-relaxed text-on-surface-variant">
              Somos una empresa dedicada a la fabricación y distribución de productos de limpieza de alta calidad. Nacimos con la misión de transformar la rutina de limpieza en una experiencia agradable, eficiente y responsable con el medio ambiente. Cada producto Novax Clean es desarrollado con ingredientes seleccionados y procesos controlados para garantizar resultados profesionales en hogares, oficinas e industrias.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 w-full">
              <div className="rounded-3xl border border-outline-variant bg-surface-container p-6 backdrop-blur-sm transition-colors hover:bg-surface-container-high">
                <div className="mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">rocket_launch</span>
                  <h5 className="font-bold">Misión</h5>
                </div>
                <p className="text-sm text-on-surface-variant">Brindar soluciones de limpieza efectivas, seguras y accesibles para todos.</p>
              </div>

              <div className="rounded-3xl border border-outline-variant bg-surface-container p-6 backdrop-blur-sm transition-colors hover:bg-surface-container-high">
                <div className="mb-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">visibility</span>
                  <h5 className="font-bold">Visión</h5>
                </div>
                <p className="text-sm text-on-surface-variant">Ser la marca líder en productos de limpieza eco-amigables de Latinoamérica.</p>
              </div>
            </div>
          </div>

          <div className="company-stats-grid grid grid-cols-2 gap-4 lg:gap-6">
            {companyStats.map((stat) => (
              <div
                key={stat.label}
                className="company-stat-card aspect-square rounded-3xl border border-outline-variant bg-surface-container p-6 text-center transition-colors hover:bg-surface-container-high"
              >
                <div className="flex h-full flex-col items-center justify-center">
                  <span className="text-headline-xl font-black text-secondary">{stat.value}</span>
                  <span className="text-label-md uppercase tracking-tighter text-on-surface-variant">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}