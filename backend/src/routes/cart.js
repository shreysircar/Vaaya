import express from "express";
import prisma from "../prismaClient.js";

const router = express.Router();

// ✅ GET user's cart (with product info)
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json(cart || { items: [] });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});

// ✅ ADD or UPDATE item in cart
router.post("/", async (req, res) => {
  const { userId, productId, quantity, price } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + (quantity || 1),
        },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: quantity || 1,
          price: price || 0,
        },
      });
    }

    res.json({ message: "Item added/updated in cart" });
  } catch (err) {
    console.error("Error updating cart:", err);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});

// ✅ REMOVE item from cart
router.delete("/:userId/:productId", async (req, res) => {
  const { userId, productId } = req.params;
  try {
    const cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });

    res.json({ message: "Item removed from cart" });
  } catch (err) {
    console.error("Error removing item:", err);
    res.status(500).json({ error: "Failed to remove item" });
  }
});

// ✅ CLEAR entire cart
router.delete("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ message: "Cart cleared successfully" });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
});

export default router;
