"use server";

import { prisma } from "@/lib/prisma";

export async function getPublicLeaderboard() {
  try {
    const topStudents = await prisma.student.findMany({
      where: {
        points: {
          gt: 0
        }
      },
      orderBy: { points: "desc" },
      take: 4,
      select: {
        id: true,
        name: true,
        classGroup: true,
        points: true,
        activeTitle: true,
      },
    });
    return topStudents;
  } catch (error) {
    console.error("Failed to fetch public leaderboard:", error);
    return [];
  }
}
