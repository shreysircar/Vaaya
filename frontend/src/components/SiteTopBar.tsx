"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function SiteTopBar() {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false); // ✅ Prevent hydration mismatch

  // ✅ Mark component as client-mounted
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ Fetch active announcement safely
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcement`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const active = data.find((a) => a?.isActive);
          setAnnouncement(active?.message || null);
        } else if (data?.message) {
          setAnnouncement(data.message);
        } else {
          setAnnouncement(null);
        }
      })
      .catch(() => setAnnouncement(null));
  }, []);

  // ✅ Avoid SSR-client mismatch during hydration
  if (!isMounted) return null;

  // ✅ Skip rendering on checkout/admin pages
  if (pathname?.startsWith("/checkout") || pathname?.startsWith("/admin")) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[60] w-full text-center text-sm font-medium transition-all duration-300 ${
        announcement ? "site-topbar-active" : ""
      }`}
      style={{
        height: "35px", // 🧩 Always reserve height (prevents navbar overlap)
        backgroundColor: announcement ? "#025a6a" : "transparent",
        color: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: announcement ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
      }}
    >
      {/* Animate only text when it appears */}
      {announcement && (
        <motion.span
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {announcement}
        </motion.span>
      )}
    </div>
  );
}
