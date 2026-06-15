import { useEffect, useMemo, useState } from 'react';
import { Upload, Trash2, Save } from 'lucide-react';
import PhotoUploadModal from './PhotoUploadModal';
import ConfirmChangesModal from './ConfirmChangesModal';
import RemovePhotoModal from './RemovePhotoModal';
import UserAvatarIcon from '@/shared/UserAvatarIcon';

function Field({ label, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-[var(--color-base-text)]/70">{label}</span>
      {children}
    </label>
  );
}

export default function ProfileSettings({
  initialProfile,
  onSave = () => {},
  onUploadPhoto = () => {},
  onRemovePhoto = () => {},
}) {
  const fallbackProfile = useMemo(
    () => ({
      name: 'Nova Admin',
      email: 'admin@novaxclean.com',
      phone: '',
      bio: 'Administrador del panel de Novaxclean.',
      avatar: 'NX',
      ...initialProfile,
    }),
    [initialProfile],
  );

  const [profile, setProfile] = useState(fallbackProfile);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRemovePhotoModalOpen, setIsRemovePhotoModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setProfile(fallbackProfile);
  }, [fallbackProfile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    try {
      await onSave(profile);
      setIsConfirmModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(fallbackProfile);
  };

  const handleUploadFiles = (selectedFiles) => {
    onUploadPhoto(selectedFiles);
  };

  const handleConfirmRemovePhoto = () => {
    onRemovePhoto();
    setIsRemovePhotoModalOpen(false);
  };

  return (
    <section className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-6 shadow-[0_12px_30px_-20px_rgba(16,32,58,0.35)] md:p-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-[var(--color-base-text)]">Perfil</h3>
        <p className="mt-1 text-sm text-[var(--color-base-text)]/62">Tu información personal visible en la cuenta.</p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-6">
          <UserAvatarIcon avatar={profile.avatar} name={profile.name} size="lg" className="shadow-inner" />

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)] transition-colors hover:bg-[var(--color-app-panel-hover)]"
            >
              <Upload className="h-4 w-4" />
              Subir foto
            </button>

            <button
              type="button"
              onClick={() => setIsRemovePhotoModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-transparent px-4 py-2.5 text-sm font-semibold text-[var(--color-base-text)]/75 transition-colors hover:bg-red-500/10 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar foto
            </button>
          </div>
        </div>

        <div className="h-px w-full bg-[var(--color-app-panel-border)]" />

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <input
              name="name"
              value={profile.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3 text-sm text-[var(--color-base-text)] outline-none transition-colors placeholder:text-[var(--color-base-text)]/35 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
              placeholder="Tu nombre"
            />
          </Field>

          <Field label="Correo">
            <input
              name="email"
              type="email"
              value={profile.email}
              readOnly
              className="w-full rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)]/70 px-4 py-3 text-sm text-[var(--color-base-text)]/70 outline-none cursor-not-allowed"
              placeholder="correo@dominio.com"
            />
          </Field>

          <Field label="Teléfono">
            <input
              name="phone"
              value={profile.phone ?? ''}
              onChange={handleChange}
              className="w-full rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3 text-sm text-[var(--color-base-text)] outline-none transition-colors placeholder:text-[var(--color-base-text)]/35 focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/10"
              placeholder="0412-0000000"
            />
          </Field>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl px-4 py-3 text-sm font-semibold text-[var(--color-base-text)]/80 transition-colors hover:bg-[var(--color-app-panel-hover)]"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(16,32,58,0.45)] transition-transform hover:scale-[0.99] active:scale-[0.98] disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            Guardar cambios
          </button>
        </div>
      </form>

      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmit={handleUploadFiles}
      />

      <ConfirmChangesModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSave}
      />

      <RemovePhotoModal
        isOpen={isRemovePhotoModalOpen}
        onClose={() => setIsRemovePhotoModalOpen(false)}
        onConfirm={handleConfirmRemovePhoto}
      />
    </section>
  );
}
