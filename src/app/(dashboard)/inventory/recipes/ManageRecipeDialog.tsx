"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
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
import { addRecipeItem, deleteRecipeItem } from "../recipes/actions";

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

interface ManageRecipeDialogProps {
  product: {
    id: string;
    name: string;
    recipes: RecipeItem[];
  };
  ingredients: Ingredient[];
}

export function ManageRecipeDialog({ product, ingredients }: ManageRecipeDialogProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleAdd(formData: FormData) {
    setLoading(true);
    const ingredientId = formData.get("ingredientId") as string;
    const quantity = parseFloat(formData.get("quantity") as string);

    const result = await addRecipeItem({
      productId: product.id,
      ingredientId,
      quantity,
    });

    setLoading(false);
    if (result.success) {
      toast.success("Bahan berhasil ditambahkan ke resep");
    } else {
      toast.error(result.error);
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
          variant="outline"
          className="w-full mt-6 rounded-xl border-slate-100 hover:bg-slate-900 hover:text-white font-bold text-xs h-10"
        >
          <Plus className="h-3 w-3 mr-2" />
          ATUR BAHAN
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 rounded-106.25">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-tight">
            Resep: {product.name}
          </DialogTitle>
        </DialogHeader>

        {/* LIST BAHAN SAAT INI */}
        <div className="space-y-3 my-4">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Bahan Terdaftar
          </Label>
          {product.recipes.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-slate-700">{item.ingredient.name}</p>
                <p className="text-xs text-slate-500">{item.quantity} {item.ingredient.unitUsage}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDelete(item.id)}
                className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <hr className="border-slate-100" />

        {/* FORM TAMBAH BAHAN */}
        <form action={handleAdd} className="space-y-4 pt-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Tambah Bahan Baru
          </Label>
          <div className="space-y-2">
            <Select name="ingredientId" required>
              <SelectTrigger className="rounded-xl h-12">
                <SelectValue placeholder="Pilih bahan baku" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map((ing) => (
                  <SelectItem key={ing.id} value={ing.id}>
                    {ing.name} ({ing.unitUsage})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Input
              name="quantity"
              type="number"
              step="0.01"
              placeholder="Jumlah (gr/ml/pcs)"
              required
              className="rounded-xl h-12"
            />
          </div>
          <Button disabled={loading} className="w-full bg-slate-900 h-12 rounded-xl font-bold">
            {loading ? "Menyimpan..." : "Tambah ke Resep"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}