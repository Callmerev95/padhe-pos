"use client";

import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useHoldOrderStore } from "@/store/useHoldOrderStore";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";

export function HoldOrders() {
    const router = useRouter();
    const holds = useHoldOrderStore((s) => s.holds);
    const resumeHold = useHoldOrderStore((s) => s.resumeHold);
    const loadHoldToCart = useCartStore((s) => s.loadHoldToCart); 
    
    const handleRecall = (id: string) => {
        const order = resumeHold(id);
        if (order) {
            loadHoldToCart(order);
            router.push("/pos");
        }
    };

    return (
        <div className="relative group">
            <button className="relative flex h-10 w-10 items-center justify-center shadow-md rounded-full bg-slate-100/50 text-muted-foreground transition-all hover:bg-white">
                <Bell size={18} className={holds.length > 0 ? "text-orange-500 fill-orange-50" : ""} />
                {holds.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                        {holds.length}
                    </span>
                )}
            </button>
            {holds.length > 0 && (
                <div className="absolute top-full right-0 pt-2 hidden group-hover:block z-50 animate-in fade-in zoom-in duration-200">
                    <div className="w-80 p-2 bg-white border border-slate-100 shadow-2xl rounded-2xl">
                        <div className="p-3 border-b border-slate-50 mb-1">
                            <p className="font-bold text-sm text-slate-800">Daftar Antrean</p>
                        </div>
                        <div className="max-h-80 overflow-y-auto px-1">
                            {holds.map((hold) => (
                                <div key={hold.id} onClick={() => handleRecall(hold.id)} className="p-3 mb-1 hover:bg-orange-50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-orange-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-bold text-xs text-slate-700 truncate max-w-36">{hold.customerName || "Guest"}</p>
                                        <Badge variant="secondary" className="text-[9px] h-4 px-1.5 py-0">{hold.orderType}</Badge>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground truncate italic">
                                        {hold.items.map(i => `${i.qty}x ${i.name}`).join(", ")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}