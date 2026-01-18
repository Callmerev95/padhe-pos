"use client";

import { useCartStore } from "@/store/useCartStore";

export function CartSummary() {

  const getSubtotal = useCartStore((s) => s.getSubtotal);

  const subtotal = getSubtotal();
  const total = subtotal; // pajak & diskon nanti

  return (
    <div className="space-y-2 text-sm">

      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>Rp {subtotal.toLocaleString("id-ID")}</span>
      </div>

      <div className="flex justify-between">
        <span>Tax</span>
        <span>Rp 0</span>
      </div>

      <div className="flex justify-between">
        <span>Charge</span>
        <span>Rp 0</span>
      </div>

      <div className="flex justify-between font-semibold text-base">
        <span>Total</span>
        <span>Rp {total.toLocaleString("id-ID")}</span>
      </div>

    </div>
  );
}
