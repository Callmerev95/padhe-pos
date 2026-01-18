"use client";

import { Button } from "@/components/ui/button";
import { LayoutGrid, List } from "lucide-react";
import type { ProductViewMode } from "./ProductPanel";

type Props = {
  view: ProductViewMode;
  onViewChange: (v: ProductViewMode) => void;
  // onSearch dan category tetap ada di props jika memang masih dibutuhkan logic-nya di Panel
  onSearch: (v: string) => void; 
  categoryId: string | null;
  onCategoryChange: (id: string | null) => void;
};

export function ProductToolbar({
  view,
  onViewChange,
}: Props) {
  return (
    <div className="flex items-center justify-end w-full gap-2">
      {/* SEARCH LOKAL DIHAPUS agar user fokus ke Global Search di Header */}

      {/* TOGGLE VIEW TETAP ADA */}
      <div className="flex gap-1">
        <Button
          size="icon"
          variant={view === "grid" ? "default" : "outline"}
          onClick={() => onViewChange("grid")}
          className="cursor-pointer shadow-md"
        >
          <LayoutGrid className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          variant={view === "row" ? "default" : "outline"}
          onClick={() => onViewChange("row")}
          className="cursor-pointer shadow-md"
        >
          <List className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}