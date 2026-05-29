import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { footerLinks } from '@/components/landing/content';
import PageHeader from '@/shared/PageHeader';
import ProfileSidebar from '../components/ProfileSidebar';
import UserInfoTab from '../components/UserInfoTab';
import OrdersTab from '../components/OrdersTab';
import AddressesTab from '../components/AddressesTab';
import PaymentMethodsTab from '../components/PaymentMethodsTab';
import PreferencesTab from '../components/PreferencesTab';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('perfil');

  return (
    <div className="min-h-screen bg-[var(--color-base-bg)] text-[var(--color-base-text)] flex flex-col pt-[88px] md:pt-[104px] premium-mesh-bg">
      <Header onOpenAuth={() => {}} onOpenCart={() => {}} showCartButton={true} showSearch={true} />
      
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 py-8 md:px-8">
        <PageHeader title="Ajustes" subtitle="Administra tu cuenta y preferencias personales." />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <ProfileSidebar active={activeTab} onSelect={setActiveTab} />
          
          <div className="min-w-0 flex-1">
            {activeTab === 'perfil' && <UserInfoTab />}
            {activeTab === 'pedidos' && <OrdersTab />}
            {activeTab === 'direcciones' && <AddressesTab />}
            {activeTab === 'pagos' && <PaymentMethodsTab />}
            {activeTab === 'preferencias' && <PreferencesTab />}
          </div>
        </div>
      </main>

      <Footer links={footerLinks} />
    </div>
  );
}
