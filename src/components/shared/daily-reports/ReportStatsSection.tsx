import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, Coffee, TrendingUp } from "lucide-react";

interface ReportStatsProps {
  foodRevenue: number;
  foodQty: number;
  drinkRevenue: number;
  drinkQty: number;
  totalRevenue: number;
  count: number;
}

export function ReportStatsSection({
  foodRevenue, foodQty, drinkRevenue, drinkQty, totalRevenue, count
}: ReportStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
      {/* Food Stat */}
      <Card className="rounded-4xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden group hover:shadow-orange-100 transition-all duration-500">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <UtensilsCrossed size={80} className="text-orange-600" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Omset Makanan</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            Rp {foodRevenue.toLocaleString("id-ID")}
          </h3>
          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-orange-50 text-[10px] font-bold text-orange-600 border border-orange-100/50">
            {foodQty} Item Terjual
          </div>
        </CardContent>
      </Card>

      {/* Drink Stat */}
      <Card className="rounded-4xl border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden group hover:shadow-cyan-100 transition-all duration-500">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Coffee size={80} className="text-cyan-600" />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">Omset Minuman</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            Rp {drinkRevenue.toLocaleString("id-ID")}
          </h3>
          <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-cyan-50 text-[10px] font-bold text-cyan-600 border border-cyan-100/50">
            {drinkQty} Item Terjual
          </div>
        </CardContent>
      </Card>

      {/* Total Stat */}
      <Card className="rounded-4xl border-none shadow-2xl shadow-cyan-200/30 bg-slate-900 overflow-hidden group transition-all duration-500">
        <CardContent className="p-6 relative">
          <div className="absolute inset-0 bg-linear-to-br from-cyan-600/20 to-transparent opacity-50" />
          <p className="text-[10px] font-black text-cyan-400/60 uppercase tracking-[0.15em] mb-1 relative z-10">Total Omset</p>
          <h3 className="text-2xl font-black text-white tracking-tight relative z-10">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </h3>
          <div className="mt-3 inline-flex items-center gap-2 relative z-10">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{count} Transaksi Sukses</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}