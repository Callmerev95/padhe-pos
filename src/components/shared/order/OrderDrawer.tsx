"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Printer, Trash2 } from "lucide-react";
import { useOrderDetail } from "@/features/order-history/useOrderDetail";
//import { useReceiptStore } from "@/store/useReceiptStore";
import { deleteOrder } from "@/lib/db";
import { toast } from "sonner"; // ✅ Tambahk
import { printReceiptBluetooth } from "@/lib/printer-utils"; // ✅ Import printer utilsan toast untuk feedback
import { getPrinterSettings } from "@/app/(dashboard)/user/printerActions"; // ✅ Import settings

// Definisi tipe data untuk item dalam order
type OrderItem = {
  name: string;
  qty: number;
  price: number;
};

// Definisi tipe data untuk order yang diperluas dengan string pada beberapa properti
interface ExtendedOrder {
  id: string;
  createdAt: string;
  total: number;
  paid: number;
  paymentMethod: string;
  customerName?: string;
  orderType: string;
  items: OrderItem[];
}

// Props untuk OrderDrawer
type Props = {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
};

// Komponen OrderDrawer
export function OrderDrawer({ open, onClose, orderId }: Props) {
  const { order, loading } = useOrderDetail(orderId);
  //const setReceipt = useReceiptStore((s) => s.setReceipt);

  // State untuk mengontrol Alert Dialog
  const [showVoidAlert, setShowVoidAlert] = useState(false);

  // State untuk mengontrol proses pencetakan
  const [isPrinting, setIsPrinting] = useState(false);

  //if (!open) return null;

  const safeOrder = order as unknown as ExtendedOrder;

  // Fungsi Eksekusi Void
  async function handleConfirmVoid() {
    if (!safeOrder) return;
    try {
      await deleteOrder(safeOrder.id);
      setShowVoidAlert(false);
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Gagal menghapus order:", error);
    }
  }

  async function onPrint() {
    if (!safeOrder) return;

    setIsPrinting(true);
    try {
      const res = await getPrinterSettings();

      if (res.success && res.data) {
        const s = res.data;
        const paidAmount = safeOrder.paid ?? safeOrder.total;
        const calculateChange = paidAmount - safeOrder.total;

        await printReceiptBluetooth({
          header: s.header || "PADHE COFFEE",
          address: s.address || "",
          items: safeOrder.items.map((i: OrderItem) => ({
            name: i.name,
            qty: i.qty,
            price: i.price,
          })),
          total: safeOrder.total,
          footer: s.footer || "Terima Kasih!",
          kasir: "Rev", // Atau ambil dari state kasir jika ada
          customerName: safeOrder.customerName || "Guest",
          orderType: safeOrder.orderType,
          subtotal: safeOrder.total, // Jika di DB tidak ada subtotal, pakai total
          paid: paidAmount,
          change: calculateChange > 0 ? calculateChange : 0,
        });

        toast.success("Mencetak struk...");
      } else {
        toast.error("Atur printer di menu Settings terlebih dahulu");
      }
    } catch (err) {
      const error = err as Error;
      toast.error(`Gagal Cetak: ${error.message}`);
    } finally {
      setIsPrinting(false);
    }
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onClose} direction="right">
        <DrawerContent className="w-105 sm:w-120 h-full flex flex-col outline-none focus:outline-none focus-visible:ring-0">
          <DrawerHeader className="shrink-0 border-b">
            <DrawerTitle>Detail Transaksi</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
            {loading && (
              <p className="text-sm text-muted-foreground italic">Memuat detail transaksi...</p>
            )}

            {!loading && safeOrder && (
              <>
                {/* INFO SECTION */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">ID</span>
                    <span className="font-mono text-[11px] font-medium text-slate-500">#{safeOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tanggal</span>
                    <span>{new Date(safeOrder.createdAt).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pelanggan</span>
                    <span className="font-medium">{safeOrder.customerName || "Guest"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metode</span>
                    <span className="font-bold text-emerald-600 uppercase text-[11px]">{safeOrder.paymentMethod}</span>
                  </div>
                </div>

                <Separator />

                {/* ITEMS SECTION */}
                <div className="space-y-4">
                  <p className="font-bold text-[10px] uppercase text-slate-400 tracking-widest">Rincian Produk</p>
                  <div className="space-y-4">
                    {safeOrder.items?.map((i: OrderItem, idx: number) => (
                      <div key={idx} className="flex justify-between items-start gap-4">
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-slate-800 leading-tight">{i.name}</span>
                          <span className="text-xs text-muted-foreground">{i.qty} x Rp {i.price.toLocaleString("id-ID")}</span>
                        </div>
                        <span className="font-bold text-slate-900 shrink-0">
                          Rp {(i.qty * i.price).toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* FOOTER */}
          {!loading && safeOrder && (
            <div className="shrink-0 p-6 border-t bg-slate-50/50 space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-base font-medium text-slate-600">Total Tagihan</span>
                <span className="text-2xl font-black text-emerald-600">
                  Rp {safeOrder.total.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  className="w-full bg-[#1a1f2c] hover:bg-[#2d3446] py-7 text-base shadow-lg"
                  onClick={onPrint}
                  disabled={isPrinting} // ✅ Gunakan loading state
                >
                  <Printer className="mr-3 h-5 w-5" />
                  {isPrinting ? "Mencetak..." : "Print Receipt"}
                </Button>

                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 py-6"
                  onClick={() => setShowVoidAlert(true)} // Munculkan Alert Dialog
                >
                  <Trash2 className="mr-3 h-5 w-5" />
                  Batalkan Pesanan (Void)
                </Button>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      {/* ALERT DIALOG VOID */}
      <AlertDialog open={showVoidAlert} onOpenChange={setShowVoidAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pembatalan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin membatalkan pesanan <strong>#{safeOrder?.id}</strong>?
              Tindakan ini tidak dapat dibatalkan dan data akan dihapus permanen dari riwayat transaksi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Kembali</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmVoid}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Ya, Batalkan Pesanan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}