import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/shared/Sidebar';
import PageHeader from '@/shared/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { footerLinks } from '@/components/landing/content';
import InventoryAlerts from '@/features/admin/inventory/components/InventoryAlerts';

import MaterialsHeader from '../components/MaterialsHeader';
import MaterialsStats from '../components/MaterialsStats';
import MaterialsTable from '../components/MaterialsTable';
import MaterialsFilters from '../components/MaterialsFilters';
import MaterialsEntryModal from '../components/MaterialsEntryModal';
import MaterialsDeleteModal from '../components/MaterialsDeleteModal';
import ReportGeneratorModal from '@/features/admin/reports/components/ReportGeneratorModal';
import {
  formulaCategories,
  formulaStatuses,
  materialCategories,
  materialRows,
  materialStats,
  materialStatuses,
  productionFormulas,
} from '../data/mockup';

const pageSize = 6;

export default function Materials() {
  const [active, setActive] = useState('materia-prima');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeView, setActiveView] = useState('insumos');
  const [page, setPage] = useState(1);
  const [materialCategory, setMaterialCategory] = useState('Todos');
  const [materialStatus, setMaterialStatus] = useState('Todos');
  const [materialSortOrder, setMaterialSortOrder] = useState('desc');
  const [formulaCategory, setFormulaCategory] = useState('Todos');
  const [formulaStatus, setFormulaStatus] = useState('Todos');
  const [formulaSortOrder, setFormulaSortOrder] = useState('desc');
  const [materials, setMaterials] = useState(materialRows);
  const [formulas, setFormulas] = useState(productionFormulas);
  const [alerts, setAlerts] = useState([]);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [deletingEntry, setDeletingEntry] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMaterialCategory('Todos');
    setMaterialStatus('Todos');
    setMaterialSortOrder('desc');
    setFormulaCategory('Todos');
    setFormulaStatus('Todos');
    setFormulaSortOrder('desc');
    setPage(1);
  }, [activeView]);

  useEffect(() => {
    setPage(1);
  }, [search, materialCategory, materialStatus, materialSortOrder, formulaCategory, formulaStatus, formulaSortOrder]);

  const dismissAlert = (alertId) => {
    setAlerts((current) => current.filter((alert) => alert.id !== alertId));
  };

  useEffect(() => {
    if (!alerts.length) return undefined;

    const timers = alerts.map((alert, index) => {
      const timeout = 4500 + index * 600;
      return window.setTimeout(() => dismissAlert(alert.id), timeout);
    });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [alerts]);

  const filteredMaterials = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return materials.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(normalizedSearch) || item.sku.toLowerCase().includes(normalizedSearch);
      const matchesCategory = materialCategory === 'Todos' || item.category === materialCategory;
      const matchesStatus = materialStatus === 'Todos' || item.status === materialStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [materialCategory, materialStatus, materials, search]);

  const sortedMaterials = useMemo(() => {
    return [...filteredMaterials].sort((a, b) => (materialSortOrder === 'asc' ? a.stock - b.stock : b.stock - a.stock));
  }, [filteredMaterials, materialSortOrder]);

  const visibleMaterials = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedMaterials.slice(startIndex, startIndex + pageSize);
  }, [page, sortedMaterials]);

  const materialPageCount = Math.max(1, Math.ceil(sortedMaterials.length / pageSize));

  const filteredFormulas = useMemo(() => {
    const normalizedSearch = search.toLowerCase();

    return formulas.filter((item) => {
      const matchesSearch = item.product.toLowerCase().includes(normalizedSearch) || item.sku.toLowerCase().includes(normalizedSearch);
      const matchesCategory = formulaCategory === 'Todos' || item.category === formulaCategory;
      const matchesStatus = formulaStatus === 'Todos' || item.status === formulaStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [formulaCategory, formulaStatus, formulas, search]);

  const sortedFormulas = useMemo(() => {
    return [...filteredFormulas].sort((a, b) => (formulaSortOrder === 'asc' ? a.estimatedCost - b.estimatedCost : b.estimatedCost - a.estimatedCost));
  }, [filteredFormulas, formulaSortOrder]);

  const visibleFormulas = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return sortedFormulas.slice(startIndex, startIndex + pageSize);
  }, [page, sortedFormulas]);

  const formulaPageCount = Math.max(1, Math.ceil(sortedFormulas.length / pageSize));

  const currentCategories = activeView === 'formulas' ? formulaCategories : materialCategories;
  const currentStatuses = activeView === 'formulas' ? formulaStatuses : materialStatuses;
  const currentCategory = activeView === 'formulas' ? formulaCategory : materialCategory;
  const currentStatus = activeView === 'formulas' ? formulaStatus : materialStatus;
  const currentSortOrder = activeView === 'formulas' ? formulaSortOrder : materialSortOrder;
  const currentSortLabel = activeView === 'formulas' ? 'Costo' : 'Stock';
  const currentPageCount = activeView === 'formulas' ? formulaPageCount : materialPageCount;
  const currentRows = activeView === 'formulas' ? visibleFormulas : visibleMaterials;

  useEffect(() => {
    if (page > currentPageCount) {
      setPage(currentPageCount);
    }
  }, [currentPageCount, page]);

  const handleAddMaterial = (newMaterial) => {
    setMaterials((current) => [newMaterial, ...current]);
    setAlerts((current) => [
      { id: `add-${newMaterial.sku}`, type: 'success', title: 'Insumo agregado', message: `${newMaterial.name} se agregó correctamente.` },
      ...current,
    ]);
    setIsEntryModalOpen(false);
  };

  const handleUpdateEntry = (updatedEntry) => {
    if (editingEntry?.type === 'formula') {
      setFormulas((current) => current.map((item) => (item.sku === updatedEntry.sku ? updatedEntry : item)));
      setAlerts((current) => [
        { id: `edit-${updatedEntry.sku}`, type: 'edit', title: 'Fórmula actualizada', message: `${updatedEntry.product} se actualizó correctamente.` },
        ...current,
      ]);
    } else {
      setMaterials((current) => current.map((item) => (item.sku === updatedEntry.sku ? updatedEntry : item)));
      setAlerts((current) => [
        { id: `edit-${updatedEntry.sku}`, type: 'edit', title: 'Insumo actualizado', message: `${updatedEntry.name} se actualizó correctamente.` },
        ...current,
      ]);
    }

    setEditingEntry(null);
  };

  const handleDeleteEntry = (entry) => {
    if (deletingEntry?.type === 'formula') {
      setFormulas((current) => current.filter((item) => item.sku !== entry.sku));
      setAlerts((current) => [
        { id: `delete-${entry.sku}`, type: 'delete', title: 'Fórmula eliminada', message: `${entry.product} fue eliminada correctamente.` },
        ...current,
      ]);
    } else {
      setMaterials((current) => current.filter((item) => item.sku !== entry.sku));
      setAlerts((current) => [
        { id: `delete-${entry.sku}`, type: 'delete', title: 'Insumo eliminado', message: `${entry.name} fue eliminado correctamente.` },
        ...current,
      ]);
    }

    setDeletingEntry(null);
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
          showCartButton={false}
          showSearch={false}
          showNavigationLinks={false}
          className="md:left-72"
        />

        <div className="flex-1 px-4 py-6 pt-24 md:px-6">
          <div className="mx-auto w-full max-w-[1600px] space-y-6">
            <InventoryAlerts alerts={alerts} onDismiss={dismissAlert} />

            <PageHeader title="Materia Prima" subtitle="Control de insumos, fórmulas y alertas de reorden." className="mb-4">
              <button type="button" onClick={() => setIsSidebarOpen(true)} className="md:hidden rounded-xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-base-text)]">
                Menú
              </button>

              <MaterialsHeader
                search={search}
                setSearch={setSearch}
                activeView={activeView}
                setActiveView={setActiveView}
                onNew={() => setIsEntryModalOpen(true)}
                onReport={() => setIsReportModalOpen(true)}
              />
            </PageHeader>

            <MaterialsStats stats={materialStats} />

            <MaterialsFilters
              category={currentCategory}
              setCategory={activeView === 'formulas' ? setFormulaCategory : setMaterialCategory}
              status={currentStatus}
              setStatus={activeView === 'formulas' ? setFormulaStatus : setMaterialStatus}
              sortOrder={currentSortOrder}
              setSortOrder={activeView === 'formulas' ? setFormulaSortOrder : setMaterialSortOrder}
              categories={currentCategories}
              statuses={currentStatuses}
              sortLabel={currentSortLabel}
            />

            {activeView === 'formulas' ? (
              <div className="rounded-2xl border border-[var(--color-app-panel-border)] bg-[var(--color-base-surface)] px-4 py-3 text-sm text-[var(--color-base-text)]/68 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:px-6">
                Las fórmulas muestran el desglose de materia prima consumida por cada lote producido.
              </div>
            ) : null}

            <MaterialsTable
              activeView={activeView}
              filteredRows={currentRows}
              page={page}
              pageCount={currentPageCount}
              onPageChange={setPage}
              onEditRequest={(item) => setEditingEntry({ type: activeView === 'formulas' ? 'formula' : 'material', item })}
              onDeleteRequest={(item) => setDeletingEntry({ type: activeView === 'formulas' ? 'formula' : 'material', item })}
            />
          </div>
        </div>

        <Footer links={footerLinks} />
      </main>

      <MaterialsEntryModal
        isOpen={isEntryModalOpen || Boolean(editingEntry)}
        type={editingEntry?.type ?? 'material'}
        mode={editingEntry ? 'edit' : 'create'}
        item={editingEntry?.item ?? null}
        categories={(editingEntry?.type === 'formula' ? formulaCategories : materialCategories).filter((item) => item !== 'Todos')}
        statuses={(editingEntry?.type === 'formula' ? formulaStatuses : materialStatuses).filter((item) => item !== 'Todos')}
        onClose={() => {
          setIsEntryModalOpen(false);
          setEditingEntry(null);
        }}
        onSubmit={editingEntry ? handleUpdateEntry : handleAddMaterial}
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
    </div>
  );
}