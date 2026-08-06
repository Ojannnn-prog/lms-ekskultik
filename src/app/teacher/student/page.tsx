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

  const [list, setList] = useState<StudentAttItem[]>([]);
  const [classGroup, setClassGroup] = useState("5");
  const [loading, setLoading] = useState(true);

  // State untuk Laporan Bulanan Resmi (9 Kolom Landscape)
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
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
      show({ type: 'error', title: 'Perhatian', description: `Gagal memuat absensi`, autoCloseDelay: 2500 });
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
        title: "Presensi Berhasil Dicatat! 📋",
        description:
          "Status kehadiran siswa telah resmi diperbarui di database LMS Ekskul TIK.",
        badgeText: `Status Baru: ${status}`,
      });
    } catch {
      show({ type: 'error', title: 'Perhatian', description: `Gagal memperbarui absensi`, autoCloseDelay: 2500 });
    }
  };

  const loadMonthlyReport = async () => {
    try {
      const res = await getTeacherMonthlyReport(reportMonth, reportYear);
      if (res.success) {
        setReportData(res.records);
        setShowReportModal(true);
      }
    } catch {
      show({ type: 'error', title: 'Perhatian', description: `Gagal memuat laporan bulanan`, autoCloseDelay: 2500 });
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
      `Laporan_Presensi_TIK_Kelas${classGroup}_${reportMonth}_${reportYear}.xlsx`
    );
    show({ type: 'success', title: 'Berhasil', description: `Laporan Excel berhasil diunduh`, autoCloseDelay: 1500 });
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
              Absensi & Presensi (WIB)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#222222]">
            Presensi Siswa Kelas {classGroup}
          </h1>
          <p className="text-sm text-[#6a6a6a]">
            Pantau kehadiran harian siswa atau ubah status secara manual
            apabila tidak membawa KTA QR.
          </p>
        </div>
        <button
          onClick={loadMonthlyReport}
          className="bg-[#222222] hover:bg-[#ff385c] text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <FileText className="w-4 h-4" />
          <span>Laporan Bulanan Resmi (9 Kolom)</span>
        </button>
      </div>

      {/* Tabel Kehadiran Harian */}
      <div className="bg-white border border-[#dddddd] rounded-2xl overflow-hidden airbnb-shadow-sm">
        <div className="p-6 border-b border-[#dddddd] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#ff385c]" />
            <h2 className="text-lg font-bold text-[#222222]">
              Daftar Kehadiran Hari Ini (Asia/Jakarta)
            </h2>
          </div>
          <span className="text-xs font-semibold bg-[#f7f7f7] text-[#6a6a6a] px-3 py-1 rounded-full border border-[#ebebeb]">
            Reset 00:00 WIB
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f7f7] border-b border-[#dddddd] text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
                <th className="py-4 px-6 w-16 text-center">No</th>
                <th className="py-4 px-6">Nama Siswa & NIS</th>
                <th className="py-4 px-6 text-center">Kelas</th>
                <th className="py-4 px-6 text-center">Status Presensi</th>
                <th className="py-4 px-6 text-right">Ubah Status Manual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebebeb] text-sm text-[#222222]">
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#6a6a6a]">
                    Belum ada siswa di kelas ini
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
                          NIS: {item.studentCode}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#f7f7f7] border border-[#ebebeb]">
                        Kelas {item.classGroup}
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
                        {item.status}
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
                            {status}
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
                  LAPORAN BULANAN EKSTRAKURIKULER TIK
                </span>
                <h3 className="text-xl font-bold text-[#222222]">
                  SDN 231 SUKAASIH — KELAS {classGroup}
                </h3>
                <p className="text-xs text-[#6a6a6a]">
                  Bulan {reportMonth} / Tahun {reportYear}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={exportReportExcel}
                  className="bg-white hover:bg-[#f7f7f7] text-[#222222] border border-[#dddddd] px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-[#ff385c]" />
                  <span>Unduh Excel</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-[#ff385c] hover:bg-[#e00b41] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak / PDF Landscape</span>
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
                      No
                    </th>
                    <th className="py-3 px-3 border border-[#222222]">
                      NIS Siswa
                    </th>
                    <th className="py-3 px-3 border border-[#222222]">
                      Username
                    </th>
                    <th className="py-3 px-3 border border-[#222222]">
                      Nama Lengkap Siswa
                    </th>
                    <th className="py-3 px-3 border border-[#222222] text-center">
                      Kelas
                    </th>
                    <th className="py-3 px-3 border border-[#222222] text-center">
                      Hadir (H)
                    </th>
                    <th className="py-3 px-3 border border-[#222222] text-center">
                      Izin (I)
                    </th>
                    <th className="py-3 px-3 border border-[#222222] text-center">
                      Alpha (A)
                    </th>
                    <th className="py-3 px-3 border border-[#222222] text-center">
                      Persentase
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
                Dicetak oleh sistem LMS Ekstrakurikuler TIK SDN 231 Sukaasih
              </span>
              <span>
                Mengetahui: Koordinator & Pembina Kelas {classGroup}
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
        primaryButtonText="Mengerti & Tutup"
        onPrimaryClick={() =>
          setModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}
