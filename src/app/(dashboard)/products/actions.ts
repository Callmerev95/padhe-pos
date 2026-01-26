"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { ProductFormSchema, ProductFormInput } from "./types/product.types";

/* =========================
   TYPES & SCHEMAS
========================= */

/**
 * Tipe data Product yang menyertakan relasi Category.
 * Digunakan secara internal untuk komunikasi dengan Prisma.
 */
export type ProductWithCategory = Prisma.ProductGetPayload<{
  include: {
    category: true;
  };
}>;

/* =========================
   HELPERS
========================= */

/**
 * Generate SKU unik berdasarkan nama produk.
 * Ditambah timestamp & random number untuk meminimalisir duplikasi.
 */
function generateSKU(name: string): string {
  const prefix = name
    .slice(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  const timestamp = Date.now().toString().slice(-4);
  const random = Math.floor(100 + Math.random() * 900);
  
  return `${prefix}-${timestamp}${random}`;
}

/* =========================
   SERVER ACTIONS
========================= */

/**
 * Mengambil semua produk beserta kategorinya.
 */
export async function getProducts(): Promise<ProductWithCategory[]> {
  try {
    return await prisma.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("GET_PRODUCTS_ERROR:", error);
    return [];
  }
}

/**
 * Membuat produk baru.
 * Input divalidasi menggunakan Zod untuk menjamin integritas data.
 */
export async function createProduct(rawInput: ProductFormInput): Promise<ProductWithCategory> {
  // Validasi input di sisi server
  const validated = ProductFormSchema.parse(rawInput);
  const sku = generateSKU(validated.name);
  
  const product = await prisma.product.create({
    data: {
      name: validated.name,
      description: validated.description ?? null,
      price: validated.price,
      sku: sku,
      categoryId: validated.categoryId,
      categoryType: validated.categoryType,
      imageUrl: validated.imageUrl ?? null,
      isActive: validated.isActive ?? true,
    },
    include: {
      category: true,
    },
  });

  revalidatePath("/(dashboard)/products", "page");
  return product;
}

/**
 * Memperbarui data produk yang sudah ada.
 */
export async function updateProduct(rawInput: ProductFormInput): Promise<ProductWithCategory> {
  // Pastikan ID ada untuk proses update
  if (!rawInput.id) throw new Error("ID Produk diperlukan untuk update");

  const validated = ProductFormSchema.parse(rawInput);

  const product = await prisma.product.update({
    where: { id: validated.id },
    data: {
      name: validated.name,
      description: validated.description ?? null,
      price: validated.price,
      categoryId: validated.categoryId,
      categoryType: validated.categoryType,
      imageUrl: validated.imageUrl ?? null,
      isActive: validated.isActive,
    },
    include: {
      category: true,
    },
  });

  revalidatePath("/(dashboard)/products", "page");
  return product;
}

/**
 * Menonaktifkan produk (Soft Deactivate).
 */
export async function deactivateProduct(id: string): Promise<ProductWithCategory> {
  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
    include: {
      category: true,
    },
  });

  revalidatePath("/(dashboard)/products", "page");
  return product;
}