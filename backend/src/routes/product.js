import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ GET all products (public)
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// ✅ GET single product (public)
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// POST create product
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;

    // Find category by ID
    const categoryRecord = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryRecord) return res.status(400).json({ message: "Invalid category" });

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: categoryRecord.id,
        imageUrl,
      },
    });
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

// ✅ PUT update product (admin/seller only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;

    // Find category by ID
    const categoryRecord = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!categoryRecord) return res.status(400).json({ message: "Invalid category" });

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId: categoryRecord.id,
        imageUrl,
      },
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// ✅ DELETE product (admin/seller only)
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
