"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  Sparkles,
  BookOpen,
  QrCode,
  ArrowLeft,
  HelpCircle,
  X,
  ShieldAlert,
} from "lucide-react";
import { useNotificationModal } from "@/providers/NotificationProvider";
import { useLanguage } from "@/providers/LanguageProvider";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal untuk Lupa Kata Sandi
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Hook Notifikasi Global
  const { show } = useNotificationModal();
  const { t, locale, setLocale } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      show({
        type: "error",
        title: "Kolom Kosong ⚠️",
        description:
          "Silakan isi username dan password akun LMS Anda terlebih dahulu.",
        badgeText: "Periksa Input",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const targetUrl =
          data.role === "admin"
            ? "/admin"
            : data.role === "teacher"
            ? "/teacher"
            : "/student";
        show({
          type: "celebration",
          title: "Login Berhasil! 🎉",
          description:
            "Selamat datang kembali di LMS Ekskul TIK SDN 231 Sukaasih. Mengalihkan Anda ke ruang dasbor...",
          badgeText: `Hak Akses: ${data.role.toUpperCase()}`,
          redirectUrl: targetUrl,
          autoCloseDelay: 1800,
        });
      } else {
        show({
          type: "error",
          title: "Login Gagal ⚠️",
          description:
            data.error ||
            "Username atau password salah, tidak ditemukan pada database sekolah.",
          badgeText: "Kredensial Tidak Sah",
        });
      }
    } catch {
      show({
        type: "error",
        title: "Kesalahan Jaringan 🌐",
        description:
          "Gagal terhubung ke server LMS. Periksa koneksi internet Anda dan coba kembali.",
        badgeText: "Server Error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center px-4 py-12 relative">
      {/* Tombol Kembali ke Beranda di Bagian Atas */}
      <div className="max-w-md w-full mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6a6a6a] hover:text-[#222222] transition-colors py-2"
        >
          <ArrowLeft className="w-4 h-4 text-[#ff385c]" />
          <span>Kembali ke Beranda</span>
        </Link>

        {/* Language Switcher */}
        <button
          onClick={() => setLocale(locale === "id" ? "en" : "id")}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#222222] bg-white border border-[#dddddd] rounded-full hover:border-[#222222] hover:bg-[#f7f7f7] transition-all duration-150 shadow-sm cursor-pointer"
          title="Ubah Bahasa / Change Language"
        >
          <img 
            src={locale === "id" ? "https://flagcdn.com/w20/id.png" : "https://flagcdn.com/w20/gb.png"} 
            width="20" 
            alt="flag" 
            className="rounded-[2px]"
          />
          <span className="hidden sm:block">{locale === "id" ? "ID" : "EN"}</span>
        </button>
      </div>

      {/* Brand Header */}
      <div className="max-w-md w-full text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-[#f7f7f7] px-4 py-1.5 rounded-full mb-4 border border-[#ebebeb]">
          <Sparkles className="w-4 h-4 text-[#ff385c]" />
          <span className="text-xs font-semibold text-[#222222] uppercase tracking-wider">
            SDN 231 Sukaasih
          </span>
        </div>
        <h1 className="text-3xl font-bold text-[#222222] tracking-tight mb-2">
          LMS Ekstrakurikuler TIK
        </h1>
        <p className="text-sm text-[#6a6a6a]">
          Portal Belajar Interaktif & Presensi QR Code untuk Kelas 5 & 6
        </p>
      </div>

      {/* White Card Airbnb Style */}
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-[2rem] shadow-2xl p-8 sm:p-10 border border-[#dddddd]">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#fff8f6] mb-4 border border-[#ff385c]/20">
            <Sparkles className="w-8 h-8 text-[#ff385c]" />
          </div>
          <h2 className="text-2xl font-bold text-[#222222] mb-1">
            {t("login.title")}
          </h2>
          <p className="text-sm font-medium text-[#6a6a6a]">
            {t("login.subtitle")}
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-2">
              {t("login.username")}
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 w-5 h-5 text-[#929292]" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("login.usernamePlaceholder")}
                className="w-full bg-[#f7f7f7] text-[#222222] text-sm font-medium rounded-xl pl-12 pr-4 py-3.5 border border-[#ebebeb] focus:bg-white focus:border-[#222222] focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider">
                {t("login.password")}
              </label>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(true)}
                className="text-xs font-bold text-[#ff385c] hover:underline cursor-pointer"
              >
                Lupa Kata Sandi?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-[#929292]" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("login.passwordPlaceholder")}
                className="w-full bg-[#f7f7f7] text-[#222222] text-sm font-medium rounded-xl pl-12 pr-12 py-3.5 border border-[#ebebeb] focus:bg-white focus:border-[#222222] focus:outline-none transition-colors"
                required
              />
              {/* Fitur Toggle Password */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-[#6a6a6a] hover:text-[#222222] transition-colors"
                title={showPassword ? "Sembunyikan password" : "Lihat password"}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff385c] hover:bg-[#e00b41] text-white font-bold text-base py-3.5 rounded-xl transition-colors duration-200 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? t("login.loggingIn") : t("login.button")}
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-xs text-[#6a6a6a] flex items-center justify-center gap-4">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" /> E-Learning TIK
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <QrCode className="w-3.5 h-3.5" /> KTA Digital QR
        </span>
        <span>•</span>
        <span>Kelas 5 & 6</span>
      </div>

      {/* MODAL LUPA KATA SANDI (GLASSMORPHIC AIRBNB LUXURY) */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#dddddd] airbnb-shadow transform transition-all relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#fff8f6] text-[#ff385c] flex items-center justify-center border border-[#ff385c]/20">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#222222]">
                  Lupa Kata Sandi Akun?
                </h3>
              </div>
              <button
                onClick={() => setIsForgotModalOpen(false)}
                className="text-[#929292] hover:text-[#222222] p-1 rounded-full hover:bg-[#f7f7f7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#3f3f3f] leading-relaxed mb-6">
              Untuk menjaga keamanan data pembelajaran dan nilai siswa, reset kata sandi dikelola secara tersentralisasi oleh Koordinator TIK atau Guru Pembina Kelas Anda.
            </p>

            <div className="space-y-3 mb-6 bg-[#f7f7f7] p-4 rounded-2xl border border-[#ebebeb]">
              <div>
                <p className="text-xs font-bold text-[#222222] uppercase tracking-wider mb-1">
                  Siswa Kelas 5 & 6:
                </p>
                <p className="text-xs text-[#6a6a6a]">
                  Hubungi Guru Pembina TIK atau Wali Kelas Anda untuk mereset kata sandi ke sandi bawaan sekolah.
                </p>
              </div>
              <div className="border-t border-[#ebebeb] pt-2">
                <p className="text-xs font-bold text-[#222222] uppercase tracking-wider mb-1">
                  Guru Pembina TIK:
                </p>
                <p className="text-xs text-[#6a6a6a]">
                  Silakan hubungi Koordinator / Administrator Utama SDN 231 Sukaasih untuk pemulihan akses akun.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="w-full px-6 py-3 text-xs font-bold text-white bg-[#222222] hover:bg-[#ff385c] rounded-xl transition-colors cursor-pointer"
              >
                Mengerti, Saya Akan Menghubungi Pembina / Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
