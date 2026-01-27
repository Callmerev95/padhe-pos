"use client";

import { useOrderHistory } from "@/features/order-history/useOrderHistory";
import { useMemo, useState } from "react";
import { ReportStatsSection } from "@/components/shared/reports/ReportStatsSection";
import { PaymentMethodGrid } from "@/components/shared/reports/PaymentMethodGrid";
import { RevenueAreaChart } from "@/components/shared/reports/RevenueAreaChart";
import { MonthlyReportHeader } from "./components/MonthlyReportHeader";
// Menggunakan shared types untuk keamanan data [cite: 2026-01-12]
import { ReportData, ChartDataPoint, OrderItem } from "@/types/report.types";

export default function MonthlyReportPage() {
  const { orders = [], loading } = useOrderHistory({ allData: true });
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // 1. Filter Logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderMonth = new Date(order.createdAt).toISOString().slice(0, 7);
      return orderMonth === selectedMonth;
    });
  }, [orders, selectedMonth]);

  // 2. Calculation Logic
  const reportData = useMemo((): ReportData => {
    let foodRevenue = 0, drinkRevenue = 0, totalRevenue = 0;
    let foodQty = 0, drinkQty = 0;
    let cashTotal = 0, qrisTotal = 0, bcaTotal = 0, danaTotal = 0;

    filteredOrders.forEach((order) => {
      totalRevenue += (order.total || 0);
      if (order.paymentMethod === "CASH") cashTotal += (order.total || 0);
      else if (order.paymentMethod === "QRIS") qrisTotal += (order.total || 0);
      else if (order.paymentMethod === "BCA") bcaTotal += (order.total || 0);
      else if (order.paymentMethod === "DANA") danaTotal += (order.total || 0);

      // FIX: Pakai OrderItem, haram pakai 'any' [cite: 2026-01-10]
      order.items?.forEach((item: OrderItem) => {
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

  // 3. Chart Logic (Per Hari dalam satu bulan)
  const chartData = useMemo((): ChartDataPoint[] => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    const daily: Record<string, ChartDataPoint> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      const dayLabel = i.toString().padStart(2, '0');
      daily[dayLabel] = { name: dayLabel, Makanan: 0, Minuman: 0 };
    }

    filteredOrders.forEach(order => {
      const day = new Date(order.createdAt).getDate().toString().padStart(2, '0');
      if (daily[day]) {
        // FIX: Pakai OrderItem agar build mulus [cite: 2026-01-10]
        order.items?.forEach((item: OrderItem) => {
          const val = (item.price || 0) * (item.qty || 0);
          if (item.categoryType === "FOOD") daily[day].Makanan += val;
          if (item.categoryType === "DRINK") daily[day].Minuman += val;
        });
      }
    });
    return Object.values(daily);
  }, [filteredOrders, selectedMonth]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)] gap-4">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Menyiapkan Laporan Bulanan...</p>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">
      <MonthlyReportHeader selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />

      <ReportStatsSection {...reportData} />
      <PaymentMethodGrid data={reportData} />
      
      <RevenueAreaChart 
        data={chartData} 
        isEmpty={filteredOrders.length === 0} 
        title="Tren Penjualan Harian" 
      />

      <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em] shrink-0 pt-2 pb-1">
        2026 Padhe Coffee POS System • Arsitektur Global Store v2.0
      </p>
    </div>
  );
}