"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, getCurrentUser } from "@/lib/auth";
import { getTodayWIBRange } from "@/lib/wib";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Akses ditolak: Hanya Administrator yang diizinkan");
  }
  return user;
}

// 1. STATISTIK ADMIN & PENGUMUMAN
export async function getAdminDashboardData() {
  await requireAdmin();
  const { startOfDay, endOfDay } = getTodayWIBRange();

  const [
    totalStudents,
    totalTeachers,
    totalResources,
    todayAttendances,
    announcements,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.courseResource.count(),
    prisma.attendance.findMany({
      where: {
        timestamp: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        student: {
          select: { name: true, studentCode: true, classGroup: true },
        },
      },
    }),
    prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const hadirCount = todayAttendances.filter((a) => a.status === "Hadir").length;
  const izinCount = todayAttendances.filter((a) => a.status === "Izin").length;
  const alphaCount = todayAttendances.filter((a) => a.status === "Alpha").length;
  const belumAbsenCount = Math.max(0, totalStudents - todayAttendances.length);

  return {
    stats: {
      totalStudents,
      totalTeachers,
      totalResources,
      hadirCount,
      izinCount,
      alphaCount,
      belumAbsenCount,
    },
    todayAttendances,
    announcements,
  };
}

export async function createAnnouncement(title: string, content: string) {
  await requireAdmin();
  await prisma.announcement.create({
    data: { title, content },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function updateAnnouncement(id: string, title: string, content: string) {
  await requireAdmin();
  await prisma.announcement.update({
    where: { id },
    data: { title, content },
  });
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteAnnouncement(id: string) {
  await requireAdmin();
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/admin");
  return { success: true };
}

// 2. KELOLA GURU / PEMBINA TIK
export async function getTeachersList() {
  await requireAdmin();
  return prisma.teacher.findMany({
    orderBy: { classGroup: "asc" },
  });
}

export async function createTeacher(data: {
  username: string;
  name: string;
  nip?: string;
  classGroup: string;
  password?: string;
}) {
  await requireAdmin();
  const hashedPassword = await hashPassword(data.password || "pembina123");
  const created = await prisma.teacher.create({
    data: {
      username: data.username,
      name: data.name,
      nip: data.nip || null,
      classGroup: data.classGroup,
      password: hashedPassword,
      activeTitle: `Koordinator Kelas ${data.classGroup}`,
    },
  });
  revalidatePath("/admin/teacher");
  return { success: true, teacher: created };
}

export async function updateTeacher(
  id: string,
  data: { name: string; nip?: string; classGroup: string }
) {
  await requireAdmin();
  const updated = await prisma.teacher.update({
    where: { id },
    data: {
      name: data.name,
      nip: data.nip || null,
      classGroup: data.classGroup,
    },
  });
  revalidatePath("/admin/teacher");
  return { success: true, teacher: updated };
}

export async function resetTeacherPassword(id: string, newPass: string) {
  await requireAdmin();
  const hashedPassword = await hashPassword(newPass);
  await prisma.teacher.update({
    where: { id },
    data: { password: hashedPassword },
  });
  revalidatePath("/admin/teacher");
  return { success: true };
}

export async function deleteTeacher(id: string) {
  await requireAdmin();
  await prisma.teacher.delete({ where: { id } });
  revalidatePath("/admin/teacher");
  return { success: true };
}

// 3. KELOLA SISWA EKSKUL TIK
export async function getStudentsList(classGroupFilter?: string) {
  await requireAdmin();
  const where = classGroupFilter && classGroupFilter !== "ALL"
    ? { classGroup: classGroupFilter }
    : {};
  return prisma.student.findMany({
    where,
    orderBy: [{ classGroup: "asc" }, { name: "asc" }],
  });
}

export async function createStudent(data: {
  username: string;
  name: string;
  studentCode: string;
  classGroup: string;
  gender: string;
  birthPlace?: string;
  password?: string;
}) {
  await requireAdmin();
  const hashedPassword = await hashPassword(data.password || "231Sukaasih");
  const created = await prisma.student.create({
    data: {
      username: data.username,
      name: data.name,
      studentCode: data.studentCode,
      classGroup: data.classGroup,
      gender: data.gender || "L",
      birthPlace: data.birthPlace || "Bandung",
      password: hashedPassword,
      activeTitle: "Jagoan Digital",
      unlockedTitles: ["Jagoan Digital"],
    },
  });
  revalidatePath("/admin/student");
  return { success: true, student: created };
}

export async function updateStudent(
  id: string,
  data: { name: string; studentCode: string; classGroup: string; gender: string; birthPlace?: string }
) {
  await requireAdmin();
  const updated = await prisma.student.update({
    where: { id },
    data: {
      name: data.name,
      studentCode: data.studentCode,
      classGroup: data.classGroup,
      gender: data.gender,
      birthPlace: data.birthPlace || null,
    },
  });
  revalidatePath("/admin/student");
  return { success: true, student: updated };
}

export async function resetStudentCredentials(id: string, newUsername?: string, newPassword?: string) {
  await requireAdmin();
  const updateData: any = {};
  if (newUsername) {
    // Check if newUsername is already taken by another student
    const existing = await prisma.student.findUnique({ where: { username: newUsername } });
    if (existing && existing.id !== id) {
      throw new Error("Username already taken by another student");
    }
    updateData.username = newUsername;
  }
  if (newPassword) {
    updateData.password = await hashPassword(newPassword);
  }
  if (Object.keys(updateData).length > 0) {
    await prisma.student.update({
      where: { id },
      data: updateData,
    });
    revalidatePath("/admin/student");
  }
  return { success: true };
}

export async function deleteStudent(id: string) {
  await requireAdmin();
  await prisma.student.delete({ where: { id } });
  revalidatePath("/admin/student");
  return { success: true };
}

export async function bulkDeleteStudents(studentIds: string[]) {
  await requireAdmin();
  await prisma.student.deleteMany({
    where: { id: { in: studentIds } },
  });
  revalidatePath("/admin/student");
  return { success: true, count: studentIds.length };
}

export async function bulkResetPassword(studentIds: string[]) {
  await requireAdmin();
  const hashedPassword = await hashPassword("231Sukaasih");
  await prisma.student.updateMany({
    where: { id: { in: studentIds } },
    data: { password: hashedPassword },
  });
  revalidatePath("/admin/student");
  return { success: true, count: studentIds.length };
}

export async function bulkMoveStudentClass(studentIds: string[], targetClassGroup: string) {
  await requireAdmin();
  await prisma.student.updateMany({
    where: { id: { in: studentIds } },
    data: { classGroup: targetClassGroup },
  });
  revalidatePath("/admin/student");
  return { success: true };
}

export async function getAdminMonthlyReport(startMonth: number, endMonth: number, year: number, classGroup: string) {
  await requireAdmin();
  
  const where = classGroup && classGroup !== "ALL" ? { classGroup } : {};
  
  const students = await prisma.student.findMany({
    where,
    orderBy: [{ classGroup: "asc" }, { name: "asc" }],
    include: {
      attendances: {
        where: {
          timestamp: {
            gte: new Date(year, startMonth - 1, 1),
            lte: new Date(year, endMonth, 0, 23, 59, 59),
          },
        },
      },
    },
  });

  const records = students.map((st, index) => {
    const hadir = st.attendances.filter((a) => a.status === "Hadir").length;
    const izin = st.attendances.filter((a) => a.status === "Izin").length;
    const alpha = st.attendances.filter((a) => a.status === "Alpha").length;
    const totalRecorded = hadir + izin + alpha;
    const percentage =
      totalRecorded > 0 ? Math.round((hadir / totalRecorded) * 100) : 0;

    return {
      no: index + 1,
      name: st.name,
      studentCode: st.studentCode,
      username: st.username,
      classGroup: st.classGroup,
      hadir,
      izin,
      alpha,
      rekap: `${hadir}/${izin}/${alpha}`,
      percentage: `${percentage}%`,
    };
  });

  return { success: true, records };
}

export async function importStudentsFromExcel(
  students: Array<{
    username: string;
    name: string;
    studentCode: string;
    classGroup: string;
    gender?: string;
    birthPlace?: string;
  }>
) {
  await requireAdmin();
  const hashedPassword = await hashPassword("231Sukaasih");
  let count = 0;
  for (const st of students) {
    await prisma.student.upsert({
      where: { studentCode: st.studentCode },
      update: {
        name: st.name,
        classGroup: st.classGroup || "5",
        gender: st.gender || "L",
        birthPlace: st.birthPlace || "Bandung",
      },
      create: {
        username: st.username || `siswa_${st.studentCode}`,
        name: st.name,
        studentCode: st.studentCode,
        classGroup: st.classGroup || "5",
        gender: st.gender || "L",
        birthPlace: st.birthPlace || "Bandung",
        password: hashedPassword,
        activeTitle: "Jagoan Digital",
        unlockedTitles: ["Jagoan Digital"],
      },
    });
    count++;
  }
  revalidatePath("/admin/student");
  return { success: true, count };
}

// 4. KELOLA MATERI BELAJAR & KUIS (LMS CORE)
export async function getCourseResourcesList() {
  await requireAdmin();
  return prisma.courseResource.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { studentProgress: true, quizAttempts: true },
      },
    },
  });
}

export async function createCourseResource(data: {
  title: string;
  description?: string;
  category: string;
  type: string; // "TEXT" | "PDF" | "VIDEO" | "LINK"
  content: string;
  fileUrl?: string;
  quizConfig?: string;
  pointsReward?: number;
}) {
  await requireAdmin();
  const created = await prisma.courseResource.create({
    data: {
      title: data.title,
      description: data.description || null,
      category: data.category || "Teknologi",
      type: data.type,
      content: data.content,
      fileUrl: data.fileUrl || null,
      quizConfig: data.quizConfig || null,
      pointsReward: data.pointsReward || 25,
    },
  });
  revalidatePath("/admin/resources");
  return { success: true, resource: created };
}

export async function updateCourseResource(
  id: string,
  data: {
    title: string;
    description?: string;
    category: string;
    type: string;
    content: string;
    fileUrl?: string;
    quizConfig?: string;
    pointsReward?: number;
  }
) {
  await requireAdmin();
  const updated = await prisma.courseResource.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description || null,
      category: data.category || "Teknologi",
      type: data.type,
      content: data.content,
      fileUrl: data.fileUrl || null,
      quizConfig: data.quizConfig || null,
      pointsReward: data.pointsReward || 25,
    },
  });
  revalidatePath("/admin/resources");
  return { success: true, resource: updated };
}

export async function deleteCourseResource(id: string) {
  await requireAdmin();
  await prisma.courseResource.delete({ where: { id } });
  revalidatePath("/admin/resources");
  return { success: true };
}

// 5. QR SCANNER ATTENDANCE (MODUL PENDUKUNG PRESENSI)
export async function scanStudentQRCodeAttendance(studentCodeOrUsername: string) {
  await requireAdmin();
  const { startOfDay, endOfDay } = getTodayWIBRange();

  // Cari siswa berdasarkan studentCode (NIS) atau username
  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { studentCode: studentCodeOrUsername },
        { username: studentCodeOrUsername },
      ],
    },
  });

  if (!student) {
    return { success: false, error: `Siswa dengan kode/NIS "${studentCodeOrUsername}" tidak ditemukan.` };
  }

  // Cek apakah sudah absen hari ini
  const existing = await prisma.attendance.findFirst({
    where: {
      studentId: student.id,
      timestamp: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  if (existing) {
    return {
      success: true,
      alreadyRecorded: true,
      student: {
        name: student.name,
        studentCode: student.studentCode,
        classGroup: student.classGroup,
        status: existing.status,
      },
    };
  }

  // Catat absensi "Hadir" dan beri poin kehadiran (+10 poin)
  const [attendance] = await prisma.$transaction([
    prisma.attendance.create({
      data: {
        studentId: student.id,
        status: "Hadir",
      },
    }),
    prisma.student.update({
      where: { id: student.id },
      data: { points: { increment: 10 } },
    }),
  ]);

  revalidatePath("/admin/scanner");
  revalidatePath("/admin");
  return {
    success: true,
    alreadyRecorded: false,
    student: {
      name: student.name,
      studentCode: student.studentCode,
      classGroup: student.classGroup,
      status: attendance.status,
    },
  };
}

// 6. LAPORAN BULANAN RESMI SDN 231 SUKAASIH (LANDSCAPE 9 KOLOM)
export async function getMonthlyReportData(month: number, year: number, classGroupFilter?: string) {
  await requireAdmin();

  // Filter siswa
  const whereStudent = classGroupFilter && classGroupFilter !== "ALL"
    ? { classGroup: classGroupFilter }
    : {};

  const students = await prisma.student.findMany({
    where: whereStudent,
    orderBy: [{ classGroup: "asc" }, { name: "asc" }],
    include: {
      attendances: {
        where: {
          timestamp: {
            gte: new Date(year, month - 1, 1),
            lte: new Date(year, month, 0, 23, 59, 59),
          },
        },
      },
    },
  });

  // Hitung jumlah hari aktif pada bulan itu (atau total kehadiran maksimal per siswa)
  const records = students.map((st, index) => {
    const hadir = st.attendances.filter((a) => a.status === "Hadir").length;
    const izin = st.attendances.filter((a) => a.status === "Izin").length;
    const alpha = st.attendances.filter((a) => a.status === "Alpha").length;
    const totalRecorded = hadir + izin + alpha;
    const percentage = totalRecorded > 0 ? Math.round((hadir / totalRecorded) * 100) : 0;

    return {
      no: index + 1,
      name: st.name,
      studentCode: st.studentCode,
      username: st.username,
      classGroup: st.classGroup,
      hadir,
      izin,
      alpha,
      rekap: `${hadir}/${izin}/${alpha}`,
      percentage: `${percentage}%`,
    };
  });

  return { success: true, records };
}
