"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import type { PaymentMethod } from "./payment.types";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useReceiptStore } from "@/store/useReceiptStore";
import { generateOrderId } from "@/lib/generateOrderId";
import { saveOrder } from "@/lib/db";
import { syncOrderToCloud } from "@/app/(dashboard)/order/actions";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  method: PaymentMethod;
};

export function PaymentConfirmModal({ open, onClose, onSuccess, method }: Props) {
  const subtotal = useCartStore((s) => s.getSubtotal());
  const items = useCartStore((s) => s.items);
  const orderType = useCartStore((s) => s.orderType);
  const customerName = useCartStore((s) => s.customerName);
  const activeOrderId = useCartStore((s) => s.activeOrderId);
  const setReceipt = useReceiptStore((s) => s.setReceipt);

  const [cashReceived, setCashReceived] = useState<number | "">("");
  const [isProcessing, setIsProcessing] = useState(false);

  const paidAmount = typeof cashReceived === "number" ? cashReceived : subtotal;
  const change = typeof cashReceived === "number" ? cashReceived - subtotal : 0;
  const isCashEnough = typeof cashReceived === "number" && cashReceived >= subtotal;

  const snapshotCustomerName = customerName && customerName.trim() !== "" ? customerName : "Guest";

  async function onConfirm() {
    if (isProcessing) return;
    setIsProcessing(true);

    const orderId = activeOrderId && activeOrderId !== "" ? activeOrderId : generateOrderId("POS-");
    const createdAt = new Date().toISOString();

    const formattedItems = items.map((i) => {
      const itemWithStatus = i as unknown as { isDone?: boolean };
      return {
        id: i.productId,
        name: i.name,
        qty: i.qty,
        price: i.price,
        categoryType: i.categoryType,
        notes: i.notes || "",
        isDone: itemWithStatus.isDone === true,
      };
    });

    const orderData = {
      id: orderId,
      createdAt,
      total: subtotal,
      paid: Number(paidAmount),
      paymentMethod: method,
      customerName: snapshotCustomerName,
      orderType: orderType as "Dine In" | "Take Away",
      items: formattedItems,
      isSynced: false,
    };

    // 1. Simpan ke Receipt Store (Agar data tersedia di Success Modal)
    setReceipt({
      orderId,
      createdAt,
      items: formattedItems,
      subtotal,
      tax: 0,
      charge: 0,
      total: subtotal,
      paid: Number(paidAmount),
      change: Number(paidAmount) - subtotal,
      customerName: snapshotCustomerName,
      cashierName: "Revangga",
      orderType,
      paymentMethod: method,
    });

    try {
      // 2. Proses Simpan & Sync
      const response = await syncOrderToCloud(orderData, "COMPLETED");
      await saveOrder({
        ...orderData,
        isSynced: response?.success ?? false
      });
    } catch (err) {
      console.error("Storage Error:", err);
      // Tetap simpan lokal agar transaksi tidak hilang meski cloud gagal
      await saveOrder({ ...orderData, isSynced: false });
    } finally {
      // 3. SELESAI
      setIsProcessing(false);
      onClose();
      onSuccess();
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md space-y-4">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
        </DialogHeader>

        {method === "CASH" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Uang Diterima</p>
              <Input
                type="number"
                placeholder="Masukkan nominal"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value ? Number(e.target.value) : "")}
                autoFocus
                disabled={isProcessing}
              />
            </div>
            {typeof cashReceived === "number" && (
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-400">Kembalian</p>
                <p className={cn("text-lg font-bold", change < 0 ? "text-red-500" : "text-green-600")}>
                  Rp {Math.max(change, 0).toLocaleString("id-ID")}
                </p>
              </div>
            )}
          </div>
        )}

        <Button
          className="w-full h-12 shadow-md cursor-pointer"
          disabled={(method === "CASH" && !isCashEnough) || isProcessing}
          onClick={onConfirm}
        >
          {isProcessing ? "Memproses..." : "Konfirmasi Pembayaran"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}