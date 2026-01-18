"use client";

import { ReactNode } from "react";
import { usePOSKeyboard } from "@/hooks/usePOSKeyboard";
import { useCartStore } from "@/store/useCartStore";

type Props = {
  children: ReactNode;
};

export function POSKeyboardProvider({ children }: Props) {
  const items = useCartStore((s) => s.items);
  const increaseQty = useCartStore((s) => s.increaseQty);
  const decreaseQty = useCartStore((s) => s.decreaseQty);
  const removeItem = useCartStore((s) => s.removeItem);

  usePOSKeyboard({
    onFocusSearch: () => {
      document.getElementById("pos-search")?.focus();
    },

    onIncreaseQty: () => {
      const last = items.at(-1);
      if (last) increaseQty(last.productId);
    },

    onDecreaseQty: () => {
      const last = items.at(-1);
      if (last) decreaseQty(last.productId);
    },

    onRemoveItem: () => {
      const last = items.at(-1);
      if (last) removeItem(last.productId);
    },

    onOpenPayment: () => {
      document
        .querySelector<HTMLButtonElement>("[data-open-payment]")
        ?.click();
    },
  });

  return <>{children}</>;
}
