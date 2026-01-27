"use client";

import { Calendar, BarChart3 } from "lucide-react";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";

interface Props {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DailyReportHeader({ selectedDate, onDateChange }: Props) {
  return (
    <PremiumHeader
      title="LAPORAN HARIAN"
      subtitle="RINGKASAN PERFORMA PENJUALAN REAL-TIME"
      icon={BarChart3}
      actions={
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white shadow-sm">
          <Calendar size={16} className="text-cyan-600" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase leading-none tracking-tighter">
              Pilih Tanggal
            </span>
            <input
              type="date"
              className="bg-transparent border-none p-0 text-[11px] font-bold text-slate-700 outline-none focus:ring-0 cursor-pointer"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>
        </div>
      }
    />
  );
}