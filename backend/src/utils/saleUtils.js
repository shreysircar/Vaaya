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

  // Check product, subcategory, or parent category match
  if (sale.productId && sale.productId === product.id) return true;
  if (sale.subCategoryId && sale.subCategoryId === product.subCategoryId) return true;
  if (sale.parentCategoryId && sale.parentCategoryId === product.parentCategoryId) return true;

  return false;
}

/* ⚠️ Prevent overlapping sales on the same product/category */
export async function checkOverlappingSale(data) {
  const overlap = await prisma.sale.findFirst({
    where: {
      isActive: true,
      startDate: { lte: new Date(data.endDate) },
      endDate: { gte: new Date(data.startDate) },
      OR: [
        { productId: data.productId || undefined },
        { subCategoryId: data.subCategoryId || undefined },
        { parentCategoryId: data.parentCategoryId || undefined },
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
