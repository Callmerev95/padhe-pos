"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Wifi, WifiOff, CloudSync } from "lucide-react";
import { getAllOrders, markOrderAsSynced } from "@/lib/db";
import { syncOrderToCloud } from "@/app/(dashboard)/order/actions";
import { cn } from "@/lib/utils";

export function SyncStatus() {
    const [isOnline, setIsOnline] = useState(true);
    const [pendingSync, setPendingSync] = useState(0);
    const [isAutoSyncing, setIsAutoSyncing] = useState(false);
    const syncLock = useRef(false);

    const checkPendingData = useCallback(async () => {
        try {
            const orders = await getAllOrders();
            const unsynced = orders.filter(o => o.isSynced === false || o.isSynced === undefined);
            setPendingSync(unsynced.length);
            return unsynced;
        } catch { return []; }
    }, []);

    const handleAutoSync = useCallback(async () => {
        if (syncLock.current || !navigator.onLine) return;
        const unsyncedData = await checkPendingData();
        if (unsyncedData.length === 0) return;

        try {
            syncLock.current = true;
            setIsAutoSyncing(true);
            for (const order of unsyncedData) {
                try {
                    await syncOrderToCloud({ ...order, customerName: order.customerName ?? "Guest" });
                    await markOrderAsSynced(order.id);
                } catch (err) { console.error("Sync error:", err); }
            }
        } finally {
            await checkPendingData();
            setIsAutoSyncing(false);
            syncLock.current = false;
        }
    }, [checkPendingData]);

    useEffect(() => {
        setIsOnline(navigator.onLine);
        const handleOnline = () => { setIsOnline(true); handleAutoSync(); };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
        const intervalId = setInterval(() => { if (navigator.onLine) handleAutoSync(); }, 10000);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
            clearInterval(intervalId);
        };
    }, [handleAutoSync]);

    return (
        <div className="relative group">
            {/* BUTTON: Disesuaikan dengan gaya grouping header tablet */}
            <button
                className={cn(
                    "relative p-2 rounded-xl transition-all duration-300 shadow-sm shadow-transparent hover:shadow-slate-200",
                    !isOnline ? "text-rose-500 bg-rose-50" :
                        isAutoSyncing ? "text-emerald-500 bg-emerald-50" :
                            pendingSync > 0 ? "text-orange-500 bg-orange-50" : "text-emerald-500 hover:bg-white"
                )}
            >
                {!isOnline ? (
                    <WifiOff size={20} />
                ) : isAutoSyncing ? (
                    <CloudSync size={20} className="animate-spin" />
                ) : (
                    <Wifi size={20} className={pendingSync > 0 ? "animate-pulse" : ""} />
                )}

                {/* DOT INDIKATOR: Sesuai style notifikasi Bell */}
                {pendingSync > 0 && isOnline && (
                    <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 border-2 border-slate-50"></span>
                    </span>
                )}
            </button>

            {/* TOOLTIP: Perbaikan area hover agar tidak terputus */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="bg-slate-900 text-white px-3 py-1.5 rounded-xl whitespace-nowrap shadow-2xl border border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className={cn("h-1.5 w-1.5 rounded-full", isOnline ? "bg-emerald-500" : "bg-rose-500")} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                            {!isOnline ? "Offline Mode" :
                                isAutoSyncing ? `Syncing ${pendingSync} orders...` :
                                    pendingSync > 0 ? `${pendingSync} Pending Sync` : "Cloud Connected"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}