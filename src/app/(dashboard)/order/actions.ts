"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderStatus, Prisma } from "@prisma/client";
import { type OrderItem, type LocalOrder } from "@/lib/db";

// Import Types dari folder products
import {
  ProductFormSchema,
  type ProductFormInput,
} from "../products/types/product.types";

/* =========================
   ORDER ACTIONS (CLOUD & SYNC)
========================= */

/**
 * Sinkronisasi order dari local ke cloud.
 * ✅ FIX: Menggunakan tipe 'LocalOrder' menggantikan 'any' sesuai instruksi.
 * ✅ UPDATE: Menambahkan 'paid' pada bagian update agar pelunasan Hold Order tercatat.
 */
export async function syncOrderToCloud(orderData: LocalOrder) {
  try {
    const {
      id,
      items,
      customerName,
      total,
      paid,
      paymentMethod,
      orderType,
      status,
      createdAt,
    } = orderData;

    const syncedOrder = await prisma.order.upsert({
      where: { id },
      update: {
        // ✅ Krusial: Pastikan 'paid' di-update agar saat bayar order Hold, angka pembayarannya masuk.
        paid: Number(paid),
        status: (status as OrderStatus) || OrderStatus.COMPLETED,
        items: items as unknown as Prisma.InputJsonValue,
        paymentMethod,
      },
      create: {
        id,
        customerName: customerName || "Guest",
        total: Number(total),
        paid: Number(paid),
        paymentMethod,
        orderType,
        status: (status as OrderStatus) || OrderStatus.COMPLETED,
        items: items as unknown as Prisma.InputJsonValue,
        createdAt: new Date(createdAt),
      },
    });

    // Revalidate semua path dashboard yang berkaitan dengan data order
    revalidatePath("/(dashboard)/order");
    revalidatePath("/(dashboard)/kitchen");
    revalidatePath("/(dashboard)/history");

    return { success: true, data: syncedOrder };
  } catch (error) {
    console.error("SYNC_ORDER_ERROR:", error);
    return { success: false, error: "Gagal sinkron ke cloud" };
  }
}

export async function syncBulkOrders(orders: LocalOrder[]) {
  try {
    const results = await Promise.all(
      orders.map((order) => syncOrderToCloud(order)),
    );

    const failed = results.filter((r) => !r.success);

    if (failed.length > 0) {
      return {
        success: false,
        error: `${failed.length} order gagal disinkronkan`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("SYNC_BULK_ERROR:", error);
    return { success: false, error: "Gagal sinkronisasi masal" };
  }
}

/**
 * Mengambil semua order dari cloud.
 */
export async function getOrdersFromCloud() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });

    const normalizedOrders = orders.map((order) => ({
      ...order,
      items: (order.items as unknown as OrderItem[]) || [],
    }));

    return { success: true, data: normalizedOrders };
  } catch (error) {
    console.error("GET_ORDERS_CLOUD_ERROR:", error);
    return { success: false, error: "Gagal mengambil data dari cloud" };
  }
}

/**
 * Mengambil order untuk Kitchen (Status: PENDING, PREPARING, READY).
 */
export async function getKitchenOrders() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY],
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const normalizedOrders = orders.map((order) => ({
      ...order,
      items: (order.items as unknown as OrderItem[]) || [],
    }));

    return { success: true, data: normalizedOrders };
  } catch (error) {
    console.error("GET_KITCHEN_ORDERS_ERROR:", error);
    return { success: false, error: "Gagal mengambil data kitchen" };
  }
}

/**
 * Update status utama sebuah Order (Digunakan KDS untuk set COMPLETED).
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath("/(dashboard)/kitchen");
    revalidatePath("/(dashboard)/order");
    revalidatePath("/(dashboard)/history");

    return {
      success: true,
      data: { ...order, items: (order.items as unknown as OrderItem[]) || [] },
    };
  } catch (error) {
    console.error("UPDATE_ORDER_STATUS_ERROR:", error);
    return { success: false, error: "Gagal update status order" };
  }
}

/**
 * Update status per-item di dalam field Json.
 */
export async function updateItemStatus(
  orderId: string,
  itemId: string | number,
  isDone: boolean,
) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order tidak ditemukan");

    const items = (order.items as unknown as OrderItem[]) || [];

    const updatedItems = items.map((item, index) => {
      if (typeof itemId === "number") {
        return index === itemId ? { ...item, isDone } : item;
      }
      return item.id === itemId ? { ...item, isDone } : item;
    });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        items: updatedItems as unknown as Prisma.InputJsonValue,
      },
    });

    revalidatePath("/(dashboard)/kitchen");
    return {
      success: true,
      data: { ...updatedOrder, items: updatedItems },
    };
  } catch (error) {
    console.error("UPDATE_ITEM_STATUS_ERROR:", error);
    return { success: false, error: "Gagal update status item" };
  }
}

/* =========================
   PRODUCT ACTIONS (MANAGEMENT)
========================= */

export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: { category: true };
}>;

function generateSKU(name: string): string {
  const prefix = name
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${timestamp}${random}`;
}

export async function getProducts(): Promise<ProductWithCategory[]> {
  try {
    return await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("GET_PRODUCTS_ERROR:", error);
    return [];
  }
}

export async function createProduct(
  rawInput: ProductFormInput,
): Promise<ProductWithCategory> {
  const validated = ProductFormSchema.parse(rawInput);
  const sku = generateSKU(validated.name);

  const product = await prisma.product.create({
    data: {
      name: validated.name,
      description: validated.description ?? null,
      price: validated.price,
      sku: sku,
      categoryId: validated.categoryId,
      categoryType: validated.categoryType,
      imageUrl: validated.imageUrl ?? null,
      isActive: validated.isActive ?? true,
    },
    include: { category: true },
  });

  revalidatePath("/(dashboard)/products");
  return product;
}

export async function updateProduct(
  rawInput: ProductFormInput,
): Promise<ProductWithCategory> {
  if (!rawInput.id) throw new Error("ID Produk diperlukan untuk update");
  const validated = ProductFormSchema.parse(rawInput);

  const product = await prisma.product.update({
    where: { id: validated.id },
    data: {
      name: validated.name,
      description: validated.description ?? null,
      price: validated.price,
      categoryId: validated.categoryId,
      categoryType: validated.categoryType,
      imageUrl: validated.imageUrl ?? null,
      isActive: validated.isActive,
    },
    include: { category: true },
  });

  revalidatePath("/(dashboard)/products");
  return product;
}

export async function deactivateProduct(
  id: string,
): Promise<ProductWithCategory> {
  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: { category: true },
  });

  revalidatePath("/(dashboard)/products");
  return product;
}
