import { create } from "zustand";
import type { CartItem, CartState, OrderType } from "./cart.types";
import { HoldOrder } from "./holdOrder.types";

type CartActions = {
  addItem: (item: Omit<CartItem, "qty">) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  resetOrder: () => void;
  setCustomerName: (name: string) => void;
  setOrderType: (type: OrderType) => void;
  getSubtotal: () => number;
  loadHoldToCart: (hold: HoldOrder) => void;
};

type CartStore = CartState & CartActions & {
  lastAddedProductId: string | null;
};


export const useCartStore = create<CartStore>()((set, get) => ({

  
  /* =====================
   * STATE
   ===================== */
  items: [],
  customerName: "",
  orderType: "Dine In",
  lastAddedProductId: null,

  

  /* =====================
   * ACTIONS
   ===================== */
  loadHoldToCart: (hold) => {
    set({
      items: hold.items.map((item) => ({
        productId: item.productId, // Mapping id dari Hold ke productId Cart
        name: item.name,
        price: item.price,
        qty: item.qty,
        categoryType: item.categoryType as "FOOD" | "DRINK",
      })),
      customerName: hold.customerName,
      orderType: hold.orderType as OrderType,
      lastAddedProductId: null,
    });
  },

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i: CartItem) => i.productId === item.productId
      );

      const items = existing
        ? state.items.map((i: CartItem) =>
            i.productId === item.productId
              ? { ...i, qty: i.qty + 1 }
              : i
          )
        : [...state.items, { ...item, qty: 1 }];

      return {
        items,
        lastAddedProductId: item.productId,
      };
    }),

  increaseQty: (productId: string) =>
    set({
      items: get().items.map((i: CartItem) =>
        i.productId === productId
          ? { ...i, qty: i.qty + 1 }
          : i
      ),
    }),

  decreaseQty: (productId: string) =>
    set({
      items: get()
        .items.map((i: CartItem) =>
          i.productId === productId
            ? { ...i, qty: i.qty - 1 }
            : i
        )
        .filter((i: CartItem) => i.qty > 0),
    }),

  removeItem: (productId: string) =>
    set({
      items: get().items.filter(
        (i: CartItem) => i.productId !== productId
      ),
    }),

  clearCart: () =>
    set({
      items: [],
      lastAddedProductId: null,
    }),

  resetOrder: () =>
    set({
      items: [],
      customerName: "",
      orderType: "Dine In",
      lastAddedProductId: null,
    }),

  setCustomerName: (name: string) =>
    set({ customerName: name }),

  setOrderType: (type: OrderType) =>
    set({ orderType: type }),

  getSubtotal: () =>
    get().items.reduce(
      (total: number, item: CartItem) =>
        total + item.price * item.qty,
      0
    ),
}));
