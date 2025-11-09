import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import { isSaleActive, applySale, saleAppliesToProduct } from "../utils/saleUtils.js";

const router = express.Router();
const prisma = new PrismaClient();

// Allowed order statuses
const allowedStatuses = ["pending", "shipped", "delivered", "cancelled"];

/* =========================================================
 ✅ GET /api/orders/user → Fetch all orders for the logged-in user
========================================================= */
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!orders || orders.length === 0) {
      return res.json([]); // No orders yet
    }

    const now = new Date();
    const activeSales = await prisma.sale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { parentCategory: true, subCategory: true, product: true },
    });

    const enrichedOrders = orders.map((order) => {
      const enrichedItems = order.items.map((item) => {
        const product = item.product;
        const matchedSale = activeSales.find((s) =>
          saleAppliesToProduct(s, product)
        );

        if (matchedSale && isSaleActive(matchedSale)) {
          const discountedPrice = applySale(product.price, matchedSale);
          product.discountedPrice = discountedPrice;
          product.saleInfo = {
            title: matchedSale.title,
            discountType: matchedSale.discountType,
            discountValue: matchedSale.discountValue,
          };
        }

        return { ...item, product };
      });

      return { ...order, items: enrichedItems };
    });

    console.log("🧾 Returning user orders:", enrichedOrders.length);
    res.json(enrichedOrders);
  } catch (err) {
    console.error("❌ Error fetching user orders:", err);
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
});

/* =========================================================
 ✅ GET /api/orders/user/:id → Fetch details for one order (owned by user)
========================================================= */
router.get("/user/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const order = await prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, imageUrl: true },
            },
          },
        },
      },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error("❌ Error fetching order details:", err);
    res.status(500).json({ message: "Failed to fetch order details" });
  }
});

/* =========================================================
 ⚙️ GET /api/orders → Admin list (with optional pagination)
========================================================= */
router.get("/", authMiddleware, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: { include: { parentCategory: true, subCategory: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    });

    const now = new Date();
    const activeSales = await prisma.sale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { parentCategory: true, subCategory: true, product: true },
    });

    const enrichedOrders = orders.map((order) => {
      const enrichedItems = order.items.map((item) => {
        const product = item.product;
        const matchedSale = activeSales.find((s) => saleAppliesToProduct(s, product));

        if (matchedSale && isSaleActive(matchedSale)) {
          const discountedPrice = applySale(product.price, matchedSale);
          product.discountedPrice = discountedPrice;
          product.saleInfo = {
            title: matchedSale.title,
            discountType: matchedSale.discountType,
            discountValue: matchedSale.discountValue,
          };
        }

        return { ...item, product };
      });

      return { ...order, items: enrichedItems };
    });

    res.json(enrichedOrders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================================
 ⚙️ GET /api/orders/:id → Admin Order details
========================================================= */
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: {
          include: { product: { include: { parentCategory: true, subCategory: true } } },
        },
      },
    });

    if (!order) return res.status(404).json({ message: "Order not found" });

    const now = new Date();
    const activeSales = await prisma.sale.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: { parentCategory: true, subCategory: true, product: true },
    });

    const enrichedItems = order.items.map((item) => {
      const product = item.product;
      const matchedSale = activeSales.find((s) => saleAppliesToProduct(s, product));

      if (matchedSale && isSaleActive(matchedSale)) {
        const discountedPrice = applySale(product.price, matchedSale);
        product.discountedPrice = discountedPrice;
        product.saleInfo = {
          title: matchedSale.title,
          discountType: matchedSale.discountType,
          discountValue: matchedSale.discountValue,
        };
      }

      return { ...item, product };
    });

    res.json({ ...order, items: enrichedItems });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================================
 ⚙️ PUT /api/orders/:id/status → Update order status
========================================================= */
router.put("/:id/status", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true, price: true } } } },
      },
    });
    res.json(order);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ message: "Order not found" });
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
