"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProduct, updateProduct } from "@/app/(dashboard)/products/actions";
import { toast } from "sonner";
import type { Product } from "@/components/shared/products/types";
import { toCategoryColor } from "@/lib/category-colors";
import { ImageIcon, Package } from "lucide-react";
import Image from "next/image";

type CategoryOption = { id: string; name: string };

type CreateProductDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (product: Product) => void;
  onUpdated?: (product: Product) => void;
  initialCategories?: CategoryOption[];
  product?: Product | null;
};

export function CreateProductDialog({
  open,
  onClose,
  onCreated,
  onUpdated,
  initialCategories,
  product,
}: CreateProductDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryType, setCategoryType] = useState<"FOOD" | "DRINK">("DRINK");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const categories = initialCategories ?? [];

  const isEdit = Boolean(product);

  function resetForm() {
    setName("");
    setDescription("");
    setPrice("");
    setCategoryId("");
    setCategoryType("DRINK");
    setImageUrl("");
    setSelectedFile(null);
    setIsActive(true);
    setLoading(false);
  }

  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setDescription(product.description ?? "");
    setPrice(product.price);
    setCategoryId(product.category.id ?? "");
    
    if ('categoryType' in product) {
      setCategoryType(product.categoryType as "FOOD" | "DRINK");
    } else {
      setCategoryType("DRINK");
    }

    setImageUrl(product.imageUrl ?? "");
    setIsActive(product.isActive);
  }, [product]);

  useEffect(() => {
    if (open && !product) {
      resetForm();
    }
  }, [open, product]);

  useEffect(() => {
    return () => {
      try {
        if (imageUrl && imageUrl.startsWith("blob:")) {
          URL.revokeObjectURL(imageUrl);
        }
      } catch {
        // ignore
      }
    };
  }, [imageUrl]);

  async function onSubmit() {
    if (!name.trim()) return toast.error("Nama produk wajib diisi");
    const parsedPrice = Number(price);
    if (!parsedPrice || parsedPrice <= 0) return toast.error("Harga tidak valid");
    if (!categoryId) return toast.error("Kategori wajib dipilih");

    setLoading(true);

    try {
      let imageToSave: string | undefined = undefined;
      let generatedProductId: string | undefined = undefined;

      if (selectedFile) {
        const productId = isEdit && product ? product.id : crypto.randomUUID();
        generatedProductId = productId;

        const form = new FormData();
        form.append("file", selectedFile);
        form.append("productId", productId);

        const res = await fetch("/api/uploads/product-image", {
          method: "POST",
          body: form,
        });

        const data = await res.json();
        if (!res.ok || !data?.publicUrl) {
          throw new Error(data?.error ?? "Upload gagal");
        }

        imageToSave = data.publicUrl;
      } else if (imageUrl && !imageUrl.startsWith("blob:")) {
        imageToSave = imageUrl;
      }

      if (isEdit && product) {
        const updated = await updateProduct({
          id: product.id,
          name: name.trim(),
          description: description || undefined,
          price: parsedPrice,
          categoryId,
          categoryType: categoryType, 
          imageUrl: imageToSave,
          isActive,
        });

        const uiProduct: Product = {
          id: updated.id,
          name: updated.name,
          description: updated.description ?? "",
          sku: updated.sku ?? "-",
          price: updated.price,
          isActive: updated.isActive,
          imageUrl: updated.imageUrl ?? undefined,
          category: {
            id: updated.category.id,
            name: updated.category.name,
            color: toCategoryColor(updated.category.color),
          },
        } as Product;

        toast.success("Produk berhasil diperbarui");
        onUpdated?.(uiProduct);
        onClose();
      } else {
        const createInput = {
          name: name.trim(),
          description: description || undefined,
          price: parsedPrice,
          categoryId,
          categoryType: categoryType,
          imageUrl: imageToSave,
          isActive,
          ...(generatedProductId ? { id: generatedProductId } : {})
        };

        const created = await createProduct(createInput);

        const uiProduct: Product = {
          id: created.id,
          name: created.name,
          description: created.description ?? "",
          sku: created.sku ?? "-",
          price: created.price,
          isActive: created.isActive,
          imageUrl: created.imageUrl ?? undefined,
          category: {
            id: created.category.id,
            name: created.category.name,
            color: toCategoryColor(created.category.color),
          },
        } as Product;

        toast.success("Produk berhasil ditambahkan");
        onCreated(uiProduct);
        resetForm();
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan produk");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-[2.5rem] border-none p-8 max-w-xl shadow-2xl bg-white overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-3">
            <div className="bg-black p-2 rounded-xl text-white">
              <Package size={20} />
            </div>
            {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Produk</Label>
            <Input
              placeholder="Masukkan nama menu..."
              className="rounded-xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white transition-all font-bold text-slate-700"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deskripsi Singkat</Label>
            <Textarea
              placeholder="Ceritakan sedikit tentang menu ini..."
              className="rounded-xl border-slate-100 bg-slate-50/50 min-h-20 focus:bg-white transition-all font-medium text-slate-600"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Harga Jual
              </Label>
              {/* FIXED: Currency Prefix Container */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none border-r border-slate-200 pr-3 h-1/2">
                  <span className="text-[11px] font-black text-slate-400 group-focus-within:text-cyan-500 transition-colors uppercase tracking-tight">
                    Rp
                  </span>
                </div>
                <Input
                  type="number"
                  className="rounded-xl border-slate-100 bg-slate-50/50 h-11 pl-14 focus:bg-white font-black text-slate-800 transition-all focus:ring-2 focus:ring-cyan-500/10"
                  placeholder="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Kategori Menu</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white font-bold text-slate-700">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="font-bold text-slate-600 rounded-lg">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipe Produk</Label>
              <Select value={categoryType} onValueChange={(v) => setCategoryType(v as "FOOD" | "DRINK")}>
                <SelectTrigger className="rounded-xl border-slate-100 bg-slate-50/50 h-11 focus:bg-white font-bold text-slate-700">
                  <SelectValue placeholder="Pilih tipe" />
                </SelectTrigger>
                <SelectContent className="bg-white z-50">
                  <SelectItem value="DRINK" className="font-bold text-slate-600">Minuman (Drink)</SelectItem>
                  <SelectItem value="FOOD" className="font-bold text-slate-600">Makanan (Food)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col justify-center gap-2 px-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Visibilitas POS</Label>
              <div className="flex items-center gap-3 bg-slate-50/50 h-11 rounded-xl px-4 border border-slate-100">
                <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-cyan-500" />
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-tight">
                  {isActive ? "Menu Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Foto Produk</Label>
            <div className="flex gap-4 items-center bg-slate-50/50 p-3 rounded-2xl border border-slate-100 border-dashed hover:border-cyan-200 transition-colors">
              <div className="relative h-20 w-20 shrink-0 bg-white rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center shadow-sm">
                {imageUrl ? (
                  <Image src={imageUrl} alt="preview" fill className="object-cover" />
                ) : (
                  <ImageIcon className="text-slate-200" size={24} />
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setImageUrl(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="h-9 rounded-xl border-slate-200 text-[10px] font-black uppercase px-4 bg-white shadow-sm"
                >
                  Pilih Foto Baru
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-50">
            <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-400 h-11 px-6">
              Batal
            </Button>
            <Button
              onClick={onSubmit}
              disabled={loading}
              className="rounded-2xl bg-slate-900 hover:bg-cyan-600 text-white font-black uppercase text-[11px] px-10 h-11 shadow-xl shadow-slate-200 transition-all active:scale-95"
            >
              {loading ? "Memproses..." : isEdit ? "Simpan Perubahan" : "Tambahkan Menu"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}