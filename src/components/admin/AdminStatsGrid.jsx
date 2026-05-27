import { stats } from './data';

export default function AdminStatsGrid() {
  return (
    <div className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className="group cursor-pointer rounded-xl border border-outline-variant bg-surface-container-lowest p-6 cloud-shadow transition-all hover:border-primary">
          <div className="mb-4 flex items-start justify-between">
            <div className={`rounded-lg p-2 ${stat.iconClass}`}>
              <span className="material-symbols-outlined">{stat.icon}</span>
            </div>
            <span className={`flex items-center gap-1 text-label-md font-bold ${stat.trendClass || 'text-secondary'}`}>
              <span className="material-symbols-outlined text-[16px]">{stat.trendIcon}</span>
              {stat.trend}
            </span>
          </div>
          <p className="mb-1 text-label-md text-on-surface-variant">{stat.label}</p>
          <h3 className="text-headline-md font-bold text-primary">{stat.value}</h3>
        </article>
      ))}
    </div>
  );
}
