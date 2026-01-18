"use client";

import { useMemo, useEffect, useState } from "react"; // Tambah useState
import { Boxes, History, List, PackageSearch, AlertTriangle } from "lucide-react";
import { CreateIngredientDialog } from "./CreateIngredientDialog";
import { IngredientActionButtons } from "./IngredientActionButtons";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import { OrderFooter } from "@/components/shared/order/OrderFooter";
import { CreditNote } from "@/components/shared/order/CreditNote";
import Link from "next/link";
import CountUp from "react-countup";

interface Ingredient {
  id: string;
  name: string;
  category: string | null;
  stock: number;
  minStock: number;
  unitUsage: string;
  averagePrice: number;
  lastPurchasePrice: number;
}

interface IngredientsClientProps {
  initialData: Ingredient[];
}

export default function IngredientsClient({ initialData }: IngredientsClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Memberitahu ESLint bahwa kita sengaja melakukan ini untuk fix hydration
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const stats = useMemo(() => {
    const lowStockCount = initialData.filter(item => item.stock <= item.minStock).length;
    return {
      total: initialData.length,
      lowStock: lowStockCount
    };
  }, [initialData]);

  // Cegah hydration mismatch
  if (!mounted) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">
      <div className="shrink-0 flex flex-col gap-2">
        <PremiumHeader 
          icon={Boxes}
          title="BAHAN BAKU"
          subtitle="KELOLA DAFTAR BAHAN MENTAH DAN STOK GUDANG"
          actions={<CreateIngredientDialog />}
        />

        <div className="bg-white/60 backdrop-blur-md p-2 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/30 flex items-center justify-between px-6 h-14">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 shadow-inner">
            <Link href="/inventory/ingredients" className="flex items-center gap-2 px-4 py-1.5 bg-white text-slate-900 rounded-lg shadow-sm text-[9px] font-black uppercase tracking-widest transition-all">
              <List className="h-3 w-3" /> Daftar Stok
            </Link>
            <Link href="/inventory/ingredients/history" className="flex items-center gap-2 px-4 py-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
              <History className="h-3 w-3" /> Histori
            </Link>
          </div>

          <div className="flex gap-6">
             <div className="flex items-center gap-3">
                <div className="bg-cyan-50 p-2 rounded-xl">
                   <PackageSearch size={16} className="text-cyan-600" />
                </div>
                <div className="flex flex-col">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">Total Bahan</p>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">
                    <CountUp end={stats.total} duration={1} /> Jenis
                  </p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${stats.lowStock > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                   <AlertTriangle size={16} className={stats.lowStock > 0 ? 'text-red-500' : 'text-emerald-500'} />
                </div>
                <div className="flex flex-col">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">Stok Tipis</p>
                  <p className={`text-[11px] font-bold uppercase tracking-tight mt-0.5 ${stats.lowStock > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    <CountUp end={stats.lowStock} duration={1} /> Item
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 hover:border-cyan-100">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#fafbfc] pb-12">
          {initialData.length > 0 ? (
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="sticky top-0 z-30 bg-[#f8fafc] px-8 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Nama Bahan</th>
                  <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-center font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Kategori</th>
                  <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-center font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Stok Saat Ini</th>
                  <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-right font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">HPP Avg</th>
                  <th className="sticky top-0 z-30 bg-[#f8fafc] px-8 py-4 text-right font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {initialData.map((item) => (
                  <tr key={item.id} className="group transition-all duration-500 relative bg-white hover:z-20 hover:shadow-[0_0_25px_rgba(34,211,238,0.15),0_10px_15px_-3px_rgba(0,0,0,0.05)]">
                    <td className="px-8 py-5 relative">
                      <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
                      <div className="flex flex-col">
                        <span className="font-black text-slate-700 text-sm uppercase tracking-tight group-hover:text-cyan-600 transition-colors">{item.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">ID: {item.id.slice(-6)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center px-3 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 border-none shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                        {item.category || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-black tabular-nums ${item.stock <= item.minStock ? 'text-red-500 animate-pulse' : 'text-slate-700'}`}>
                          <CountUp end={item.stock} separator="," duration={1} /> <span className="text-[10px] uppercase ml-1">{item.unitUsage}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-sm tracking-tight text-slate-700 group-hover:text-cyan-700 transition-colors">
                      <span className="text-[10px] text-slate-400 mr-1">Rp</span>
                      <CountUp end={item.averagePrice} separator="," duration={1} />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <IngredientActionButtons ingredient={item} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-4xl flex items-center justify-center mb-6 shadow-inner">
                <Boxes className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="font-black text-slate-400 text-sm uppercase tracking-widest italic">No Ingredients Found</h3>
            </div>
          )}
        </div>
        <OrderFooter count={initialData.length} label="BAHAN BAKU TERDAFTAR" />
      </div>
      <CreditNote />
    </div>
  );
}