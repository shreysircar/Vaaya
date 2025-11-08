import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import productRoutes from "./routes/product.js";
import authRoutes from "./routes/auth.js";
import orderRoutes from "./routes/order.js";
import categoryRoutes from "./routes/category.js";
import userRoutes from "./routes/user.js";
import homepageSectionsRouter from "./routes/homepageSections.js";
import cartRoutes from "./routes/cart.js";
import wishlistRoutes from "./routes/wishlist.js";
import checkoutRouter from "./routes/checkout.js";
import searchRoutes from "./routes/search.js";
import announcementRoutes from "./routes/announcement.js";
import saleRoutes from "./routes/sale.js";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", userRoutes); // GET /api/admin/users
app.use("/api/homepage-sections", homepageSectionsRouter);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/checkout", checkoutRouter);
app.use("/api/search", searchRoutes);
app.use("/api/announcement", announcementRoutes);
app.use("/api/sales", saleRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
