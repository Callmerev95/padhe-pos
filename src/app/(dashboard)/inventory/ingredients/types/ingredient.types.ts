/**
 * Tipe data untuk Ingredient yang muncul di UI
 * Menghindari penggunaan 'any' pada parameter fungsi
 */
export interface IngredientUI {
  id: string;
  name: string;
  category: string | null;
  stock: number;
  minStock: number;
  unitUsage: string;
  averagePrice: number;
  lastPurchasePrice: number;
  createdAt?: Date;
}

/**
 * Interface untuk input pembuatan bahan baku baru
 */
export interface CreateIngredientInput {
  name: string;
  category: string;
  unitUsage: string;
  minStock: number;
  lastPurchasePrice: number;
}

/**
 * Interface untuk transaksi restock
 */
export interface RestockInput {
  ingredientId: string;
  quantity: number;
  purchasePrice: number;
  note?: string;
}

// ... tambahkan ini di paling bawah file yang sudah ada
export interface StockLogUI {
  id: string;
  type: "IN" | "OUT" | string;
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
