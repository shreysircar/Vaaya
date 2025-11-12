// utils/priceFormatter.ts

/**
 * ✅ Global Price Formatting Utility
 * Ensures consistent ₹ formatting with 2 decimals (e.g., ₹1,249.50)
 */
export const formatPrice = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || isNaN(Number(value))) return "₹0.00";

  return `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
