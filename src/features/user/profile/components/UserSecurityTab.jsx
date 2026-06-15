import SecuritySettings from '@/features/admin/settings/components/SecuritySettings';
import { usePasswordChangeHandler } from '@/hooks/usePasswordChange';

export default function UserSecurityTab({ embedded = false }) {
  const handleSaveSecurity = usePasswordChangeHandler();

  return (
    <SecuritySettings
      initialSecurity={{
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }}
      onSave={handleSaveSecurity}
      showTwoFactor={false}
      embedded={embedded}
      title="Contraseña y seguridad"
      subtitle="Actualiza tu contraseña de acceso a NovaxClean."
    />
  );
}
