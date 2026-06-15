import { supabase } from '@/lib/supabase';

/**
 * Fetch products for the dropdown in the formulas form.
 * Joins categories to get the category_name as well.
 */
export async function fetchProductsForFormulas() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      category_id,
      categories(name)
    `)
    .order('name');

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    category_id: p.category_id,
    category_name: p.categories?.name ?? 'Sin categoría',
  }));
}

/**
 * Fetch all formulas with their related products and ingredients.
 */
export async function fetchFormulas() {
  const { data: formulasData, error: formulasError } = await supabase
    .from('formulas')
    .select(`
      id,
      sku,
      product_id,
      yield_label,
      yield_units,
      batch_size,
      status,
      notes,
      products (
        name,
        category_id,
        categories (name)
      ),
      formula_ingredients (
        material_id,
        quantity,
        raw_materials (
          name,
          sku,
          unit,
          unit_cost
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (formulasError) throw formulasError;

  return (formulasData ?? []).map((f) => {
    // Reconstruct the ingredients array to match the UI expectations
    const ingredients = (f.formula_ingredients ?? []).map((ing) => ({
      material_id: ing.material_id,
      sku: ing.raw_materials?.sku ?? '',
      name: ing.raw_materials?.name ?? '',
      qty: parseFloat(ing.quantity),
      unit: ing.raw_materials?.unit ?? '',
      unit_cost: parseFloat(ing.raw_materials?.unit_cost ?? 0),
    }));

    // Calculate estimated cost
    const estimated_cost = ingredients.reduce(
      (total, ing) => total + ing.qty * ing.unit_cost,
      0
    );

    return {
      id: f.id,
      sku: f.sku,
      product_id: f.product_id,
      product_name: f.products?.name ?? 'Producto desconocido',
      category_name: f.products?.categories?.name ?? 'Sin categoría',
      yield_label: f.yield_label,
      yield_units: f.yield_units,
      batch_size: f.batch_size,
      status: f.status,
      notes: f.notes,
      ingredients,
      estimated_cost,
    };
  });
}

/**
 * Insert or update a formula and its ingredients.
 */
export async function saveFormula(formulaData, ingredientsData) {
  const isUpdate = !!formulaData.id;

  // 1. Save Formula
  let savedFormula;
  if (isUpdate) {
    const { data, error } = await supabase
      .from('formulas')
      .update({
        sku: formulaData.sku,
        product_id: formulaData.product_id,
        yield_label: formulaData.yield_label,
        yield_units: formulaData.yield_units,
        batch_size: formulaData.batch_size,
        status: formulaData.status,
        notes: formulaData.notes,
      })
      .eq('id', formulaData.id)
      .select()
      .single();

    if (error) throw error;
    savedFormula = data;

    // Delete existing ingredients to replace them
    const { error: delError } = await supabase
      .from('formula_ingredients')
      .delete()
      .eq('formula_id', savedFormula.id);

    if (delError) throw delError;
  } else {
    const { data, error } = await supabase
      .from('formulas')
      .insert([{
        sku: formulaData.sku,
        product_id: formulaData.product_id,
        yield_label: formulaData.yield_label,
        yield_units: formulaData.yield_units,
        batch_size: formulaData.batch_size,
        status: formulaData.status,
        notes: formulaData.notes,
      }])
      .select()
      .single();

    if (error) throw error;
    savedFormula = data;
  }

  // 2. Insert ingredients
  if (ingredientsData && ingredientsData.length > 0) {
    const ingPayload = ingredientsData.map((ing) => ({
      formula_id: savedFormula.id,
      material_id: ing.material_id,
      quantity: ing.qty,
    }));

    const { error: ingError } = await supabase
      .from('formula_ingredients')
      .insert(ingPayload);

    if (ingError) throw ingError;
  }

  return savedFormula;
}

/**
 * Delete a formula.
 * Ingredients are automatically deleted via ON DELETE CASCADE in the DB schema.
 */
export async function deleteFormula(id) {
  const { error } = await supabase
    .from('formulas')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
