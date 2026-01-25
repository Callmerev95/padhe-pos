"use client";

"use client";

import { useMemo, useState, useEffect } from "react";
import { type OrderItem } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { LowStockAlert } from "@/components/shared/inventory/LowStockAlert";
import { motion } from "framer-motion";
import {  Wallet, Trophy, History, Sparkles, Activity, ArrowRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CountUp from "react-countup";
import { cn } from "@/lib/utils";

interface OrderFromCloud {
  id: string;
  createdAt: Date | string;
  total: number;
  items: Prisma.JsonValue;
  customerName?: string;
  paymentMethod?: string;
  orderType: string;
}

interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  unitUsage: string;
  minStock: number;
}

interface ProfitData {
  revenue: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
  margin: number;
}

interface DashboardClientProps {
  initialOrders: OrderFromCloud[];
  lowStockItems: LowStockItem[];
  profitData: ProfitData;
}

export type FilterPeriod = "HARI_INI" | "MINGGU_INI" | "BULAN_INI";

export default function DashboardClient({ initialOrders, lowStockItems, profitData }: DashboardClientProps) {
  const [filter, setFilter] = useState<FilterPeriod>("HARI_INI");
  const [newOrderId, setNewOrderId] = useState<string | null>(null);
  const isLoss = profitData.netProfit < 0;
  const router = useRouter();

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;

    return createClient(url, key);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('dashboard-realtime-ux')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'Order' },
        (payload) => {
          setNewOrderId(payload.new.id);
          router.refresh();
          setTimeout(() => setNewOrderId(null), 3000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();

    const parseItems = (items: Prisma.JsonValue): OrderItem[] => {
      return (typeof items === 'string' ? JSON.parse(items) : items) as OrderItem[];
    };

    // --- 1. FILTER LOGIC (CURRENT PERIOD) ---
    const filteredOrders = initialOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (filter === "HARI_INI") return orderDate.toDateString() === todayStr;
      if (filter === "MINGGU_INI") {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        return orderDate >= lastWeek && orderDate <= now;
      }
      if (filter === "BULAN_INI") {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    // --- 2. PREVIOUS PERIOD LOGIC (FOR TREND) ---
    const getPrevPeriodOrders = () => {
      const prevStart = new Date(now);
      const prevEnd = new Date(now);

      if (filter === "HARI_INI") {
        prevStart.setDate(now.getDate() - 1);
        return initialOrders.filter(o => new Date(o.createdAt).toDateString() === prevStart.toDateString());
      }
      if (filter === "MINGGU_INI") {
        prevStart.setDate(now.getDate() - 14);
        prevEnd.setDate(now.getDate() - 7);
        return initialOrders.filter(o => {
          const d = new Date(o.createdAt);
          return d >= prevStart && d < prevEnd;
        });
      }
      if (filter === "BULAN_INI") {
        const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
        const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
        return initialOrders.filter(o => {
          const d = new Date(o.createdAt);
          return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        });
      }
      return [];
    };

    const prevOrders = getPrevPeriodOrders();
    const prevRevenue = prevOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const prevOrderCount = prevOrders.length;

    // --- 3. CALCULATE STATS ---
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = filteredOrders.length;
    let totalFood = 0;
    let totalDrink = 0;

    filteredOrders.forEach(order => {
      parseItems(order.items).forEach(item => {
        const sub = (item.price || 0) * (item.qty || 0);
        if (item.categoryType === "FOOD") totalFood += sub;
        if (item.categoryType === "DRINK") totalDrink += sub;
      });
    });

    const calculateTrend = (curr: number, prev: number): number => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const getVsLabel = () => {
      if (filter === "HARI_INI") return "vs yesterday";
      if (filter === "MINGGU_INI") return "vs last week";
      return "vs last month";
    };

    // --- 4. OTHER DATA (CHART, TOP PRODUCTS, RECENT) ---
    const chartData = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dailyTotal = initialOrders
        .filter(o => new Date(o.createdAt).toDateString() === d.toDateString())
        .reduce((sum, o) => sum + (o.total || 0), 0);
      return { name: dayName, revenue: dailyTotal };
    });

    const productSales: Record<string, { name: string; qty: number; total: number }> = {};
    filteredOrders.forEach(order => {
      parseItems(order.items).forEach(item => {
        if (!productSales[item.id]) productSales[item.id] = { name: item.name, qty: 0, total: 0 };
        productSales[item.id].qty += item.qty || 0;
      });
    });

    return {
      activeRevenue: totalRevenue,
      activeOrders: totalOrders,
      activeFood: totalFood,
      activeDrink: totalDrink,
      revenueTrend: calculateTrend(totalRevenue, prevRevenue),
      orderTrend: calculateTrend(totalOrders, prevOrderCount),
      vsLabel: getVsLabel(),
      chartData,
      yAxisDomain: [0, Math.ceil((Math.max(...chartData.map(d => d.revenue)) || 100000) * 1.1)],
      topProducts: Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5),
      recentOrders: [...initialOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map(o => ({
        id: o.id,
        total: o.total,
        waktu: new Date(o.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        tanggal: new Date(o.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        customer: o.customerName || "GUEST",
        metode: o.paymentMethod || "CASH",
        tipe: (o.orderType || "").toLowerCase().includes("dine") ? "Dine In" : "Take Away"
      }))
    };
  }, [initialOrders, filter]);

  const getFilterLabel = () => {
    if (filter === "MINGGU_INI") return "Weekly";
    if (filter === "BULAN_INI") return "Monthly";
    return "Daily";
  };

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-425 mx-auto px-4 lg:px-8">
      
      {/* 1. COMPACT HEADER FOR PC */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl">
            <Activity size={20} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic leading-none">Intelligence Dashboard</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Padhe Coffee • Real-time Terminal
            </p>
          </div>
        </div>

        <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/40 backdrop-blur-md">
          {["HARI_INI", "MINGGU_INI", "BULAN_INI"].map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p as FilterPeriod)}
              className={cn(
                "px-5 py-2 rounded-xl text-[9px] font-black tracking-widest transition-all duration-300",
                filter === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {p.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <LowStockAlert items={lowStockItems} />

      {/* 2. MASTER GRID: Optimized for Wide Screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMN LEFT (4): High-Level Summary */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm flex flex-col justify-between h-70 group hover:border-slate-300 transition-all duration-500"
          >
             <div className="flex justify-between items-start">
               <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
                 <Wallet size={24} />
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full">+{stats.revenueTrend.toFixed(1)}%</p>
               </div>
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Gross Revenue</p>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                 <span className="text-xl text-slate-300 mr-2 italic font-bold">Rp</span>
                 <CountUp end={stats.activeRevenue} separator="," duration={2} />
               </h2>
               <div className="flex gap-4 mt-6">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Food</span>
                    <span className="text-xs font-black text-slate-700">Rp {stats.activeFood.toLocaleString()}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-100" />
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-slate-400 uppercase">Drinks</span>
                    <span className="text-xs font-black text-slate-700">Rp {stats.activeDrink.toLocaleString()}</span>
                  </div>
               </div>
             </div>
          </motion.div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-85 group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] -mr-20 -mt-20 group-hover:bg-emerald-500/20 transition-all duration-700" />
             <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-center">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Net Profit Analysis</p>
                   <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-emerald-400 uppercase italic">
                      {profitData.margin.toFixed(1)}% Margin
                   </div>
                </div>
                <div>
                  <h2 className="text-5xl font-black tracking-tighter text-emerald-400">
                    <span className="text-xl text-slate-600 mr-1 italic">Rp</span>
                    <CountUp end={profitData.netProfit} separator="," duration={2} />
                  </h2>
                </div>
                <div className="space-y-4">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: "75%" }} className="h-full bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                  </div>
                  <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase italic tracking-widest">
                    <span>Performance Target</span>
                    <span className="text-white">75% Achieved</span>
                  </div>
                </div>
             </div>
          </div>
        </div>

        {/* COLUMN CENTER (5): Visual Analytics */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase italic">Sales Graph</h3>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Revenue Flow Weekly</p>
                 </div>
                 <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[9px] font-black text-slate-400 tracking-widest border border-slate-100">
                    <Sparkles size={14} className="text-amber-500" /> AI LIVE FEED
                 </div>
              </div>
              <div className="flex-1 min-h-100">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.chartData}>
                       <defs>
                         <linearGradient id="pcGrad" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#0f172a" stopOpacity={0.08}/>
                           <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} dy={10} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#cbd5e1' }} tickFormatter={(v) => `${v/1000}k`} />
                       <Tooltip 
                         contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '15px' }}
                         itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                       />
                       <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={4} fill="url(#pcGrad)" dot={{ r: 4, fill: '#0f172a', strokeWidth: 2, stroke: '#fff' }} />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>

        {/* COLUMN RIGHT (3): Action & Top Performers */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black text-slate-900 uppercase italic tracking-tight">Top Menus</h3>
                <Trophy size={18} className="text-amber-500" />
              </div>
              <div className="space-y-6 flex-1">
                {stats.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-200 group-hover:text-slate-900 transition-all italic">0{i+1}</span>
                      <div>
                        <p className="text-[11px] font-black text-slate-800 uppercase leading-none">{p.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1">{p.qty} Items Sold</p>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-slate-200 group-hover:text-slate-900 transition-all" />
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
                Full Inventory Report
              </button>
           </div>
        </div>
      </div>

      {/* 3. HORIZONTAL RECENT ORDERS (Footer Style for PC) */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm overflow-hidden">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <History size={18} className="text-blue-500" />
               <h3 className="text-sm font-black text-slate-900 uppercase italic">Recent Activities</h3>
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Latest 5 Transactions</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.recentOrders.map((order) => (
              <motion.div 
                key={order.id}
                whileHover={{ scale: 1.02 }}
                className="p-5 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-200 hover:bg-white transition-all group"
              >
                <div className="flex justify-between items-start mb-3">
                   <div className="h-9 w-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-[9px] group-hover:bg-slate-900 group-hover:text-white transition-all">
                      {order.customer.slice(0, 2).toUpperCase()}
                   </div>
                   <span className="text-[8px] font-black px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md uppercase italic">
                      {order.metode}
                   </span>
                </div>
                <p className="text-[11px] font-black text-slate-900 uppercase truncate mb-0.5">{order.customer}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-4">{order.waktu} • {order.tipe}</p>
                <p className="text-[13px] font-black text-slate-900 italic">Rp {order.total.toLocaleString()}</p>
              </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
}