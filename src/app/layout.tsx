import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NotificationProvider } from "@/providers/NotificationProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LMS Ekskul TIK SDN 231 Sukaasih",
  description:
    "Portal resmi Learning Management System (LMS) dan Absensi Ekskul TIK & Mapel KKA SDN 231 Sukaasih. Dilengkapi KTA Digital QR, Pemindai Kamera Live, & Gamifikasi Poin.",
  icons: {
    icon: "/icon.jpg",
    apple: "/icon.jpg",
  },
  openGraph: {
    title: "LMS Ekskul TIK SDN 231 Sukaasih",
    description:
      "Portal resmi LMS dan Absensi Digital SDN 231 Sukaasih. Akses KTA Digital QR, Pemindai Kamera Live, dan Gamifikasi Interaktif.",
    url: "https://lms-ekskul-tik.vercel.app", // Sesuaikan domain
    siteName: "LMS Ekskul TIK",
    images: [
      {
        url: "/thumb-absen.png", // Gambar banner mewah ketika dishare ke WA
        width: 1200,
        height: 630,
        alt: "Preview LMS Ekskul TIK",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col overflow-x-hidden w-full">
        <NotificationProvider>{children}</NotificationProvider>
      </body>
    </html>
  );
}
