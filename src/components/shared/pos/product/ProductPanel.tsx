"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/components/shared/products/types";
import { ProductToolbar } from "./ProductToolbar";
import { ProductGrid } from "./ProductGrid";
import { ProductRowList } from "./ProductRowList";

export type ProductViewMode = "grid" | "row";

type Props = {
  products: Product[];
};

export function ProductPanel({ products }: Props) {
  const [view, setView] = useState<ProductViewMode>("grid");
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    const q = query.toLowerCase();

    return products.filter((p) => {
      if (categoryId && p.category.id !== categoryId) return false;

      if (q) {
        const haystack = `${p.name} ${p.sku ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [products, query, categoryId]);

  return (
    <div className="h-full rounded-xl border p-4 flex flex-col bg-card shadow-md">
      <ProductToolbar
        view={view}
        onViewChange={setView}
        onSearch={setQuery}
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
      />

      <div className="flex-1 overflow-auto mt-4">
        {filteredProducts.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-10">
            Produk tidak ditemukan
          </div>
        ) : view === "grid" ? (
          <ProductGrid products={filteredProducts} />
        ) : (
          <ProductRowList products={filteredProducts} />
        )}
      </div>
    </div>
  );
}


