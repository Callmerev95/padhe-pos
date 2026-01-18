"use client";

import { Trash2, Hourglass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/store/useCartStore";
import { useHoldOrderStore } from "@/store/useHoldOrderStore";

type Props = {
  onOpenHoldList: () => void;
};

export function CartHeader({ onOpenHoldList }: Props) {
  const clearCart = useCartStore((s) => s.resetOrder);
  const holdsCount = useHoldOrderStore((s) => s.holds.length);

  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <h2 className="text-lg font-semibold">Keranjang</h2>

      <div className="flex items-center gap-2">
        {/* HOLD LIST */}
        <Button
          size="icon"
          variant="ghost"
          onClick={onOpenHoldList}
          className="relative border cursor-pointer"
        >
          <Hourglass className="h-5 w-5" />
          {holdsCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 min-w-5 rounded-full px-1 text-xs"
              variant="destructive"
            >
              {holdsCount}
            </Badge>
          )}
        </Button>

        {/* CLEAR CART */}
        <Button
          size="icon"
          variant="ghost"
          onClick={clearCart}
          className="border cursor-pointer"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
