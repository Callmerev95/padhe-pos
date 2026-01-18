import { create } from 'zustand';

interface OrderState {
  selectedOrderId: string | null;
  isOpen: boolean;
  openOrder: (id: string) => void;
  closeOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  selectedOrderId: null,
  isOpen: false,
  openOrder: (id) => set({ selectedOrderId: id, isOpen: true }),
  closeOrder: () => set({ selectedOrderId: null, isOpen: false }),
}));