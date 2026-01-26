"use client";

import { useState } from "react";
import { Plus, Loader2, Boxes } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createIngredient } from "../actions";
import { CreateIngredientInput } from "../types/ingredient.types";

export function CreateIngredientDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    try {
      setLoading(true);
      const data: CreateIngredientInput = {
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        unitUsage: formData.get("unitUsage") as string,
        minStock: parseFloat(formData.get("minStock") as string),
        lastPurchasePrice: parseInt(formData.get("lastPurchasePrice") as string),
      };

      const result = await createIngredient(data);
      if (result.success) {
        toast.success("Bahan baku berhasil ditambahkan");
        setOpen(false);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl bg-slate-900 hover:bg-cyan-600 text-white font-black uppercase text-[11px] px-6 h-11 shadow-xl transition-all active:scale-95 gap-2">
          <Plus size={16} />
          Tambah Bahan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none p-8 shadow-2xl bg-white">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <div className="bg-black p-2.5 rounded-2xl text-white shadow-lg">
                <Boxes size={20} />
              </div>
              Tambah Bahan
            </DialogTitle>
            <DialogDescription className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
              Detail bahan baku baru untuk stok gudang.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Bahan</Label>
              <Input name="name" placeholder="Biji Kopi Arabika..." required className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kategori</Label>
                <Select name="category" required>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    <SelectItem value="Main" className="font-bold text-xs uppercase">Main Ingredients</SelectItem>
                    <SelectItem value="Packaging" className="font-bold text-xs uppercase">Packaging</SelectItem>
                    <SelectItem value="Consumables" className="font-bold text-xs uppercase">Consumables</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Satuan Pakai</Label>
                <Select name="unitUsage" required>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    <SelectItem value="gram" className="font-bold text-xs uppercase tracking-wider">Gram (gr)</SelectItem>
                    <SelectItem value="ml" className="font-bold text-xs uppercase tracking-wider">Mililiter (ml)</SelectItem>
                    <SelectItem value="pcs" className="font-bold text-xs uppercase tracking-wider">Pieces (pcs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Harga Beli (Awal)</Label>
                <Input name="lastPurchasePrice" type="number" placeholder="Rp 0" required className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Min. Stok</Label>
                <Input name="minStock" type="number" placeholder="0" required className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full h-12 bg-slate-900 hover:bg-cyan-600 text-white font-black uppercase text-[11px] rounded-2xl shadow-xl transition-all">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Bahan Baku"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}