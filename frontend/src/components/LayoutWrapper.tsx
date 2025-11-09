"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import SiteTopBar from "./SiteTopBar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  // 🆕 Dynamically track top padding based on SiteTopBar
  const [mainPadding, setMainPadding] = useState("pt-[156px]"); // default (TopBar + Navbar)

  useEffect(() => {
    const updatePadding = () => {
      const topBar = document.querySelector(".site-topbar-active");
      if (topBar) {
        setMainPadding("pt-[156px]"); // ✅ TopBar exists
      } else {
        setMainPadding("pt-[120px]"); // ✅ No TopBar
      }
    };

    // Run initially
    updatePadding();

    // 🧠 Observe DOM changes to detect when SiteTopBar appears/disappears
    const observer = new MutationObserver(updatePadding);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []); // ✅ Runs once but observes continuously

  return (
    <>
      {!isAdminRoute && <SiteTopBar />}
      {!isAdminRoute && <Navbar />}

      {/* 🧠 Dynamic padding applied */}
      <main className={`flex-grow w-full ${mainPadding}`}>{children}</main>

      {!isAdminRoute && <Footer />}
    </>
  );
}
