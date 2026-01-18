"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
};
type Props = {
  item: CartItem;
  highlight?: boolean;
};

export function CartItemRow({ item, highlight }: Props) {
  const inc = useCartStore((s) => s.increaseQty);
  const dec = useCartStore((s) => s.decreaseQty);
  const remove = useCartStore((s) => s.removeItem);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-lg border p-3 transition-colors group duration-200 hover:scale-[1.02] hover:shadow-md active:scale-0.98",
        highlight && "bg-muted/60 ring-1 ring-primary/20"
      )}
    >
      {/* LEFT */}
      <div className="flex-1">
        <p className="font-medium leading-tight">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          Rp {item.price.toLocaleString()}
        </p>
      </div>

      {/* QTY */}
      <div className="flex items-center gap-1">
        <Button
          size="icon"
          variant="outline"
          disabled={item.qty === 1}
          onClick={() => dec(item.productId)}
          className="cursor-pointer"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <span className="w-6 text-center font-medium">{item.qty}</span>

        <Button className="cursor-pointer" size="icon" variant="outline" onClick={() => inc(item.productId)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* REMOVE */}
      <Button
        size="icon"
        variant="ghost"
        className={cn("text-destructive cursor-pointer")} 
        onClick={() => remove(item.productId)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
