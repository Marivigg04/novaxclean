import { useState } from 'react';
import SettingsSidebar from './SettingsSidebar';
import ProfileSettings from './ProfileSettings';
import SecuritySettings from './SecuritySettings';
import NotificationsSettings from './NotificationsSettings';

export default function SettingsPanel({
  defaultTab = 'perfil',
  profile,
  security,
  notifications,
  onSaveProfile,
  onSaveSecurity,
  onSaveNotifications,
  onUploadPhoto,
  onRemovePhoto,
}) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <SettingsSidebar active={activeTab} onSelect={setActiveTab} />

      <div className="min-w-0 flex-1">
        {activeTab === 'perfil' ? (
          <ProfileSettings
            initialProfile={profile}
            onSave={onSaveProfile}
            onUploadPhoto={onUploadPhoto}
            onRemovePhoto={onRemovePhoto}
          />
        ) : null}

        {activeTab === 'seguridad' ? <SecuritySettings initialSecurity={security} onSave={onSaveSecurity} /> : null}

        {activeTab === 'notificaciones' ? (
          <NotificationsSettings initialNotifications={notifications} onSave={onSaveNotifications} />
        ) : null}
      </div>
    </div>
  );
}
