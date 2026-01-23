"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Printer, FileText } from "lucide-react";
import { useReceiptStore } from "@/store/useReceiptStore";
import { useCartStore } from "@/store/useCartStore";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { ReceiptView } from "@/components/shared/pos/receipt/ReceiptView";
import { useState } from "react";
import { toast } from "sonner";
import { printReceiptBluetooth } from "@/lib/printer-utils";
import { getPrinterSettings } from "@/app/(dashboard)/user/printerActions";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PaymentSuccessModal({ open, onClose }: Props) {
  // ✅ Cara aman ambil state tanpa harus export interface manual dari store
  const receipt = useReceiptStore((s) => s.receipt);
  const clearReceipt = useReceiptStore((s) => s.clearReceipt);
  const resetOrder = useCartStore((s) => s.resetOrder);

  const [isPrinting, setIsPrinting] = useState(false);

  if (!receipt) return null;

  function onFinish() {
    resetOrder();
    clearReceipt();
    onClose();
  }

  // ... (bagian import tetap sama)

  async function onPrint() {
    if (!receipt) {
      toast.error("Data transaksi tidak ditemukan");
      return;
    }

    setIsPrinting(true);
    try {
      const res = await getPrinterSettings();

      if (res.success && res.data) {
        const s = res.data;
        const currentReceipt = receipt;

        await printReceiptBluetooth({
          header: s.header || "PADHE COFFEE",
          address: s.address || "",
          items: currentReceipt.items.map((i: { name: string; qty: number; price: number }) => ({
            name: i.name,
            qty: i.qty,
            price: i.price,
          })),
          total: currentReceipt.total,
          footer: s.footer || "Terima Kasih!",
          kasir: currentReceipt.cashierName || "Revangga",
          // ✅ Tambahan field baru sesuai request
          customerName: currentReceipt.customerName,
          orderType: currentReceipt.orderType,
          subtotal: currentReceipt.subtotal,
          tax: currentReceipt.tax,
          charge: currentReceipt.charge,
          paid: currentReceipt.paid,
          change: currentReceipt.change,
        });

        toast.success("Struk sedang dicetak...");
      } else {
        toast.error("Atur printer di menu Settings terlebih dahulu");
      }
    } catch (err) {
      const error = err as Error;
      toast.error(`Gagal Cetak: ${error.message || "Masalah koneksi"}`);
    } finally {
      setIsPrinting(false);
    }
  }

  // ... (sisanya tetap sama)

  function onDownloadPdf() {
    alert("Download PDF (coming soon)");
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center p-6 space-y-4 overflow-hidden">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Pembayaran Berhasil</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-2">
          <CheckCircle2 className="h-14 w-14 text-green-600" />
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Pembayaran Berhasil!</h2>
            <p className="text-xs text-muted-foreground">
              Transaksi telah berhasil diproses
            </p>
          </div>
        </div>

        <div className="py-2">
          <Button
            onClick={onPrint}
            disabled={isPrinting}
            className="w-full h-14 text-lg font-bold bg-[#1a1f2c] hover:bg-[#2d3446] text-white shadow-lg transition-transform active:scale-95"
          >
            <Printer className="mr-2 h-6 w-6" />
            {isPrinting ? "Mencetak..." : "PRINT STRUK"}
          </Button>
          <p className="text-[10px] text-muted-foreground mt-2">
            Klik tombol biru di atas untuk mencetak struk thermal
          </p>
        </div>

        <div className="p-3 border rounded-xl bg-slate-50/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Total Pembayaran
          </p>
          <p className="text-2xl font-black text-slate-900">
            Rp {receipt.total.toLocaleString("id-ID")}
          </p>
        </div>

        <div className="rounded-lg border border-dashed bg-muted/30 p-3 text-[11px] space-y-1.5 text-left">
          <div className="flex justify-between">
            <span className="text-muted-foreground">ID Transaksi</span>
            <span className="font-mono font-medium">#{receipt.orderId}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Waktu</span>
            <span>
              {format(new Date(receipt.createdAt), "HH:mm, dd MMM yyyy", {
                locale: id,
              })}
            </span>
          </div>

          <div className="flex justify-between border-t pt-1.5 mt-1.5 font-bold">
            <span>Metode</span>
            <span>{receipt.paymentMethod}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onDownloadPdf}
            className="h-10 text-xs border-slate-300"
          >
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>

          <Button
            variant="secondary"
            onClick={onFinish}
            className="h-10 text-xs bg-slate-100 hover:bg-slate-200"
          >
            Selesai
          </Button>
        </div>
      </DialogContent>

      <div className="print-receipt hidden print:block">
        <ReceiptView receipt={receipt} />
      </div>
    </Dialog>
  );
}