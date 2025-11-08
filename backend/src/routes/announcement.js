import express from "express";
import prisma from "../prismaClient.js";


const router = express.Router();

/* ----------------------------------------
   📢 GET Active Announcement (Public Route)
---------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const announcement = await prisma.announcement.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!announcement) return res.status(200).json({ message: null });

    res.json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    res.status(500).json({ error: "Failed to fetch announcement" });
  }
});

/* ----------------------------------------
   🛠️ POST Create New Announcement (Admin Only)
---------------------------------------- */
router.post("/", async (req, res) => {
  try {
    const { message, isActive = true } = req.body;

    if (!message) return res.status(400).json({ error: "Message is required" });

    // deactivate any previous active announcements
    if (isActive) {
      await prisma.announcement.updateMany({ data: { isActive: false } });
    }

    const newAnnouncement = await prisma.announcement.create({
      data: { message, isActive },
    });

    res.status(201).json(newAnnouncement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

/* ----------------------------------------
   ✏️ PUT Update Existing Announcement (Optional)
---------------------------------------- */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { message, isActive } = req.body;

    const updated = await prisma.announcement.update({
      where: { id: parseInt(id) },
      data: { message, isActive },
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating announcement:", error);
    res.status(500).json({ error: "Failed to update announcement" });
  }
});

/* ----------------------------------------
   ❌ DELETE Announcement
---------------------------------------- */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.announcement.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Announcement deleted" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});

export default router;
