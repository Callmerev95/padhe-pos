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

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; // ✅ NEW
};

export function PaymentModal({ open, onClose, onSuccess }: Props) {
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
        </DialogHeader>

        <PaymentMethodSelector value={method} onChange={setMethod} />

        <div className="pt-4">
          <Button
            className="w-full h-12 cursor-pointer"
            disabled={!method}
            onClick={() => setOpenConfirm(true)}
          >
            Lanjutkan Pembayaran
          </Button>
        </div>

        {method && (
          <PaymentConfirmModal
            open={openConfirm}
            method={method}
            onClose={() => setOpenConfirm(false)}
            onSuccess={onSuccess} // ✅ PASS DOWN
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
