"use server";

import { prisma as db } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { OrderItemSchema, OrderItem } from "./types/dashboard.types";

export async function getDashboardProfitData() {
  try {
    const now = new Date();
    const firstDay = startOfMonth(now);
    const lastDay = endOfMonth(now);

    // 1. Ambil Semua Order Bulan Ini
    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: firstDay, lte: lastDay }
      }
    });

    let totalRevenue = 0;
    const itemsToProcess: OrderItem[] = [];

    // 2. Kumpulkan semua OrderItem dan hitung Revenue
    orders.forEach(order => {
      totalRevenue += order.total;
      
      const parsed = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      if (Array.isArray(parsed)) {
        parsed.forEach(i => {
          const result = OrderItemSchema.safeParse(i);
          if (result.success) itemsToProcess.push(result.data);
        });
      }
    });

    // 3. OPTIMASI: Ambil SEMUA data produk & resep yang terlibat dalam SATU query
    const uniqueProductIds = Array.from(new Set(itemsToProcess.map(i => i.id)));
    const productsData = await db.product.findMany({
      where: { id: { in: uniqueProductIds } },
      include: {
        recipes: {
          include: { ingredient: true }
        }
      }
    });

    // Masukkan ke Map agar lookup lebih cepat (O(1))
    const productMap = new Map(productsData.map(p => [p.id, p]));

    // 4. Kalkulasi COGS (HPP) tanpa hit ke DB lagi
    let totalCOGS = 0;
    itemsToProcess.forEach(item => {
      const product = productMap.get(item.id);
      if (product && product.recipes.length > 0) {
        const hppPerUnit = product.recipes.reduce((acc, recipe) => {
          const ingredientPrice = recipe.ingredient.averagePrice || 0;
          return acc + (recipe.quantity * ingredientPrice);
        }, 0);
        totalCOGS += (hppPerUnit * item.qty);
      }
    });

    // 5. Ambil Total Biaya Operasional
    const expenseData = await db.expense.aggregate({
      where: { date: { gte: firstDay, lte: lastDay } },
      _sum: { amount: true }
    });
    const totalExpenses = expenseData._sum.amount || 0;

    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;

    return {
      success: true,
      revenue: totalRevenue,
      expenses: totalExpenses,
      cogs: totalCOGS,
      grossProfit,
      netProfit,
      margin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    };
  } catch (error) {
    console.error("PROFIT_CALCULATION_ERROR:", error);
    return { success: false, error: "Gagal menghitung profit" };
  }
}