import { type CategoryColor } from "@/lib/category-colors";

export interface CategoryUI {
  id: string;
  name: string;
  color: CategoryColor;
  createdAt: Date;
  // Kita tambahkan optional _count kalau nanti lo mau 
  // nampilin jumlah produk di tabel kategori
  _count?: {
    products: number;
  };
}

// Untuk form input
export interface CategoryFormInput {
  name: string;
  color: CategoryColor;
}