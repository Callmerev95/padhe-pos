"use client";

import { motion } from "framer-motion";
import { History, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Interface eksplisit tanpa 'any' sesuai instruksi
 */
interface RecentOrder {
  id: string;
  total: number;
  waktu: string;
  tanggal: string;
  customer: string;
  metode: string;
  tipe: string;
}

interface RecentActivitiesProps {
  orders: RecentOrder[];
}

export function RecentActivities({ orders }: RecentActivitiesProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-9 shadow-sm overflow-hidden group transition-all duration-500 hover:border-slate-300">
      {/* Header Bagian Aktivitas */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm shadow-blue-100/50">
            <History size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Recent Activities</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
              Latest 5 Transactions
            </p>
          </div>
        </div>

        <button className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-1">
          Full Log <ArrowUpRight size={12} strokeWidth={3} />
        </button>
      </div>

      {/* Grid Kartu Transaksi */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {orders.length > 0 ? (
          orders.map((order) => (
            <motion.div
              key={order.id}
              whileHover={{ y: -5 }} // Efek melayang ke atas dikit
              className="p-5 bg-slate-50/50 rounded-4xl border border-transparent hover:border-slate-200 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group/card relative overflow-hidden"
            >
              {/* Badge Metode Pembayaran - Pojok Kanan Atas */}
              <span className={cn(
                "absolute top-4 right-5 text-[8px] font-black px-2 py-0.5 rounded-md uppercase italic transition-colors",
                order.metode.toLowerCase() === 'cash' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
              )}>
                {order.metode}
              </span>

              <div className="mb-4">
                {/* Avatar Inisial Nama Customer */}
                <div className="h-11 w-11 rounded-2xl bg-white border border-slate-100 flex items-center justify-center font-black text-[10px] group-hover/card:bg-slate-900 group-hover/card:text-white group-hover/card:scale-110 transition-all duration-300 shadow-sm">
                  {order.customer.slice(0, 2).toUpperCase()}
                </div>
              </div>

              {/* Detail Transaksi */}
              <div className="space-y-0.5">
                <p className="text-[12px] font-black text-slate-900 uppercase truncate">
                  {order.customer}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {order.waktu} • {order.tipe}
                </p>
              </div>

              {/* Total Bayar */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <p className="text-sm font-black text-slate-900 italic tabular-nums">
                  Rp {order.total.toLocaleString("id-ID")}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center opacity-20 italic text-[10px] font-black uppercase tracking-widest">
            Waiting for first order today...
          </div>
        )}
      </div>
    </div>
  );
}