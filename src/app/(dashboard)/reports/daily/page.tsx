"use client";

import { useOrderHistory } from "@/features/order-history/useOrderHistory";
import { useMemo, useState } from "react";
import { BarChart3, Calendar } from "lucide-react";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import { ReportStatsSection } from "@/components/shared/reports/ReportStatsSection";
import { PaymentMethodGrid } from "@/components/shared/reports/PaymentMethodGrid";
import { RevenueAreaChart } from "@/components/shared/reports/RevenueAreaChart";

export default function DailyReportPage() {
  const { orders = [], loading } = useOrderHistory({ allData: true });
  // State untuk tanggal yang dipilih
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  });

  // Filter orders berdasarkan tanggal yang dipilih
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const d = new Date(order.createdAt);
      const orderDate = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
      return orderDate === selectedDate;
    });
  }, [orders, selectedDate]);

  // Kalkulasi data laporan dari filteredOrders
  const reportData = useMemo(() => {
    let foodRevenue = 0, drinkRevenue = 0, totalRevenue = 0;
    let foodQty = 0, drinkQty = 0;
    let cashTotal = 0, qrisTotal = 0, bcaTotal = 0, danaTotal = 0;

    filteredOrders.forEach((order) => {
      totalRevenue += (order.total || 0);
      if (order.paymentMethod === "CASH") cashTotal += (order.total || 0);
      else if (order.paymentMethod === "QRIS") qrisTotal += (order.total || 0);
      else if (order.paymentMethod === "BCA") bcaTotal += (order.total || 0);
      else if (order.paymentMethod === "DANA") danaTotal += (order.total || 0);

      order.items?.forEach((item) => {
        const itemTotal = (item.price || 0) * (item.qty || 0);
        if (item.categoryType === "FOOD") {
          foodRevenue += itemTotal;
          foodQty += (item.qty || 0);
        } else if (item.categoryType === "DRINK") {
          drinkRevenue += itemTotal;
          drinkQty += (item.qty || 0);
        }
      });
    });

    const getPercentage = (amount: number) =>
      totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(0) : "0";

    return {
      foodRevenue, drinkRevenue, totalRevenue,
      foodQty, drinkQty, count: filteredOrders.length,
      cashTotal, qrisTotal, bcaTotal, danaTotal,
      percentages: {
        cash: getPercentage(cashTotal),
        qris: getPercentage(qrisTotal),
        bca: getPercentage(bcaTotal),
        dana: getPercentage(danaTotal)
      }
    };
  }, [filteredOrders]);

  const chartData = useMemo(() => {
    const hourly: Record<string, { name: string; Makanan: number; Minuman: number }> = {};
    for (let i = 0; i <= 23; i++) {
      const hour = `${i.toString().padStart(2, '0')}:00`;
      hourly[hour] = { name: hour, Makanan: 0, Minuman: 0 };
    }
    filteredOrders.forEach(order => {
      const date = new Date(order.createdAt);
      const hour = `${date.getHours().toString().padStart(2, '0')}:00`;
      if (hourly[hour]) {
        order.items?.forEach(item => {
          if (item.categoryType === "FOOD") hourly[hour].Makanan += (item.price * item.qty);
          if (item.categoryType === "DRINK") hourly[hour].Minuman += (item.price * item.qty);
        });
      }
    });
    return Object.values(hourly);
  }, [filteredOrders]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] gap-4">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mengkalkulasi Laporan...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">
      <PremiumHeader
        title="LAPORAN HARIAN"
        subtitle="RINGKASAN PERFORMA PENJUALAN REAL-TIME"
        icon={BarChart3}
        actions={
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white shadow-sm">
            <Calendar size={16} className="text-cyan-600" />
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase leading-none tracking-tighter">Pilih Tanggal</span>
              <input
                type="date"
                className="bg-transparent border-none p-0 text-[11px] font-bold text-slate-700 outline-none focus:ring-0 cursor-pointer"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
        }
      />

      <ReportStatsSection {...reportData} />

      <PaymentMethodGrid data={reportData} />

      <RevenueAreaChart
        data={chartData}
        isEmpty={filteredOrders.length === 0}
        title="Tren Penjualan Per Jam"
      />

      <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em] shrink-0 pt-2 pb-1">
        2026 Padhe Coffee POS System • Arsitektur Global Store v2.0
      </p>
    </div>
  );
} 