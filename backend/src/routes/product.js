import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ GET all products (public)
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          include: {
            parentCategory: true, // useful for frontend filters
          },
        },
      },
    });
    res.json(products);
  } catch (error) {
  console.error("❌ Error fetching products:", error);
  res.status(500).json({
    message: "Failed to fetch products",
    error: error.message,
    stack: error.stack
  });
}
});

// ✅ GET single product (public)
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: {
          include: {
            parentCategory: true,
          },
        },
      },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// ✅ POST create product (Admin only)
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  console.log("📥 Received POST /api/products");
  console.log("🧾 Body:", req.body);

  try {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;
    console.log("🧠 Parsed fields:", { name, price, stock, categoryId });

    if (!name || !price || !stock || !categoryId) {
      console.log("🚫 Missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log("🔍 Looking up category...");
    const category = await prisma.category.findUnique({ where: { id: categoryId } });

    if (!category) {
      console.log("❌ Invalid category ID:", categoryId);
      return res.status(400).json({ message: "Invalid category" });
    }

    // 🚫 Prevent products in parent categories
    if (category.parentId === null) {
      console.log("⚠️ Category is a parent category, not allowed:", categoryId);
      return res.status(400).json({ message: "Products can only be added to subcategories" });
    }

    console.log("✅ Creating product...");
    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        imageUrl: imageUrl || null,
      },
    });

    console.log("🎉 Product created successfully:", product);
    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Error creating product:", error);
    if (error.code) console.error("💡 Prisma Error Code:", error.code);
    if (error.meta) console.error("📦 Prisma Meta:", error.meta);
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
      stack: error.stack,
    });
  }
});


// ✅ PUT update product (Admin only)
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, stock, categoryId, imageUrl } = req.body;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) return res.status(400).json({ message: "Invalid category" });

    // 🚫 Prevent products being moved to parent categories
    if (category.parentId === null)
      return res
        .status(400)
        .json({ message: "Products can only belong to subcategories" });

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        imageUrl,
      },
    });

    res.json(product);
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});

// ✅ DELETE product (Admin only)
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

export default router;
