import { useAuth } from '@/context/AuthContext';
import { showCustomToast } from '@/shared/customToast';
import { validatePasswordFields } from '@/lib/password';

export function usePasswordChangeHandler() {
  const { user, changePassword } = useAuth();

  return async (securityData) => {
    const validationError = validatePasswordFields(securityData);
    if (validationError) {
      showCustomToast.error(validationError);
      return false;
    }

    try {
      await changePassword(securityData.currentPassword, securityData.newPassword);
      showCustomToast.success('Contraseña actualizada correctamente.');
      return true;
    } catch (error) {
      showCustomToast.error(error.message || 'No se pudo actualizar la contraseña.');
      return false;
    }
  };
}
