// backend/src/routes/checkout.js
import express from "express";
import prisma from "../prismaClient.js"; // your prisma client path

const router = express.Router();

/**
 * POST /api/checkout
 * Body: { userId: string }
 *
 * Assumptions:
 * - Your Cart model: Cart { id, userId, items: CartItem[] }
 * - CartItem has: productId, quantity, price (price optional; we fallback to product.price)
 * - Product has: id, name, price, stock
 *
 * Behavior:
 * - Fetch user's cart and items.
 * - If cart empty -> 400.
 * - Run one transaction:
 *    - For each item attempt conditional decrement using updateMany (stock >= qty).
 *    - If any updateMany returns count 0 -> rollback and respond 409 with product info.
 *    - Else create Order + OrderItems, then delete cart items for the user.
 */

router.post("/", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    // 1) Fetch user's cart and items (with product snapshot)
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Prepare cart items
    const cartItems = cart.items;

    // Optionally: verify payment here or ensure payment was successful prior to calling this endpoint.
    // For now we assume payment is handled by caller and confirmed.

    // 2) Transaction: attempt to decrement stock for all items, create order, clear cart
    try {
      const createdOrder = await prisma.$transaction(async (tx) => {
        // Decrement stock for each item, using optimistic conditional updates
        for (const item of cartItems) {
          const qty = item.quantity;
          const productId = item.productId;

          const updateRes = await tx.product.updateMany({
            where: {
              id: productId,
              stock: { gte: qty },
            },
            data: {
              stock: { decrement: qty },
            },
          });

          if (updateRes.count === 0) {
            // Not enough stock for this product -> abort transaction
            const err = new Error(`OUT_OF_STOCK:${productId}`);
            // mark for detection
            err.name = "OUT_OF_STOCK";
            throw err;
          }
        }

        // All stock updates succeeded -> create order + order items
        const total = cartItems.reduce((sum, it) => {
          const price = it.price ?? it.product?.price ?? 0;
          return sum + price * it.quantity;
        }, 0);

        const order = await tx.order.create({
          data: {
            userId,
            total,
            status: "paid", // adapt if you want 'pending' and finalize on payment webhook
            items: {
              createMany: {
                data: cartItems.map((it) => ({
                  productId: it.productId,
                  quantity: it.quantity,
                  price: it.price ?? it.product?.price ?? 0,
                })),
              },
            },
          },
          include: { items: true },
        });

        // Clear the cart items
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return order;
      });

      // Transaction committed successfully
      return res.status(200).json({ ok: true, order: createdOrder });
    } catch (txErr) {
      // Detect out-of-stock error thrown above
      if (txErr?.name === "OUT_OF_STOCK" || (txErr?.message && txErr.message.startsWith("OUT_OF_STOCK:"))) {
        const productId = txErr.message.split(":")[1];
        // fetch latest product info
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { id: true, name: true, stock: true },
        });

return res.status(409).json({
  ok: false,
  type: "OUT_OF_STOCK",
  product: {
    id: product?.id ?? productId,
    name: product?.name ?? "Unknown",
    stock: product?.stock ?? 0,
  },
  message: `Sorry, only ${product?.stock ?? 0} units of ${product?.name ?? "this product"} left.`,
});
      }

      // unknown transaction error
      console.error("Checkout transaction failed:", txErr);
      return res.status(500).json({ error: "Checkout failed" });
    }
  } catch (err) {
    console.error("POST /api/checkout error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
