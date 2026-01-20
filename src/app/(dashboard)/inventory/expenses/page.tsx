import { getExpenses } from "./actions";
import ExpensesClient from "./ExpensesClient";
import { type Expense } from "@prisma/client";

export const runtime = "nodejs";

export default async function ExpensesPage() {
  const result = await getExpenses();
  
  // Ambil data dan pastikan typenya adalah Expense[]
  const expenses: Expense[] = result.success ? (result.data as Expense[]) : [];

  // LANGSUNG RETURN COMPONENT (Hapus div p-8 pt-6)
  return <ExpensesClient initialData={expenses} />;
}