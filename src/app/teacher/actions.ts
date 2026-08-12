"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getTodayWIBRange } from "@/lib/wib";
import { revalidatePath } from "next/cache";

async function requireTeacher() {
  const user = await getCurrentUser();
  if (!user || user.role !== "teacher") {
    throw new Error("Akses ditolak: Hanya Pembina TIK yang diizinkan");
  }
  return user;
}

// 1. DATA PROGRESS LMS UNTUK KELAS PENGAMPU
export async function getTeacherDashboardData() {
  const user = await requireTeacher();
  const classGroup = user.classGroup || "5";

  // Ambil siswa kelas pengampu
  const students = await prisma.student.findMany({
    where: { classGroup },
    orderBy: { name: "asc" },
  });

  const studentIds = students.map((s) => s.id);

  // Ambil seluruh materi LMS beserta progress siswa kelas pengampu
  const resources = await prisma.courseResource.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      studentProgress: {
        where: { studentId: { in: studentIds } },
      },
      quizAttempts: {
        where: { studentId: { in: studentIds } },
      },
    },
  });

  // Rekapitulasi progres
  const resourcesSummary = resources.map((res) => {
    const completedCount = res.studentProgress.filter((p) => p.completed).length;
    const completionRate =
      students.length > 0
        ? Math.round((completedCount / students.length) * 100)
        : 0;

    // Rata-rata skor kuis jika ada
    const totalScore = res.quizAttempts.reduce((acc, q) => acc + q.score, 0);
    const avgScore =
      res.quizAttempts.length > 0
        ? Math.round(totalScore / res.quizAttempts.length)
        : 0;

    return {
      id: res.id,
      title: res.title,
      category: res.category,
      type: res.type,
      hasQuiz: !!res.quizConfig,
      completedCount,
      totalStudents: students.length,
      completionRate,
      avgScore,
      quizAttemptsCount: res.quizAttempts.length,
    };
  });

  return {
    classGroup,
    studentsCount: students.length,
    resourcesSummary,
  };
}

// 2. ABSENSI & REKAP KELAS PENGAMPU
export async function getTeacherAttendanceData() {
  const user = await requireTeacher();
  const classGroup = user.classGroup || "5";
  const { startOfDay, endOfDay } = getTodayWIBRange();

  const students = await prisma.student.findMany({
    where: { classGroup },
    orderBy: { name: "asc" },
    include: {
      attendances: {
        where: {
          timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
    },
  });

  const list = students.map((st) => {
    const todayAtt = st.attendances[0];
    return {
      id: st.id,
      name: st.name,
      studentCode: st.studentCode,
      classGroup: st.classGroup,
      status: todayAtt ? todayAtt.status : "Belum Absen",
      attendanceId: todayAtt ? todayAtt.id : null,
    };
  });

  return { classGroup, list };
}

export async function updateStudentAttendanceManual(studentId: string, status: string) {
  const user = await requireTeacher();
  const { startOfDay, endOfDay } = getTodayWIBRange();

  const existing = await prisma.attendance.findFirst({
    where: {
      studentId,
      timestamp: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  if (existing) {
    await prisma.attendance.update({
      where: { id: existing.id },
      data: { status },
    });
  } else {
    await prisma.attendance.create({
      data: {
        studentId,
        status,
      },
    });
    // Beri poin jika status Hadir
    if (status === "Hadir") {
      await prisma.student.update({
        where: { id: studentId },
        data: { points: { increment: 10 } },
      });
    }
  }

  revalidatePath("/teacher/student");
  return { success: true };
}

// 3. LAPORAN BULANAN RESMI SDN 231 SUKAASIH (LANDSCAPE 9 KOLOM) UNTUK KELAS PENGAMPU
export async function getTeacherMonthlyReport(startMonth: number, endMonth: number, year: number) {
  const user = await requireTeacher();
  const classGroup = user.classGroup || "5";

  const students = await prisma.student.findMany({
    where: { classGroup },
    orderBy: { name: "asc" },
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

  return { success: true, classGroup, records };
}

// 4. AVATAR MAKER UNTUK GURU
export async function updateTeacherAvatarConfig(avatarConfig: string) {
  const user = await requireTeacher();
  await prisma.teacher.update({
    where: { id: user.id },
    data: { avatarConfig },
  });
  revalidatePath("/teacher/profile");
  return { success: true };
}
