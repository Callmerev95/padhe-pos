import { create } from "zustand";
import type { HoldOrder } from "./holdOrder.types";
import {
  saveHoldOrderLocal,
  deleteHoldOrderLocal,
  getAllHoldOrdersLocal,
} from "@/lib/db";
import { generateOrderId } from "@/lib/generateOrderId";

type HoldOrderStore = {
  holds: HoldOrder[];

  initialize: () => Promise<void>;
  addHold: (order: HoldOrder) => void;
  removeHold: (id: string) => void;
  getHold: (id: string) => HoldOrder | undefined;
  resumeHold: (id: string) => HoldOrder | undefined;

  mergeHolds: (ids: string[]) => HoldOrder;
  splitHold: (id: string, itemsGroups: HoldOrder["items"][]) => HoldOrder[];
};

export const useHoldOrderStore = create<HoldOrderStore>((set, get) => ({
  holds: [],

  // Ambil data dari IndexedDB saat refresh
  initialize: async () => {
    const data = await getAllHoldOrdersLocal();
    set({ holds: data });
  },

  addHold: (order) => {
    saveHoldOrderLocal(order);
    set((state) => ({
      holds: [...state.holds, order],
    }));
  },

  removeHold: (id) => {
    deleteHoldOrderLocal(id);
    set((state) => ({
      holds: state.holds.filter((h) => h.id !== id),
    }));
  },

  getHold: (id) => get().holds.find((h) => h.id === id),

  resumeHold: (id) => {
    const hold = get().getHold(id);
    if (!hold) return undefined;

    // Hapus dari IndexedDB karena dipindah kembali ke Cart
    deleteHoldOrderLocal(id);
    set((state) => ({
      holds: state.holds.filter((h) => h.id !== id),
    }));

    return hold;
  },

  mergeHolds: (ids) => {
    const holdsToMerge = get().holds.filter((h) => ids.includes(h.id));

    const merged: HoldOrder = {
      id: generateOrderId("POS-"),
      items: holdsToMerge.flatMap((h) => h.items),
      customerName: holdsToMerge.map((h) => h.customerName).join(" + "),
      orderType: holdsToMerge[0].orderType,
      createdAt: new Date().toISOString(),
      mergedFrom: ids,
    };

    // Sync IndexedDB
    ids.forEach((id) => deleteHoldOrderLocal(id));
    saveHoldOrderLocal(merged);

    set((state) => ({
      holds: [...state.holds.filter((h) => !ids.includes(h.id)), merged],
    }));

    return merged;
  },

  splitHold: (id, itemsGroups) => {
    const original = get().getHold(id);
    if (!original) return [];

    const splits = itemsGroups.map((items) => ({
      id: generateOrderId("POS-"),
      items,
      customerName: original.customerName,
      orderType: original.orderType,
      createdAt: new Date().toISOString(),
      splitFrom: id,
    }));

    // Sync IndexedDB
    deleteHoldOrderLocal(id);
    splits.forEach((newHold) => saveHoldOrderLocal(newHold));

    set((state) => ({
      holds: [...state.holds.filter((h) => h.id !== id), ...splits],
    }));

    return splits;
  },
}));
