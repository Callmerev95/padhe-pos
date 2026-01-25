"use client";

import { useCartStore } from "@/store/useCartStore";
import { CartItemRow } from "./CartItemRow";

export function CartItemList() {
  const { items, lastAddedProductId } = useCartStore();

  return (
    /* - gap-4: Kita buat jarak antar item sedikit lebih lega agar tidak sesak.
       - pb-10: Tambahan padding bawah agar item terakhir tidak mepet ke footer.
       - animate-in: Memberikan kesan muncul yang halus saat pertama kali ada item.
    */
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {items.map((item) => (
        <CartItemRow
          key={item.productId}
          item={item}
          /* Highlight akan memberikan feedback visual ke kasir 
             bahwa produk ini baru saja ditambahkan.
          */
          highlight={item.productId === lastAddedProductId}
        />
      ))}
    </div>
  );
}