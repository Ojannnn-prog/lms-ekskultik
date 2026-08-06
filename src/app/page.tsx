"use client";

import React from "react";
import Link from "next/link";
import {
  QrCode,
  Award,
  ArrowRight,
  Monitor,
  ChevronRight,
  Heart,
  Zap,
  Users,
  CheckCircle2,
  ExternalLink,
  FileText,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default function MasterLandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#222222] font-sans selection:bg-[#ff385c] selection:text-white overflow-x-hidden">
      {/* NAVBAR LANDING PAGE */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#dddddd] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#ff385c] flex items-center justify-center text-white font-black text-base sm:text-xl shadow-md shrink-0">
              TIK
            </div>
            <div className="min-w-0">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#ff385c] block truncate">
                SDN 231 SUKAASIH
              </span>
              <span className="text-xs sm:text-base font-extrabold tracking-tight text-[#222222] block truncate">
                LMS EKSTRAKURIKULER
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-sm font-semibold text-[#6a6a6a]">
            <a
              href="#pendaftaran-ekskul"
              className="hover:text-[#ff385c] transition-colors"
            >
              Pendaftaran
            </a>
            <a
              href="#generator-kta"
              className="hover:text-[#ff385c] transition-colors"
            >
              Generator KTA
            </a>
            <a
              href="#lms-kka"
              className="hover:text-[#2563eb] transition-colors"
            >
              Absensi KKA
            </a>
            <a
              href="#kta-digital"
              className="hover:text-[#222222] transition-colors"
            >
              KTA & Scanner
            </a>
            <a
              href="#gamifikasi"
              className="hover:text-[#222222] transition-colors"
            >
              Gamifikasi & Gelar
            </a>
            <a
              href="#pembina"
              className="hover:text-[#222222] transition-colors"
            >
              Kelas 5 & 6
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/login"
              className="bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs sm:text-sm font-extrabold px-4 py-2 sm:px-6 sm:py-2.5 rounded-full transition-all airbnb-shadow-sm hover:airbnb-shadow flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              <span>Masuk ke Portal</span>
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO MEWAH AIRBNB STYLE */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-[#fff8f6] via-white to-white border-b border-[#ebebeb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8 animate-fadeIn">
            {/* Judul Utama Megah Tanpa Lencana Tulisan */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#222222] tracking-tight leading-snug sm:leading-tight">
              Belajar TIK Lebih Mudah, Seru, dan{" "}
              <span className="text-[#ff385c] block sm:inline mt-1 sm:mt-0 underline decoration-[#ff385c]/30 decoration-wavy">
                100% Terdigitalisasi
              </span>
            </h1>

            <p className="text-sm sm:text-lg text-[#6a6a6a] max-w-2xl mx-auto leading-relaxed px-2">
              Selamat datang di portal Learning Management System (LMS) resmi
              Ekstrakurikuler TIK SDN 231 Sukaasih. Dilengkapi KTA Digital QR
              Code, Pemindai Kamera Live, serta Gamifikasi Poin Pembelajaran.
            </p>

            {/* Tombol CTA dihilangkan karena redundan dengan tombol di tiap section */}

            {/* Fitur Highlights Floating */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 pt-8 max-w-3xl mx-auto px-2">
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ebebeb] airbnb-shadow-sm">
                <p className="text-lg sm:text-2xl font-black text-[#ff385c]">
                  KTA QR
                </p>
                <p className="text-[11px] sm:text-xs font-semibold text-[#6a6a6a]">
                  Presensi Sekejap
                </p>
              </div>
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ebebeb] airbnb-shadow-sm">
                <p className="text-lg sm:text-2xl font-black text-[#222222]">
                  Web Scanner
                </p>
                <p className="text-[11px] sm:text-xs font-semibold text-[#6a6a6a]">
                  Kamera Browser
                </p>
              </div>
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ebebeb] airbnb-shadow-sm">
                <p className="text-lg sm:text-2xl font-black text-[#ff385c]">
                  Gamifikasi
                </p>
                <p className="text-[11px] sm:text-xs font-semibold text-[#6a6a6a]">
                  Poin & Gelar
                </p>
              </div>
              <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#ebebeb] airbnb-shadow-sm">
                <p className="text-lg sm:text-2xl font-black text-[#222222]">
                  100% Online
                </p>
                <p className="text-[11px] sm:text-xs font-semibold text-[#6a6a6a]">
                  Akses Dimana Saja
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION MANDIRI 1: FORMULIR PENDAFTARAN RESMI EKSTRAKURIKULER TIK */}
      <section
        id="pendaftaran-ekskul"
        className="py-16 sm:py-24 bg-white border-b border-[#ebebeb] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* THUMBNAIL PENDAFTARAN (KIRI) */}
            <div className="lg:col-span-7">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#ff385c] via-[#ff5a79] to-[#ff385c] rounded-3xl blur-2xl opacity-15 group-hover:opacity-30 transition duration-700" />
                <div className="relative bg-white p-2.5 sm:p-4 rounded-3xl border-2 border-[#dddddd] group-hover:border-[#ff385c]/60 airbnb-shadow-md hover:airbnb-shadow transition-all duration-500 overflow-hidden">
                  <img
                    src="/thumb-pendaftaran.png"
                    alt="Thumbnail Pendaftaran Ekstrakurikuler TIK SDN 231 Sukaasih"
                    className="w-full h-auto rounded-2xl object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md px-3 py-2 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl border border-[#ebebeb] shadow-lg flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#fff8f6] flex items-center justify-center text-[#ff385c] font-black text-xs sm:text-sm border border-[#ff385c]/20 shrink-0">
                        01
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#ff385c] truncate">
                          PORTAL RESMI
                        </p>
                        <p className="text-xs sm:text-sm font-black text-[#222222] truncate">
                          Formulir Pendaftaran Online
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#ff385c] text-white text-[9px] sm:text-xs font-extrabold px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-sm shrink-0">
                      Kelas 5 & 6
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* KONTEN PENDAFTARAN (KANAN) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#fff8f6] text-[#ff385c] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-[#ff385c]/20">
                <Sparkles className="w-3.5 h-3.5" />
                <span>PENDAFTARAN ANGGOTA BARU</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#222222] tracking-tight leading-tight">
                Siapkan Dirimu Jadi Jagoan TIK Masa Depan!
              </h2>

              <p className="text-sm sm:text-base text-[#6a6a6a] leading-relaxed">
                Platform pendaftaran online resmi Ekstrakurikuler Teknologi
                Informasi & Komunikasi (TIK) SDN 231 Sukaasih. Tanpa perlu
                membuat akun terlebih dahulu, mari bergabung belajar bersama
                dan dapatkan informasi kegiatanmu langsung via WhatsApp!
              </p>

              {/* DAFTAR KEUNGGULAN */}
              <div className="space-y-3 pt-2">
                {[
                  "Kurikulum Coding Visual (Scratch) & Desain Grafis",
                  "Akses Portal Belajar LMS & Kuis Interaktif Berpoin",
                  "Terbuka untuk Seluruh Siswa Kelas 5 & Kelas 6",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#fff8f6] flex items-center justify-center text-[#ff385c] shrink-0 border border-[#ff385c]/20">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-[#222222]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* TOMBOL CTA KHUSUS PENDAFTARAN */}
              <div className="pt-4">
                <a
                  href="https://form-daftar-ekskultik.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#ff385c] hover:bg-[#e00b41] text-white font-black text-base px-8 py-5 rounded-2xl transition-all airbnb-shadow hover:airbnb-shadow cursor-pointer group"
                >
                  <span>Daftar Sekarang Tanpa Login</span>
                  <ExternalLink className="w-5 h-5 group-hover:translate-x-1 sm:group-hover:translate-y-[-2px] transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION MANDIRI 2: GENERATOR KARTU TANDA ANGGOTA (KTA) TIK RESMI */}
      <section
        id="generator-kta"
        className="py-16 sm:py-24 bg-gradient-to-b from-[#fffaf3] via-[#fffdf9] to-white border-b border-[#ebebeb] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* KONTEN GENERATOR KTA (KIRI) */}
            <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-[#222222] text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                <CreditCard className="w-3.5 h-3.5 text-[#ff385c]" />
                <span>KADIGI x KKA • LAYANAN MANDIRI</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#222222] tracking-tight leading-tight">
                Generator Kartu Tanda Anggota (KTA) Resmi
              </h2>

              <p className="text-sm sm:text-base text-[#6a6a6a] leading-relaxed">
                Buat Kartu Tanda Anggota Ekstrakurikuler secara mandiri dengan
                desain <strong className="text-[#222222]">Modern Retro</strong> &
                unduh langsung dalam resolusi tinggi standar siap cetak
                (CR-80 / 85.6 × 54 mm).
              </p>

              {/* DAFTAR KEUNGGULAN KTA */}
              <div className="space-y-3 pt-2">
                {[
                  "Desain Modern Retro KaDigi x KKA SDN 231 Sukaasih",
                  "Format Standar Kartu Cetak Resolusi Tinggi (CR-80)",
                  "Akses Mandiri, Cepat, Gratis & Tanpa Login",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#222222] flex items-center justify-center text-white shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-[#ff385c]" />
                    </div>
                    <span className="text-sm font-bold text-[#222222]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* TOMBOL CTA KHUSUS GENERATOR KTA */}
              <div className="pt-4">
                <a
                  href="https://form-kta-ekskul.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#222222] hover:bg-black text-white font-black text-base px-8 py-5 rounded-2xl transition-all airbnb-shadow hover:airbnb-shadow cursor-pointer group"
                >
                  <span>Buat Kartu KTA Saya Sekarang</span>
                  <ExternalLink className="w-5 h-5 group-hover:translate-x-1 sm:group-hover:translate-y-[-2px] transition-transform" />
                </a>
              </div>
            </div>

            {/* THUMBNAIL GENERATOR KTA (KANAN) */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#222222] via-[#666666] to-[#ff385c] rounded-3xl blur-2xl opacity-15 group-hover:opacity-30 transition duration-700" />
                <div className="relative bg-white p-2.5 sm:p-4 rounded-3xl border-2 border-[#dddddd] group-hover:border-[#222222]/80 airbnb-shadow-md hover:airbnb-shadow transition-all duration-500 overflow-hidden">
                  <img
                    src="/thumb-kta.png"
                    alt="Thumbnail Generator KTA Ekstrakurikuler TIK SDN 231 Sukaasih"
                    className="w-full h-auto rounded-2xl object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-6 sm:left-6 sm:right-6 bg-[#222222]/95 backdrop-blur-md px-3 py-2 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl border border-white/10 shadow-lg flex items-center justify-between gap-2 text-white">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-white/10 flex items-center justify-center text-[#ff385c] font-black text-xs sm:text-sm border border-white/10 shrink-0">
                        02
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest text-white/70 truncate">
                          KARTU ANGGOTA
                        </p>
                        <p className="text-xs sm:text-sm font-black text-white truncate">
                          KaDigi x KKA Official
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#ff385c] text-white text-[9px] sm:text-xs font-extrabold px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-sm shrink-0">
                      CR-80 High-Res
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION MANDIRI 3: PORTAL ABSENSI & LMS KKA (KODING & KECERDASAN ARTIFISIAL) */}
      <section
        id="lms-kka"
        className="py-16 sm:py-24 bg-gradient-to-b from-[#f0f7ff] via-[#f8fbff] to-white border-b border-[#ebebeb] overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* THUMBNAIL ABSENSI LMS KKA (KIRI) */}
            <div className="lg:col-span-7">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-[#2563eb] via-[#3b82f6] to-[#60a5fa] rounded-3xl blur-2xl opacity-15 group-hover:opacity-30 transition duration-700" />
                <div className="relative bg-white p-2.5 sm:p-4 rounded-3xl border-2 border-[#dddddd] group-hover:border-[#2563eb]/60 airbnb-shadow-md hover:airbnb-shadow transition-all duration-500 overflow-hidden">
                  <img
                    src="/thumb-absen.png"
                    alt="Thumbnail Portal Absensi & LMS KKA Ekstrakurikuler TIK SDN 231 Sukaasih"
                    className="w-full h-auto rounded-2xl object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-6 sm:left-6 sm:right-6 bg-white/95 backdrop-blur-md px-3 py-2 sm:px-5 sm:py-4 rounded-xl sm:rounded-2xl border border-[#ebebeb] shadow-lg flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div className="w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb] font-black text-xs sm:text-sm border border-[#2563eb]/20 shrink-0">
                        03
                      </div>
                      <div className="min-w-0">
                        <p className="text-[8px] sm:text-[10px] font-extrabold uppercase tracking-widest text-[#2563eb] truncate">
                          ABSENSI & LMS
                        </p>
                        <p className="text-xs sm:text-sm font-black text-[#222222] truncate">
                          Koding & Kecerdasan Artifisial
                        </p>
                      </div>
                    </div>
                    <span className="bg-[#2563eb] text-white text-[9px] sm:text-xs font-extrabold px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full shadow-sm shrink-0">
                      QR Code Real-time
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* KONTEN ABSENSI LMS KKA (KANAN) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#eff6ff] text-[#2563eb] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-[#2563eb]/20">
                <QrCode className="w-3.5 h-3.5" />
                <span>MAPEL KKA FASE C • ABSENSI DIGITAL</span>
              </div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#222222] tracking-tight leading-tight">
                Portal Absensi & LMS Koding & AI
              </h2>

              <p className="text-sm sm:text-base text-[#6a6a6a] leading-relaxed">
                Aplikasi resmi Learning Management System (LMS) dan Absensi
                Mata Pelajaran{" "}
                <strong className="text-[#222222]">
                  (Mapel) Koding & Kecerdasan Artifisial (KKA) Fase C
                </strong>{" "}
                SDN 231 Sukaasih. Pindai KTA Digital QR Code kamu untuk mencatat
                kehadiran secara{" "}
                <em className="not-italic font-semibold text-[#2563eb]">
                  real-time
                </em>
                , pantau papan pengumuman terbaru, dan kejar posisi teratas di
                Leaderboard Siswa Terajin!
              </p>


              {/* DAFTAR KEUNGGULAN ABSENSI & LMS KKA */}
              <div className="space-y-3 pt-2">
                {[
                  "Presensi Real-time Cepat dengan Pemindaian QR Code",
                  "Papan Pengumuman Interaktif & Kustomisasi Avatar Pass",
                  "Leaderboard Siswa Terajin & Gamifikasi Poin Kehadiran",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#eff6ff] flex items-center justify-center text-[#2563eb] shrink-0 border border-[#2563eb]/20">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-[#222222]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* TOMBOL CTA KHUSUS ABSENSI & LMS KKA */}
              <div className="pt-4">
                <a
                  href="https://absen-sd.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black text-base px-8 py-5 rounded-2xl transition-all airbnb-shadow hover:airbnb-shadow cursor-pointer group"
                >
                  <span>Buka Aplikasi Absensi & LMS KKA</span>
                  <ExternalLink className="w-5 h-5 group-hover:translate-x-1 sm:group-hover:translate-y-[-2px] transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ALUR KTA DIGITAL QR CODE & WEB SCANNER KAMERA */}
      <section id="kta-digital" className="py-24 bg-[#f7f7f7] border-b border-[#ebebeb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#ff385c] block mb-2">
              TEKNOLOGI PRESENSI DIGITAL
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#222222]">
              Presensi Sekejap dengan KTA QR Code & Kamera
            </h2>
            <p className="text-sm sm:text-base text-[#6a6a6a] mt-2">
              Tidak ada lagi absensi kertas manual. Siswa cukup menunjukkan KTA
              Digital untuk dipindai oleh kamera peramban Pembina TIK.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Buka KTA Digital QR di Dasbor",
                desc: "Siswa masuk ke portal dan membuka kartu tanda anggota (KTA) dengan QR Code dinamis yang terenkripsi dan unik.",
                icon: <QrCode className="w-8 h-8 text-[#ff385c]" />,
              },
              {
                step: "02",
                title: "Scan di Kamera Live Scanner",
                desc: "Koordinator/Pembina mengarahkan kamera ponsel, tablet, atau webcam laptop ke QR Code KTA siswa.",
                icon: <Monitor className="w-8 h-8 text-[#ff385c]" />,
              },
              {
                step: "03",
                title: "Audio Beep & +10 Poin Kehadiran",
                desc: "Sistem berbunyi Beep otomatis, kehadiran tercatat dalam zona waktu WIB (Asia/Jakarta), dan siswa mendapat +10 Poin.",
                icon: <Award className="w-8 h-8 text-[#ff385c]" />,
              },
            ].map((st) => (
              <div
                key={st.step}
                className="bg-white border border-[#dddddd] rounded-2xl p-8 airbnb-shadow-sm flex flex-col justify-between relative overflow-hidden"
              >
                <div>
                  <span className="text-4xl font-black text-[#ff385c]/20 absolute top-6 right-6">
                    {st.step}
                  </span>
                  <div className="w-16 h-16 rounded-2xl bg-[#fff8f6] border border-[#ff385c]/20 flex items-center justify-center mb-6">
                    {st.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[#222222] mb-2">
                    {st.title}
                  </h3>
                  <p className="text-sm text-[#6a6a6a] leading-relaxed">
                    {st.desc}
                  </p>
                </div>
                <div className="mt-8 pt-4 border-t border-[#ebebeb] flex items-center justify-between text-xs font-bold text-[#ff385c]">
                  <span>LMS Ekskul TIK</span>
                  <span>SDN 231 Sukaasih</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GAMIFIKASI & GELAR PRESTASI */}
      <section id="gamifikasi" className="py-24 bg-white border-b border-[#ebebeb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#ff385c] block">
                BELAJAR BERBASIS REWARD
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#222222] leading-tight">
                Raih Poin, Buka Gelar, dan Rajai Papan Peringkat!
              </h2>
              <p className="text-base text-[#6a6a6a] leading-relaxed">
                Setiap penyelesaian kuis interaktif A-D dan kehadiran akan
                menghadiahi siswa poin gamifikasi. Tukarkan dengan gelar
                prestisius untuk dipamerkan di klasemen siswa.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { title: "Jagoan Digital", pts: "0 Pts" },
                  { title: "Desainer Cilik", pts: "100 Pts" },
                  { title: "Master Coding", pts: "200 Pts" },
                  { title: "Cyber Explorer", pts: "300 Pts" },
                ].map((g) => (
                  <div
                    key={g.title}
                    className="bg-[#f7f7f7] p-4 rounded-xl border border-[#ebebeb] flex items-center justify-between"
                  >
                    <span className="text-sm font-bold text-[#222222]">
                      {g.title}
                    </span>
                    <span className="text-xs font-bold bg-[#ff385c] text-white px-2.5 py-1 rounded-full">
                      {g.pts}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#dddddd] airbnb-shadow max-w-md w-full">
              <div className="flex items-center justify-between border-b border-[#ebebeb] pb-4 mb-6">
                <h3 className="text-lg font-bold text-[#222222] flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#ff385c]" />
                  <span>Leaderboard Top Siswa</span>
                </h3>
                <span className="text-xs font-semibold bg-[#f7f7f7] px-3 py-1 rounded-full">
                  Live Preview
                </span>
              </div>

              <div className="space-y-4">
                {[
                  { rank: 1, name: "Andi Pratama", cls: "5", pts: 420, title: "Cyber Explorer" },
                  { rank: 2, name: "Fajar Nugraha", cls: "6", pts: 380, title: "Master Coding" },
                  { rank: 3, name: "Bella Safitri", cls: "5", pts: 310, title: "Master Coding" },
                  { rank: 4, name: "Gita Larasati", cls: "6", pts: 260, title: "Desainer Cilik" },
                ].map((lb) => (
                  <div
                    key={lb.rank}
                    className="flex items-center justify-between p-3.5 bg-[#f7f7f7] rounded-xl border border-[#ebebeb]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                          lb.rank === 1
                            ? "bg-amber-500"
                            : lb.rank === 2
                            ? "bg-gray-400"
                            : lb.rank === 3
                            ? "bg-amber-700"
                            : "bg-[#222222]"
                        }`}
                      >
                        {lb.rank}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#222222]">
                          {lb.name}
                        </p>
                        <p className="text-[11px] text-[#6a6a6a]">
                          Kelas {lb.cls} • {lb.title}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-[#ff385c]">
                      {lb.pts} Pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FOOTER BANNER */}
      <section id="pembina" className="py-20 bg-[#222222] text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#ff385c] block">
            SDN 231 SUKAASIH — EKSTRAKURIKULER TIK
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Siap Untuk Memulai Petualangan TIK?
          </h2>
          <p className="text-sm sm:text-base text-gray-300 max-w-xl mx-auto">
            Masuk sekarang sebagai Admin, Koordinator Guru, atau Siswa Kelas 5 &
            6 untuk mengeksplorasi seluruh fitur canggih platform kami.
          </p>
          <div className="pt-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-3 bg-[#ff385c] hover:bg-[#e00b41] text-white font-extrabold text-lg px-10 py-5 rounded-2xl transition-all airbnb-shadow hover:airbnb-shadow cursor-pointer"
            >
              <span>Masuk ke Portal Login</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER SEKOLAH */}
      <footer className="bg-white border-t border-[#ebebeb] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6a6a6a]">
          <div className="flex items-center gap-2 font-bold text-[#222222]">
            <Heart className="w-4 h-4 text-[#ff385c] fill-[#ff385c]" />
            <span>
              © 2026 SDN 231 Sukaasih — LMS Ekstrakurikuler TIK Kelas 5 & 6.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-[#ff385c] font-semibold">
              Portal Admin
            </Link>
            <Link href="/login" className="hover:text-[#ff385c] font-semibold">
              Portal Guru Pembina
            </Link>
            <Link href="/login" className="hover:text-[#ff385c] font-semibold">
              Portal Siswa
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
