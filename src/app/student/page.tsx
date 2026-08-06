"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  QrCode,
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { useNotificationModal } from "@/providers/NotificationProvider";
import StudentQRCardModal from "@/components/ui/StudentQRCardModal";
import NotificationModal from "@/components/ui/NotificationModal";
import { getStudentDashboardData } from "./actions";

interface StudentData {
  id: string;
  name: string;
  studentCode: string;
  classGroup: string;
  points: number;
  activeTitle: string | null;
  unlockedTitles: string[];
}

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export default function StudentDashboardPage() {
  const { show } = useNotificationModal();

  const [data, setData] = useState<{
    student: StudentData;
    todayStatus: string;
    announcements: AnnouncementItem[];
    progressStats: {
      totalResources: number;
      completedCount: number;
      percentage: number;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<{
    title: string;
    content: string;
    date: string;
  } | null>(null);

  useEffect(() => {
    getStudentDashboardData()
      .then((res) => {
        setData({
          ...res,
          announcements: res.announcements.map((a) => ({
            ...a,
            createdAt: new Date(a.createdAt),
          })),
        });
      })
      .catch(() => show({ type: 'error', title: 'Perhatian', description: `Gagal memuat dasbor siswa`, autoCloseDelay: 2500 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff385c]" />
      </div>
    );
  }

  const student = data?.student;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Banner Airbnb Style */}
      <div className="bg-[#f7f7f7] border border-[#ebebeb] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full mb-3 border border-[#dddddd] text-xs font-semibold text-[#222222]">
            <Sparkles className="w-3.5 h-3.5 text-[#ff385c]" />
            <span>Siswa Ekskul TIK • Kelas {student?.classGroup}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#222222] tracking-tight mb-2">
            Halo, {student?.name}! 👋
          </h1>
          <p className="text-sm text-[#6a6a6a] max-w-xl">
            Selamat datang di portal belajar Ekstrakurikuler TIK SDN 231
            Sukaasih. Gunakan KTA QR Code untuk presensi dan tingkatkan poin
            gamifikasimu!
          </p>
        </div>

        {/* Action Button: Buka KTA QR Code */}
        <div className="w-full md:w-auto">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="w-full md:w-auto bg-[#ff385c] hover:bg-[#e00b41] text-white font-bold text-sm px-6 py-4 rounded-xl transition-colors airbnb-shadow flex items-center justify-center gap-3 cursor-pointer"
          >
            <QrCode className="w-5 h-5" />
            <span>Buka KTA Digital QR Code</span>
          </button>
        </div>
      </div>

      {/* Grid Statistik Siswa */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Poin & Gelar */}
        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
              Poin Gamifikasi
            </span>
            <p className="text-3xl font-bold text-[#ff385c] mt-1">
              {student?.points || 0} Poin
            </p>
            <p className="text-xs font-bold text-[#222222] mt-1 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#ff385c]" />
              <span>{student?.activeTitle || "Jagoan Digital"}</span>
            </p>
          </div>
          <Link
            href="/student/gamification"
            className="p-3 bg-[#f7f7f7] hover:bg-[#ebebeb] rounded-xl text-[#222222] transition-colors"
            title="Lihat Peringkat"
          >
            <Award className="w-6 h-6 text-[#ff385c]" />
          </Link>
        </div>

        {/* Status Presensi Hari Ini (WIB) */}
        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
              Presensi Hari Ini (WIB)
            </span>
            <p className="text-2xl font-bold text-[#222222] mt-1">
              {data?.todayStatus || "Belum Absen"}
            </p>
            <p className="text-xs text-[#6a6a6a] mt-1">
              {data?.todayStatus === "Hadir"
                ? "Kehadiran tercatat (+10 Poin)"
                : "Scan KTA QR Anda pada scanner"}
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              data?.todayStatus === "Hadir"
                ? "bg-green-100 text-green-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Progres Belajar LMS */}
        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
              Progres Modul TIK
            </span>
            <p className="text-2xl font-bold text-[#222222] mt-1">
              {data?.progressStats.completedCount} /{" "}
              {data?.progressStats.totalResources} Modul
            </p>
            <div className="w-32 bg-[#ebebeb] h-2 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#ff385c] h-full rounded-full transition-all duration-300"
                style={{ width: `${data?.progressStats.percentage || 0}%` }}
              />
            </div>
          </div>
          <Link
            href="/student/course"
            className="p-3 bg-[#f7f7f7] hover:bg-[#ebebeb] rounded-xl text-[#222222] transition-colors"
            title="Buka Portal Belajar"
          >
            <BookOpen className="w-6 h-6 text-[#ff385c]" />
          </Link>
        </div>
      </div>

      {/* Grid 2 Kolom: Lanjutkan Belajar & Pengumuman */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Banner Portal Belajar TIK */}
        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 sm:p-8 airbnb-shadow-sm flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#f7f7f7] px-3 py-1 rounded-full mb-3 border border-[#ebebeb]">
              <BookOpen className="w-3.5 h-3.5 text-[#ff385c]" />
              <span className="text-xs font-semibold text-[#222222]">
                LMS Core • Kurikulum Ekskul
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#222222] mb-2">
              Jelajahi Modul & Kuis Interaktif
            </h2>
            <p className="text-sm text-[#6a6a6a] leading-relaxed mb-6">
              Pelajari materi seperti Pengenalan Hardware, Scratch Block Coding,
              Internet Sehat, dan Desain Grafis. Selesaikan kuis untuk
              mendapatkan bonus poin hadiah!
            </p>
          </div>
          <Link
            href="/student/course"
            className="bg-[#222222] hover:bg-[#ff385c] text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors inline-flex items-center justify-between group"
          >
            <span>Masuk ke Portal Belajar TIK</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Pengumuman Terbaru */}
        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm">
          <h2 className="text-lg font-bold text-[#222222] mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#ff385c]" />
            <span>Pengumuman dari Koordinator</span>
          </h2>

          {!data?.announcements || data.announcements.length === 0 ? (
            <p className="text-sm text-[#6a6a6a] text-center py-12">
              Belum ada pengumuman
            </p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {data.announcements.map((ann) => {
                const formattedDate = ann.createdAt.toLocaleDateString(
                  "id-ID",
                  {
                    timeZone: "Asia/Jakarta",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                );

                return (
                  <div
                    key={ann.id}
                    onClick={() =>
                      setSelectedAnnouncement({
                        title: ann.title,
                        content: ann.content,
                        date: formattedDate,
                      })
                    }
                    className="p-4 bg-[#f7f7f7] hover:bg-white rounded-xl border border-[#ebebeb] hover:border-[#ff385c] transition-all cursor-pointer airbnb-shadow-sm group"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-[#222222] group-hover:text-[#ff385c] transition-colors">
                        {ann.title}
                      </h3>
                      <span className="text-[10px] font-semibold text-[#ff385c] bg-[#fff8f6] px-2 py-0.5 rounded-full border border-[#ffe5ed]">
                        Baca Detail →
                      </span>
                    </div>
                    <p className="text-xs text-[#3f3f3f] mt-1.5 leading-relaxed line-clamp-2">
                      {ann.content}
                    </p>
                    <p className="text-[10px] text-[#929292] mt-2 font-medium">
                      {formattedDate}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal KTA Digital */}
      <StudentQRCardModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        student={
          student
            ? {
                name: student.name,
                studentCode: student.studentCode,
                classGroup: student.classGroup,
                activeTitle: student.activeTitle,
              }
            : null
        }
      />

      {/* Pop up Modal Pengumuman Resmi */}
      <NotificationModal
        isOpen={!!selectedAnnouncement}
        onClose={() => setSelectedAnnouncement(null)}
        type="info"
        title={selectedAnnouncement?.title || "Pengumuman"}
        description={selectedAnnouncement?.content || ""}
        badgeText={`Diterbitkan: ${
          selectedAnnouncement?.date || ""
        } • Koordinator Ekskul TIK`}
        primaryButtonText="Mengerti & Tutup"
        onPrimaryClick={() => setSelectedAnnouncement(null)}
      />
    </div>
  );
}
