"use client";

import { LayoutGrid, List, Layers, Search } from "lucide-react";
import type { ProductViewMode } from "./ProductPanel";
import { cn } from "@/lib/utils";
import type { Category } from "@prisma/client";

type Props = {
  view: ProductViewMode;
  onViewChange: (v: ProductViewMode) => void;
  onSearch: (v: string) => void;
  categoryId: string | null;
  onCategoryChange: (id: string | null) => void;
  categories: Category[];
};

export function ProductToolbar({
  view,
  onViewChange,
  onSearch,
  categoryId,
  onCategoryChange,
  categories = []
}: Props) {
  return (
    <div className="flex flex-col gap-4 w-full relative z-20">
      {/* Search Input tetap di atas agar area swipe kategori di bawahnya lebih lega */}
      <div className="relative w-full group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search size={16} className="text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Cari menu atau SKU..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full h-11 bg-slate-100/50 border border-slate-100 rounded-2xl pl-12 pr-4 text-xs font-bold focus:bg-white focus:border-cyan-200 focus:ring-4 focus:ring-cyan-50 transition-all outline-none"
        />
      </div>

      <div className="flex items-center justify-between w-full gap-3 sm:gap-4">
        {/* KIRI: Category Filter - Scrollable Area 
            FIX: Menambahkan 'touch-pan-x' dan 'select-none' agar swipe di tablet mulus
        */}
        <div className="flex-1 overflow-hidden relative group select-none">
          {/* Menggunakan 'touch-pan-x' untuk memberi tahu browser tablet area ini bisa di-swipe horizontal */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 scroll-smooth touch-pan-x">
            <button
              onClick={() => onCategoryChange(null)}
              className={cn(
                "flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0",
                categoryId === null
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-200"
                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-300 active:scale-95"
              )}
            >
              <Layers size={14} /> SEMUA MENU
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onCategoryChange(cat.id)}
                className={cn(
                  "px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0",
                  categoryId === cat.id
                    ? "bg-cyan-600 text-white border-cyan-600 shadow-lg shadow-cyan-100 scale-105"
                    : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 active:scale-95"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* FIX GRADASI: 
              Tambahkan 'pointer-events-none' agar jempol kasir tidak terhalang 
              saat menyentuh bagian ujung kanan kategori 
          */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-linear-to-l from-white via-white/80 to-transparent pointer-events-none z-10 group-hover:opacity-0 transition-opacity duration-500" />
        </div>

        {/* KANAN: View Switcher */}
        <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 shadow-inner shrink-0 ml-2">
          <button
            onClick={() => onViewChange("grid")}
            className={cn(
              "p-2 sm:px-4 sm:py-2 rounded-xl transition-all",
              view === "grid" ? "bg-white text-cyan-600 shadow-sm" : "text-slate-400"
            )}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => onViewChange("row")}
            className={cn(
              "p-2 sm:px-4 sm:py-2 rounded-xl transition-all",
              view === "row" ? "bg-white text-cyan-600 shadow-sm" : "text-slate-400"
            )}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}