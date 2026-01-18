"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Props = {
  hold: {
    id: string;
    items: { price: number; qty: number }[];
    customerName?: string;
    orderType: "Dine In" | "Take Away";
    createdAt: string;
  };
};

export function HoldOrderItem({ hold }: Props) {
  const total = hold.items.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  return (
    <div className="rounded-lg border p-3 flex items-center justify-between gap-3">
      {/* LEFT */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {hold.customerName || "Tanpa Nama"}
          </span>
          <Badge variant="outline">
            {hold.orderType === "Dine In"
              ? "Dine In"
              : "Take Away"}
          </Badge>
        </div>

        <div className="text-xs text-muted-foreground">
          {hold.items.length} item •{" "}
          {new Date(hold.createdAt).toLocaleTimeString("id-ID")}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <div className="font-semibold">
          Rp {total.toLocaleString("id-ID")}
        </div>

        {/* 🔜 Step 5.2 */}
        <Button size="sm" variant="secondary" disabled>
          Resume
        </Button>
      </div>
    </div>
  );
}
