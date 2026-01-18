"use client";

import type { Product } from "@/components/shared/products/types";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { Plus } from "lucide-react";
import Image from "next/image"; // Import ini untuk optimasi gambar

type Props = {
  product: Product;
};


export function ProductCard({ product }: Props) {
 
  // Akses fungsi addItem dari store
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="rounded-lg border p-3 flex flex-col gap-2 group transition duration-200 hover:scale-[1.02] hover:shadow-md active:scale-0.98">
      <div className="relative h-24 w-full overflow-hidden rounded">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </div>

      <div className="text-sm font-medium line-clamp-2 min-h-10">
        {product.name}
      </div>

      <div className="text-sm text-muted-foreground font-semibold">
        Rp {product.price.toLocaleString("id-ID")}
      </div>

      <Button
        size="sm"
        className="cursor-pointer w-full mt-auto"
        onClick={() =>
          addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            categoryType: product.categoryType, // Sekarang TS tidak akan protes lagi!
          })
        }
      >
        <Plus size={14} className="mr-1" /> Tambah
      </Button>
    </div>
  );
}