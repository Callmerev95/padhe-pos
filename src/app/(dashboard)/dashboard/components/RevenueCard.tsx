"use client";

import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import CountUp from "react-countup";

/**
 * Interface Props untuk RevenueCard.
 * Kita definisikan secara eksplisit tanpa 'any'.
 */
interface RevenueCardProps {
  revenue: number;
  trend: number;
  food: number;
  drink: number;
}

export function RevenueCard({ revenue, trend, food, drink }: RevenueCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }}
      className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between h-70 group hover:border-slate-300 transition-all duration-500"
    >
      {/* Bagian Atas: Icon & Persentase Trend */}
      <div className="flex justify-between items-start">
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
          <Wallet size={24} />
        </div>
        <div className="text-right">
          {/* Menampilkan trend positif/negatif dengan warna emerald */}
          <p className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">
            {trend >= 0 ? "+" : ""}{trend.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Bagian Tengah: Total Revenue Utama */}
      <div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">
          Gross Revenue
        </p>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
          <span className="text-xl text-slate-300 mr-2 italic font-bold">Rp</span>
          <CountUp end={revenue} separator="," duration={2} />
        </h2>

        {/* Bagian Bawah: Breakdown Food vs Drink */}
        <div className="flex gap-4 mt-6">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Food</span>
            <span className="text-xs font-black text-slate-700">Rp {food.toLocaleString()}</span>
          </div>
          {/* Separator Garis Vertikal */}
          <div className="w-px h-8 bg-slate-100" />
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Drinks</span>
            <span className="text-xs font-black text-slate-700">Rp {drink.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}