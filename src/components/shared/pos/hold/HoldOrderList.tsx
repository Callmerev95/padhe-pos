"use client";

import { useHoldOrderStore } from "@/store/useHoldOrderStore";
import { HoldOrderItem } from "./HoldOrderItem";

export function HoldOrderList() {
  const holds = useHoldOrderStore((s) => s.holds);

  if (holds.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-6">
        Tidak ada order yang di-hold
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {holds.map((hold) => (
        <HoldOrderItem key={hold.id} hold={hold} />
      ))}
    </div>
  );
}
