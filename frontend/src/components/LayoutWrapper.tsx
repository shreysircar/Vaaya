"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin"); // hide navbar/footer for admin routes

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main className="flex-grow w-full">{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  );
}
