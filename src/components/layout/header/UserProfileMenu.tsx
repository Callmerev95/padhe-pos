"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { LogOut, User as UserIcon, CreditCard, Printer, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { ProfileModal } from "./ProfileModal";

export function UserProfileMenu() {
    const { user } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const defaultAvatar = "https://github.com/shadcn.png";

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/login");
    };

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 rounded-full bg-slate-100/50 p-1.5 pr-4 border border-slate-200/20 shadow-md hover:bg-white transition-all">
                <div className="relative h-9 w-9 overflow-hidden rounded-full border-2 border-white shadow-lg bg-slate-200">
                    <Image src={user?.image || defaultAvatar} alt="Avatar" fill className="object-cover" sizes="36px" />
                </div>
                <div className="text-left leading-none">
                    <p className="text-[11px] font-bold text-slate-700">{user?.name}</p>
                    <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-wider">{user?.role}</p>
                </div>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-64 p-2 bg-white border border-slate-100 shadow-2xl rounded-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-50 mb-2">
                        <p className="text-xs font-bold text-slate-800">{user?.name}</p>
                        <p className="text-[10px] text-muted-foreground">{user?.email}</p>
                    </div>
                    <div className="space-y-1">
                        <button onClick={() => { setIsOpen(false); setIsModalOpen(true); }} className="w-full flex items-center gap-3 px-3 py-2 text-[11px] text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                            <UserIcon size={15} className="text-slate-400" /> Profil Saya
                        </button>
                        <div className="py-1">
                            <p className="px-3 py-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sistem</p>
                            <Link href="/settings/payment" className="w-full flex items-center gap-3 px-3 py-2 text-[11px] text-slate-600 hover:bg-slate-50 rounded-xl">
                                <CreditCard size={15} /> Payment
                            </Link>
                            <Link href="/settings/printer" className="w-full flex items-center gap-3 px-3 py-2 text-[11px] text-slate-600 hover:bg-slate-50 rounded-xl">
                                <Printer size={15} /> Printer
                            </Link>
                        </div>
                    </div>
                    <button onClick={handleLogout}  className="w-full mt-2 pt-2 border-t border-slate-50 flex items-center gap-3 px-3 py-2 text-[11px] text-rose-500 font-bold hover:bg-rose-50 rounded-xl transition-all duration-200 group">
                        <LogOut size={15} /> Keluar
                    </button>
                </div>
            )}
            <ProfileModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
        </div>
    );
}