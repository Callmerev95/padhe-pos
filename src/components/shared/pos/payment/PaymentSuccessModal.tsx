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


type Props = {
  open: boolean;
  onClose: () => void;
};

export function PaymentSuccessModal({ open, onClose }: Props) {
  const receipt = useReceiptStore((s) => s.receipt);
  const clearReceipt = useReceiptStore((s) => s.clearReceipt);
  const resetOrder = useCartStore((s) => s.resetOrder);

  if (!receipt) return null;

  function onFinish() {
    resetOrder();
    clearReceipt();
    onClose();
  }

  function onPrint() {
    window.print();
  }


  function onDownloadPdf() {
    alert("Download PDF (coming soon)");
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center space-y-6">
        {/* ================= HEADER (ACCESSIBILITY) ================= */}
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Pembayaran Berhasil</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>

        {/* ================= ICON ================= */}
        <div className="flex justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-600" />
        </div>

        {/* ================= TITLE ================= */}
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">
            Pembayaran Berhasil!
          </h2>
          <p className="text-sm text-muted-foreground">
            Transaksi telah berhasil di proses
          </p>
        </div>

        {/* ================= TOTAL ================= */}
        <div>
          <p className="text-sm text-muted-foreground">
            Total Pembayaran
          </p>
          <p className="text-3xl font-bold">
            Rp {receipt.total.toLocaleString("id-ID")}
          </p>
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-2">
          <div className="flex justify-between">
            <span>ID Transaksi</span>
            <span>#{receipt.orderId}</span>
          </div>

          <div className="flex justify-between">
            <span>Waktu Transaksi</span>
            <span>
              {format(new Date(receipt.createdAt), "dd MMM yyyy, HH:mm", {
                locale: id,
              })}
            </span>
          </div>

          {receipt.customerName && (
            <div className="flex justify-between">
              <span>Nama Pelanggan</span>
              <span>{receipt.customerName}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Metode Pembayaran</span>
            <span>{receipt.paymentMethod}</span>
          </div>

          <div className="flex justify-between font-semibold pt-1">
            <span>Total</span>
            <span>Rp {receipt.total.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="grid gap-2 pt-2">
          <Button onClick={onPrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>

          <Button variant="outline" onClick={onDownloadPdf}>
            <FileText className="mr-2 h-4 w-4" />
            Download PDF
          </Button>

          <Button variant="ghost" onClick={onFinish}>
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
