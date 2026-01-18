"use client";

import {
  AlertDialog, AlertDialogContent, AlertDialogTrigger,
  AlertDialogHeader, AlertDialogTitle, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { deleteCategory } from "@/app/(dashboard)/categories/actions";
import { toast } from "sonner";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";

export function CategoryDelete({
  id,
  triggerId // Tambahkan prop ini
}: {
  id: string;
  triggerId: string
}) {
  async function onDelete() {
    await deleteCategory(id);
    toast.success("Kategori dihapus");
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button id={triggerId} className="hidden" />
      </AlertDialogTrigger>

      <AlertDialogContent className="rounded-[2.5rem] border-none p-8 z-110">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-black text-slate-800 uppercase tracking-tight">
            Apakah Anda yakin ingin menghapus kategori ini?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-medium text-slate-500">
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="gap-3 mt-4">
          <AlertDialogCancel className="rounded-xl font-bold text-slate-400 border-none hover:bg-slate-50">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            className="rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black uppercase text-[11px] px-8"
          >
            Hapus Kategori
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}