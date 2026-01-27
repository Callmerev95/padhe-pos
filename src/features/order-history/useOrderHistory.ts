"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay, isWithinInterval, format } from "date-fns"; // ✅ FIX: Import format ditambahkan
import * as XLSX from "xlsx";

import {
  getAllOrders,
  upsertOrdersFromCloud,
  LocalOrderSchema,
  type OrderItem,
} from "@/lib/db";
import { getOrdersFromCloud } from "@/app/(dashboard)/order/actions";

// 1. Ambil tipe data dari Zod (Otomatis include 'status') [cite: 2026-01-14]
export type OrderRecord = z.infer<typeof LocalOrderSchema>;
type OrderType = OrderRecord["orderType"];
type PaymentMethod = OrderRecord["paymentMethod"];

export function useOrderHistory(options?: { allData?: boolean }) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  // 2. Tipe data state sudah sinkron dengan OrderHeader
  const [method, setMethod] = useState<PaymentMethod | "all">("all");
  const [type, setType] = useState<OrderType | "all">("all");

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const cloudResponse = await getOrdersFromCloud();

      if (cloudResponse.success && cloudResponse.data) {
        // 3. Normalisasi data menggunakan skema Zod yang sudah di-update
        const normalizedOrders: OrderRecord[] = cloudResponse.data.map(
          (order) => ({
            id: order.id,
            createdAt:
              order.createdAt instanceof Date
                ? order.createdAt.toISOString()
                : new Date(order.createdAt).toISOString(),
            total: order.total,
            paid: order.paid,
            paymentMethod: order.paymentMethod as PaymentMethod,
            customerName: order.customerName || "Guest",
            orderType: order.orderType as OrderType,
            items: order.items as unknown as OrderItem[],
            isSynced: true,
            status: order.status || "COMPLETED", // ✅ Sudah legal di skema
          }),
        );

        await upsertOrdersFromCloud(normalizedOrders);
        setOrders(normalizedOrders);
      } else {
        const localData = await getAllOrders();
        const sorted = [...localData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setOrders(sorted);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 4. Logic status: COMPLETED adalah filter default jika bukan allData
      const isCompleted = o.status === "COMPLETED";
      if (!options?.allData && !isCompleted) return false;

      const matchesSearch =
        !search ||
        o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase());

      const matchesMethod = method === "all" || o.paymentMethod === method;
      const matchesType = type === "all" || o.orderType === type;

      let matchesDate = true;
      if (!options?.allData && dateRange?.from && dateRange?.to) {
        const orderDate = new Date(o.createdAt);
        matchesDate = isWithinInterval(orderDate, {
          start: startOfDay(dateRange.from),
          end: endOfDay(dateRange.to),
        });
      }

      return matchesSearch && matchesMethod && matchesType && matchesDate;
    });
  }, [orders, search, method, type, dateRange, options?.allData]);

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

    // ✅ FIX: Menggunakan format() dari date-fns
    const dateTag = dateRange?.from
      ? format(dateRange.from, "dd-MM-yyyy")
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
