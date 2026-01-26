import { getStockLogs } from "../actions";
import HistoryClient from "./HistoryClient";
import { StockLogUI } from "../types/ingredient.types";

export default async function HistoryPage() {
  const result = await getStockLogs();

  // Pastikan data di-cast ke interface yang benar, bukan any
  const logs = (result.success && result.data ? result.data : []) as StockLogUI[];

  return <HistoryClient logs={logs} />;
}