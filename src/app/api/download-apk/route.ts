import { NextResponse } from "next/server";

export async function GET() {
  const directApkUrl =
    "https://github.com/Ojannnn-prog/lms-ekskultik/releases/download/app-latest/EkskulTIK.apk";

  const response = NextResponse.redirect(directApkUrl, 302);
  response.headers.set(
    "Content-Disposition",
    'attachment; filename="EkskulTIK.apk"'
  );
  response.headers.set(
    "Content-Type",
    "application/vnd.android.package-archive"
  );

  return response;
}
