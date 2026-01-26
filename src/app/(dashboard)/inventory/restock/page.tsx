import { Warehouse } from "lucide-react";
import { getIngredients } from "../ingredients/actions";
import { RestockForm } from "./RestockForm";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import { CreditNote } from "@/components/shared/order/CreditNote";

export default async function RestockPage() {
  const response = await getIngredients();
  const ingredients = response.data || [];

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-6 animate-in fade-in duration-700">
      <PremiumHeader 
        icon={Warehouse}
        title="INPUT STOK MASUK"
        subtitle="CATAT NOTA BELANJA DAN UPDATE OTOMATIS HPP BAHAN"
      />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white/80 backdrop-blur-xl border border-white shadow-2xl shadow-slate-200/50 rounded-[3rem] p-10 relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50" />
          
          <div className="relative z-10">
            <RestockForm ingredients={ingredients} />
          </div>
        </div>
      </div>
      
      <CreditNote />
    </div>
  );
}