import type { Product } from "@/components/shared/products/types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";



type Props = {
  products: Product[];
};

export function ProductRowList({ products }: Props) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="space-y-2">
      {products.map((p) => (
        <div
          key={p.id}
          className="flex items-center justify-between rounded-lg border px-3 py-2 group transition duration-200 hover:scale-[1.02] hover:shadow-md active:scale-0.98"
        >
          <div>
            <p className="text-sm font-medium">{p.name}</p>
            <p className="text-xs text-muted-foreground">
              Rp {p.price.toLocaleString("id-ID")}
            </p>
          </div>
          <Button
            className="cursor-pointer"
            onClick={() =>
              addItem({
                productId: p.id,
                name: p.name,
                price: p.price,
                categoryType: p.categoryType,
              })
            }
          >
            <Plus size={12} />
          </Button>
        </div>
      ))}
    </div>
  );
}
