"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { ProfitData } from "../types/dashboard.types";
import { cn } from "@/lib/utils";

interface ProfitAnalysisProps {
  data: ProfitData;
}

export function ProfitAnalysis({ data }: ProfitAnalysisProps) {
  const isLoss = data.netProfit < 0;

  return (
    <div className="bg-[#0f172a] rounded-[2.5rem] p-9 text-white shadow-2xl relative overflow-hidden h-85 group flex flex-col justify-between border border-white/2">
      {/* Efek Cahaya (Glow) di Pojok Kanan Atas */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 blur-[100px] -mr-20 -mt-20 group-hover:bg-emerald-500/15 transition-all duration-1000" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] opacity-80">
            Net Profit Analysis
          </p>
          {/* Badge Margin - Warna dinamis jika rugi */}
          <div className={cn(
            "px-3 py-1.5 border rounded-full text-[10px] font-black uppercase italic tracking-wider transition-colors",
            isLoss
              ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
          )}>
            {data.margin.toFixed(1)}% Margin
          </div>
        </div>

        <div className="mb-10">
          {/* Angka Utama - Penyesuaian baseline Rp */}
          <h2 className={cn(
            "text-6xl font-black tracking-tighter leading-none flex items-center",
            isLoss ? 'text-rose-500' : 'text-emerald-400'
          )}>
            <span className="text-xl text-slate-600 mr-2 italic font-black self-center translate-y-1">Rp</span>
            <CountUp end={data.netProfit} separator="," duration={2.5} />
          </h2>
        </div>

        {/* Breakdown Biaya Operasional */}
        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-7">
          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Gross Profit</p>
            <p className="text-sm lg:text-base font-black text-slate-100 tabular-nums whitespace-nowrap">
              Rp {data.grossProfit.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="space-y-1.5 border-l border-white/10 pl-5">
            <p className="text-[9px] font-black text-rose-500/80 uppercase tracking-widest">Op. Expenses</p>
            <p className="text-sm lg:text-base font-black text-rose-400 italic tabular-nums whitespace-nowrap">
              - Rp {data.expenses.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar & Footer */}
      <div className="relative z-10 space-y-5">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max(Math.abs(data.margin), 0), 100)}%` }}
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              isLoss
                ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                : "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            )}
          />
        </div>
        <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase italic tracking-[0.15em]">
          <span>Efficiency Rate</span>
          <span className="text-slate-400 bg-white/5 px-2 py-0.5 rounded text-[8px] not-italic tracking-normal">Live Data Terminal</span>
        </div>
      </div>
    </div>
  );
}