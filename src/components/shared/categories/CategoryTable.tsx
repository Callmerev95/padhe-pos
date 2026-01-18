"use client";

import { Category } from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryDialog } from "./CategoryDialog";
import { CategoryDelete } from "./CategoryDelete";
import { CATEGORY_COLOR_STYLES, type CategoryColor } from "@/lib/category-colors";
import { cn } from "@/lib/utils";
import { Database, Tag, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";

type Props = {
  data: Category[];
};

export function CategoryTable({ data }: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">
      <div className="shrink-0">
        <PremiumHeader 
          title="MANAJEMEN KATEGORI"
          subtitle="MONITORING DAN PENGATURAN GRUP MENU REAL-TIME"
          icon={Tag} 
          actions={<CategoryDialog />} 
        />
      </div>

      <div className="bg-white/60 backdrop-blur-md p-2 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/30 flex items-center justify-between px-6 h-14 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-50 p-2 rounded-xl">
            <Database size={16} className="text-cyan-600" />
          </div>
          <div className="flex flex-col">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none">
              Status Database
            </p>
            <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight mt-0.5">
              {data.length} Kategori Terdaftar
            </p>
          </div>
        </div>
        <div className="w-10" /> 
      </div>

      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 hover:border-cyan-100">
        {/* FIX STICKY: Pastikan div ini memiliki relative dan overflow-y-auto */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#f8fafc]">
          <Table className="border-separate border-spacing-0">
            <TableHeader className="relative z-50">
              <TableRow className="hover:bg-transparent border-none">
                {/* FIX STICKY: Gunakan sticky top-0 pada tiap TableHead */}
                <TableHead className="sticky top-0 z-50 bg-[#f8fafc] px-10 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] first:rounded-tl-[3rem] border-b border-slate-200 h-16 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                  Nama Kategori
                </TableHead>
                <TableHead className="sticky top-0 z-50 bg-[#f8fafc] px-6 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 h-16 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                  Warna Label
                </TableHead>
                <TableHead className="sticky top-0 z-50 bg-[#f8fafc] px-6 py-4 text-center font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 h-16 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                  Status
                </TableHead>
                <TableHead className="sticky top-0 z-50 bg-[#f8fafc] pr-10 py-4 text-right font-black text-slate-500 uppercase tracking-wider text-[10px] last:rounded-tr-[3rem] border-b border-slate-200 h-16 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-50">
              {data.map((cat) => (
                <TableRow 
                  key={cat.id} 
                  className={cn(
                    "group transition-all duration-500 relative border-b border-slate-100/50 bg-white",
                    "hover:z-20 hover:bg-white hover:shadow-[0_0_25px_rgba(34,211,238,0.15),0_10px_15px_-3px_rgba(0,0,0,0.05)]"
                  )}
                >
                  <TableCell className="pl-10 py-5 relative border-none">
                    <div className="absolute inset-y-0 left-0 w-1 bg-cyan-500 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-center" />
                    <div className="flex flex-col">
                      <span className="font-black text-slate-700 uppercase tracking-tight text-sm group-hover:text-cyan-600 transition-colors">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-tighter">
                        UUID: {cat.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5 border-none">
                    <div className="flex items-center gap-3 transition-transform duration-500 group-hover:scale-110 origin-left">
                      <div className={cn("h-2.5 w-2.5 rounded-full shadow-sm", CATEGORY_COLOR_STYLES[cat.color as CategoryColor]?.dot || "bg-slate-200")} />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100/80 px-2.5 py-1 rounded-lg">
                        {cat.color}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5 text-center border-none">
                    <div className="inline-flex items-center px-4 py-1 rounded-xl bg-emerald-100/50 text-[9px] font-black text-emerald-600 uppercase tracking-[0.15em] border border-emerald-100/50 transition-transform duration-500 group-hover:scale-110">
                      Aktif
                    </div>
                  </TableCell>

                  <TableCell className="pr-10 py-5 text-right border-none">
                    <div className="flex justify-end items-center gap-2">
                      <DropdownMenu 
                        open={openMenuId === cat.id} 
                        onOpenChange={(open) => setOpenMenuId(open ? cat.id : null)}
                      >
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md text-slate-400 hover:text-cyan-500 transition-all active:scale-90"
                          >
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          sideOffset={8}
                          className="w-48 rounded-3xl border-slate-100 shadow-2xl p-2 bg-white z-100 animate-in fade-in zoom-in duration-200"
                        >
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setOpenMenuId(null);
                                document.getElementById(`edit-trigger-${cat.id}`)?.click();
                              }}
                              className="w-full justify-start gap-3 rounded-xl font-bold text-xs text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 h-11 transition-colors px-3"
                            >
                              <Pencil size={14} />
                              Edit Kategori
                            </Button>

                            <Button
                              variant="ghost"
                              onClick={() => {
                                setOpenMenuId(null);
                                document.getElementById(`delete-trigger-${cat.id}`)?.click();
                              }}
                              className="w-full justify-start gap-3 rounded-xl font-bold text-xs text-red-500 hover:bg-red-50 hover:text-red-600 h-11 transition-colors px-3"
                            >
                              <Trash2 size={14} />
                              Hapus Kategori
                            </Button>
                          </div>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <div className="hidden">
                        <CategoryDialog category={cat} triggerId={`edit-trigger-${cat.id}`} />
                        <CategoryDelete id={cat.id} triggerId={`delete-trigger-${cat.id}`} />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-white px-10 py-4 border-t border-slate-50 flex justify-between items-center shrink-0 z-10">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Total {data.length} Kategori Terdaftar
          </p>
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2.5">
              <Database size={14} className="text-green-500/80" />
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                </span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Database Connected
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.3em] shrink-0 pt-2 pb-1">
        2026 Padhe Coffee POS System • Arsitektur Global Store v2.0
      </p>
    </div>
  );
}