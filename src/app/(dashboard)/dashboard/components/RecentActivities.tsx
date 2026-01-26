"use client";

import { motion } from "framer-motion";
import { History } from "lucide-react";

/**
 * Interface untuk tiap item transaksi.
 * Kita definisikan sesuai dengan hasil mapping di hook useDashboardStats.
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
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm overflow-hidden">
      {/* Header Bagian Aktivitas */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <History size={18} className="text-blue-500" />
          <h3 className="text-sm font-black text-slate-900 uppercase italic">Recent Activities</h3>
        </div>
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
          Latest 5 Transactions
        </p>
      </div>

      {/* Grid Kartu Transaksi: 1 kolom di HP, 5 kolom di Desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {orders.length > 0 ? (
          orders.map((order) => (
            <motion.div 
              key={order.id}
              whileHover={{ scale: 1.02 }} // Efek membesar dikit pas di-hover
              className="p-5 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-200 hover:bg-white transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                {/* Avatar Inisial Nama Customer */}
                <div className="h-9 w-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-[9px] group-hover:bg-slate-900 group-hover:text-white transition-all">
                  {order.customer.slice(0, 2).toUpperCase()}
                </div>
                {/* Badge Metode Pembayaran */}
                <span className="text-[8px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md uppercase italic">
                  {order.metode}
                </span>
              </div>

              {/* Detail Transaksi */}
              <p className="text-[11px] font-black text-slate-900 uppercase truncate mb-0.5">
                {order.customer}
              </p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-4">
                {order.waktu} • {order.tipe}
              </p>
              
              {/* Total Bayar */}
              <p className="text-[13px] font-black text-slate-900 italic">
                Rp {order.total.toLocaleString()}
              </p>
            </motion.div>
          ))
        ) : (
          /* State jika belum ada transaksi hari ini */
          <div className="col-span-full py-10 text-center opacity-20 italic text-[10px] font-black uppercase">
            Waiting for first order today...
          </div>
        )}
      </div>
    </div>
  );
}