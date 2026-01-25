"use client";

import type { PaymentMethod } from "./payment.types";
import { cn } from "@/lib/utils";
import { Banknote, QrCode, CreditCard, Wallet, CheckCircle2, LucideIcon } from "lucide-react"; // Tambahkan LucideIcon

type Props = {
  value: PaymentMethod | null;
  onChange: (method: PaymentMethod) => void;
};

// Ganti 'any' dengan 'LucideIcon'
const METHODS: { id: PaymentMethod; label: string; icon: LucideIcon }[] = [
  { id: "CASH", label: "Cash", icon: Banknote },
  { id: "QRIS", label: "QRIS", icon: QrCode },
  { id: "BCA", label: "Transfer/Debit", icon: CreditCard },
  { id: "DANA", label: "E-Wallet", icon: Wallet },
];

export function PaymentMethodSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {METHODS.map((m) => {
        const Icon = m.icon;
        const isActive = value === m.id;

        return (
          <button
            key={m.id}
            type="button" // Biasakan tambah type button agar tidak trigger submit
            onClick={() => onChange(m.id)}
            className={cn(
              "relative flex flex-col items-center justify-center gap-2 h-24 rounded-2xl border-2 transition-all duration-200 cursor-pointer group",
              isActive
                ? "border-cyan-600 bg-cyan-50/50 text-cyan-700 shadow-sm"
                : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"
            )}
          >
            {/* Indikator Active */}
            {isActive && (
              <div className="absolute top-2 right-2 text-cyan-600 animate-in zoom-in-50 duration-200">
                <CheckCircle2 size={16} fill="currentColor" className="text-white fill-cyan-600" />
              </div>
            )}

            <div className={cn(
              "p-2 rounded-xl transition-colors",
              isActive ? "bg-cyan-100 text-cyan-600" : "bg-slate-50 text-slate-400 group-hover:text-slate-600"
            )}>
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </div>

            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isActive ? "text-cyan-700" : "text-slate-500"
            )}>
              {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}