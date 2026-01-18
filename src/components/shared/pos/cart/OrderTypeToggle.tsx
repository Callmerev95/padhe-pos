"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";


export function OrderTypeToggle() {
  const orderType = useCartStore((s) => s.orderType);
  const setOrderType = useCartStore((s) => s.setOrderType);

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        type="button"
        variant={orderType === "Dine In" ? "default" : "outline"}
        onClick={() => setOrderType("Dine In")}
        className="cursor-pointer"
      >
        Dine In
      </Button>

      <Button
        type="button"
        variant={orderType === "Take Away" ? "default" : "outline"}
        onClick={() => setOrderType("Take Away")}
        className="cursor-pointer"
      >
        Take Away
      </Button>
    </div>
  );
}
