"use server";

import { prisma as db } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { type OrderItem } from "@/lib/db";

export async function getDashboardProfitData() {
  try {
    const now = new Date();
    const firstDay = startOfMonth(now);
    const lastDay = endOfMonth(now);

    // 1. Ambil Semua Order Bulan Ini (untuk menghitung Revenue & HPP)
    const orders = await db.order.findMany({
      where: {
        createdAt: { gte: firstDay, lte: lastDay }
      }
    });

    let totalRevenue = 0;
    let totalCOGS = 0;

    // 2. Kalkulasi Revenue & HPP Real berdasarkan Recipe
    for (const order of orders) {
      totalRevenue += order.total;

      // Parse items dari JSON
      const items = (typeof order.items === 'string' 
        ? JSON.parse(order.items) 
        : order.items) as OrderItem[];

      for (const item of items) {
        // Casting ke tipe yang kita inginkan tanpa menggunakan 'any'
        const orderItem = item as OrderItem & { productId?: string };
        const pId = orderItem.productId;

        // Proteksi: kalau productId kosong (mencegah Prisma error)
        if (!pId) continue;

        const productWithRecipe = await db.product.findUnique({
          where: { id: pId }, 
          include: {
            recipes: {
              include: {
                ingredient: true
              }
            }
          }
        });

        if (productWithRecipe && productWithRecipe.recipes.length > 0) {
          const hppPerUnit = productWithRecipe.recipes.reduce((acc, recipe) => {
            const ingredientPrice = recipe.ingredient.averagePrice || 0;
            const cost = recipe.quantity * ingredientPrice;
            return acc + cost;
          }, 0);

          totalCOGS += (hppPerUnit * (orderItem.qty || 0));
        }
      }
    }

    // 3. Ambil Total Biaya Operasional (Expenses)
    const expenseData = await db.expense.aggregate({
      where: { date: { gte: firstDay, lte: lastDay } },
      _sum: { amount: true }
    });
    const totalExpenses = expenseData._sum.amount || 0;

    // 4. Kalkulasi Final Laba Rugi
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