"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CloudSync, Loader2 } from "lucide-react";
import { getAllOrders, updateOrderSyncStatus, type LocalOrder } from "@/lib/db";
import { syncBulkOrders } from "@/app/(dashboard)/order/actions";
import { toast } from "sonner";

export function SyncCloudButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const allLocalOrders = await getAllOrders();
      const unSyncedOrders = allLocalOrders.filter((o) => !o.isSynced);

      if (unSyncedOrders.length === 0) {
        toast.info("Semua data sudah sinkron.");
        return;
      }

      // ✅ FIX: Zero 'any' - Gunakan Record<string, unknown> untuk data mentah dari DB
      const formattedOrders: LocalOrder[] = unSyncedOrders.map((order) => {
        const rawOrder = order as Record<string, unknown>;

        return {
          id: order.id,
          createdAt: order.createdAt,
          total: order.total,
          paid: order.paid,
          paymentMethod: order.paymentMethod,
          customerName: order.customerName || "Guest",
          orderType: order.orderType,
          // ✅ FIX: Cek status tanpa menggunakan 'any'
          status: typeof rawOrder.status === "string" && (rawOrder.status === "COMPLETED" || rawOrder.status === "PENDING")
            ? rawOrder.status
            : (order.paid >= order.total ? "COMPLETED" : "PENDING"),
          items: order.items.map((item) => ({
            id: item.id,
            name: item.name,
            qty: item.qty,
            price: item.price,
            categoryType: item.categoryType,
            notes: item.notes || "",
            isDone: item.isDone || false,
          })),
          isSynced: false,
        };
      });

      const result = await syncBulkOrders(formattedOrders);

      if (result.success) {
        for (const order of formattedOrders) {
          await updateOrderSyncStatus(order.id, true);
        }
        toast.success(`${formattedOrders.length} transaksi berhasil diamankan!`);
      } else {
        toast.error(`Gagal: ${result.error}`);
      }
    } catch (error) {
      console.error("SYNC_ERROR:", error);
      toast.error("Terjadi kesalahan sinkronisasi.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isSyncing}
      className="gap-2 rounded-xl border-slate-200 hover:bg-cyan-50 hover:text-cyan-700 h-10 shadow-sm"
    >
      {isSyncing ? (
        <Loader2 className="w-4 h-4 animate-spin text-cyan-600" />
      ) : (
        <CloudSync className="w-4 h-4 text-cyan-600" />
      )}
      <span className="font-bold text-xs uppercase tracking-tight">Sync Cloud</span>
    </Button>
  );
}