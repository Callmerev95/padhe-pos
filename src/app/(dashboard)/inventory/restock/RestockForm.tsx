"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { restockIngredient } from "../ingredients/actions";

interface Ingredient {
  id: string;
  name: string;
  stock: number;
  unitUsage: string;
}

export function RestockForm({ ingredients }: { ingredients: Ingredient[] }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setLoading(true);

    const qty = parseFloat(formData.get("quantity") as string);
    const total = parseInt(formData.get("totalPrice") as string);

    const pricePerUnit = total / qty;

    const data = {
      ingredientId: formData.get("ingredientId") as string,
      quantity: qty,
      purchasePrice: pricePerUnit,
      note: formData.get("note") as string,
    };

    const result = await restockIngredient(data);
    setLoading(false);

    if (result.success) {
      toast.success("Stok berhasil ditambahkan!");
      router.push("/inventory/ingredients");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Pilih Bahan Baku</Label>
        <Select name="ingredientId" required>
          <SelectTrigger className="rounded-xl h-12">
            <SelectValue placeholder="Pilih bahan yang dibeli" />
          </SelectTrigger>
          <SelectContent>
            {ingredients.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name} (Sisa: {item.stock} {item.unitUsage})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Jumlah yang Dibeli</Label>
          <Input 
          name="quantity" 
          type="number" 
          step="0.01" 
          placeholder="0" 
          required 
          className="rounded-xl h-12" />
        </div>
        <div className="space-y-2">
          <Label>Total Harga Nota</Label>
          <Input 
          name="totalPrice" 
          type="number"
           placeholder="Rp 0" 
           required 
           className="rounded-xl h-12" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Catatan (Opsional)</Label>
        <Input name="note" placeholder="Contoh: Belanja di Toko Makmur" className="rounded-xl h-12" />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-slate-900 h-12 rounded-xl font-bold">
        {loading ? "Memproses..." : "Update Stok & HPP"}
      </Button>
    </form>
  );
}