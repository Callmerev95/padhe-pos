"use client";

import { cn } from "@/lib/utils";
import { Banknote, Wallet, CreditCard, QrCode } from "lucide-react";
import { ReportData } from "@/types/report.types";

interface Props {
  data: ReportData; // Gunakan interface global agar sinkron dengan page laporan [cite: 2026-01-12]
}

export function PaymentMethodGrid({ data }: Props) {
  const methods = [
    {
      label: 'Tunai',
      value: data.cashTotal,
      percent: data.percentages.cash,
      icon: Banknote,
      color: 'emerald'
    },
    {
      label: 'DANA',
      value: data.danaTotal,
      percent: data.percentages.dana,
      icon: Wallet,
      color: 'blue'
    },
    {
      label: 'BCA',
      value: data.bcaTotal,
      percent: data.percentages.bca,
      icon: CreditCard,
      color: 'indigo'
    },
    {
      label: 'QRIS',
      value: data.qrisTotal,
      percent: data.percentages.qris,
      icon: QrCode,
      color: 'rose'
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
      {methods.map((pm) => (
        <div
          key={pm.label}
          className="bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-white shadow-sm flex items-center gap-4 group hover:bg-white transition-all duration-300"
        >
          <div className={cn("p-2.5 rounded-xl transition-colors", {
            'bg-emerald-50 text-emerald-600': pm.color === 'emerald',
            'bg-blue-50 text-blue-600': pm.color === 'blue',
            'bg-indigo-50 text-indigo-600': pm.color === 'indigo',
            'bg-rose-50 text-rose-600': pm.color === 'rose',
          })}>
            <pm.icon size={18} />
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                {pm.label}
              </span>
              <span className={cn("text-[8px] font-bold px-1.5 py-0.5 rounded-md", {
                'bg-emerald-100 text-emerald-700': pm.color === 'emerald',
                'bg-blue-100 text-blue-700': pm.color === 'blue',
                'bg-indigo-100 text-indigo-700': pm.color === 'indigo',
                'bg-rose-100 text-rose-700': pm.color === 'rose',
              })}>
                {pm.percent}%
              </span>
            </div>
            <span className="text-[13px] font-black text-slate-700 tracking-tight">
              Rp {pm.value.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}