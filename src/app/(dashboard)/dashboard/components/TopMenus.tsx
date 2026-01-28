"use client";

import { Trophy, ChevronRight, BarChart2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopProduct {
  name: string;
  qty: number;
}

interface TopMenusProps {
  products: TopProduct[];
}

export function TopMenus({ products }: TopMenusProps) {
  const router = useRouter(); //

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-9 shadow-sm flex flex-col h-full group transition-all duration-500 hover:border-slate-300">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Top Menus
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
            Best Seller Items
          </p>
        </div>
        <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl shadow-sm shadow-amber-100/50">
          <Trophy size={20} strokeWidth={2.5} />
        </div>
      </div>

      {/* Daftar Produk Terlaris */}
      <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {products.length > 0 ? (
          products.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between group/item p-3.5 rounded-3xl border border-transparent hover:bg-slate-50 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center gap-5">
                <span className="text-[11px] font-black text-slate-200 group-hover/item:text-slate-900 transition-colors italic tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <p className="text-[13px] font-black text-slate-800 uppercase tracking-tight group-hover/item:text-slate-900 transition-colors">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <BarChart2 size={10} className="text-emerald-500" />
                    <span>{p.qty} Items Sold</span>
                  </div>
                </div>
              </div>

              <div className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-300 group-hover/item:bg-slate-900 group-hover/item:text-white group-hover/item:translate-x-1 transition-all duration-300">
                <ChevronRight size={16} strokeWidth={3} />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 opacity-20">
            <p className="text-[10px] font-black uppercase italic tracking-widest">No Sales Recorded</p>
          </div>
        )}
      </div>

      {/* Tombol Aksi Bawah - Sekarang diarahkan ke Bahan Baku */}
      <div className="mt-8">
        <button
          onClick={() => router.push('/inventory/ingredients')} //
          className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 active:scale-[0.98]"
        >
          Check Raw Materials
        </button>
      </div>
    </div>
  );
}