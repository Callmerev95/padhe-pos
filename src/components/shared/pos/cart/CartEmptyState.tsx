"use client";

import { ReceiptText, PlusCircle } from "lucide-react";

export function CartEmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center py-20 px-6 text-center">
      
      {/* Container Ikon - Ukuran di-adjust agar lebih compact */}
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-white rounded-4xl shadow-lg shadow-slate-200/50 flex items-center justify-center border border-slate-50 rotate-6 transition-transform duration-500">
          <ReceiptText size={32} strokeWidth={1.5} className="text-slate-200" />
        </div>
        
        {/* Badge Plus juga disesuaikan ukurannya */}
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-cyan-500 rounded-full border-[3px] border-white flex items-center justify-center text-white shadow-md">
          <PlusCircle size={16} strokeWidth={3} />
        </div>
      </div>

      {/* Konten Teks */}
      <div className="space-y-1.5">
        <h3 className="font-black text-slate-900 uppercase tracking-tight text-[13px] leading-none">
          Keranjang Kosong
        </h3>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] max-w-40 leading-relaxed mx-auto">
          Pilih produk di samping untuk memulai transaksi.
        </p>
      </div>

      {/* Aksen Dot Dekoratif tetap dipertahankan */}
      <div className="mt-8 flex gap-1 opacity-20">
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <div className="w-1 h-1 rounded-full bg-slate-300" />
        <div className="w-1 h-1 rounded-full bg-slate-300" />
      </div>
    </div>
  );
}