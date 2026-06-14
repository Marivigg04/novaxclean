import { supabase } from './supabase';

export function getPasswordResetRedirectUrl() {
  return `${window.location.origin}/auth/restablecer`;
}

export async function requestPasswordReset(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getPasswordResetRedirectUrl(),
  });

  if (error) throw error;
}

export async function verifyAndChangePassword(email, currentPassword, newPassword) {
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  });

  if (verifyError) {
    throw new Error('La contraseña actual es incorrecta.');
  }

  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) throw updateError;
}

export async function setRecoveredPassword(newPassword) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export function validatePasswordFields({ currentPassword, newPassword, confirmPassword }) {
  if (!currentPassword?.trim()) return 'Debes ingresar tu contraseña actual.';
  if (!newPassword?.trim()) return 'Debes ingresar una nueva contraseña.';
  if (newPassword.length < 8) return 'La nueva contraseña debe tener al menos 8 caracteres.';
  if (newPassword !== confirmPassword) return 'La confirmación no coincide con la nueva contraseña.';
  return null;
}

export function validateNewPasswordFields({ newPassword, confirmPassword }) {
  if (!newPassword?.trim()) return 'Debes ingresar una nueva contraseña.';
  if (newPassword.length < 8) return 'La nueva contraseña debe tener al menos 8 caracteres.';
  if (newPassword !== confirmPassword) return 'Las contraseñas no coinciden.';
  return null;
}
