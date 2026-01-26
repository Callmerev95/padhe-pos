"use client";

import { Trophy, ArrowRight } from "lucide-react";

/**
 * Interface untuk tiap item produk terlaris.
 * Kita definisikan secara eksplisit agar type-safe.
 */
interface TopProduct {
  name: string;
  qty: number;
}

interface TopMenusProps {
  products: TopProduct[];
}

export function TopMenus({ products }: TopMenusProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full">
      {/* Header Bagian Top Menus */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">
          Top Menus
        </h3>
        <Trophy size={18} className="text-amber-500" />
      </div>

      {/* Daftar Produk Terlaris */}
      <div className="space-y-6 flex-1">
        {products.length > 0 ? (
          products.map((p, i) => (
            <div 
              key={i} 
              className="flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {/* Penomoran Otomatis (01, 02, dst) */}
                <span className="text-[10px] font-black text-slate-200 group-hover:text-slate-900 transition-all italic">
                  0{i + 1}
                </span>
                <div>
                  <p className="text-[11px] font-black text-slate-800 uppercase leading-none">
                    {p.name}
                  </p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1">
                    {p.qty} Items Sold
                  </p>
                </div>
              </div>
              {/* Icon panah yang muncul/berubah warna saat di-hover */}
              <ArrowRight 
                size={14} 
                className="text-slate-200 group-hover:text-slate-900 transition-all" 
              />
            </div>
          ))
        ) : (
          /* State jika belum ada data penjualan */
          <div className="flex flex-col items-center justify-center py-10 opacity-20">
            <p className="text-[10px] font-black uppercase italic">No Sales Yet</p>
          </div>
        )}
      </div>

      {/* Tombol Aksi Bawah */}
      <button className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
        Full Inventory Report
      </button>
    </div>
  );
}