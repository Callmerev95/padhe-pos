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

/**
 * Interface Props untuk data grafik.
 * Kita pastikan array object berisi name (string) dan revenue (number).
 */
interface SalesChartProps {
  data: Array<{
    name: string;
    revenue: number;
  }>;
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
      {/* Header Grafik */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase italic">Sales Graph</h3>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Revenue Flow Weekly</p>
        </div>
        {/* Label AI Live Feed sebagai variasi visual */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 tracking-widest border border-slate-100">
          <Sparkles size={14} className="text-amber-500" /> AI LIVE FEED
        </div>
      </div>

      {/* Container Grafik: Responsif mengikuti ukuran kolom */}
      <div className="flex-1 min-h-87.5">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              {/* Definisi Gradasi Warna Grafik */}
              <linearGradient id="pcGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f172a" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
              </linearGradient>
            </defs>

            {/* Garis Bantu Horizontal saja agar tetap clean */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }}
              dy={10}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }}
              tickFormatter={(v: number) => `Rp ${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />

            {/* Kustomisasi Tooltip saat grafik di-hover */}
            <Tooltip
              contentStyle={{
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                padding: '15px'
              }}
              itemStyle={{ fontWeight: 900, fontSize: '12px', color: '#0f172a' }}
              /**
               * Perbaikan Akhir Error TS2322:
               * Kita tambahkan | undefined pada tipe parameternya agar sesuai dengan 
               * definisi internal Recharts.
               */
              formatter={(value: number | string | (number | string)[] | undefined) => {
                // Jika value tidak ada (undefined), kembalikan default
                if (value === undefined) return ["Rp 0", "Revenue"];

                const numValue = Number(value);

                // Jika hasil konversi bukan angka, kembalikan default
                if (isNaN(numValue)) return ["Rp 0", "Revenue"];

                // Format angka ke mata uang Indonesia (Tanpa any)
                return [`Rp ${numValue.toLocaleString()}`, "Revenue"];
              }}
            />

            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#0f172a"
              strokeWidth={4}
              fill="url(#pcGrad)"
              dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}