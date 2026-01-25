"use client";

import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { SyncStatus } from "@/components/layout/header/SyncStatus";
import { HoldOrders } from "@/components/layout/header/HoldOrders";
import { UserProfileMenu } from "@/components/layout/header/UserProfileMenu";
import { HeaderClock } from "@/components/layout/header/HeaderClock";

export function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between bg-white/80 px-4 md:px-8 backdrop-blur-md border-b border-slate-100">
            {/* 1. SEARCH AREA: Kita batasi biar gak tabrakan sama jam di tablet */}
            <div className="flex-1 max-w-45 sm:max-w-xs lg:max-w-md transition-all duration-300">
                <GlobalSearch />
            </div>

            {/* AREA KANAN: Grouping informasi status dan waktu */}
            <div className="flex items-center gap-2 md:gap-4 ml-3">

                {/* 2. SYSTEM STATUS GROUP: Sembunyi di HP, muncul di Tablet (sm) */}
                <div className="hidden sm:flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100/50 shadow-sm shadow-slate-100/10">
                    <SyncStatus />
                    <div className="w-px h-4 bg-slate-200 mx-0.5" />
                    <HoldOrders />
                </div>

                {/* 3. JAM & TANGGAL: WAJIB MUNCUL di Tablet (md) */}
                <div className="flex shrink-0">
                    <HeaderClock />
                </div>

                {/* 4. USER PROFILE */}
                <div className="pl-2 md:pl-4 border-l border-slate-100/80">
                    <UserProfileMenu />
                </div>
            </div>
        </header>
    );
}