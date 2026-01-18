"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { Coffee, LogOut, ChevronLeft, ChevronRight } from "lucide-react"; 
import { SIDEBAR_CONFIG } from "./sidebar.config";
import { SidebarItem } from "./SidebarItem";
import { SidebarExpandable } from "./SidebarExpandable";
import { cn } from "@/lib/utils";
import type { Role } from "@prisma/client";
import { useAuth } from "@/context/auth-context";

export function ProfilePage() {
  const { user, role } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center gap-2 px-6 py-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-xs text-muted-foreground italic">Menyiapkan profil...</span>
      </div>
    );
  }

  return (
    <div className="px-6 py-4">
      <h1 className="font-bold text-slate-800">{user.name}</h1>
      <p className="text-xs text-muted-foreground uppercase tracking-widest">Role: {role}</p>
    </div>
  );
}

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 1024px)");
    const handler = () => setIsTablet(media.matches);
    handler();
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);
  return isTablet;
}

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter(); 
  const isTablet = useIsTablet();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(isTablet);
  }, [isTablet]);

  const collapsed = isCollapsed;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const filteredSections = SIDEBAR_CONFIG
    .map((section) => {
      const filteredItems = section.items.filter((item) => {
        if (!item.roles) return true;
        return item.roles.includes(role);
      });
      return { ...section, items: filteredItems };
    })
    .filter((section) => section.items.length > 0);

  return (
    <motion.aside
      className={cn(
        "relative h-screen bg-sidebar text-foreground border-r border-sidebar-border flex flex-col transition-all duration-300",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* TOGGLE BUTTON */}
      <button
        onClick={() => setIsCollapsed(!collapsed)}
        className="absolute -right-3 top-10 z-40 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:scale-110 transition-all cursor-pointer"
      >
        {collapsed ? <ChevronRight className="h-3 w-3 text-slate-400" /> : <ChevronLeft className="h-3 w-3 text-slate-400" />}
      </button>

      {/* HEADER */}
      <div className="flex items-center gap-3 px-6 py-8 group cursor-default">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/5"
        >
          <Coffee className="h-5 w-5" />
        </motion.div>

        {!collapsed && (
          <div className="flex flex-col">
            <h1 className="text-lg font-black tracking-tight leading-none text-slate-900">Padhe Coffee</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-1 text-slate-400">Point of Sale</p>
          </div>
        )}
      </div>

      {/* NAV: Mengurangi gap dan menambah divider */}
      <nav className="flex-1 px-4 py-0 space-y-1 overflow-y-auto custom-sidebar-scroll">
        {filteredSections.map((section, index) => (
          <div 
            key={section.title} 
            className={cn(
              "space-y-1", 
              /* Menggunakan pt-4 mt-4 dan divider border-t */
              index !== 0 && "pt-4 mt-4 border-t border-slate-200"
            )}
          >
            {!collapsed && (
              <p className="text-[9px] uppercase font-black tracking-[0.25em] text-slate-300 mb-2 px-4">
                {section.title}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) =>
                item.children ? (
                  <SidebarExpandable
                    key={item.label}
                    item={item}
                    collapsed={collapsed}
                    pathname={pathname}
                  />
                ) : (
                  <SidebarItem
                    key={item.label}
                    item={item}
                    collapsed={collapsed}
                    active={pathname === item.href || pathname.startsWith(item.href + "/")}
                  />
                )
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* FOOTER: Ditambah background halus dan border top */}
      <div className="mt-auto p-4 border-t border-sidebar-border space-y-2 bg-slate-50/30">
        <button
          onClick={handleLogout}
          onMouseEnter={(e) => {
            const icon = e.currentTarget.querySelector('svg');
            const text = e.currentTarget.querySelector('span');
            if (icon) icon.style.color = '#ef4444';
            if (text) text.style.color = '#ef4444';
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            const icon = e.currentTarget.querySelector('svg');
            const text = e.currentTarget.querySelector('span');
            if (icon) icon.style.color = '';
            if (text) text.style.color = '';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          className="flex items-center w-full px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer text-muted-foreground"
        >
          <LogOut className="h-4 w-4 mr-3 transition-colors duration-300" />
          {!collapsed && (
            <span className="text-xs font-bold uppercase tracking-wider transition-colors duration-300">
              Keluar
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}