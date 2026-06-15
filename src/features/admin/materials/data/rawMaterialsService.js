import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Computes the display status of a raw material based on its stock levels.
 */
function computeStatus(stock, minimumStock) {
  if (stock === 0) return 'Agotado';
  if (stock <= minimumStock) return 'Stock bajo';
  return 'En stock';
}

// ---------------------------------------------------------------------------
// Raw Materials
// ---------------------------------------------------------------------------

/**
 * Fetch all raw materials with joined category and supplier names.
 * Returns an enriched array with `category_name`, `supplier_name`, and `status`.
 */
export async function fetchRawMaterials() {
  const { data, error } = await supabase
    .from('raw_materials')
    .select(`
      id,
      sku,
      name,
      category_id,
      stock,
      minimum_stock,
      unit,
      unit_cost,
      supplier_id,
      created_at,
      categories:category_id(id, name),
      suppliers:supplier_id(id, name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((m) => ({
    ...m,
    category_name: m.categories?.name ?? 'Sin categoría',
    supplier_name: m.suppliers?.name ?? 'Sin proveedor',
    status: computeStatus(m.stock, m.minimum_stock),
  }));
}

/**
 * Insert a new raw material into the `raw_materials` table.
 */
export async function insertRawMaterial(materialData) {
  const { data, error } = await supabase
    .from('raw_materials')
    .insert([materialData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing raw material by its UUID.
 */
export async function updateRawMaterial(id, updates) {
  const { data, error } = await supabase
    .from('raw_materials')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a raw material by its UUID.
 */
export async function deleteRawMaterial(id) {
  const { error } = await supabase
    .from('raw_materials')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Lookups (Categories & Suppliers)
// ---------------------------------------------------------------------------

/**
 * Fetch categories from the `categories` table.
 * Returns `[{ id, name }]`.
 */
export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

/**
 * Fetch suppliers from the `suppliers` table.
 * Returns `[{ id, name }]`.
 */
export async function fetchSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('id, name')
    .order('name');

  if (error) throw error;
  return data ?? [];
}
