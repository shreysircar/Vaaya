import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Optional: clear existing data (for dev/testing only)
  await prisma.orderItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // ===== PARENT CATEGORIES =====
  const electronics = await prisma.category.create({
    data: { name: "Electronics" },
  });

  const fashion = await prisma.category.create({
    data: { name: "Fashion" },
  });

  const home = await prisma.category.create({
    data: { name: "Home & Kitchen" },
  });

  const sports = await prisma.category.create({
    data: { name: "Sports" },
  });

  // ===== SUBCATEGORIES =====
  const mobiles = await prisma.category.create({
    data: { name: "Mobiles", parentId: electronics.id },
  });
  const laptops = await prisma.category.create({
    data: { name: "Laptops", parentId: electronics.id },
  });
  const mensWear = await prisma.category.create({
    data: { name: "Men’s Wear", parentId: fashion.id },
  });
  const womensWear = await prisma.category.create({
    data: { name: "Women’s Wear", parentId: fashion.id },
  });
  const kitchen = await prisma.category.create({
    data: { name: "Kitchen Appliances", parentId: home.id },
  });
  const decor = await prisma.category.create({
    data: { name: "Home Decor", parentId: home.id },
  });
  const fitness = await prisma.category.create({
    data: { name: "Fitness Equipment", parentId: sports.id },
  });
  const outdoor = await prisma.category.create({
    data: { name: "Outdoor Gear", parentId: sports.id },
  });

  // ===== PRODUCTS =====
  await prisma.product.createMany({
    data: [
      // Mobiles
      {
        name: "iPhone 15 Pro",
        description: "Apple smartphone with A17 Pro chip and 48MP camera",
        price: 1299.99,
        stock: 20,
        categoryId: mobiles.id,
        imageUrl: "https://example.com/iphone15.jpg",
      },
      {
        name: "Samsung Galaxy S24",
        description: "Flagship Android phone with AMOLED display and 200MP camera",
        price: 999.99,
        stock: 30,
        categoryId: mobiles.id,
        imageUrl: "https://example.com/galaxyS24.jpg",
      },

      // Laptops
      {
        name: "MacBook Air M3",
        description: "Lightweight laptop with M3 chip and 18-hour battery life",
        price: 1499.99,
        stock: 15,
        categoryId: laptops.id,
        imageUrl: "https://example.com/macbook.jpg",
      },
      {
        name: "Dell XPS 13",
        description: "Compact and powerful ultrabook for professionals",
        price: 1199.99,
        stock: 25,
        categoryId: laptops.id,
        imageUrl: "https://example.com/xps13.jpg",
      },

      // Men’s Wear
      {
        name: "Men’s Cotton T-Shirt",
        description: "100% cotton, breathable and durable",
        price: 19.99,
        stock: 100,
        categoryId: mensWear.id,
        imageUrl: "https://example.com/mens-tshirt.jpg",
      },

      // Kitchen
      {
        name: "Philips Air Fryer",
        description: "Healthy frying with Rapid Air technology",
        price: 129.99,
        stock: 40,
        categoryId: kitchen.id,
        imageUrl: "https://example.com/airfryer.jpg",
      },

      // Fitness
      {
        name: "Adjustable Dumbbell Set (20kg)",
        description: "All-in-one dumbbell set for home workouts",
        price: 89.99,
        stock: 60,
        categoryId: fitness.id,
        imageUrl: "https://example.com/dumbbells.jpg",
      },

      // Outdoor
      {
        name: "Camping Tent (4 Person)",
        description: "Waterproof and windproof tent with easy setup",
        price: 199.99,
        stock: 10,
        categoryId: outdoor.id,
        imageUrl: "https://example.com/tent.jpg",
      },
    ],
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
