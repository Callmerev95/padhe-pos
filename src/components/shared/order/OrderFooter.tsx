"use client";

import { Database } from "lucide-react";

type Props = {
  count: number;
  label: string;
};

export function OrderFooter({ count, label }: Props) {
  return (
    <div className="bg-white px-10 py-4 border-t border-slate-50 flex justify-between items-center shrink-0 z-10">
      {/* POLISH 3: Menggunakan Total X [Label] agar lebih informatif secara statistik */}
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        Total {count} {label}
      </p>
      
      <div className="flex gap-4 items-center">
        <div className="flex items-center gap-2.5">
          <Database size={14} className="text-green-500/80" />
          <div className="flex items-center gap-2">
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
             </span>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
               Database Connected
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}