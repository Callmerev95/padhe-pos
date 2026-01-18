"use client";

import { useCartStore } from "@/store/useCartStore";
import { CartItemRow } from "./CartItemRow";


export function CartItemList() {
  const { items, lastAddedProductId } = useCartStore();

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <CartItemRow
          key={item.productId}
          item={item}
          highlight={item.productId === lastAddedProductId}
        />
      ))}
    </div>
  );
}
