import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("⏳ Sedang menyemai data user...");
  
  const adminPassword = await bcrypt.hash("admin123", 10);
  const cashierPassword = await bcrypt.hash("kasir123", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Admin",
        email: "admin@coffee.com",
        password: adminPassword,
        role: "ADMIN",
        image: null,
      },
      {
        name: "Kasir",
        email: "kasir@coffee.com",
        password: cashierPassword,
        role: "CASHIER",
        image: null,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed user admin & kasir berhasil");
}

main()
  .catch((e: Error) => {
    console.error("❌ Gagal seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });