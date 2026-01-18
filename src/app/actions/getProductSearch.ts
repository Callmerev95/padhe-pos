"use server";

import { prisma } from "@/lib/prisma"; // Sesuai file di gambar kamu

export async function getProductSearch() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
      },
    });
    return products;
  } catch (error) {
    console.error("Gagal ambil produk:", error);
    return [];
  }
}