"use client";

import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown} from "lucide-react";
import { FilterPeriod } from "@/app/(dashboard)/dashboard/DashboardClient";

interface StatsSectionProps {
  activeFilter: FilterPeriod;
  onFilterChange: (filter: FilterPeriod) => void;
  data: {
    totalOmset: number;
    dailyOmset: number;
    foodOmset: number;
    drinkOmset: number;
    orderCount: number;
    totalTrend: number;
    orderTrend: number;
    foodTrend: number;
    drinkTrend: number;
    chartPoints: number[];
  };
}

// PINDAHKAN KE SINI (DI LUAR StatsSection) agar tidak error ESLint
//const TrendBadge = ({ value }: { value: number }) => {
 // const isPos = value >= 0;
 // return (
  //  <div className={`flex items-center gap-1 mt-1 text-[10px] font-bold ${isPos ? 'text-emerald-500' : 'text-rose-500'}`}>
     // {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
     // <span>{isPos ? '+' : ''}{value.toFixed(1)}%</span>
   // </div>
 // );
//};

