import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import LayoutWrapper from "@/components/LayoutWrapper";
import AuthWrapper from "@/components/AuthWrapper"; // ✅ separate file now

export const metadata = {
  title: "E-Shop",
  description: "Amazon-like e-commerce app built with Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F5F5F4] text-gray-800 flex flex-col min-h-screen">
        {/* 🟢 Server-safe, outermost AuthProvider */}
        <AuthProvider>
          {/* 🟢 Client-side wrapper handles useAuth() */}
          <AuthWrapper>
            <LayoutWrapper>{children}</LayoutWrapper>
          </AuthWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
