"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, MessageSquarePlus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
};

type Props = {
  item: CartItem;
  highlight?: boolean;
};

export function CartItemRow({ item, highlight }: Props) {
  const inc = useCartStore((s) => s.increaseQty);
  const dec = useCartStore((s) => s.decreaseQty);
  const remove = useCartStore((s) => s.removeItem);
  const updateNotes = useCartStore((s) => s.updateNotes);

  const [showNoteInput, setShowNoteInput] = useState(false);

  return (
    <div
      className={cn(
        /* DIET VISUAL: 
           - Padding dikurangi p-4 -> p-3
           - Gap dikurangi gap-3 -> gap-2
           - Rounded dikurangi 3xl -> 2xl agar lebih proporsional
        */
        "flex flex-col gap-2 rounded-2xl p-3 transition-all duration-300 relative overflow-hidden border",
        highlight
          ? "bg-cyan-50/30 border-cyan-100 scale-[1.01] z-10"
          : "bg-white border-slate-100 shadow-sm"
      )}
    >
      {/* ROW ATAS: Info Produk & Control */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-slate-900 uppercase tracking-tight text-[10px] leading-tight truncate">
            {item.name}
          </h3>
          <p className="text-[9px] font-bold text-cyan-600 mt-0.5 tabular-nums">
            Rp {item.price.toLocaleString("id-ID")}
          </p>
        </div>

        {/* QTY CONTROL: Dibuat lebih slim (h-7) */}
        <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-100 shrink-0">
          <button
            onClick={() => dec(item.productId)}
            disabled={item.qty <= 1}
            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-red-500 disabled:opacity-20 transition-all active:scale-90"
          >
            <Minus size={11} strokeWidth={3} />
          </button>

          <span className="w-6 text-center text-[10px] font-black text-slate-900 tabular-nums">
            {item.qty}
          </span>

          <button
            onClick={() => inc(item.productId)}
            className="w-6 h-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-cyan-600 transition-all active:scale-90"
          >
            <Plus size={11} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* ROW BAWAH: Actions & Total */}
      <div className="flex items-center justify-between gap-2 relative z-10 pt-1 border-t border-slate-50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider transition-all",
              item.notes
                ? "bg-orange-50 text-orange-600 border border-orange-100"
                : "text-slate-300 hover:text-cyan-600"
            )}
          >
            <MessageSquarePlus size={12} strokeWidth={2.5} />
            {item.notes && "Note"}
          </button>

          <button
            onClick={() => remove(item.productId)}
            className="p-1 text-slate-200 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <p className="text-[11px] font-black text-slate-900 tabular-nums">
          Rp {(item.price * item.qty).toLocaleString("id-ID")}
        </p>
      </div>

      {/* INPUT NOTES: Dibuat lebih ringkas */}
      {(showNoteInput || item.notes) && (
        <div className="relative animate-in slide-in-from-top-1 duration-200">
          <textarea
            rows={1}
            placeholder="Catatan..."
            value={item.notes || ""}
            onChange={(e) => updateNotes(item.productId, e.target.value)}
            className="w-full rounded-lg border border-orange-100 bg-orange-50/30 px-2 py-1.5 text-[9px] font-bold text-orange-700 placeholder:text-orange-300 outline-none resize-none italic"
          />
        </div>
      )}
    </div>
  );
}