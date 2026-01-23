"use client";

import { useState } from "react"; // Tambahkan ini
import { Minus, Plus, Trash2, MessageSquarePlus, X } from "lucide-react"; // Tambahkan icon baru
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  notes?: string; // ✅ Pastikan ada di sini
};

type Props = {
  item: CartItem;
  highlight?: boolean;
};

export function CartItemRow({ item, highlight }: Props) {
  const inc = useCartStore((s) => s.increaseQty);
  const dec = useCartStore((s) => s.decreaseQty);
  const remove = useCartStore((s) => s.removeItem);
  const updateNotes = useCartStore((s) => s.updateNotes); // ✅ Ambil action baru

  const [showNoteInput, setShowNoteInput] = useState(false);

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-3 transition-all group duration-200 hover:scale-[1.01] hover:shadow-sm",
        highlight ? "bg-muted ring-1 ring-primary/20 shadow-md scale-[1.02]" : "bg-card"
      )}
    >
      {/* ROW ATAS: Info Produk & Action Utama */}
      <div className="flex items-center justify-between gap-2">
        {/* LEFT */}
        <div className="flex-1">
          <p className="font-bold leading-tight text-sm uppercase tracking-tight">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            Rp {item.price.toLocaleString()}
          </p>
        </div>

        {/* ACTIONS & QTY */}
        <div className="flex items-center gap-1">
          {/* Tombol Note */}
          <Button
            size="icon"
            variant={item.notes ? "default" : "outline"}
            className={cn("h-8 w-8", item.notes && "bg-orange-500 hover:bg-orange-600")}
            onClick={() => setShowNoteInput(!showNoteInput)}
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            disabled={item.qty === 1}
            onClick={() => dec(item.productId)}
          >
            <Minus className="h-3 w-3" />
          </Button>

          <span className="w-6 text-center text-xs font-bold">{item.qty}</span>

          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={() => inc(item.productId)}
          >
            <Plus className="h-3 w-3" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
            onClick={() => remove(item.productId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* INPUT NOTES (Muncul jika tombol diklik atau sudah ada isi) */}
      {(showNoteInput || item.notes) && (
        <div className="relative animate-in slide-in-from-top-1 duration-200 mt-1">
          <textarea
            placeholder="Tambahkan catatan khusus..."
            value={item.notes || ""}
            onChange={(e) => updateNotes(item.productId, e.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-[10px] font-medium italic text-orange-600 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-500 min-h-11.25 resize-none"
          />
          {showNoteInput && (
            <button
              onClick={() => setShowNoteInput(false)}
              className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}

      {/* TOTAL PER ITEM */}
      <div className="flex justify-end border-t pt-1 border-dashed">
        <p className="text-[10px] font-black text-slate-500 uppercase">
          Subtotal: Rp {(item.price * item.qty).toLocaleString()}
        </p>
      </div>
    </div>
  );
}