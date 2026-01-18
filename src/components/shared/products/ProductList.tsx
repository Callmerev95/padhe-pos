"use client";

import { ProductRow } from "./ProductRow";
import type { Product } from "./types";

export function ProductList({
  products,
  onEdit,
  onDeactivate,
  emptyMessage,
}: {
  products: ReadonlyArray<Product>;
  onEdit?: (p: Product) => void;
  onDeactivate?: (p: Product) => void;
  emptyMessage?: string;
}) {
  if (products.length === 0) {
    return (
      <div className="p-20 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
        {emptyMessage ?? "Tidak ada produk ditemukan"}
      </div>
    );
  }

  return (
    <div className="relative min-w-full isolate">
      <table className="w-full text-sm border-separate border-spacing-0">
        <thead>
          <tr className="relative z-30">
            <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] first:rounded-tl-3xl border-b border-slate-200">
              Info Produk
            </th>
            <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              SKU
            </th>
            <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              Kategori
            </th>
            <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              Harga
            </th>
            <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-left font-black text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
              Status
            </th>
            <th className="sticky top-0 z-30 bg-[#f8fafc] px-6 py-4 text-right font-black text-slate-500 uppercase tracking-wider text-[10px] last:rounded-tr-3xl border-b border-slate-200">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDeactivate={onDeactivate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}