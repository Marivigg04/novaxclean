import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { benefits } from './content';

gsap.registerPlugin(ScrollTrigger);

export default function BenefitsSection() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación del header
      gsap.from('.benefits-header > *', {
        scrollTrigger: {
          trigger: '.benefits-header',
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
      });

      // Animación escalonada de las tarjetas
      gsap.from('.benefit-card', {
        scrollTrigger: {
          trigger: '.benefits-grid',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.2)',
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="mx-auto max-w-[1280px] px-4 py-20 md:px-16 overflow-hidden">
      <div className="benefits-header mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
        <div className="max-w-2xl">
          <span className="text-label-md font-bold uppercase tracking-widest text-secondary">Beneficios Novax</span>
          <h2 className="mt-4 text-headline-xl font-bold text-primary">¿Por qué elegir nuestra limpieza profunda?</h2>
        </div>
        <p className="max-w-md text-body-lg text-outline">Estándares industriales adaptados para la comodidad y seguridad de tu hogar.</p>
      </div>

      <div className="benefits-grid grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => (
          <article
            key={benefit.title}
            className="benefit-card cloud-shadow rounded-2xl border border-outline-variant bg-surface-container-low p-6 transition-transform duration-300 hover:-translate-y-2"
          >
            <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${benefit.iconColor}`}>
              <span className="material-symbols-outlined text-3xl">{benefit.icon}</span>
            </div>
            <h3 className="mb-4 text-headline-md font-semibold text-primary">{benefit.title}</h3>
            <p className="text-body-md text-on-surface-variant">{benefit.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}