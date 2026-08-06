"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getTodayWIBRange } from "@/lib/wib";
import { revalidatePath } from "next/cache";

async function requireStudent() {
  const user = await getCurrentUser();
  if (!user || user.role !== "student") {
    throw new Error("Akses ditolak: Hanya Siswa yang diizinkan");
  }
  return user;
}

// 1. DATA DASBOR SISWA
export async function getStudentDashboardData() {
  const user = await requireStudent();
  const { startOfDay, endOfDay } = getTodayWIBRange();

  const [student, todayAtt, announcements, totalResources, completedProgress] =
    await Promise.all([
      prisma.student.findUnique({
        where: { id: user.id },
      }),
      prisma.attendance.findFirst({
        where: {
          studentId: user.id,
          timestamp: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      }),
      prisma.announcement.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.courseResource.count(),
      prisma.studentProgress.count({
        where: {
          studentId: user.id,
          completed: true,
        },
      }),
    ]);

  if (!student) throw new Error("Akun siswa tidak ditemukan");

  return {
    student,
    todayStatus: todayAtt ? todayAtt.status : "Belum Absen",
    announcements,
    progressStats: {
      totalResources,
      completedCount: completedProgress,
      percentage:
        totalResources > 0
          ? Math.round((completedProgress / totalResources) * 100)
          : 0,
    },
  };
}

// 2. DAFTAR MATERI LMS & PROGRESS
export async function getStudentCourseList() {
  const user = await requireStudent();

  const resources = await prisma.courseResource.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      studentProgress: {
        where: { studentId: user.id },
      },
      quizAttempts: {
        where: { studentId: user.id },
        orderBy: { score: "desc" },
        take: 1,
      },
    },
  });

  return resources.map((res) => {
    const isCompleted =
      res.studentProgress.length > 0 && res.studentProgress[0].completed;
    const bestScore =
      res.quizAttempts.length > 0 ? res.quizAttempts[0].score : null;

    return {
      id: res.id,
      title: res.title,
      description: res.description,
      category: res.category,
      type: res.type,
      pointsReward: res.pointsReward,
      hasQuiz: !!res.quizConfig,
      isCompleted,
      bestScore,
      createdAt: res.createdAt,
    };
  });
}

// 3. DETAIL MATERI LMS UNTUK BELAJAR & KUIS
export async function getCourseResourceDetail(id: string) {
  const user = await requireStudent();

  const resource = await prisma.courseResource.findUnique({
    where: { id },
    include: {
      studentProgress: {
        where: { studentId: user.id },
      },
      quizAttempts: {
        where: { studentId: user.id },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!resource) throw new Error("Materi TIK tidak ditemukan");

  const isCompleted =
    resource.studentProgress.length > 0 && resource.studentProgress[0].completed;

  return {
    resource,
    isCompleted,
    attempts: resource.quizAttempts,
  };
}

// 4. SUBMIT KUIS INTERAKTIF A-D & GAMIFIKASI POIN
export async function submitQuizAttempt(resourceId: string, selectedAnswer: string) {
  const user = await requireStudent();

  const resource = await prisma.courseResource.findUnique({
    where: { id: resourceId },
  });
  if (!resource || !resource.quizConfig) {
    throw new Error("Soal kuis tidak tersedia untuk materi ini");
  }

  const quizData = JSON.parse(resource.quizConfig);
  const isCorrect = selectedAnswer === quizData.correctAnswer;
  const score = isCorrect ? 100 : 0;

  // Catat riwayat percobaan kuis
  await prisma.quizAttempt.create({
    data: {
      studentId: user.id,
      resourceId,
      score,
      passed: isCorrect,
    },
  });

  let pointsEarned = 0;
  let newTitleUnlocked: string | null = null;

  // Jika benar, catat progress sebagai selesai & beri poin
  if (isCorrect) {
    const existingProgress = await prisma.studentProgress.findUnique({
      where: {
        studentId_resourceId: {
          studentId: user.id,
          resourceId,
        },
      },
    });

    if (!existingProgress || !existingProgress.completed) {
      await prisma.studentProgress.upsert({
        where: {
          studentId_resourceId: {
            studentId: user.id,
            resourceId,
          },
        },
        update: { completed: true, completedAt: new Date() },
        create: {
          studentId: user.id,
          resourceId,
          completed: true,
          completedAt: new Date(),
        },
      });

      pointsEarned = resource.pointsReward || 25;

      // Tambahkan poin ke siswa & periksa unclock gelar baru
      const student = await prisma.student.update({
        where: { id: user.id },
        data: {
          points: { increment: pointsEarned },
        },
      });

      const unlocked = [...student.unlockedTitles];
      if (student.points >= 100 && !unlocked.includes("Desainer Cilik")) {
        unlocked.push("Desainer Cilik");
        newTitleUnlocked = "Desainer Cilik";
      }
      if (student.points >= 200 && !unlocked.includes("Master Coding")) {
        unlocked.push("Master Coding");
        newTitleUnlocked = "Master Coding";
      }
      if (student.points >= 300 && !unlocked.includes("Cyber Explorer")) {
        unlocked.push("Cyber Explorer");
        newTitleUnlocked = "Cyber Explorer";
      }
      if (student.points >= 500 && !unlocked.includes("Legenda TIK")) {
        unlocked.push("Legenda TIK");
        newTitleUnlocked = "Legenda TIK";
      }

      if (unlocked.length > student.unlockedTitles.length) {
        await prisma.student.update({
          where: { id: user.id },
          data: { unlockedTitles: unlocked },
        });
      }
    }
  }

  revalidatePath("/student/course");
  revalidatePath("/student");
  return {
    success: true,
    passed: isCorrect,
    score,
    pointsEarned,
    newTitleUnlocked,
  };
}

// 5. GAMIFIKASI: AVATAR, GELAR, DAN LEADERBOARD
export async function getGamificationData() {
  const user = await requireStudent();

  const [student, leaderboardGroup, leaderboardAll] = await Promise.all([
    prisma.student.findUnique({ where: { id: user.id } }),
    prisma.student.findMany({
      where: { classGroup: user.classGroup || "5" },
      orderBy: { points: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        username: true,
        points: true,
        activeTitle: true,
        classGroup: true,
        avatarConfig: true,
      },
    }),
    prisma.student.findMany({
      orderBy: { points: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        username: true,
        points: true,
        activeTitle: true,
        classGroup: true,
        avatarConfig: true,
      },
    }),
  ]);

  return {
    student,
    leaderboardGroup,
    leaderboardAll,
  };
}

export async function updateStudentAvatarConfig(avatarConfig: string) {
  const user = await requireStudent();
  await prisma.student.update({
    where: { id: user.id },
    data: { avatarConfig, avatarUnlocked: true },
  });
  revalidatePath("/student/gamification");
  revalidatePath("/student");
  return { success: true };
}

export async function equipStudentTitle(title: string) {
  const user = await requireStudent();
  await prisma.student.update({
    where: { id: user.id },
    data: { activeTitle: title },
  });
  revalidatePath("/student/gamification");
  revalidatePath("/student");
  return { success: true };
}

// 6. MARK MODUL SELESAI DIBACA (TANPA KUIS / MANUAL SELESAI) & BERI POIN
export async function markCourseCompleted(resourceId: string) {
  const user = await requireStudent();

  const resource = await prisma.courseResource.findUnique({
    where: { id: resourceId },
  });
  if (!resource) throw new Error("Materi TIK tidak ditemukan");

  const existingProgress = await prisma.studentProgress.findUnique({
    where: {
      studentId_resourceId: {
        studentId: user.id,
        resourceId,
      },
    },
  });

  if (existingProgress && existingProgress.completed) {
    return {
      success: true,
      alreadyCompleted: true,
      pointsEarned: 0,
      newTitleUnlocked: null,
    };
  }

  await prisma.studentProgress.upsert({
    where: {
      studentId_resourceId: {
        studentId: user.id,
        resourceId,
      },
    },
    update: { completed: true, completedAt: new Date() },
    create: {
      studentId: user.id,
      resourceId,
      completed: true,
      completedAt: new Date(),
    },
  });

  const pointsEarned = resource.pointsReward || 25;

  const student = await prisma.student.update({
    where: { id: user.id },
    data: {
      points: { increment: pointsEarned },
    },
  });

  let newTitleUnlocked: string | null = null;
  const unlocked = [...student.unlockedTitles];
  if (student.points >= 100 && !unlocked.includes("Desainer Cilik")) {
    unlocked.push("Desainer Cilik");
    newTitleUnlocked = "Desainer Cilik";
  }
  if (student.points >= 200 && !unlocked.includes("Master Coding")) {
    unlocked.push("Master Coding");
    newTitleUnlocked = "Master Coding";
  }
  if (student.points >= 300 && !unlocked.includes("Cyber Explorer")) {
    unlocked.push("Cyber Explorer");
    newTitleUnlocked = "Cyber Explorer";
  }
  if (student.points >= 500 && !unlocked.includes("Legenda TIK")) {
    unlocked.push("Legenda TIK");
    newTitleUnlocked = "Legenda TIK";
  }

  if (unlocked.length > student.unlockedTitles.length) {
    await prisma.student.update({
      where: { id: user.id },
      data: { unlockedTitles: unlocked },
    });
  }

  revalidatePath("/student/course");
  revalidatePath("/student");
  return {
    success: true,
    alreadyCompleted: false,
    pointsEarned,
    newTitleUnlocked,
  };
}
