import { ShoppingCart } from "lucide-react";

export function CartEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
      <ShoppingCart className="h-10 w-10 mb-3 opacity-50" />
      <p className="font-medium">Keranjang masih kosong</p>
      <p className="text-sm">
        Tambahkan produk untuk memulai transaksi
      </p>
    </div>
  );
}
