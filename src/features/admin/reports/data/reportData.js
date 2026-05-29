import productsSales from '@/features/admin/dashboard/data/productsSales.json';
import { inventoryCategories, inventoryProducts } from '@/features/admin/inventory/data/mockup';
import { materialCategories, materialRows } from '@/features/admin/materials/data/mockup';

export const reportFormats = [
  { value: 'pdf', label: 'PDF Profesional' },
  { value: 'excel', label: 'Excel/CSV' },
];

export const reportPages = [
  {
    id: 'summary',
    number: 'Página 1',
    title: 'Resumen Ejecutivo',
    description: 'KPIs clave de ventas, inventario y alertas operativas.',
  },
  {
    id: 'sales',
    number: 'Página 2',
    title: 'Estadísticas de Ventas Avanzadas',
    description: 'Tendencias, productos top y mapa comercial por municipio.',
  },
  {
    id: 'inventory',
    number: 'Página 3',
    title: 'Inventario de Productos Terminados',
    description: 'Stock, mínimos y productos con riesgo de reposición.',
  },
  {
    id: 'materials',
    number: 'Página 4',
    title: 'Materia Prima y Reorden',
    description: 'Insumos críticos, categorías y alertas de abastecimiento.',
  },
];

export const reportDefaultState = {
  startDate: '2026-05-01',
  endDate: '2026-05-29',
  format: 'pdf',
  pages: {
    summary: true,
    sales: true,
    inventory: true,
    materials: true,
  },
  salesMetrics: {
    revenueTrend: true,
    topProducts: true,
    municipalityMap: true,
  },
  inventoryFilters: {
    includeFullStock: true,
    criticalOnly: false,
    categories: [],
  },
  materialFilters: {
    includeFullStock: true,
    criticalOnly: false,
    categories: [],
  },
};

const reportPresetPages = {
  sales: {
    summary: true,
    sales: true,
    inventory: false,
    materials: false,
  },
  inventory: {
    summary: true,
    sales: false,
    inventory: true,
    materials: false,
  },
  materials: {
    summary: true,
    sales: false,
    inventory: false,
    materials: true,
  },
};

const reportPresetSalesMetrics = {
  sales: {
    revenueTrend: true,
    topProducts: true,
    municipalityMap: true,
  },
  inventory: {
    revenueTrend: false,
    topProducts: false,
    municipalityMap: false,
  },
  materials: {
    revenueTrend: false,
    topProducts: false,
    municipalityMap: false,
  },
};

export function createReportConfig(preset = 'sales') {
  const selectedPreset = reportPresetPages[preset] ? preset : 'sales';

  return {
    ...reportDefaultState,
    pages: {
      ...reportPresetPages[selectedPreset],
    },
    salesMetrics: {
      ...reportPresetSalesMetrics[selectedPreset],
    },
  };
}

export const reportPresetLabels = {
  sales: 'Reporte de Ventas',
  inventory: 'Reporte de Inventario',
  materials: 'Reporte de Materia Prima',
};

export const salesHighlights = {
  period: productsSales.period,
  totalRevenue: productsSales.products.reduce((sum, item) => sum + item.revenue, 0),
  totalUnits: productsSales.products.reduce((sum, item) => sum + item.soldTotal, 0),
  averageTicket: 38.4,
  growth: 12.4,
  topProducts: [...productsSales.products].sort((a, b) => b.soldTotal - a.soldTotal).slice(0, 5),
  zones: [...productsSales.zones].slice(0, 6),
};

export const inventoryHighlights = {
  totalProducts: inventoryProducts.length,
  inStock: inventoryProducts.filter((item) => item.status === 'En stock').length,
  lowStock: inventoryProducts.filter((item) => item.status === 'Stock bajo').length,
  outOfStock: inventoryProducts.filter((item) => item.status === 'Agotado').length,
};

export const materialHighlights = {
  totalMaterials: materialRows.length,
  criticalCount: materialRows.filter((item) => item.status !== 'En stock').length,
  totalSuppliers: new Set(materialRows.map((item) => item.supplier)).size,
};

export const inventoryCategoryOptions = inventoryCategories.map((category) => ({ value: category, label: category }));
export const materialCategoryOptions = materialCategories.filter((category) => category !== 'Todos').map((category) => ({ value: category, label: category }));

export function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value) {
  if (!value) return 'Sin definir';

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`));
}

export function formatShortDate(value) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${value}T12:00:00`));
}

export function parseReportDate(value) {
  return new Date(`${value}T12:00:00`);
}

export function isDateWithinRange(date, startDate, endDate) {
  const time = date.getTime();
  return time >= startDate.getTime() && time <= endDate.getTime();
}

export function clampReportValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function assignSyntheticDate(index, total, start = '2026-05-01', end = '2026-06-30') {
  const startDate = parseReportDate(start);
  const endDate = parseReportDate(end);
  const ratio = total <= 1 ? 0.5 : index / (total - 1);

  return new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) * ratio);
}
