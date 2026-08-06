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
import { useLanguage } from "@/providers/LanguageProvider";

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
  const { t } = useLanguage();

  const [data, setData] = useState<{
    classGroup: string;
    studentsCount: number;
    resourcesSummary: ResourceSummary[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherDashboardData()
      .then((res) => setData(res))
      .catch(() => show({ type: 'error', title: t('teacher.attention'), description: t('teacher.fetch_error_dashboard'), autoCloseDelay: 2500 }))
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
            <span>{t('teacher.coordinator_class')} {data?.classGroup}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#222222] tracking-tight mb-2">
            {t('teacher.dashboard_title')} {data?.classGroup})
          </h1>
          <p className="text-sm text-[#6a6a6a] max-w-2xl">
            {t('teacher.dashboard_subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link
            href="/teacher/student"
            className="flex-1 md:flex-none text-center bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold text-sm px-5 py-3 rounded-lg transition-colors airbnb-shadow-sm flex items-center justify-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>{t('teacher.presence_recap')}</span>
          </Link>
          <Link
            href="/teacher/profile"
            className="flex-1 md:flex-none text-center bg-white hover:bg-[#f7f7f7] text-[#222222] border border-[#dddddd] font-semibold text-sm px-5 py-3 rounded-lg transition-colors airbnb-shadow-sm flex items-center justify-center gap-2"
          >
            <Award className="w-4 h-4 text-[#ff385c]" />
            <span>{t('teacher.avatar_maker')}</span>
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
              {t('teacher.study_group')}
            </p>
            <p className="text-2xl font-bold text-[#222222]">
              {t('teacher.class')} {data?.classGroup}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f7f7f7] flex items-center justify-center text-[#222222]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
              {t('teacher.assigned_students')}
            </p>
            <p className="text-2xl font-bold text-[#222222]">
              {data?.studentsCount || 0} {t('teacher.students')}
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#f7f7f7] flex items-center justify-center text-green-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
              {t('teacher.total_modules')}
            </p>
            <p className="text-2xl font-bold text-[#222222]">
              {data?.resourcesSummary.length || 0} {t('teacher.modules')}
            </p>
          </div>
        </div>
      </div>

      {/* Tabel Progres Siswa Kelas Pengampu per Materi */}
      <div className="bg-white border border-[#dddddd] rounded-2xl overflow-hidden airbnb-shadow-sm">
        <div className="p-6 border-b border-[#dddddd] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#222222]">
              {t('teacher.progress_report_title')}
            </h2>
            <p className="text-xs text-[#6a6a6a] mt-0.5">
              {t('teacher.progress_report_subtitle')} {data?.classGroup}
            </p>
          </div>
          <BookOpen className="w-5 h-5 text-[#ff385c]" />
        </div>

        {data?.resourcesSummary.length === 0 ? (
          <div className="text-center py-16 text-[#6a6a6a]">
            {t('teacher.no_modules')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f7f7f7] border-b border-[#dddddd] text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
                  <th className="py-4 px-6">{t('teacher.learning_module')}</th>
                  <th className="py-4 px-6">{t('teacher.category')}</th>
                  <th className="py-4 px-6 text-center">{t('teacher.student_completion')}</th>
                  <th className="py-4 px-6 text-center">{t('teacher.pass_rate')}</th>
                  <th className="py-4 px-6 text-center">{t('teacher.quiz_average')}</th>
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
                          {t('teacher.type')}: {item.type} •{" "}
                          {item.hasQuiz ? t('teacher.has_quiz') : t('teacher.reading_material')}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#f7f7f7] border border-[#ebebeb]">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-[#222222]">
                      {item.completedCount} / {item.totalStudents} {t('teacher.students')}
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
                          {t('teacher.no_quiz')}
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
