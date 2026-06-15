// ── Inventory Data Mockup ────────────────────────────────────────────────
// Product data and categories are now loaded from Supabase via inventoryService.js.
// The exports below are kept as empty stubs for backward compatibility with
// other modules (materials, reports) that still reference them.
// These modules will be migrated to Supabase in a future step.

/** @deprecated Use fetchProducts() from inventoryService.js instead. */
export const inventoryProducts = [];

/** @deprecated Use fetchCategories() from inventoryService.js instead. */
export const inventoryCategories = [];

export const inventoryStatuses = ['Todos', 'En stock', 'Stock bajo', 'Agotado'];