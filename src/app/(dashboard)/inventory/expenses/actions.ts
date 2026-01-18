"use server";

import { prisma as db } from "@/lib/prisma";
import { ExpenseCategory } from "@prisma/client";
import { revalidatePath } from "next/cache";

// 1. Fungsi untuk menambah biaya operasional baru
export async function createExpense(data: {
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  note?: string;
}) {
  try {
    const expense = await db.expense.create({
      data: {
        name: data.name,
        amount: data.amount,
        category: data.category,
        date: data.date,
        note: data.note,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/inventory/expenses");
    
    return { success: true, data: expense };
  } catch (error) {
    console.error("CREATE_EXPENSE_ERROR:", error);
    return { success: false, error: "Gagal mencatat biaya operasional" };
  }
}

// 2. Fungsi untuk mengambil daftar biaya dengan filter (optional)
export async function getExpenses(params?: {
  startDate?: Date;
  endDate?: Date;
  category?: ExpenseCategory;
}) {
  try {
    const expenses = await db.expense.findMany({
      where: {
        date: {
          gte: params?.startDate,
          lte: params?.endDate,
        },
        category: params?.category,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: expenses };
  } catch (error) {
    console.error("GET_EXPENSES_ERROR:", error);
    return { success: false, error: "Gagal memuat data biaya" };
  }
}

// 3. Fungsi untuk menghapus catatan biaya
export async function deleteExpense(id: string) {
  try {
    await db.expense.delete({
      where: { id },
    });

    revalidatePath("/dashboard");
    revalidatePath("/inventory/expenses");

    return { success: true };
  } catch (error) {
    console.error("DELETE_EXPENSE_ERROR:", error);
    return { success: false, error: "Gagal menghapus data biaya" };
  }
}

// 4. Fungsi ringkasan untuk Dashboard
export async function getExpenseSummary() {
  try {
    const total = await db.expense.aggregate({
      _sum: {
        amount: true,
      },
    });

    return { success: true, total: total._sum.amount || 0 };
  } catch  {
    return { success: false, total: 0 };
  }
}