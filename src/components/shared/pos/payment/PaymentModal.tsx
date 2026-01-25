"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import type { PaymentMethod } from "./payment.types";
import { PaymentConfirmModal } from "./PaymentConfirmModal";
import { useCartStore } from "@/store/useCartStore"; // Ambil total dari sini
import { Wallet2, ChevronRight } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function PaymentModal({ open, onClose, onSuccess }: Props) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const total = useCartStore((s) => s.getSubtotal()); // Pastikan total akurat

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none rounded-[2.5rem]">
        {/* HEADER SECTION: Visual Highlight */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <DialogHeader className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 mb-1">
              Total Tagihan
            </p>
            <DialogTitle className="text-3xl font-black tabular-nums tracking-tight">
              Rp {total.toLocaleString("id-ID")}
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* CONTENT SECTION */}
        <div className="p-6 space-y-6 bg-white">
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Wallet2 size={16} className="text-slate-400" />
              <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Pilih Metode Bayar
              </h4>
            </div>
            
            <PaymentMethodSelector value={method} onChange={setMethod} />
          </div>

          <div className="pt-2">
            <Button
              disabled={!method}
              onClick={() => setOpenConfirm(true)}
              className="w-full h-14 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span className="font-black uppercase tracking-widest text-[11px]">
                Konfirmasi Pembayaran
              </span>
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>

        {method && (
          <PaymentConfirmModal
            open={openConfirm}
            method={method}
            onClose={() => setOpenConfirm(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}