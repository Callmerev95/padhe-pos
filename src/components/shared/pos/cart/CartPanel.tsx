"use client";

import { useState } from "react";
import { CartHeader } from "./CartHeader";
import { HoldOrderListModal } from "../hold/HoldOrderListModal";
import { useCartStore } from "@/store/useCartStore";
import { CustomerInput } from "./CustomerInput";
import { OrderTypeToggle } from "./OrderTypeToggle";
import { CartEmptyState } from "./CartEmptyState";
import { CartItemList } from "./CartItemList";
import { CartSummary } from "./CartSummary";
import { CartActions } from "./CartActions";

export function CartPanel() {
  const items = useCartStore((s) => s.items);
  const [openHoldList, setOpenHoldList] = useState(false);

  return (
    <div className="flex h-full max-h-full flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm relative">

      {/* HEADER: Dibuat lebih slim agar jatah list item lebih banyak */}
      <div className="flex-none">
        <CartHeader />
      </div>

      {/* INPUT AREA: Digabung agar lebih compact */}
      <div className="flex-none px-5 py-3 space-y-3 border-b border-slate-50">
        <CustomerInput />
        <OrderTypeToggle />
      </div>

      {/* BODY: List Item Keranjang
          'flex-1' dan 'min-h-0' adalah kunci agar scrollbar aktif tepat waktu.
      */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 min-h-0">
        {items.length === 0 ? <CartEmptyState /> : <CartItemList />}
      </div>

      {/* FOOTER: Bantai rasa sesaknya di sini!
          1. Kurangi padding p-6 menjadi p-4.
          2. Radius dikurangi dari 2.5rem ke 1.5rem agar tidak menabrak item di atasnya.
          3. Kurangi space-y-5 menjadi space-y-3.
      */}
      <div className="flex-none border-t border-slate-50 bg-white p-4 pb-6 space-y-3 rounded-t-3xl shadow-[0_-15px_30px_rgba(0,0,0,0.03)] z-30">
        <CartSummary />
        <CartActions />
      </div>

      <HoldOrderListModal
        open={openHoldList}
        onClose={() => setOpenHoldList(false)}
      />
    </div>
  );
}