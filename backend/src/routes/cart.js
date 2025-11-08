import express from "express";
import prisma from "../prismaClient.js";
import { isSaleActive, applySale, saleAppliesToProduct } from "../utils/saleUtils.js";


const router = express.Router();

// ✅ GET user's cart (with product info)
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    // 🟢 1️⃣ Fetch the user's cart with product info
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart) return res.json({ items: [] });

    // 🟢 2️⃣ Fetch all currently active sales
    const now = new Date();
    const activeSales = await prisma.sale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        parentCategory: true,
        subCategory: true,
        product: true,
      },
    });

    // 🧮 3️⃣ Enrich cart items with discounts
    let total = 0;
    let discountedTotal = 0;

    const enrichedItems = cart.items.map((item) => {
      const product = item.product;
      let finalPrice = product.price;
      let discountInfo = null;

      const matchedSale = activeSales.find((sale) => saleAppliesToProduct(sale, product));
      if (matchedSale && isSaleActive(matchedSale)) {
        finalPrice = applySale(product.price, matchedSale);
        discountInfo = {
          title: matchedSale.title,
          discountType: matchedSale.discountType,
          discountValue: matchedSale.discountValue,
        };
      }

      const itemTotal = product.price * item.quantity;
      const itemDiscountedTotal = finalPrice * item.quantity;

      total += itemTotal;
      discountedTotal += itemDiscountedTotal;

      return {
        ...item,
        product: {
          ...product,
          discountedPrice: discountInfo ? finalPrice : null,
          saleInfo: discountInfo,
        },
      };
    });

    const response = {
      ...cart,
      items: enrichedItems,
      total,
      discountedTotal,
    };

    res.json(response);

  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
});
// ✅ ADD or UPDATE item in cart (stock-aware)
router.post("/", async (req, res) => {
  const { userId, productId, quantity, price } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 🟢 Get product stock info
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true, price: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });

    // 🟢 Get or create cart
    let cart = await prisma.cart.findFirst({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    const currentQty = existingItem?.quantity ?? 0;
    const desiredQty = currentQty + (quantity || 1);

    // 🟢 Validate against stock
    if (desiredQty > product.stock) {
      const available = Math.max(0, product.stock - currentQty);
      return res.status(400).json({
        error: `Only ${product.stock} units of ${product.name} available.`,
        available,
        currentQuantity: currentQty,
      });
    }

    // 🟢 Update or create
    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: desiredQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: quantity || 1,
          price: price ?? product.price ?? 0,
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

// ✅ UPDATE quantity (+ / -)
router.patch("/", async (req, res) => {
  try {
    const { userId, productId, delta } = req.body;
    if (!userId || !productId || typeof delta !== "number") {
      return res.status(400).json({ error: "Missing or invalid parameters" });
    }

    // 1️⃣ Find user's cart
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: { items: true },
    });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.find((i) => i.productId === productId);
    if (!item) return res.status(404).json({ error: "Item not found in cart" });

    // 2️⃣ Get current product stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, name: true },
    });
    if (!product) return res.status(404).json({ error: "Product not found" });

    // 3️⃣ Calculate new quantity
    const newQty = item.quantity + delta;

    if (newQty > product.stock) {
      return res.status(400).json({
        error: `Only ${product.stock} units of ${product.name} left.`,
        available: product.stock,
        currentQuantity: item.quantity,
      });
    }

    // If qty goes below 1, remove item
    if (newQty <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
      return res.json({ ok: true, removed: true });
    }

// 4️⃣ Update cart item
await prisma.cartItem.update({
  where: { id: item.id },
  data: { quantity: newQty },
});

// ✅ Return updated cart (saves frontend an extra refresh)
const updatedCart = await prisma.cart.findFirst({
  where: { userId },
  include: {
    items: {
      include: { product: true },
       orderBy: { createdAt: "asc" },
    },
  },
});

return res.json({ ok: true, cart: updatedCart });

  } catch (err) {
    console.error("PATCH /api/cart error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});



export default router;
