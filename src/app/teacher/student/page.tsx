"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CheckCircle2,
  Calendar,
  Printer,
  FileText,
  Sparkles,
  Download,
} from "lucide-react";
import { useNotificationModal } from "@/providers/NotificationProvider";
import * as XLSX from "xlsx";
import NotificationModal from "@/components/ui/NotificationModal";
import {
  getTeacherAttendanceData,
  updateStudentAttendanceManual,
  getTeacherMonthlyReport,
} from "../actions";
import { useLanguage } from "@/providers/LanguageProvider";

interface StudentAttItem {
  id: string;
  name: string;
  studentCode: string;
  classGroup: string;
  status: string;
  attendanceId: string | null;
}

interface MonthlyRecord {
  no: number;
  name: string;
  studentCode: string;
  username: string;
  classGroup: string;
  hadir: number;
  izin: number;
  alpha: number;
  rekap: string;
  percentage: string;
}

export default function TeacherStudentAttendancePage() {
  const { show } = useNotificationModal();
  const { t } = useLanguage();

  const [list, setList] = useState<StudentAttItem[]>([]);
  const [classGroup, setClassGroup] = useState("5");
  const [loading, setLoading] = useState(true);

  // State untuk Laporan Bulanan Resmi (9 Kolom Landscape)
  const [reportMonthStart, setReportMonthStart] = useState(new Date().getMonth() + 1);
  const [reportMonthEnd, setReportMonthEnd] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<MonthlyRecord[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);

  // State untuk Modal Notifikasi Presensi
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "success" | "celebration" | "reward" | "error" | "info";
    title: string;
    description: string;
    badgeText?: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    description: "",
  });

  const loadData = async () => {
    try {
      const data = await getTeacherAttendanceData();
      setClassGroup(data.classGroup);
      setList(data.list);
    } catch {
      show({ type: 'error', title: t('teacher.attention'), description: t('teacher.fetch_error_attendance'), autoCloseDelay: 2500 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (studentId: string, status: string) => {
    try {
      await updateStudentAttendanceManual(studentId, status);
      loadData();
      setModalConfig({
        isOpen: true,
        type: "success",
        title: t('teacher.attendance_recorded'),
        description: t('teacher.attendance_updated'),
        badgeText: `${t('teacher.new_status')}: ${status}`,
      });
    } catch {
      show({ type: 'error', title: t('teacher.attention'), description: t('teacher.update_error_attendance'), autoCloseDelay: 2500 });
    }
  };

  const loadMonthlyReport = async () => {
    try {
      const res = await getTeacherMonthlyReport(reportMonthStart, reportMonthEnd, reportYear);
      if (res.success) {
        setReportData(res.records);
        setShowReportModal(true);
      }
    } catch {
      show({ type: 'error', title: t('teacher.attention'), description: t('teacher.fetch_error_report'), autoCloseDelay: 2500 });
    }
  };

  const exportReportExcel = () => {
    const dataToExport = reportData.map((r) => ({
      No: r.no,
      NIS: r.studentCode,
      Username: r.username,
      "Nama Lengkap": r.name,
      Kelas: r.classGroup,
      Hadir: r.hadir,
      Izin: r.izin,
      Alpha: r.alpha,
      "Rekap (H/I/A)": r.rekap,
      "Persentase (%)": r.percentage,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Ekskul TIK");
    XLSX.writeFile(
      workbook,
      `Laporan_Presensi_TIK_Kelas${classGroup}_Bulan${reportMonthStart}-${reportMonthEnd}_${reportYear}.xlsx`
    );
    show({ type: 'success', title: t('teacher.success'), description: t('teacher.excel_download_success'), autoCloseDelay: 1500 });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff385c]" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#dddddd] airbnb-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#f7f7f7] px-3 py-1 rounded-full mb-2 border border-[#ebebeb]">
            <Sparkles className="w-3.5 h-3.5 text-[#ff385c]" />
            <span className="text-xs font-semibold text-[#222222]">
              {t('teacher.attendance_wib')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#222222]">
            {t('teacher.attendance_title')} {classGroup}
          </h1>
          <p className="text-sm text-[#6a6a6a]">
            {t('teacher.attendance_desc')}
          </p>
        </div>
        <button
          onClick={loadMonthlyReport}
          className="bg-[#222222] hover:bg-[#ff385c] text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <FileText className="w-4 h-4" />
          <span>{t('teacher.monthly_report')}</span>
        </button>
      </div>

      {/* Tabel Kehadiran Harian */}
      <div className="bg-white border border-[#dddddd] rounded-2xl overflow-hidden airbnb-shadow-sm">
        <div className="p-6 border-b border-[#dddddd] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#ff385c]" />
            <h2 className="text-lg font-bold text-[#222222]">
              {t('teacher.today_attendance')}
            </h2>
          </div>
          <span className="text-xs font-semibold bg-[#f7f7f7] text-[#6a6a6a] px-3 py-1 rounded-full border border-[#ebebeb]">
            {t('teacher.reset_time')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f7f7] border-b border-[#dddddd] text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
                <th className="py-4 px-6 w-16 text-center">{t('teacher.no')}</th>
                <th className="py-4 px-6">{t('teacher.student_name_nis')}</th>
                <th className="py-4 px-6 text-center">{t('teacher.class')}</th>
                <th className="py-4 px-6 text-center">{t('teacher.attendance_status')}</th>
                <th className="py-4 px-6 text-right">{t('teacher.change_status_manual')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebebeb] text-sm text-[#222222]">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#6a6a6a]">
                    {t('teacher.no_students')}
                  </td>
                </tr>
              ) : (
                list.map((item, index) => (
                  <tr key={item.id} className="hover:bg-[#f7f7f7]/60">
                    <td className="py-4 px-6 text-center text-[#6a6a6a]">
                      {index + 1}
                    </td>
                    <td className="py-4 px-6 font-medium">
                      <div>
                        <p className="font-bold text-[#222222]">{item.name}</p>
                        <p className="text-xs text-[#6a6a6a]">
                          {t('teacher.nis')}: {item.studentCode}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#f7f7f7] border border-[#ebebeb]">
                        {t('teacher.class')} {item.classGroup}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                          item.status === "Hadir"
                            ? "bg-green-100 text-green-800"
                            : item.status === "Izin"
                            ? "bg-amber-100 text-amber-800"
                            : item.status === "Alpha"
                            ? "bg-red-100 text-red-800"
                            : "bg-[#ebebeb] text-[#6a6a6a]"
                        }`}
                      >
                        {item.status === 'Hadir' ? t('teacher.present') : item.status === 'Izin' ? t('teacher.sick_leave') : item.status === 'Alpha' ? t('teacher.absent') : item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex rounded-lg border border-[#dddddd] bg-white p-1 gap-1">
                        {["Hadir", "Izin", "Alpha"].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(item.id, status)}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                              item.status === status
                                ? status === "Hadir"
                                  ? "bg-green-600 text-white"
                                  : status === "Izin"
                                  ? "bg-amber-600 text-white"
                                  : "bg-red-600 text-white"
                                : "text-[#6a6a6a] hover:bg-[#f7f7f7]"
                            }`}
                          >
                            {status === 'Hadir' ? t('teacher.present') : status === 'Izin' ? t('teacher.sick_leave') : status === 'Alpha' ? t('teacher.absent') : status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODUL LAPORAN BULANAN RESMI SDN 231 SUKAASIH (LANDSCAPE 9 KOLOM) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 sm:p-8 border border-[#dddddd] airbnb-shadow my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#ebebeb]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff385c] block">
                  {t('teacher.report_header')}
                </span>
                <h3 className="text-xl font-bold text-[#222222]">
                  {t('teacher.school_name')} {classGroup}
                </h3>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#6a6a6a]">Dari Bulan:</span>
                    <select 
                      value={reportMonthStart} 
                      onChange={(e) => setReportMonthStart(Number(e.target.value))}
                      className="bg-[#f7f7f7] border border-[#dddddd] text-xs px-2 py-1 rounded"
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#6a6a6a]">Sampai:</span>
                    <select 
                      value={reportMonthEnd} 
                      onChange={(e) => setReportMonthEnd(Number(e.target.value))}
                      className="bg-[#f7f7f7] border border-[#dddddd] text-xs px-2 py-1 rounded"
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#6a6a6a]">Tahun:</span>
                    <select 
                      value={reportYear} 
                      onChange={(e) => setReportYear(Number(e.target.value))}
                      className="bg-[#f7f7f7] border border-[#dddddd] text-xs px-2 py-1 rounded"
                    >
                      <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                      <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                    </select>
                  </div>
                  <button 
                    onClick={loadMonthlyReport}
                    className="ml-2 bg-[#222222] text-white px-3 py-1 text-xs rounded hover:bg-[#ff385c]"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportReportExcel}
                  className="bg-white hover:bg-[#f7f7f7] text-[#222222] border border-[#dddddd] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#ff385c]" />
                  <span>{t('teacher.download_excel')}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-[#ff385c] hover:bg-[#e00b41] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{t('teacher.print_pdf')}</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-[#929292] hover:text-[#222222] ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* TABEL 9 KOLOM RESMI */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f7f7] border border-[#222222] text-[#222222] uppercase">
                    <th className="py-3 px-3 border border-[#222222] text-center w-10">
                      {t('teacher.no')}
                    </th>
                    <th className="py-3 px-3 border border-[#222222]">
                      {t('teacher.student_nis')}
                    </th>
                    <th className="py-3 px-3 border border-[#222222]">
                      {t('teacher.username')}
                    </th>
                    <th className="py-3 px-3 border border-[#222222]">
                      {t('teacher.full_name')}
                    </th>
                    <th className="py-3 px-3 border border-[#222222] text-center">
                      {t('teacher.class')}
                    </th>
                    <th className="py-3 px-3 border border-[#222222] text-center">
                      {t('teacher.present_h')}
                    </th>
                    <th className="py-3 px-3 border border-[#222222] text-center">
                      {t('teacher.leave_i')}
                    </th>
                    <th className="py-3 px-3 border border-[#222222] text-center">
                      {t('teacher.absent_a')}
                    </th>
                    <th className="py-3 px-3 border border-[#222222] text-center">
                      {t('teacher.percentage')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((rec) => (
                    <tr key={rec.no} className="border border-[#222222]">
                      <td className="py-2.5 px-3 border border-[#222222] text-center">
                        {rec.no}
                      </td>
                      <td className="py-2.5 px-3 border border-[#222222]">
                        {rec.studentCode}
                      </td>
                      <td className="py-2.5 px-3 border border-[#222222]">
                        {rec.username}
                      </td>
                      <td className="py-2.5 px-3 border border-[#222222] font-bold">
                        {rec.name}
                      </td>
                      <td className="py-2.5 px-3 border border-[#222222] text-center">
                        {rec.classGroup}
                      </td>
                      <td className="py-2.5 px-3 border border-[#222222] text-center font-bold text-green-700">
                        {rec.hadir}
                      </td>
                      <td className="py-2.5 px-3 border border-[#222222] text-center font-bold text-amber-700">
                        {rec.izin}
                      </td>
                      <td className="py-2.5 px-3 border border-[#222222] text-center font-bold text-red-700">
                        {rec.alpha}
                      </td>
                      <td className="py-2.5 px-3 border border-[#222222] text-center font-bold">
                        {rec.percentage}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-between text-xs text-[#6a6a6a]">
              <span>
                {t('teacher.printed_by')}
              </span>
              <span>
                {t('teacher.acknowledged_by')} {classGroup}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Pop up Modal Sukses / Notifikasi Presensi */}
      <NotificationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        type={modalConfig.type}
        title={modalConfig.title}
        description={modalConfig.description}
        badgeText={modalConfig.badgeText}
        primaryButtonText={t('teacher.understand_close')}
        onPrimaryClick={() =>
          setModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}
