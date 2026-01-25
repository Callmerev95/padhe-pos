"use client";

import { User } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export function CustomerInput() {
  const customerName = useCartStore((s) => s.customerName);
  const setCustomerName = useCartStore((s) => s.setCustomerName);

  return (
    <div className="relative group">
      {/* Label dengan gaya Recipe: Bold, Small, Uppercase */}
      <label className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">
        <User size={10} className="text-cyan-500" />
        Customer Name
      </label>

      <div className="relative">
        <input
          type="text"
          placeholder="Siapa nama pelanggan?..."
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          /* - bg-slate-100/50: Warna background halus.
             - focus:bg-white: Berubah saat diketik agar fokus.
             - rounded-2xl: Konsisten dengan elemen lainnya.
          */
          className="w-full bg-slate-100/80 border-transparent focus:border-cyan-500/30 focus:bg-white focus:ring-4 focus:ring-cyan-500/5 rounded-2xl px-4 py-3 text-xs font-bold text-slate-900 placeholder:text-gray-400 placeholder:font-normal transition-all duration-300 outline-none"
        />
      </div>
    </div>
  );
}