"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const printerSchema = z.object({
  name: z.string().min(1, "Nama printer wajib diisi"),
  paperSize: z.number(),
  header: z.string().min(1, "Header/Nama Cafe wajib diisi"),
  address: z.string().optional(),
  footer: z.string().optional(),
});

type PrinterInput = z.infer<typeof printerSchema>;

export async function savePrinterSettings(data: PrinterInput) {
  try {
    const validated = printerSchema.parse(data);

    await prisma.printer.upsert({
      where: { id: "default_printer" },
      update: validated,
      create: {
        id: "default_printer",
        ...validated,
      },
    });

    revalidatePath("/settings/printer");
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError)
      return { success: false, error: error.issues[0].message };
    return { success: false, error: "Gagal menyimpan pengaturan" };
  }
}

export async function getPrinterSettings() {
  try {
    const data = await prisma.printer.findUnique({
      where: { id: "default_printer" },
    });
    return { success: true, data };
  } catch {
    return { success: false, error: "Gagal mengambil data printer" };
  }
}
