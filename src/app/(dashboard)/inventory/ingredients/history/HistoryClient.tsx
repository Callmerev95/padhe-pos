"use client";

import { Boxes, History, List, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import { OrderFooter } from "@/app/(dashboard)/order/components/OrderFooter";
import { CreditNote } from "@/app/(dashboard)/order/components/CreditNote";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Link from "next/link";
import { StockLogUI } from "../types/ingredient.types";

interface HistoryClientProps {
    logs: StockLogUI[];
}

export default function HistoryClient({ logs }: HistoryClientProps) {
    return (
        <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">
            <div className="shrink-0 flex flex-col gap-2">
                <PremiumHeader
                    icon={History}
                    title="HISTORI STOK"
                    subtitle="PANTAU ALUR MASUK DAN KELUAR BAHAN BAKU"
                />

                <div className="bg-white/60 backdrop-blur-md p-2 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/30 flex items-center justify-between px-6 h-14">
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50 shadow-inner">
                        <Link href="/inventory/ingredients" className="flex items-center gap-2 px-4 py-1.5 text-slate-400 hover:text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all">
                            <List className="h-3 w-3" /> Daftar Stok
                        </Link>
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-white text-slate-900 rounded-lg shadow-sm text-[9px] font-black uppercase tracking-widest transition-all">
                            <History className="h-3 w-3" /> Histori
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 hover:border-emerald-100/50">
                <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#fafbfc]">
                    <table className="w-full text-sm border-separate border-spacing-0">
                        <thead>
                            <tr>
                                <th className="sticky top-0 z-30 bg-[#fafbfc] px-10 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Waktu</th>
                                <th className="sticky top-0 z-30 bg-[#fafbfc] px-6 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Bahan Baku</th>
                                <th className="sticky top-0 z-30 bg-[#fafbfc] px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Tipe</th>
                                <th className="sticky top-0 z-30 bg-[#fafbfc] px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Jumlah</th>
                                <th className="sticky top-0 z-30 bg-[#fafbfc] px-6 py-5 text-right font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Stok Akhir</th>
                                <th className="sticky top-0 z-30 bg-[#fafbfc] pr-10 py-5 text-right font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50/50">
                            {logs.map((log) => (
                                <tr key={log.id} className="group bg-white hover:bg-slate-50/50 transition-all duration-300">
                                    <td className="px-10 py-6">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tabular-nums tracking-tighter">
                                            {format(new Date(log.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-700 text-sm uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                                                {log.ingredient.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${log.type === "IN" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                                            }`}>
                                            {log.type === "IN" ? <ArrowUpCircle size={10} /> : <ArrowDownCircle size={10} />}
                                            {log.type === "IN" ? "Masuk" : "Keluar"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={`text-sm font-black tabular-nums ${log.type === "IN" ? "text-emerald-600" : "text-red-600"}`}>
                                                {log.type === "IN" ? "+" : "-"}{log.quantity.toLocaleString()}
                                            </span>
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{log.ingredient.unitUsage}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6 text-right font-black text-slate-700 tabular-nums">
                                        {log.currentStock.toLocaleString()} <span className="text-[9px] text-slate-400 uppercase ml-1">{log.ingredient.unitUsage}</span>
                                    </td>
                                    <td className="pr-10 py-6 text-right">
                                        <span className="text-[10px] font-bold text-slate-400 italic uppercase tracking-tighter">
                                            {log.note || "No Note"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {logs.length === 0 && (
                        <div className="p-24 flex flex-col items-center justify-center text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-inner">
                                <Boxes className="h-10 w-10 text-slate-200" />
                            </div>
                            <h3 className="font-black text-slate-300 text-[11px] uppercase tracking-[0.3em] italic">Belum ada aktivitas stok terdeteksi</h3>
                        </div>
                    )}
                </div>
                <OrderFooter count={logs.length} label="TOTAL AKTIVITAS STOK" />
            </div>
            <CreditNote />
        </div>
    );
}