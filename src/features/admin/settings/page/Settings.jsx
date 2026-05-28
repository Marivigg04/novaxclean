import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { footerLinks } from '@/components/landing/content';
import { useAuth } from '@/context/AuthContext';
import SettingsPanel from '@/features/admin/settings/components/SettingsPanel';
import Sidebar from '@/shared/Sidebar';

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [active, setActive] = useState('ajustes');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const profile = useMemo(
    () => ({
      name: user?.name ?? 'Nova Admin',
      email: 'admin@novaxclean.com',
      bio: 'Administrador del panel de Novaxclean.',
      avatar: user?.avatar ?? 'NX',
    }),
    [user],
  );

  const security = useMemo(
    () => ({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: true,
      sessionProtection: true,
    }),
    [],
  );

  const notifications = useMemo(
    () => ({
      emailAlerts: true,
      pushAlerts: true,
      weeklySummary: false,
      marketingEmails: false,
    }),
    [],
  );

  return (
    <div className="min-h-screen bg-[var(--color-base-bg)] premium-mesh-bg text-[var(--color-base-text)]">
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Cerrar menú lateral"
        />
      )}

      <div className="flex min-h-screen flex-1">
        <Sidebar
          active={active}
          isOpen={isSidebarOpen}
          onSelect={(key) => {
            if (key === 'cerrar-sesion') {
              try {
                window.localStorage.removeItem('isAdmin');
              } catch {
                // ignore
              }
              navigate('/')
              return
            }

            if (key === 'ventas') {
              navigate('/admin')
              return
            }

            if (key === 'ajustes') {
              setActive('ajustes')
              setIsSidebarOpen(false)
              return
            }

            setActive(key)
            setIsSidebarOpen(false)
          }}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            onOpenAuth={() => {}}
            onOpenCart={() => {}}
            showCartButton={false}
            showSearch={false}
            className="md:left-72"
          />

          <main className="flex-1 px-4 py-6 pt-24 md:px-6 md:pl-8">
            <div className="mx-auto w-full max-w-[1280px]">
              <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>
                <p className="mt-1 text-sm text-[var(--color-base-text)]/62">Administra tu cuenta y preferencias.</p>
              </div>

              <SettingsPanel
                defaultTab="perfil"
                profile={profile}
                security={security}
                notifications={notifications}
                onSaveProfile={() => {}}
                onSaveSecurity={() => {}}
                onSaveNotifications={() => {}}
                onUploadPhoto={() => {}}
                onRemovePhoto={() => {}}
              />
            </div>
          </main>

          <Footer links={footerLinks} />
        </div>
      </div>
    </div>
  );
}
