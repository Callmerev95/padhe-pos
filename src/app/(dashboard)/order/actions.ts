"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Prisma, OrderStatus } from "@prisma/client";
import { type OrderItem, LocalOrderSchema } from "@/lib/db";
import { z } from "zod";

type CreateOrderParams = z.infer<typeof LocalOrderSchema>;

async function processStockDeduction(
  tx: Prisma.TransactionClient,
  items: OrderItem[],
  orderId: string,
) {
  for (const item of items) {
    try {
      const recipes = await tx.recipe.findMany({
        where: { productId: item.id },
      });

      if (!recipes || recipes.length === 0) continue;

      for (const recipe of recipes) {
        const deductQty = recipe.quantity * item.qty;

        const updatedIngredient = await tx.ingredient.update({
          where: { id: recipe.ingredientId },
          data: {
            stock: { decrement: deductQty },
          },
        });

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

export async function syncOrderToCloud(
  data: CreateOrderParams,
  forceStatus?: OrderStatus,
) {
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const existingOrder = await tx.order.findUnique({
          where: { id: data.id },
        });

        if (existingOrder) {
          const oldItems =
            (existingOrder.items as unknown as OrderItem[]) || [];
          const newItems = data.items;
          let isNewItemAdded = false;

          const mergedItems = newItems.map((newItem) => {
            const oldItem = oldItems.find((i) => i.id === newItem.id);
            if (!oldItem || newItem.qty > oldItem.qty) {
              isNewItemAdded = true;
            }

            return {
              ...newItem,
              isDone: oldItem ? oldItem.isDone : false,
            };
          });

          for (const newItem of newItems) {
            const oldItem = oldItems.find((i) => i.id === newItem.id);
            const oldQty = oldItem ? oldItem.qty : 0;
            const diffQty = newItem.qty - oldQty;

            if (diffQty > 0) {
              await processStockDeduction(
                tx,
                [{ ...newItem, qty: diffQty }],
                data.id,
              );
            }
          }

          let nextStatus = existingOrder.status;
          if (forceStatus === "COMPLETED") {
            nextStatus = "COMPLETED";
          } else if (isNewItemAdded) {
            nextStatus = "PENDING";
          }

          return await tx.order.update({
            where: { id: data.id },
            data: {
              total: data.total,
              paid: data.paid,
              paymentMethod: data.paymentMethod,
              items: mergedItems as unknown as Prisma.InputJsonValue,
              customerName: data.customerName ?? "Guest",
              orderType: data.orderType,
              status: nextStatus,
            },
          });
        }

        const order = await tx.order.create({
          data: {
            id: data.id,
            createdAt: new Date(data.createdAt),
            total: data.total,
            paid: data.paid,
            paymentMethod: String(data.paymentMethod), // Pastikan String sesuai Schema
            customerName: data.customerName ?? "Guest",
            orderType: data.orderType,
            items: data.items as unknown as Prisma.InputJsonValue,
            status: forceStatus || "PENDING",
          },
        });

        await processStockDeduction(tx, data.items, data.id);
        return order;
      },
      { maxWait: 5000, timeout: 20000 },
    );

    revalidatePath("/");
    revalidatePath("/order");
    revalidatePath("/kitchen");
    revalidatePath("/inventory/ingredients");

    return { success: true, data: result };
  } catch (error) {
    console.error("SYNC_ERROR_DETAIL:", error); // Lebih detail untuk debug di terminal
    return { success: false, error: "Gagal Sinkronisasi Cloud" };
  }
}

export async function getOrdersFromCloud() {
  try {
    const orders = await prisma.order.findMany({
      where: { status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: orders.map((o) => ({ ...o, isSynced: true })),
    };
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    return { success: false, error: "Gagal Mengambil data Cloud" };
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, error: "Order tidak ditemukan" };

    if (newStatus === "READY") {
      const items = (order.items as unknown as OrderItem[]) || [];
      if (!items.every((item) => item.isDone)) {
        return { success: false, error: "Masih ada item belum kelar!" };
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    revalidatePath("/order");
    revalidatePath("/kitchen");
    return { success: true, data: updatedOrder };
  } catch (error) {
    console.error("Update Status Error:", error);
    return { success: false, error: "Gagal update status" };
  }
}

export async function getKitchenOrders() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["PENDING", "PREPARING"] },
      },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, data: orders };
  } catch {
    return { success: false, error: "Gagal ambil antrian dapur" };
  }
}

export async function updateItemStatus(
  orderId: string,
  itemIdx: number,
  isDone: boolean,
) {
  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || !order.items)
      return { success: false, error: "Order tidak ditemukan" };

    const items = [...(order.items as unknown as OrderItem[])];
    if (items[itemIdx]) items[itemIdx].isDone = isDone;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { items: items as unknown as Prisma.InputJsonValue },
    });

    revalidatePath("/kitchen");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Update Item Error:", error);
    return { success: false, error: "Gagal update item" };
  }
}

export async function syncBulkOrders(orders: CreateOrderParams[]) {
  try {
    const results = await prisma.$transaction(async (tx) => {
      const processed = [];
      for (const order of orders) {
        const exist = await tx.order.findUnique({ where: { id: order.id } });
        if (!exist) {
          const created = await tx.order.create({
            data: {
              id: order.id,
              customerName: order.customerName ?? "Guest",
              total: order.total,
              paid: order.paid,
              paymentMethod: String(order.paymentMethod),
              orderType: order.orderType,
              items: order.items as unknown as Prisma.InputJsonValue,
              status: "COMPLETED",
              createdAt: new Date(order.createdAt),
            },
          });
          await processStockDeduction(tx, order.items, order.id);
          processed.push(created);
        }
      }
      return processed;
    });
    revalidatePath("/");
    return { success: true, count: results.length };
  } catch (error) {
    console.error("Bulk Sync Error:", error);
    return { success: false };
  }
}
