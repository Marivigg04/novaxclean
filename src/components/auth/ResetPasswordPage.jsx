import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { setRecoveredPassword, validateNewPasswordFields } from '@/lib/password';
import { showCustomToast } from '@/shared/customToast';
import ResetPasswordForm from './ResetPasswordForm';

function hasRecoveryHash() {
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return hashParams.get('type') === 'recovery';
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  useEffect(() => {
    let mounted = true;
    let timeoutId;
    const recoveryHash = hasRecoveryHash();

    const finishCheck = (isValid) => {
      if (!mounted) return;
      setHasRecoverySession(isValid);
      setCheckingSession(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted || !session) return;

      if (event === 'PASSWORD_RECOVERY') {
        finishCheck(true);
        return;
      }

      if (recoveryHash && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        finishCheck(true);
      }
    });

    const verifyRecoverySession = async () => {
      if (!recoveryHash) {
        finishCheck(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;

      if (session) {
        finishCheck(true);
        return;
      }

      // Supabase puede procesar el hash del correo de forma asíncrona.
      timeoutId = window.setTimeout(() => {
        if (mounted) finishCheck(false);
      }, 3000);
    };

    verifyRecoverySession();

    return () => {
      mounted = false;
      if (timeoutId) window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async ({ newPassword, confirmPassword }) => {
    const validationError = validateNewPasswordFields({ newPassword, confirmPassword });
    if (validationError) {
      showCustomToast.error(validationError);
      return;
    }

    setLoading(true);
    const toastId = showCustomToast.loading('Actualizando contraseña...');

    try {
      await setRecoveredPassword(newPassword);
      toast.dismiss(toastId);
      showCustomToast.success('Contraseña restablecida. Ya puedes iniciar sesión.');
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      toast.dismiss(toastId);
      showCustomToast.error(error.message || 'No se pudo restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-on-surface">
        <p className="text-sm font-semibold text-outline">Verificando enlace…</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 text-on-surface">
      <main className="w-full max-w-[520px] overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl sm:p-10">
        <ResetPasswordForm
          loading={loading}
          invalidLink={!hasRecoverySession}
          onSubmit={handleSubmit}
          onBackToLogin={() => navigate('/auth')}
        />
      </main>
    </div>
  );
}
