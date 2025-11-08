export interface Sale {
  id: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  parentCategoryId?: string | null;
  subCategoryId?: string | null;
  productId?: string | null;
    // 🕒 add these (to match your backend)
  startDate: string; // ISO string
  endDate: string;   // ISO string
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

  const discount =
    sale.discountType === "percentage"
      ? (product.price * sale.discountValue) / 100
      : sale.discountValue;

  const finalPrice = Math.max(0, product.price - discount);

  return { finalPrice, sale };
}
