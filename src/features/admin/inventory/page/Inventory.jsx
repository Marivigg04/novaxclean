import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { footerLinks } from '@/components/landing/content';
import Sidebar from '@/shared/Sidebar';
import { useAuth } from '@/context/AuthContext';
import {
  inventoryCategories,
  inventoryProducts as inventoryProductsMock,
  inventoryStats,
  inventoryStatuses,
} from '@/features/admin/inventory/data/mockup';

import InventoryHeader from '@/features/admin/inventory/components/InventoryHeader';
import InventoryStats from '@/features/admin/inventory/components/InventoryStats';
import InventoryTable from '@/features/admin/inventory/components/InventoryTable';
import InventoryAlerts from '@/features/admin/inventory/components/InventoryAlerts';
import DeleteProductModal from '@/features/admin/inventory/components/modal/DeleteProductModal';
import NewProductModal from '@/features/admin/inventory/components/modal/NewProductModal';
import EditProductModal from '@/features/admin/inventory/components/modal/EditProductModal';
import ReportGeneratorModal from '@/features/admin/reports/components/ReportGeneratorModal';
import ReplenishmentModal from '@/features/admin/replenishment/components/ReplenishmentModal';

export default function Inventory() {
  const [active, setActive] = useState('inventario');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [productToEdit, setProductToEdit] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [products, setProducts] = useState(inventoryProductsMock);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('Todos');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReplenishmentOpen, setIsReplenishmentOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || product.category === category;
      const matchesStatus = status === 'Todos' || product.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });

    return filtered.sort((a, b) => {
      return sortOrder === 'asc' ? a.stock - b.stock : b.stock - a.stock;
    });
  }, [products, search, category, status, sortOrder]);

  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
    setAlerts((prev) => [
      {
        id: `add-${newProduct.sku}`,
        type: 'success',
        title: 'Producto agregado',
        message: `${newProduct.name} se agregó correctamente al inventario.`,
      },
      ...prev,
    ]);
  };

  const handleDeleteProduct = (product) => {
    setProducts((prev) => prev.filter((item) => item.sku !== product.sku));
    setProductToDelete(null);
    setAlerts((prev) => [
      {
        id: `delete-${product.sku}`,
        type: 'delete',
        title: 'Producto eliminado',
        message: `${product.name} fue eliminado del inventario.`,
      },
      ...prev,
    ]);
  };

  const handleUpdateProduct = (updated) => {
    setProducts((prev) => prev.map((p) => (p.sku === updated.sku ? updated : p)));
    setProductToEdit(null);
    setAlerts((prev) => [
      {
        id: `edit-${updated.sku}`,
        type: 'edit',
        title: 'Producto actualizado',
        message: `${updated.name} se actualizó correctamente.`,
      },
      ...prev,
    ]);
  };

  const handleReceiveInventory = (updatedItems, lineItems) => {
    setProducts(updatedItems);
    setIsReplenishmentOpen(false);
    setAlerts((prev) => [
      {
        id: `replenish-${Date.now()}`,
        type: 'success',
        title: 'Reabastecimiento completado',
        message: `${lineItems.length} productos se ingresaron al inventario y el stock fue actualizado.`,
      },
      ...prev,
    ]);
  };

  const handleDismissAlert = (alertId) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  };

  useEffect(() => {
    if (!alerts.length) return undefined;

    const timers = alerts.map((alert, index) => {
      const timeout = 4500 + index * 600;
      return window.setTimeout(() => {
        handleDismissAlert(alert.id);
      }, timeout);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [alerts]);

  return (
    <div className="flex min-h-screen bg-[var(--color-base-bg)] premium-mesh-bg">
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Cerrar menú lateral"
        />
      )}

      <Sidebar
        active={active}
        isOpen={isSidebarOpen}
        onSelect={(key) => {
          if (key === 'cerrar-sesion') {
            logout();
            setIsSidebarOpen(false);
            navigate('/');
            return;
          }

          if (key === 'ventas') {
            setIsSidebarOpen(false);
            navigate('/admin');
            return;
          }

          if (key === 'ajustes') {
            setActive('ajustes');
            setIsSidebarOpen(false);
            navigate('/admin/settings');
            return;
          }

          if (key === 'inventario') {
            setActive('inventario');
            setIsSidebarOpen(false);
            navigate('/admin/inventory');
            return;
          }

          if (key === 'materia-prima') {
            setActive('materia-prima');
            setIsSidebarOpen(false);
            navigate('/admin/raw-materials');
            return;
          }

          setActive(key);
          setIsSidebarOpen(false);
        }}
      />

      <main className="flex min-h-screen flex-1 flex-col overflow-auto">
        <Header onOpenAuth={() => {}} onOpenCart={() => {}} showCartButton={false} showSearch={false} className="md:left-72" />

        <div className="flex-1 px-4 py-6 pt-24 md:px-6">
          <div className="mx-auto w-full max-w-[1600px] space-y-6">
            <InventoryAlerts alerts={alerts} onDismiss={handleDismissAlert} />
            <InventoryHeader
              search={search}
              setSearch={setSearch}
              onNew={() => setIsNewModalOpen(true)}
              onReport={() => setIsReportModalOpen(true)}
              onReplenish={() => setIsReplenishmentOpen(true)}
            />

            <InventoryStats stats={inventoryStats} />

            <InventoryTable
              filteredProducts={filteredProducts}
              category={category}
              setCategory={setCategory}
              status={status}
              setStatus={setStatus}
              categories={inventoryCategories}
              statuses={inventoryStatuses}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              onDeleteRequest={setProductToDelete}
              onEditRequest={setProductToEdit}
            />

            <NewProductModal
              isOpen={isNewModalOpen}
              onClose={() => setIsNewModalOpen(false)}
              onSubmit={handleAddProduct}
              categories={inventoryCategories}
            />

            <DeleteProductModal
              isOpen={Boolean(productToDelete)}
              product={productToDelete}
              onClose={() => setProductToDelete(null)}
              onConfirm={handleDeleteProduct}
            />

            <EditProductModal
              isOpen={Boolean(productToEdit)}
              product={productToEdit}
              onClose={() => setProductToEdit(null)}
              onSubmit={handleUpdateProduct}
            />

            <ReportGeneratorModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} preset="inventory" />

            <ReplenishmentModal
              isOpen={isReplenishmentOpen}
              onClose={() => setIsReplenishmentOpen(false)}
              context="inventory"
              items={products}
              onReceiveStock={handleReceiveInventory}
            />
          </div>
        </div>

        <Footer links={footerLinks} />
      </main>
    </div>
  );
}