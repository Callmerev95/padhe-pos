"use client";

import { useMemo, useEffect, useState } from "react";
import { Boxes, History, List, PackageSearch, AlertTriangle, Search } from "lucide-react";
import { CreateIngredientDialog } from "./components/CreateIngredientDialog";
import { IngredientActionButtons } from "./components/IngredientActionButtons";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import { OrderFooter } from "@/components/shared/order/OrderFooter";
import { CreditNote } from "@/components/shared/order/CreditNote";
import Link from "next/link";
import CountUp from "react-countup";
import { motion, AnimatePresence } from "framer-motion";
import { IngredientUI } from "./types/ingredient.types";

interface IngredientsClientProps {
  initialData: IngredientUI[];
}

export default function IngredientsClient({ initialData }: IngredientsClientProps) {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fix Hydration & ESLint strict [cite: 2026-01-12]
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredData = useMemo(() => {
    return initialData.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [initialData, searchTerm]);

  const stats = useMemo(() => {
    const lowStockCount = initialData.filter(item => item.stock <= item.minStock).length;
    return {
      total: initialData.length,
      lowStock: lowStockCount
    };
  }, [initialData]);

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
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 shadow-inner">
              <Link href="/inventory/ingredients" className="flex items-center gap-2 px-4 py-1.5 bg-white text-slate-900 rounded-lg shadow-sm text-[9px] font-black uppercase tracking-widest transition-all">
                <List className="h-3 w-3" /> Daftar Stok
              </Link>
              <Link href="/inventory/ingredients/history" className="flex items-center gap-2 px-4 py-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                <History className="h-3 w-3" /> Histori
              </Link>
            </div>

            <div className="relative w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="CARI BAHAN..."
                className="w-full pl-10 pr-4 py-1.5 bg-slate-100/50 border-none rounded-xl text-[9px] font-black tracking-widest focus:ring-2 focus:ring-cyan-500 transition-all placeholder:text-slate-300 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-8 pr-4">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg shadow-slate-200">
                <PackageSearch size={14} />
              </div>
              <div className="flex flex-col text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Total Jenis</p>
                <p className="text-[12px] font-black text-slate-700 mt-0.5 tabular-nums">
                  <CountUp end={stats.total} duration={1} />
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shadow-lg transition-colors ${stats.lowStock > 0 ? 'bg-red-500 text-white shadow-red-100' : 'bg-emerald-500 text-white shadow-emerald-100'}`}>
                <AlertTriangle size={14} className={stats.lowStock > 0 ? 'animate-pulse' : ''} />
              </div>
              <div className="flex flex-col text-right">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Stok Kritis</p>
                <p className={`text-[12px] font-black mt-0.5 tabular-nums ${stats.lowStock > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  <CountUp end={stats.lowStock} duration={1} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#fafbfc]">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky top-0 z-30 bg-[#fafbfc] px-10 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Detail Bahan</th>
                <th className="sticky top-0 z-30 bg-[#fafbfc] px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Kategori</th>
                <th className="sticky top-0 z-30 bg-[#fafbfc] px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Stok Saat Ini</th>
                <th className="sticky top-0 z-30 bg-[#fafbfc] px-6 py-5 text-right font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Estimasi HPP</th>
                <th className="sticky top-0 z-30 bg-[#fafbfc] pr-10 py-5 text-right font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50/50">
              <AnimatePresence mode="popLayout">
                {filteredData.map((item) => (
                  <motion.tr
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={item.id}
                    className="group transition-all duration-500 relative bg-white hover:bg-slate-50/50"
                  >
                    <td className="px-10 py-6 relative">
                      <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
                      <div className="flex flex-col">
                        <span className="font-black text-slate-700 text-sm uppercase tracking-tight group-hover:text-cyan-600 transition-colors">{item.name}</span>
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ref ID: {item.id.slice(-6)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="inline-flex items-center px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                        {item.category || "GENERAL"}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <div className={`inline-flex flex-col items-center px-4 py-2 rounded-2xl transition-all ${item.stock <= item.minStock ? 'bg-red-50 text-red-600 border border-red-100' : 'text-slate-700 group-hover:bg-white group-hover:shadow-sm group-hover:border group-hover:border-slate-100'}`}>
                        <span className="text-sm font-black tabular-nums leading-none">
                          <CountUp end={item.stock} separator="," duration={1} />
                        </span>
                        <span className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-60">{item.unitUsage}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right font-black text-sm tracking-tight text-slate-700 group-hover:text-cyan-700 transition-colors tabular-nums">
                      <span className="text-[10px] text-slate-400 mr-1 font-bold italic">Rp</span>
                      <CountUp end={item.averagePrice} separator="," duration={1} />
                    </td>
                    <td className="pr-10 py-6 text-right">
                      <IngredientActionButtons ingredient={item} />
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <div className="p-24 flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
                <Boxes className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="font-black text-slate-300 text-[11px] uppercase tracking-[0.3em] italic">Data tidak ditemukan</h3>
            </div>
          )}
        </div>
        <OrderFooter count={filteredData.length} label="JENIS BAHAN BAKU TERDATA" />
      </div>
      <CreditNote />
    </div>
  );
}