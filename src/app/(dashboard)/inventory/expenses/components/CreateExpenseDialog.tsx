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
import { createExpense } from "../actions";
import { ExpenseCategory } from "@prisma/client";
import { format } from "date-fns";
import { RawExpenseInput } from "../types/expense.types";

export function CreateExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    try {
      setLoading(true);
      const data: RawExpenseInput = {
        name: formData.get("name") as string,
        amount: formData.get("amount") as string,
        category: formData.get("category") as ExpenseCategory,
        date: formData.get("date") as string,
        note: formData.get("note") as string,
      };

      const result = await createExpense(data);

      if (result.success) {
        toast.success("Biaya operasional berhasil dicatat");
        setOpen(false);
      } else {
        toast.error(result.error || "Gagal mencatat biaya");
      }
    } catch {
      // FIX: Hapus parameter (err) karena tidak digunakan
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl bg-slate-900 hover:bg-cyan-600 text-white font-black uppercase text-[11px] px-6 h-11 shadow-xl shadow-slate-200 transition-all active:scale-95 gap-2">
          <Plus size={16} />
          Tambah Pengeluaran
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none p-8 shadow-2xl z-110 bg-white">
        <form action={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
              <div className="bg-black p-2.5 rounded-2xl text-white shadow-lg shadow-slate-200">
                <Receipt size={20} />
              </div>
              Catat Biaya
            </DialogTitle>
            <DialogDescription className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
              Masukkan detail pengeluaran operasional baru.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Pengeluaran</Label>
              <Input
                name="name"
                placeholder="Contoh: Listrik Bulanan, Wifi..."
                required
                className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kategori</Label>
                <Select name="category" defaultValue="OTHER" required>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold">
                    <SelectValue placeholder="Pilih" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    {Object.values(ExpenseCategory).map((cat) => (
                      <SelectItem key={cat} value={cat} className="rounded-xl font-bold text-xs uppercase tracking-wider">
                        {cat.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tanggal</Label>
                <Input
                  name="date"
                  type="date"
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                  required
                  className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nominal (Rp)</Label>
              <Input
                name="amount"
                type="number"
                placeholder="0"
                required
                className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-red-600 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Catatan (Opsional)</Label>
              <Input
                name="note"
                placeholder="Keterangan tambahan..."
                className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white transition-all"
              />
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-50">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-slate-900 hover:bg-cyan-600 text-white font-black uppercase text-[11px] rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Simpan Pengeluaran"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}