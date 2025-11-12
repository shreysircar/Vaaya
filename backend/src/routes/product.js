import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";
import { isSaleActive, applySale, saleAppliesToProduct } from "../utils/saleUtils.js";


const router = express.Router();
const prisma = new PrismaClient();

/* -------------------------------------------------------------------------- */
/* 🧭 GET all products (public)                                               */
/* -------------------------------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    // 🕓 Fetch active sales
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

    // 🧩 Fetch products as before
    const products = await prisma.product.findMany({
      include: {
        parentCategory: true,
        subCategory: true,
        specifications: true,
      },
    });

    // 🧮 Append discounted price if any active sale applies
    const enriched = products.map((p) => {
      const matchedSale = activeSales.find((s) => saleAppliesToProduct(s, p));
      if (matchedSale && isSaleActive(matchedSale)) {
        p.discountedPrice = applySale(p.price, matchedSale);
        p.saleInfo = {
          title: matchedSale.title,
          discountType: matchedSale.discountType?.toUpperCase() || "FLAT",
          discountValue: matchedSale.discountValue,
        };
      }
      return p;
    });

    res.json(enriched);

  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
      stack: error.stack,
    });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧭 GET single product (public)                                             */
/* -------------------------------------------------------------------------- */
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        parentCategory: true,
        subCategory: true,
        specifications: true,
      },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

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

    const matchedSale = activeSales.find((s) => saleAppliesToProduct(s, product));
    if (matchedSale && isSaleActive(matchedSale)) {
      product.discountedPrice = applySale(product.price, matchedSale);
      product.saleInfo = {
        title: matchedSale.title,
        discountType: matchedSale.discountType?.toUpperCase() || "FLAT",
        discountValue: matchedSale.discountValue,
      };
    }

    res.json(product);

  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 POST: Create Product (Admin only)                                       */
/* -------------------------------------------------------------------------- */
router.post("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      parentCategoryId,
      subCategoryId,
      imageUrl,
      imageUrls,
      specifications, // ✅ new field
    } = req.body;

    if (!name || !price || !stock || !parentCategoryId || !subCategoryId) {
      return res
        .status(400)
        .json({ message: "Missing required fields (parent + subcategory)" });
    }

    // ✅ Validate ParentCategory
    const parent = await prisma.parentCategory.findUnique({
      where: { id: parentCategoryId },
    });
    if (!parent) {
      return res.status(400).json({ message: "Invalid parent category" });
    }

    // ✅ Validate SubCategory (and ensure it belongs to this parent)
    const sub = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });
    if (!sub || sub.parentCategoryId !== parentCategoryId) {
      return res.status(400).json({
        message:
          "Invalid subcategory or subcategory does not belong to this parent category",
      });
    }

    // ✅ Create Product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || "",
        price: parseFloat(price),
        stock: parseInt(stock),
        parentCategoryId,
        subCategoryId,
        imageUrl: imageUrl || null,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      },
    });

    // ✅ Add specifications if any (simple insert)
    if (Array.isArray(specifications) && specifications.length > 0) {
      const formattedSpecs = specifications
        .filter((s) => s.key && s.value)
        .map((s) => ({
          key: s.key,
          value: s.value,
          productId: product.id,
        }));

      if (formattedSpecs.length > 0) {
        await prisma.productSpecification.createMany({
          data: formattedSpecs,
        });
      }
    }

    // ✅ Return with specs included
    const createdProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: { specifications: true },
    });

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ message: "Failed to create product" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 PUT: Update Product (Admin only)                                       */
/* -------------------------------------------------------------------------- */
router.put("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      parentCategoryId,
      subCategoryId,
      imageUrl,
      imageUrls,
      specifications, // ✅ new field
    } = req.body;

    if (!parentCategoryId || !subCategoryId)
      return res.status(400).json({
        message: "Both parentCategoryId and subCategoryId are required",
      });

    const parent = await prisma.parentCategory.findUnique({
      where: { id: parentCategoryId },
    });
    const sub = await prisma.subCategory.findUnique({
      where: { id: subCategoryId },
    });

    if (!parent || !sub)
      return res
        .status(400)
        .json({ message: "Invalid parent or subcategory" });

    if (sub.parentCategoryId !== parentCategoryId)
      return res.status(400).json({
        message:
          "Subcategory does not belong to the provided parent category",
      });

    // ✅ Update product itself
    const updatedProduct = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        parentCategoryId,
        subCategoryId,
        imageUrl,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : undefined,
      },
    });

    // ✅ Handle specifications update (Smart merge/update)
    if (Array.isArray(specifications)) {
      const existingSpecs = await prisma.productSpecification.findMany({
        where: { productId: updatedProduct.id },
      });

      const incomingIds = specifications.map((s) => s.id).filter(Boolean);

      // 1️⃣ Delete specs missing in the new list
      const specsToDelete = existingSpecs.filter(
        (spec) => !incomingIds.includes(spec.id)
      );
      if (specsToDelete.length > 0) {
        await prisma.productSpecification.deleteMany({
          where: { id: { in: specsToDelete.map((s) => s.id) } },
        });
      }

      // 2️⃣ Upsert each incoming spec
      for (const spec of specifications) {
        if (spec.id) {
          await prisma.productSpecification.update({
            where: { id: spec.id },
            data: {
              key: spec.key,
              value: spec.value,
            },
          });
        } else {
          await prisma.productSpecification.create({
            data: {
              key: spec.key,
              value: spec.value,
              productId: updatedProduct.id,
            },
          });
        }
      }
    }

    const productWithSpecs = await prisma.product.findUnique({
      where: { id: updatedProduct.id },
      include: { specifications: true },
    });

    res.json(productWithSpecs);
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
});


/* -------------------------------------------------------------------------- */
/* 🧩 PUT: Update only specifications (Admin only, Transaction-Safe & Smart)  */
/* -------------------------------------------------------------------------- */
router.put("/:id/specifications", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { specifications } = req.body;
    const productId = req.params.id;

    if (!Array.isArray(specifications)) {
      return res.status(400).json({ message: "Invalid specifications format" });
    }

    const updatedProduct = await prisma.$transaction(async (tx) => {
      // 1️⃣ Get existing specs
      const existingSpecs = await tx.productSpecification.findMany({
        where: { productId },
      });

      const incomingIds = specifications.map((s) => s.id).filter(Boolean);

      // 2️⃣ Delete specs missing in the new list
      const specsToDelete = existingSpecs.filter(
        (spec) => !incomingIds.includes(spec.id)
      );
      if (specsToDelete.length > 0) {
        await tx.productSpecification.deleteMany({
          where: { id: { in: specsToDelete.map((s) => s.id) } },
        });
      }

      // 3️⃣ Upsert each spec
      for (const spec of specifications) {
        if (spec.id) {
          await tx.productSpecification.update({
            where: { id: spec.id },
            data: {
              key: spec.key,
              value: spec.value,
            },
          });
        } else {
          await tx.productSpecification.create({
            data: {
              key: spec.key,
              value: spec.value,
              productId,
            },
          });
        }
      }

      // 4️⃣ Return updated product
      return tx.product.findUnique({
        where: { id: productId },
        include: { specifications: true },
      });
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error("❌ Error updating specifications:", error);
    res.status(500).json({ message: "Failed to update specifications" });
  }
});


/* -------------------------------------------------------------------------- */
/* 🧩 DELETE: Product (Admin only)                                           */
/* -------------------------------------------------------------------------- */
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await prisma.productSpecification.deleteMany({
      where: { productId: req.params.id },
    });

    const deleted = await prisma.product.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Product deleted successfully", deleted });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

/* -------------------------------------------------------------------------- */
/* 🧩 POST /api/products/by-ids - fetch specific products by ID list          */
/* -------------------------------------------------------------------------- */
router.post("/by-ids", async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Invalid or missing product IDs" });
    }

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: { specifications: true },
    });

    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching products by IDs:", error);
    res.status(500).json({ error: "Failed to fetch products by IDs" });
  }
});


/* -------------------------------------------------------------------------- */
/* 🔍 GET products with optional filters (search, category, subcategory)      */
/* Example: /api/products/search?query=phone&parentCategoryId=abc&subCategoryId=xyz */
/* -------------------------------------------------------------------------- */
router.get("/search", async (req, res) => {
  try {
    const { query, parentCategoryId, subCategoryId } = req.query;

    const where = {
      ...(query && {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      }),
      ...(parentCategoryId && { parentCategoryId }),
      ...(subCategoryId && { subCategoryId }),
    };

    const products = await prisma.product.findMany({
      where,
      include: {
        parentCategory: true,
        subCategory: true,
        specifications: true,
      },
      orderBy: { name: "asc" },
    });

    res.json(products);
  } catch (error) {
    console.error("❌ Error fetching filtered products:", error);
    res.status(500).json({ message: "Failed to fetch filtered products" });
  }
});


export default router;
