"use client";

import { useState } from "react";
import { Plus, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUser } from "./actions";
import { Role } from "@prisma/client";

export function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      role: formData.get("role") as Role,
    };

    const result = await createUser(data);
    setLoading(false);
    if (result.success) {
      toast.success("Staf baru berhasil didaftarkan");
      setOpen(false);
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl gap-2 h-10 px-4 transition-all active:scale-95 shadow-lg shadow-slate-200">
          <Plus className="h-4 w-4 stroke-3" />
          Tambah Staf Baru
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
        <form action={handleSubmit}>
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-black text-2xl flex items-center gap-3 tracking-tighter uppercase">
              <UserPlus className="h-6 w-6 text-cyan-600" />
              Registrasi Staf
            </DialogTitle>
            <DialogDescription className="font-medium">Tambahkan anggota tim baru ke sistem.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</Label>
              <Input name="name" placeholder="Budi Santoso" required className="rounded-2xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-cyan-500 font-bold" />
            </div>
            <div className="grid gap-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Alamat Email</Label>
              <Input name="email" type="email" placeholder="budi@padhe.com" required className="rounded-2xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-cyan-500 font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role</Label>
                <Select name="role" defaultValue="CASHIER" required>
                  <SelectTrigger className="rounded-2xl h-12 bg-slate-50 border-none font-bold text-xs uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl p-2 border-none shadow-xl">
                    <SelectItem value="CASHIER" className="rounded-xl font-bold text-[10px] uppercase py-3">CASHIER</SelectItem>
                    <SelectItem value="ADMIN" className="rounded-xl font-bold text-[10px] uppercase py-3">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</Label>
                <Input name="password" type="password" required className="rounded-2xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-cyan-500 font-bold" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-14 font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all active:scale-95">
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Daftarkan Staf
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}