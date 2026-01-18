"use client";

import { Button } from "@/components/ui/button";
import type { PaymentMethod } from "./payment.types";
import { cn } from "@/lib/utils";

type Props = {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
};

const METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "CASH", label: "Cash" },
  { id: "DANA", label: "DANA" },
  { id: "BCA", label: "BCA" },
  { id: "QRIS", label: "QRIS" },
];

export function PaymentMethodSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {METHODS.map((m) => (
        <Button
          key={m.id}
          variant={value === m.id ? "default" : "outline"}
          className={cn(
            "h-12 text-base cursor-pointer",
            value === m.id && "font-semibold"
          )}
          onClick={() => onChange(m.id)}
        >
          {m.label}
        </Button>
      ))}
    </div>
  );
}
