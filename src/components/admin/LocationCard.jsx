import { routeSummary } from './data';

export default function LocationCard() {
  return (
    <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm cloud-shadow">
      <div className="p-4">
        <h3 className="mb-2 flex items-center gap-2 text-label-md font-bold text-primary">
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          Operaciones en Tiempo Real
        </h3>
      </div>

      <div className="relative h-48 overflow-hidden bg-surface-variant">
        <img
          alt="Spain logistics map"
          className="h-full w-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDggHlEKI9-BAayU1IMtm4itoyS8PkdZy58CXdhpwhZpYUs8D4fye14Dag42sn-5ZF1176u2sgE2UzoXiYtC2om9xsn3Pf7xKfUiS7ASFbiZNagl5drU2fbnjfFZ3W5Y4GfXC1XVZLFDL3RMt4_DOAoE6BThi4_c9gOEc8pnzNtK6dSbGZt2HmQO-ZgmVpKpQjAI3JBO5QAAHVhyAAGMPN-KyYgbH45nWjAl_oE7SXU1i9BRlN-swa35AqgJVPugC7VjPscdA4v9CM"
        />
        <div className="absolute inset-0 bg-primary/20" />
        <div className="absolute left-1/3 top-1/2 h-3 w-3 animate-bounce rounded-full border-2 border-white bg-secondary" />
        <div className="absolute left-1/2 top-1/4 h-3 w-3 rounded-full border-2 border-white bg-secondary" />
      </div>

      <div className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-headline-md font-bold text-primary">{routeSummary.routes}</span>
          <div>
            <p className="text-label-md font-bold">Rutas Activas</p>
            <p className="text-[11px] text-on-surface-variant">{routeSummary.updated}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
