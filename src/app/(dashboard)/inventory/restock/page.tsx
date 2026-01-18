import { Warehouse } from "lucide-react";
import { getIngredients } from "../ingredients/actions";
import { RestockForm } from "./RestockForm";

export default async function RestockPage() {
  const response = await getIngredients();
  const ingredients = response.data || [];

  return (
    <div className="flex flex-col gap-6 p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center">
          <Warehouse className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Stok Masuk</h1>
          <p className="text-sm text-slate-500">Input nota belanjaan bahan baku di sini.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-4xl p-8 shadow-sm">
        <RestockForm ingredients={ingredients} />
      </div>
    </div>
  );
}