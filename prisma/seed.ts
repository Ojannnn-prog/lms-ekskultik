import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai proses seeding database LMS Ekskul TIK (Kelas 5 & 6)...");

  // Bersihkan data eksisting untuk konsistensi pengujian
  await prisma.quizAttempt.deleteMany();
  await prisma.studentProgress.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.courseResource.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.student.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.admin.deleteMany();

  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedTeacherPassword = await bcrypt.hash("pembina123", 10);
  const hashedStudentPassword = await bcrypt.hash("siswa123", 10);

  // 1. Buat akun Administrator / Koordinator Ekskul TIK
  await prisma.admin.create({
    data: {
      username: "admin",
      password: hashedAdminPassword,
      name: "Koordinator Ekskul TIK SDN 231 Sukaasih",
    },
  });

  // 2. Buat akun Pembina Ekskul TIK untuk Kelas 5 & Kelas 6
  await prisma.teacher.createMany({
    data: [
      {
        username: "pembina5",
        password: hashedTeacherPassword,
        name: "Pak Budi (Pembina Kelas 5)",
        nip: "198501012010011001",
        classGroup: "5",
        activeTitle: "Koordinator Kelas 5",
      },
      {
        username: "pembina6",
        password: hashedTeacherPassword,
        name: "Bu Siti (Pembina Kelas 6)",
        nip: "198802022015022002",
        classGroup: "6",
        activeTitle: "Koordinator Kelas 6",
      },
    ],
  });

  // 3. Buat siswa sampel Ekskul TIK (Kelas 5 & Kelas 6)
  const studentsData = [
    // Kelas 5
    {
      username: "andi5",
      password: hashedStudentPassword,
      name: "Andi Pratama",
      studentCode: "20260501",
      classGroup: "5",
      gender: "L",
      birthPlace: "Bandung",
      points: 150,
      activeTitle: "Jagoan Digital",
      unlockedTitles: ["Jagoan Digital"],
    },
    {
      username: "bella5",
      password: hashedStudentPassword,
      name: "Bella Putri",
      studentCode: "20260502",
      classGroup: "5",
      gender: "P",
      birthPlace: "Bandung",
      points: 120,
      activeTitle: "Desainer Cilik",
      unlockedTitles: ["Desainer Cilik"],
    },
    {
      username: "chiko5",
      password: hashedStudentPassword,
      name: "Chiko Saputra",
      studentCode: "20260503",
      classGroup: "5",
      gender: "L",
      birthPlace: "Cimahi",
      points: 80,
    },
    {
      username: "dina5",
      password: hashedStudentPassword,
      name: "Dina Rahma",
      studentCode: "20260504",
      classGroup: "5",
      gender: "P",
      birthPlace: "Bandung",
      points: 100,
    },
    {
      username: "erik5",
      password: hashedStudentPassword,
      name: "Erik Maulana",
      studentCode: "20260505",
      classGroup: "5",
      gender: "L",
      birthPlace: "Bandung",
      points: 60,
    },
    // Kelas 6
    {
      username: "fajar6",
      password: hashedStudentPassword,
      name: "Fajar Ramadhan",
      studentCode: "20260601",
      classGroup: "6",
      gender: "L",
      birthPlace: "Bandung",
      points: 200,
      activeTitle: "Master Coding",
      unlockedTitles: ["Master Coding", "Jagoan Digital"],
    },
    {
      username: "gita6",
      password: hashedStudentPassword,
      name: "Gita Larasati",
      studentCode: "20260602",
      classGroup: "6",
      gender: "P",
      birthPlace: "Bandung",
      points: 180,
      activeTitle: "Cyber Explorer",
      unlockedTitles: ["Cyber Explorer"],
    },
    {
      username: "hendra6",
      password: hashedStudentPassword,
      name: "Hendra Gunawan",
      studentCode: "20260603",
      classGroup: "6",
      gender: "L",
      birthPlace: "Bandung",
      points: 90,
    },
    {
      username: "ika6",
      password: hashedStudentPassword,
      name: "Ika Wulandari",
      studentCode: "20260604",
      classGroup: "6",
      gender: "P",
      birthPlace: "Garut",
      points: 110,
    },
    {
      username: "joko6",
      password: hashedStudentPassword,
      name: "Joko Anwar",
      studentCode: "20260605",
      classGroup: "6",
      gender: "L",
      birthPlace: "Bandung",
      points: 75,
    },
  ];

  for (const st of studentsData) {
    await prisma.student.create({ data: st });
  }

  // 4. Buat Pengumuman Pembuka
  await prisma.announcement.create({
    data: {
      title: "Selamat Datang di Portal LMS Ekskul TIK SDN 231 Sukaasih!",
      content:
        "Portal belajar Ekstrakurikuler TIK untuk Kelas 5 & 6 kini telah hadir. Silakan gunakan KTA Digital QR Code untuk absensi, pelajari materi dari Pembina, dan kumpulkan poin di Leaderboard!",
    },
  });

  // Catatan: Materi pelajaran (CourseResource) dikosongkan agar Admin yang menambahkan manual.

  console.log("✅ Seeding selesai! Admin: 'admin' | Pembina: 'pembina5', 'pembina6' | Siswa: 'andi5', 'fajar6' dll.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
