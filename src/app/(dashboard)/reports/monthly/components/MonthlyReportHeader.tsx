"use client";

import { BarChart3, CalendarDays } from "lucide-react";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";

interface Props {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export function MonthlyReportHeader({ selectedMonth, onMonthChange }: Props) {
  return (
    <PremiumHeader
      title="LAPORAN BULANAN"
      subtitle="ANALISA PERFORMA PENJUALAN TIAP BULAN"
      icon={CalendarDays}
      actions={
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white shadow-sm">
          <BarChart3 size={16} className="text-indigo-600" />
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase leading-none tracking-tighter">Pilih Bulan</span>
            <input
              type="month"
              className="bg-transparent border-none p-0 text-[11px] font-bold text-slate-700 outline-none focus:ring-0 cursor-pointer"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
            />
          </div>
        </div>
      }
    />
  );
}