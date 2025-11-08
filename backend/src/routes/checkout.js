// backend/src/routes/checkout.js
import express from "express";
import prisma from "../prismaClient.js";
import { isSaleActive, applySale, saleAppliesToProduct } from "../utils/saleUtils.js"; // 🧩 Add this import

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    // 1️⃣ Fetch user's cart
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: { product: { include: { parentCategory: true, subCategory: true } } },
        },
      },
    });

    if (!cart || !cart.items?.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const cartItems = cart.items;

    // 🟢 2️⃣ Fetch currently active sales
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

    // 🧮 3️⃣ Prepare cart items with applied discounts
    const enrichedItems = cartItems.map((item) => {
      const product = item.product;
      const matchedSale = activeSales.find((sale) => saleAppliesToProduct(sale, product));

      let finalPrice = product.price;
      if (matchedSale && isSaleActive(matchedSale)) {
        finalPrice = applySale(product.price, matchedSale);
      }

      return {
        ...item,
        finalPrice,
        saleInfo: matchedSale
          ? {
              title: matchedSale.title,
              discountType: matchedSale.discountType,
              discountValue: matchedSale.discountValue,
            }
          : null,
      };
    });

    // ✅ 4️⃣ Transaction: decrement stock, create order, clear cart
    try {
      const createdOrder = await prisma.$transaction(async (tx) => {
        // Stock check and decrement
        for (const item of enrichedItems) {
          const qty = item.quantity;
          const productId = item.productId;

          const updateRes = await tx.product.updateMany({
            where: { id: productId, stock: { gte: qty } },
            data: { stock: { decrement: qty } },
          });

          if (updateRes.count === 0) {
            const err = new Error(`OUT_OF_STOCK:${productId}`);
            err.name = "OUT_OF_STOCK";
            throw err;
          }
        }

        // 🧾 5️⃣ Calculate totals
        const total = enrichedItems.reduce(
          (sum, it) => sum + it.product.price * it.quantity,
          0
        );
        const discountedTotal = enrichedItems.reduce(
          (sum, it) => sum + it.finalPrice * it.quantity,
          0
        );

        // 🧱 6️⃣ Create order with discounted total
        const order = await tx.order.create({
          data: {
            userId,
            total: discountedTotal, // 🧩 use discounted total here
            status: "paid",
            items: {
              createMany: {
                data: enrichedItems.map((it) => ({
                  productId: it.productId,
                  quantity: it.quantity,
                  price: it.finalPrice, // 🧩 store discounted price per item
                })),
              },
            },
          },
          include: { items: true },
        });

        // Clear cart
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

        return { ...order, totalBeforeDiscount: total };
      });

      return res.status(200).json({ ok: true, order: createdOrder });
    } catch (txErr) {
      if (txErr?.name === "OUT_OF_STOCK" || txErr?.message?.startsWith("OUT_OF_STOCK:")) {
        const productId = txErr.message.split(":")[1];
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

      console.error("Checkout transaction failed:", txErr);
      return res.status(500).json({ error: "Checkout failed" });
    }
  } catch (err) {
    console.error("POST /api/checkout error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
