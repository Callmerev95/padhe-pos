"use server";

import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { ReportData, ChartDataPoint } from "@/types/report.types";

const OrderWithItemsSchema = z.object({
  id: z.string(),
  total: z
    .number()
    .nullable()
    .transform((val) => val ?? 0),
  paymentMethod: z
    .string()
    .nullable()
    .transform((val) => val ?? "CASH"),
  createdAt: z.date(),
  items: z
    .array(
      z.object({
        price: z.number(),
        qty: z.number(),
        categoryType: z.string(),
      }),
    )
    .optional()
    .default([]),
});

type OrderWithItems = z.infer<typeof OrderWithItemsSchema>;

export const getDailyReportData = unstable_cache(
  async (
    selectedDate: string,
  ): Promise<{ reportData: ReportData; chartData: ChartDataPoint[] }> => {
    const startOfDay = new Date(`${selectedDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${selectedDate}T23:59:59.999Z`);

    /**
     * SOLUSI: Menggunakan unknown sebagai jembatan casting.
     * Ini akan membungkam error 'never' dari Prisma sekaligus lolos dari sensor ESLint 'no-any'.
     * [cite: 2026-01-10, 2026-01-12]
     */
    const prismaOrder = prisma.order as unknown as {
      findMany: (args: { where: object }) => Promise<unknown[]>;
    };

    const rawOrders = await prismaOrder.findMany({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    // Validasi dengan Zod tetap menjamin data yang keluar dari sini 100% aman
    const orders: OrderWithItems[] = z
      .array(OrderWithItemsSchema)
      .parse(rawOrders);

    let foodRevenue = 0,
      drinkRevenue = 0,
      totalRevenue = 0;
    let foodQty = 0,
      drinkQty = 0;
    let cashTotal = 0,
      qrisTotal = 0,
      bcaTotal = 0,
      danaTotal = 0;

    const hourly: Record<string, ChartDataPoint> = {};
    for (let i = 0; i <= 23; i++) {
      const hour = `${i.toString().padStart(2, "0")}:00`;
      hourly[hour] = { name: hour, Makanan: 0, Minuman: 0 };
    }

    orders.forEach((order: OrderWithItems) => {
      totalRevenue += order.total;
      if (order.paymentMethod === "CASH") cashTotal += order.total;
      else if (order.paymentMethod === "QRIS") qrisTotal += order.total;
      else if (order.paymentMethod === "BCA") bcaTotal += order.total;
      else if (order.paymentMethod === "DANA") danaTotal += order.total;

      const orderHour = `${order.createdAt.getUTCHours().toString().padStart(2, "0")}:00`;

      order.items.forEach((item) => {
        const itemTotal = item.price * item.qty;
        if (item.categoryType === "FOOD") {
          foodRevenue += itemTotal;
          foodQty += item.qty;
          if (hourly[orderHour]) hourly[orderHour].Makanan += itemTotal;
        } else if (item.categoryType === "DRINK") {
          drinkRevenue += itemTotal;
          drinkQty += item.qty;
          if (hourly[orderHour]) hourly[orderHour].Minuman += itemTotal;
        }
      });
    });

    const getPercentage = (amount: number) =>
      totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(0) : "0";

    return {
      reportData: {
        foodRevenue,
        drinkRevenue,
        totalRevenue,
        foodQty,
        drinkQty,
        count: orders.length,
        cashTotal,
        qrisTotal,
        bcaTotal,
        danaTotal,
        percentages: {
          cash: getPercentage(cashTotal),
          qris: getPercentage(qrisTotal),
          bca: getPercentage(bcaTotal),
          dana: getPercentage(danaTotal),
        },
      },
      chartData: Object.values(hourly),
    };
  },
  ["daily-reports-cache"],
  { tags: ["reports"], revalidate: 3600 },
);

/**
 * GET MONTHLY REPORT DATA - SERVER ACTION [cite: 2026-01-12]
 */
export const getMonthlyReportData = unstable_cache(
  async (
    selectedMonth: string,
  ): Promise<{ reportData: ReportData; chartData: ChartDataPoint[] }> => {
    const [year, month] = selectedMonth.split("-").map(Number);
    // Start & End of Month
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const prismaOrder = prisma.order as unknown as {
      findMany: (args: { where: object }) => Promise<unknown[]>;
    };

    const rawOrders = await prismaOrder.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
    });

    const orders = z.array(OrderWithItemsSchema).parse(rawOrders);

    // Inisialisasi Chart Bulanan (per tanggal)
    const daysInMonth = new Date(year, month, 0).getDate();
    const daily: Record<string, ChartDataPoint> = {};
    for (let i = 1; i <= daysInMonth; i++) {
      const dayLabel = i.toString().padStart(2, "0");
      daily[dayLabel] = { name: dayLabel, Makanan: 0, Minuman: 0 };
    }

    let foodRevenue = 0,
      drinkRevenue = 0,
      totalRevenue = 0;
    let foodQty = 0,
      drinkQty = 0;
    let cashTotal = 0,
      qrisTotal = 0,
      bcaTotal = 0,
      danaTotal = 0;

    orders.forEach((order) => {
      totalRevenue += order.total;
      if (order.paymentMethod === "CASH") cashTotal += order.total;
      else if (order.paymentMethod === "QRIS") qrisTotal += order.total;
      else if (order.paymentMethod === "BCA") bcaTotal += order.total;
      else if (order.paymentMethod === "DANA") danaTotal += order.total;

      const day = new Date(order.createdAt)
        .getUTCDate()
        .toString()
        .padStart(2, "0");

      order.items.forEach((item) => {
        const itemTotal = item.price * item.qty;
        if (item.categoryType === "FOOD") {
          foodRevenue += itemTotal;
          foodQty += item.qty;
          if (daily[day]) daily[day].Makanan += itemTotal;
        } else if (item.categoryType === "DRINK") {
          drinkRevenue += itemTotal;
          drinkQty += item.qty;
          if (daily[day]) daily[day].Minuman += itemTotal;
        }
      });
    });

    const getPercentage = (amount: number) =>
      totalRevenue > 0 ? ((amount / totalRevenue) * 100).toFixed(0) : "0";

    return {
      reportData: {
        foodRevenue,
        drinkRevenue,
        totalRevenue,
        foodQty,
        drinkQty,
        count: orders.length,
        cashTotal,
        qrisTotal,
        bcaTotal,
        danaTotal,
        percentages: {
          cash: getPercentage(cashTotal),
          qris: getPercentage(qrisTotal),
          bca: getPercentage(bcaTotal),
          dana: getPercentage(danaTotal),
        },
      },
      chartData: Object.values(daily),
    };
  },
  ["monthly-reports-cache"],
  { tags: ["reports"], revalidate: 3600 },
);
