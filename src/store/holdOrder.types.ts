import type { CartItem, OrderType } from "./cart.types"

export type HoldOrder = {
  id: string
  items: CartItem[];
  customerName?: string
  orderType: OrderType
  createdAt: string
  

  // metadata
  mergedFrom?: string[]
  splitFrom?: string
}
