import express from "express";
import prisma from "../prismaClient.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

// 🧩 Import shared utilities
import { isSaleActive, applySale } from "../utils/saleUtils.js";

const router = express.Router();

/* ✅ GET ALL SALES */
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        parentCategory: true,
        subCategory: true,
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(sales);
  } catch (err) {
    console.error("Error fetching sales:", err);
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

/* ✅ GET ACTIVE SALES (for frontend) */
router.get("/active", async (req, res) => {
  try {
    const now = new Date();
    const activeSales = await prisma.sale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        parentCategory: true,
        subCategory: true,
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(activeSales);
  } catch (err) {
    console.error("Error fetching active sales:", err);
    res.status(500).json({ error: "Failed to fetch active sales" });
  }
});

/* ✅ CREATE SALE (Admin only) */
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = req.body;

    const sale = await prisma.sale.create({
      data: {
        title: data.title,
        description: data.description,
        discountType: data.discountType,
        discountValue: parseFloat(data.discountValue),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
        bannerImageUrl: data.bannerImageUrl,
        bannerText: data.bannerText,
        parentCategoryId: data.parentCategoryId || null,
        subCategoryId: data.subCategoryId || null,
        productId: data.productId || null,
      },
    });

    res.json(sale);
  } catch (err) {
    console.error("Error creating sale:", err);
    res.status(500).json({ error: "Failed to create sale" });
  }
});

/* ✅ UPDATE SALE */
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const sale = await prisma.sale.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        discountType: data.discountType,
        discountValue: parseFloat(data.discountValue),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive,
        bannerImageUrl: data.bannerImageUrl,
        bannerText: data.bannerText,
        parentCategoryId: data.parentCategoryId || null,
        subCategoryId: data.subCategoryId || null,
        productId: data.productId || null,
      },
    });

    res.json(sale);
  } catch (err) {
    console.error("Error updating sale:", err);
    res.status(500).json({ error: "Failed to update sale" });
  }
});

/* ✅ DELETE SALE */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.sale.delete({ where: { id } });
    res.json({ message: "Sale deleted successfully" });
  } catch (err) {
    console.error("Error deleting sale:", err);
    res.status(500).json({ error: "Failed to delete sale" });
  }
});

export default router;
