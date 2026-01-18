import { OrderHistoryPage } from "@/features/order-history/OrderHistoryPage";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default function OrdersPage() {
  return (
    // Kita hilangkan padding p-6 di sini agar tidak double padding dengan 
    // p-4 md:p-8 yang ada di dalam OrderHistoryPage
    <div className="min-h-full">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
           <Loader2 className="animate-spin mb-4 text-cyan-500" size={32} />
           <p className="text-xs font-bold uppercase tracking-[0.2em] animate-pulse">
             Menyiapkan Riwayat...
           </p>
        </div>
      }>
        <OrderHistoryPage />
      </Suspense>
    </div>
  );
}