"use client";

import { useState, useEffect } from "react";
import {
  Settings2,
  ReceiptText,
  Loader2,
  Save,
  Bluetooth
} from "lucide-react"; // ✅ Menghapus PrinterIcon yang tidak terpakai
import { toast } from "sonner";
import { savePrinterSettings, getPrinterSettings } from "@/app/(dashboard)/user/printerActions";

export default function PrinterPage() {
  const [loading, setLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [settings, setSettings] = useState({
    name: "Printer Kasir",
    paperSize: 58,
    header: "PADHE COFFEE",
    address: "Jl. Perjuangan No. 88",
    footer: "Terima kasih atas kunjungan Anda!",
  });

  useEffect(() => {
    async function loadData() {
      const res = await getPrinterSettings();
      if (res.success && res.data) {
        // @ts-expect-error - Handling Prisma type mismatch
        setSettings(res.data);
      }
    }
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await savePrinterSettings(settings);
    setLoading(false);
    if (res.success) toast.success("Pengaturan printer disimpan!");
    else toast.error(res.error);
  }

  // FUNGSI TEST PRINT VIA WEB BLUETOOTH (MAC FRIENDLY)
  // ... kode sebelumnya ...

  // FUNGSI TEST PRINT VIA WEB BLUETOOTH (MAC FRIENDLY)
  async function handleBluetoothTestPrint() {
    setIsConnecting(true);
    try {
      // ✅ Definisikan interface tanpa menggunakan global types yang tidak ditemukan
      interface BluetoothNavigator extends Navigator {
        bluetooth: {
          requestDevice: (options: {
            acceptAllDevices?: boolean;
            optionalServices?: string[];
          }) => Promise<{
            gatt?: {
              connect: () => Promise<{
                getPrimaryService: (service: string) => Promise<{
                  getCharacteristic: (characteristic: string) => Promise<{
                    writeValue: (value: BufferSource) => Promise<void>;
                  }>;
                }>;
              }>;
            };
          }>;
        };
      }

      const nav = navigator as BluetoothNavigator;

      if (!nav.bluetooth) {
        toast.error("Browser ini tidak mendukung Web Bluetooth. Gunakan Chrome.");
        return;
      }

      // 1. Request akses Bluetooth
      const device = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      if (!device.gatt) {
        toast.error("GATT tidak tersedia pada perangkat ini.");
        return;
      }

      const server = await device.gatt.connect();
      const service = await server.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristic = await service.getCharacteristic('00002af1-0000-1000-8000-00805f9b34fb');

      // 2. Encode Text ke format ESC/POS
      const encoder = new TextEncoder();
      const textToPrint =
        `${settings.header}\n` +
        `${settings.address}\n` +
        `--------------------------------\n` +
        `TEST KONEKSI BERHASIL!\n` +
        `PRINTER SIAP DIGUNAKAN\n` +
        `--------------------------------\n` +
        `${settings.footer}\n\n\n\n`;

      const data = encoder.encode(textToPrint);

      // 3. Kirim data
      await characteristic.writeValue(data);
      toast.success("Berhasil! Printer merespon.");

    } catch (error) {
      console.error(error);
      toast.error("Koneksi dibatalkan atau printer tidak ditemukan.");
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6 p-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-black tracking-tighter uppercase italic">Printer Setup</h1>
        <p className="text-slate-500 font-medium text-sm">Konfigurasi struk thermal dan koneksi bluetooth.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        {/* FORM KONFIGURASI */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 text-cyan-600">
            <Settings2 className="w-5 h-5" />
            <h2 className="font-black text-xs uppercase tracking-[0.2em]">Konfigurasi</h2>
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Nama Cafe (Header)</label>
              <input
                value={settings.header}
                onChange={(e) => setSettings({ ...settings, header: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Alamat Outlet</label>
              <input
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-cyan-500 transition-all"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Pesan Footer</label>
              <textarea
                value={settings.footer}
                onChange={(e) => setSettings({ ...settings, footer: e.target.value })}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 focus:ring-cyan-500 min-h-24 resize-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white rounded-2xl py-5 font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Konfigurasi
          </button>
        </form>

        {/* PREVIEW & TESTING */}
        <div className="bg-slate-50 rounded-[3rem] p-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-8 text-slate-400">
            <ReceiptText className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Struk Preview (58mm)</span>
          </div>

          {/* KERTAS THERMAL SHADOW */}
          <div className="w-56 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-8 flex flex-col items-center text-center font-mono text-[10px] text-slate-800 leading-tight border-t-4 border-cyan-500">
            <div className="font-bold text-sm uppercase mb-1 tracking-tighter">{settings.header}</div>
            <div className="text-[9px] mb-4 whitespace-pre-line opacity-70">{settings.address}</div>
            <div className="w-full border-b border-dashed border-slate-200 my-3" />
            <div className="w-full flex justify-between mb-1">
              <span>Caramel Latte x1</span>
              <span className="font-bold">28.000</span>
            </div>
            <div className="w-full border-b border-dashed border-slate-200 my-3" />
            <div className="w-full flex justify-between font-black text-xs uppercase tracking-tighter">
              <span>Total</span>
              <span>28.000</span>
            </div>
            <div className="w-full border-b border-dashed border-slate-200 my-3" />
            <div className="mt-4 uppercase font-medium leading-relaxed">{settings.footer}</div>
            <div className="mt-4 text-[7px] text-slate-400 uppercase italic">22/01/2026 - Padhe POS v1.0</div>
          </div>

          {/* BLUETOOTH TEST BUTTON */}
          <div className="mt-10 w-full max-w-60 space-y-3">
            <button
              type="button"
              onClick={handleBluetoothTestPrint}
              disabled={isConnecting}
              className="w-full group flex items-center justify-center gap-3 py-4 bg-white border-2 border-cyan-500 text-cyan-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bluetooth className="w-4 h-4 group-hover:animate-pulse" />
              )}
              {isConnecting ? "Connecting..." : "Test Bluetooth Print"}
            </button>
            <p className="text-[9px] text-center text-slate-400 font-bold uppercase tracking-tighter px-4">
              Gunakan Chrome di Mac untuk fitur Bluetooth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}