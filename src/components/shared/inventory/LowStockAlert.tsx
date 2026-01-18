"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface LowStockItem {
  id: string;
  name: string;
  stock: number;
  unitUsage: string;
  minStock: number;
}

export function LowStockAlert({ items }: { items: LowStockItem[] }) {
  if (items.length === 0) return null;

  const hasEmptyStock = items.some(item => item.stock <= 0);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        // Menggunakan rounded-[2rem] agar konsisten dengan StatsSection kamu
        className={`relative mb-8 mx-auto w-full overflow-hidden rounded-4xl border p-6 backdrop-blur-xl transition-all duration-500 ${
          hasEmptyStock 
            ? 'border-red-200 bg-red-50/40 shadow-xl shadow-red-100/20' 
            : 'border-amber-200 bg-amber-50/40 shadow-xl shadow-amber-100/20'
        }`}
      >
        {/* Shimmer Effect yang lebih halus */}
        <motion.div 
          animate={{ x: ["-100%", "200%"] }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear", repeatDelay: 4 }}
          className="absolute inset-0 z-0 bg-linear-to-r from-transparent via-white/40 to-transparent w-1/2 skew-x-12"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-colors duration-500 ${
                hasEmptyStock ? 'bg-red-600 shadow-red-200' : 'bg-amber-500 shadow-amber-200'
              }`}
            >
              <AlertTriangle className="h-7 w-7 text-white" />
            </motion.div>
            
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${hasEmptyStock ? 'text-red-500' : 'text-amber-600'}`}>
                Sistem Inventory Aktif
              </p>
              <h3 className={`text-xl font-black uppercase tracking-tight leading-none transition-colors duration-500 ${
                hasEmptyStock ? 'text-red-950' : 'text-slate-900'
              }`}>
                {hasEmptyStock ? 'Darurat: Bahan Habis' : 'Perhatian Stok'}
              </h3>
              <p className={`text-sm font-medium mt-1 ${hasEmptyStock ? 'text-red-800/60' : 'text-slate-500'}`}>
                {items.length} item perlu tindakan restock segera.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Pills Section */}
            <div className="flex -space-x-3">
              {items.slice(0, 3).map((item) => {
                const isZero = item.stock <= 0;
                return (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4, zIndex: 50 }}
                    className={`group relative flex h-12 items-center justify-center rounded-2xl border-2 border-white px-6 text-[11px] font-black text-white uppercase shadow-md transition-all cursor-help ${
                      isZero ? 'bg-red-600' : 'bg-slate-900 hover:bg-black'
                    }`}
                  >
                    {item.name}
                    
                    {/* Tooltip Futuristik di Bawah */}
                    <div className="absolute top-[125%] left-1/2 -translate-x-1/2 hidden group-hover:block z-100">
                       <motion.div 
                         initial={{ opacity: 0, y: -10 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="relative whitespace-nowrap rounded-xl bg-slate-900/95 backdrop-blur-md px-4 py-2 text-[10px] text-white shadow-2xl border border-white/10"
                       >
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45" />
                          <span className="opacity-70 font-medium">Sisa: </span>
                          <span className={`font-black ${isZero ? 'text-red-400' : 'text-amber-400'}`}>
                             {item.stock} {item.unitUsage}
                          </span>
                       </motion.div>
                    </div>
                  </motion.div>
                );
              })}
              
              {items.length > 3 && (
                <div className="group relative flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-amber-100 text-[11px] font-black text-amber-700 shadow-md cursor-help">
                  +{items.length - 3}
                  
                  {/* Floating List di bawah */}
                  <div className="absolute top-[125%] right-0 hidden group-hover:block z-100">
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-2xl border border-slate-100 min-w-50"
                    >
                      <div className="absolute -top-1 right-4 w-3 h-3 bg-white rotate-45 border-l border-t border-slate-100" />
                      <p className="text-[9px] text-slate-400 mb-1 uppercase font-black tracking-widest">Detail Stok Rendah</p>
                      {items.slice(3).map(i => (
                        <div key={i.id} className="flex justify-between items-center text-[11px] font-bold border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                          <span className="text-slate-700">{i.name}</span>
                          <span className={i.stock <= 0 ? 'text-red-600' : 'text-amber-600'}>
                            {i.stock} {i.unitUsage}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block" />

            <Link href="/inventory/ingredients">
              <motion.button 
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`group flex items-center gap-3 rounded-2xl px-8 py-4 text-[11px] font-black text-white shadow-xl transition-all tracking-wider ${
                  hasEmptyStock ? 'bg-red-600 shadow-red-200' : 'bg-slate-900 shadow-slate-200'
                }`}
              >
                RESTOCK
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}