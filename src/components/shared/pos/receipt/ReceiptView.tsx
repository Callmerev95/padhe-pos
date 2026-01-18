import type { ReceiptSnapshot } from "@/store/receipt.types";

type Props = {
  receipt: ReceiptSnapshot;
};

export function ReceiptView({ receipt }: Props) {
  // Hitung total kuantitas seluruh item
  const totalQty = receipt.items.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="print-receipt hidden print:block text-[12px] font-mono leading-tight w-[58mm]">
      {/* HEADER */}
      <Center>
        <Bold className="text-sm">PADHE COFFEE</Bold>
        <div className="text-[10px]">Jl. Gunung Setia No. 99, Brang Biji, Sumbawa</div>
      </Center>

      <Divider />

      <div className="space-y-0.5">
        <Line label="Order" value={`#${receipt.orderId}`} />
        <Line
          label="Waktu"
          value={new Date(receipt.createdAt).toLocaleString("id-ID")}
        />
        <Line label="Kasir" value={receipt.cashierName} />

        {receipt.customerName && (
          <Line label="Pelanggan" value={receipt.customerName} />
        )}

        <Line
          label="Tipe"
          value={receipt.orderType}
        />
        <Line label="Metode" value={receipt.paymentMethod} />
      </div>

      <Divider />

      {/* ITEMS */}
      <Row bold>
        <span>QTY</span>
        <span>ITEM</span>
        <span className="text-right">AMT</span>
      </Row>

      <div className="mt-1">
        {receipt.items.map((item, idx) => (
          <Row key={idx}>
            <span>{item.qty}</span>
            <span>{item.name}</span>
            <span className="text-right">
              {(item.qty * item.price).toLocaleString("id-ID")}
            </span>
          </Row>
        ))}
      </div>

      {/* TOTAL QTY - Menambahkan info sesuai request gambar ke-3 */}
      <div className="mt-2 text-[10px] italic">
        Total Item: {totalQty}
      </div>

      <Divider />

      {/* TOTAL SECTION */}
      <div className="space-y-0.5">
        <TwoCol label="Subtotal" value={receipt.subtotal} />
        <TwoCol label="Pajak" value={receipt.tax} />
      </div>

      <Divider />

      <TwoCol label="TOTAL" value={receipt.total} bold />

      {receipt.paymentMethod === "CASH" && (
        <div className="mt-1">
          <TwoCol label="Tunai" value={receipt.paid} />
          <TwoCol
            label="Kembali"
            value={receipt.change ?? 0}
          />
        </div>
      )}

      <Divider />

      <Center>
        <div className="text-[11px]">Terima kasih ☕</div>
        <div className="text-[11px]">Sampai jumpa lagi</div>
      </Center>
    </div>
  );
}

/* ================= HELPERS ================= */

function Divider() {
  return <div className="my-2 border-b border-dashed border-black w-full" />;
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="shrink-0">{label}</span>
      <span className="text-right truncate">{value}</span>
    </div>
  );
}

function Row({ children, bold }: { children: React.ReactNode; bold?: boolean }) {
  return (
    <div
      className={`grid grid-cols-[25px_1fr_auto] gap-1 ${
        bold ? "font-bold" : "font-normal"
      }`}
    >
      {children}
    </div>
  );
}

function TwoCol({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold text-sm" : "font-normal"}`}>
      <span>{label}</span>
      <span>{value.toLocaleString("id-ID")}</span>
    </div>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="text-center mb-1">{children}</div>;
}

function Bold({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`font-bold ${className}`}>{children}</div>;
}