"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, ChefHat, Beaker } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addRecipeItem, deleteRecipeItem } from "./actions";

// --- TYPES ---
interface Ingredient {
  id: string;
  name: string;
  unitUsage: string;
}

interface RecipeItem {
  id: string;
  quantity: number;
  ingredient: {
    name: string;
    unitUsage: string;
  };
}

interface ProductWithRecipes {
  id: string;
  name: string;
  sku: string | null;
  recipes: RecipeItem[];
}

interface ManageRecipeDialogProps {
  product: ProductWithRecipes;
  ingredients: Ingredient[];
}

export function ManageRecipeDialog({ product, ingredients }: ManageRecipeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleAdd(formData: FormData) {
    setLoading(true);
    
    const rawData = {
      ingredientId: formData.get("ingredientId"),
      quantity: parseFloat(formData.get("quantity") as string),
    };

    const addSchema = z.object({
      ingredientId: z.string().min(1, "Bahan harus dipilih"),
      quantity: z.number().positive("Jumlah harus lebih dari 0"),
    });

    const validation = addSchema.safeParse(rawData);

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    const result = await addRecipeItem({
      productId: product.id,
      ingredientId: validation.data.ingredientId,
      quantity: validation.data.quantity,
    });

    setLoading(false);
    if (result.success) {
      toast.success("Bahan berhasil ditambahkan");
    } else {
      toast.error(result.error || "Gagal menambah resep");
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteRecipeItem(id);
    if (result.success) {
      toast.success("Bahan dihapus");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full mt-auto rounded-[1.25rem] bg-slate-900 hover:bg-cyan-600 text-white font-black text-[10px] uppercase tracking-[0.15em] h-12 transition-all active:scale-95 shadow-lg shadow-slate-200 group-hover:shadow-cyan-100"
        >
          <Plus className="h-3.5 w-3.5 mr-2 stroke-3" />
          Atur Bahan Baku
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-125 rounded-[3rem] p-10 border-none shadow-2xl">
        <DialogHeader className="flex-row items-center gap-5 mb-8 space-y-0 text-left">
          <div className="w-14 h-14 bg-cyan-50 rounded-3xl flex items-center justify-center text-cyan-600 shrink-0">
            <ChefHat size={28} />
          </div>
          <div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900">
              Resep: {product.name}
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Kelola komposisi bahan baku produk
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-3 mb-8 max-h-62.5 overflow-y-auto custom-scrollbar pr-2">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 ml-1">
            Bahan Terdaftar
          </Label>
          {product.recipes.length > 0 ? (
            product.recipes.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-slate-50/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 group/item transition-all hover:bg-white hover:shadow-md">
                <div>
                  <p className="text-[13px] font-black text-slate-700 uppercase tracking-tight">{item.ingredient.name}</p>
                  <p className="text-[10px] font-bold text-cyan-600 uppercase mt-0.5">
                    {item.quantity} <span className="text-slate-400">{item.ingredient.unitUsage}</span>
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(item.id)}
                  className="h-9 w-9 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-xs font-bold text-slate-400 italic text-center py-4">Belum ada bahan baku.</p>
          )}
        </div>

        <div className="h-px bg-slate-100 w-full mb-8" />

        <form action={handleAdd} className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Beaker size={14} className="text-cyan-500" />
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
              Tambah Komposisi
            </Label>
          </div>
          
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-7">
              <Select name="ingredientId" required>
                <SelectTrigger className="rounded-2xl h-14 border-2 border-slate-50 bg-slate-50 px-5 text-xs font-black uppercase focus:ring-cyan-500 focus:bg-white transition-all">
                  <SelectValue placeholder="PILIH BAHAN" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl border-slate-100">
                  {ingredients.map((ing) => (
                    <SelectItem key={ing.id} value={ing.id} className="font-bold text-[10px] uppercase py-3">
                      {ing.name} ({ing.unitUsage})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="col-span-5">
              <Input
                name="quantity"
                type="number"
                step="0.01"
                placeholder="QTY"
                required
                className="rounded-2xl h-14 border-2 border-slate-50 bg-slate-50 px-5 text-xs font-black uppercase focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <Button 
            disabled={loading} 
            className="w-full bg-slate-900 hover:bg-cyan-600 h-14 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-slate-200 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2 stroke-3" />}
            Tambahkan Ke Resep
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}