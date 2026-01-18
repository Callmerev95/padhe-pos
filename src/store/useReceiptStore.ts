import { create } from "zustand";
import type { ReceiptSnapshot } from "./receipt.types";

type ReceiptStore = {
  receipt: ReceiptSnapshot | null;

  setReceipt: (data: ReceiptSnapshot) => void;
  clearReceipt: () => void;
};

export const useReceiptStore = create<ReceiptStore>((set) => ({
  receipt: null,

  setReceipt: (data) => set({ receipt: data }),

  clearReceipt: () => set({ receipt: null }),
}));
