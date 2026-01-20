"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  categoryType: string;
}

interface CreateOrderParams {
  id: string;
  createdAt: string;
  total: number;
  paid: number;
  paymentMethod: string;
  customerName: string;
  orderType: string;
  items: OrderItem[];
}

// 1. Fungsi internal untuk memotong stok (Safe & Robust)
async function processStockDeduction(
  tx: Prisma.TransactionClient,
  items: OrderItem[],
  orderId: string,
) {
  for (const item of items) {
    try {
      // Cari resep berdasarkan productId (item.id)
      const recipes = await tx.recipe.findMany({
        where: { productId: item.id },
      });

      // Jika tidak ada resep, lewati ke item berikutnya
      if (!recipes || recipes.length === 0) continue;

      for (const recipe of recipes) {
        const deductQty = recipe.quantity * item.qty;

        // Update stok bahan baku
        const updatedIngredient = await tx.ingredient.update({
          where: { id: recipe.ingredientId },
          data: {
            stock: { decrement: deductQty },
          },
        });

        // Catat Log Stok
        await tx.stockLog.create({
          data: {
            ingredientId: recipe.ingredientId,
            type: "OUT",
            quantity: deductQty,
            previousStock: updatedIngredient.stock + deductQty,
            currentStock: updatedIngredient.stock,
            note: `Sales: ${item.name} (#${orderId.slice(-5)})`,
          },
        });
      }
    } catch (err) {
      console.error(`Gagal potong stok untuk item ${item.name}:`, err);
    }
  }
}

// 2. Fungsi Utama Sync
export async function syncOrderToCloud(data: CreateOrderParams) {
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        // Simpan Order
        const order = await tx.order.create({
          data: {
            id: data.id,
            createdAt: new Date(data.createdAt),
            total: data.total,
            paid: data.paid,
            paymentMethod: data.paymentMethod,
            customerName: data.customerName,
            orderType: data.orderType,
            items: data.items as unknown as Prisma.InputJsonValue,
          },
        });

        // Jalankan Potong Stok
        await processStockDeduction(tx, data.items, data.id);

        return order;
      },
      {
        maxWait: 5000,
        timeout: 20000, // Memberikan napas 20 detik agar tidak timeout lagi
      },
    );

    revalidatePath("/");
    revalidatePath("/order");
    revalidatePath("/inventory/ingredients");

    return { success: true, data: result };
  } catch (error) {
    // Hapus ': any' di sini
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("CRITICAL_SYNC_ERROR:", error);
    return { success: false, error: errorMessage };
  }
}

// 3. Fungsi Bulk Sync (Jika dibutuhkan)
export async function syncBulkOrders(orders: CreateOrderParams[]) {
  try {
    const results = await prisma.$transaction(
      async (tx) => {
        const processedOrders = [];

        for (const order of orders) {
          const existingOrder = await tx.order.findUnique({
            where: { id: order.id },
          });

          if (!existingOrder) {
            const created = await tx.order.create({
              data: {
                id: order.id,
                customerName: order.customerName,
                total: order.total,
                paid: order.paid,
                paymentMethod: order.paymentMethod,
                orderType: order.orderType,
                items: order.items as unknown as Prisma.InputJsonValue,
                createdAt: new Date(order.createdAt),
              },
            });

            await processStockDeduction(tx, order.items, order.id);
            processedOrders.push(created);
          }
        }
        return processedOrders;
      },
      {
        timeout: 30000, // Bulk biasanya lebih lama, kasih 30 detik
      },
    );

    revalidatePath("/");
    revalidatePath("/inventory/ingredients");
    return { success: true, count: results.length };
  } catch (error) {
    console.error("Bulk Sync Error:", error);
    return { success: false };
  }
}

export async function getOrdersFromCloud() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: orders };
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return { success: false, error: "Gagal Mengambil data Cloud" };
  }
}
