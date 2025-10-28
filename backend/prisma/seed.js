import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding furniture data...')

  // Clear existing data
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.subCategory.deleteMany()
  await prisma.parentCategory.deleteMany()

  // Create Furniture Parent Categories
  const livingRoom = await prisma.parentCategory.create({
    data: {
      name: 'Living Room',
      description: 'Sofas, chairs, tables and living room essentials'
    }
  })

  const bedroom = await prisma.parentCategory.create({
    data: {
      name: 'Bedroom',
      description: 'Beds, mattresses, wardrobes and bedroom furniture'
    }
  })

  const diningRoom = await prisma.parentCategory.create({
    data: {
      name: 'Dining Room',
      description: 'Dining tables, chairs and dining sets'
    }
  })

  const officeFurniture = await prisma.parentCategory.create({
    data: {
      name: 'Office Furniture',
      description: 'Desks, office chairs and workspace solutions'
    }
  })

  const outdoorFurniture = await prisma.parentCategory.create({
    data: {
      name: 'Outdoor Furniture',
      description: 'Patio sets, garden furniture and outdoor decor'
    }
  })

  const storage = await prisma.parentCategory.create({
    data: {
      name: 'Storage & Decor',
      description: 'Shelves, cabinets, and home decor items'
    }
  })

  // Create SubCategories
  // Living Room subcategories
  const sofas = await prisma.subCategory.create({
    data: {
      name: 'Sofas & Couches',
      description: 'Comfortable seating for your living room',
      parentCategoryId: livingRoom.id
    }
  })

  const coffeeTables = await prisma.subCategory.create({
    data: {
      name: 'Coffee Tables',
      description: 'Center tables and side tables',
      parentCategoryId: livingRoom.id
    }
  })

  const tvStands = await prisma.subCategory.create({
    data: {
      name: 'TV Stands & Entertainment',
      description: 'TV units and media consoles',
      parentCategoryId: livingRoom.id
    }
  })

  // Bedroom subcategories
  const beds = await prisma.subCategory.create({
    data: {
      name: 'Beds & Headboards',
      description: 'Bed frames and headboards',
      parentCategoryId: bedroom.id
    }
  })

  const mattresses = await prisma.subCategory.create({
    data: {
      name: 'Mattresses',
      description: 'Memory foam, spring and hybrid mattresses',
      parentCategoryId: bedroom.id
    }
  })

  const wardrobes = await prisma.subCategory.create({
    data: {
      name: 'Wardrobes & Dressers',
      description: 'Clothing storage solutions',
      parentCategoryId: bedroom.id
    }
  })

  // Dining Room subcategories
  const diningTables = await prisma.subCategory.create({
    data: {
      name: 'Dining Tables',
      description: 'Wooden, glass and metal dining tables',
      parentCategoryId: diningRoom.id
    }
  })

  const diningChairs = await prisma.subCategory.create({
    data: {
      name: 'Dining Chairs',
      description: 'Dining chairs and seating',
      parentCategoryId: diningRoom.id
    }
  })

  // Office Furniture subcategories
  const officeDesks = await prisma.subCategory.create({
    data: {
      name: 'Office Desks',
      description: 'Work desks and computer tables',
      parentCategoryId: officeFurniture.id
    }
  })

  const officeChairs = await prisma.subCategory.create({
    data: {
      name: 'Office Chairs',
      description: 'Ergonomic office chairs',
      parentCategoryId: officeFurniture.id
    }
  })

  // Outdoor Furniture subcategories
  const patioSets = await prisma.subCategory.create({
    data: {
      name: 'Patio Sets',
      description: 'Outdoor dining and seating sets',
      parentCategoryId: outdoorFurniture.id
    }
  })

  const gardenFurniture = await prisma.subCategory.create({
    data: {
      name: 'Garden Furniture',
      description: 'Individual outdoor furniture pieces',
      parentCategoryId: outdoorFurniture.id
    }
  })

  // Storage & Decor subcategories
  const shelves = await prisma.subCategory.create({
    data: {
      name: 'Shelves & Bookcases',
      description: 'Wall shelves and bookcases',
      parentCategoryId: storage.id
    }
  })

  const cabinets = await prisma.subCategory.create({
    data: {
      name: 'Cabinets & Sideboards',
      description: 'Storage cabinets and sideboards',
      parentCategoryId: storage.id
    }
  })

  const homeDecor = await prisma.subCategory.create({
    data: {
      name: 'Home Decor',
      description: 'Decorative items and accessories',
      parentCategoryId: storage.id
    }
  })

  // Create Products - Living Room
  await prisma.product.createMany({
    data: [
      {
        name: 'Modern Leather Sofa',
        description: '3-seater genuine leather sofa with wooden legs',
        price: 1299.99,
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        parentCategoryId: livingRoom.id,
        subCategoryId: sofas.id
      },
      {
        name: 'Fabric Sectional Sofa',
        description: 'L-shaped sectional sofa with chaise lounge',
        price: 1599.99,
        stock: 10,
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
        parentCategoryId: livingRoom.id,
        subCategoryId: sofas.id
      },
      {
        name: 'Glass Top Coffee Table',
        description: 'Modern coffee table with tempered glass top',
        price: 299.99,
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
        parentCategoryId: livingRoom.id,
        subCategoryId: coffeeTables.id
      },
      {
        name: 'Modern TV Stand',
        description: '60-inch TV stand with cable management',
        price: 449.99,
        stock: 18,
        imageUrl: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500',
        parentCategoryId: livingRoom.id,
        subCategoryId: tvStands.id
      }
    ]
  })

  // Create Products - Bedroom
  await prisma.product.createMany({
    data: [
      {
        name: 'King Size Wooden Bed',
        description: 'Solid wood king size bed with upholstered headboard',
        price: 899.99,
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
        parentCategoryId: bedroom.id,
        subCategoryId: beds.id
      },
      {
        name: 'Memory Foam Mattress',
        description: '12-inch gel memory foam mattress, queen size',
        price: 699.99,
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=500',
        parentCategoryId: bedroom.id,
        subCategoryId: mattresses.id
      },
      {
        name: 'Sliding Door Wardrobe',
        description: '6-foot sliding door wardrobe with mirror',
        price: 799.99,
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        parentCategoryId: bedroom.id,
        subCategoryId: wardrobes.id
      }
    ]
  })

  // Create Products - Dining Room
  await prisma.product.createMany({
    data: [
      {
        name: 'Extendable Dining Table',
        description: 'Solid wood extendable dining table seats 6-8',
        price: 899.99,
        stock: 12,
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500',
        parentCategoryId: diningRoom.id,
        subCategoryId: diningTables.id
      },
      {
        name: 'Upholstered Dining Chairs',
        description: 'Set of 4 fabric upholstered dining chairs',
        price: 399.99,
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        parentCategoryId: diningRoom.id,
        subCategoryId: diningChairs.id
      }
    ]
  })

  // Create Products - Office Furniture
  await prisma.product.createMany({
    data: [
      {
        name: 'Standing Desk',
        description: 'Electric height adjustable standing desk',
        price: 499.99,
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        parentCategoryId: officeFurniture.id,
        subCategoryId: officeDesks.id
      },
      {
        name: 'Ergonomic Office Chair',
        description: 'High-back ergonomic chair with lumbar support',
        price: 299.99,
        stock: 35,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        parentCategoryId: officeFurniture.id,
        subCategoryId: officeChairs.id
      }
    ]
  })

  // Create Products - Outdoor & Storage
  await prisma.product.createMany({
    data: [
      {
        name: 'Rattan Patio Set',
        description: '5-piece rattan patio set with cushions',
        price: 899.99,
        stock: 8,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        parentCategoryId: outdoorFurniture.id,
        subCategoryId: patioSets.id
      },
      {
        name: 'Wall Mounted Bookshelf',
        description: 'Floating wall shelves set of 3',
        price: 149.99,
        stock: 40,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        parentCategoryId: storage.id,
        subCategoryId: shelves.id
      },
      {
        name: 'Decorative Wall Mirror',
        description: 'Large decorative wall mirror with gold frame',
        price: 179.99,
        stock: 25,
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
        parentCategoryId: storage.id,
        subCategoryId: homeDecor.id
      }
    ]
  })

  console.log('Furniture seeding completed successfully!')
  console.log('Created: 6 Parent Categories, 16 SubCategories, 14 Products')
}

main()
  .catch((e) => {
    console.error('Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })