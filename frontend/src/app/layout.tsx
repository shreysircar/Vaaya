import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "E-Shop",
  description: "Amazon-like e-commerce app built with Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F5F5F4] text-gray-800">
        {/* Wrap everything in AuthProvider */}
        <AuthProvider>
          <Navbar />
          {/* Use full width and height, no extra container */}
          <main className="min-h-screen w-full">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
