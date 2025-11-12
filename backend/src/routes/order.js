import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import { isSaleActive, applySale, saleAppliesToProduct } from "../utils/saleUtils.js";

const router = express.Router();
const prisma = new PrismaClient();

// Allowed order statuses
const allowedStatuses = ["pending", "packing", "shipped", "delivered", "cancelled"];

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
 ⚙️ PUT /api/orders/:id/status → Update order status (no backtracking)
========================================================= */
router.put("/:id/status", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const existingOrder = await prisma.order.findUnique({ where: { id } });
    if (!existingOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Enforce forward-only flow
    const currentIndex = allowedStatuses.indexOf(existingOrder.status);
    const newIndex = allowedStatuses.indexOf(status);

    // Disallow moving backwards (e.g., shipped → pending)
    if (newIndex < currentIndex) {
      return res.status(400).json({
        message: `Invalid transition: cannot move from '${existingOrder.status}' back to '${status}'`,
      });
    }

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
/* =========================================================
 📊 GET /api/orders/analytics/summary → Admin analytics data
========================================================= */
router.get("/analytics/summary", authMiddleware, async (req, res) => {
  try {
    // 1️⃣ Aggregate total orders by status
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const statusData = allowedStatuses.map((s) => ({
      status: s,
      count: statusCounts.find((x) => x.status === s)?._count.status || 0,
    }));

    // 2️⃣ Calculate total revenue
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
    });

    // 3️⃣ Revenue trends

    // (a) Revenue for last 30 days (daily)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const revenueLast30Days = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") AS date,
        SUM(total)::float AS revenue,
        COUNT(*)::int AS orders
      FROM "Order"
      WHERE "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `;

    const trend30Days = [];
    for (let i = 0; i < 30; i++) {
      // ✅ FIXED: base date from thirtyDaysAgo, not new Date()
      const d = new Date(thirtyDaysAgo);
      d.setDate(thirtyDaysAgo.getDate() + i);

      const dayStr = d.toISOString().split("T")[0];
      const found = revenueLast30Days.find((x) => {
        const dbDate =
          typeof x.date === "string"
            ? x.date.split("T")[0]
            : x.date.toISOString().split("T")[0];
        return dbDate === dayStr;
      });

      trend30Days.push({
        date: dayStr,
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      });
    }

    // (b) Revenue per month for the current year
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const revenueByMonthRaw = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") AS month,
        SUM(total)::float AS revenue,
        COUNT(*)::int AS orders
      FROM "Order"
      WHERE "createdAt" >= ${startOfYear}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    // ✅ FIXED: Fill missing months (Jan–Dec) even if no orders
    const revenueByMonth = [];
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(new Date().getFullYear(), i, 1);
      const found = revenueByMonthRaw.find(
        (r) =>
          new Date(r.month).getMonth() === monthDate.getMonth()
      );
      revenueByMonth.push({
        month: monthDate.toLocaleString("default", { month: "short" }),
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      });
    }

    // 4️⃣ Top 5 products by quantity ordered
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const productDetails = await prisma.product.findMany({
      where: { id: { in: topProducts.map((p) => p.productId) } },
      select: { id: true, name: true },
    });

    const enrichedTopProducts = topProducts.map((p) => ({
      productId: p.productId,
      name:
        productDetails.find((pd) => pd.id === p.productId)?.name || "Unknown",
      quantity: p._sum.quantity || 0,
    }));

    // 5️⃣ Parent Category analytics
    const categorySales = await prisma.$queryRaw`
      SELECT 
        COALESCE(pc.name, 'Uncategorized') AS category,
        SUM(oi.quantity * oi.price)::float AS revenue,
        SUM(oi.quantity)::int AS total_items
      FROM "OrderItem" oi
      JOIN "Product" p ON oi."productId" = p.id
      LEFT JOIN "ParentCategory" pc ON p."parentCategoryId" = pc.id
      GROUP BY pc.name
      ORDER BY revenue DESC
      LIMIT 10
    `;

    // 6️⃣ Additional metrics
    const totalOrders = await prisma.order.count();
    const deliveredOrders = await prisma.order.count({
      where: { status: "delivered" },
    });
    const cancelledOrders = await prisma.order.count({
      where: { status: "cancelled" },
    });

    // 7️⃣ Combine all results
    res.json({
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      deliveredOrders,
      cancelledOrders,
      statusData,
      trend30Days,      // ✅ daily (for line chart)
      revenueByMonth,   // ✅ monthwise (for bar chart)
      topProducts: enrichedTopProducts,
      categorySales,
    });
  } catch (err) {
    console.error("❌ Analytics fetch error:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

export default router;
