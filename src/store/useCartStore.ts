import { create } from "zustand";
import type { CartItem, CartState, OrderType } from "./cart.types";
import { HoldOrder } from "./holdOrder.types";

type CartActions = {
  addItem: (item: Omit<CartItem, "qty">) => void;
  increaseQty: (productId: string) => void;
  decreaseQty: (productId: string) => void;
  removeItem: (productId: string) => void;
  updateNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  resetOrder: () => void;
  setCustomerName: (name: string) => void;
  setOrderType: (type: OrderType) => void;
  getSubtotal: () => number;
  loadHoldToCart: (hold: HoldOrder) => void;
};

// Pastikan CartState di cart.types sudah punya activeOrderId,
// Jika belum, kita tambahkan secara lokal di sini untuk CartStore
type CartStore = CartState &
  CartActions & {
    activeOrderId: string | null; // ✅ Tambahkan status ID aktif
    lastAddedProductId: string | null;
  };

export const useCartStore = create<CartStore>()((set, get) => ({
  /* =====================
   * STATE
   ===================== */
  items: [],
  customerName: "",
  orderType: "Dine In",
  activeOrderId: "", // ✅ Inisialisasi null
  lastAddedProductId: null,

  /* =====================
   * ACTIONS
   ===================== */
  loadHoldToCart: (hold) => {
    set({
      activeOrderId: hold.id, // ✅ KUNCI: Simpan ID order dari HOLD agar tidak duplikat saat di-sync ulang
      items: hold.items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        categoryType: item.categoryType as "FOOD" | "DRINK",
        notes: (item as { notes?: string }).notes || "",
      })),
      customerName: hold.customerName,
      orderType: hold.orderType as OrderType,
      lastAddedProductId: null,
    });
  },

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(
        (i: CartItem) => i.productId === item.productId,
      );

      const items = existing
        ? state.items.map((i: CartItem) =>
            i.productId === item.productId ? { ...i, qty: i.qty + 1 } : i,
          )
        : [...state.items, { ...item, qty: 1, notes: "" }];

      return {
        items,
        lastAddedProductId: item.productId,
      };
    }),

  increaseQty: (productId: string) =>
    set({
      items: get().items.map((i: CartItem) =>
        i.productId === productId ? { ...i, qty: i.qty + 1 } : i,
      ),
    }),

  decreaseQty: (productId: string) =>
    set({
      items: get()
        .items.map((i: CartItem) =>
          i.productId === productId ? { ...i, qty: i.qty - 1 } : i,
        )
        .filter((i: CartItem) => i.qty > 0),
    }),

  removeItem: (productId: string) =>
    set({
      items: get().items.filter((i: CartItem) => i.productId !== productId),
    }),

  updateNotes: (productId: string, notes: string) =>
    set({
      items: get().items.map((i: CartItem) =>
        i.productId === productId ? { ...i, notes } : i,
      ),
    }),

  clearCart: () =>
    set({
      items: [],
      lastAddedProductId: null,
      // Note: clearCart biasanya tidak reset customerName/activeOrderId jika hanya ingin hapus item
    }),

  resetOrder: () =>
    set({
      items: [],
      customerName: "",
      orderType: "Dine In",
      activeOrderId: "", // ✅ Reset ID saat pesanan benar-benar selesai/dibersihkan
      lastAddedProductId: null,
    }),

  setCustomerName: (name: string) => set({ customerName: name }),

  setOrderType: (type: OrderType) => set({ orderType: type }),

  getSubtotal: () =>
    get().items.reduce(
      (total: number, item: CartItem) => total + item.price * item.qty,
      0,
    ),
}));
