import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// ✅ GET all categories (with subcategories)
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { parentId: null },
      include: {
        subcategories: {
          include: { products: true },
        },
        products: true,
      },
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST create new category or subcategory
router.post("/", authMiddleware, async (req, res) => {
  const { name, parentId } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    const category = await prisma.category.create({
      data: { name, parentId: parentId || null },
    });
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ PUT update category name or parent
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, parentId } = req.body;

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name, parentId: parentId || null },
    });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ DELETE category (recursive for parent, independent for subcategories)
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    // Check if this category is a parent (no parentId)
    const category = await prisma.category.findUnique({
      where: { id },
      include: { subcategories: true },
    });

    if (!category) return res.status(404).json({ message: "Category not found" });

    if (!category.parentId) {
      // 🧩 Parent Category Deletion: delete subcategories + their products + parent products
      for (const sub of category.subcategories) {
        await prisma.product.deleteMany({ where: { categoryId: sub.id } });
        await prisma.category.delete({ where: { id: sub.id } });
      }

      await prisma.product.deleteMany({ where: { categoryId: id } });
      await prisma.category.delete({ where: { id } });

      return res.json({ message: "Parent category and its subcategories/products deleted" });
    } else {
      // 🧩 Subcategory Deletion: delete only subcategory, keep its products
      await prisma.category.delete({ where: { id } });
      return res.json({ message: "Subcategory deleted (products retained)" });
    }
  } catch (err) {
    console.error("❌ Error deleting category:", err);
    res.status(500).json({ message: "Server error while deleting category" });
  }
});

export default router;
