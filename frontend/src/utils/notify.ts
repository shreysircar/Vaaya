import { toast } from "react-hot-toast";

/* 🎨 Vaaya Toast Design (Same as ProductCard) */
const BASE_STYLE = {
  background: "#f9f6ef",     // Off-White
  color: "#292524",          // Deep Charcoal
  border: "1px solid #e5e5e5", // Border Gray
  fontWeight: 500,
  fontSize: "14px",
  borderRadius: "8px",
  padding: "10px 14px",
};

export const notify = {
  /* ✅ Success toast */
  success: (message: string) =>
    toast.success(message, {
      duration: 2000,
      style: BASE_STYLE,
      iconTheme: {
        primary: "#025a6a", // Primary Teal
        secondary: "#ffffff",
      },
    }),

  /* ❌ Error toast */
  error: (message: string) =>
    toast.error(message, {
      duration: 3000,
      style: BASE_STYLE,
      iconTheme: {
        primary: "#dec08a", // Mustard Light
        secondary: "#ffffff",
      },
    }),

  /* ℹ️ Neutral info toast */
  info: (message: string) =>
    toast(message, {
      duration: 2500,
      style: BASE_STYLE,
    }),

  /* ⏳ Loading toast (useful for async actions) */
  loading: (message: string) =>
    toast.loading(message, {
      style: BASE_STYLE,
    }),

  /* 🔐 Login required helper */
loginRequired: (message: string = "Please log in to continue") =>
  toast.error(message, {
    duration: 3000,
    style: BASE_STYLE,
    iconTheme: {
      primary: "#dec08a",
      secondary: "#ffffff",
    },
  }),

};
