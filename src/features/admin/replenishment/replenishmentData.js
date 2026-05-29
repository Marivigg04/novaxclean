export function getStockStatus(stock, minimum) {
  if (stock <= 0) return 'Agotado';
  if (stock <= minimum) return 'Stock bajo';
  return 'En stock';
}

export function suggestReplenishmentQuantity(stock, minimum) {
  return Math.max(1, minimum - stock);
}

export function normalizeReplenishmentItems(items = []) {
  return items.map((item) => ({
    ...item,
    recommendedQuantity: item.recommendedQuantity ?? suggestReplenishmentQuantity(item.stock, item.minimum),
    quantity: item.quantity ?? suggestReplenishmentQuantity(item.stock, item.minimum),
  }));
}

export function applyReceiptToItems(items = [], lineItems = []) {
  const quantityBySku = new Map(lineItems.map((item) => [item.sku, Number(item.quantity) || 0]));

  return items.map((item) => {
    const received = quantityBySku.get(item.sku) || 0;

    if (!received) {
      return item;
    }

    const stock = Number(item.stock) || 0;
    const minimum = Number(item.minimum) || 0;
    const nextStock = stock + received;

    return {
      ...item,
      stock: nextStock,
      status: getStockStatus(nextStock, minimum),
    };
  });
}
