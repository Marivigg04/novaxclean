import { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, PackageCheck, TriangleAlert, ArchiveX } from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { footerLinks } from '@/components/landing/content';
import Sidebar from '@/shared/Sidebar';
import { useAuth } from '@/context/AuthContext';

import { inventoryStatuses } from '@/features/admin/inventory/data/mockup';
import {
  fetchProducts,
  fetchCategories,
  fetchBadges,
  insertProduct,
  updateProduct,
  deleteProduct,
} from '@/features/admin/inventory/data/inventoryService';

import InventoryHeader from '@/features/admin/inventory/components/InventoryHeader';
import InventoryStats from '@/features/admin/inventory/components/InventoryStats';
import InventoryTable from '@/features/admin/inventory/components/InventoryTable';
import { showInventoryToast } from '@/features/admin/inventory/components/toastService';
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

  // ── Data from Supabase ─────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [badges, setBadges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── Filters & sorting ──────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('Todos');
  const [sortField, setSortField] = useState('stock');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReplenishmentOpen, setIsReplenishmentOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();
  const { logout } = useAuth();

  // ── Initial data load from Supabase ────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [productsData, categoriesData, badgesData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchBadges(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setBadges(badgesData);
    } catch (err) {
      console.error('Error loading inventory data:', err);
      showInventoryToast({
        type: 'delete',
        title: 'Error de carga',
        message: 'No se pudieron cargar los datos del inventario.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Dynamic stats computed from real data ──────────────────────────────
  const computedStats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.status === 'En stock').length;
    const lowStock = products.filter((p) => p.status === 'Stock bajo').length;
    const outOfStock = products.filter((p) => p.status === 'Agotado').length;

    return [
      { title: 'Productos', value: String(total), description: 'Total de referencias activas', icon: Boxes },
      { title: 'En stock', value: String(inStock), description: 'Unidades con disponibilidad alta', icon: PackageCheck },
      { title: 'Stock bajo', value: String(lowStock), description: 'Productos para reponer pronto', icon: TriangleAlert },
      { title: 'Agotados', value: String(outOfStock), description: 'Sin inventario disponible', icon: ArchiveX },
    ];
  }, [products]);

  // ── Category filter options built from DB data ─────────────────────────
  const categoryFilterOptions = useMemo(
    () => ['Todos', ...categories.map((c) => c.name)],
    [categories],
  );

  // ── Filtering ──────────────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || category === 'Todos' || product.category_name === category;
      const matchesStatus = status === 'Todos' || product.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, category, status]);

  // ── Sorting ────────────────────────────────────────────────────────────
  const sortedProducts = useMemo(() => {
    const direction = sortDirection === 'asc' ? 1 : -1;

    return [...filteredProducts].sort((a, b) => {
      const left = a[sortField];
      const right = b[sortField];

      if (typeof left === 'number' && typeof right === 'number') {
        return (left - right) * direction;
      }

      return String(left ?? '').localeCompare(String(right ?? ''), 'es', { sensitivity: 'base' }) * direction;
    });
  }, [filteredProducts, sortDirection, sortField]);

  // ── Pagination ─────────────────────────────────────────────────────────
  const pageCount = useMemo(() => {
    return Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  }, [sortedProducts]);

  useEffect(() => {
    setPage(1);
  }, [search, category, status, sortField, sortDirection]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [pageCount, page]);

  const visibleProducts = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedProducts.slice(startIndex, startIndex + pageSize);
  }, [page, sortedProducts]);

  // ── CRUD Handlers (Supabase) ───────────────────────────────────────────
  const handleAddProduct = async (productData) => {
    await insertProduct(productData);
    const freshProducts = await fetchProducts();
    setProducts(freshProducts);
    showInventoryToast({
      type: 'success',
      title: 'Producto agregado',
      message: `${productData.name} se agregó correctamente al inventario.`,
    });
  };

  const handleDeleteProduct = async (product) => {
    try {
      await deleteProduct(product.id);
      setProducts((prev) => prev.filter((item) => item.id !== product.id));
      setProductToDelete(null);
      showInventoryToast({
        type: 'delete',
        title: 'Producto eliminado',
        message: `${product.name} fue eliminado del inventario.`,
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      showInventoryToast({
        type: 'delete',
        title: 'Error',
        message: `No se pudo eliminar ${product.name}.`,
      });
    }
  };

  const handleUpdateProduct = async (updated) => {
    try {
      await updateProduct(updated.id, {
        sku: updated.sku,
        name: updated.name,
        category_id: updated.category_id,
        description: updated.description,
        price: updated.price,
        stock: updated.stock,
        minimum_stock: updated.minimum_stock,
        badge_id: updated.badge_id,
        image_url: updated.image_url,
      });
      // Refresh from DB to get joined names
      const freshProducts = await fetchProducts();
      setProducts(freshProducts);
      setProductToEdit(null);
      showInventoryToast({
        type: 'edit',
        title: 'Producto actualizado',
        message: `${updated.name} se actualizó correctamente.`,
      });
    } catch (err) {
      console.error('Error updating product:', err);
      showInventoryToast({
        type: 'delete',
        title: 'Error',
        message: `No se pudo actualizar ${updated.name}.`,
      });
    }
  };

  const handleReceiveInventory = (updatedItems, lineItems) => {
    setProducts(updatedItems);
    setIsReplenishmentOpen(false);
    showInventoryToast({
      type: 'success',
      title: 'Reabastecimiento completado',
      message: `${lineItems.length} productos se ingresaron al inventario y el stock fue actualizado.`,
    });
  };

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
        <Header onOpenAuth={() => {}} onOpenCart={() => {}} onToggleSidebar={() => setIsSidebarOpen(true)} showCartButton={false} showSearch={false} className="md:left-72" />

        <div className="flex-1 px-4 py-6 pt-24 md:px-6">
          <div className="mx-auto w-full max-w-[1600px] space-y-6">
            <InventoryHeader
              search={search}
              setSearch={setSearch}
              onNew={() => setIsNewModalOpen(true)}
              onReport={() => setIsReportModalOpen(true)}
              onReplenish={() => setIsReplenishmentOpen(true)}
            />

            <InventoryStats stats={computedStats} />

            {isLoading ? (
              <div className="flex items-center justify-center rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 rounded-full border-4 border-[var(--color-app-panel-border)] border-t-[var(--color-brand)] animate-spin" />
                  <span className="text-sm text-[var(--color-base-text)]/55">Cargando inventario…</span>
                </div>
              </div>
            ) : (
              <InventoryTable
                filteredProducts={visibleProducts}
                page={page}
                pageCount={pageCount}
                onPageChange={setPage}
                category={category}
                setCategory={setCategory}
                status={status}
                setStatus={setStatus}
                categories={categoryFilterOptions}
                statuses={inventoryStatuses}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={setSortField}
                onSortDirectionChange={setSortDirection}
                onDeleteRequest={setProductToDelete}
                onEditRequest={setProductToEdit}
              />
            )}

            <NewProductModal
              isOpen={isNewModalOpen}
              onClose={() => setIsNewModalOpen(false)}
              onSubmit={handleAddProduct}
              categories={categories}
              badges={badges}
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
              categories={categories}
              badges={badges}
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