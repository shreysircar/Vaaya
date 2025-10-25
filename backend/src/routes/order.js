import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// Allowed order statuses
const allowedStatuses = ["pending", "shipped", "delivered", "cancelled"];

// GET /api/orders → List orders (with optional pagination)
router.get("/", authMiddleware, async (req, res) => {
  const { page = 1, limit = 20 } = req.query; // default pagination
  const skip = (Number(page) - 1) * Number(limit);

  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true, price: true } } } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: Number(limit),
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/orders/:id → Order details
router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true, price: true } } } },
      },
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/orders/:id/status → Update order status
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
