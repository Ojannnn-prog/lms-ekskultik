import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username dan password wajib diisi" }, { status: 400 });
    }

    // 1. Cek Admin
    const admin = await prisma.admin.findUnique({
      where: { username },
    });
    if (admin && (await verifyPassword(password, admin.password))) {
      const token = await createSessionToken({
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: "admin",
      });
      const response = NextResponse.json({ success: true, role: "admin" });
      response.cookies.set("lms_ekskul_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 hari
        path: "/",
      });
      return response;
    }

    // 2. Cek Teacher / Pembina TIK
    const teacher = await prisma.teacher.findUnique({
      where: { username },
    });
    if (teacher && (await verifyPassword(password, teacher.password))) {
      const token = await createSessionToken({
        id: teacher.id,
        username: teacher.username,
        name: teacher.name,
        role: "teacher",
        classGroup: teacher.classGroup,
      });
      const response = NextResponse.json({
        success: true,
        role: "teacher",
        classGroup: teacher.classGroup,
      });
      response.cookies.set("lms_ekskul_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    // 3. Cek Student / Siswa Ekskul TIK
    const student = await prisma.student.findUnique({
      where: { username },
    });
    if (student && (await verifyPassword(password, student.password))) {
      await prisma.student.update({
        where: { id: student.id },
        data: { lastActive: new Date() },
      });
      const token = await createSessionToken({
        id: student.id,
        username: student.username,
        name: student.name,
        role: "student",
        classGroup: student.classGroup,
      });
      const response = NextResponse.json({
        success: true,
        role: "student",
        classGroup: student.classGroup,
      });
      response.cookies.set("lms_ekskul_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    return NextResponse.json({ error: "Username atau password salah" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
