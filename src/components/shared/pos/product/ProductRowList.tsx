"use client";

import type { Product } from "@/components/shared/products/types";
import { useCartStore } from "@/store/useCartStore";
import { Plus, Coffee, Utensils, ChevronRight } from "lucide-react";
import Image from "next/image";

type Props = {
  products: Product[];
};

export function ProductRowList({ products }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    /* PERBAIKAN: 
       - Hapus p-4 karena parent (ProductPanel) sudah punya padding.
       - Tambahkan pb-24 agar item terakhir tidak tertutup tombol checkout di tablet.
    */
    <div className="flex flex-col gap-2 sm:gap-3 w-full pb-24">
      {products.map((product) => {
        const isFood = product.categoryType === "FOOD";

        return (
          <div
            key={product.id}
            onClick={() => addItem({
              productId: product.id,
              name: product.name,
              price: product.price,
              categoryType: product.categoryType,
            })}
            /* FIX VISUAL:
               - rounded-2xl: Konsisten dengan lengkungan kartu di mode grid.
               - min-h-[80px]: Memberi tinggi minimal yang nyaman untuk jempol.
            */
            className="group bg-white border border-slate-100/80 rounded-2xl p-2 sm:p-3 flex items-center gap-3 sm:gap-4 cursor-pointer transition-all duration-300 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-50/20 active:scale-[0.98]"
          >
            {/* Thumbnail: Menggunakan aspect-square agar tidak lonjong */}
            <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-50">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="64px"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center opacity-30 text-slate-400">
                  {isFood ? <Utensils size={18} /> : <Coffee size={18} />}
                </div>
              )}
            </div>

            {/* Info Produk */}
            <div className="flex-1 min-w-0 py-0.5">
              <p className="text-[7px] sm:text-[8px] font-black text-cyan-600 uppercase tracking-[0.15em] mb-0.5">
                {product.category?.name || 'REGULAR'}
              </p>
              <h3 className="font-bold text-slate-900 uppercase tracking-tight text-[10px] sm:text-[11px] truncate group-hover:text-cyan-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-[11px] sm:text-[12px] font-black text-slate-900 mt-0.5 tabular-nums">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
            </div>

            {/* Aksi & Indikator */}
            <div className="flex items-center gap-2 sm:gap-4 pr-1">
              {/* Tooltip kecil yang muncul hanya saat di-hover */}
              <div className="hidden lg:flex flex-col items-end opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Tambah</span>
                <ChevronRight size={10} className="text-cyan-500" />
              </div>

              {/* Button Plus yang konsisten dengan mode Grid */}
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-50 group-hover:bg-slate-900 group-hover:text-white text-slate-900 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm border border-slate-100 group-hover:border-slate-900">
                <Plus size={16} strokeWidth={3} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}