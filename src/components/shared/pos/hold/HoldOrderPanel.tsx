"use client";

import { HoldOrderList } from "./HoldOrderList";

export function HoldOrderPanel() {
  return (
    <div className="rounded-xl border bg-card p-4 space-y-3">
      <h2 className="text-lg font-semibold">
        Hold Order
      </h2>

      <HoldOrderList />
    </div>
  );
}
