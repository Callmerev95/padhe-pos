import { getStockLogs } from "../actions";
import HistoryClient from "./HistoryClient";

// Definisikan interface yang sesuai dengan data dari StockLog
interface StockLogItem {
  id: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  quantity: number;
  previousStock: number;
  currentStock: number;
  note: string | null;
  createdAt: Date;
  ingredient: {
    name: string;
    unitUsage: string;
  };
}

interface PageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function StockHistoryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const selectedDate = params.date ? new Date(params.date) : new Date();

  const response = await getStockLogs({
    startDate: selectedDate,
    endDate: selectedDate
  });
  
  // FIX: Casting menggunakan interface StockLogItem[], bukan 'any'
  const logs = (response.data as unknown as StockLogItem[]) || [];

  return <HistoryClient initialLogs={logs} />;
}