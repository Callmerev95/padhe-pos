"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryDelete } from "./CategoryDelete";
import { CATEGORY_COLOR_STYLES } from "@/lib/category-colors";
import { cn } from "@/lib/utils";
import { Database, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CategoryUI } from "../types/category.types";

interface CategoryTableProps {
  data: CategoryUI[];
  onEdit?: (category: CategoryUI) => void;
  onDeleteSuccess?: (id: string) => void;
}

export function CategoryTable({ data, onEdit, onDeleteSuccess }: CategoryTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#fafbfc]">
        <Table className="border-separate border-spacing-0">
          <TableHeader className="relative z-30">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="sticky top-0 z-30 bg-[#fafbfc] px-10 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[9px] first:rounded-tl-[3rem] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">
                Nama Kategori
              </TableHead>
              <TableHead className="sticky top-0 z-30 bg-[#fafbfc] px-6 py-5 text-left font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">
                Warna Label
              </TableHead>
              <TableHead className="sticky top-0 z-30 bg-[#fafbfc] px-6 py-5 text-center font-black text-slate-400 uppercase tracking-widest text-[9px] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">
                Status
              </TableHead>
              <TableHead className="sticky top-0 z-30 bg-[#fafbfc] pr-10 py-5 text-right font-black text-slate-400 uppercase tracking-widest text-[9px] last:rounded-tr-[3rem] border-b border-slate-100 shadow-[0_1px_0_0_rgba(241,245,249,1)]">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-slate-50/50">
            {data.length > 0 ? (
              data.map((cat) => (
                <TableRow
                  key={cat.id}
                  className="group transition-all duration-500 bg-white hover:bg-slate-50/50 border-b border-slate-50"
                >
                  <TableCell className="pl-10 py-6 relative">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-700 uppercase tracking-tight text-sm group-hover:text-cyan-600 transition-colors">
                        {cat.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                        ID: {cat.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className={cn("h-2.5 w-2.5 rounded-full shadow-sm", CATEGORY_COLOR_STYLES[cat.color]?.dot || "bg-slate-200")} />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-100/80 px-2.5 py-1 rounded-lg">
                        {cat.color}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-6 text-center">
                    <div className="inline-flex items-center px-4 py-1 rounded-xl bg-emerald-100/50 text-[9px] font-black text-emerald-600 uppercase tracking-[0.15em] border border-emerald-100/50">
                      Aktif
                    </div>
                  </TableCell>

                  <TableCell className="pr-10 py-6 text-right">
                    <DropdownMenu
                      open={openMenuId === cat.id}
                      onOpenChange={(open) => setOpenMenuId(open ? cat.id : null)}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:shadow-md text-slate-400 hover:text-cyan-500 transition-all active:scale-90">
                          <MoreHorizontal size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 bg-white z-60 shadow-2xl border-slate-100">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setOpenMenuId(null);
                            onEdit?.(cat);
                          }}
                          className="w-full justify-start gap-3 rounded-xl font-bold text-xs text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 h-11 px-3"
                        >
                          <Pencil size={14} /> Edit Kategori
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setOpenMenuId(null);
                            setDeleteTargetId(cat.id);
                          }}
                          className="w-full justify-start gap-3 rounded-xl font-bold text-xs text-red-500 hover:bg-red-50 hover:text-red-600 h-11 px-3"
                        >
                          <Trash2 size={14} /> Hapus Kategori
                        </Button>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-60 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Database size={40} className="text-slate-200" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                      Tidak ada data kategori
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* FOOTER STATS */}
      <div className="bg-white px-10 py-5 border-t border-slate-50 flex justify-between items-center shrink-0 z-10">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          Total {data.length} Kategori Terdaftar
        </p>
        <div className="flex items-center gap-2.5">
          <Database size={14} className="text-green-500/80" />
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Database Sync
            </p>
          </div>
        </div>
      </div>

      <CategoryDelete
        id={deleteTargetId || ""}
        open={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onSuccess={(id: string) => {
          setDeleteTargetId(null);
          onDeleteSuccess?.(id);
        }}
      />
    </div>
  );
}