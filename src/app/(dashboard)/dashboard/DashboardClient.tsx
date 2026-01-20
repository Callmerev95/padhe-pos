"use client";

import { useMemo, useState, useEffect } from "react";
import { type OrderItem } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { LowStockAlert } from "@/components/shared/inventory/LowStockAlert";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Wallet, TrendingDown, Coffee, Receipt, Trophy, ArrowUpRight, Utensils, ChartLine, History } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import CountUp from "react-countup";

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
    <div className="flex flex-col gap-6 pb-10 max-w-350 mx-auto px-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic leading-none">Dashboard Overview</h1>
          <div className="flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Padhe Coffee • Live System</p>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/50 backdrop-blur-sm shadow-inner">
          {["HARI_INI", "MINGGU_INI", "BULAN_INI"].map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p as FilterPeriod)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 ${filter === p ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"}`}
            >
              {p.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <LowStockAlert items={lowStockItems} />

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: `${getFilterLabel()} Revenue`, value: stats.activeRevenue, trend: stats.revenueTrend, icon: Wallet, color: "text-emerald-500", isCurrency: true },
          { label: `${getFilterLabel()} Orders`, value: stats.activeOrders, trend: stats.orderTrend, icon: Receipt, color: "text-blue-500", isCurrency: false },
          { label: `${getFilterLabel()} Food Sales`, value: stats.activeFood, trend: 0, icon: Utensils, color: "text-amber-500", isCurrency: true },
          { label: `${getFilterLabel()} Drink Sales`, value: stats.activeDrink, trend: 0, icon: Coffee, color: "text-purple-500", isCurrency: true },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:border-slate-300 transition-all group overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{item.label}</p>
              <item.icon className={`h-4 w-4 ${item.color} opacity-40 group-hover:opacity-100 transition-opacity`} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tabular-nums leading-none flex items-baseline gap-1">
              {item.isCurrency && <span className="text-sm font-bold">Rp</span>}
              <CountUp end={item.value} separator="," duration={1} />
            </h3>
            {/* Trend muncul di semua filter dengan label vs yang sesuai */}
            <p className={`text-[9px] font-bold mt-2 flex items-center gap-1 ${item.trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {item.trend >= 0 ? '↑' : '↓'} {Math.abs(item.trend).toFixed(1)}% <span className="text-slate-400 font-medium lowercase italic">{stats.vsLabel}</span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* Sisa UI (Main Section, Chart, Recent Orders, Right Column) Tetap Sama Seperti Kode Awalmu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-none">Sales Overview</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 italic">Weekly performance</p>
              </div>
              <div className="h-10 w-10 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                <ChartLine className="h-5 w-5" />
              </div>
            </div>

            <div className="w-full h-87.5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#3b82f6"
                        stopOpacity={0.2} />
                      <stop
                        offset="95%"
                        stopColor="#3b82f6"
                        stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                  <XAxis dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} dy={15} />
                  <YAxis axisLine={false} tickLine={false} domain={stats.yAxisDomain} tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }} tickFormatter={(val) => val > 0 ? `${(val / 1000).toFixed(0)}k` : '0'} />
                  <Tooltip
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                    formatter={(value: number | string | undefined) => {
                      if (value === undefined) return ["Rp 0", "Revenue"];
                      return [`Rp ${Number(value).toLocaleString()}`, "Revenue"];
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={4}
                    fillOpacity={1} fill="url(#colorRev)"
                    connectNulls={true} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} animationDuration={1500} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RECENT ORDERS */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 leading-none">Recent Orders</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Transaction</p>
              </div>
              <History className="h-5 w-5 text-blue-500" />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="pb-4 pr-4">Waktu</th>
                    <th className="pb-4 pr-4 text-center">Tipe</th>
                    <th className="pb-4 pr-4 text-center">Metode</th>
                    <th className="pb-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {stats.recentOrders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={newOrderId === order.id ? { backgroundColor: "rgba(16, 185, 129, 0.15)" } : false}
                        animate={newOrderId === order.id ? { backgroundColor: "rgba(16, 185, 129, 0)" } : { backgroundColor: "transparent" }}
                        transition={{ duration: 3 }}
                        className="group hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0"
                      >
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-2">
                            {newOrderId === order.id && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />}
                            <div>
                              <p className="text-[11px] font-black text-slate-900 leading-none uppercase">{order.customer}</p>
                              <p className="text-[9px] font-bold text-slate-400 italic mt-1">{order.tanggal}, {order.waktu}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold border ${order.tipe === "Dine In"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                            : "bg-amber-50 border-amber-100 text-amber-600"
                            }`}>
                            <span className={`h-1 w-1 rounded-full ${order.tipe === "Dine In" ? "bg-emerald-500" : "bg-amber-500"}`} />
                            {order.tipe}
                          </span>
                        </td>
                        <td className="py-4 pr-4 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[9px] font-black ${order.metode === 'BCA' ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200' : 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                            }`}>
                            {order.metode}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <p className="text-[11px] font-black text-slate-900 tabular-nums italic">Rp {order.total.toLocaleString()}</p>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Net Profit Analysis */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl"
          >
            <div className={`absolute top-0 right-0 w-full h-full bg-linear-to-bl opacity-20 ${isLoss ? 'from-red-500' : 'from-emerald-500'} to-transparent`} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isLoss ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                  {isLoss ? <TrendingDown className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
                </div>
                <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md text-emerald-400">
                  <CountUp end={profitData.margin} decimals={1} duration={1} />% Margin
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Net Profit Analysis</p>
              <h2 className={`text-4xl font-black tracking-tighter ${isLoss ? 'text-red-400' : 'text-emerald-400'} flex items-baseline gap-1`}>
                {isLoss ? '-' : ''} <span className="text-xl font-bold">Rp</span>
                <CountUp end={Math.abs(profitData.netProfit)} separator="," duration={1.5} />
              </h2>
              <div className="space-y-6 pt-10 mt-10 border-t border-white/5">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Gross</p>
                    <p className="text-base font-black italic text-white/90 flex items-baseline gap-1">
                      <span className="text-xs">Rp</span>
                      <CountUp end={profitData.grossProfit} separator="," duration={1} />
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-red-400/60 uppercase tracking-widest mb-1">Expenses</p>
                    <p className="text-base font-black italic text-red-400/90 flex items-baseline gap-1">
                      - <span className="text-xs">Rp</span>
                      <CountUp end={profitData.expenses} separator="," duration={1} />
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-[8px] font-black uppercase tracking-tighter italic text-slate-500">
                    <span>Target Monthly Profit</span>
                    <span className="text-emerald-400">75% Achieved</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "75%" }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                </div>
                <button className="w-full mt-4 py-4 rounded-3xl bg-white/10 hover:bg-white/20 border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-white transition-all shadow-lg">
                  View Detailed Report
                </button>
              </div>
            </div>
          </motion.div>

          {/* BEST SELLERS */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-tight text-slate-900 leading-none">Best Sellers</h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Top 5 Menus</p>
              </div>
              <Trophy className="h-5 w-5 text-amber-500" />
            </div>
            <div className="space-y-5">
              {stats.topProducts.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-[11px] font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 leading-none uppercase">{product.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{product.qty} Items Sold</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-200 group-hover:text-slate-900" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}