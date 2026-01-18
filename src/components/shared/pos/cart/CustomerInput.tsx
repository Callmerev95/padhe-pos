import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/useCartStore";

export function CustomerInput() {
  const customerName = useCartStore((s) => s.customerName);
  const setCustomerName = useCartStore((s) => s.setCustomerName);

  return (
    <div className="mt-4">
      <label className="text-sm text-muted-foreground">
        Nama Pelanggan
      </label>

      <Input
        placeholder="Masukan nama..."
        value={customerName}
        onChange={(e) => {
          setCustomerName(e.target.value);
        }}
      />
    </div>
  );
}