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

/**
 * 🧠 Applies the correct sale to a given product with proper priority:
 * Product > Subcategory > Category > Global
 */
export function applySaleToProduct(product: any, sales: Sale[]) {
  if (!product || !Array.isArray(sales) || sales.length === 0) {
    return { finalPrice: product?.price ?? 0, sale: null };
  }

  // ✅ Find applicable sale based on priority
  const matchedSale =
    sales.find((s) => s.productId === product.id) || // Product-level sale
    sales.find((s) => s.subCategoryId === product.subCategoryId) || // Subcategory-level
    sales.find((s) => s.parentCategoryId === product.parentCategoryId) || // Category-level
    sales.find( // Global sale (no product/category/subcategory specified)
      (s) => !s.productId && !s.subCategoryId && !s.parentCategoryId
    );

  // 🧾 No applicable sale → return original price
  if (!matchedSale) {
    return { finalPrice: product.price, sale: null };
  }

  // 🧮 Normalize discount type
  const type = matchedSale.discountType?.toUpperCase();

  // 🧾 Calculate discount
  let discount =
    type === "PERCENTAGE"
      ? (product.price * matchedSale.discountValue) / 100
      : matchedSale.discountValue;

  // Avoid NaN or negative values
  if (isNaN(discount)) discount = 0;
  const finalPrice = Math.max(0, product.price - discount);

  return { finalPrice, sale: matchedSale };
}
