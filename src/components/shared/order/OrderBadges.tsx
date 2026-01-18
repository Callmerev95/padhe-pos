import { Badge } from "@/components/ui/badge";

type Props = {
  type: "method" | "type";
  value: string;
};

export function OrderBadge({ type, value }: Props) {
  const map: Record<string, string> = {
    // METODE (Model Solid - Teks Putih)
    CASH: "bg-emerald-600 text-white border-none",   // Hijau Tua Solid
    QRIS: "bg-purple-600 text-white border-none",   // Ungu Solid
    BCA: "bg-indigo-600 text-white border-none",    // Biru Navy Solid
    DANA: "bg-sky-500 text-white border-none",      // Biru Cerah Solid
    
    // TIPE (Model Soft - Ada DOT)
    // Dibedakan dari CASH dengan menggunakan warna Mint yang lebih muda dan lembut
    DINE_IN: "bg-green-50 text-green-700 border-green-200", 
    TAKE_AWAY: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const normalizedKey = value.toUpperCase().replace(/\s+/g, "_");

  const formatDisplay = (val: string) => {
    if (type === "method") return val.toUpperCase();
    return val
      .replace("_", " ")
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Logika untuk menentukan apakah ini metode pembayaran (solid) atau tipe (soft)
  const isMethod = type === "method";

  return (
    <Badge
      variant="secondary"
      className={`
        gap-2 font-bold px-3 py-1 shadow-sm transition-all
        ${map[normalizedKey] ?? "bg-gray-100 text-gray-700"}
        ${isMethod ? "rounded-md" : "rounded-full"} 
      `}
    >
      {/* DOT hanya muncul untuk Tipe Pesanan (Dine In / Take Away) */}
      {!isMethod && (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      )}
      
      <span className={isMethod ? "tracking-wider" : ""}>
        {formatDisplay(value)}
      </span>
    </Badge>
  );
}