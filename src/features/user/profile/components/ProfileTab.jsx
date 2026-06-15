import ProfileSection from './ProfileSection';
import UserInfoTab from './UserInfoTab';
import PreferencesTab from './PreferencesTab';
import UserSecurityTab from './UserSecurityTab';

export default function ProfileTab() {
  return (
    <div className="space-y-6">
      <ProfileSection
        id="informacion-personal"
        title="Información personal"
        subtitle="Tus datos principales y foto de perfil."
      >
        <UserInfoTab embedded />
      </ProfileSection>

      <ProfileSection
        id="preferencias"
        title="Preferencias"
        subtitle="Comunicaciones y configuración regional."
      >
        <PreferencesTab embedded />
      </ProfileSection>

      <ProfileSection
        id="seguridad"
        title="Seguridad"
        subtitle="Actualiza tu contraseña de acceso a NovaxClean."
      >
        <UserSecurityTab embedded />
      </ProfileSection>
    </div>
  );
}
