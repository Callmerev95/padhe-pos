"use client";

import { motion } from "motion/react";
import { z } from "zod";
import { LocalOrderSchema } from "@/lib/db";
import { OrderBadge } from "./OrderBadges";
import { useOrderStore } from "@/store/useOrderStore"; 
import { cn } from "@/lib/utils";

type OrderRecord = z.infer<typeof LocalOrderSchema>;

interface Props {
  order: OrderRecord;
}

export function OrderRow({ order }: Props) {
  const openOrder = useOrderStore((s) => s.openOrder);
  const selectedOrderId = useOrderStore((s) => s.selectedOrderId);
  
  const isSelected = selectedOrderId === order.id;

  return (
    <motion.tr
      layout
      whileHover="hover"
      initial="initial"
      className={cn(
        "group cursor-pointer transition-all duration-500 relative border-b border-slate-50",
        "hover:z-20 hover:bg-white hover:shadow-[0_0_25px_rgba(34,211,238,0.15),0_10px_15px_-3px_rgba(0,0,0,0.05)]",
        isSelected 
          ? "bg-cyan-50/60 z-10 shadow-[0_0_20px_rgba(34,211,238,0.1)]" 
          : "bg-white"
      )}
      onClick={() => openOrder(order.id)}
    >
      <td className="p-0 w-1 relative overflow-hidden">
        <div className={cn(
          "absolute inset-y-0 left-0 w-1 bg-cyan-500 transition-transform duration-500 origin-center",
          isSelected ? "scale-y-100" : "scale-y-0 group-hover:scale-y-100"
        )} />
      </td>

      <td className="px-6 py-5 text-[11px] text-slate-500 font-bold uppercase tracking-tight group-hover:text-cyan-600 transition-colors">
        {new Date(order.createdAt).toLocaleString("id-ID", {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
        })}
      </td>

      <td className="px-6 py-5 font-black text-slate-700 text-[11px] uppercase tracking-tight group-hover:text-cyan-600 transition-colors">
        {order.customerName || "WALK-IN CUSTOMER"}
      </td>

      <td className="px-6 py-5">
        <motion.div variants={{ hover: { scale: 1.12 } }} className="inline-block origin-left">
          <OrderBadge type="type" value={order.orderType} />
        </motion.div>
      </td>

      <td className="px-6 py-5">
        <motion.div variants={{ hover: { scale: 1.12 } }} className="inline-block origin-left">
          <OrderBadge type="method" value={order.paymentMethod} />
        </motion.div>
      </td>

      <td className="px-6 py-5 text-right font-black text-slate-900 text-[13px] tracking-tight group-hover:text-cyan-600 transition-colors">
        Rp {order.total.toLocaleString("id-ID")}
      </td>
    </motion.tr>
  );
}