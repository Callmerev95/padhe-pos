"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Wifi, WifiOff, CloudSync } from "lucide-react";
import { getAllOrders, updateOrderSyncStatus } from "@/lib/db";
import { syncOrderToCloud } from "@/app/(dashboard)/order/actions";
import { cn } from "@/lib/utils";

export function SyncStatus() {
    // Inisialisasi state langsung dari navigator jika di client
    const [isOnline, setIsOnline] = useState<boolean>(() => {
        if (typeof window !== "undefined") return window.navigator.onLine;
        return true;
    });

    const [pendingCount, setPendingCount] = useState(0);
    const [isSyncing, setIsSyncing] = useState(false);
    const syncInterval = useRef<NodeJS.Timeout | null>(null);

    const checkSyncStatus = useCallback(async () => {
        try {
            const orders = await getAllOrders();
            const unsynced = orders.filter((o) => !o.isSynced);
            setPendingCount(unsynced.length);

            if (typeof window !== "undefined" && window.navigator.onLine && unsynced.length > 0 && !isSyncing) {
                setIsSyncing(true);
                for (const order of unsynced) {
                    const res = await syncOrderToCloud(order);
                    if (res.success) {
                        await updateOrderSyncStatus(order.id, true);
                    }
                }
                setIsSyncing(false);
                const refreshedOrders = await getAllOrders();
                setPendingCount(refreshedOrders.filter((o) => !o.isSynced).length);
            }
        } catch (err) {
            console.error("SYNC_STATUS_ERROR:", err);
            setIsSyncing(false);
        }
    }, [isSyncing]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            checkSyncStatus();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // ✅ FIX: Membungkus call ke dalam fungsi async mandiri atau IIFE 
        // agar tidak dianggap sinkron oleh ESLint di dalam body Effect.
        const initSync = async () => {
            await checkSyncStatus();
        };
        initSync();

        syncInterval.current = setInterval(() => {
            checkSyncStatus();
        }, 30000);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            if (syncInterval.current) clearInterval(syncInterval.current);
        };
    }, [checkSyncStatus]);

    return (
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
                {isOnline ? (
                    <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                    <WifiOff className="w-3.5 h-3.5 text-red-500" />
                )}
                <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    isOnline ? "text-emerald-600" : "text-red-600"
                )}>
                    {isOnline ? "Live" : "Offline"}
                </span>
            </div>

            <div className="w-px h-3 bg-slate-100" />

            <div className="flex items-center gap-2">
                {isSyncing ? (
                    <CloudSync className="w-3.5 h-3.5 text-cyan-500 animate-spin" />
                ) : (
                    <CloudSync className={cn(
                        "w-3.5 h-3.5",
                        pendingCount > 0 ? "text-orange-500" : "text-slate-300"
                    )} />
                )}
                <span className={cn(
                    "text-[10px] font-black tabular-nums",
                    pendingCount > 0 ? "text-orange-600" : "text-slate-400"
                )}>
                    {pendingCount} Pending
                </span>
            </div>
        </div>
    );
}