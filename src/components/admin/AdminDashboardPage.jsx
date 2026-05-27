import AdminSidebar from './AdminSidebar';
import AdminTopBar from './AdminTopBar';
import AdminStatsGrid from './AdminStatsGrid';
import SalesChart from './SalesChart';
import ShippingTable from './ShippingTable';
import InventoryMetrics from './InventoryMetrics';
import LocationCard from './LocationCard';
import AlertCard from './AlertCard';
import AdminFooter from './AdminFooter';
import FloatingActionButton from './FloatingActionButton';

export default function AdminDashboardPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background text-on-surface">
      <AdminSidebar />
      <main className="relative flex min-h-screen flex-1 flex-col md:ml-64">
        <AdminTopBar />
        <div className="flex-1 px-4 py-6 md:px-16 md:py-10">
          <section className="mb-10">
            <h2 className="text-headline-lg font-bold text-primary">Vista General del Negocio</h2>
            <p className="mt-2 max-w-2xl text-body-md text-on-surface-variant">
              Bienvenido de nuevo. Aquí tienes las métricas clave de NovaxClean para hoy. El rendimiento del inventario ha subido un 12% desde la última semana.
            </p>
          </section>

          <AdminStatsGrid />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              <SalesChart />
              <ShippingTable />
            </div>

            <div className="space-y-8">
              <InventoryMetrics />
              <LocationCard />
              <AlertCard />
            </div>
          </div>
        </div>
        <AdminFooter />
      </main>
      <FloatingActionButton />
    </div>
  );
}
