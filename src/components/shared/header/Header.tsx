"use client";

import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { SyncStatus } from "@/components/layout/header/SyncStatus";
import { HoldOrders } from "@/components/layout/header/HoldOrders";
import { UserProfileMenu } from "@/components/layout/header/UserProfileMenu";

export function Header() {
    return (
        <header className="sticky top-0 z-40 flex h-20 w-full items-center justify-between bg-white/80 px-8 backdrop-blur-md border-b border-slate-100">
            <div className="w-full max-w-md">
                <GlobalSearch />
            </div>

            <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                    <SyncStatus />
                    <HoldOrders />
                </div>
                <UserProfileMenu />
            </div>
        </header>
    );
}