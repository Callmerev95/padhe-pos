"use client";

import { Calendar as CalendarIcon, Layers, WalletCards } from "lucide-react";
import { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrderHeaderProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  type: string;
  setType: (type: string) => void;
  method: string;
  setMethod: (method: string) => void;
}

export function OrderHeader({ 
  dateRange, setDateRange, 
  type, setType, 
  method, setMethod 
}: OrderHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 w-full justify-start p-1">
      
      {/* 1. Date Filter Group */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 h-12 rounded-2xl border border-slate-100 shadow-sm hover:border-cyan-200 transition-all">
        <CalendarIcon size={16} className="text-cyan-600" />
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mr-2">Periode:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "h-auto p-0 font-semibold text-[13px] hover:bg-transparent transition-none",
                !dateRange && "text-muted-foreground"
              )}
            >
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd LLL")} - {format(dateRange.to, "dd LLL 2026")}
                  </>
                ) : (
                  format(dateRange.from, "dd LLL yyyy")
                )
              ) : (
                <span>Pilih Tanggal</span>
              )}
            </Button>
          </PopoverTrigger>
          {/* FIX VISUAL: Tambahkan bg-white solid dan z-index tinggi */}
          <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border border-slate-100 shadow-2xl bg-white z-999" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

{/* 2. Type Filter Group */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 h-12 rounded-2xl border border-slate-100 shadow-sm hover:border-cyan-200 transition-all">
        <Layers size={16} className="text-cyan-600" />
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mr-2">Tipe:</span>
        <Select value={type} onValueChange={(val) => setType(val)}>
          <SelectTrigger className="h-auto p-0 border-none shadow-none focus:ring-0 text-[13px] font-semibold w-27.5 bg-transparent">
            <SelectValue placeholder="Semua" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 bg-white z-999 shadow-xl">
            {/* Samakan value dengan tampilan di tabel agar cocok saat difilter */}
            <SelectItem value="all" className="text-[13px] font-medium">Semua</SelectItem>
            <SelectItem value="Dine In" className="text-[13px] font-medium">Dine In</SelectItem>
            <SelectItem value="Take Away" className="text-[13px] font-medium">Take Away</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 3. Method Filter Group */}
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 h-12 rounded-2xl border border-slate-100 shadow-sm hover:border-cyan-200 transition-all">
        <WalletCards size={16} className="text-cyan-600" />
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mr-2">METODE:</span>
        <Select value={method} onValueChange={(val) => setMethod(val)}>
          <SelectTrigger className="h-auto p-0 border-none shadow-none focus:ring-0 text-[13px] font-semibold w-27.5 bg-transparent">
            <SelectValue placeholder="Semua" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-slate-100 bg-white z-999 shadow-xl">
            <SelectItem value="all" className="text-[13px] font-medium">Semua</SelectItem>
            <SelectItem value="CASH" className="text-[13px] font-medium">Cash</SelectItem>
            <SelectItem value="BCA" className="text-[13px] font-medium">BCA</SelectItem>
            <SelectItem value="DANA" className="text-[13px] font-medium">Dana</SelectItem>
            <SelectItem value="QRIS" className="text-[13px] font-medium">QRIS</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}