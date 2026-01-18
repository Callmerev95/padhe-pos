"use server";

import { prisma as db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { startOfDay, endOfDay } from "date-fns";

// 1. Fungsi untuk mengambil semua bahan baku
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

// 2. Fungsi untuk menambah bahan baku baru
export async function createIngredient(data: {
  name: string;
  category: string;
  unitUsage: string;
  minStock: number;
  lastPurchasePrice: number;
}) {
  try {
    const ingredient = await db.ingredient.create({
      data: {
        name: data.name,
        category: data.category,
        unitUsage: data.unitUsage,
        minStock: data.minStock,
        lastPurchasePrice: data.lastPurchasePrice,
        // Hitung averagePrice awal sama dengan harga beli pertama
        averagePrice: data.lastPurchasePrice,
      },
    });

    revalidatePath("/inventory/ingredients");
    return { success: true, data: ingredient };
  } catch (error) {
    console.error("CREATE_INGREDIENT_ERROR:", error);
    return { success: false, error: "Gagal menambah bahan baku" };
  }
}

// 3. Fungsi untuk memperbarui stok bahan baku
export async function updateIngredient(
  id: string,
  data: {
    name: string;
    category: string;
    unitUsage: string;
    minStock: number;
    lastPurchasePrice: number;
  }
) {
  try {
    await db.ingredient.update({
      where: { id },
      data,
    });
    revalidatePath("/inventory/ingredients");
    return { success: true };
  } catch (error) {
    console.error("UPDATE_INGREDIENT_ERROR:", error);
    return { success: false, error: "Gagal memperbarui bahan baku" };
  }
}

// 4. Fungsi untuk menghapus bahan baku
export async function deleteIngredient(id: string) {
  try {
    await db.ingredient.delete({
      where: { id },
    });
    revalidatePath("/inventory/ingredients");
    return { success: true };
  } catch (error) {
    console.error("DELETE_INGREDIENT_ERROR:", error);
    return { success: false, error: "Gagal menghapus bahan baku" };
  }
}

// 5. Fungsi untuk Restock (Stok Masuk)
export async function restockIngredient(data: {
  ingredientId: string;
  quantity: number;
  purchasePrice: number;
  note?: string;
}) {
  try {
    // Gunakan transaction agar stok dan log terupdate secara atomik (bersamaan)
    const result = await db.$transaction(async (tx) => {
      // 1. Ambil data bahan saat ini
      const ingredient = await tx.ingredient.findUnique({
        where: { id: data.ingredientId },
      });

      if (!ingredient) throw new Error("Bahan baku tidak ditemukan");

      // 2. Hitung averagePrice baru
      // Total nilai lama + total nilai baru / total stok baru
      // Rumus: ((stok_lama * avg_harga_lama) + (qty_baru * harga_beli_baru)) / (stok_lama + qty_baru)
      const totalOldValue =
        Math.max(0, ingredient.stock) * ingredient.averagePrice;
      const totalNewValue = data.quantity * data.purchasePrice;
      const newTotalStock = Math.max(0, ingredient.stock) + data.quantity;

      const newAveragePrice =
        newTotalStock > 0
          ? (totalOldValue + totalNewValue) / newTotalStock
          : data.purchasePrice; // Jika stok baru 0, gunakan harga beli sebagai averagePrice

      // 3. Update Ingredient
      const updatedIngredient = await tx.ingredient.update({
        where: { id: data.ingredientId },
        data: {
          stock: { increment: data.quantity },
          averagePrice: newAveragePrice,
          lastPurchasePrice: data.purchasePrice,
        },
      });

      // 4. Catat ke StockLog
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

      return updatedIngredient;
    });

    revalidatePath("/inventory/ingredients");
    return { success: true, data: result };
  } catch (error) {
    console.error("RESTOCK_ERROR:", error);
    return { success: false, error: "Gagal memproses stok masuk" };
  }
}

// 6. Fungsi untuk mengambil log pergerakan stok
export async function getStockLogs(filters?: {
  startDate?: Date;
  endDate?: Date;
  ingredientId?: string;
}) {
  try {
    const logs = await db.stockLog.findMany({
      where: {
        // Filter berdasarkan bahan baku (jika dipilih)
        ...(filters?.ingredientId && { ingredientId: filters.ingredientId }),
        // Filter berdasarkan rentang tanggal
        ...(filters?.startDate &&
          filters?.endDate && {
            createdAt: {
              gte: startOfDay(filters.startDate),
              lte: endOfDay(filters.endDate),
            },
          }),
      },
      include: {
        ingredient: {
          select: { name: true, unitUsage: true },
        },
      },
      orderBy: { createdAt: "desc" },
      // ganti dengan sistem pagination nanti jika data sudah jutaan
    });
    return { success: true, data: logs };
  } catch (error) {
    console.error("GET_STOCK_LOGS_ERROR:", error);
    return { success: false, error: "Gagal mengambil data log stok" };
  }
}
// 7. Fungsi untuk mengambil bahan yang stoknya kritis (Low Stock)
// 7. Fungsi untuk mengambil ringkasan stok rendah (Untuk Badge/Notification)
export async function getLowStockSummary() {
  try {
    const criticalItems = await db.ingredient.findMany({
      where: {
        stock: {
          lte: db.ingredient.fields.minStock, // Stok pas atau di bawah batas minim
        },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        unitUsage: true,
        minStock: true,
      },
      orderBy: { stock: "asc" },
    });

    return {
      success: true,
      count: criticalItems.length,
      items: criticalItems,
    };
  } catch (error) {
    console.error("GET_LOW_STOCK_SUMMARY_ERROR:", error);
    return { success: false, error: "Gagal memuat ringkasan stok" };
  }
}
