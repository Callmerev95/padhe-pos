import { prisma } from "@/lib/prisma";
import { ProductPanel } from "@/components/shared/pos/product/ProductPanel";
import type { ProductUI as Product } from "@/app/(dashboard)/products/types/product.types";
import { toCategoryColor } from "@/lib/category-colors";
import { CartPanel } from "@/components/shared/pos/cart/CartPanel";
import { PosInitializer } from "./PosInitializer";

export default async function POSPage() {
  // Fetch products aktif dari database - LOGIC TETAP SAMA
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  // Map products - LOGIC TETAP SAMA
  const uiProducts: Product[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    sku: p.sku ?? "-",
    price: p.price,
    isActive: p.isActive,
    imageUrl: p.imageUrl ?? undefined,
    categoryType: p.categoryType,
    category: {
      id: p.category.id,
      name: p.category.name,
      color: toCategoryColor(p.category.color),
    },
  }));

  return (
    /* FIX UTAMA: 
       - Gunakan 'h-[calc(100vh-140px)]' pada pembungkus paling luar.
       - Tambahkan 'overflow-hidden' agar tidak ada scrollbar browser yang muncul.
       - 'flex flex-col' memastikan anak-anaknya patuh pada batas tinggi ini.
    */
    <div className="h-[calc(100vh-140px)] w-full overflow-hidden animate-in fade-in duration-700 bg-slate-50/30">
      <PosInitializer />

      {/* CONTAINER DALAM:
          - Padding dipindahkan ke sini agar tidak menambah tinggi total elemen luar.
          - 'h-full' dan 'max-h-full' adalah wajib.
      */}
      <div className="h-full w-full p-2 sm:p-4 flex flex-col">

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 h-full min-h-0">

          {/* PRODUCT PANEL Area:
              - 'min-h-0' sangat penting di sini agar scrollbar internal ProductPanel aktif.
          */}
          <div className="md:col-span-7 lg:col-span-8 h-full min-h-0 flex flex-col">
            <ProductPanel products={uiProducts} />
          </div>

          {/* CART PANEL Area:
              - 'flex flex-col' dan 'min-h-0' memastikan CartPanel tidak "meledak" tingginya.
          */}
          <div className="hidden md:flex md:col-span-5 lg:col-span-4 h-full min-h-0 flex-col">
            <CartPanel />
          </div>

        </div>
      </div>
    </div>
  );
}