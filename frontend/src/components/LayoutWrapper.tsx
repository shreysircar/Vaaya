"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SiteTopBar from "./SiteTopBar"; // ✅ Added import

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin"); // hide navbar/footer for admin routes

  return (
    <>
      {/* ✅ Added TopBar above Navbar */}
      {!isAdminRoute && <SiteTopBar />}

      {!isAdminRoute && <Navbar />}
      <main className="flex-grow w-full">{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  );
}
