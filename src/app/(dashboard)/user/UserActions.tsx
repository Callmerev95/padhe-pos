"use client";

import { useState } from "react";
import { MoreHorizontal, Edit, Trash2, Loader2, UserCog, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteUser, updateUser } from "./actions";
import { User, Role } from "@prisma/client";

interface UserActionsProps {
  user: User;
}

export function UserActions({ user }: UserActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEdit(formData: FormData) {
    setLoading(true);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as Role,
      password: formData.get("password") as string,
    };

    const result = await updateUser(user.id, data);
    setLoading(false);

    if (result.success) {
      toast.success(data.password ? "Profil & Password berhasil diupdate" : "Profil berhasil diperbarui");
      setShowEditDialog(false);
    } else {
      toast.error(result.error || "Gagal memperbarui profil");
    }
  }

  async function handleDelete() {
    setLoading(true);
    const result = await deleteUser(user.id);
    setLoading(false);
    if (result.success) {
      toast.success("Akses staf berhasil dicabut");
      setShowDeleteDialog(false);
    } else {
      toast.error(result.error || "Gagal menghapus");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full transition-all">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-3xl border-white/60 bg-white/80 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] p-2 min-w-45 animate-in fade-in zoom-in duration-200">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)} className="flex items-center gap-3 py-3 px-4 text-[11px] font-black uppercase tracking-tight text-cyan-600 focus:text-cyan-700 focus:bg-cyan-50/80 cursor-pointer rounded-2xl transition-all duration-300">
            <Edit className="h-4 w-4 stroke-3" />
            Edit Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="flex items-center gap-3 py-3 px-4 text-[11px] font-black uppercase tracking-tight text-red-500 focus:text-red-600 focus:bg-red-50/80 cursor-pointer rounded-2xl transition-all duration-300">
            <Trash2 className="h-4 w-4 stroke-3" />
            Hapus Akses
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-none shadow-2xl">
          <form action={handleEdit}>
            <DialogHeader className="space-y-1">
              <DialogTitle className="font-black text-2xl flex items-center gap-3 tracking-tighter uppercase">
                <UserCog className="h-6 w-6 text-cyan-600" />
                Update Staf
              </DialogTitle>
              <DialogDescription className="font-medium text-slate-500 italic">
                ID: {user.id.substring(0, 8)}...
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-6">
              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap</Label>
                <Input name="name" defaultValue={user.name || ""} required className="rounded-2xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-cyan-500 font-bold px-5" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role Akses</Label>
                  <Select name="role" defaultValue={user.role}>
                    <SelectTrigger className="rounded-2xl h-12 bg-slate-50 border-none font-bold text-[11px] uppercase px-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                      <SelectItem value="CASHIER" className="rounded-xl font-bold text-[10px] uppercase py-3 cursor-pointer">CASHIER</SelectItem>
                      <SelectItem value="ADMIN" className="rounded-xl font-bold text-[10px] uppercase py-3 cursor-pointer">ADMIN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-rose-400 ml-1 flex items-center gap-1">
                    <ShieldAlert size={10} /> Password Baru
                  </Label>
                  <Input name="password" type="password" placeholder="Kosongkan jika tetap" className="rounded-2xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-rose-400 font-bold px-5 text-xs placeholder:font-normal" />
                </div>
              </div>

              <div className="grid gap-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Aktif</Label>
                <Input name="email" type="email" defaultValue={user.email} required className="rounded-2xl h-12 bg-slate-50 border-none focus:ring-2 focus:ring-cyan-500 font-bold px-5" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-14 font-black uppercase tracking-widest shadow-xl transition-all active:scale-95">
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-[2.5rem] border-none shadow-2xl p-8 bg-white/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-black text-2xl text-red-600 tracking-tight uppercase">Cabut Akses Staf?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              Akun <strong>{user.name}</strong> akan dihapus permanen dari sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="rounded-2xl border-slate-200 font-bold h-12">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} className="bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold h-12 px-8 shadow-lg shadow-red-200" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ya, Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}