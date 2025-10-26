// backend/src/routes/user.js
import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET all users (Admin only)
router.get("/users", authMiddleware, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, isAdmin: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
