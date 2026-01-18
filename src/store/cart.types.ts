export type OrderType = "Dine In" | "Take Away";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  categoryType: "FOOD" | "DRINK";
};

export type CartState = {
  items: CartItem[];
  customerName?: string;
  orderType: OrderType;
};
