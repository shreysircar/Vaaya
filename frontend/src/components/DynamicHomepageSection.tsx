"use client";

import FeaturedCategories from "@/components/FeaturedCategories";
import TrendingProducts from "@/components/TrendingProducts";
import BrandStorySection from "@/components/BrandStorySection";

interface DynamicHomepageSectionProps {
  section: any;
}

export default function DynamicHomepageSection({ section }: DynamicHomepageSectionProps) {
  switch (section.type) {
    case "featured_categories":
      return <FeaturedCategories section={section} />;

    case "trending_products":
      return <TrendingProducts section={section} />;

    case "brand_story":
      return <BrandStorySection section={section} />;

    default:
      return null; // if an unsupported type is added, ignore it
  }
}
