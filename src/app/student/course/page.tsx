"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Award,
  CheckCircle2,
  FileText,
  Video,
  Link as LinkIcon,
  HelpCircle,
  Sparkles,
  ArrowRight,
  HardDrive,
} from "lucide-react";
import { useNotificationModal } from "@/providers/NotificationProvider";
import { getStudentCourseList } from "../actions";

interface CourseItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  pointsReward: number;
  hasQuiz: boolean;
  isCompleted: boolean;
  bestScore: number | null;
  createdAt: Date;
}

export default function StudentCourseListPage() {
  const { show } = useNotificationModal();

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("ALL");

  useEffect(() => {
    getStudentCourseList()
      .then((res) => {
        setCourses(
          res.map((r) => ({
            ...r,
            createdAt: new Date(r.createdAt),
          }))
        );
      })
      .catch(() => show({ type: 'error', title: 'Perhatian', description: `Gagal memuat daftar materi`, autoCloseDelay: 2500 }))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    "ALL",
    "Hardware & Software",
    "Coding & Pemrograman",
    "Literasi Digital & Internet",
    "Desain Grafis",
  ];

  const filteredCourses =
    filterCategory === "ALL"
      ? courses
      : courses.filter((c) => c.category === filterCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff385c]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dddddd] airbnb-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#f7f7f7] px-3 py-1 rounded-full mb-2 border border-[#ebebeb]">
            <Sparkles className="w-3.5 h-3.5 text-[#ff385c]" />
            <span className="text-xs font-semibold text-[#222222]">
              LMS Core Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#222222]">
            Portal Pembelajaran Ekstrakurikuler TIK
          </h1>
          <p className="text-sm text-[#6a6a6a]">
            Pilih modul belajar, pelajari materinya, dan taklukkan kuis
            interaktif untuk mengumpulkan poin gamifikasi!
          </p>
        </div>
      </div>

      {/* Bar Filter Kategori */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-full transition-colors cursor-pointer border ${
              filterCategory === cat
                ? "bg-[#222222] text-white border-[#222222]"
                : "bg-white text-[#6a6a6a] border-[#dddddd] hover:border-[#222222] hover:text-[#222222]"
            }`}
          >
            {cat === "ALL" ? "Semua Kategori" : cat}
          </button>
        ))}
      </div>

      {/* Daftar Materi LMS */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-[#dddddd] rounded-2xl">
          <BookOpen className="w-12 h-12 text-[#929292] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#222222]">
            Belum Ada Modul Pelajaran TIK
          </h3>
          <p className="text-sm text-[#6a6a6a] max-w-md mx-auto mt-1 mb-6">
            Materi pelajaran akan ditambahkan oleh Admin atau Pembina TIK Anda
            dalam waktu dekat. Silakan cek kembali nanti!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((item) => (
            <Link
              key={item.id}
              href={`/student/course/${item.id}`}
              className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm hover:airbnb-shadow flex flex-col justify-between card-transition group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold bg-[#f7f7f7] text-[#222222] px-3 py-1 rounded-full border border-[#ebebeb]">
                    {item.category}
                  </span>
                  {item.isCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 text-green-800 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Selesai</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
                      <Award className="w-3.5 h-3.5" /> +{item.pointsReward}{" "}
                      Poin
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-[#222222] mb-2 group-hover:text-[#ff385c] transition-colors line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-sm text-[#6a6a6a] mb-4 line-clamp-3 leading-relaxed">
                  {item.description || "Klik untuk membaca dan mengerjakan kuis..."}
                </p>

                <div className="flex items-center gap-2 text-xs text-[#6a6a6a] mb-4">
                  {item.type === "GOOGLE_DRIVE" && (
                    <HardDrive className="w-4 h-4 text-[#ff385c]" />
                  )}
                  {item.type === "TEXT" && <FileText className="w-4 h-4" />}
                  {item.type === "PDF" && <FileText className="w-4 h-4 text-red-500" />}
                  {item.type === "VIDEO" && <Video className="w-4 h-4 text-blue-500" />}
                  {item.type === "LINK" && <LinkIcon className="w-4 h-4 text-green-500" />}
                  <span className="font-medium">{item.type}</span>
                  <span>•</span>
                  <span>
                    {item.hasQuiz ? "Ada Kuis Interaktif A-D" : "Materi Bacaan"}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#ebebeb] pt-4 flex items-center justify-between text-xs">
                {item.bestScore !== null ? (
                  <span className="font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                    Skor Kuis: {item.bestScore}/100
                  </span>
                ) : (
                  <span className="text-[#929292]">Belum dicoba</span>
                )}
                <span className="font-bold text-[#222222] group-hover:text-[#ff385c] inline-flex items-center gap-1 transition-colors">
                  <span>Mulai Belajar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
