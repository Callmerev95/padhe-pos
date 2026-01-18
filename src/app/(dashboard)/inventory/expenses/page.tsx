import { getExpenses } from "./actions";
import ExpensesClient from "./ExpensesClient";
import { type Expense } from "@prisma/client";

export const runtime = "nodejs";

export default async function ExpensesPage() {
  const result = await getExpenses();
  
  // Ambil data dan pastikan typenya adalah Expense[]
  const expenses: Expense[] = result.success ? (result.data as Expense[]) : [];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight uppercase">Biaya Operasional</h2>
          <p className="text-sm font-medium text-slate-500">
            Kelola dan catat semua pengeluaran di luar bahan baku.
          </p>
        </div>
      </div>

      {/* Kirim data tanpa casting 'any' */}
      <ExpensesClient initialData={expenses} />
    </div>
  );
}