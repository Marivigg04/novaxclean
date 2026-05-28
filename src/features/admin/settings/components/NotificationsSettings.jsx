import { useMemo, useState } from 'react';
import { Bell, Mail, Package, Save } from 'lucide-react';
import ConfirmChangesModal from './ConfirmChangesModal';

function ToggleRow({ checked, onChange, title, description, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] p-4 text-left transition-colors hover:bg-[var(--color-app-panel-hover)]"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-[var(--color-app-panel-hover)] p-2 text-[var(--color-brand)]">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-sm font-semibold text-[var(--color-base-text)]">{title}</p>
          <p className="mt-1 text-xs text-[var(--color-base-text)]/60">{description}</p>
        </div>
      </div>

      <span
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-[var(--color-brand)]' : 'bg-[var(--color-base-text)]/20'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </button>
  );
}

export default function NotificationsSettings({ initialNotifications, onSave = () => {} }) {
  const fallbackNotifications = useMemo(
    () => ({
      emailAlerts: true,
      pushAlerts: true,
      lowStockAlert: true,
      ...initialNotifications,
    }),
    [initialNotifications],
  );

  const [notifications, setNotifications] = useState(fallbackNotifications);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSave = () => {
    onSave(notifications);
  };

  return (
    <section className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-6 shadow-[0_12px_30px_-20px_rgba(16,32,58,0.35)] md:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[var(--color-base-text)]">Notificaciones</h3>
        <p className="mt-1 text-sm text-[var(--color-base-text)]/62">Elige cómo quieres recibir avisos de la cuenta.</p>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <ToggleRow
          checked={notifications.emailAlerts}
          onChange={(value) => setNotifications((current) => ({ ...current, emailAlerts: value }))}
          title="Alertas por correo"
          description="Recibe avisos sobre actividad importante y cambios de cuenta."
          icon={Mail}
        />

        <ToggleRow
          checked={notifications.pushAlerts}
          onChange={(value) => setNotifications((current) => ({ ...current, pushAlerts: value }))}
          title="Notificaciones push"
          description="Avisos en tiempo real en el panel."
          icon={Bell}
        />

        <ToggleRow
          checked={notifications.lowStockAlert}
          onChange={(value) => setNotifications((current) => ({ ...current, lowStockAlert: value }))}
          title="Alerta de stock bajo"
          description="Avisar cuando un producto esté por agotarse."
          icon={Package}
        />

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(16,32,58,0.45)] transition-transform hover:scale-[0.99] active:scale-[0.98]"
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </button>
        </div>
      </form>

      <ConfirmChangesModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSave}
      />
    </section>
  );
}
