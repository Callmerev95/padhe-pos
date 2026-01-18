import { prisma as db } from "@/lib/prisma";
import { Coffee } from "lucide-react";
import { ManageRecipeDialog } from "./ManageRecipeDialog";

export default async function RecipesPage() {

  const ingredients = await db.ingredient.findMany({
    orderBy: { name: "asc" }
  });
  // Kita ambil produk yang tipenya DRINK saja (atau semua produk)
  const products = await db.product.findMany({
    include: {
      recipes: {
        include: {
          ingredient: {
            select: {
              name: true,
              unitUsage: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

 

  return (
    <div className="p-8 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 uppercase">Resep Minuman</h1>
        <p className="text-sm text-slate-500">Hubungkan menu penjualan dengan bahan baku gudang.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900">{product.name}</h3>
                <p className="text-xs text-slate-400 uppercase tracking-tighter">SKU: {product.sku || '-'}</p>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <Coffee className="h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* DAFTAR BAHAN DALAM RESEP */}
            <div className="space-y-3 mb-6">
              {product.recipes.length > 0 ? (
                product.recipes.map((r) => (
                  <div key={r.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2">
                    <span className="text-slate-600">{r.ingredient.name}</span>
                    <span className="font-bold text-slate-900">{r.quantity} {r.ingredient.unitUsage}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-amber-500 italic">Resep belum diatur.</p>
              )}
            </div>

            {/* TOMBOL ADD BAHAN (Nanti kita buatkan modalnya) */}
            <ManageRecipeDialog
              product={product}
              ingredients={ingredients}
            />
          </div>
        ))}
      </div>
    </div>
  );
}