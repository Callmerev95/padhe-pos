"use client";

import type { Product } from "@/components/shared/products/types";
import { useCartStore } from "@/store/useCartStore";
import { Plus, Coffee, Utensils } from "lucide-react";
import Image from "next/image";

type Props = {
  product: Product;
};

export function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const isFood = product.categoryType === "FOOD";

  return (
    <div
      onClick={() => addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        categoryType: product.categoryType,
      })}
      /* FIX HOVER: 
         Hapus 'overflow-hidden' agar efek hover -translate-y-1 tidak terpotong kontainer.
      */
      className="group bg-white border border-slate-100 rounded-[2.5rem] p-3 shadow-sm hover:shadow-2xl hover:shadow-cyan-100/50 transition-all duration-500 hover:-translate-y-2 flex flex-col w-full h-full relative cursor-pointer active:scale-95"
    >
      {/* FLOATING BUTTON: 
          Pindah ke pojok kanan atas agar area harga di bawah lebih lega 
      */}
      <div className="absolute top-5 right-5 z-20">
        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/80 backdrop-blur-md text-slate-900 rounded-2xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shadow-lg border border-white/50">
          <Plus size={18} strokeWidth={3} />
        </div>
      </div>

      {/* THUMBNAIL AREA */}
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-[1.8rem] mb-3 bg-slate-50/50 border border-slate-50/50">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center opacity-20 bg-slate-100">
            {isFood ? <Utensils size={24} /> : <Coffee size={24} />}
          </div>
        )}
      </div>

      {/* INFO PRODUCT: Sekarang punya ruang satu baris penuh */}
      <div className="flex flex-col flex-1 px-1">
        <div className="space-y-1">
          <p className="text-[7px] sm:text-[8px] font-black text-cyan-600 uppercase tracking-[0.2em] leading-none">
            {product.category?.name || 'REGULAR'}
          </p>
          <h3 className="font-bold text-slate-900 uppercase tracking-tight text-[10px] sm:text-[11px] leading-tight line-clamp-1 group-hover:text-cyan-600 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* HARGA: Lega satu baris penuh */}
        <div className="pt-2 mt-auto">
          <p className="text-[12px] sm:text-[14px] font-black text-slate-900 tabular-nums tracking-tight">
            Rp {product.price.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
    </div>
  );
}