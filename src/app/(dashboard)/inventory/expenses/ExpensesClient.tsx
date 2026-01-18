"use client";

import { useState } from "react";
import { Plus, Trash2, Receipt } from "lucide-react"; // Hapus Calendar, Tag, FileText
import { motion } from "framer-motion";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { createExpense, deleteExpense } from "./actions";
import { ExpenseCategory, type Expense } from "@prisma/client"; // Pakai type dari Prisma
import { toast } from "sonner";



export default function ExpensesClient({ initialData }: { initialData: Expense[] }) {
  const [expenses, setExpenses] = useState<Expense[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    category: "OPERASIONAL" as ExpenseCategory,
    date: format(new Date(), "yyyy-MM-dd"),
    note: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await createExpense({
      ...formData,
      amount: parseInt(formData.amount),
      date: new Date(formData.date),
    });

    if (res.success && res.data) {
      // Hilangkan 'as any', casting ke Expense
      setExpenses([(res.data as Expense), ...expenses]);
      setIsModalOpen(false);
      setFormData({ 
        name: "", 
        amount: "", 
        category: "OPERASIONAL", 
        date: format(new Date(), "yyyy-MM-dd"), 
        note: "" 
      });
      toast.success("Biaya operasional berhasil dicatat!");
    } else {
      toast.error("Gagal menyimpan data");
    }
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus catatan ini?")) return;
    const res = await deleteExpense(id);
    if (res.success) {
      setExpenses(expenses.filter((e) => e.id !== id));
      toast.success("Catatan dihapus");
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Update rounded-4xl sesuai saran tailwind-intellisense */}
        <div className="bg-slate-900 rounded-4xl p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Total Pengeluaran</p>
          <h3 className="text-3xl font-black mt-1 text-amber-400">
            Rp {expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}
          </h3>
        </div>
        <div className="md:col-span-2 flex items-center justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-3 bg-slate-900 hover:bg-black text-white px-8 py-4 rounded-2xl font-black text-xs transition-all shadow-xl shadow-slate-200"
          >
            <Plus className="w-5 h-5" />
            CATAT PENGELUARAN BARU
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-8 py-5">Tanggal</th>
              <th className="px-8 py-5">Nama Biaya</th>
              <th className="px-8 py-5">Kategori</th>
              <th className="px-8 py-5 text-right">Nominal</th>
              <th className="px-8 py-5 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {expenses.map((expense) => (
              <motion.tr layout key={expense.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-5 text-xs font-bold text-slate-500">
                  {format(new Date(expense.date), "dd MMM yyyy", { locale: id })}
                </td>
                <td className="px-8 py-5">
                  <p className="text-sm font-black text-slate-900 uppercase">{expense.name}</p>
                  {expense.note && <p className="text-[10px] text-slate-400 font-medium italic">{expense.note}</p>}
                </td>
                <td className="px-8 py-5">
                  <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-[10px] font-black text-slate-600 uppercase">
                    {expense.category.replace("_", " ")}
                  </span>
                </td>
                <td className="px-8 py-5 text-right font-black text-sm text-red-600">
                  Rp {expense.amount.toLocaleString()}
                </td>
                <td className="px-8 py-5 text-center">
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        // Update z-100 sesuai saran tailwind-intellisense
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl"
          >
            <h3 className="text-2xl font-black uppercase mb-6 flex items-center gap-3">
               <Receipt className="w-6 h-6" /> CATAT BIAYA
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Nama Pengeluaran</label>
                <input
                  required
                  placeholder="Misal: Tagihan Listrik Januari"
                  className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1">Nominal (Rp)</label>
                  <input
                    required
                    type="number"
                    className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 px-1">Tanggal</label>
                  <input
                    required
                    type="date"
                    className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 px-1">Kategori</label>
                <select
                  className="w-full px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                >
                  {Object.values(ExpenseCategory).map((cat) => (
                    <option key={cat} value={cat}>{cat.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 rounded-xl font-black text-xs uppercase text-slate-400 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  disabled={isLoading}
                  className="flex-1 px-6 py-4 rounded-xl font-black text-xs uppercase bg-slate-900 text-white hover:bg-black transition-all disabled:opacity-50 shadow-xl shadow-slate-200"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Data"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}