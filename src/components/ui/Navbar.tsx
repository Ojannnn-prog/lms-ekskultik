"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles, LogOut, BookOpen, Users, QrCode, Award, UserCheck, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useNotificationModal } from "@/providers/NotificationProvider";
import { useLanguage } from "@/providers/LanguageProvider";

interface NavbarProps {
  user: {
    username: string;
    name: string;
    role: "admin" | "teacher" | "student";
    classGroup?: string;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // State untuk mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hook Notifikasi Global
  const { show } = useNotificationModal();

  // State untuk modal logout
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  // Bahasa
  const { locale, setLocale, t } = useLanguage();

  const handleLogoutConfirm = async () => {
    setShowConfirmLogout(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      show({
        type: "success",
        title: "Berhasil Keluar Sesi 👋",
        description:
          "Sesi Anda di LMS Ekskul TIK SDN 231 Sukaasih telah diakhiri dengan aman. Sampai jumpa kembali!",
        badgeText: "Status: Keluar (Offline)",
        primaryButtonText: "Ke Halaman Login →",
        autoCloseDelay: 1600,
        redirectUrl: "/login",
      });
    } catch {
      show({
        type: "error",
        title: "Gagal Keluar Sesi ⚠️",
        description: "Terjadi kesalahan saat mengakhiri sesi. Silakan coba kembali.",
      });
    }
  };

  const getNavLinks = () => {
    if (user.role === "admin") {
      return [
        { label: t("sidebar.admin.dashboard"), href: "/admin", icon: Sparkles },
        { label: t("sidebar.admin.materials"), href: "/admin/resources", icon: BookOpen },
        { label: t("sidebar.admin.teachers"), href: "/admin/teacher", icon: UserCheck },
        { label: t("sidebar.admin.students"), href: "/admin/student", icon: Users },
        { label: t("sidebar.admin.scanner"), href: "/admin/scanner", icon: QrCode },
      ];
    }
    if (user.role === "teacher") {
      return [
        { label: t("sidebar.teacher.dashboard"), href: "/teacher", icon: BookOpen },
        { label: t("sidebar.teacher.students"), href: "/teacher/student", icon: Users },
        { label: t("sidebar.teacher.profile"), href: "/teacher/profile", icon: Award },
      ];
    }
    return [
      { label: t("sidebar.student.dashboard"), href: "/student", icon: BookOpen },
      { label: t("sidebar.student.courses"), href: "/student/course", icon: Sparkles },
      { label: t("sidebar.student.gamification"), href: "/student/gamification", icon: Award },
    ];
  };

  const links = getNavLinks();

  return (
    <header className="bg-white border-b border-[#dddddd] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2">
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#ff385c] flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-sm group-hover:bg-[#e00b41] transition-colors shrink-0">
                TIK
              </div>
              <div className="min-w-0">
                <span className="text-sm sm:text-base font-bold text-[#222222] block leading-tight truncate">
                  Ekskul TIK
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-[#ff385c] block uppercase tracking-wider truncate">
                  SDN 231 Sukaasih
                </span>
              </div>
            </Link>
          </div>

          {/* Nav Tabs (Airbnb Style with Underline) */}
          <nav className="hidden md:flex items-center space-x-1">
            {links.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" &&
                  item.href !== "/teacher" &&
                  item.href !== "/student" &&
                  pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors relative ${
                    isActive
                      ? "text-[#222222]"
                      : "text-[#6a6a6a] hover:text-[#222222]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-[#ff385c]" : "text-[#929292]"
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#222222] rounded-t-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Account, Logout & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-xs font-semibold text-[#222222] leading-tight">
                {user.name}
              </span>
              <span className="text-[11px] font-medium text-[#6a6a6a] bg-[#f7f7f7] px-2 py-0.5 rounded-full mt-0.5 border border-[#ebebeb]">
                {user.role === "admin"
                  ? "Koordinator TIK"
                  : user.role === "teacher"
                  ? `Pembina Kelas ${user.classGroup}`
                  : `Siswa Kelas ${user.classGroup}`}
              </span>
            </div>

            <button
              onClick={() => setLocale(locale === "id" ? "en" : "id")}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-[#222222] bg-white border border-[#dddddd] rounded-full hover:border-[#222222] hover:bg-[#f7f7f7] transition-all duration-150 airbnb-shadow-sm cursor-pointer shrink-0"
              title="Ubah Bahasa / Change Language"
            >
              <span className="text-sm">{locale === "id" ? "🇮🇩" : "🇬🇧"}</span>
              <span className="hidden sm:block">{locale === "id" ? "ID" : "EN"}</span>
            </button>

            <button
              onClick={() => setShowConfirmLogout(true)}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-[#222222] bg-white border border-[#dddddd] rounded-full hover:border-[#222222] hover:bg-[#f7f7f7] transition-all duration-150 airbnb-shadow-sm cursor-pointer shrink-0 whitespace-nowrap"
              title={t("common.logout")}
            >
              <LogOut className="w-3.5 h-3.5 text-[#ff385c]" />
              <span>{t("common.logout")}</span>
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 rounded-full border border-[#dddddd] text-[#222222] hover:bg-[#f7f7f7] transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Bar (Dropdown Hamburger) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-[#ebebeb] bg-white overflow-hidden"
          >
            <div className="flex flex-col px-4 py-3 space-y-1">
              {/* Profil Singkat di Mobile */}
              <div className="flex flex-col pb-3 mb-2 border-b border-[#ebebeb]">
                <span className="text-sm font-bold text-[#222222]">
                  {user.name}
                </span>
                <span className="text-xs text-[#6a6a6a]">
                  {user.role === "admin"
                    ? "Koordinator TIK"
                    : user.role === "teacher"
                    ? `Pembina Kelas ${user.classGroup}`
                    : `Siswa Kelas ${user.classGroup}`}
                </span>
              </div>

              {links.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/admin" &&
                    item.href !== "/teacher" &&
                    item.href !== "/student" &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl transition-colors ${
                      isActive
                        ? "bg-[#f7f7f7] text-[#ff385c]"
                        : "text-[#222222] hover:bg-[#f7f7f7]"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "text-[#ff385c]" : "text-[#6a6a6a]"
                      }`}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setShowConfirmLogout(true);
                }}
                className="flex items-center gap-3 px-3 py-3 mt-2 text-sm font-semibold rounded-xl text-[#ff385c] hover:bg-[#fff8f6] transition-colors text-left"
              >
                <LogOut className="w-5 h-5" />
                <span>{t("common.logout")}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Keluar */}
      <ConfirmModal
        isOpen={showConfirmLogout}
        onClose={() => setShowConfirmLogout(false)}
        onConfirm={handleLogoutConfirm}
        title={t("common.logout")}
        description="Apakah Anda yakin ingin keluar dari sistem LMS Ekskul TIK SDN 231 Sukaasih? Sesi Anda akan diakhiri."
        confirmText={t("common.yes")}
        cancelText={t("common.cancel")}
        isDanger={true}
      />
    </header>
  );
}
