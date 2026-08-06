import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    if (session.role === "admin") {
      const admin = await prisma.admin.findUnique({
        where: { id: session.id },
        select: { id: true, username: true, name: true },
      });
      return NextResponse.json({
        user: { ...admin, role: "admin" },
      });
    }

    if (session.role === "teacher") {
      const teacher = await prisma.teacher.findUnique({
        where: { id: session.id },
        select: {
          id: true,
          username: true,
          name: true,
          nip: true,
          classGroup: true,
          avatarConfig: true,
          activeTitle: true,
        },
      });
      return NextResponse.json({
        user: { ...teacher, role: "teacher" },
      });
    }

    const student = await prisma.student.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        username: true,
        name: true,
        studentCode: true,
        classGroup: true,
        gender: true,
        birthPlace: true,
        points: true,
        activeTitle: true,
        unlockedTitles: true,
        avatarConfig: true,
      },
    });
    return NextResponse.json({
      user: { ...student, role: "student" },
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
