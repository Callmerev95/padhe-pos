"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/* =========================
   TYPES
========================= */
// Product dengan relasi Category
export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: {
    category: true;
  };
}>;

/* =========================
   CREATE
========================= */
// Buat produk baru
export async function createProduct(input: {
  id?: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryType: "FOOD" | "DRINK";
  imageUrl?: string;
  isActive: boolean;
}): Promise<ProductWithCategory> {
  const sku = generateSKU(input.name);
  
  // Simpan produk ke database
  const product = await prisma.product.create({
    data: {
      ...(input.id ? { id: input.id } : {}),
      name: input.name,
      description: input.description,
      price: input.price,
      sku,
      categoryId: input.categoryId,
      categoryType: input.categoryType,
      imageUrl: input.imageUrl,
      isActive: input.isActive,
    },
    include: {
      category: true,
    },
  });

  return product;
}

/* =========================
   GET ALL
========================= */
// Ambil semua produk dengan kategori
export async function getProducts(): Promise<ProductWithCategory[]> {
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products;
}

/* =========================
   UPDATE
========================= */
// Perbarui produk yang ada
export async function updateProduct(input: {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  categoryType: "FOOD" | "DRINK";
  imageUrl?: string;
  isActive: boolean;
}): Promise<ProductWithCategory> {
  const product = await prisma.product.update({
    where: { id: input.id },
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      categoryId: input.categoryId,
      categoryType: input.categoryType,
      imageUrl: input.imageUrl,
      isActive: input.isActive,
    },
    include: {
      category: true,
    },
  });

  return product;
}

/* =========================
   DEACTIVATE
========================= */
// Non-aktifkan produk
export async function deactivateProduct(
  id: string
): Promise<ProductWithCategory> {
  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: {
      category: true,
    },
  });

  return product;
}

/* =========================
   HELPERS
========================= */
// Generate SKU unik berdasarkan nama produk
function generateSKU(name: string) {
  const prefix = name
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  const random = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${random}`;
}
