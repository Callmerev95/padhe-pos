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
import { deleteExpense, updateExpense } from "../actions";
import { ExpenseCategory } from "@prisma/client";
import { format } from "date-fns";
import { ExpenseUI, RawExpenseInput } from "../types/expense.types";

export function ExpenseActionButtons({ expense }: { expense: ExpenseUI }) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEdit(formData: FormData) {
    try {
      setLoading(true);
      const data: RawExpenseInput = {
        name: formData.get("name") as string,
        amount: formData.get("amount") as string,
        category: formData.get("category") as ExpenseCategory,
        date: formData.get("date") as string,
        note: formData.get("note") as string,
      };

      const result = await updateExpense(expense.id, data);

      if (result.success) {
        toast.success("Catatan berhasil diperbarui");
        setShowEditDialog(false);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setLoading(true);
      const result = await deleteExpense(expense.id);

      if (result.success) {
        toast.success("Catatan berhasil dihapus");
        setShowDeleteDialog(false);
      } else {
        toast.error(result.error);
      }
    } catch {
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
          className="rounded-4xl border-none bg-white/95 backdrop-blur-xl shadow-2xl p-3 min-w-45 z-100"
        >
          <DropdownMenuItem
            onClick={() => setShowEditDialog(true)}
            className="flex items-center gap-3 py-3 px-4 text-[10px] font-black uppercase tracking-widest text-cyan-600 focus:text-white focus:bg-cyan-600 cursor-pointer rounded-2xl transition-all duration-200"
          >
            <Edit className="h-4 w-4" />
            Edit Data
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="flex items-center gap-3 py-3 px-4 text-[10px] font-black uppercase tracking-widest text-red-500 focus:text-white focus:bg-red-500 cursor-pointer rounded-2xl transition-all duration-200 mt-1"
          >
            <Trash2 className="h-4 w-4" />
            Hapus Catatan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none p-8 shadow-2xl z-110 bg-white">
          <form action={handleEdit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
                <div className="bg-black p-2.5 rounded-2xl text-white shadow-lg shadow-slate-200">
                  <Receipt size={20} />
                </div>
                Edit Biaya
              </DialogTitle>
              <DialogDescription className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                Perbarui rincian pengeluaran operasional.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Pengeluaran</Label>
                <Input name="name" defaultValue={expense.name} required className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kategori</Label>
                  <Select name="category" defaultValue={expense.category}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold">
                      <SelectValue />
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
                  <Input name="date" type="date" defaultValue={format(new Date(expense.date), "yyyy-MM-dd")} required className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nominal (Rp)</Label>
                <Input name="amount" type="number" defaultValue={expense.amount} required className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-red-600 focus:bg-white transition-all" />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Catatan Tambahan</Label>
                <Input name="note" defaultValue={expense.note || ""} className="h-12 rounded-2xl border-slate-100 bg-slate-50/50 font-bold focus:bg-white transition-all" />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-slate-50">
              <Button type="submit" disabled={loading} className="w-full h-12 bg-slate-900 hover:bg-cyan-600 text-white font-black uppercase text-[11px] rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-95">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-[2.5rem] border-none p-8 bg-white shadow-2xl z-120">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">Hapus Catatan Biaya?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-slate-500 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Menghapus <strong>{expense.name}</strong> akan mempengaruhi total laporan keuangan Anda.
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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ya, Hapus Catatan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}