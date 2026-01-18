"use client";

import { useOrderStore } from "@/store/useOrderStore";
import { OrderDrawer } from "./OrderDrawer";

export function GlobalOrderDrawer() {
  const { isOpen, closeOrder, selectedOrderId } = useOrderStore();

  //if (!selectedOrderId) return null;

  return (
    <OrderDrawer 
      open={isOpen} 
      onClose={closeOrder} 
      orderId={selectedOrderId} 
    />
  );
}