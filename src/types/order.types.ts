import { OrderItem } from "./report.types";
import { OrderStatus } from "@prisma/client";

export type OrderType = "DINE_IN" | "TAKE_AWAY";
export type PaymentMethod = "CASH" | "QRIS" | "BCA" | "DANA";

export interface Order {
  id: string;
  createdAt: Date | string;
  total: number;
  paid: number;
  customerName: string;
  paymentMethod: PaymentMethod;
  orderType: OrderType;
  items: OrderItem[];
  status: OrderStatus;
  isSynced?: boolean;
}

// Props khusus untuk OrderFooter sesuai instruksi lo [cite: 2026-01-12]
export interface OrderFooterProps {
  count: number;
  label: string;
}