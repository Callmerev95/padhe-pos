"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Loader2, Receipt } from "lucide-react";
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
import { deleteExpense, updateExpense } from "./actions";
import { Expense, ExpenseCategory } from "@prisma/client";
import { format } from "date-fns";

export function ExpenseActionButtons({ expense }: { expense: Expense }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEdit(formData: FormData) {
    setLoading(true);
    const data = {
      name: formData.get("name") as string,
      amount: formData.get("amount") as string,
      category: formData.get("category") as ExpenseCategory,
      date: formData.get("date") as string,
      note: formData.get("note") as string,
    };

    const result = await updateExpense(expense.id, data);
    setLoading(false);

    if (result.success) {
      toast.success("Catatan berhasil diperbarui");
      setShowEditDialog(false);
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete() {
    setLoading(true);
    const result = await deleteExpense(expense.id);
    setLoading(false);

    if (result.success) {
      toast.success("Catatan berhasil dihapus");
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
        <DropdownMenuContent
          align="end"
          // Menyesuaikan ukuran lebar (min-w-[180px]) dan padding yang lebih lega
          className="rounded-3xl border-white/60 bg-white/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 min-w-45 animate-in fade-in zoom-in duration-200"
        >
          <DropdownMenuItem
            onClick={() => setShowEditDialog(true)}
            // Menggunakan font-bold, text-cyan untuk edit (sesuai gambar produk), dan padding lebih besar
            className="flex items-center gap-3 py-3 px-4 text-[11px] font-black uppercase tracking-tight text-cyan-600 focus:text-cyan-700 focus:bg-cyan-50/80 cursor-pointer rounded-2xl transition-all duration-300"
          >
            <Edit className="h-4 w-4 stroke-3" />
            Edit Data
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            // Warna merah untuk hapus, font bold, dan alignment yang sama
            className="flex items-center gap-3 py-3 px-4 text-[11px] font-black uppercase tracking-tight text-red-500 focus:text-red-600 focus:bg-red-50/80 cursor-pointer rounded-2xl transition-all duration-300"
          >
            <Trash2 className="h-4 w-4 stroke-3" />
            Hapus Catatan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* DIALOG EDIT */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-106.25 rounded-3xl">
          <form action={handleEdit}>
            <DialogHeader>
              <DialogTitle className="font-black text-2xl flex items-center gap-3">
                <Receipt className="h-6 w-6 text-cyan-600" />
                Edit Biaya
              </DialogTitle>
              <DialogDescription>Perbarui informasi pengeluaran operasional.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Pengeluaran</Label>
                <Input id="name" name="name" defaultValue={expense.name} required className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select name="category" defaultValue={expense.category}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
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
                  <Input id="date" name="date" type="date" defaultValue={format(new Date(expense.date), "yyyy-MM-dd")} required className="rounded-xl" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Nominal (Rp)</Label>
                <Input id="amount" name="amount" type="number" defaultValue={expense.amount} required className="rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="note">Catatan</Label>
                <Input id="note" name="note" defaultValue={expense.note || ""} className="rounded-xl" />
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
            <AlertDialogTitle className="font-black text-xl text-red-600">Hapus Catatan Biaya?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Menghapus catatan <strong>{expense.name}</strong> akan mempengaruhi laporan keuangan total.
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Ya, Hapus Catatan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}