import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/categories → List all categories with products
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: { products: true } // include all products under each category
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// POST /api/categories → Create a new category
router.post("/", authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    const category = await prisma.category.create({ data: { name } });
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/categories/:id → Update category
router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params; // id is already a string
  const { name } = req.body;

  if (!name) return res.status(400).json({ message: "Name is required" });

  try {
    const category = await prisma.category.update({
      where: { id }, // use string id directly
      data: { name },
    });
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// DELETE /api/categories/:id → Delete category
router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.category.delete({ where: { id } }); // use string directly
    res.json({ message: "Category deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
