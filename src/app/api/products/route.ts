import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const { name, price, categoryId } = await req.json();

  if (!name || !price || !categoryId) {
    return NextResponse.json(
      { error: "Data produk tidak lengkap" },
      { status: 400 }
    );
  }

  const product = await prisma.product.create({
    data: {
      name,
      price: Number(price),
      categoryId,
    },
  });

  return NextResponse.json(product);
}
