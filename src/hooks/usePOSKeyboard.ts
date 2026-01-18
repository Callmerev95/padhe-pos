"use client";

import { useEffect } from "react";

type Options = {
  onFocusSearch?: () => void;
  onAddItem?: () => void;
  onOpenPayment?: () => void;
  onIncreaseQty?: () => void;
  onDecreaseQty?: () => void;
  onRemoveItem?: () => void;
};

export function usePOSKeyboard(opts: Options) {
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const target = e.target as HTMLElement;

      // ❌ Jangan ganggu input / textarea
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // 🔍 Focus Search
      if (e.key === "/") {
        e.preventDefault();
        opts.onFocusSearch?.();
      }

      // ➕ Add product
      if (e.key === "Enter") {
        opts.onAddItem?.();
      }

      // ➕➖ Cart control
      if (e.key === "+") {
        opts.onIncreaseQty?.();
      }

      if (e.key === "-") {
        opts.onDecreaseQty?.();
      }

      if (e.key === "Backspace") {
        opts.onRemoveItem?.();
      }

      // 💳 Open payment
      if (e.ctrlKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        opts.onOpenPayment?.();
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [opts]);
}
