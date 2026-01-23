"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllOrders, type LocalOrder } from "@/lib/db";
import { DateRange } from "react-day-picker";
import { startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { getOrdersFromCloud } from "@/app/(dashboard)/order/actions";
import { upsertOrdersFromCloud, OrderItem } from "@/lib/db";
import * as XLSX from "xlsx";

// ✅ Definisikan tipe data lokal yang mendukung status agar ESLint tidak marah
interface OrderWithStatus extends LocalOrder {
  status?: string;
}

export type OrderRecord = LocalOrder;

export function useOrderHistory(options?: { allData?: boolean }) {
  // ✅ Gunakan tipe OrderWithStatus di sini
  const [orders, setOrders] = useState<OrderWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
        // Normalisasi data dengan tipe OrderWithStatus
        const normalizedOrders: OrderWithStatus[] = cloudResponse.data.map(
          (order) => ({
            id: order.id,
            createdAt: order.createdAt.toISOString(),
            total: order.total,
            paid: order.paid,
            paymentMethod: order.paymentMethod as LocalOrder["paymentMethod"],
            customerName: order.customerName || "Guest",
            orderType: order.orderType as LocalOrder["orderType"],
            items: order.items as unknown as OrderItem[],
            isSynced: true,
            status: order.status, // Sekarang legal karena ada di interface
          }),
        );

        // Kita cast ke LocalOrder[] hanya saat simpan ke DB lokal
        await upsertOrdersFromCloud(normalizedOrders as LocalOrder[]);
        setOrders(normalizedOrders);
      } else {
        const localData = await getAllOrders();
        const sorted = [...localData].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setOrders(sorted as OrderWithStatus[]);
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
      // ✅ Sekarang o.status sudah dikenali sebagai string | undefined
      const isCompleted = o.status === "COMPLETED";

      if (!options?.allData && !isCompleted) return false;

      const matchesSearch =
        !search ||
        o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        o.id.toLowerCase().includes(search.toLowerCase());

      const matchesMethod = method === "all" || o.paymentMethod === method;
      const matchesType = type === "all" || o.orderType === type;

      let matchesDate = true;
      if (!options?.allData) {
        if (dateRange?.from && dateRange?.to) {
          const orderDate = new Date(o.createdAt);
          matchesDate = isWithinInterval(orderDate, {
            start: startOfDay(dateRange.from),
            end: endOfDay(dateRange.to),
          });
        }
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
