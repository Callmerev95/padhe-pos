import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/get-current-user";
import { AuthProvider } from "@/context/auth-context";
import { Sidebar } from "@/components/shared/sidebar/Sidebar";
import { ReceiptPortal } from "@/components/shared/pos/receipt/ReceiptPortasl";
import { Header } from "@/components/shared/header/Header";
// IMPORT BARU:
import { GlobalOrderDrawer } from "@/components/shared/order/GlobalOrderDrawer";

// layout.tsx
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AuthProvider user={user}>
      <div className="flex h-screen w-full overflow-hidden bg-white">
        <Sidebar role={user.role} />
        
        <main className="flex-1 relative flex flex-col min-w-0 bg-slate-50">
          <div className="shrink-0">
            <Header />
          </div>
          
          {/* FIX: Gunakan flex-1 dan min-h-0 agar children bisa menghitung tinggi dengan benar */}
          <div className="flex-1 relative overflow-y-auto p-8 flex flex-col min-h-0 custom-scrollbar">
            {children}
            <ReceiptPortal />
          </div>
        </main>

        <GlobalOrderDrawer />
      </div>
    </AuthProvider>
  );
}