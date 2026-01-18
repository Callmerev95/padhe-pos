import type { Product } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Cappuccino",
    description: "Espresso dengan susu",
    sku: "CP-001",
    category: {
      name: "Coffee",
      color: "emerald",
    },
    price: 25000,
    isActive: true,
  },
  {
    id: "2",
    name: "Latte",
    description: "Kopi susu creamy",
    sku: "LT-002",
    category: {
      name: "Coffee",
      color: "amber",
    },
    price: 28000,
    isActive: false,
  },
] as const;
