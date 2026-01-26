"use server";

import { prisma as db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CreateIngredientInput, RestockInput } from "./types/ingredient.types";

/**
 * FETCH DATA
 */

export async function getIngredients() {
  try {
    const ingredients = await db.ingredient.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, data: ingredients };
  } catch (error) {
    console.error("GET_INGREDIENTS_ERROR:", error);
    return { success: false, error: "Gagal mengambil data bahan baku" };
  }
}

export async function getLowStockSummary() {
  try {
    const ingredients = await db.ingredient.findMany({
      where: {
        stock: {
          lte: db.ingredient.fields.minStock,
        },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        unitUsage: true,
        minStock: true,
      },
      orderBy: {
        stock: "asc",
      },
    });
    return { success: true, data: ingredients };
  } catch (error) {
    console.error("GET_LOW_STOCK_SUMMARY_ERROR:", error);
    return { success: false, error: "Gagal mengambil data stok rendah" };
  }
}

export async function getStockLogs() {
  try {
    const logs = await db.stockLog.findMany({
      include: {
        ingredient: { select: { name: true, unitUsage: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: logs };
  } catch {
    return { success: false, error: "Gagal memuat log" };
  }
}

/**
 * MUTATIONS
 */

export async function createIngredient(data: CreateIngredientInput) {
  try {
    const ingredient = await db.ingredient.create({
      data: {
        name: data.name,
        category: data.category,
        unitUsage: data.unitUsage,
        minStock: data.minStock,
        lastPurchasePrice: data.lastPurchasePrice,
        averagePrice: data.lastPurchasePrice,
      },
    });
    revalidatePath("/inventory/ingredients");
    return { success: true, data: ingredient };
  } catch {
    return { success: false, error: "Gagal menambah bahan baku" };
  }
}

export async function updateIngredient(
  id: string,
  data: {
    name: string;
    category: string;
    unitUsage: string;
    minStock: number;
    lastPurchasePrice: number;
  },
) {
  try {
    await db.ingredient.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        unitUsage: data.unitUsage,
        minStock: Number(data.minStock),
        lastPurchasePrice: Number(data.lastPurchasePrice),
      },
    });

    revalidatePath("/inventory/ingredients");
    return { success: true };
  } catch (error) {
    console.error("UPDATE_INGREDIENT_ERROR:", error);
    return { success: false, error: "Gagal memperbarui bahan baku" };
  }
}

export async function restockIngredient(data: RestockInput) {
  try {
    const result = await db.$transaction(async (tx) => {
      const ingredient = await tx.ingredient.findUnique({
        where: { id: data.ingredientId },
      });
      if (!ingredient) throw new Error("Bahan baku tidak ditemukan");

      const totalOldValue =
        Math.max(0, ingredient.stock) * ingredient.averagePrice;
      const totalNewValue = data.quantity * data.purchasePrice;
      const newTotalStock = Math.max(0, ingredient.stock) + data.quantity;

      const newAveragePrice =
        newTotalStock > 0
          ? (totalOldValue + totalNewValue) / newTotalStock
          : data.purchasePrice;

      const updated = await tx.ingredient.update({
        where: { id: data.ingredientId },
        data: {
          stock: { increment: data.quantity },
          averagePrice: newAveragePrice,
          lastPurchasePrice: data.purchasePrice,
        },
      });

      await tx.stockLog.create({
        data: {
          ingredientId: data.ingredientId,
          type: "IN",
          quantity: data.quantity,
          previousStock: ingredient.stock,
          currentStock: newTotalStock,
          note: data.note || "Restock manual",
        },
      });
      return updated;
    });

    revalidatePath("/inventory/ingredients");
    return { success: true, data: result };
  } catch {
    return { success: false, error: "Gagal memproses stok masuk" };
  }
}

export async function deleteIngredient(id: string) {
  try {
    await db.ingredient.delete({ where: { id } });
    revalidatePath("/inventory/ingredients");
    return { success: true };
  } catch {
    return { success: false, error: "Gagal menghapus bahan baku" };
  }
}
