import express from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/* 🔍 Unified Search: Products + Parent Categories                            */
/* Example: GET /api/search?query=phone                                       */
/* -------------------------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.json({
        products: [],
        parentCategories: [],
      });
    }

    const [products, parentCategories] = await Promise.all([
      // 🛍 Products
      prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        include: {
          parentCategory: true,
        },
        take: 10,
        orderBy: { name: "asc" },
      }),

      // 🧭 Parent Categories
      prisma.parentCategory.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 6,
        orderBy: { name: "asc" },
      }),
    ]);

    res.json({ products, parentCategories });
  } catch (error) {
    console.error("❌ Search error:", error);
    res.status(500).json({ message: "Failed to search" });
  }
});

export default router;
