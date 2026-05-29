import { AlertTriangle, CheckCircle2, PencilLine, Trash2, X } from 'lucide-react';

const alertStyles = {
  success: {
    wrapper: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-700',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
  },
  edit: {
    wrapper: 'border-sky-500/15 bg-sky-500/10 text-sky-700',
    icon: PencilLine,
    iconClass: 'text-sky-600',
  },
  delete: {
    wrapper: 'border-rose-500/15 bg-rose-500/10 text-rose-700',
    icon: Trash2,
    iconClass: 'text-rose-600',
  },
  warning: {
    wrapper: 'border-amber-500/15 bg-amber-500/10 text-amber-700',
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
  },
};

export default function InventoryAlerts({ alerts = [], onDismiss = () => {} }) {
  if (!alerts.length) return null;

  return (
    <div className="fixed left-1/2 top-4 z-[130] flex w-[min(94vw,36rem)] -translate-x-1/2 flex-col gap-3 px-2 sm:top-6">
      {alerts.map((alert) => {
        const styles = alertStyles[alert.type] ?? alertStyles.success;
        const Icon = styles.icon;

        return (
          <div
            key={alert.id}
            className={`overflow-hidden rounded-[1.4rem] border shadow-[0_24px_60px_-26px_rgba(16,32,58,0.55)] backdrop-blur-xl ${styles.wrapper}`}
          >
            <div className="flex items-stretch gap-0">
              <div className={`flex w-1.5 shrink-0 ${alert.type === 'success' ? 'bg-emerald-500' : alert.type === 'edit' ? 'bg-sky-500' : alert.type === 'delete' ? 'bg-rose-500' : 'bg-amber-500'}`} />

              <div className="flex flex-1 items-start gap-4 px-4 py-4 sm:px-5 sm:py-4.5">
                <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5 ${styles.iconClass}`}>
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[var(--color-base-text)] sm:text-base">{alert.title}</p>
                      <p className="mt-1 text-sm leading-5 text-[var(--color-base-text)]/76 sm:text-[0.95rem]">{alert.message}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDismiss(alert.id)}
                      className="rounded-full p-2 text-[var(--color-base-text)]/55 transition-colors hover:bg-black/5 hover:text-[var(--color-base-text)]"
                      aria-label="Cerrar alerta"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
