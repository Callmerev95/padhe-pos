import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CategoryColor } from "@/lib/category-colors";
import { CATEGORY_COLOR_STYLES } from "@/lib/category-colors";

type Variant = "category" | "status";

type Props = {
  variant: Variant;
  value: string;
  color?: CategoryColor;
};

export function ProductBadge({ variant, value, color = "slate" }: Props) {
  const base = "px-3 py-1 rounded-full text-xs font-medium";

  if (variant === "status") {
    const isActive = value.toLowerCase() === "aktif" || value.toLowerCase() === "active";
    const cls = isActive
      ? "bg-emerald-100 text-emerald-800 border-transparent"
      : "bg-muted text-muted-foreground border border-border";

    return (
      <Badge variant="outline" className={cn(base, cls)}>
        {value}
      </Badge>
    );
  }

  const colorKey = color ?? ("slate" as CategoryColor);
  const styles = CATEGORY_COLOR_STYLES[colorKey];

  return (
    <Badge className={cn(base, styles.badge)}>
      <span className={cn("h-2 w-2 rounded-full mr-2 inline-block", styles.dot)} />
      {value}
    </Badge>
  );
}
