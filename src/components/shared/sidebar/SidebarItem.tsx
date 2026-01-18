"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { SidebarItemType } from "./sidebar.config";

type Props = {
  item: SidebarItemType;
  collapsed: boolean;
  active: boolean;
};

export function SidebarItem({ item, collapsed, active }: Props) {
  const Icon = item.icon;

  const ItemContent = (
    <motion.div
      whileHover={{ x: collapsed ? 0 : 4 }}
      className={cn(
        "relative flex items-center gap-2 rounded-2xl transition-all duration-200 group",
        collapsed
          ? "justify-center h-11 w-11 mx-auto"
          : "px-4 py-3",
        /* PREMIUM UPDATE: Glassmorphism & Shadow Glow */
        active
          //? "bg-primary text-white shadow-[0_10px_20px_-5px_rgba(3,2,19,0.3)] ring-1 ring-white/10" 
          //: "text-muted-foreground hover:bg-accent/70 hover:text-primary"
          ? "bg-slate-900 text-white shadow-xl shadow-black/10" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
        )}
    >
      <Icon className={cn(
        //"h-5 w-5 shrink-0 transition-all duration-300 group-hover:scale-110",
        "h-5 w-5 shrink-0 transition-transform duration-200",
        //active ? "text-white" : "text-muted-foreground group-hover:text-primary"
        active ? "text-white scale-105" : "text-slate-400 group-hover:text-slate-900"
      )} />

      {!collapsed && (
        <span className={cn(
          "font-bold text-sm tracking-tight transition-colors",
          //active ? "text-white" : "text-muted-foreground group-hover:text-primary"
          active ? "text-white" : "text-slate-500 group-hover:text-slate-900"
        )}>
          {item.label}
        </span>
      )}

      {/* INDIKATOR: Lebih subtle dengan efek glow putih */}
      {active && !collapsed && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"
        />
      )}
    </motion.div>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={item.href ?? "#"}>{ItemContent}</Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-slate-900 border-none text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 shadow-xl">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <Link href={item.href ?? "#"}>{ItemContent}</Link>;
}