"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Loader2, PlusCircle, Boxes } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteIngredient, updateIngredient, restockIngredient } from "../actions";
import { IngredientUI, RestockInput } from "../types/ingredient.types";

interface Props {
  ingredient: IngredientUI;
}

export function IngredientActionButtons({ ingredient }: Props) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showRestockDialog, setShowRestockDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle Restock (Stok Masuk)
  async function handleRestock(formData: FormData) {
    try {
      setLoading(true);
      const data: RestockInput = {
        ingredientId: ingredient.id,
        quantity: parseFloat(formData.get("quantity") as string),
        purchasePrice: parseInt(formData.get("purchasePrice") as string),
        note: formData.get("note") as string,
      };

      const result = await restockIngredient(data);
      if (result.success) {
        toast.success(`Stok ${ingredient.name} berhasil ditambah!`);
        setShowRestockDialog(false);
      } else {
        toast.error(result.error || "Gagal menambah stok");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal memproses stok");
    } finally {
      setLoading(false);
    }
  }

  // Handle Edit
  async function handleEdit(formData: FormData) {
    try {
      setLoading(true);
      const data = {
        name: formData.get("name") as string,
        category: formData.get("category") as string,
        unitUsage: formData.get("unitUsage") as string,
        minStock: parseFloat(formData.get("minStock") as string),
        lastPurchasePrice: parseInt(formData.get("lastPurchasePrice") as string),
      };

      const result = await updateIngredient(ingredient.id, data);
      if (result.success) {
        toast.success("Data bahan berhasil diperbarui");
        setShowEditDialog(false);
      } else {
        toast.error(result.error || "Gagal memperbarui data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  }

  // Handle Delete
  async function handleDelete() {
    try {
      setLoading(true);
      const result = await deleteIngredient(ingredient.id);
      if (result.success) {
        toast.success("Bahan baku berhasil dihapus");
        setShowDeleteDialog(false);
      } else {
        toast.error(result.error || "Gagal menghapus data");
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 transition-all">
            <MoreHorizontal className="h-5 w-5 text-slate-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="rounded-4xl border-none bg-white/95 backdrop-blur-xl shadow-2xl p-3 min-w-48 z-50"
        >
          <DropdownMenuItem
            onClick={() => setShowRestockDialog(true)}
            className="flex items-center gap-3 py-3 px-4 text-[10px] font-black uppercase tracking-widest text-emerald-600 focus:text-white focus:bg-emerald-600 cursor-pointer rounded-2xl transition-all"
          >
            <PlusCircle className="h-4 w-4" />
            Stok Masuk
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowEditDialog(true)}
            className="flex items-center gap-3 py-3 px-4 text-[10px] font-black uppercase tracking-widest text-cyan-600 focus:text-white focus:bg-cyan-600 cursor-pointer rounded-2xl transition-all mt-1"
          >
            <Edit className="h-4 w-4" />
            Edit Info
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-3 py-3 px-4 text-[10px] font-black uppercase tracking-widest text-red-500 focus:text-white focus:bg-red-500 cursor-pointer rounded-2xl transition-all mt-1"
          >
            <Trash2 className="h-4 w-4" />
            Hapus Bahan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* DIALOG RESTOCK */}
      <Dialog open={showRestockDialog} onOpenChange={setShowRestockDialog}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none p-8 shadow-2xl z-100 bg-white">
          <form action={handleRestock}>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                <div className="bg-emerald-500 p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-100">
                  <PlusCircle size={20} />
                </div>
                Stok Masuk
              </DialogTitle>
              <DialogDescription className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                Tambah stok untuk <strong>{ingredient.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Jumlah Baru</Label>
                  <Input name="quantity" type="number" step="0.01" placeholder="0" required className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white transition-all" />
                </div>
                <div className="space-y-2 text-right">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">Satuan</Label>
                  <div className="h-12 flex items-center justify-end px-4 font-black text-slate-400 uppercase text-xs tracking-tighter">
                    {ingredient.unitUsage}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Harga Beli Baru (Per {ingredient.unitUsage})</Label>
                <Input name="purchasePrice" type="number" defaultValue={ingredient.lastPurchasePrice} required className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-emerald-600" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Catatan</Label>
                <Input name="note" placeholder="Contoh: Supplier Baru, Re-stock Mingguan..." className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-[11px] rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-95">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Konfirmasi Stok Masuk"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG EDIT */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none p-8 shadow-2xl z-100 bg-white">
          <form action={handleEdit}>
            {/* Hidden Input to ensure lastPurchasePrice is sent to server action [cite: 2026-01-12] */}
            <input type="hidden" name="lastPurchasePrice" value={ingredient.lastPurchasePrice} />

            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                <div className="bg-black p-2.5 rounded-2xl text-white shadow-lg">
                  <Boxes size={20} />
                </div>
                Edit Bahan
              </DialogTitle>
              <DialogDescription className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                Perbarui data master bahan baku.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Bahan</Label>
                <Input name="name" defaultValue={ingredient.name} required className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kategori</Label>
                  <Select name="category" defaultValue={ingredient.category ?? "Main"}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      <SelectItem value="Main" className="font-bold text-[10px] uppercase">Main Ingredients</SelectItem>
                      <SelectItem value="Packaging" className="font-bold text-[10px] uppercase">Packaging</SelectItem>
                      <SelectItem value="Consumables" className="font-bold text-[10px] uppercase">Consumables</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Satuan</Label>
                  <Select name="unitUsage" defaultValue={ingredient.unitUsage}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold uppercase text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-xl">
                      <SelectItem value="gram" className="font-bold text-[10px] uppercase">Gram (gr)</SelectItem>
                      <SelectItem value="ml" className="font-bold text-[10px] uppercase">Mililiter (ml)</SelectItem>
                      <SelectItem value="pcs" className="font-bold text-[10px] uppercase">Pieces (pcs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Min. Stok</Label>
                <Input name="minStock" type="number" defaultValue={ingredient.minStock} required className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full h-12 bg-slate-900 hover:bg-cyan-600 text-white font-black uppercase text-[11px] rounded-2xl shadow-xl transition-all active:scale-95">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ALERT DELETE */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-[2.5rem] border-none p-8 bg-white shadow-2xl z-120">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Hapus Bahan?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
              Menghapus <strong>{ingredient.name}</strong> dapat mempengaruhi resep yang sudah terhubung. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-2xl font-black text-slate-400 border-none bg-slate-50 hover:bg-slate-100 uppercase text-[11px] h-12 px-6">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] h-12 px-8 shadow-xl shadow-red-100 border-none transition-all active:scale-95"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Ya, Hapus Bahan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}