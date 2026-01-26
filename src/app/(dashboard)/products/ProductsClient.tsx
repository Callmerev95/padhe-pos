"use client";

// 1. UPDATE: Import dari folder local (components), bukan shared lagi
import { ProductList } from "./components/ProductList";
import { ProductHeader } from "./components/ProductHeader";
import { CreateProductDialog } from "./components/CreateProductDialog";
import { OrderFooter } from "@/components/shared/order/OrderFooter";
import { CreditNote } from "@/components/shared/order/CreditNote";

// 2. UPDATE: Hapus import Product lama, hanya pakai ProductUI
import { ProductUI } from "./types/product.types";
import { useProductLogic } from "./hooks/useProductLogic";

type CategoryOption = { id: string; name: string };

interface Props {
  initialProducts: ProductUI[];
  initialCategories?: CategoryOption[];
}

export function ProductsClient({ initialProducts, initialCategories }: Props) {
  const {
    products,
    statusFilter,
    open,
    setOpen,
    editingProduct,
    setEditingProduct,
    handleCreated,
    handleUpdated,
    handleStatusChange,
    handleDeactivate, // Ambil fungsi deactivate dari hook
  } = useProductLogic(initialProducts);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4 animate-in fade-in duration-700 overflow-hidden pr-2">

      <div className="shrink-0">
        <ProductHeader
          total={products.length}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
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

      <div className="flex-1 min-h-0 flex flex-col bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 hover:border-cyan-100">
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#fafbfc] pb-12">
          {/* 3. FIX: Buang semua 'as unknown as' dan casting lainnya */}
          <ProductList
            products={products}
            onEdit={(p) => {
              setEditingProduct(p);
              setOpen(true);
            }}
            // UBAH BAGIAN INI:
            // Kita ambil properti id dari object p sebelum dikirim ke hook
            onDeactivate={(p) => handleDeactivate(p.id)}
          />
        </div>

        <OrderFooter count={products.length} label="Produk Terdaftar" />
      </div>

      <CreditNote />
    </div>
  );
}