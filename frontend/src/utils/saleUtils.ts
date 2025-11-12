export interface Sale {
  id: string;
  discountType: "PERCENTAGE" | "FLAT" | "percentage" | "fixed";
  discountValue: number;
  parentCategoryId?: string | null;
  subCategoryId?: string | null;
  productId?: string | null;
  startDate: string;
  endDate: string;
}

export function applySaleToProduct(product: any, sales: Sale[]) {
  // Find if any active sale applies
  const sale = sales.find(
    (s) =>
      s.productId === product.id ||
      s.subCategoryId === product.subCategoryId ||
      s.parentCategoryId === product.parentCategoryId
  );

  if (!sale) return { finalPrice: product.price, sale: null };

  // ✅ Normalize to uppercase to handle both backend + frontend variations
  const type = sale.discountType?.toUpperCase();

  const discount =
    type === "PERCENTAGE"
      ? (product.price * sale.discountValue) / 100
      : sale.discountValue;

  const finalPrice = Math.max(0, product.price - discount);

  return { finalPrice, sale };
}
