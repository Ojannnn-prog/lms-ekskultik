import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai proses seeding database LMS Ekskul TIK (Production Ready)...");

  // Bersihkan data eksisting untuk konsistensi pengujian
  await prisma.quizAttempt.deleteMany();
  await prisma.studentProgress.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.courseResource.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.admin.deleteMany();

  const hashedAdminPassword = await bcrypt.hash("231Sukaasih", 10);

  // 1. Buat akun Administrator / Koordinator Ekskul TIK
  await prisma.admin.create({
    data: {
      username: "Admin",
      password: hashedAdminPassword,
      name: "Koordinator Ekskul TIK SDN 231 Sukaasih",
    },
  });

  console.log("✅ Database berhasil dikosongkan dan siap untuk Production!");
  console.log("===============================================");
  console.log("🔑 Kredensial Admin:");
  console.log("👨‍💼 Admin    | User: Admin    | Pass: 231Sukaasih");
  console.log("===============================================");
}

main()
  .catch((e) => {
    console.error("❌ Terjadi kesalahan saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
