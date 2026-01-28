"use client";

import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import CountUp from "react-countup";
import { cn } from "@/lib/utils";

/**
 * Interface Props eksplisit tanpa 'any'
 */
interface RevenueCardProps {
  revenue: number;
  trend: number;
  food: number;
  drink: number;
}

export function RevenueCard({ revenue, trend, food, drink }: RevenueCardProps) {
  const isDown = trend < 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "bg-white border border-slate-100 p-9 rounded-[2.5rem] shadow-sm flex flex-col justify-between h-85 group transition-all duration-500 relative overflow-hidden",
        "hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/50" // Hover netral & premium
      )}
    >
      {/* Dekorasi Glow Netral saat Hover */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-50 rounded-full blur-3xl group-hover:bg-slate-100/80 transition-colors duration-700" />

      {/* Bagian Atas: Icon & Persentase Trend */}
      <div className="relative z-10 flex justify-between items-start">
        <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200 transition-all duration-500 group-hover:scale-105">
          <Wallet size={26} strokeWidth={2.5} />
        </div>

        <div className={cn(
          "px-3 py-1.5 rounded-full text-[10px] font-black italic tracking-wider transition-colors shadow-sm",
          isDown ? "bg-rose-50 text-rose-500 border border-rose-100" : "bg-emerald-50 text-emerald-500 border border-emerald-100"
        )}>
          {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
        </div>
      </div>

      {/* Bagian Tengah: Total Revenue Utama */}
      <div className="relative z-10">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-2">
          Gross Revenue
        </p>
        <h2 className="text-5xl font-black text-slate-900 tracking-tighter flex items-center">
          <span className="text-xl text-slate-300 mr-2 italic font-black self-center translate-y-1">Rp</span>
          <CountUp end={revenue} separator="," duration={2.5} />
        </h2>
      </div>

      {/* Bagian Bawah: Breakdown Food vs Drink */}
      {/* Kontras Divider Horizontal dinaikkan ke slate-200/60 */}
      <div className="relative z-10 grid grid-cols-2 gap-4 border-t border-slate-200/60 pt-7">
        <div className="flex flex-col space-y-1.5">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Food Items</span>
          <span className="text-base font-black text-slate-800 tabular-nums">
            Rp {food.toLocaleString("id-ID")}
          </span>
        </div>

        {/* Kontras Divider Vertikal dinaikkan ke slate-200/60 */}
        <div className="flex flex-col space-y-1.5 border-l border-slate-200/60 pl-6">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Drink Items</span>
          <span className="text-base font-black text-slate-800 tabular-nums">
            Rp {drink.toLocaleString("id-ID")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}