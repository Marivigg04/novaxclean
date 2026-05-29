import { useState } from 'react';
import { Upload, Trash2, Save } from 'lucide-react';
import UserAvatarIcon from '@/shared/UserAvatarIcon';
import { useAuth } from '@/context/AuthContext';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[var(--color-base-text)]/80">{label}</span>
      {children}
    </label>
  );
}

export default function UserInfoTab() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || 'Usuario',
    email: 'user@novaxclean.com',
    avatar: user?.avatar || 'U',
  });

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-1 text-xl font-bold text-[var(--color-base-text)]">Información Personal</h3>
        <p className="text-sm text-[var(--color-base-text)]/60">Tus datos principales y foto de perfil.</p>
      </div>

      <div className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-6 shadow-sm md:p-8">
        <form className="space-y-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center text-[var(--color-base-text)]">
            <UserAvatarIcon avatar={profile.avatar} name={profile.name} size="lg" className="shadow-lg h-24 w-24 text-2xl" />

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-5 py-2.5 text-sm font-bold shadow-sm transition-all hover:bg-[var(--color-app-panel-hover)]"
              >
                <Upload className="h-4 w-4" />
                Subir foto
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-transparent px-5 py-2.5 text-sm font-bold text-[var(--color-base-text)]/75 transition-all hover:bg-error-container/20 hover:text-error"
              >
                <Trash2 className="h-4 w-4" />
                Eliminar foto
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-[var(--color-app-panel-border)]" />

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Nombre Completo">
              <input
                name="name"
                value={profile.name}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3.5 text-sm font-medium outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                placeholder="Tu nombre"
              />
            </Field>

            <Field label="Correo Electrónico">
              <input
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3.5 text-sm font-medium outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                placeholder="correo@dominio.com"
              />
            </Field>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--color-brand)]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              Actualizar datos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
