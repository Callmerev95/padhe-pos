import { ExpenseCategory } from "@prisma/client";

/**
 * Interface untuk data yang ditampilkan di UI
 * Sesuai dengan skema Prisma untuk Expense
 */
export interface ExpenseUI {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  note: string | null; // Wajib null (bukan optional) agar sinkron dengan Prisma
  createdAt: Date;
}

/**
 * Interface untuk input data dari form
 */
export interface RawExpenseInput {
  name: string;
  amount: string | number;
  category: ExpenseCategory;
  date: string | Date;
  note?: string | null;
}