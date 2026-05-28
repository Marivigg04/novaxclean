import { infoHighlights, infoPoints } from './content';

export default function InfoSection() {
  return (
    <section id="informacion" className="bg-surface-container-low py-20">
      <div className="mx-auto max-w-[1280px] px-4 md:px-16">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                {infoHighlights.slice(0, 2).map((item) => (
                  <div key={item.title} className="cloud-shadow flex flex-col items-center rounded-3xl border border-outline-variant bg-surface-container-low p-6 text-center">
                    <span className={`material-symbols-outlined mb-4 text-4xl ${item.iconColor}`}>{item.icon}</span>
                    <h4 className="font-bold text-primary">{item.title}</h4>
                    <p className="text-sm text-outline">{item.subtitle}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {infoHighlights.slice(2).map((item) => (
                  <div key={item.title} className="cloud-shadow flex flex-col items-center rounded-3xl border border-outline-variant bg-surface-container-low p-6 text-center">
                    <span className={`material-symbols-outlined mb-4 text-4xl ${item.iconColor}`}>{item.icon}</span>
                    <h4 className="font-bold text-primary">{item.title}</h4>
                    <p className="text-sm text-outline">{item.subtitle}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute left-1/2 top-1/2 -z-10 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-3xl" />
          </div>

          <div className="lg:pl-12">
            <div className="mb-6 inline-block rounded-full bg-secondary-container/30 px-4 py-1 text-label-md font-bold text-secondary">Información</div>
            <h2 className="mb-6 text-headline-xl font-bold text-primary">Sobre nuestra página y productos</h2>
            <p className="mb-8 text-body-lg text-on-surface-variant">
              Esta plataforma fue diseñada para que encuentres, compares y compres productos de limpieza de manera simple y rápida. Cada artículo en nuestro catálogo cuenta con información detallada, valoraciones reales y garantía de calidad Novax.
            </p>

            <ul className="mb-10 space-y-4">
              {infoPoints.map((point) => (
                <li key={point} className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <span className="text-body-md font-semibold text-primary">{point}</span>
                </li>
              ))}
            </ul>

            <button className="rounded-xl bg-primary px-8 py-3 font-bold text-on-primary transition-colors hover:bg-secondary">
              Conoce más de nosotros
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}