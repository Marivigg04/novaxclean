import { useState } from 'react';
import { CalendarCheck2, CreditCard, Package, UserRound } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { footerLinks } from '@/components/landing/content';
import PageHeader from '@/shared/PageHeader';
import Card from '@/features/admin/dashboard/components/Card';
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
      <Header
        onOpenAuth={() => {}}
        onOpenCart={() => {}}
        showCartButton={true}
        showSearch={false}
        showThemeToggle={false}
        showBrand={false}
        showNavigationLinks={false}
        className="md:left-72"
      />
      
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-8 md:py-6 md:pl-80">
        <PageHeader title="Panel de usuario" subtitle="Administra tu cuenta, pedidos y preferencias personales." />

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card title="Pedidos" value="03" description="Activos ahora" icon={Package} trend={4.5} />
          <Card title="Entregas" value="18" description="Completadas este mes" icon={CalendarCheck2} trend={8.1} />
          <Card title="Pagos" value="02" description="Métodos guardados" icon={CreditCard} trend={2.4} />
          <Card title="Perfil" value="100%" description="Datos completos" icon={UserRound} trend={6.2} />
        </div>

        <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:items-start">
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

      <div className="md:pl-72">
        <Footer links={footerLinks} />
      </div>
    </div>
  );
}
