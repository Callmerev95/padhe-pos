"use client";

import type { ReceiptSnapshot } from "@/store/receipt.types";
import { format } from "date-fns";
//import { id } from "date-fns/locale";

type Props = {
  receipt: ReceiptSnapshot;
};

export function ReceiptView({ receipt }: Props) {
  const totalQty = receipt.items.reduce((acc, item) => acc + item.qty, 0);

  return (
    /* Menggunakan w-[58mm] standar printer thermal kecil */
    <div className="print-receipt hidden print:block text-[12px] font-mono leading-[1.2] w-[58mm] bg-white text-black p-0">
      
      {/* 1. HEADER - Alamat & Nama Cafe */}
      <Center>
        <div className="text-[14px] font-bold uppercase tracking-tight">PADHE COFFEE</div>
        <div className="text-[10px] leading-tight px-2">
          Jl. Gunung Setia No. 99, Brang Biji, Sumbawa
        </div>
      </Center>

      <Divider />

      {/* 2. INFO TRANSAKSI - Label Kiri, Value Kanan */}
      <div className="space-y-0.5 px-1">
        <Line label="Order" value={`#${receipt.orderId}`} />
        <Line 
          label="Waktu" 
          value={format(new Date(receipt.createdAt), "dd/MM/yy, HH.mm.ss")} 
        />
        <Line label="Kasir" value={receipt.cashierName || "Rev"} />
        {receipt.customerName && <Line label="Pelanggan" value={receipt.customerName} />}
        <Line label="Tipe" value={receipt.orderType || "Dine In"} />
        <Line label="Metode" value={receipt.paymentMethod} />
      </div>

      <Divider />

      {/* 3. TABLE HEADER - QTY, ITEM, AMT */}
      <div className="grid grid-cols-[30px_1fr_65px] gap-1 px-1 font-bold">
        <span>QTY</span>
        <span>ITEM</span>
        <span className="text-right">AMT</span>
      </div>
      <div className="border-b border-black w-full my-1"></div>

      {/* 4. LIST ITEMS */}
      <div className="space-y-1 px-1">
        {receipt.items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-[30px_1fr_65px] gap-1 items-start">
            <span>{item.qty}</span>
            <span className="warpp-break-words uppercase text-[11px]">{item.name}</span>
            <span className="text-right">
              {(item.qty * item.price).toLocaleString("id-ID")}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-2 px-1 text-[10px] italic">
        Total Item: {totalQty}
      </div>

      <Divider />

      {/* 5. RINCIAN HARGA */}
      <div className="space-y-0.5 px-1">
        <TwoCol label="Subtotal" value={receipt.subtotal} />
        <TwoCol label="Pajak" value={receipt.tax || 0} />
      </div>

      <Divider />

      {/* 6. GRAND TOTAL - Tebal dan Menonjol */}
      <div className="px-1 py-1">
        <div className="flex justify-between items-center font-bold text-[14px]">
          <span>TOTAL</span>
          <span>{receipt.total.toLocaleString("id-ID")}</span>
        </div>
      </div>

      {/* 7. INFO CASH/KEMBALI - Muncul hanya jika Tunai */}
      {receipt.paymentMethod === "CASH" && (
        <div className="px-1 mt-1 pt-1 border-t border-dotted border-black">
          <TwoCol label="Tunai" value={receipt.paid || 0} />
          <TwoCol label="Kembali" value={receipt.change ?? 0} />
        </div>
      )}

      <Divider />

      {/* 8. FOOTER */}
      <Center>
        <div className="text-[11px] font-bold">Terima kasih ☕</div>
        <div className="text-[10px]">Sampai jumpa lagi</div>
      </Center>

      {/* Jarak bawah biar gak kepotong saat disobek */}
      <div className="h-8"></div>
    </div>
  );
}

/* ================= HELPERS (Disesuaikan agar Senyawa) ================= */

function Divider() {
  return <div className="my-2 border-b border-dashed border-black w-full" />;
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function TwoCol({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value.toLocaleString("id-ID")}</span>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="text-center flex flex-col items-center justify-center">{children}</div>;
}