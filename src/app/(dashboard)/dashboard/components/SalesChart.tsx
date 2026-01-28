"use client";

import { Sparkles } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface SalesChartProps {
  data: Array<{
    name: string;
    revenue: number;
  }>;
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-9 shadow-sm h-full flex flex-col group transition-all duration-500 hover:border-slate-300">
      {/* Header Grafik */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">
            Sales Graph
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
            Revenue Flow Weekly
          </p>
        </div>

        {/* Label AI Live Feed - Warna lebih pop-out */}
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50/50 border border-orange-100 rounded-xl text-[9px] font-black text-orange-600 tracking-widest shadow-sm">
          <Sparkles size={14} className="text-orange-500 animate-pulse" />
          AI LIVE FEED
        </div>
      </div>

      {/* Container Grafik */}
      <div className="flex-1 min-h-85 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="pcGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* ✅ Garis bantu horizontal dengan kontras yang lebih terlihat */}
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} // Lebih gelap (slate-500)
              dy={15}
              tickFormatter={(val) => val.toUpperCase()}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} // Lebih kontras (slate-400)
              tickFormatter={(v: number) => `Rp ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />

            <Tooltip
              contentStyle={{
                borderRadius: '20px',
                border: '1px solid #f1f5f9',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)'
              }}
              itemStyle={{ fontWeight: 900, fontSize: '13px', color: '#0f172a' }}
              cursor={{ stroke: '#0f172a', strokeWidth: 1, strokeDasharray: '4 4' }}
              formatter={(value: number | string | (number | string)[] | undefined) => {
                if (value === undefined) return ["Rp 0", "Revenue"];
                const numValue = Number(value);
                if (isNaN(numValue)) return ["Rp 0", "Revenue"];
                return [`Rp ${numValue.toLocaleString("id-ID")}`, "Revenue"];
              }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0f172a"
              strokeWidth={5} // Lebih tebal dikit biar makin bold
              fill="url(#pcGrad)"
              dot={{ r: 5, fill: '#0f172a', strokeWidth: 3, stroke: '#fff' }}
              activeDot={{ r: 8, strokeWidth: 0, fill: '#0f172a' }}
              animationDuration={2000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info Tambahan biar seragam sama kartu lain */}
      <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center text-[9px] font-black text-slate-400 uppercase italic tracking-widest">
        <span>Terminal ID: POS-MAIN-01</span>
        <span className="text-emerald-500">System Synced Successfully</span>
      </div>
    </div>
  );
}