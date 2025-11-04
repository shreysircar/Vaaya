-- CreateTable
CREATE TABLE "HomepageSection" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "heading" TEXT,
    "subheading" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "imageUrls" TEXT[],
    "linkedCategoryId" TEXT,
    "linkedProductIds" TEXT[],
    "categoryIds" TEXT[],
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HomepageSection" ADD CONSTRAINT "HomepageSection_linkedCategoryId_fkey" FOREIGN KEY ("linkedCategoryId") REFERENCES "ParentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
