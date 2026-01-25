"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Printer, FileText, ChevronRight, Loader2 } from "lucide-react";
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

  function onDownloadPdf() {
    toast.info("Fitur PDF akan segera hadir");
  }

  return (
    <Dialog open={open} onOpenChange={onFinish}>
      <DialogContent className="max-w-sm p-0 overflow-hidden border-none rounded-[2.5rem] bg-white">
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Pembayaran Berhasil</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        {/* Top Celebration Section */}
        <div className="bg-emerald-500 p-8 text-white flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
          
          <div className="bg-white/20 p-3 rounded-full mb-4 animate-in zoom-in duration-500">
            <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={3} />
          </div>
          
          <div className="text-center space-y-1 relative z-10">
            <h2 className="text-2xl font-black uppercase tracking-tight">Sukses!</h2>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
              Transaksi Berhasil Diproses
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Amount Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
              Total Pembayaran
            </span>
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              Rp {receipt.total.toLocaleString("id-ID")}
            </span>
          </div>

          {/* Details List */}
          <div className="space-y-3 px-1">
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold text-slate-400 uppercase tracking-widest">Order ID</span>
              <span className="font-black text-slate-900">#{receipt.orderId}</span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold text-slate-400 uppercase tracking-widest">Metode</span>
              <span className="font-black text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-md uppercase">
                {receipt.paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px]">
              <span className="font-bold text-slate-400 uppercase tracking-widest">Waktu</span>
              <span className="font-bold text-slate-600">
                {format(new Date(receipt.createdAt), "HH:mm, dd MMM yyyy", { locale: id })}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {/* Main Action: PRINT */}
            <Button
              onClick={onPrint}
              disabled={isPrinting}
              className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              {isPrinting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Printer className="h-5 w-5 group-hover:rotate-12 transition-transform" />
              )}
              <span className="font-black uppercase tracking-widest text-xs">Cetak Struk Thermal</span>
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onDownloadPdf}
                className="h-12 rounded-xl border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
              >
                <FileText className="mr-2 h-4 w-4 text-slate-400" />
                SIMPAN PDF
              </Button>

              <Button
                onClick={onFinish}
                className="h-12 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-black text-xs uppercase tracking-widest group"
              >
                SELESAI
                <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>

      <div className="print-receipt hidden print:block">
        <ReceiptView receipt={receipt} />
      </div>
    </Dialog>
  );
}