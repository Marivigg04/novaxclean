import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { contactMethods } from './content';

gsap.registerPlugin(ScrollTrigger);

export default function ContactSection() {
  const containerRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      // Animación de la tarjeta de contacto completa (fade y slide-up)
      gsap.from('.contact-card', {
        scrollTrigger: {
          trigger: '.contact-card',
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={containerRef} id="contacto" className="bg-background px-4 py-20 md:px-16 overflow-hidden">
      <div className="contact-card mx-auto flex max-w-[1280px] flex-col overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-low shadow-[0_10px_40px_-10px_rgba(15,40,84,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] md:flex-row">
        <div className="contact-info-col flex flex-col justify-center p-8 md:w-1/2 md:p-12">
          <h2 className="mb-6 text-headline-lg font-bold text-primary">¿Interesado en nuestros productos para tu empresa?</h2>
          <p className="mb-10 text-body-lg text-on-surface-variant">
            Déjanos tus datos y un asesor comercial se pondrá en contacto contigo para ofrecerte una solución personalizada y precios especiales para mayoristas.
          </p>

          <div className="space-y-6">
            {contactMethods.map((item) => (
              <div key={item.label} className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <span className="text-body-md font-semibold">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="contact-form-col p-8 md:w-1/2 md:p-12">
          <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-label-md font-bold text-primary">Nombre completo</span>
                <input
                  className="w-full rounded-xl border border-outline-variant bg-background p-3 outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary"
                  placeholder="Ej. Juan Pérez"
                  type="text"
                />
              </label>

              <label className="space-y-2">
                <span className="text-label-md font-bold text-primary">Correo electrónico</span>
                <input
                  className="w-full rounded-xl border border-outline-variant bg-background p-3 outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary"
                  placeholder="juan@empresa.com"
                  type="email"
                />
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-label-md font-bold text-primary">Empresa</span>
              <input
                className="w-full rounded-xl border border-outline-variant bg-background p-3 outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary"
                placeholder="Nombre de tu negocio"
                type="text"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-label-md font-bold text-primary">Mensaje o interés</span>
              <textarea
                className="min-h-32 w-full resize-none rounded-xl border border-outline-variant bg-background p-3 outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary"
                placeholder="Cuéntanos qué necesitas..."
                rows="4"
              />
            </label>

            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-on-primary shadow-lg transition-colors hover:bg-secondary" type="submit">
              Enviar solicitud
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}