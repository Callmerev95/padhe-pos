"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, Printer, Loader2 } from "lucide-react";
import { useReceiptStore } from "@/store/useReceiptStore";
import { getPrinterSettings } from "@/app/(dashboard)/user/printerActions";
import { PrinterSettings, BluetoothNavigator } from "@/app/(dashboard)/settings/printer/types/printer.types";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function PaymentSuccessModal({ open, onClose }: Props) {
  const { receipt } = useReceiptStore();
  const [isPrinting, setIsPrinting] = useState(false);
  const [printerConfig, setPrinterConfig] = useState<PrinterSettings | null>(null);

  useEffect(() => {
    if (open) {
      getPrinterSettings().then((res) => {
        if (res.success) setPrinterConfig(res.data as unknown as PrinterSettings);
      });
    }
  }, [open]);

  const handleBluetoothPrint = async () => {
    // ✅ Tambahkan pengecekan menyeluruh agar TypeScript tidak komplain
    if (!receipt || !printerConfig) {
      toast.error("Data transaksi atau setting printer belum siap.");
      return;
    };

    setIsPrinting(true);
    try {
      const nav = navigator as unknown as BluetoothNavigator;
      if (!nav.bluetooth) {
        toast.error("Web Bluetooth tidak didukung di browser ini.");
        return;
      }

      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      const server = await device?.gatt?.connect();
      const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service?.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      const encoder = new TextEncoder();

      const line = "--------------------------------\n";
      const receiptBody = receipt.items.map(item =>
        `${item.name.toUpperCase()}\n${item.qty} x ${item.price.toLocaleString()} = ${(item.qty * item.price).toLocaleString()}`
      ).join('\n');

      // ✅ Gunakan fallback (0) jika change bernilai undefined
      const textToPrint =
        `${printerConfig.header}\n` +
        `${printerConfig.address}\n` +
        line +
        `Order: ${receipt.orderId}\n` +
        `Kasir: ${receipt.cashierName}\n` +
        line +
        `${receiptBody}\n` +
        line +
        `TOTAL: Rp ${receipt.total.toLocaleString()}\n` +
        `BAYAR: Rp ${receipt.paid.toLocaleString()}\n` +
        `KEMBALI: Rp ${(receipt.change ?? 0).toLocaleString()}\n` +
        line +
        `${printerConfig.footer}\n\n\n\n`;

      const data = encoder.encode(textToPrint);
      await characteristic?.writeValue(data);
      toast.success("Struk berhasil dicetak!");

    } catch (error) {
      console.error(error);
      toast.error("Koneksi dibatalkan atau printer tidak ditemukan.");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[2.5rem] bg-slate-50">
        <DialogHeader className="sr-only">
          <DialogTitle>Pembayaran Berhasil</DialogTitle>
          <DialogDescription>Detail transaksi dan cetak struk bluetooth.</DialogDescription>
        </DialogHeader>

        <div className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-25" />
              <div className="relative bg-emerald-500 text-white p-6 rounded-full shadow-lg shadow-emerald-200">
                <CheckCircle2 size={56} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">
              SUCCESS!
            </h2>
            {/* ✅ Pengecekan aman untuk rendering UI */}
            {receipt && (
              <div className="bg-emerald-50 py-2 px-4 rounded-xl inline-block border border-emerald-100">
                <p className="text-emerald-700 font-black text-xl">
                  KEMBALI: Rp {(receipt.change ?? 0).toLocaleString("id-ID")}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 pt-4">
            <Button
              onClick={handleBluetoothPrint}
              disabled={isPrinting}
              className="h-16 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white shadow-xl shadow-cyan-100 flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
            >
              {isPrinting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Printer size={22} />}
              <span className="font-black uppercase tracking-widest text-sm">Cetak Struk Bluetooth</span>
            </Button>

            <Button
              onClick={onClose}
              variant="ghost"
              className="h-14 rounded-2xl text-slate-400 hover:text-slate-900 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Selesai & Pesanan Baru
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}