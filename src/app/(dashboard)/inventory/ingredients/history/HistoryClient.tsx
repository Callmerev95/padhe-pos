"use client";

import { History, List, ArrowUpRight, ArrowDownLeft, RefreshCcw, Search, Calendar as CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import { OrderFooter } from "@/components/shared/order/OrderFooter";
import { CreditNote } from "@/components/shared/order/CreditNote";
import Link from "next/link";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react"; // Tambah useEffect & useMemo

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface StockLogItem {
  id: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  previousStock: number;
  currentStock: number;
  note: string | null;
  createdAt: Date;
  ingredient: {
    name: string;
    unitUsage: string;
  };
}

interface HistoryClientProps {
  initialLogs: StockLogItem[];
}

type FilterType = "ALL" | "IN" | "OUT" | "ADJUSTMENT";

export default function HistoryClient({ initialLogs }: HistoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [typeFilter, setTypeFilter] = useState<FilterType>("ALL");
  
  useEffect(() => {
    // Memberitahu ESLint bahwa kita sengaja melakukan ini untuk fix hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const dateParam = searchParams.get("date");
  const selectedDate = dateParam ? new Date(dateParam) : new Date();

  // Filter Logic
  const filteredLogs = useMemo(() => {
    if (typeFilter === "ALL") return initialLogs;
    return initialLogs.filter(log => log.type === typeFilter);
  }, [initialLogs, typeFilter]);

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const formattedDate = format(newDate, "yyyy-MM-dd");
      router.push(`?date=${formattedDate}`);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredLogs.map((log) => ({
        Waktu: format(new Date(log.createdAt), "dd MMM yyyy, HH:mm"),
        Bahan: log.ingredient.name,
        Tipe: log.type,
        Jumlah: `${log.type === 'IN' ? '+' : '-'}${log.quantity} ${log.ingredient.unitUsage}`,
        Stok_Akhir: `${log.currentStock} ${log.ingredient.unitUsage}`,
        Catatan: log.note || "-",
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "StockHistory");
    XLSX.writeFile(workbook, `Stock_History_${format(selectedDate, "yyyy-MM-dd")}.xlsx`);
  };

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">
      <div className="shrink-0 flex flex-col gap-2">
        <PremiumHeader 
          icon={History}
          title="HISTORI PERGERAKAN"
          subtitle="MONITORING MASUK DAN KELUARNYA BAHAN BAKU REAL-TIME"
          actions={
            <Button 
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-slate-900 text-white h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              <Download size={14} /> Export Data
            </Button>
          }
        />

        <div className="bg-white/60 backdrop-blur-md p-2 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/30 flex items-center justify-between px-6 h-14">
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 shadow-inner">
              <Link href="/inventory/ingredients" className="flex items-center gap-2 px-4 py-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                <List className="h-3 w-3" /> Daftar Stok
              </Link>
              <Link href="/inventory/ingredients/history" className="flex items-center gap-2 px-4 py-1.5 bg-white text-slate-900 rounded-lg shadow-sm text-[9px] font-black uppercase tracking-widest transition-all">
                <History className="h-3 w-3" /> Histori
              </Link>
            </div>

            {/* FILTER TIPE */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              {(["ALL", "IN", "OUT"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                    typeFilter === t 
                      ? "bg-white text-cyan-600 shadow-sm" 
                      : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  {t === "ALL" ? "Semua" : t === "IN" ? "Masuk" : "Keluar"}
                </button>
              ))}
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "flex items-center gap-2 bg-white border-2 border-slate-100 px-4 h-9 rounded-xl shadow-sm hover:border-cyan-400 hover:bg-white transition-all text-[10px] font-black uppercase",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon size={14} className="text-cyan-600" />
                  {selectedDate ? format(selectedDate, "dd MMM yyyy", { locale: id }) : <span>Pilih Tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  initialFocus
                  className="rounded-2xl border border-slate-100 bg-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-cyan-50 p-2 rounded-xl">
              <Search size={16} className="text-cyan-600" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
              {filteredLogs.length} Aktivitas Terfilter
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 hover:border-cyan-100">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#fafbfc] pb-12">
          {filteredLogs.length > 0 ? (
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky top-0 z-30 bg-[#f8fafc] px-8 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Waktu</th>
                  <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Bahan Baku</th>
                  <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-center font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Tipe</th>
                  <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-right font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Jumlah</th>
                  <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-center font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Stok Akhir</th>
                  <th className="sticky top-0 z-30 bg-[#f8fafc] px-8 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="group transition-all duration-500 relative bg-white hover:z-20 hover:shadow-[0_0_25px_rgba(34,211,238,0.15),0_10px_15px_-3px_rgba(0,0,0,0.05)]">
                    <td className="px-8 py-5 relative">
                      <div className={cn(
                        "absolute inset-y-0 left-0 w-1 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center",
                        log.type === "IN" ? "bg-emerald-500" : log.type === "OUT" ? "bg-red-500" : "bg-amber-500"
                      )} />
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter tabular-nums">
                        {format(new Date(log.createdAt), "dd MMM yyyy", { locale: id })}
                        <br />
                        <span className="text-[9px] font-black text-slate-400 italic">{format(new Date(log.createdAt), "HH:mm")}</span>
                      </span>
                    </td>
                    <td className="px-6 py-5 font-black text-slate-700 text-xs uppercase tracking-tight group-hover:text-cyan-600 transition-colors">{log.ingredient.name}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm group-hover:text-white transition-all",
                        log.type === "IN" ? "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-500" : 
                        log.type === "OUT" ? "bg-red-50 text-red-600 border-red-100 group-hover:bg-red-500" : 
                        "bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-500"
                      )}>
                        {log.type === "IN" ? <ArrowUpRight className="h-3 w-3" /> : log.type === "OUT" ? <ArrowDownLeft className="h-3 w-3" /> : <RefreshCcw className="h-3 w-3" />}
                        {log.type}
                      </span>
                    </td>
                    <td className={cn(
                      "px-6 py-5 text-right font-black text-xs tabular-nums tracking-tight",
                      log.type === 'IN' ? 'text-emerald-600' : 'text-red-600'
                    )}>
                      {log.type === 'IN' ? '+' : '-'}{log.quantity} <span className="text-[9px] uppercase">{log.ingredient.unitUsage}</span>
                    </td>
                    <td className="px-6 py-5 text-center font-black text-slate-700 text-xs tabular-nums">
                      {log.currentStock} <span className="text-[9px] text-slate-400 font-bold uppercase">{log.ingredient.unitUsage}</span>
                    </td>
                    <td className="px-8 py-5 text-[11px] text-slate-400 font-bold italic uppercase tracking-tight line-clamp-1 group-hover:text-slate-600 transition-colors">
                      {log.note || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-4xl flex items-center justify-center mb-6 shadow-inner">
                <History className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="font-black text-slate-400 text-sm uppercase tracking-widest italic">Tidak ada aktivitas terfilter</h3>
            </div>
          )}
        </div>
        <OrderFooter count={filteredLogs.length} label="Total Aktivitas Terfilter" />
      </div>
      <CreditNote />
    </div>
  );
}