"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
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
import { createIngredient } from "./actions";

export function CreateIngredientDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const unitUsage = formData.get("unitUsage") as string;
    const minStock = parseFloat(formData.get("minStock") as string);
    const lastPurchasePrice = parseInt(formData.get("lastPurchasePrice") as string);

    const result = await createIngredient({
      name,
      category,
      unitUsage,
      minStock,
      lastPurchasePrice,
    });

    setLoading(false);
    if (result.success) {
      toast.success("Bahan baku berhasil ditambahkan");
      setOpen(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl gap-2">
          <Plus className="h-4 w-4" />
          Tambah Bahan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 rounded-3xl">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-black text-2xl">Tambah Bahan</DialogTitle>
            <DialogDescription>
              Masukkan detail bahan baku baru untuk stok gudang.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Bahan</Label>
              <Input id="name" name="name" placeholder="Contoh: Biji Kopi Arabika" required className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori</Label>
                <Select name="category" required>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Main">Main Ingredients</SelectItem>
                    <SelectItem value="Packaging">Packaging</SelectItem>
                    <SelectItem value="Consumables">Consumables</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unitUsage">Satuan Pakai</Label>
                <Select name="unitUsage" required>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gram">Gram (gr)</SelectItem>
                    <SelectItem value="ml">Mililiter (ml)</SelectItem>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="lastPurchasePrice">Harga Beli (Per Unit)</Label>
                <Input id="lastPurchasePrice" name="lastPurchasePrice" type="number" placeholder="Rp 0" required className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minStock">Batas Stok Minim</Label>
                <Input id="minStock" name="minStock" type="number" placeholder="0" required className="rounded-xl" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Simpan Bahan Baku
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}