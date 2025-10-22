import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "E-Shop",
  description: "Amazon-like e-commerce app built with Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navbar />
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
