"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Play } from "lucide-react";
import { useHoldOrderStore } from "@/store/useHoldOrderStore";
import { useCartStore } from "@/store/useCartStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function HoldOrderListModal({ open, onClose }: Props) {
  const holds = useHoldOrderStore((s) => s.holds);
  const resumeHold = useHoldOrderStore((s) => s.resumeHold);
  
  // ✅ Kita hanya butuh loadHoldToCart sekarang
  const loadHoldToCart = useCartStore((s) => s.loadHoldToCart);

  function handleResume(id: string) {
    const hold = resumeHold(id);
    if (!hold) return;

    // ✅ LANGSUNG LOAD SEMUA: Ini otomatis set items, customerName, orderType, DAN activeOrderId
    loadHoldToCart(hold);

    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            Hold Order
          </DialogTitle>
        </DialogHeader>

        {holds.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Tidak ada order yang di-hold
          </div>
        ) : (
          <div className="mt-3 max-h-105 space-y-2 overflow-y-auto pr-1">
            {holds.map((order) => {
              const total = order.items.reduce(
                (t, i) => t + i.price * i.qty,
                0
              );

              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 hover:bg-muted transition"
                >
                  {/* LEFT */}
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">
                      {order.customerName || "Guest"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.orderType === "Dine In" ? "Dine In" : "Take Away"} •{" "}
                      {order.items.length} item •{" "}
                      {new Date(order.createdAt).toLocaleTimeString("id-ID")}
                    </p>
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold whitespace-nowrap">
                      Rp {total.toLocaleString("id-ID")}
                    </p>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleResume(order.id)}
                      className="cursor-pointer"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}