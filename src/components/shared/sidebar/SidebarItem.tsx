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
        "relative flex items-center gap-2 rounded-2xl transition-all duration-300 group",
        collapsed
          ? "justify-center h-11 w-11 mx-auto"
          : "px-4 py-3 mx-2", // Tambah margin dikit biar gak nempel border sidebar
        
        /* PREMIUM UPDATE: Menyesuaikan dengan mockup tablet baru */
        active
          ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
          : "text-slate-500 hover:bg-slate-100/50 hover:text-slate-900"
        )}
    >
      <Icon className={cn(
        "h-5 w-5 shrink-0 transition-all duration-300",
        active ? "text-white scale-110" : "text-slate-400 group-hover:text-slate-900 group-hover:scale-110"
      )} />

      {!collapsed && (
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={cn(
            "font-bold text-[13px] tracking-tight transition-colors", // Font size disesuaikan untuk tablet
            active ? "text-white" : "text-slate-500 group-hover:text-slate-900"
          )}
        >
          {item.label}
        </motion.span>
      )}

      {/* INDIKATOR: Dibuat lebih modern sesuai mockup */}
      {active && !collapsed && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute right-3 w-1.5 h-1.5 bg-white/40 rounded-full blur-[1px]"
        />
      )}
    </motion.div>
  );

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={item.href ?? "#"} className="block py-1">{ItemContent}</Link>
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            sideOffset={15}
            className="bg-slate-900 border-none text-white font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 shadow-xl rounded-xl"
          >
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return <Link href={item.href ?? "#"} className="block py-0.5">{ItemContent}</Link>;
}