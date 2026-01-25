"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { SidebarItemType } from "./sidebar.config";
import { SidebarItem } from "./SidebarItem";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Props = {
  item: SidebarItemType;
  collapsed: boolean;
  pathname: string;
};

export function SidebarExpandable({ item, collapsed, pathname }: Props) {
  const isRouteActive = item.children?.some(
    (child) => pathname.startsWith(child.href ?? "")
  );

  const [manualExpanded, setManualExpanded] = useState(false);
  const expanded = isRouteActive || manualExpanded;

  const Header = (
    <button
      onClick={() => setManualExpanded((p) => !p)}
      className={cn(
        "flex items-center rounded-2xl w-full transition-all duration-300 group", // Ganti ke rounded-2xl
        collapsed
          ? "justify-center h-11 w-11 mx-auto"
          : "px-4 py-3 gap-3 mx-2 w-[calc(100%-16px)]", // Tambah margin agar sejajar SidebarItem
        /* WARNA: Menyesuaikan Slate 900 */
        isRouteActive
          ? "text-slate-900 bg-slate-50 font-bold"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <item.icon className={cn(
        "h-5 w-5 shrink-0 transition-all duration-300",
        isRouteActive ? "text-slate-900 scale-110" : "text-slate-400 group-hover:text-slate-900 group-hover:scale-110"
      )} />

      {!collapsed && (
        <>
          <span className="flex-1 text-left text-[13px] font-bold tracking-tight">
            {item.label}
          </span>
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform duration-300 text-slate-400",
              expanded && "rotate-90 text-slate-900"
            )}
          />
        </>
      )}
    </button>
  );

  return (
    <div className="space-y-1">
      {collapsed ? (
        <Popover>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  {Header}
                </TooltipTrigger>
              </PopoverTrigger>
              <TooltipContent side="right" sideOffset={15} className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-xl border-none shadow-xl">
                {item.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <PopoverContent
            side="right"
            sideOffset={20}
            align="start"
            className="w-56 p-1.5 bg-white border border-slate-100 shadow-[0_15px_40px_rgba(0,0,0,0.08)] rounded-3xl"
          >
            <p className="px-4 py-3 text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
              {item.label}
            </p>
            <div className="space-y-0.5">
              {item.children?.map((child) => (
                <SidebarItem
                  key={child.label}
                  item={child}
                  collapsed={false}
                  active={pathname === child.href}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : (
        <>
          {Header}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                /* PREMIUM UPDATE: Indikator garis yang lebih halus sesuai mockup */
                className="ml-8 mt-1 space-y-0.5 border-l border-slate-100 pl-1 py-1"
              >
                {item.children?.map((child) => (
                  <SidebarItem
                    key={child.label}
                    item={child}
                    collapsed={false}
                    active={pathname === child.href}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}