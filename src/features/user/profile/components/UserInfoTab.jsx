import { useEffect, useState } from 'react';
import { Upload, Trash2, Save, Loader2 } from 'lucide-react';
import UserAvatarIcon from '@/shared/UserAvatarIcon';
import { useAuth } from '@/context/AuthContext';
import PhotoUploadModal from '@/features/admin/settings/components/PhotoUploadModal';
import ConfirmChangesModal from '@/features/admin/settings/components/ConfirmChangesModal';
import RemovePhotoModal from '@/features/admin/settings/components/RemovePhotoModal';
import { showInventoryToast } from '@/features/admin/inventory/components/toastService';
import { updateUserProfile, uploadUserAvatar } from '@/features/user/profile/data/userService';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-[var(--color-base-text)]/80">{label}</span>
      {children}
    </label>
  );
}

export default function UserInfoTab() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState({
    name: user?.name || 'Usuario',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || 'U',
  });
  const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isRemovePhotoModalOpen, setIsRemovePhotoModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    setProfile({
      name: user.name || 'Usuario',
      email: user.email || '',
      phone: user.phone || '',
      avatar: user.avatar || 'U',
    });
    setPendingAvatarFile(null);
    setAvatarRemoved(false);
  }, [user]);

  useEffect(() => {
    return () => {
      if (typeof profile.avatar === 'string' && profile.avatar.startsWith('blob:')) {
        URL.revokeObjectURL(profile.avatar);
      }
    };
  }, [profile.avatar]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUploadFiles = (files) => {
    const firstFile = files?.[0];
    if (!firstFile) return;

    setPendingAvatarFile(firstFile);
    setAvatarRemoved(false);
    setProfile((current) => ({
      ...current,
      avatar: URL.createObjectURL(firstFile),
    }));
    setIsUploadModalOpen(false);
  };

  const handleRemovePhoto = () => {
    setPendingAvatarFile(null);
    setAvatarRemoved(true);
    setProfile((current) => {
      if (typeof current.avatar === 'string' && current.avatar.startsWith('blob:')) {
        URL.revokeObjectURL(current.avatar);
      }

      return {
        ...current,
        avatar: current.name?.[0]?.toUpperCase() || 'U',
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!user?.id) {
      showInventoryToast({
        type: 'delete',
        title: 'Sesión requerida',
        message: 'Inicia sesión para actualizar tu perfil.',
      });
      setIsConfirmModalOpen(false);
      return;
    }

    setIsSaving(true);

    try {
      let avatarUrl;

      if (pendingAvatarFile) {
        avatarUrl = await uploadUserAvatar(user.id, pendingAvatarFile);
      } else if (avatarRemoved) {
        avatarUrl = null;
      }

      await updateUserProfile(user.id, {
        name: profile.name,
        phone: profile.phone,
        ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
      });

      await refreshUser();
      setPendingAvatarFile(null);

      showInventoryToast({
        type: 'success',
        title: 'Perfil actualizado',
        message: 'Tus datos se guardaron correctamente.',
      });
      setIsConfirmModalOpen(false);
    } catch (error) {
      showInventoryToast({
        type: 'delete',
        title: 'Error al guardar',
        message: error.message || 'No se pudieron actualizar tus datos.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmRemovePhoto = () => {
    handleRemovePhoto();
    setIsRemovePhotoModalOpen(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-1 text-xl font-bold text-[var(--color-base-text)]">Información Personal</h3>
        <p className="text-sm text-[var(--color-base-text)]/60">Tus datos principales y foto de perfil.</p>
      </div>

      <div className="rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-6 shadow-sm md:p-8">
        <form className="space-y-8" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6 md:flex-row md:items-center text-[var(--color-base-text)]">
            <UserAvatarIcon avatar={profile.avatar} name={profile.name} size="lg" className="shadow-lg h-24 w-24 text-2xl" />

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-5 py-2.5 text-sm font-bold shadow-sm transition-all hover:bg-[var(--color-app-panel-hover)]"
              >
                <Upload className="h-4 w-4" />
                Subir foto
              </button>

              <button
                type="button"
                onClick={() => setIsRemovePhotoModalOpen(true)}
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
                required
              />
            </Field>

            <Field label="Correo Electrónico">
              <input
                name="email"
                type="email"
                value={profile.email}
                readOnly
                className="w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)]/70 px-4 py-3.5 text-sm font-medium text-[var(--color-base-text)]/70 outline-none"
                placeholder="correo@dominio.com"
              />
            </Field>

            <Field label="Teléfono">
              <input
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-bg)] px-4 py-3.5 text-sm font-medium outline-none transition-colors focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]"
                placeholder="0412-0000000"
              />
            </Field>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-brand)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--color-brand)]/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Actualizar datos
            </button>
          </div>
        </form>
      </div>

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
    </div>
  );
}
