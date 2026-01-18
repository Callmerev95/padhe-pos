import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FolderKanban,
  Package,
  ShoppingCart,
  History,
  FileText,
  User,
  Dot,
  Warehouse,
  Boxes,
  Receipt,
} from "lucide-react";
import type { Role } from "@prisma/client";

/* ======================
   TYPES
====================== */

export type SidebarItemType = {
  label: string;
  href?: string;
  icon: LucideIcon;
  roles?: Role[]; // ✅ ARRAY
  children?: SidebarItemType[];
};

export type SidebarSectionType = {
  title: string;
  items: SidebarItemType[];
};

/* ======================
   CONFIG (MATCH ROUTES)
====================== */

export const SIDEBAR_CONFIG: SidebarSectionType[] = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["ADMIN"], // ✅ FIX
      },
    ],
  },

  {
    title: "DATA",
    items: [
      {
        label: "Kategori",
        href: "/categories",
        icon: FolderKanban,
        roles: ["ADMIN"], // ✅ ADMIN only
      },
      {
        label: "Produk",
        href: "/products",
        icon: Package,
        roles: ["ADMIN"],
      },
    ],
  },

  {
    title: "INVENTORY",
    items: [
      {
        label: "Bahan Baku",
        href: "/inventory/ingredients",
        icon: Boxes,
        roles: ["ADMIN"],
      },
      {
        label: "Stok Masuk",
        href: "/inventory/restock",
        icon: Warehouse,
        roles: ["ADMIN"],
      },
      {
        label: "Biaya Operasional",
        href: "/inventory/expenses",
        icon: Receipt,
        roles: ["ADMIN"],
      },
      {
        label: "Recipes",
        href: "/inventory/recipes",
        icon: Receipt,
        roles: ["ADMIN"],
      },
    ],
  },

  {
    title: "TRANSAKSI",
    items: [
      {
        label: "POS",
        href: "/pos",
        icon: ShoppingCart,
        roles: ["ADMIN", "CASHIER"],
      },
      {
        label: "Riwayat Transaksi",
        href: "/order",
        icon: History,
        roles: ["ADMIN", "CASHIER"],
      },
    ],
  },

  {
    title: "LAPORAN",
    items: [
      {
        label: "Laporan",
        icon: FileText,
        roles: ["ADMIN", "CASHIER"],
        children: [
          {
            label: "Harian",
            href: "/reports/daily",
            icon: Dot,
            roles: ["ADMIN", "CASHIER"],
          },
          {
            label: "Bulanan",
            href: "/reports/monthly",
            icon: Dot,
            roles: ["ADMIN", "CASHIER"],
          },
        ],
      },
    ],
  },

  {
    title: "USER MANAGEMENT",
    items: [
      {
        label: "User",
        href: "/user",
        icon: User,
        roles: ["ADMIN"],
      },  
    ],
  },
];
