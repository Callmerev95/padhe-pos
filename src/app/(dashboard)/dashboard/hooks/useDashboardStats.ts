import { useMemo } from "react";
import { Prisma } from "@prisma/client";
import { 
  OrderFromCloud, 
  FilterPeriod, 
  DashboardStats, 
  OrderItemSchema,
  OrderItem 
} from "../types/dashboard.types";

/**
 * Hook khusus untuk mengolah data mentah dari database menjadi
 * statistik yang siap ditampilkan di UI Dashboard.
 * Anti-any, Type-safe dengan Zod & Prisma.
 */
export function useDashboardStats(
  initialOrders: OrderFromCloud[], 
  filter: FilterPeriod
): DashboardStats {
  
  return useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();

    /**
     * Helper untuk memproses JSON items dari Prisma secara aman.
     * Menggunakan Prisma.JsonValue untuk kepastian tipe data.
     */
    const parseItems = (items: Prisma.JsonValue): OrderItem[] => {
      try {
        // Jika data berupa string (hasil stringify), kita parse dulu
        const parsed = typeof items === 'string' ? JSON.parse(items) : items;
        
        // Pastikan hasil parse adalah array
        if (!Array.isArray(parsed)) return [];

        // Validasi tiap item dalam array menggunakan Zod agar sesuai kontrak data
        return parsed.map(item => OrderItemSchema.parse(item));
      } catch (e) {
        // Mencatat error jika data JSON tidak sesuai dengan skema OrderItemSchema
        console.error("Gagal parsing order items atau data tidak valid:", e);
        return [];
      }
    };

    // --- 1. LOGIKA FILTER (Periode Saat Ini) ---
    const filteredOrders = initialOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      if (filter === "HARI_INI") return orderDate.toDateString() === todayStr;
      if (filter === "MINGGU_INI") {
        const lastWeek = new Date(now);
        lastWeek.setDate(now.getDate() - 7);
        return orderDate >= lastWeek && orderDate <= now;
      }
      if (filter === "BULAN_INI") {
        return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    // --- 2. LOGIKA PERIODE SEBELUMNYA (Untuk Trend Perbandingan) ---
    const getPrevPeriodStats = () => {
      const prevOrders = initialOrders.filter(o => {
        const d = new Date(o.createdAt);
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        
        if (filter === "HARI_INI") return d.toDateString() === yesterday.toDateString();
        // Logika untuk minggu/bulan sebelumnya bisa ditambahkan di sini jika perlu detail lebih lanjut
        return false;
      });

      return {
        revenue: prevOrders.reduce((sum, o) => sum + (o.total || 0), 0),
        count: prevOrders.length
      };
    };

    const prevStats = getPrevPeriodStats();

    // --- 3. PERHITUNGAN STATS UTAMA ---
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = filteredOrders.length;
    let totalFood = 0;
    let totalDrink = 0;

    // Menghitung breakdown pendapatan makanan vs minuman
    filteredOrders.forEach(order => {
      parseItems(order.items).forEach(item => {
        const sub = item.price * item.qty;
        if (item.categoryType === "FOOD") totalFood += sub;
        if (item.categoryType === "DRINK") totalDrink += sub;
      });
    });

    // Helper untuk menghitung persentase trend naik/turun
    const calculateTrend = (curr: number, prev: number): number => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const getVsLabel = () => {
      if (filter === "HARI_INI") return "vs yesterday";
      if (filter === "MINGGU_INI") return "vs last week";
      return "vs last month";
    };

    // --- 4. DATA GRAFIK (7 Hari Terakhir) ---
    const chartData = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dailyTotal = initialOrders
        .filter(o => new Date(o.createdAt).toDateString() === d.toDateString())
        .reduce((sum, o) => sum + (o.total || 0), 0);
      return { name: dayName, revenue: dailyTotal };
    });

    // --- 5. TOP PRODUCTS (Produk Terlaris) ---
    const productSales: Record<string, { name: string; qty: number }> = {};
    filteredOrders.forEach(order => {
      parseItems(order.items).forEach(item => {
        if (!productSales[item.id]) {
          productSales[item.id] = { name: item.name, qty: 0 };
        }
        productSales[item.id].qty += item.qty;
      });
    });

    return {
      activeRevenue: totalRevenue,
      activeOrders: totalOrders,
      activeFood: totalFood,
      activeDrink: totalDrink,
      revenueTrend: calculateTrend(totalRevenue, prevStats.revenue),
      orderTrend: calculateTrend(totalOrders, prevStats.count),
      vsLabel: getVsLabel(),
      chartData,
      topProducts: Object.values(productSales)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5),
      recentOrders: [...initialOrders]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(o => ({
          id: o.id,
          total: o.total,
          waktu: new Date(o.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          tanggal: new Date(o.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          customer: o.customerName || "GUEST",
          metode: o.paymentMethod || "CASH",
          tipe: (o.orderType || "").toLowerCase().includes("dine") ? "Dine In" : "Take Away"
        }))
    };
  }, [initialOrders, filter]);
}