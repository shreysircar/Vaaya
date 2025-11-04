import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/* 🧭 GET all products (public)                                               */
/* -------------------------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        parentCategory: true,
        subCategory: true,
      },
    });
    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
      stack: error.stack,
    });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧭 GET single product (public)                                             */
/* -------------------------------------------------------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        parentCategory: true,
        subCategory: true,
      },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 POST: Create Product (Admin only)                                       */
/* -------------------------------------------------------------------------- */
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      parentCategoryId,
      subCategoryId,
      imageUrl,
      imageUrls, // ✅ NEW FIELD
    } = req.body;

    if (!name || !price || !stock || !parentCategoryId || !subCategoryId) {
      return res
        .status(400)
        .json({ message: "Missing required fields (parent + subcategory)" });
    }

    // ✅ Validate ParentCategory
    const parent = await prisma.parentCategory.findUnique({
      where: { id: parentCategoryId },
    });
    if (!parent) {
      return res.status(400).json({ message: "Invalid parent category" });
    }

    // ✅ Validate SubCategory (and ensure it belongs to this parent)
    const sub = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });
    if (!sub || sub.parentCategoryId !== parentCategoryId) {
      return res.status(400).json({
        message:
          "Invalid subcategory or subcategory does not belong to this parent category",
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        stock: parseInt(stock),
        parentCategoryId,
        subCategoryId,
        imageUrl: imageUrl || null,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [], // ✅ safe fallback
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 PUT: Update Product (Admin only)                                       */
/* -------------------------------------------------------------------------- */
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      parentCategoryId,
      subCategoryId,
      imageUrl,
      imageUrls, // ✅ NEW FIELD
    } = req.body;

    if (!parentCategoryId || !subCategoryId)
      return res.status(400).json({
        message: "Both parentCategoryId and subCategoryId are required",
      });

    const parent = await prisma.parentCategory.findUnique({
      where: { id: parentCategoryId },
    });
    const sub = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });

    if (!parent || !sub)
      return res
        .status(400)
        .json({ message: "Invalid parent or subcategory" });

    if (sub.parentCategoryId !== parentCategoryId)
      return res.status(400).json({
        message:
          "Subcategory does not belong to the provided parent category",
      });

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        parentCategoryId,
        subCategoryId,
        imageUrl,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : undefined, // ✅ optional safe update
      },
    });

    res.json(product);
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 DELETE: Product (Admin only)                                           */
/* -------------------------------------------------------------------------- */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deleted = await prisma.product.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Product deleted successfully", deleted });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 POST /api/products/by-ids - fetch specific products by ID list          */
/* -------------------------------------------------------------------------- */
router.post("/by-ids", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or missing product IDs" });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
    });

    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products by IDs:", error);
    res.status(500).json({ error: "Failed to fetch products by IDs" });
  }
});

export default router;
