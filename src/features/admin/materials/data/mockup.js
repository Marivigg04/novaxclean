import { AlertTriangle, Boxes, CircleDollarSign, Truck } from 'lucide-react';
import { inventoryCategories, inventoryProducts } from '../../inventory/data/mockup';

// ---------------------------------------------------------------------------
// Raw material data is now loaded from Supabase via rawMaterialsService.js.
// The static catalog below is kept ONLY to feed formula recipes (BOM cost
// calculations). It will be removed once formulas are also migrated.
// ---------------------------------------------------------------------------

const rawMaterialCatalog = [
  { sku: 'MP-CHE-001', name: 'Ácido Sulfónico', category: 'Químicos', stock: 42, minimum: 20, unit: 'Kg', unitCost: 18.4, supplier: 'Quimlab Industrial' },
  { sku: 'MP-CHE-002', name: 'Soda Cáustica', category: 'Químicos', stock: 64, minimum: 25, unit: 'Kg', unitCost: 6.55, supplier: 'Quimlab Industrial' },
  { sku: 'MP-CHE-003', name: 'Cloruro de Benzalconio', category: 'Químicos', stock: 5, minimum: 10, unit: 'Kg', unitCost: 24.5, supplier: 'Quimlab Industrial' },
  { sku: 'MP-CHE-004', name: 'Tensioactivo Neutro', category: 'Químicos', stock: 18, minimum: 12, unit: 'Kg', unitCost: 11.8, supplier: 'Quimlab Industrial' },
  { sku: 'MP-CHE-005', name: 'Enzimas Bioactivas', category: 'Químicos', stock: 4, minimum: 10, unit: 'Kg', unitCost: 22.1, supplier: 'BioClean Labs' },
  { sku: 'MP-CHE-006', name: 'Cera Microcristalina', category: 'Químicos', stock: 28, minimum: 12, unit: 'Kg', unitCost: 9.7, supplier: 'Quimlab Industrial' },
  { sku: 'MP-CHE-007', name: 'Solvente Mineral', category: 'Químicos', stock: 15, minimum: 8, unit: 'Litros', unitCost: 4.1, supplier: 'Solvents MX' },
  { sku: 'MP-CHE-008', name: 'Alcohol Isopropílico', category: 'Químicos', stock: 26, minimum: 10, unit: 'Litros', unitCost: 5.8, supplier: 'Solvents MX' },
  { sku: 'MP-CHE-009', name: 'Agua Desmineralizada', category: 'Químicos', stock: 90, minimum: 30, unit: 'Litros', unitCost: 0.25, supplier: 'AquaPure' },
  { sku: 'MP-CHE-010', name: 'Colorante Azul', category: 'Químicos', stock: 12, minimum: 5, unit: 'Kg', unitCost: 1.2, supplier: 'ColorTech' },
  { sku: 'MP-ESN-001', name: 'Fragancia Cítrica', category: 'Esencias', stock: 9, minimum: 12, unit: 'Litros', unitCost: 32.75, supplier: 'Aromas del Valle' },
  { sku: 'MP-ESN-002', name: 'Fragancia Lavanda', category: 'Esencias', stock: 11, minimum: 12, unit: 'Litros', unitCost: 31.4, supplier: 'Aromas del Valle' },
  { sku: 'MP-ESN-003', name: 'Fragancia Floral', category: 'Esencias', stock: 8, minimum: 10, unit: 'Litros', unitCost: 29.5, supplier: 'Aromas del Valle' },
  { sku: 'MP-ENV-001', name: 'Envase Pet 5L', category: 'Envases', stock: 120, minimum: 60, unit: 'Unidades', unitCost: 0.82, supplier: 'Plastiex' },
  { sku: 'MP-ENV-002', name: 'Envase Pet 1L', category: 'Envases', stock: 240, minimum: 100, unit: 'Unidades', unitCost: 0.29, supplier: 'Envapack' },
  { sku: 'MP-ENV-003', name: 'Frasco Dosificador 1L', category: 'Envases', stock: 250, minimum: 100, unit: 'Unidades', unitCost: 0.29, supplier: 'Envapack' },
  { sku: 'MP-TAP-001', name: 'Tapa Rosca 5L', category: 'Tapas', stock: 18, minimum: 40, unit: 'Unidades', unitCost: 0.16, supplier: 'Plastiex' },
  { sku: 'MP-TAP-002', name: 'Tapa Spray', category: 'Tapas', stock: 40, minimum: 30, unit: 'Unidades', unitCost: 0.21, supplier: 'Plastiex' },
  { sku: 'MP-ETQ-001', name: 'Etiqueta Impermeable', category: 'Etiquetas', stock: 0, minimum: 500, unit: 'Unidades', unitCost: 0.03, supplier: 'PrintLab' },
  { sku: 'MP-ETQ-002', name: 'Etiqueta Termoencogible', category: 'Etiquetas', stock: 140, minimum: 80, unit: 'Unidades', unitCost: 0.05, supplier: 'PrintLab' },
  { sku: 'MP-ETQ-003', name: 'Etiqueta Informativa', category: 'Etiquetas', stock: 70, minimum: 100, unit: 'Unidades', unitCost: 0.04, supplier: 'PrintLab' },
  { sku: 'MP-CMP-001', name: 'Base Plástica Industrial', category: 'Componentes', stock: 50, minimum: 20, unit: 'Unidades', unitCost: 0.31, supplier: 'Moldes y Partes' },
  { sku: 'MP-CMP-002', name: 'Fibras de Nylon', category: 'Componentes', stock: 280, minimum: 120, unit: 'Unidades', unitCost: 0.18, supplier: 'Moldes y Partes' },
  { sku: 'MP-CMP-003', name: 'Espuma de Poliuretano', category: 'Componentes', stock: 160, minimum: 80, unit: 'Unidades', unitCost: 0.22, supplier: 'Moldes y Partes' },
  { sku: 'MP-CMP-004', name: 'Látex Natural', category: 'Componentes', stock: 210, minimum: 90, unit: 'Unidades', unitCost: 0.26, supplier: 'Moldes y Partes' },
  { sku: 'MP-CMP-005', name: 'Polvo Desmoldante', category: 'Componentes', stock: 6, minimum: 8, unit: 'Kg', unitCost: 8.9, supplier: 'Moldes y Partes' },
  { sku: 'MP-CMP-006', name: 'Jabón Neutro Base', category: 'Componentes', stock: 54, minimum: 20, unit: 'Kg', unitCost: 3.8, supplier: 'BioClean Labs' },
  { sku: 'MP-CMP-007', name: 'Gelificante Neutro', category: 'Componentes', stock: 14, minimum: 8, unit: 'Kg', unitCost: 7.8, supplier: 'BioClean Labs' },
  { sku: 'MP-CMP-008', name: 'Empaque Cartón', category: 'Componentes', stock: 65, minimum: 40, unit: 'Unidades', unitCost: 0.14, supplier: 'Cartonpack' },
];

const rawMaterialMap = new Map(rawMaterialCatalog.map((item) => [item.sku, item]));

/** @deprecated Use fetchRawMaterials() from rawMaterialsService.js instead. */
export const materialRows = rawMaterialCatalog.map((item) => ({
  ...item,
  status: item.stock === 0 ? 'Agotado' : item.stock <= item.minimum ? 'Stock bajo' : 'En stock',
}));

const recipeCatalog = [
  { sku: 'CER-BRL-006', product: 'Cera Brillante', category: 'Ceras', yieldLabel: '1 lote / 80 unidades', ingredients: [{ sku: 'MP-CHE-006', qty: 8 }, { sku: 'MP-CHE-007', qty: 4 }, { sku: 'MP-ESN-002', qty: 0.3 }, { sku: 'MP-ETQ-002', qty: 20 }] },
  { sku: 'CPL-IND-027', product: 'Cepillo Industrial', category: 'Accesorios', yieldLabel: '1 lote / 120 unidades', ingredients: [{ sku: 'MP-CMP-001', qty: 120 }, { sku: 'MP-CMP-002', qty: 120 }, { sku: 'MP-CMP-008', qty: 120 }] },
  { sku: 'ESP-PRM-021', product: 'Esponja Premium', category: 'Accesorios', yieldLabel: '1 lote / 150 unidades', ingredients: [{ sku: 'MP-CMP-003', qty: 150 }, { sku: 'MP-ETQ-002', qty: 150 }] },
  { sku: 'DSF-CTR-009', product: 'Desinfectante Citrus', category: 'Desinfectantes', yieldLabel: '1 lote / 80 L', ingredients: [{ sku: 'MP-CHE-003', qty: 6 }, { sku: 'MP-CHE-009', qty: 80 }, { sku: 'MP-ESN-001', qty: 0.5 }, { sku: 'MP-ENV-003', qty: 80 }] },
  { sku: 'QTM-ECO-011', product: 'Quitamanchas Eco', category: 'Detergentes', yieldLabel: '1 lote / 60 L', ingredients: [{ sku: 'MP-CHE-004', qty: 5 }, { sku: 'MP-CHE-005', qty: 1 }, { sku: 'MP-CHE-009', qty: 40 }, { sku: 'MP-ETQ-001', qty: 40 }] },
  { sku: 'GNT-XL-018', product: 'Guantes XL', category: 'Accesorios', yieldLabel: '1 lote / 200 pares', ingredients: [{ sku: 'MP-CMP-004', qty: 200 }, { sku: 'MP-CMP-005', qty: 1 }, { sku: 'MP-CMP-008', qty: 20 }] },
  { sku: 'ARM-LAV-003', product: 'Aromatizante Lavanda', category: 'Aromas', yieldLabel: '1 lote / 60 unidades', ingredients: [{ sku: 'MP-CHE-008', qty: 12 }, { sku: 'MP-ESN-002', qty: 2 }, { sku: 'MP-CHE-009', qty: 30 }, { sku: 'MP-TAP-002', qty: 60 }] },
  { sku: 'LMP-VDR-014', product: 'Limpiavidrios X', category: 'Limpieza', yieldLabel: '1 lote / 50 unidades', ingredients: [{ sku: 'MP-CHE-008', qty: 6 }, { sku: 'MP-CHE-009', qty: 40 }, { sku: 'MP-ESN-001', qty: 0.4 }, { sku: 'MP-ENV-003', qty: 50 }] },
  { sku: 'JAB-ANT-002', product: 'Jabón Antibacterial', category: 'Jabones', yieldLabel: '1 lote / 90 unidades', ingredients: [{ sku: 'MP-CMP-006', qty: 15 }, { sku: 'MP-CHE-003', qty: 0.8 }, { sku: 'MP-CHE-009', qty: 45 }, { sku: 'MP-TAP-001', qty: 30 }] },
  { sku: 'DET-5L-001', product: 'Detergente Pro 5L', category: 'Detergentes', yieldLabel: '1 lote / 100 unidades', ingredients: [{ sku: 'MP-CHE-001', qty: 22 }, { sku: 'MP-CHE-002', qty: 8 }, { sku: 'MP-CHE-003', qty: 1 }, { sku: 'MP-ESN-001', qty: 1.2 }, { sku: 'MP-ENV-001', qty: 100 }, { sku: 'MP-TAP-001', qty: 100 }, { sku: 'MP-ETQ-001', qty: 100 }] },
];

function calculateEstimatedCost(ingredients) {
  return ingredients.reduce((total, ingredient) => {
    const material = rawMaterialMap.get(ingredient.sku);
    return total + (material?.unitCost ?? 0) * ingredient.qty;
  }, 0);
}

function getFormulaStatus(ingredients) {
  const statuses = ingredients.map((ingredient) => rawMaterialMap.get(ingredient.sku)?.status).filter(Boolean);

  if (statuses.includes('Agotado')) return 'En ajuste';
  if (statuses.includes('Stock bajo')) return 'En revisión';
  return 'Lista';
}

export const productionFormulas = recipeCatalog.map((recipe) => ({
  ...recipe,
  ingredients: recipe.ingredients.map((ingredient) => ({
    name: rawMaterialMap.get(ingredient.sku)?.name ?? ingredient.sku,
    qty: ingredient.qty,
    sku: ingredient.sku,
  })),
  estimatedCost: calculateEstimatedCost(recipe.ingredients),
  status: getFormulaStatus(recipe.ingredients),
}));

/** @deprecated Use categories from rawMaterialsService.js instead. */
export const materialCategories = ['Todos', ...new Set(materialRows.map((item) => item.category))];
export const materialStatuses = ['Todos', 'En stock', 'Stock bajo', 'Agotado'];
export const formulaCategories = ['Todos', ...inventoryCategories];
export const formulaStatuses = ['Todos', 'Lista', 'En revisión', 'En ajuste'];

/** @deprecated Stats are now computed dynamically in Materials.jsx. */
export const materialStats = [
  {
    title: 'Total Insumos',
    value: `${materialRows.length} referencias`,
    description: 'Referencias activas en catálogo interno',
    icon: Boxes,
  },
  {
    title: 'Valor del Almacén',
    value: '$3,450 US$',
    description: 'Costo estimado del stock de materia prima',
    icon: CircleDollarSign,
  },
  {
    title: 'Alertas de Reorden',
    value: `${materialRows.filter((item) => item.status !== 'En stock').length} insumos`,
    description: 'Insumos con stock crítico o por debajo del mínimo',
    icon: AlertTriangle,
    badge: 'Alerta',
  },
  {
    title: 'Proveedores',
    value: `${new Set(materialRows.map((item) => item.supplier)).size} proveedores`,
    description: 'Red de abastecimiento registrada',
    icon: Truck,
  },
];