// backend/src/utils/saleUtils.js

import prisma from "../prismaClient.js";

/* 🧾 Check if a sale is currently active */
export function isSaleActive(sale) {
  if (!sale) return false;
  const now = new Date();
  return (
    sale.isActive &&
    new Date(sale.startDate) <= now &&
    new Date(sale.endDate) >= now
  );
}

/* 🧮 Apply sale discount to a given price */
export function applySale(price, sale) {
  if (!sale || !isSaleActive(sale)) return price;

  const discountValue = parseFloat(sale.discountValue) || 0;
  let discounted = price;

const type = sale.discountType?.toUpperCase();

if (type === "PERCENTAGE") {
  discounted = price - (price * discountValue) / 100;
} else if (type === "FLAT") {
  discounted = price - discountValue;
}


  // Avoid negative or NaN prices
  if (isNaN(discounted) || discounted < 0) discounted = 0;

  return +discounted.toFixed(2);
}

/* ⚙️ Get all currently active sales (for banners, cart, etc.) */
export async function getActiveSales() {
  const now = new Date();
  return await prisma.sale.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      parentCategory: true,
      subCategory: true,
      product: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

/* 🧠 Determine which sale applies to a given product */
export function saleAppliesToProduct(sale, product) {
  if (!sale || !isSaleActive(sale)) return false;

  // ✅ NEW: If sale has no product/category/subcategory → it's a GLOBAL sale
  if (!sale.productId && !sale.subCategoryId && !sale.parentCategoryId) {
    return true; // applies to all products
  }


  // Check product, subcategory, or parent category match
  if (sale.productId && sale.productId === product.id) return true;
  if (sale.subCategoryId && sale.subCategoryId === product.subCategoryId) return true;
  if (sale.parentCategoryId && sale.parentCategoryId === product.parentCategoryId) return true;

  return false;
}

/* ⚠️ Prevent overlapping active sales on the same product/category/subcategory/global */
export async function checkOverlappingSale(data) {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  // Defensive guard
  if (!startDate || !endDate || isNaN(startDate) || isNaN(endDate)) {
    return false;
  }

  // 🧠 Base condition: find active overlaps that share the same target
  const overlap = await prisma.sale.findFirst({
    where: {
      isActive: true,
      // Check if the new sale's date range overlaps an existing sale's range
      startDate: { lte: endDate },
      endDate: { gte: startDate },
      OR: [
        // ✅ Product-level overlap
        {
          AND: [
            { productId: { not: null } },
            { productId: data.productId || undefined },
          ],
        },
        // ✅ Subcategory-level overlap
        {
          AND: [
            { subCategoryId: { not: null } },
            { subCategoryId: data.subCategoryId || undefined },
          ],
        },
        // ✅ Category-level overlap
        {
          AND: [
            { parentCategoryId: { not: null } },
            { parentCategoryId: data.parentCategoryId || undefined },
          ],
        },
        // ✅ Global-level overlap (no category/subcategory/product)
        {
          AND: [
            { productId: null },
            { subCategoryId: null },
            { parentCategoryId: null },
            {
              OR: [
                // If new one is also global, prevent overlap
                {
                  AND: [
                    { productId: data.productId || null },
                    { subCategoryId: data.subCategoryId || null },
                    { parentCategoryId: data.parentCategoryId || null },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  });

  return !!overlap;
}



/* 🧹 Auto-deactivate expired sales */
export async function deactivateExpiredSales() {
  const now = new Date();
  await prisma.sale.updateMany({
    where: {
      isActive: true,
      endDate: { lt: now },
    },
    data: { isActive: false },
  });
}
