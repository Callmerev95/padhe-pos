"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { PremiumHeader } from "@/components/shared/header/PremiumHeader";
import { ChefHat, CheckCircle2, BellRing, MessageSquareQuote, Coffee, Pizza, LayoutGrid, Check, Clock } from "lucide-react";
import { type OrderItem } from "@/lib/db";
import { getKitchenOrders, updateOrderStatus, updateItemStatus } from "../order/actions";
import { toast } from "sonner";
import { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { createClient } from "@supabase/supabase-js";

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

type KitchenOrderItem = OrderItem;

interface KitchenOrder {
  id: string;
  createdAt: string;
  total: number;
  paid: number;
  paymentMethod: "CASH" | "DANA" | "BCA" | "QRIS";
  customerName: string | null;
  orderType: "Dine In" | "Take Away";
  items: KitchenOrderItem[];
  status: OrderStatus;
  isSynced: boolean;
}

type StationMode = "ALL" | "FOOD" | "DRINK";

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [station, setStation] = useState<StationMode>("ALL");

  const prevOrdersCount = useRef<number>(0);
  const isFirstLoad = useRef<boolean>(true);

  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
  }, []);

  const fetchOrders = useCallback(async () => {
    const res = await getKitchenOrders();
    if (res.success && res.data) {
      const normalized: KitchenOrder[] = res.data.map((o) => {
        const rawItems = (o.items as unknown[]) || [];
        return {
          id: o.id,
          total: o.total,
          paid: o.paid,
          createdAt: o.createdAt instanceof Date ? o.createdAt.toISOString() : String(o.createdAt),
          items: rawItems.map((item) => {
            const i = item as Record<string, unknown>;
            return {
              id: String(i.id || ""),
              name: String(i.name || ""),
              qty: Number(i.qty || 0),
              price: Number(i.price || 0),
              categoryType: (i.categoryType as "FOOD" | "DRINK") || "FOOD",
              notes: i.notes ? String(i.notes) : null,
              isDone: Boolean(i.isDone ?? false)
            };
          }),
          paymentMethod: (o.paymentMethod as KitchenOrder["paymentMethod"]) || "CASH",
          customerName: o.customerName,
          orderType: (o.orderType as KitchenOrder["orderType"]) || "Dine In",
          status: o.status as OrderStatus,
          isSynced: true,
        };
      });

      if (!isFirstLoad.current && normalized.length > prevOrdersCount.current) {
        const audio = new Audio(NOTIFICATION_SOUND);
        audio.play().catch(() => { });
        toast("Pesanan Baru!", {
          icon: <BellRing className="text-orange-500" />,
          description: "Ada pesanan masuk ke dapur bro."
        });
      }

      setOrders(normalized);
      prevOrdersCount.current = normalized.length;
      isFirstLoad.current = false;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const initFetch = async () => { if (isMounted) { await fetchOrders(); } };
    initFetch();

    const interval = setInterval(() => {
      if (isMounted) { void fetchOrders(); }
    }, 10000);

    if (!supabase) return () => { isMounted = false; clearInterval(interval); };

    const channel = supabase
      .channel("kitchen-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "Order" }, () => {
        if (isMounted) { void fetchOrders(); }
      })
      .subscribe();

    return () => {
      isMounted = false;
      clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [supabase, fetchOrders]);

  const toggleItemDone = async (orderId: string, itemIdx: number, currentStatus: boolean) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const newItems = [...order.items];
        newItems[itemIdx] = { ...newItems[itemIdx], isDone: !currentStatus };
        return { ...order, items: newItems };
      }
      return order;
    }));

    const res = await updateItemStatus(orderId, itemIdx, !currentStatus);
    if (!res.success) {
      toast.error("Gagal sinkron status item");
      fetchOrders();
    }
  };

  const handleStatusChange = async (id: string) => {
    const order = orders.find(o => o.id === id);
    if (!order) return;

    // Jika sudah bayar (COMPLETED), biarkan tetap COMPLETED. Jika belum, set ke READY.
    const targetStatus = order.status === OrderStatus.COMPLETED ? OrderStatus.COMPLETED : OrderStatus.READY;

    const res = await updateOrderStatus(id, targetStatus);
    if (res.success) {
      toast.success("Pesanan telah diselesaikan!");
      fetchOrders();
    } else {
      toast.error(res.error || "Gagal update status");
      fetchOrders();
    }
  };

  const filteredOrders = orders.filter(order => {
    if (station === "ALL") return true;
    return order.items.some(item => item.categoryType === station);
  });

  if (loading) {
    return (
      <div className="h-[calc(100vh-180px)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Menghubungkan ke Dapur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-140px)] gap-6 animate-in fade-in duration-700 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0 px-1">
        <PremiumHeader title="KITCHEN DISPLAY" subtitle="MANAJEMEN ANTRIAN REAL-TIME" icon={ChefHat} />

        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
          <button onClick={() => setStation("ALL")} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", station === "ALL" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400")}><LayoutGrid size={14} /> Semua</button>
          <button onClick={() => setStation("FOOD")} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", station === "FOOD" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400")}><Pizza size={14} /> Kitchen</button>
          <button onClick={() => setStation("DRINK")} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all", station === "DRINK" ? "bg-white text-orange-600 shadow-sm" : "text-slate-400")}><Coffee size={14} /> Barista</button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50">
            <ChefHat size={48} className="mb-4 text-slate-300" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tidak ada antrian di station ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 h-full overflow-y-auto pb-10 pr-2 custom-scrollbar">
            {filteredOrders.map((order) => (
              <div key={order.id} className={cn(
                "bg-white rounded-4xl border-2 p-5 transition-all duration-500 flex flex-col h-125 shrink-0",
                order.status === OrderStatus.PREPARING ? 'border-orange-500 ring-4 ring-orange-50 shadow-lg' : 'border-slate-100'
              )}>
                <div className="flex justify-between items-start mb-4 shrink-0">
                  <div className="flex flex-col">
                    <span className="text-[14px] font-black text-slate-800 uppercase leading-tight mb-1">{order.customerName || "Guest"}</span>
                    <span className="text-[9px] font-bold text-slate-400 tracking-widest">#{order.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase", order.status === OrderStatus.PREPARING ? 'bg-orange-500 text-white animate-pulse' : 'bg-slate-100')}>{order.status}</div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 mb-6 space-y-3 custom-scrollbar min-h-0">
                  {order.items
                    .filter(item => station === "ALL" || item.categoryType === station)
                    .map((item, idx) => {
                      const originalIdx = order.items.findIndex(i => i.id === item.id);
                      return (
                        <div
                          key={`${order.id}-${item.id}-${idx}`}
                          onClick={() => toggleItemDone(order.id, originalIdx, item.isDone)}
                          className={cn(
                            "flex flex-col p-3 rounded-xl border transition-all cursor-pointer select-none",
                            item.isDone ? "bg-green-50 border-green-200 opacity-60" : "bg-slate-50 border-slate-100 hover:border-slate-300"
                          )}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className={cn("w-4 h-4 rounded border flex items-center justify-center", item.isDone ? "bg-green-500 border-green-500" : "bg-white border-slate-300")}>
                                {item.isDone && <Check size={10} className="text-white" />}
                              </div>
                              <span className={cn("text-[11px] font-black uppercase", item.isDone ? "text-green-700 line-through" : "text-slate-700")}>
                                {item.qty}x {item.name}
                              </span>
                            </div>
                            {item.categoryType === "FOOD" ? <Pizza size={14} className="text-slate-300" /> : <Coffee size={14} className="text-slate-300" />}
                          </div>

                          {item.notes && (
                            <div className="mt-2 flex items-start gap-1.5 bg-orange-100/60 p-2 rounded-lg border border-orange-200">
                              <MessageSquareQuote size={12} className="text-orange-600 mt-0.5" />
                              <span className="text-[10px] text-orange-700 font-extrabold italic uppercase">&quot;{item.notes}&quot;</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* AREA BUTTON DINAMIS */}
                <div className="flex gap-2 shrink-0 mt-auto">
                  {(() => {
                    const stationItems = order.items.filter(item => station === "ALL" || item.categoryType === station);
                    const allItemsDone = stationItems.length > 0 && stationItems.every(i => i.isDone);

                    const isFinalized = order.status === OrderStatus.READY || (order.status === OrderStatus.COMPLETED && allItemsDone && !order.items.some(i => !i.isDone));

                    if (isFinalized) {
                      return (
                        <div className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-slate-200">
                          <CheckCircle2 size={18} className="text-green-500" /> Pesanan Selesai
                        </div>
                      );
                    }

                    if (allItemsDone) {
                      return (
                        <button
                          onClick={() => handleStatusChange(order.id)}
                          className="flex-1 bg-green-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-md animate-in zoom-in duration-300"
                        >
                          <CheckCircle2 size={18} /> Tandai Siap Saji
                        </button>
                      );
                    }

                    return (
                      <div className="flex-1 bg-orange-50 text-orange-400 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-orange-100 border-dashed">
                        <Clock size={18} /> Selesaikan Item
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}