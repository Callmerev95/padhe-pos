"use client";

import { useCartStore } from "@/store/useCartStore";
import { UtensilsCrossed, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

export function OrderTypeToggle() {
  const orderType = useCartStore((s) => s.orderType);
  const setOrderType = useCartStore((s) => s.setOrderType);

  const types = [
    { id: "Dine In", icon: UtensilsCrossed },
    { id: "Take Away", icon: ShoppingBag },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 rounded-[1.25rem] border border-slate-100">
      {types.map((type) => {
        const isActive = orderType === type.id;
        const Icon = type.icon;

        return (
          <button
            key={type.id}
            type="button"
            onClick={() => setOrderType(type.id)}
            className={cn(
              "relative flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden",
              isActive
                ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Icon size={14} className={isActive ? "text-cyan-600" : "text-slate-300"} />
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isActive ? "opacity-100" : "opacity-60"
            )}>
              {type.id}
            </span>

            {/* Animasi subtle saat aktif */}
            {isActive && (
              <div className="absolute inset-0 bg-cyan-500/5 animate-pulse" />
            )}
          </button>
        );
      })}
    </div>
  );
}