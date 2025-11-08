import "./globals.css";
import { Toaster } from "react-hot-toast"; // ✅ import toast container
import { AuthProvider } from "@/context/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import AuthWrapper from "@/components/AuthWrapper";

export const metadata = {
  title: "Vaaya",
  description: "Seriously Wow .",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#F5F5F4] text-gray-800 flex flex-col min-h-screen">
        {/* ✅ Toast system (must be outside all Providers) */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "#f9f6ef",
              color: "#292524",
              border: "1px solid #e5e5e5",
              fontSize: "14px",
              padding: "10px 14px",
              zIndex: 99999,
            },
            success: {
              iconTheme: {
                primary: "#025a6a", // Primary Button Teal
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#dec08a", // Mustard Light
                secondary: "#ffffff",
              },
            },
          }}
        />

        {/* 🟢 Auth + Layout wrappers */}
        <AuthProvider>
          <AuthWrapper>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
