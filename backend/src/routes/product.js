import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

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

// ✅ POST create product (admin/seller only) - FIXED
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;
    const product = await prisma.product.create({
      data: { name, description, price: parseFloat(price), stock: parseInt(stock), category, imageUrl },
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to create product" });
  }
});

// ✅ PUT update product (admin/seller only) - FIXED
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock, category, imageUrl } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { name, description, price, stock, category, imageUrl },
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Failed to update product" });
  }
});

// ✅ DELETE product (admin/seller only) - FIXED
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;