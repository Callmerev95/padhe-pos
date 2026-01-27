"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { PaymentModal } from "../payment/PaymentModal";
import { PaymentSuccessModal } from "../payment/PaymentSuccessModal";
import { useHoldOrderStore } from "@/store/useHoldOrderStore";
import { syncOrderToCloud } from "@/app/(dashboard)/order/actions";
import { toast } from "sonner";
import { generateOrderId } from "@/lib/generateOrderId";
import { CreditCard, Loader2, PauseCircle } from "lucide-react";
import { type LocalOrder, type OrderItem } from "@/lib/db";
import { type OrderType } from "@/store/cart.types";

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

    const orderId = activeOrderId !== "" ? activeOrderId : generateOrderId("POS-");
    const now = new Date().toISOString();

    const orderData: LocalOrder = {
      id: orderId,
      createdAt: now,
      total: subtotal,
      paid: 0,
      paymentMethod: "CASH",
      customerName: customerName || "Guest",
      orderType: orderType as "Dine In" | "Take Away",
      status: "PENDING",
      items: items.map((i): OrderItem => ({
        id: i.productId,
        name: i.name,
        qty: i.qty,
        price: i.price,
        categoryType: i.categoryType,
        notes: i.notes || "",
        isDone: false,
      })),
      isSynced: false,
    };

    try {
      const res = await syncOrderToCloud(orderData);

      if (res.success) {
        // ✅ DISESUAIKAN DENGAN HoldOrder interface
        addHold({
          id: orderData.id,
          createdAt: orderData.createdAt,
          // Mengubah null menjadi undefined agar cocok dengan customerName?
          customerName: orderData.customerName ?? undefined,
          orderType: orderData.orderType as OrderType,
          items: orderData.items.map(i => ({
            productId: i.id,
            name: i.name,
            qty: i.qty,
            price: i.price,
            categoryType: i.categoryType,
            notes: i.notes ?? ""
          }))
        });

        toast.success(activeOrderId !== "" ? "Pesanan diperbarui" : "Pesanan berhasil di-hold");
        resetOrder();
      } else {
        toast.error(`Gagal sinkron: ${res.error}`);
      }
    } catch (err) {
      console.error("HOLD_ERROR:", err);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsHolding(false);
    }
  };

  return (
    <>
      <div className="flex gap-3 mt-1 px-1">
        <Button
          variant="outline"
          disabled={isDisabled || isHolding}
          onClick={handleHoldClick}
          className="h-12 w-16 sm:w-20 rounded-2xl border-slate-100 text-slate-400 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100 transition-all active:scale-95 disabled:opacity-30 flex flex-col gap-0 items-center justify-center shrink-0 shadow-sm"
        >
          {isHolding ? (
            <Loader2 className="w-5 h-5 animate-spin text-orange-600" />
          ) : (
            <>
              <PauseCircle className="w-5 h-5" strokeWidth={2.2} />
              <span className="text-[8px] font-black uppercase tracking-tighter">Hold</span>
            </>
          )}
        </Button>

        <Button
          data-open-payment
          disabled={isDisabled || isHolding}
          onClick={() => setOpenPayment(true)}
          className="flex-1 h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-100/50 transition-all active:scale-[0.98] disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none flex items-center justify-between px-5 group overflow-hidden"
        >
          <div className="flex flex-col items-start">
            <span className="text-[8px] font-bold uppercase tracking-[0.2em] opacity-70 leading-none mb-0.5">Checkout</span>
            <span className="text-[12px] font-black uppercase tracking-wider">Proses Bayar</span>
          </div>
          <div className="bg-white/20 p-1.5 rounded-xl group-hover:bg-white/30 transition-colors">
            <CreditCard className="w-5 h-5" />
          </div>
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