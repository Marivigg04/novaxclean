import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

export const showCustomToast = {
  success: (message) => {
    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={t.visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="flex items-center gap-4 rounded-2xl border border-emerald-500/15 bg-emerald-500/10 dark:bg-emerald-500/5 backdrop-blur-xl px-5 py-4 shadow-[0_20px_50px_-20px_rgba(16,32,58,0.4)] max-w-md w-full sm:w-[380px]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90 dark:bg-surface-container-lowest shadow-sm ring-1 ring-black/5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80 uppercase tracking-widest">Éxito</p>
            <p className="mt-0.5 text-sm font-semibold text-on-surface leading-tight">{message}</p>
          </div>
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="rounded-full p-1.5 text-emerald-700/50 hover:bg-black/5 dark:hover:bg-white/5 dark:text-emerald-400/50 hover:text-on-surface transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ),
      { position: 'top-center' },
    );
  },
  error: (message) => {
    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={t.visible ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="flex items-center gap-4 rounded-2xl border border-rose-500/15 bg-rose-500/10 dark:bg-rose-500/5 backdrop-blur-xl px-5 py-4 shadow-[0_20px_50px_-20px_rgba(16,32,58,0.4)] max-w-md w-full sm:w-[380px]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90 dark:bg-surface-container-lowest shadow-sm ring-1 ring-black/5">
            <AlertCircle className="h-5 w-5 text-rose-600" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-rose-700/80 dark:text-rose-400/80 uppercase tracking-widest">Error</p>
            <p className="mt-0.5 text-sm font-semibold text-on-surface leading-tight">{message}</p>
          </div>
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="rounded-full p-1.5 text-rose-700/50 hover:bg-black/5 dark:hover:bg-white/5 dark:text-rose-400/50 hover:text-on-surface transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ),
      { position: 'top-center' },
    );
  },
  loading: (message) =>
    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="flex items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-high/90 backdrop-blur-xl px-5 py-4 shadow-[0_20px_50px_-20px_rgba(16,32,58,0.4)] max-w-md w-full sm:w-[380px]"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/95 dark:bg-surface-container-lowest shadow-sm ring-1 ring-black/5">
            <Loader2 className="h-5 w-5 text-secondary animate-spin" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-outline uppercase tracking-widest">Procesando</p>
            <p className="mt-0.5 text-sm font-semibold text-on-surface leading-tight">{message}</p>
          </div>
        </motion.div>
      ),
      { position: 'top-center', duration: Infinity },
    ),
};
