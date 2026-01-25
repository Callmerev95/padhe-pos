import type { Product } from "@/components/shared/products/types";
import { ProductCard } from "./ProductCard";

type Props = {
  products: Product[];
};

export function ProductGrid({ products }: Props) {
  return (
    /* FIX TERPOTONG SAAT HOVER:
       - Tambahkan 'pt-6' (atau minimal pt-4) agar kartu baris paling atas punya ruang 
         saat membesar ke atas (scale).
       - Tambahkan 'px-2' agar shadow dan scale di sisi samping juga tidak terpotong.
    */
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full h-fit pt-1 px-2 pb-10">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}