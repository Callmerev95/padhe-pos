import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { getLowStockSummary } from "../inventory/ingredients/actions";
import { getDashboardProfitData } from "./actions";

export const runtime = "nodejs";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    redirect("/login");
  }

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  // Ambil data secara paralel
  const [orders, lowStockRes] = await Promise.all([
    prisma.order.findMany({
      where: {
        createdAt: { gte: last30Days }
      },
      orderBy: { createdAt: 'asc' }
    }),
    getLowStockSummary()
  ]);

  const criticalItems = lowStockRes.items || [];
  const profitAnalysis = await getDashboardProfitData();

  const profitData = profitAnalysis.success ? {
    revenue: profitAnalysis.revenue ?? 0,
    expenses: profitAnalysis.expenses ?? 0,
    grossProfit: profitAnalysis.grossProfit ?? 0,
    netProfit: profitAnalysis.netProfit ?? 0,
    margin: profitAnalysis.margin ?? 0,
  } 
  : {
    revenue: 0,
    expenses: 0,
    grossProfit: 0,
    netProfit: 0,
    margin: 0,
  }

  return (
    <DashboardClient 
      initialOrders={orders} 
      lowStockItems={criticalItems} 
      profitData={profitData}
    />
  );
}