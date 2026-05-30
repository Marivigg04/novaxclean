import logoOf2 from '../../assets/Logo OF2.png';
import { heroStats } from './content';

export default function HeroSection({ onExploreCatalog, onOpenAuth }) {
  return (
    <section
      id="catalogo"
      className="relative flex min-h-[90vh] items-center overflow-hidden bg-gradient-to-br from-primary via-secondary to-primary-container px-4 md:px-16"
    >
      <div className="absolute inset-0 opacity-20">
        <div className="bubble-anim absolute left-[10%] top-20 h-32 w-32 rounded-full bg-white blur-3xl" />
        <div className="bubble-anim absolute bottom-40 right-[15%] h-48 w-48 rounded-full bg-secondary-container blur-3xl" style={{ animationDelay: '-2s' }} />
      </div>

      <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-12 py-20 lg:grid-cols-2">
        <div className="flex flex-col justify-center text-on-primary">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 backdrop-blur-md">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
              eco
            </span>
            <span className="text-label-md font-semibold">Nueva línea ecológica disponible</span>
          </div>

          <h1 className="mb-6 text-headline-xl font-bold leading-tight text-white md:text-[56px]">
            Limpieza que <span className="text-secondary-fixed-dim">brilla</span> en cada rincón.
          </h1>

          <p className="mb-10 max-w-lg text-body-lg text-white/90">
            En <span className="font-bold">NovaxClean</span> creamos productos de limpieza profesionales para tu hogar y negocio. Fórmulas potentes, aromas frescos y resultados que se sienten.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="rounded-xl bg-white px-8 py-4 text-headline-md font-bold text-primary shadow-xl transition-transform hover:scale-105" type="button" onClick={onExploreCatalog}>
              Explorar catálogo
            </button>
            <button className="rounded-xl border border-white/40 px-8 py-4 text-headline-md font-bold text-white transition-colors hover:bg-white/10" type="button" onClick={onOpenAuth}>
              Iniciar sesión / registrarse
            </button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 border-t border-white/20 pt-8">
            {heroStats.map((stat) => (
              <div key={stat.label}>
                <p className="text-headline-lg font-bold">{stat.value}</p>
                <p className="text-label-md uppercase tracking-widest text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="group relative aspect-square w-full max-w-lg" style={{ perspective: '1200px' }}>
            <div className="absolute inset-0 scale-110 rounded-full border border-white/20 bg-white/10 animate-pulse" />
            <div className="absolute inset-0 scale-125 rounded-full bg-white/5" />

            <div className="coin-shell glass-panel cloud-shadow relative z-20 flex h-full w-full items-center justify-center overflow-hidden rounded-full">
              <div className="hero-coin-flip absolute inset-0">
                <div className="coin-face coin-face-front">
                  <img alt="Logo OF2 frontal" className="h-[92%] w-[92%] object-contain" src={logoOf2} />
                </div>

                <div className="coin-face coin-face-back">
                  <img alt="Logo OF2 reverso" className="h-[92%] w-[92%] object-contain" src={logoOf2} />
                </div>
              </div>
            </div>

            <div className="bubble-anim cloud-shadow absolute -right-10 -top-10 flex h-24 w-24 items-center justify-center rounded-full bg-secondary-container">
              <span className="material-symbols-outlined text-4xl text-on-secondary-container">colors_spark</span>
            </div>

            <div className="bubble-anim cloud-shadow glass-panel absolute -bottom-10 -left-10 flex h-32 w-32 items-center justify-center rounded-2xl" style={{ animationDelay: '-3s' }}>
              <span className="material-symbols-outlined text-5xl text-primary">biotech</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}