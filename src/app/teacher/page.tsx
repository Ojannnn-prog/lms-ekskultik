"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Award,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { useNotificationModal } from "@/providers/NotificationProvider";
import { getTeacherDashboardData } from "./actions";

interface ResourceSummary {
  id: string;
  title: string;
  category: string;
  type: string;
  hasQuiz: boolean;
  completedCount: number;
  totalStudents: number;
  completionRate: number;
  avgScore: number;
  quizAttemptsCount: number;
}

export default function TeacherDashboardPage() {
  const { show } = useNotificationModal();

  const [data, setData] = useState<{
    classGroup: string;
    studentsCount: number;
    resourcesSummary: ResourceSummary[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherDashboardData()
      .then((res) => setData(res))
      .catch(() => show({ type: 'error', title: 'Perhatian', description: `Gagal memuat data pembina`, autoCloseDelay: 2500 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff385c]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Header */}
      <div className="bg-[#f7f7f7] border border-[#ebebeb] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full mb-3 border border-[#dddddd] text-xs font-semibold text-[#222222]">
            <Sparkles className="w-3.5 h-3.5 text-[#ff385c]" />
            <span>Koordinator Ekskul TIK • Kelas {data?.classGroup}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#222222] tracking-tight mb-2">
            Pemantauan Pembelajaran LMS (Kelas {data?.classGroup})
          </h1>
          <p className="text-sm text-[#6a6a6a] max-w-2xl">
            Pantau tingkat penyelesaian materi, nilai rata-rata kuis interaktif,
            serta rekapitulasi presensi siswa kelas pengampu Anda.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/teacher/student"
            className="flex-1 md:flex-none text-center bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold text-sm px-5 py-3 rounded-lg transition-colors airbnb-shadow-sm flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>Presensi & Rekap</span>
          </Link>
          <Link
            href="/teacher/profile"
            className="flex-1 md:flex-none text-center bg-white hover:bg-[#f7f7f7] text-[#222222] border border-[#dddddd] font-semibold text-sm px-5 py-3 rounded-lg transition-colors airbnb-shadow-sm flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4 text-[#ff385c]" />
            <span>Avatar Maker</span>
          </Link>
        </div>
      </div>

      {/* Rangkuman Singkat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f7f7f7] flex items-center justify-center text-[#ff385c] font-bold text-lg">
            {data?.classGroup}
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
              Rombongan Belajar
            </p>
            <p className="text-2xl font-bold text-[#222222]">
              Kelas {data?.classGroup}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f7f7f7] flex items-center justify-center text-[#222222]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
              Siswa Pengampu
            </p>
            <p className="text-2xl font-bold text-[#222222]">
              {data?.studentsCount || 0} Siswa
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f7f7f7] flex items-center justify-center text-green-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
              Total Modul TIK
            </p>
            <p className="text-2xl font-bold text-[#222222]">
              {data?.resourcesSummary.length || 0} Modul
            </p>
          </div>
        </div>
      </div>

      {/* Tabel Progres Siswa Kelas Pengampu per Materi */}
      <div className="bg-white border border-[#dddddd] rounded-2xl overflow-hidden airbnb-shadow-sm">
        <div className="p-6 border-b border-[#dddddd] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#222222]">
              Rapor Progres Modul Pelajaran TIK
            </h2>
            <p className="text-xs text-[#6a6a6a] mt-0.5">
              Analisis persentase penyelesaian dan skor kuis siswa Kelas{" "}
              {data?.classGroup}
            </p>
          </div>
          <BookOpen className="w-5 h-5 text-[#ff385c]" />
        </div>

        {data?.resourcesSummary.length === 0 ? (
          <div className="text-center py-16 text-[#6a6a6a]">
            Belum ada materi pelajaran TIK di sistem LMS ini
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f7f7] border-b border-[#dddddd] text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
                  <th className="py-4 px-6">Modul Pembelajaran TIK</th>
                  <th className="py-4 px-6">Kategori</th>
                  <th className="py-4 px-6 text-center">Penyelesaian Siswa</th>
                  <th className="py-4 px-6 text-center">Tingkat Lulus</th>
                  <th className="py-4 px-6 text-center">Rata-rata Kuis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb] text-sm text-[#222222]">
                {data?.resourcesSummary.map((item) => (
                  <tr key={item.id} className="hover:bg-[#f7f7f7]/60">
                    <td className="py-4 px-6 font-medium">
                      <div>
                        <p className="font-bold text-[#222222]">
                          {item.title}
                        </p>
                        <p className="text-xs text-[#6a6a6a]">
                          Tipe: {item.type} •{" "}
                          {item.hasQuiz ? "Ada Kuis A-D" : "Materi Bacaan"}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#f7f7f7] border border-[#ebebeb]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-[#222222]">
                      {item.completedCount} / {item.totalStudents} Siswa
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-2">
                        <div className="w-24 bg-[#ebebeb] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#ff385c] h-full rounded-full transition-all duration-300"
                            style={{ width: `${item.completionRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#222222]">
                          {item.completionRate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      {item.hasQuiz ? (
                        <span className="inline-flex items-center gap-1 font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full text-xs">
                          <HelpCircle className="w-3.5 h-3.5" /> {item.avgScore}{" "}
                          / 100
                        </span>
                      ) : (
                        <span className="text-xs text-[#929292]">
                          Tanpa Kuis
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
