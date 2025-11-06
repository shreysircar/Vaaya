import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // ✅ Unsplash
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // ✅ Cloudinary
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com", // ✅ Firebase Storage
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com", // ✅ Pixabay (optional)
      },
      {
        protocol: "https",
        hostname: "*.b-cdn.net", // ✅ BunnyCDN (wildcard allows any zone)
      },
    ],
  },
};

export default nextConfig;
