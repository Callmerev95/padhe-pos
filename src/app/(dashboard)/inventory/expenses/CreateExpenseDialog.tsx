"use client";

import { useState } from "react";
import { Plus, Loader2, Receipt } from "lucide-react";
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
import { createExpense } from "./actions";
import { ExpenseCategory } from "@prisma/client";
import { format } from "date-fns";

export function CreateExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const data = {
      name: formData.get("name") as string,
      amount: formData.get("amount") as string,
      category: formData.get("category") as ExpenseCategory,
      date: formData.get("date") as string,
      note: formData.get("note") as string,
    };

    const result = await createExpense(data);
    setLoading(false);

    if (result.success) {
      toast.success("Biaya operasional berhasil dicatat");
      setOpen(false);
    } else {
      toast.error(result.error || "Gagal mencatat biaya");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl gap-2 h-10 px-4">
          <Plus className="h-4 w-4" />
          Tambah Pengeluaran
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25 rounded-3xl">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-black text-2xl flex items-center gap-3">
              <Receipt className="h-6 w-6 text-cyan-600" />
              Catat Biaya
            </DialogTitle>
            <DialogDescription>
              Masukkan detail pengeluaran operasional baru.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nama Pengeluaran</Label>
              <Input id="name" name="name" placeholder="Contoh: Listrik Bulanan" required className="rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="category">Kategori</Label>
                <Select name="category" defaultValue="OPERASIONAL" required>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ExpenseCategory).map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat.replace("_", " ")}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input id="date" name="date" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} required className="rounded-xl" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Nominal (Rp)</Label>
              <Input id="amount" name="amount" type="number" placeholder="0" required className="rounded-xl" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Catatan (Opsional)</Label>
              <Input id="note" name="note" placeholder="Keterangan tambahan..." className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Simpan Pengeluaran
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}