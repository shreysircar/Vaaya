import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "E-Shop",
  description: "Amazon-like e-commerce app built with Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F5F5F4] text-gray-800 flex flex-col min-h-screen">
        <AuthProvider>
          {/* Navbar */}
          <Navbar />

          {/* Main content grows to fill remaining space */}
          <main className="flex-grow w-full">
            {children}
          </main>

          {/* Footer */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
