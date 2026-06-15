import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Computes the display status of a product based on its stock levels.
 */
function computeStatus(stock, minimumStock) {
  if (stock === 0) return 'Agotado';
  if (stock < minimumStock) return 'Stock bajo';
  return 'En stock';
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

/**
 * Fetch all products with joined category and badge names.
 * Returns an enriched array with `category_name`, `badge_name`, and `status`.
 */
export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      sku,
      name,
      category_id,
      description,
      price,
      stock,
      minimum_stock,
      badge_id,
      image_url,
      created_at,
      categories:category_id(id, name),
      badges:badge_id(id, name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((p) => ({
    ...p,
    category_name: p.categories?.name ?? 'Sin categoría',
    badge_name: p.badges?.name ?? null,
    status: computeStatus(p.stock, p.minimum_stock),
  }));
}

/**
 * Insert a new product into the `products` table.
 * @param {Object} productData — must include: sku, name, price, stock, minimum_stock.
 *   Optional: category_id, description, badge_id, image_url.
 */
export async function insertProduct(productData) {
  const { data, error } = await supabase
    .from('products')
    .insert([productData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update an existing product by its UUID.
 */
export async function updateProduct(id, updates) {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a product by its UUID.
 */
export async function deleteProduct(id) {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Categories & Badges (lookups)
// ---------------------------------------------------------------------------

/**
 * Fetch product categories from the `categories` table.
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
 * Fetch badges from the `badges` table.
 * Returns `[{ id, name }]`.
 */
export async function fetchBadges() {
  const { data, error } = await supabase
    .from('badges')
    .select('id, name')
    .order('name');

  if (error) throw error;
  return data ?? [];
}

// ---------------------------------------------------------------------------
// Image Upload (Supabase Storage)
// ---------------------------------------------------------------------------

/**
 * Upload a product image to the `product-images` bucket.
 * Returns the public URL of the uploaded file.
 */
export async function uploadProductImage(file) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (error) throw error;

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}
