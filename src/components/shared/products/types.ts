// src/components/shared/products/types.ts
import type { CategoryColor } from "@/lib/category-colors";

export type Product = {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  isActive: boolean;
  imageUrl?: string;
  // Ubah dari type? menjadi categoryType agar sesuai Prisma
  categoryType: "FOOD" | "DRINK"; 
  category: {
    id?: string;
    name: string;
    color: CategoryColor;
  };
};