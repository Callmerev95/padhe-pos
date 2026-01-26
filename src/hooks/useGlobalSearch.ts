import { useMemo, useEffect, useState } from "react";
import { useOrderHistory } from "@/features/order-history/useOrderHistory";
import type { ProductUI as Product } from "@/app/(dashboard)/products/types/product.types";
import { getProducts } from "@/app/(dashboard)/products/actions";

export function useGlobalSearch(query: string) {
  // Ambil data 'orders' dan fungsi 'reload'
  const { orders = [], reload } = useOrderHistory(); 
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // TRIGGER RELOAD: Saat user mengetik minimal 2 karakter, 
  // kita paksa tarik data terbaru dari IndexedDB
  useEffect(() => {
    if (query.length >= 2) {
      reload(); 
    }
  }, [query, reload]);

  useEffect(() => {
    async function fetchFromPrisma() {
      setIsLoading(true);
      try {
        const data = await getProducts();
        setProducts(data as unknown as Product[]);
      } catch (err) {
        console.error("Prisma Error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFromPrisma();
  }, []);

  const results = useMemo(() => {
    if (!query || query.length < 2) return { products: [], orders: [], isLoading: false };

    const lowerQuery = query.toLowerCase().trim();

    // Filter Produk
    const filteredProducts = products
      .filter((p) => p.name?.toLowerCase().includes(lowerQuery))
      .slice(0, 5);

    // Filter Transaksi (Kita filter dari 'orders' yang sudah di-reload)
    const filteredOrders = orders
      .filter((o) => {
        const idMatch = (o.id || "").toLowerCase().includes(lowerQuery);
        const customerMatch = (o.customerName || "").toLowerCase().includes(lowerQuery);
        return idMatch || customerMatch;
      })
      .slice(0, 5);

    return {
      products: filteredProducts,
      orders: filteredOrders,
      isLoading
    };
  }, [query, orders, products, isLoading]);

  return results;
}