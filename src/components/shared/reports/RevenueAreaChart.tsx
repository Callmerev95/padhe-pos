import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LayoutDashboard } from "lucide-react";

interface ChartData {
    name: string;
    Makanan: number;
    Minuman: number;
}

// Interface untuk item payload di dalam Tooltip Recharts
interface CustomTooltipPayload {
    color?: string;
    name?: string;
    value?: number;
}

interface RevenueAreaChartProps {
    data: ChartData[];
    isEmpty: boolean;
    title?: string;
}

export function RevenueAreaChart({ data, isEmpty, title = "Tren Penjualan" }: RevenueAreaChartProps) {
    return (
        <div className="flex-1 min-h-0 bg-white rounded-4xl border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden flex flex-col p-8 relative group">
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-xl text-slate-600">
                        <LayoutDashboard size={18} />
                    </div>
                    <h3 className="font-black text-slate-800 uppercase tracking-tight text-sm">{title}</h3>
                </div>
                <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]" /> <span className="text-slate-500">Makanan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.4)]" /> <span className="text-slate-500">Minuman</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorMakanan" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorMinuman" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="name"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            fontFamily="inherit"
                            fontWeight={800}
                            tick={{ fill: '#cbd5e1' }}
                            interval={"preserveStartEnd" as const}
                            minTickGap={10}
                        />
                        <YAxis
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            fontFamily="inherit"
                            fontWeight={800}
                            tick={{ fill: '#cbd5e1' }}
                            domain={[0, 1000000]}
                            ticks={[0, 200000, 400000, 600000, 800000, 1000000]}
                            tickFormatter={(val) => `Rp ${val / 1000}k`}
                            width={90}
                        />
                        <Tooltip
                            cursor={{ stroke: '#e2e8f0', strokeWidth: 2, strokeDasharray: '6 6' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-50 flex flex-col gap-2 min-w-35">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b pb-2 mb-1">{label} WIB</p>
                                            {payload.map((entry, index) => {
                                                
                                                const item = entry as unknown as CustomTooltipPayload;
                                                return (
                                                    <div key={index} className="flex justify-between items-center gap-4">
                                                        <div className="flex items-center gap-2">
                                                            <div 
                                                                className="w-2 h-2 rounded-full" 
                                                                style={{ backgroundColor: item.color }} 
                                                            />
                                                            <span className="text-[10px] font-bold text-slate-600 uppercase">
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                        <span className="text-[11px] font-black text-slate-800">
                                                            Rp {Number(item.value || 0).toLocaleString("id-ID")}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="Makanan"
                            stroke="#f97316"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorMakanan)"
                            animationDuration={2000}
                        />
                        <Area
                            type="monotone"
                            dataKey="Minuman"
                            stroke="#06b6d4"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorMinuman)"
                            animationDuration={2500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {isEmpty && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] z-10">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-xl border border-slate-100 
                    flex flex-col items-center gap-2 scale-90">
                        <LayoutDashboard size={24} className="text-slate-300" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                            Belum ada data penjualan<br />untuk tanggal ini
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}