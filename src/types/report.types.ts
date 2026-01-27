/**
 * Kontrak data global untuk semua jenis laporan (Daily/Monthly)
 * Mencegah error 'any' dan memastikan konsistensi data [cite: 2026-01-10]
 */
export interface ReportData {
  foodRevenue: number;
  drinkRevenue: number;
  totalRevenue: number;
  foodQty: number;
  drinkQty: number;
  count: number;
  cashTotal: number;
  qrisTotal: number;
  bcaTotal: number;
  danaTotal: number;
  percentages: {
    cash: string;
    qris: string;
    bca: string;
    dana: string;
  };
}

export interface ChartDataPoint {
  name: string;
  Makanan: number;
  Minuman: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  categoryType: "FOOD" | "DRINK";
}

export interface ReportData {
  foodRevenue: number;
  drinkRevenue: number;
  totalRevenue: number;
  foodQty: number;
  drinkQty: number;
  count: number;
  cashTotal: number;
  qrisTotal: number;
  bcaTotal: number;
  danaTotal: number;
  percentages: {
    cash: string;
    qris: string;
    bca: string;
    dana: string;
  };
}

export interface ChartDataPoint {
  name: string;
  Makanan: number;
  Minuman: number;
}
