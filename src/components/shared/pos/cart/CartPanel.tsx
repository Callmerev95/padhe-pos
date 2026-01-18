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
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card shadow-md">
      
      {/* HEADER */}
      <CartHeader onOpenHoldList={() => setOpenHoldList(true)} />

      {/* CUSTOMER + ORDER TYPE */}
      <div className="p-3 space-y-4 border-b">
        <CustomerInput />
        <OrderTypeToggle />
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-auto p-3">
        {items.length === 0 ? <CartEmptyState /> : <CartItemList />}
      </div>

      {/* FOOTER */}
      <div className="border-t p-4 space-y-4">
        <CartSummary />
        <CartActions />
      </div>

      {/* HOLD LIST MODAL */}
      <HoldOrderListModal
        open={openHoldList}
        onClose={() => setOpenHoldList(false)}
      />
    </div>
  );
}
