import express from "express";
import prisma from "../prismaClient.js";

const router = express.Router();

// ✅ GET user's wishlist
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const wishlist = await prisma.wishlist.findFirst({
      where: { userId },
      include: {
        items: { include: { product: true } },
      },
    });

    res.json(wishlist || { items: [] });
  } catch (err) {
    console.error("Error fetching wishlist:", err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
});

// ✅ ADD or TOGGLE wishlist item
router.post("/", async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let wishlist = await prisma.wishlist.findFirst({ where: { userId } });
    if (!wishlist) {
      wishlist = await prisma.wishlist.create({ data: { userId } });
    }

    const existingItem = await prisma.wishlistItem.findFirst({
      where: { wishlistId: wishlist.id, productId },
    });

    if (existingItem) {
      await prisma.wishlistItem.delete({ where: { id: existingItem.id } });
      return res.json({ message: "Removed from wishlist" });
    } else {
      await prisma.wishlistItem.create({
        data: { wishlistId: wishlist.id, productId },
      });
      return res.json({ message: "Added to wishlist" });
    }
  } catch (err) {
    console.error("Error updating wishlist:", err);
    res.status(500).json({ error: "Failed to update wishlist" });
  }
});

// ✅ CLEAR entire wishlist
router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const wishlist = await prisma.wishlist.findFirst({ where: { userId } });
    if (!wishlist) return res.status(404).json({ error: "Wishlist not found" });

    await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id } });
    res.json({ message: "Wishlist cleared successfully" });
  } catch (err) {
    console.error("Error clearing wishlist:", err);
    res.status(500).json({ error: "Failed to clear wishlist" });
  }
});

export default router;
