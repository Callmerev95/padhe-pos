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
        "flex items-center rounded-xl w-full transition-all group",
        collapsed
          ? "justify-center h-11 w-11 mx-auto"
          : "px-4 py-3 gap-3",
        /* WARNA: Mengikuti tema Figma (Hitam/Abu-abu) */
        isRouteActive
          ? "text-primary bg-accent/50 font-bold"
          : "text-muted-foreground hover:bg-accent hover:text-primary"
      )}
    >
      <item.icon className={cn(
        "h-5 w-5 shrink-0 transition-colors",
        isRouteActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
      )} />

      {!collapsed && (
        <>
          <span className="flex-1 text-left text-sm font-bold tracking-tight">
            {item.label}
          </span>
          <ChevronRight
            className={cn(
              "h-4 w-4 transition-transform opacity-50",
              expanded && "rotate-90 opacity-100"
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
              <TooltipContent side="right" className="bg-primary text-white font-bold text-[10px] uppercase">
                {item.label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <PopoverContent
            side="right"
            align="start"
            className="w-56 p-2 bg-white border border-sidebar-border shadow-xl rounded-2xl"
          >
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {item.label}
            </p>
            <div className="space-y-1">
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
                /* PREMIUM UPDATE: Garis indikator yang lebih elegan */
                className="ml-6.5 mt-1 space-y-1 border-l-2 border-slate-100 pl-2 py-1"            >
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