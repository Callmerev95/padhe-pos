"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Loader2 } from "lucide-react";
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
import { deleteIngredient, updateIngredient } from "./actions";


interface Ingredient {
    id: string;
    name: string;
    category: string | null;
    unitUsage: string;
    lastPurchasePrice: number;
    averagePrice: number;
    minStock: number;
}

interface IngredientActionButtonsProps {
  ingredient: Ingredient; // Sesuaikan dengan tipe dari Prisma jika perlu
}

export function IngredientActionButtons({ ingredient }: IngredientActionButtonsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handle Edit
  async function handleEdit(formData: FormData) {
    setLoading(true);
    const data = {
      name: formData.get("name") as string,
      category: formData.get("category") as string,
      unitUsage: formData.get("unitUsage") as string,
      minStock: parseFloat(formData.get("minStock") as string),
      lastPurchasePrice: parseInt(formData.get("lastPurchasePrice") as string),
    };

    const result = await updateIngredient(ingredient.id, data);
    setLoading(false);
    
    if (result.success) {
      toast.success("Bahan baku berhasil diperbarui");
      setShowEditDialog(false);
    } else {
      toast.error(result.error);
    }
  }

  // Handle Delete
  async function handleDelete() {
    setLoading(true);
    const result = await deleteIngredient(ingredient.id);
    setLoading(false);
    
    if (result.success) {
      toast.success("Bahan baku berhasil dihapus");
      setShowDeleteDialog(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-xl">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)} className="cursor-pointer">
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)} 
            className="cursor-pointer text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* DIALOG EDIT */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-106.25 rounded-3xl">
          <form action={handleEdit}>
            <DialogHeader>
              <DialogTitle className="font-black text-2xl">Edit Bahan</DialogTitle>
              <DialogDescription>Perbarui informasi bahan baku.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Bahan</Label>
                <Input id="name" name="name" defaultValue={ingredient.name} required className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select name="category" defaultValue={ingredient.category ?? undefined}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
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
                  <Select name="unitUsage" defaultValue={ingredient.unitUsage ?? undefined}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
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
                  <Label htmlFor="lastPurchasePrice">Harga Beli</Label>
                  <Input id="lastPurchasePrice" name="lastPurchasePrice" type="number" defaultValue={ingredient.lastPurchasePrice} required className="rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minStock">Batas Minim</Label>
                  <Input id="minStock" name="minStock" type="number" defaultValue={ingredient.minStock} required className="rounded-xl" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ALERT DELETE */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-xl text-red-600">Hapus Bahan Baku?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Menghapus <strong>{ingredient.name}</strong> akan berpengaruh pada resep produk yang menggunakan bahan ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
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