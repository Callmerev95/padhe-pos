import { prisma as db } from "@/lib/prisma";
import { Coffee, Utensils, ChefHat, Search } from "lucide-react"; // FIX: Tambah Search
import { ManageRecipeDialog } from "./ManageRecipeDialog";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";

  const products = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } }
      ]
    },
    include: {
      recipes: {
        include: {
          ingredient: true 
        },
      },
      category: true 
    },
    orderBy: { name: "asc" },
  });

  const ingredients = await db.ingredient.findMany({
    orderBy: { name: "asc" }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-700 overflow-hidden pr-2">
      <div className="shrink-0">
        <PremiumHeader
          icon={ChefHat}
          title="RESEP MENU"
          subtitle={`MENGELOLA ${products.length} TOTAL MENU TERDAFTAR`}
        />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => {
              // FIX: totalHpp sekarang digunakan di bawah
              const totalHpp = product.recipes.reduce((acc, item) => {
                return acc + (item.quantity * item.ingredient.averagePrice);
              }, 0);

              const isFood = product.categoryType === "FOOD";

              return (
                <div 
                  key={product.id} 
                  className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 hover:-translate-y-1 flex flex-col h-full relative overflow-hidden"
                >
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full group-hover:bg-cyan-50 transition-colors duration-500" />

                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg group-hover:text-cyan-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-[10px] font-black text-cyan-600/60 uppercase tracking-widest mt-1">
                        {product.category?.name || 'REGULAR'}
                      </p>
                    </div>
                    <div className="p-3 text-slate-400 group-hover:text-cyan-600 transition-colors bg-white rounded-2xl shadow-sm border border-slate-50">
                      {isFood ? <Utensils size={20} /> : <Coffee size={20} />}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 mb-6">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 text-center border-b border-slate-50 pb-2">Komposisi Bahan</p>
                    {product.recipes.length > 0 ? (
                      product.recipes.map((r) => (
                        <div key={r.id} className="flex justify-between items-center bg-slate-50/50 px-4 py-2.5 rounded-xl border border-transparent hover:border-slate-100 transition-all">
                          <span className="text-[11px] font-bold text-slate-600">{r.ingredient.name}</span>
                          <span className="text-[11px] font-black text-slate-900 tabular-nums">
                            {r.quantity} <span className="text-[9px] text-slate-400 font-bold">{r.ingredient.unitUsage}</span>
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="py-4 px-4 rounded-2xl bg-amber-50/50 border border-dashed border-amber-200">
                        <p className="text-[10px] font-bold text-amber-600 uppercase text-center tracking-wider italic">Resep belum diatur</p>
                      </div>
                    )}
                  </div>

                  {/* FIX: Pemanggilan totalHpp agar tidak unused */}
                  <div className="mb-6 pt-4 border-t border-slate-100">
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Estimasi HPP</span>
                        <span className="text-sm font-black text-cyan-600 tracking-tight">
                           Rp {Math.round(totalHpp).toLocaleString('id-ID')}
                        </span>
                     </div>
                  </div>

                  {/* FIX: Menghilangkan 'any' dengan casting Parameters */}
                  <ManageRecipeDialog
                    product={product as unknown as Parameters<typeof ManageRecipeDialog>[0]["product"]}
                    ingredients={ingredients}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 py-20">
             <Search size={48} className="opacity-10" />
             <p className="font-bold text-sm uppercase tracking-widest opacity-40">Menu tidak ditemukan</p>
          </div>
        )}
        
        <div className="mt-12 mb-6 flex flex-col items-center justify-center gap-2 opacity-30 hover:opacity-100 transition-opacity duration-500">
          <div className="h-px w-12 bg-slate-300" />
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Recipe Management System <span className="text-cyan-500">V2.0</span>
          </p>
        </div>
      </div>
    </div>
  );
}