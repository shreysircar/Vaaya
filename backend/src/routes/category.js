import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/* 🧭 GET all Parent Categories (with subcategories + products)               */
/* -------------------------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const parents = await prisma.parentCategory.findMany({
      include: {
        subcategories: {
          include: {
            products: true,
          },
        },
        products: true,
      },
      orderBy: { name: "asc" },
    });
    res.json(parents);
  } catch (err) {
    console.error("❌ Error fetching parent categories:", err);
    res.status(500).json({ message: "Server error fetching parent categories" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧭 GET all Subcategories (optionally filtered by parentCategoryId)         */
/* Example: GET /categories/sub?parentCategoryId=abc123                      */
/* -------------------------------------------------------------------------- */
router.get("/sub", async (req, res) => {
  try {
    const { parentCategoryId } = req.query;
    const where = parentCategoryId ? { parentCategoryId } : {};
    const subcategories = await prisma.subCategory.findMany({
      where,
      include: {
        parentCategory: true,
        products: true,
      },
      orderBy: { name: "asc" },
    });
    res.json(subcategories);
  } catch (err) {
    console.error("❌ Error fetching subcategories:", err);
    res.status(500).json({ message: "Server error fetching subcategories" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 POST: Create ParentCategory or SubCategory                              */
/* -------------------------------------------------------------------------- */
/*
  Example:
  { "name": "Electronics", "imageUrl": "https://..." }  -> Parent Category
  { "name": "Laptops", "parentCategoryId": "xyz" }      -> SubCategory
*/
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  const { name, parentCategoryId, description, imageUrl } = req.body; // ✅ added imageUrl
  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    if (parentCategoryId) {
      // 🧩 Create SubCategory
      const parent = await prisma.parentCategory.findUnique({
        where: { id: parentCategoryId },
      });
      if (!parent)
        return res.status(400).json({ message: "Invalid parent category ID" });

      const sub = await prisma.subCategory.create({
        data: { name, description: description || "", parentCategoryId },
      });
      return res.status(201).json(sub);
    } else {
      // 🧩 Create ParentCategory
      const parent = await prisma.parentCategory.create({
        data: { name, description: description || "", imageUrl: imageUrl || null }, // ✅ added
      });
      return res.status(201).json(parent);
    }
  } catch (err) {
    console.error("❌ Error creating category:", err);
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Category with this name already exists",
      });
    }
    res.status(500).json({ message: "Server error creating category" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 PUT: Update ParentCategory or SubCategory                               */
/* -------------------------------------------------------------------------- */
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, description, parentCategoryId, imageUrl } = req.body; // ✅ added imageUrl

  try {
    let updated;

    if (parentCategoryId) {
      // 🧩 Update SubCategory
      const parent = await prisma.parentCategory.findUnique({
        where: { id: parentCategoryId },
      });
      if (!parent)
        return res.status(400).json({ message: "Invalid parent category ID" });

      updated = await prisma.subCategory.update({
        where: { id },
        data: { name, description, parentCategoryId },
      });
    } else {
      // 🧩 Update ParentCategory
      updated = await prisma.parentCategory.update({
        where: { id },
        data: { name, description, imageUrl: imageUrl || null }, // ✅ added
      });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Error updating category:", err);
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Category with this name already exists",
      });
    }
    res.status(500).json({ message: "Server error updating category" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 DELETE: Delete ParentCategory or SubCategory                            */
/* -------------------------------------------------------------------------- */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { type } = req.query; // type = 'parent' or 'sub'

  try {
    if (type === "sub") {
      // 🧩 Delete SubCategory and its products
      await prisma.product.deleteMany({ where: { subCategoryId: id } });
      await prisma.subCategory.delete({ where: { id } });

      return res.json({
        message: "Subcategory and its products deleted successfully",
      });
    } else {
      // 🧩 Delete ParentCategory and cascade its subcategories/products
      const subcategories = await prisma.subCategory.findMany({
        where: { parentCategoryId: id },
      });

      for (const sub of subcategories) {
        await prisma.product.deleteMany({ where: { subCategoryId: sub.id } });
        await prisma.subCategory.delete({ where: { id: sub.id } });
      }

      await prisma.product.deleteMany({ where: { parentCategoryId: id } });
      await prisma.parentCategory.delete({ where: { id } });

      return res.json({
        message: "Parent category and all subcategories/products deleted",
      });
    }
  } catch (err) {
    console.error("❌ Error deleting category:", err);
    res.status(500).json({ message: "Server error deleting category" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧭 GET single ParentCategory (with subcategories + products)               */
/* -------------------------------------------------------------------------- */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const category = await prisma.parentCategory.findUnique({
      where: { id },
      include: {
        subcategories: {
          include: { products: true },
        },
        products: true, // directly under this category
      },
    });

    if (!category)
      return res.status(404).json({ message: "Category not found" });

    res.json(category);
  } catch (err) {
    console.error("❌ Error fetching category:", err);
    res.status(500).json({ message: "Server error fetching category" });
  }
});



export default router;
