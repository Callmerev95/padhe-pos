"use client";

import { useCartStore } from "@/store/useCartStore";

export function CartSummary() {
  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const subtotal = getSubtotal();
  const total = subtotal; 

  return (
    /* PERBAIKAN TOTAL:
       - Hapus p-4, gantikan dengan px-2 saja agar tidak "box-in-box".
       - Hilangkan background slate-50/50 dan border.
       - Gunakan space-y-1.5 agar antar baris biaya sangat rapat.
    */
    <div className="space-y-1.5 px-2 mb-2">
      {/* Detail Breakdown: Font diperkecil tapi tetap tajam */}
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
          <span>Subtotal</span>
          <span className="tabular-nums text-slate-500">Rp {subtotal.toLocaleString("id-ID")}</span>
        </div>

        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-400">
          <span>Tax (0%)</span>
          <span className="tabular-nums text-slate-500">Rp 0</span>
        </div>
      </div>

      {/* Separator: Tipis saja untuk memisahkan total */}
      <div className="border-t border-dashed border-slate-100 my-1.5" />

      {/* Grand Total: Fokus utama tapi tetap slim */}
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-900">
          Total
        </span>
        <span className="text-base font-black text-slate-900 tabular-nums tracking-tighter">
          Rp {total.toLocaleString("id-ID")}
        </span>
      </div>
    </div>
  );
}