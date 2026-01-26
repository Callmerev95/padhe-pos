import { getProducts } from "./actions";
import { getCategories } from "../categories/actions";
import { ProductsClient } from "./ProductsClient";
import { ProductUI } from "./types/product.types";
import { CategoryColor } from "@/lib/category-colors";

export default async function ProductsPage() {
  const rawProducts = await getProducts();
  const rawCategories = await getCategories();

  const mappedProducts: ProductUI[] = rawProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    sku: p.sku ?? "-",
    price: Number(p.price),
    isActive: p.isActive,
    imageUrl: p.imageUrl ?? undefined,
    categoryType: (p.categoryType as "FOOD" | "DRINK") || "FOOD",
    category: {
      id: p.category?.id ?? "",
      name: p.category?.name ?? "-",
      color: (p.category?.color as CategoryColor) ?? "slate",
    },
  }));

  return (
    <ProductsClient 
      initialProducts={mappedProducts} 
      initialCategories={rawCategories.map(c => ({ id: c.id, name: c.name }))} 
    />
  );
}