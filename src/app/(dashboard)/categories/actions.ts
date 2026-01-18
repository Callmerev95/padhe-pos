"use server";

import { prisma } from "@/lib/prisma";
import type { CategoryColor } from "@/lib/category-colors";
import { revalidatePath } from "next/cache";

/* ======================
   QUERY
====================== */
export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/* ======================
   MUTATIONS
====================== */
export async function createCategory(name: string, color: CategoryColor = "slate") {
  if (!name.trim()) {
    throw new Error("Nama kategori wajib diisi");
  }

  await prisma.category.create({
    data: { name, color },
  });

  revalidatePath("/categories");
  return { success: true };
}

export async function updateCategory(id: string, name: string, color?: CategoryColor) {
  if (!name.trim()) {
    throw new Error("Nama kategori wajib diisi");
  }

  const data: { name: string; color?: CategoryColor } = { name };
  if (color) data.color = color;

  await prisma.category.update({
    where: { id },
    data,
  });

  revalidatePath("/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({
    where: { id },
  });

  revalidatePath("/categories");
  return { success: true };
}
