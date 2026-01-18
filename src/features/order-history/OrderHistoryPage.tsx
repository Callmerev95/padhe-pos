"use client";

import { useOrderHistory } from "./useOrderHistory";
import { OrderHeader } from "@/components/shared/order/OrderHeader";
import { OrderTable } from "@/components/shared/order/OrderTable";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useOrderStore } from "@/store/useOrderStore";
import { Button } from "@/components/ui/button";
import { Download, CloudSync, History } from "lucide-react";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import { Database } from "lucide-react";

export function OrderHistoryPage() {
  const {
    orders,
    loading,
    ...filterState
  } = useOrderHistory();

  const searchParams = useSearchParams();
  const orderIdFromUrl = searchParams.get("id");
  const openOrder = useOrderStore((s) => s.openOrder);

  useEffect(() => {
    if (orderIdFromUrl) {
      openOrder(orderIdFromUrl);
    }
  }, [orderIdFromUrl, openOrder]);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">

      {/* 1. Header (shrink-0) */}
      <div className="shrink-0">
        <PremiumHeader
          icon={History}
          title="RIWAYAT TRANSAKSI"
          subtitle="MONITORING AKTIVITAS PENJUALAN REAL-TIME"
          actions={
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-2xl border-orange-100 bg-orange-50/50 text-orange-600 text-[11px] font-black uppercase hover:bg-orange-100 h-11 px-5 shadow-sm border-2 gap-2 transition-transform active:scale-95">
                <CloudSync size={16} className="text-orange-500 animate-[spin_4s_linear_infinite]" />
                Sync Cloud
              </Button>
              <Button onClick={filterState.onExport} className="rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase h-11 px-6 shadow-xl shadow-slate-200 transition-transform active:scale-95">
                <Download size={16} className="mr-2" />
                Export Data
              </Button>
            </div>
          }
        />
      </div>

      {/* 2. Filter Bar (shrink-0) */}
      <div className="bg-white/60 backdrop-blur-md p-2 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/30 shrink-0">
        <OrderHeader
          dateRange={filterState.dateRange}
          setDateRange={filterState.setDateRange}
          method={filterState.method}
          setMethod={filterState.setMethod}
          type={filterState.type}
          setType={filterState.setType}
        />
      </div>

      {/* 3. TABLE AREA (Scrollable) */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 hover:border-cyan-100">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#f8fafc] pb-12">
          <OrderTable orders={orders} loading={loading} />
        </div>

        <div className="bg-white px-10 py-4 border-t border-slate-50 flex justify-between items-center shrink-0 z-10">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Menampilkan {orders.length} Transaksi Terbaru
          </p>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2.5">
              <Database size={14} className="text-green-500/80" />
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>                </span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Database Connected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Credit Note (shrink-0) */}
      <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em] shrink-0 pt-2 pb-1">
        2026 Padhe Coffee POS System • Arsitektur Global Store v2.0
      </p>
    </div>
  );
}