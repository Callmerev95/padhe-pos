"use client";

import { Button } from "@/components/ui/button";
import { CloudSync, Loader2 } from "lucide-react";
import { useState } from "react";
// Import fungsi ambil data langsung dari IndexedDB
import { getAllOrders } from "@/lib/db"; 
import { syncBulkOrders } from "@/app/(dashboard)/order/actions";
import { toast } from "sonner";

export function SyncCloudButton() {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // AMBIL SEMUA DATA (31 order) langsung dari IndexedDB, abaikan filter UI
      const allLocalOrders = await getAllOrders();
      
      if (!allLocalOrders || allLocalOrders.length === 0) {
        toast.error("Tidak ada data untuk disinkronkan.");
        return;
      }

      const formattedOrders = allLocalOrders.map(order => ({
        id: order.id,
        createdAt: order.createdAt,
        total: order.total,
        paid: order.paid,
        paymentMethod: order.paymentMethod,
        customerName: order.customerName ?? "Guest",
        orderType: order.orderType,
        items: order.items.map(item => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          categoryType: item.categoryType
        }))
      }));

      const result = await syncBulkOrders(formattedOrders);
      
      if (result.success) {
        toast.success(`${result.count} total transaksi berhasil diamankan ke Cloud!`);
      } else {
        toast.error("Gagal sinkronisasi data.");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleSync} 
      disabled={isSyncing}
      className="gap-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
    >
      {isSyncing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CloudSync className="w-4 h-4" />
      )}
      Sync Cloud
    </Button>
  );
}