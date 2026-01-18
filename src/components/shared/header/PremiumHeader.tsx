"use client";

import { LucideIcon } from "lucide-react";

interface PremiumHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
}

export function PremiumHeader({ icon: Icon, title, subtitle, actions }: PremiumHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
            <Icon size={20} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase italic">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
          <p className="text-slate-500 text-[10px] font-bold tracking-[0.2em] uppercase">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {actions}
      </div>
    </div>
  );
}