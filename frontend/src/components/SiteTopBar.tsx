"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function SiteTopBar() {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState<string | null>(null);

  if (pathname.startsWith("/checkout") || pathname.startsWith("/admin")) return null;

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/announcement`)
      .then(res => res.json())
      .then(data => {
        if (data?.message) setAnnouncement(data.message);
      })
      .catch(console.error);
  }, []);

  if (!announcement) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full text-center text-sm font-medium py-2 px-4"
      style={{
        backgroundColor: "#025a6a",
        color: "#ffffff",
      }}
    >
      {announcement}
    </motion.div>
  );
}
