"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { PaymentModal } from "../payment/PaymentModal";
import { PaymentSuccessModal } from "../payment/PaymentSuccessModal";
import { useHoldOrderStore } from "@/store/useHoldOrderStore";

// Cart Actions Component
export function CartActions() {
  const items = useCartStore((s) => s.items); // get cart items
  const clearCart = useCartStore((s) => s.clearCart); // clear cart action
  const subtotal = useCartStore((s) => s.getSubtotal()); // get subtotal
  const [openPayment, setOpenPayment] = useState(false); // payment modal state
  const [showSuccess, setShowSuccess] = useState(false); // success modal state
  const isDisabled = items.length === 0 || subtotal === 0; // disable if cart is empty or subtotal is 0
  const addHold = useHoldOrderStore((s) => s.addHold); // add hold order action
  const customerName = useCartStore((s) => s.customerName); // get customer name
  const orderType = useCartStore((s) => s.orderType); // get order type
  const resetOrder = useCartStore((s) => s.resetOrder); // reset order action

  return (
    <>
      <div className="flex gap-4">

        {/* Clear Cart Button 
        <Button
          variant="outline"
          onClick={clearCart}
          disabled={items.length === 0}
          className="flex-1"
        >
          Clear
        </Button> */} 

      {/* Hold Order Button */}
        <Button
          variant="outline"
          className="h-12 shadow-md cursor-pointer"
          disabled={items.length === 0}
          onClick={() => {
            addHold({
              id: crypto.randomUUID(),
              items: items.map((i) => ({
                productId: i.productId,
                name: i.name,
                price: i.price,
                qty: i.qty,
                categoryType: i.categoryType,
              })),
              customerName,
              orderType,
              createdAt: new Date().toISOString(),
            });

            resetOrder(); // reset order info
          }}
        >
          Hold Order
        </Button>
        
        {/* Proceed to Payment Button */}
        <Button
          data-open-payment
          disabled={isDisabled}
          className="flex-1 h-12 shadow-md cursor-pointer text-coffee-soft"
          onClick={() => setOpenPayment(true)}
        >
          Proses Pembayaran
        </Button>
      </div>

      {/* PAYMENT FLOW */}
      <PaymentModal
        open={openPayment}
        onClose={() => setOpenPayment(false)}
        onSuccess={() => {
          setOpenPayment(false);
          setShowSuccess(true);
        }}
      />

      {/* ✅ SUCCESS MODAL (STABLE) */}
      <PaymentSuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          clearCart(); // clear cart after payment success
        }}
      />
    </>
  );
}
