import { getProducts } from "./actions";
import { getCategories } from "../categories/actions";
import { ProductsClient } from "./ProductsClient";
import type { Product } from "@/components/shared/products/types";
import type { CategoryColor } from "@/lib/category-colors";


export default async function ProductsPage() {
  const raw = await getProducts(); // Fetch products dari database
  const rawCategories = await getCategories(); // Fetch categories dari database

  type RawProduct = Awaited<ReturnType<typeof getProducts>>[number]; 

  // Map raw products ke tipe Product yang diinginkan
  const mapped: Product[] = (raw ?? []).map((p: RawProduct) => {
    return {
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      sku: p.sku ?? "-",
      price: Number(p.price ?? 0),
      isActive: Boolean(p.isActive ?? true),
      imageUrl: p.imageUrl ?? undefined,
      categoryType: (p.categoryType as "FOOD" | "DRINK") || "FOOD",
      category: {
        id: p.category?.id,
        name: p.category?.name ?? "-",
        color: (p.category?.color as CategoryColor) ?? "slate",
      },
    };
  });

  return <ProductsClient initialProducts={mapped} initialCategories={rawCategories.map((c) => ({ id: c.id, name: c.name }))} />; 
}
