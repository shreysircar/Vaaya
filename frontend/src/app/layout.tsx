import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext"; // ✅ import AuthProvider

export const metadata = {
  title: "E-Shop",
  description: "Amazon-like e-commerce app built with Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {/* ✅ Wrap everything inside AuthProvider */}
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto p-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
