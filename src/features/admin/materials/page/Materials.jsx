import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Boxes, CircleDollarSign, Truck } from 'lucide-react';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/shared/Sidebar';
import PageHeader from '@/shared/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { footerLinks } from '@/components/landing/content';
import { showInventoryToast } from '@/features/admin/inventory/components/toastService';

import MaterialsHeader from '../components/MaterialsHeader';
import MaterialsStats from '../components/MaterialsStats';
import MaterialsTable from '../components/MaterialsTable';
import MaterialsFilters from '../components/MaterialsFilters';
import MaterialsEntryModal from '../components/MaterialsEntryModal';
import MaterialsDeleteModal from '../components/MaterialsDeleteModal';
import ReportGeneratorModal from '@/features/admin/reports/components/ReportGeneratorModal';
import ReplenishmentModal from '@/features/admin/replenishment/components/ReplenishmentModal';

import {
  fetchRawMaterials,
  fetchCategories,
  fetchSuppliers,
  insertRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
} from '../data/rawMaterialsService';

import {
  fetchFormulas,
  fetchProductsForFormulas,
  saveFormula,
  deleteFormula as deleteFormulaService,
} from '../data/formulasService';

import {
  formulaStatuses,
  materialStatuses,
} from '../data/mockup';

const pageSize = 6;

export default function Materials() {
  const [active, setActive] = useState('materia-prima');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState('insumos');
  const [entryType, setEntryType] = useState('material');
  const [page, setPage] = useState(1);
  const [materialCategory, setMaterialCategory] = useState('Todos');
  const [materialStatus, setMaterialStatus] = useState('Todos');
  const [materialSortField, setMaterialSortField] = useState('stock');
  const [materialSortDirection, setMaterialSortDirection] = useState('desc');
  const [formulaCategory, setFormulaCategory] = useState('Todos');
  const [formulaStatus, setFormulaStatus] = useState('Todos');
  const [formulaSortField, setFormulaSortField] = useState('estimatedCost');
  const [formulaSortDirection, setFormulaSortDirection] = useState('desc');

  // ── Data from Supabase ─────────────────────────────────────────────────
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isReplenishmentOpen, setIsReplenishmentOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // ── Initial data load from Supabase ────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      const [materialsData, categoriesData, suppliersData, formulasData, productsData] = await Promise.all([
        fetchRawMaterials(),
        fetchCategories(),
        fetchSuppliers(),
        fetchFormulas(),
        fetchProductsForFormulas(),
      ]);
      setMaterials(materialsData);
      setCategories(categoriesData);
      setSuppliers(suppliersData);
      setFormulas(formulasData);
      setProducts(productsData);
    } catch (err) {
      console.error('Error loading materials/formulas data:', err);
      showInventoryToast({
        type: 'delete',
        title: 'Error de carga',
        message: 'No se pudieron cargar los datos.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Dynamic stats ──────────────────────────────────────────────────────
  const computedStats = useMemo(() => {
    const total = materials.length;
    const totalValue = materials.reduce((sum, m) => sum + m.stock * m.unit_cost, 0);
    const alerts = materials.filter((m) => m.status !== 'En stock').length;
    const uniqueSuppliers = new Set(materials.map((m) => m.supplier_name).filter((n) => n !== 'Sin proveedor')).size;

    return [
      { title: 'Total Insumos', value: `${total} referencias`, description: 'Referencias activas en catálogo interno', icon: Boxes },
      { title: 'Valor del Almacén', value: `$${new Intl.NumberFormat('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(totalValue)} US$`, description: 'Costo estimado del stock de materia prima', icon: CircleDollarSign },
      { title: 'Alertas de Reorden', value: `${alerts} insumos`, description: 'Insumos con stock crítico o por debajo del mínimo', icon: AlertTriangle, badge: alerts > 0 ? 'Alerta' : undefined },
      { title: 'Proveedores', value: `${uniqueSuppliers} proveedores`, description: 'Red de abastecimiento registrada', icon: Truck },
    ];
  }, [materials]);

  // ── Categories for filters ─────────────────────────────────────────────
  const materialCategoryOptions = useMemo(
    () => ['Todos', ...categories.map((c) => c.name)],
    [categories],
  );

  const formulaCategoryOptions = useMemo(
    () => {
      // Get unique category names from loaded formulas
      const cats = Array.from(new Set(formulas.map(f => f.category_name).filter(Boolean)));
      return ['Todos', ...cats.sort()];
    },
    [formulas],
  );

  // ── Reset filters on view switch ───────────────────────────────────────
  useEffect(() => {
    setMaterialCategory('Todos');
    setMaterialStatus('Todos');
    setMaterialSortField('stock');
    setMaterialSortDirection('desc');
    setFormulaCategory('Todos');
    setFormulaStatus('Todos');
    setFormulaSortField('estimatedCost');
    setFormulaSortDirection('desc');
    setPage(1);
  }, [activeView]);

  useEffect(() => {
    setPage(1);
  }, [search, materialCategory, materialStatus, materialSortField, materialSortDirection, formulaCategory, formulaStatus, formulaSortField, formulaSortDirection]);

  // ── Materials filtering & sorting ──────────────────────────────────────
  const filteredMaterials = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return materials.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(normalizedSearch) || item.sku.toLowerCase().includes(normalizedSearch);
      const matchesCategory = materialCategory === 'Todos' || item.category_name === materialCategory;
      const matchesStatus = materialStatus === 'Todos' || item.status === materialStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [materialCategory, materialStatus, materials, search]);

  const sortedMaterials = useMemo(() => {
    const direction = materialSortDirection === 'asc' ? 1 : -1;

    return [...filteredMaterials].sort((a, b) => {
      const left = a[materialSortField];
      const right = b[materialSortField];

      if (typeof left === 'number' && typeof right === 'number') {
        return (left - right) * direction;
      }

      return String(left ?? '').localeCompare(String(right ?? ''), 'es', { sensitivity: 'base' }) * direction;
    });
  }, [filteredMaterials, materialSortDirection, materialSortField]);

  const visibleMaterials = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedMaterials.slice(startIndex, startIndex + pageSize);
  }, [page, sortedMaterials]);

  const materialPageCount = Math.max(1, Math.ceil(sortedMaterials.length / pageSize));

  // ── Formulas filtering & sorting (unchanged — still mock) ──────────────
  const filteredFormulas = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return formulas.filter((item) => {
      const matchesSearch = item.product_name.toLowerCase().includes(normalizedSearch) || item.sku.toLowerCase().includes(normalizedSearch);
      const matchesCategory = formulaCategory === 'Todos' || item.category_name === formulaCategory;
      const matchesStatus = formulaStatus === 'Todos' || item.status === formulaStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [formulaCategory, formulaStatus, formulas, search]);

  const sortedFormulas = useMemo(() => {
    const direction = formulaSortDirection === 'asc' ? 1 : -1;

    return [...filteredFormulas].sort((a, b) => {
      const left = a[formulaSortField];
      const right = b[formulaSortField];

      if (typeof left === 'number' && typeof right === 'number') {
        return (left - right) * direction;
      }

      return String(left ?? '').localeCompare(String(right ?? ''), 'es', { sensitivity: 'base' }) * direction;
    });
  }, [filteredFormulas, formulaSortDirection, formulaSortField]);

  const visibleFormulas = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedFormulas.slice(startIndex, startIndex + pageSize);
  }, [page, sortedFormulas]);

  const formulaPageCount = Math.max(1, Math.ceil(sortedFormulas.length / pageSize));

  // ── Current view bindings ──────────────────────────────────────────────
  const currentCategories = activeView === 'formulas' ? formulaCategoryOptions : materialCategoryOptions;
  const currentStatuses = activeView === 'formulas' ? formulaStatuses : materialStatuses;
  const currentCategory = activeView === 'formulas' ? formulaCategory : materialCategory;
  const currentStatus = activeView === 'formulas' ? formulaStatus : materialStatus;
  const currentSortField = activeView === 'formulas' ? formulaSortField : materialSortField;
  const currentSortDirection = activeView === 'formulas' ? formulaSortDirection : materialSortDirection;
  const currentPageCount = activeView === 'formulas' ? formulaPageCount : materialPageCount;
  const currentRows = activeView === 'formulas' ? visibleFormulas : visibleMaterials;
  const modalType = editingEntry?.type ?? entryType;

  useEffect(() => {
    if (page > currentPageCount) {
      setPage(currentPageCount);
    }
  }, [currentPageCount, page]);

  // ── CRUD Handlers (Supabase) ─────────────────────────────────────────
  const handleCreateEntry = async (newEntry) => {
    if (entryType === 'formula') {
      try {
        await saveFormula(newEntry, newEntry.ingredients);
        const freshFormulas = await fetchFormulas();
        setFormulas(freshFormulas);
        showInventoryToast({
          type: 'success',
          title: 'Fórmula agregada',
          message: `La fórmula ${newEntry.sku} se agregó correctamente.`,
        });
        setIsEntryModalOpen(false);
      } catch (err) {
        console.error('Error creating formula:', err);
        throw err;
      }
      return;
    }

    // Material — Supabase insert
    await insertRawMaterial({
      sku: newEntry.sku,
      name: newEntry.name,
      category_id: newEntry.category_id,
      stock: newEntry.stock,
      minimum_stock: newEntry.minimum_stock,
      unit: newEntry.unit,
      unit_cost: newEntry.unit_cost,
      supplier_id: newEntry.supplier_id,
    });

    const freshMaterials = await fetchRawMaterials();
    setMaterials(freshMaterials);
    showInventoryToast({
      type: 'success',
      title: 'Insumo agregado',
      message: `${newEntry.name} se agregó correctamente.`,
    });
    setIsEntryModalOpen(false);
  };

  const handleUpdateEntry = async (updatedEntry) => {
    if (editingEntry?.type === 'formula') {
      try {
        await saveFormula(updatedEntry, updatedEntry.ingredients);
        const freshFormulas = await fetchFormulas();
        setFormulas(freshFormulas);
        showInventoryToast({
          type: 'edit',
          title: 'Fórmula actualizada',
          message: `La fórmula ${updatedEntry.sku} se actualizó correctamente.`,
        });
        setEditingEntry(null);
      } catch (err) {
        console.error('Error updating formula:', err);
        throw err;
      }
      return;
    }

    // Material — Supabase update
    await updateRawMaterial(updatedEntry.id, {
      sku: updatedEntry.sku,
      name: updatedEntry.name,
      category_id: updatedEntry.category_id,
      stock: updatedEntry.stock,
      minimum_stock: updatedEntry.minimum_stock,
      unit: updatedEntry.unit,
      unit_cost: updatedEntry.unit_cost,
      supplier_id: updatedEntry.supplier_id,
    });

    const freshMaterials = await fetchRawMaterials();
    setMaterials(freshMaterials);
    showInventoryToast({
      type: 'edit',
      title: 'Insumo actualizado',
      message: `${updatedEntry.name} se actualizó correctamente.`,
    });
    setEditingEntry(null);
  };

  const handleDeleteEntry = async (entry) => {
    if (deletingEntry?.type === 'formula') {
      try {
        await deleteFormulaService(entry.id);
        setFormulas((prev) => prev.filter((item) => item.id !== entry.id));
        showInventoryToast({
          type: 'delete',
          title: 'Fórmula eliminada',
          message: `La fórmula ${entry.sku} fue eliminada correctamente.`,
        });
      } catch (err) {
        console.error('Error deleting formula:', err);
        showInventoryToast({
          type: 'delete',
          title: 'Error',
          message: `No se pudo eliminar la fórmula ${entry.sku}.`,
        });
      }
      setDeletingEntry(null);
      return;
    }

    try {
      await deleteRawMaterial(entry.id);
      setMaterials((prev) => prev.filter((item) => item.id !== entry.id));
      showInventoryToast({
        type: 'delete',
        title: 'Insumo eliminado',
        message: `${entry.name} fue eliminado correctamente.`,
      });
    } catch (err) {
      console.error('Error deleting material:', err);
      showInventoryToast({
        type: 'delete',
        title: 'Error',
        message: `No se pudo eliminar ${entry.name}.`,
      });
    }

    setDeletingEntry(null);
  };

  const handleReceiveMaterials = (updatedItems, lineItems) => {
    setMaterials(updatedItems);
    setIsReplenishmentOpen(false);
    showInventoryToast({
      type: 'success',
      title: 'Reabastecimiento completado',
      message: `${lineItems.length} insumos se ingresaron a materia prima y el stock fue actualizado.`,
    });
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-base-bg)] premium-mesh-bg">
      {isSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Cerrar menú lateral"
        />
      ) : null}

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

          if (key === 'ajustes') {
            setActive('ajustes');
            setIsSidebarOpen(false);
            navigate('/admin/settings');
            return;
          }

          setActive(key);
          setIsSidebarOpen(false);
        }}
      />

      <main className="flex min-h-screen flex-1 flex-col overflow-auto">
        <Header
          onOpenAuth={() => {}}
          onOpenCart={() => {}}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          showCartButton={false}
          showSearch={false}
          showNavigationLinks={false}
          className="md:left-72"
        />

        <div className="flex-1 px-4 py-6 pt-24 md:px-6">
          <div className="mx-auto w-full max-w-[1600px] space-y-6">
            <PageHeader title="Materia Prima" subtitle="Control de insumos, fórmulas y alertas de reorden." className="mb-4">

              <MaterialsHeader
                search={search}
                setSearch={setSearch}
                activeView={activeView}
                setActiveView={setActiveView}
                onNew={() => {
                  setEntryType(activeView === 'formulas' ? 'formula' : 'material');
                  setIsEntryModalOpen(true);
                }}
                onReport={() => setIsReportModalOpen(true)}
                onReplenish={() => setIsReplenishmentOpen(true)}
              />
            </PageHeader>

            <MaterialsStats stats={computedStats} />

            <MaterialsFilters
              category={currentCategory}
              setCategory={activeView === 'formulas' ? setFormulaCategory : setMaterialCategory}
              status={currentStatus}
              setStatus={activeView === 'formulas' ? setFormulaStatus : setMaterialStatus}
              categories={currentCategories}
              statuses={currentStatuses}
            />

            {activeView === 'formulas' ? (
              <div className="rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-4 py-3 text-sm text-[var(--color-base-text)]/68 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:px-6">
                Las fórmulas muestran el desglose de materia prima consumida por cada lote producido.
              </div>
            ) : null}

            {isLoading ? (
              <div className="flex items-center justify-center rounded-3xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] p-16">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 rounded-full border-4 border-[var(--color-app-panel-border)] border-t-[var(--color-brand)] animate-spin" />
                  <span className="text-sm text-[var(--color-base-text)]/55">Cargando {activeView}…</span>
                </div>
              </div>
            ) : (
              <MaterialsTable
                activeView={activeView}
                filteredRows={currentRows}
                page={page}
                pageCount={currentPageCount}
                onPageChange={setPage}
                sortField={currentSortField}
                sortDirection={currentSortDirection}
                onSortChange={activeView === 'formulas' ? setFormulaSortField : setMaterialSortField}
                onSortDirectionChange={activeView === 'formulas' ? setFormulaSortDirection : setMaterialSortDirection}
                onEditRequest={(item) => setEditingEntry({ type: activeView === 'formulas' ? 'formula' : 'material', item })}
                onDeleteRequest={(item) => setDeletingEntry({ type: activeView === 'formulas' ? 'formula' : 'material', item })}
              />
            )}
          </div>
        </div>

        <Footer links={footerLinks} />
      </main>

      <MaterialsEntryModal
        isOpen={isEntryModalOpen || Boolean(editingEntry)}
        type={modalType}
        mode={editingEntry ? 'edit' : 'create'}
        item={editingEntry?.item ?? null}
        categories={categories}
        suppliers={suppliers}
        statuses={(modalType === 'formula' ? formulaStatuses : materialStatuses).filter((item) => item !== 'Todos')}
        materialOptions={materials}
        productOptions={products}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
      />

      <MaterialsDeleteModal
        isOpen={Boolean(deletingEntry)}
        item={deletingEntry?.item ?? null}
        title={deletingEntry?.type === 'formula' ? 'Eliminar fórmula' : 'Eliminar insumo'}
        description={deletingEntry?.type === 'formula' ? 'Esta fórmula dejará de aparecer en el listado de producción.' : 'Este insumo dejará de aparecer en el inventario de materia prima.'}
        onClose={() => setDeletingEntry(null)}
        onConfirm={handleDeleteEntry}
      />

      <ReportGeneratorModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} preset="materials" />

      <ReplenishmentModal
        isOpen={isReplenishmentOpen}
        onClose={() => setIsReplenishmentOpen(false)}
        context="materials"
        items={materials}
        onReceiveStock={handleReceiveMaterials}
      />
    </div>
  );
}