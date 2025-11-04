import express from "express";
import prisma from "../prismaClient.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

/**
 * ✅ GET all active homepage sections (for public homepage)
 * Example: GET /api/homepage-sections
 */
router.get("/", async (req, res) => {
  try {
    const sections = await prisma.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { orderIndex: "asc" },
      include: { linkedCategory: true },
    });
    res.json(sections);
  } catch (error) {
    console.error("Error fetching homepage sections:", error);
    res.status(500).json({ error: "Failed to load homepage sections" });
  }
});

/**
 * ✅ GET all homepage sections (for admin dashboard)
 * Example: GET /api/homepage-sections/admin
 */
router.get("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { orderIndex: "asc" },
      include: { linkedCategory: true },
    });
    res.json(sections);
  } catch (error) {
    console.error("Error fetching homepage sections (admin):", error);
    res.status(500).json({ error: "Failed to fetch homepage sections" });
  }
});

/**
 * ✅ POST create new homepage section
 * Example: POST /api/homepage-sections/admin
 */
router.post("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    let data = req.body;

    // 🧩 Normalize array fields
    data.categoryIds = Array.isArray(data.categoryIds)
      ? data.categoryIds
      : data.categoryIds
      ? [data.categoryIds]
      : [];

    data.linkedProductIds = Array.isArray(data.linkedProductIds)
      ? data.linkedProductIds
      : data.linkedProductIds
      ? [data.linkedProductIds]
      : [];

    data.imageUrls = Array.isArray(data.imageUrls)
      ? data.imageUrls
      : data.imageUrls
      ? [data.imageUrls]
      : [];

    // 🧩 Fix foreign key issue (convert "" → null)
    if (!data.linkedCategoryId || data.linkedCategoryId === "") {
      data.linkedCategoryId = null;
    }

    const newSection = await prisma.homepageSection.create({ data });
    res.status(201).json(newSection);
  } catch (error) {
    console.error("Error creating homepage section:", error);
    res.status(500).json({ error: "Failed to create section" });
  }
});

/**
 * ✅ PUT update existing homepage section
 * Example: PUT /api/homepage-sections/admin/:id
 */
router.put("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let data = req.body;

    // 🧩 Normalize arrays again for safety
    data.categoryIds = Array.isArray(data.categoryIds)
      ? data.categoryIds
      : data.categoryIds
      ? [data.categoryIds]
      : [];

    data.linkedProductIds = Array.isArray(data.linkedProductIds)
      ? data.linkedProductIds
      : data.linkedProductIds
      ? [data.linkedProductIds]
      : [];

    data.imageUrls = Array.isArray(data.imageUrls)
      ? data.imageUrls
      : data.imageUrls
      ? [data.imageUrls]
      : [];

    // 🧩 Fix foreign key violation
    if (!data.linkedCategoryId || data.linkedCategoryId === "") {
      data.linkedCategoryId = null;
    }

    const updatedSection = await prisma.homepageSection.update({
      where: { id },
      data,
    });

    res.json(updatedSection);
  } catch (error) {
    console.error("Error updating homepage section:", error);
    res.status(500).json({ error: "Failed to update section" });
  }
});

/**
 * ✅ DELETE homepage section
 * Example: DELETE /api/homepage-sections/admin/:id
 */
router.delete("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.homepageSection.delete({ where: { id } });
    res.json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("Error deleting homepage section:", error);
    res.status(500).json({ error: "Failed to delete section" });
  }
});

export default router;
