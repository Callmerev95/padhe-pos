"use client";

import { useMemo, useState } from "react";
import { ProductList } from "@/components/shared/products/ProductList";
import { ProductHeader } from "@/components/shared/products/ProductHeader";
import { CreateProductDialog } from "@/components/shared/products/CreateProductDialog";
import { OrderFooter } from "@/components/shared/order/OrderFooter";
import { CreditNote } from "@/components/shared/order/CreditNote";
import type { Product } from "@/components/shared/products/types";
import { useRouter, useSearchParams } from "next/navigation";

type CategoryOption = { id: string; name: string };

type Props = {
  initialProducts: Product[];
  initialCategories?: CategoryOption[];
};

function getParam<T extends string>(
  value: string | null,
  allowed: readonly T[],
  fallback: T
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function ProductsClient({ initialProducts, initialCategories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const statusFilter = getParam(
    searchParams.get("status"),
    ["all", "active", "inactive"] as const,
    "all"
  );

  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  function handleCreated(newProduct: Product) {
    setProducts((prev) => [newProduct, ...prev]);
  }

  function handleUpdated(updated: Product) {
    setProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
  }

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (statusFilter === "active" && !p.isActive) return false;
        if (statusFilter === "inactive" && p.isActive) return false;
        return true;
      })
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [products, statusFilter]);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">

      <div className="shrink-0">
        <ProductHeader
          total={filteredProducts.length}
          statusFilter={statusFilter}
          onStatusChange={(v) => router.replace(`?status=${v}`, { scroll: false })}
          onAdd={() => {
            setEditingProduct(null);
            setOpen(true);
          }}
        />
      </div>

      <CreateProductDialog
        open={open}
        onClose={() => {
          setOpen(false);
          setEditingProduct(null);
        }}
        onCreated={handleCreated}
        onUpdated={handleUpdated}
        initialCategories={initialCategories}
        product={editingProduct}
      />

      {/* CONTAINER UTAMA DENGAN SHADOW DAN ROUNDED PREMIUM */}
      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 hover:border-cyan-100">
        {/* FIX: Area tabel menggunakan #fafbfc untuk background dasar */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#fafbfc] pb-12">
          <ProductList
            products={filteredProducts}
            onEdit={(p) => {
              setEditingProduct(p);
              setOpen(true);
            }}
            onDeactivate={handleUpdated}
          />
        </div>

        <OrderFooter count={filteredProducts.length} label="Produk Terdaftar" />
      </div>

      <CreditNote />
    </div>
  );
}