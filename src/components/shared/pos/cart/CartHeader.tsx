"use client";

import { Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";

export function CartHeader() {
  const clearCart = useCartStore((s) => s.resetOrder);
  const itemsCount = useCartStore((s) => s.items.length);

  return (
    <div className="flex items-center justify-between border-b border-slate-100/50 bg-white px-6 py-5">

      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg shadow-slate-200">
          <ShoppingBag size={22} strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-[14px] font-black uppercase tracking-tight text-slate-900 leading-none">
            Current Order
          </h2>
          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-600 mt-1.5">
            {itemsCount} Menu Terpilih
          </p>
        </div>
      </div>

      <div className="flex items-center">
        {itemsCount > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearCart}
          
            className="h-10 w-10 border border-slate-100 bg-white text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 rounded-xl transition-all duration-300 shadow-sm active:scale-90"
            title="Bersihkan Semua Pesanan"
          >
            <Trash2 size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}