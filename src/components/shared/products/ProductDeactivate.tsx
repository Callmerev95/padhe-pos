"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { deactivateProduct } from "@/app/(dashboard)/products/actions";
import { toast } from "sonner";
import { AlertDialogDescription } from "@radix-ui/react-alert-dialog";
import { Trash2 } from "lucide-react";
import type { Product } from "./types";

export function ProductDeactivate({ id, onDeactivated }: { id: string; onDeactivated?: (p: Product) => void }) {
  async function onDeactivate() {
    try {
      const updated = await deactivateProduct(id);

      const uiProduct: Product = {
        id: updated.id,
        name: updated.name,
        description: updated.description ?? "",
        sku: updated.sku ?? "-",
        price: Number(updated.price ?? 0),
        isActive: Boolean(updated.isActive ?? true),
        imageUrl: updated.imageUrl ?? undefined,
        categoryType: updated.categoryType ?? undefined,
       // type: (updated.categoryType as "FOOD" | "DRINK") || undefined,
        category: {
          id: updated.category?.id,
          name: updated.category?.name ?? "-",
          color: "emerald",
        },
      };

      toast.success("Produk berhasil dinonaktifkan");
      onDeactivated?.(uiProduct);
    } catch  {
      toast.error("Gagal menonaktifkan produk");
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded"
          aria-label="Nonaktifkan Produk"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Nonaktifkan Produk</AlertDialogTitle>
          <AlertDialogDescription>
            Produk ini akan dinonaktifkan dan tidak muncul di POS.
            Anda bisa mengaktifkannya kembali kapan saja.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onDeactivate}>Nonaktifkan</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
