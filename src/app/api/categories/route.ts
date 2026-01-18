import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const { name } = await req.json();

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Nama kategori wajib diisi" },
      { status: 400 }
    );
  }

  try {
    const category = await prisma.category.create({
      data: { name },
    });

    return NextResponse.json(category);
  } catch {
    return NextResponse.json(
      { error: "Kategori sudah ada" },
      { status: 409 }
    );
  }
}
