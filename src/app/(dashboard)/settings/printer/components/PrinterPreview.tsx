"use client";

import { ReceiptText, Loader2, Bluetooth } from "lucide-react";
import { PrinterSettings } from "../types/printer.types";

interface Props {
  settings: PrinterSettings;
  isConnecting: boolean;
  onTestPrint: () => Promise<void>;
}

export function PrinterPreview({ settings, isConnecting, onTestPrint }: Props) {
  return (
    <div className="bg-slate-50 rounded-[3rem] p-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-8 text-slate-400">
        <ReceiptText className="w-4 h-4" />
        <span className="text-[10px] font-black uppercase tracking-widest">Struk Preview ({settings.paperSize}mm)</span>
      </div>

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
        <div className="mt-4 text-[7px] text-slate-400 uppercase italic">22/01/2026 - Padhe POS v2.0</div>
      </div>

      <div className="mt-10 w-full max-w-60 space-y-3">
        <button
          type="button"
          onClick={onTestPrint}
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
  );
}