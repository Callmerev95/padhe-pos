"use client";

import { useReceiptStore } from "@/store/useReceiptStore";
import { ReceiptView } from "@/components/shared/pos/receipt/ReceiptView";

export function ReceiptPortal() {
  const receipt = useReceiptStore((s) => s.receipt);

  if (!receipt) return null;

  return (
    <div className="print-receipt">
      <ReceiptView receipt={receipt} />
    </div>
  );
}
