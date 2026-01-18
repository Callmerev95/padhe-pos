"use client";

import { useState } from "react";
import { Category } from "@prisma/client";
import type { CategoryColor } from "@/lib/category-colors";
import { CATEGORY_COLOR_STYLES } from "@/lib/category-colors";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";
import { createCategory, updateCategory } from "@/app/(dashboard)/categories/actions";
import { toast } from "sonner";
import { Plus, Tag, Check } from "lucide-react";
import { motion } from "motion/react";

export function CategoryDialog({ 
  category, 
  triggerId
}: { 
  category?: Category; 
  triggerId?: string 
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [color, setColor] = useState<CategoryColor>((category?.color as CategoryColor) ?? "slate");
  const [loading, setLoading] = useState(false);

  const COLORS = Object.keys(CATEGORY_COLOR_STYLES) as CategoryColor[];

  async function onSubmit() {
    if (!name.trim()) return toast.error("Nama kategori wajib diisi");
    
    try {
      setLoading(true);
      if (category) {
        await updateCategory(category.id, name.trim(), color);
        toast.success("Kategori berhasil diperbarui");
      } else {
        await createCategory(name.trim(), color);
        toast.success("Kategori berhasil ditambahkan");
        setName("");
        setColor("slate");
      }
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {category ? (
          <button id={triggerId} className="hidden" />
        ) : (
          <Button className="rounded-2xl bg-slate-900 hover:bg-cyan-600 text-white font-black uppercase text-[11px] px-6 h-11 shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2">
            <Plus size={16} />
            Tambah Kategori
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="rounded-[2.5rem] border-none p-8 max-w-md shadow-2xl bg-white overflow-hidden z-110">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <div className="bg-black p-2 rounded-xl text-white">
              <Tag size={20} />
            </div>
            {category ? "Edit Kategori" : "Kategori Baru"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Nama Kategori
            </Label>
            <input
              placeholder="Contoh: Espresso Based, Makanan Utama..."
              className="w-full flex h-12 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2 text-sm ring-offset-white focus:bg-white transition-all font-bold text-slate-700 placeholder:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              Pilih Warna Identitas
            </Label>
            {/* FIX 3: Grid diubah menjadi 6 kolom untuk mengakomodasi 12 warna */}
            <div className="grid grid-cols-6 gap-3 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              {COLORS.map((c) => (
                <motion.button
                  key={c}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setColor(c)}
                  className={cn(
                    "relative h-10 w-10 rounded-full flex items-center justify-center transition-all",
                    CATEGORY_COLOR_STYLES[c].dot,
                    color === c ? "ring-4 ring-white shadow-lg scale-110" : "opacity-40 hover:opacity-100"
                  )}
                >
                  {color === c && <Check size={16} className="text-white" />}
                  <span className="sr-only capitalize">{c}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="rounded-xl font-bold text-slate-400 h-11 px-6"
            >
              Batal
            </Button>
            <Button
              onClick={onSubmit}
              disabled={loading}
              className="rounded-2xl bg-slate-900 hover:bg-cyan-600 text-white font-black uppercase text-[11px] px-10 h-11 shadow-xl shadow-slate-200 transition-all active:scale-95"
            >
              {loading ? "Memproses..." : category ? "Simpan Perubahan" : "Buat Kategori"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}