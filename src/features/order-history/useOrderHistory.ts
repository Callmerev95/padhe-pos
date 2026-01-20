"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllOrders, type LocalOrder } from "@/lib/db";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { getOrdersFromCloud } from "@/app/(dashboard)/order/actions";
import { upsertOrdersFromCloud, OrderItem } from "@/lib/db";
import * as XLSX from "xlsx";

export type OrderRecord = LocalOrder;

export function useOrderHistory(options?: { allData?: boolean }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Filter State
  const [search, setSearch] = useState("");
  
  const [method, setMethod] = useState<string>("all");
  const [type, setType] = useState<string>("all");

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const cloudResponse = await getOrdersFromCloud();
      
      if (cloudResponse.success && cloudResponse.data) {
        // Normalisasi data: Konversi dari Prisma (Date) ke Lokal (String)
        const normalizedOrders: LocalOrder[] = cloudResponse.data.map((order) => ({
          id: order.id,
          createdAt: order.createdAt.toISOString(), 
          total: order.total,
          paid: order.paid,
          paymentMethod: order.paymentMethod as LocalOrder["paymentMethod"],
          customerName: order.customerName || "Guest",
          orderType: order.orderType as LocalOrder["orderType"],
          // Sekarang OrderItem sudah dikenali karena sudah di-import
          items: order.items as unknown as OrderItem[],
          isSynced: true,
        }));
  
        await upsertOrdersFromCloud(normalizedOrders);
      }
  
      const localData = await getAllOrders();
      const sorted = [...localData].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sorted);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  }, []); // Pastikan loadOrders ada di dependency array

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Logika Filter
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !search ||
        o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase());

      // FIX: Cek kondisi "all" (huruf kecil)
      const matchesMethod = method === "all" || o.paymentMethod === method;

      // FIX: Bandingkan langsung tanpa toUpperCase agar "Dine In" (dengan spasi) bisa terbaca benar
      const matchesType = type === "all" || o.orderType === type;

      // Filter berdasarkan rentang tanggal
      let matchesDate = true;
      if (!options?.allData) {
        if (dateRange?.from && dateRange?.to) {
          const orderDate = new Date(o.createdAt);
          matchesDate = isWithinInterval(orderDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          });
        } else if (dateRange?.from) {
          const orderDate = new Date(o.createdAt);
          matchesDate =
            orderDate.toDateString() === dateRange.from.toDateString();
        }
      }

      return matchesSearch && matchesMethod && matchesType && matchesDate;
    });
  }, [orders, search, method, type, dateRange, options?.allData]);

  // Fungsi Export tetap sama...
  const onExport = useCallback(() => {
    if (filteredOrders.length === 0) {
      alert("Tidak ada data untuk di-export pada rentang tanggal ini.");
      return;
    }

    const excelData = filteredOrders.map((o) => ({
      "ID Transaksi": o.id,
      Waktu: new Date(o.createdAt).toLocaleString("id-ID"),
      Customer: o.customerName || "Guest",
      Tipe: o.orderType,
      Metode: o.paymentMethod,
      Total: o.total,
      Bayar: o.paid || o.total,
      Kembalian: (o.paid || o.total) - o.total,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Riwayat Transaksi");

    const dateTag = dateRange?.from
      ? new Date(dateRange.from).toLocaleDateString("id-ID").replace(/\//g, "-")
      : "all";
    XLSX.writeFile(workbook, `Laporan_POS_Padhe_${dateTag}.xlsx`);
  }, [filteredOrders, dateRange]);

  return {
    orders: filteredOrders,
    loading,
    reload: loadOrders,
    search,
    setSearch,
    method,
    setMethod,
    type,
    setType,
    dateRange,
    setDateRange,
    onExport,
    selectedOrderId,
    setSelectedOrderId,
  };
}
