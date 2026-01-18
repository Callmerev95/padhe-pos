"use client";

import { useOrderHistory } from "@/features/order-history/useOrderHistory";
import { Card, CardContent, CardHeader, } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, ShoppingBag, DollarSign, Users, Award } from "lucide-react";
import { useMemo } from "react";

// Tipe data untuk item pesanan dalam order
interface DashboardOrderItem {
    name: string;
    qty: number;    
    price: number;
}

// Komponen utama Dashboard Client
export default function DashboardClient() {
    const { orders = [], loading } = useOrderHistory();
    const today = new Date().toISOString().split('T')[0];

    // Logic Perhitungan Statistik
    const stats = useMemo(() => {
        const todayOrders = orders.filter(o =>
            new Date(o.createdAt).toISOString().split('T')[0] === today // Filter pesanan hari ini
        );

        const totalRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0); // Total omset hari ini
        const totalTransactions = todayOrders.length; // Jumlah transaksi hari ini
        const aov = totalTransactions > 0 ? totalRevenue / totalTransactions : 0; // Average Order Value

        // Hitung Top 5 Produk Terlaris
        const productMap: Record<string, { name: string, qty: number }> = {};
        todayOrders.forEach(order => {
            const items = (order.items as unknown as DashboardOrderItem[]) || [];
            items.forEach((item) => {
                const name = item.name || "Unknown Product";
                if (!productMap[name]) {
                    productMap[name] = { name: name, qty: 0 };
                }
                productMap[name].qty += (item.qty || 0);
            });
        });

        // Urutkan dan ambil 5 produk teratas
        const topProducts = Object.values(productMap)
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5);

        // Ambil 5 transaksi terbaru
        const recentOrders = [...orders]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);

        // Siapkan data tren pendapatan untuk 7 hari terakhir
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        
        const revenueTrend = last7Days.map(date => {
            // Hitung total pendapatan untuk setiap hari 
            const dayOrders = orders.filter(o => 
                new Date(o.createdAt).toISOString().split('T')[0] === date 
            );
            const total = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            const label = new Date(date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
            return { day: label, revenue: total };
        });

        return { totalRevenue, totalTransactions, aov, topProducts, recentOrders, revenueTrend };
    }, [orders, today]);

    if (loading) return <div className="p-8 italic text-muted-foreground text-sm">Menghubungkan ke server...</div>;

    return (
        <div className="min-h-screen w-full p-4 md:p-6 flex flex-col gap-6 bg-[#f8fafc] overflow-y-auto pb-10">

            {/* SECTION 1: Headline Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 shrink-0">
                <Card className="border-none shadow-sm bg-coffee-dark text-white relative overflow-hidden transition-all hover:scale-[1.01]">
                    <div className="absolute right-2.5 top-2.5 opacity-10">
                        <DollarSign size={80} />
                    </div>
                    <CardHeader className="pb-2 text-[10px] font-bold opacity-70 uppercase tracking-widest">
                        Total Omset Hari Ini
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-coffee-primary">
                            Rp {stats.totalRevenue.toLocaleString("id-ID")}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm border-l-4 border-l-orange-500 transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Jumlah Transaksi
                        <ShoppingBag className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800">{stats.totalTransactions}</div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm border-l-4 border-l-blue-500 sm:col-span-2 lg:col-span-1 transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between pb-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Nilai Rata-rata Transaksi (AOV)
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-800">Rp {Math.round(stats.aov).toLocaleString("id-ID")}</div>
                    </CardContent>
                </Card>
            </div>

            {/* SECTION 2 & 3: Top Products & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Top 5 Produk Terlaris */}
                <div className="bg-white rounded-xl border shadow-sm p-6 flex flex-col h-112.5">
                    <div className="flex items-center justify-between border-b pb-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <Award className="text-orange-500" size={20} />
                            <h3 className="font-bold text-slate-800">Top 5 Produk Terlaris</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit Terjual</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-5 mt-4">
                        {stats.topProducts.length > 0 ? (
                            stats.topProducts.map((product, index) => (
                                <div key={index} className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 border border-slate-200">
                                                {index + 1}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 truncate max-w-35 md:max-w-50">
                                                {product.name}
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-orange-600">{product.qty}x</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${(product.qty / stats.topProducts[0].qty) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex items-center justify-center italic text-slate-400 text-xs">
                                Belum ada data penjualan hari ini
                            </div>
                        )}
                    </div>
                </div>

                {/* Transaksi Terakhir (Live Feed dengan Badge Baru) */}
                <div className="bg-white rounded-xl border shadow-sm p-6 flex flex-col h-112.5">
                    <div className="flex items-center justify-between border-b pb-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="text-emerald-500" size={20} />
                            <h3 className="font-bold text-slate-800">Transaksi Terakhir</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status & Total</span>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 mt-4">
                        {stats.recentOrders.length > 0 ? (
                            stats.recentOrders.map((order, index) => (
                                <div key={order.id || index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                            <ShoppingBag size={18} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-bold text-slate-700 truncate">
                                                {order.customerName || `Pelanggan #${order.id?.slice(-4) || index}`}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground truncate">
                                                {new Date(order.createdAt).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })} • {order.paymentMethod || 'Tunai'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Perubahan di sini: Tampilan Badge Pop-Up */}
                                    <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                                        <span className="text-sm font-bold text-slate-800">
                                            Rp {order.total?.toLocaleString("id-ID")}
                                        </span>
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
                                            <span className="relative flex h-1.5 w-1.5">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                            </span>
                                            <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-tight">Sukses</span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex items-center justify-center italic text-slate-400 text-xs">
                                Belum ada transaksi masuk
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* SECTION 4: Revenue Trend (Full Width) */}
            <Card className="border-none shadow-sm p-6 shrink-0 w-full">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="text-blue-500" size={20} />
                        <h3 className="font-bold text-slate-800">Tren Pendapatan (7 Hari Terakhir)</h3>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                        Live Update
                    </div>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.revenueTrend}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#94a3b8' }}
                                dy={10}
                            />
                            <YAxis hide={true} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                }}
                                formatter={(value: number | undefined) => {
                                    const safeValue = value ?? 0;
                                    return [`Rp ${safeValue.toLocaleString('id-ID')}`, 'Pendapatan'];
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorRev)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}