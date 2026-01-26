"use client";

import { motion } from "framer-motion";
import CountUp from "react-countup";
import { ProfitData } from "../types/dashboard.types";

/**
 * Interface Props menggunakan tipe data yang sudah 
 * kita definisikan di dashboard.types.ts
 */
interface ProfitAnalysisProps {
  data: ProfitData;
}

export function ProfitAnalysis({ data }: ProfitAnalysisProps) {
  // Cek apakah sedang rugi (net profit di bawah nol)
  const isLoss = data.netProfit < 0;

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-85 group flex flex-col justify-between">
      {/* Efek Cahaya (Glow) di Pojok Kanan Atas */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-all duration-700" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">
            Net Profit Analysis
          </p>
          {/* Badge Margin Keuntungan */}
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-emerald-400 uppercase italic">
            {data.margin.toFixed(1)}% Margin
          </div>
        </div>

        <div>
          {/* Warna teks berubah jadi merah (rose) kalau rugi */}
          <h2 className={`text-5xl font-black tracking-tighter ${isLoss ? 'text-rose-400' : 'text-emerald-400'}`}>
            <span className="text-xl text-slate-600 mr-1 italic font-bold">Rp</span>
            <CountUp end={data.netProfit} separator="," duration={2} />
          </h2>
        </div>

        {/* Breakdown Biaya Operasional */}
        <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6 mt-6">
          <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Gross Profit</p>
            <p className="text-sm font-black text-slate-200">
              Rp {data.grossProfit.toLocaleString()}
            </p>
          </div>
          <div className="space-y-1 border-l border-white/5 pl-4">
            <p className="text-[8px] font-black text-rose-500/70 uppercase tracking-widest">Op. Expenses</p>
            <p className="text-sm font-black text-rose-400 italic">
              - Rp {data.expenses.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar Target Performa */}
      <div className="relative z-10 space-y-4">
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }} 
            animate={{ width: `${Math.min(Math.max(data.margin, 0), 100)}%` }} 
            className="h-full bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]" 
          />
        </div>
        <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase italic tracking-widest">
          <span>Efficiency Rate</span>
          <span className="text-white">Live Data Terminal</span>
        </div>
      </div>
    </div>
  );
}