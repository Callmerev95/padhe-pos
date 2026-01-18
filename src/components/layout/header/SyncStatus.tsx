"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Wifi, WifiOff, CloudSync } from "lucide-react";
import { getAllOrders, markOrderAsSynced } from "@/lib/db";
import { syncOrderToCloud } from "@/app/(dashboard)/order/actions";

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

    // src/components/layout/header/SyncStatus.tsx

    return (
        <div className="relative group">
            <button
                className={`flex h-10 w-10 items-center justify-center shadow-md rounded-full transition-all duration-300 bg-white
                ${!isOnline ? "text-rose-500 shadow-rose-100" :
                        isAutoSyncing ? "text-emerald-500 shadow-emerald-100 ring-2 ring-emerald-100" :
                            pendingSync > 0 ? "text-orange-500 shadow-orange-100" : "text-emerald-500 shadow-emerald-100"}`}
            >
                {!isOnline ? (
                    <WifiOff size={18} />
                ) : isAutoSyncing ? (
                    <CloudSync size={18} className="animate-spin" />
                ) : (
                    <Wifi size={18} className={pendingSync > 0 ? "animate-pulse" : ""} />
                )}

                {/* Indikator angka data yang belum sinkron */}
                {pendingSync > 0 && isOnline && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
                        {pendingSync}
                    </span>
                )}
            </button>

            {/* Tooltip Informasi saat Hover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 hidden group-hover:block z-50">
                <div className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-xl">
                    {!isOnline ? "Koneksi Terputus" :
                        isAutoSyncing ? `Sinkronisasi ${pendingSync} data...` :
                            pendingSync > 0 ? `${pendingSync} data belum sinkron` : "Sistem Terhubung"}
                </div>
            </div>
        </div>
    );
}