"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { PaymentModal } from "../payment/PaymentModal";
import { PaymentSuccessModal } from "../payment/PaymentSuccessModal";
import { useHoldOrderStore } from "@/store/useHoldOrderStore";
import { syncOrderToCloud } from "@/app/(dashboard)/order/actions";
import { toast } from "sonner";
import { generateOrderId } from "@/lib/generateOrderId"; // ✅ Ditambahkan

export function CartActions() {
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const [openPayment, setOpenPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isHolding, setIsHolding] = useState(false);

  const isDisabled = items.length === 0 || subtotal === 0;

  const addHold = useHoldOrderStore((s) => s.addHold);
  const customerName = useCartStore((s) => s.customerName);
  const orderType = useCartStore((s) => s.orderType);
  const resetOrder = useCartStore((s) => s.resetOrder);
  const activeOrderId = useCartStore((s) => s.activeOrderId);

  const handleHoldClick = async () => {
    if (items.length === 0) return;
    setIsHolding(true);

    // ✅ PERBAIKAN: Gunakan format POS-XXXX alih-alih random UUID
    const orderId = activeOrderId !== "" ? activeOrderId : generateOrderId("POS-");
    const now = new Date().toISOString();

    const orderData = {
      id: orderId,
      createdAt: now,
      total: subtotal,
      paid: 0,
      paymentMethod: "CASH" as const, // Default saat hold
      customerName: customerName || "Guest",
      orderType: orderType as "Dine In" | "Take Away",
      items: items.map((i) => {
        // ✅ Ambil status isDone yang sudah ada (untuk update hold) tanpa menggunakan 'any'
        const itemWithStatus = i as unknown as { isDone?: boolean };

        return {
          id: i.productId,
          name: i.name,
          qty: i.qty,
          price: i.price,
          categoryType: i.categoryType as "FOOD" | "DRINK",
          notes: i.notes || "",
          isDone: itemWithStatus.isDone === true, // Tetap gunakan status lama jika ada
        };
      }),
      isSynced: true,
    };

    try {
      const res = await syncOrderToCloud(orderData);

      if (res.success) {
        addHold({
          ...orderData,
          items: orderData.items.map(i => ({ ...i, productId: i.id }))
        });

        toast.success(activeOrderId !== "" ? "Pesanan diperbarui di Dapur" : "Pesanan dikirim ke Dapur");
        resetOrder();
      } else {
        toast.error(`Gagal sinkron: ${res.error}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsHolding(false);
    }
  };

  return (
    <>
      <div className="flex gap-4">
        <Button
          variant="outline"
          className="h-12 shadow-md cursor-pointer"
          disabled={isDisabled || isHolding}
          onClick={handleHoldClick}
        >
          {isHolding ? "Processing..." : "Hold Order"}
        </Button>

        <Button
          data-open-payment
          disabled={isDisabled || isHolding}
          className="flex-1 h-12 shadow-md cursor-pointer text-coffee-soft"
          onClick={() => setOpenPayment(true)}
        >
          Proses Pembayaran
        </Button>
      </div>

      <PaymentModal
        open={openPayment}
        onClose={() => setOpenPayment(false)}
        onSuccess={() => {
          setOpenPayment(false);
          setShowSuccess(true);
        }}
      />

      <PaymentSuccessModal
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          clearCart();
        }}
      />
    </>
  );
}