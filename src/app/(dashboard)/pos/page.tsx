import { prisma } from "@/lib/prisma";
import { ProductPanel } from "@/components/shared/pos/product/ProductPanel";
import type { Product } from "@/components/shared/products/types";
import { toCategoryColor } from "@/lib/category-colors";
import { CartPanel } from "@/components/shared/pos/cart/CartPanel";
import { PosInitializer } from "./PosInitializer";

export default async function POSPage() {
  // Fetch products aktif dari database
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  // Map products dari database ke tipe yang digunakan di UI
  const uiProducts: Product[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    sku: p.sku ?? "-",
    price: p.price,
    isActive: p.isActive,
    imageUrl: p.imageUrl ?? undefined,
    categoryType: p.categoryType,
    category: {
      id: p.category.id,
      name: p.category.name,
      color: toCategoryColor(p.category.color),
    },
  }));

  return (

    <div className="flex h-[calc(100vh-64px)] gap-4 p-4">
      <PosInitializer />
      {/* PRODUCT PANEL */}
      <div className="flex-1 min-w-0">
        <ProductPanel products={uiProducts} />
      </div>

      {/* CART PANEL */}
      <div className="w-95 shrink-0">
        <CartPanel />
      </div>
    </div>

  );
}
