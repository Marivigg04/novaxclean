import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, PencilLine, Trash2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const styles = {
  success: {
    wrapper: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-700',
    icon: CheckCircle2,
    iconClass: 'text-emerald-600',
    rail: 'bg-emerald-500',
  },
  edit: {
    wrapper: 'border-sky-500/15 bg-sky-500/10 text-sky-700',
    icon: PencilLine,
    iconClass: 'text-sky-600',
    rail: 'bg-sky-500',
  },
  delete: {
    wrapper: 'border-rose-500/15 bg-rose-500/10 text-rose-700',
    icon: Trash2,
    iconClass: 'text-rose-600',
    rail: 'bg-rose-500',
  },
  warning: {
    wrapper: 'border-amber-500/15 bg-amber-500/10 text-amber-700',
    icon: AlertTriangle,
    iconClass: 'text-amber-600',
    rail: 'bg-amber-500',
  },
};

export default function InventoryToast({ t, alert }) {
  const theme = styles[alert.type] ?? styles.success;
  const Icon = theme.icon;
  const prefersReducedMotion = useReducedMotion();

  const wrapperMotion = prefersReducedMotion
    ? {
        initial: { opacity: 0, y: -10, scale: 0.98 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -8, scale: 0.98 },
      }
    : {
        initial: { opacity: 0, y: -24, scale: 0.9, rotateX: 10 },
        animate: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
        exit: { opacity: 0, y: -16, scale: 0.96, rotateX: 0 },
      };

  return (
    <motion.div
      {...wrapperMotion}
      transition={{ type: 'spring', stiffness: 320, damping: 24, mass: 0.85 }}
      className={`relative overflow-hidden rounded-[1.4rem] border shadow-[0_24px_60px_-26px_rgba(16,32,58,0.55)] backdrop-blur-xl ${theme.wrapper}`}
    >
      <motion.div
        aria-hidden="true"
        className={`absolute inset-0 opacity-0 blur-2xl ${theme.rail}`}
        animate={prefersReducedMotion ? { opacity: 0.08 } : { opacity: [0.04, 0.14, 0.04], scale: [1, 1.03, 1] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="flex items-stretch gap-0">
        <motion.div
          aria-hidden="true"
          className={`flex w-1.5 shrink-0 ${theme.rail}`}
          animate={prefersReducedMotion ? undefined : { opacity: [0.75, 1, 0.75] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="flex flex-1 items-start gap-4 px-4 py-4 sm:px-5 sm:py-4.5">
          <motion.div
            initial={prefersReducedMotion ? { scale: 0.92 } : { rotate: -16, scale: 0.7, y: -4 }}
            animate={prefersReducedMotion ? { scale: 1 } : { rotate: [0, 6, 0], scale: 1, y: [0, -1.5, 0] }}
            transition={prefersReducedMotion ? { duration: 0.2 } : { type: 'spring', stiffness: 380, damping: 16, delay: 0.04 }}
            className={`relative mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 shadow-sm ring-1 ring-black/5 ${theme.iconClass}`}
          >
            <motion.div
              aria-hidden="true"
              className={`absolute inset-0 rounded-2xl ${theme.rail} opacity-20`}
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <Icon className="h-5 w-5" />
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[var(--color-base-text)] sm:text-base">{alert.title}</p>
                <p className="mt-1 text-sm leading-5 text-[var(--color-base-text)]/76 sm:text-[0.95rem]">{alert.message}</p>
              </div>

              <button
                type="button"
                onClick={() => toast.dismiss(t.id)}
                className="rounded-full p-2 text-[var(--color-base-text)]/55 transition-colors hover:bg-black/5 hover:text-[var(--color-base-text)]"
                aria-label="Cerrar alerta"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 4.5, ease: 'linear' }}
              className={`mt-3 h-1 origin-left rounded-full bg-gradient-to-r from-white/40 via-white/85 to-white/40 ${theme.rail} opacity-80`}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
