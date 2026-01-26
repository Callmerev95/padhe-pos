"use client";

import { useMemo, useState } from "react";
import type { ProductUI as Product } from "@/app/(dashboard)/products/types/product.types";
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

  const uniqueCategories = useMemo(() => {
    const categoriesMap = new Map();
    products.forEach((p) => {
      if (p.category && !categoriesMap.has(p.category.id)) {
        categoriesMap.set(p.category.id, p.category);
      }
    });
    return Array.from(categoriesMap.values());
  }, [products]);

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
    /* PERBAIKAN 1: 
       Hapus 'overflow-hidden' pada kontainer utama agar shadow dan efek hover 
       tidak terpotong di bagian tepi.
    */
    <div className="h-full sm:rounded-[2.5rem] bg-white p-3 sm:p-6 flex flex-col sm:shadow-sm sm:border sm:border-slate-100/50 relative transition-all duration-300">

      {/* Background Decor */}
      <div className="absolute -right-10 -top-10 w-24 h-24 sm:w-40 sm:h-40 bg-slate-50 rounded-full opacity-50 pointer-events-none" />

      {/* PERBAIKAN 2: 
          Sama seperti di atas, kita hilangkan 'overflow-hidden' di sini juga 
          agar kartu bisa "naik" melewati batas container secara visual.
      */}
      <div className="relative z-10 flex flex-col h-full">
        <ProductToolbar
          view={view}
          onViewChange={setView}
          onSearch={setQuery}
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          categories={uniqueCategories}
        />

        {/* PERBAIKAN 3: 
            - Ganti 'custom-scrollbar' menjadi 'no-scrollbar' untuk menghilangkan batang scroll.
            - Tambahkan 'pt-4' atau 'p-1' agar kartu baris atas punya ruang saat di-hover ke atas.
        */}
        <div className="flex-1 overflow-y-auto mt-3 sm:mt-6 no-scrollbar pb-24 lg:pb-0 flex flex-col pt-1 px-1">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 py-20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-full flex items-center justify-center">
                <span className="text-xl sm:text-2xl">🔍</span>
              </div>
              <p className="font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em] opacity-40">
                Produk tidak ditemukan
              </p>
            </div>
          ) : (
            <div className="h-fit">
              {view === "grid" ? (
                <ProductGrid products={filteredProducts} />
              ) : (
                <ProductRowList products={filteredProducts} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}