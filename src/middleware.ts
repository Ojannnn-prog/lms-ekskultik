import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("lms_ekskul_session")?.value;
  const user = token ? await verifySessionToken(token) : null;

  // 1. Jika sudah login dan membuka /login, alirkan ke dasbor rolenya
  if (pathname.startsWith("/login") && user) {
    if (user.role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (user.role === "teacher") {
      return NextResponse.redirect(new URL("/teacher", req.url));
    }
    if (user.role === "student") {
      return NextResponse.redirect(new URL("/student", req.url));
    }
  }

  // 2. Proteksi /admin
  if (pathname.startsWith("/admin")) {
    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 3. Proteksi /teacher
  if (pathname.startsWith("/teacher")) {
    if (!user || user.role !== "teacher") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // 4. Proteksi /student
  if (pathname.startsWith("/student")) {
    if (!user || user.role !== "student") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*", "/login"],
};
