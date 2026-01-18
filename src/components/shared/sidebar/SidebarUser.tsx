import { User } from "lucide-react";
import { useAuth } from "@/context/auth-context"; // Kita ambil data langsung dari context

export function SidebarUser({ collapsed }: { collapsed: boolean }) {
  const { user, role } = useAuth(); //
  if (!user) return null; //

  return (
    <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 transition-all group cursor-pointer">      
      <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
        <User className="h-5 w-5" />
      </div>

      {!collapsed && (
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-900 truncate tracking-tight">{user.name}</p>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100 px-1.5 py-0.5 rounded">
            {role}
          </span>
        </div>
      )}
    </div>
  );
}