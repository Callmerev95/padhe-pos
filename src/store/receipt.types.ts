export type ReceiptItem = {
  name: string;
  qty: number;
  price: number;
};

export type ReceiptSnapshot = {
  orderId: string;
  createdAt: string;

  items: ReceiptItem[];

  subtotal: number;
  tax: number;     // default 0
  charge: number;  // default 0
  total: number;
  
  paid: number;
  change?: number;

  customerName?: string;
  cashierName: string;
  orderType: "Dine In" | "Take Away";
  paymentMethod: "CASH" | "DANA" | "BCA" | "QRIS";
};
