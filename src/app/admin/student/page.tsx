"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  Users,
  Plus,
  Trash2,
  Edit,
  QrCode,
  Sparkles,
  Download,
  Upload,
  CheckSquare,
  Square,
  ArrowRightLeft,
  Filter,
  Eye,
  EyeOff,
  Printer,
  FileText,
} from "lucide-react";
import { useNotificationModal } from "@/providers/NotificationProvider";
import * as XLSX from "xlsx";
import ConfirmModal from "@/components/ui/ConfirmModal";
import StudentQRCardModal from "@/components/ui/StudentQRCardModal";
import NotificationModal from "@/components/ui/NotificationModal";
import {
  getStudentsList,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkMoveStudentClass,
  importStudentsFromExcel,
  resetStudentCredentials,
  getAdminMonthlyReport,
} from "../actions";

interface StudentItem {
  id: string;
  username: string;
  name: string;
  studentCode: string;
  classGroup: string;
  gender: string;
  birthPlace: string | null;
  points: number;
  activeTitle: string | null;
}

export default function AdminStudentsPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterClass, setFilterClass] = useState("ALL");

  // Selection state untuk bulk move
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetMoveClass, setTargetMoveClass] = useState("6");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // KTA QR Modal
  const [selectedStudentQR, setSelectedStudentQR] = useState<StudentItem | null>(null);

  // Form Tambah / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [classGroup, setClassGroup] = useState("5");
  const [gender, setGender] = useState("L");
  const [birthPlace, setBirthPlace] = useState("Bandung");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Delete Confirm Modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State Laporan Bulanan (Admin)
  const [reportMonthStart, setReportMonthStart] = useState(new Date().getMonth() + 1);
  const [reportMonthEnd, setReportMonthEnd] = useState(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportData, setReportData] = useState<any[]>([]);
  const [showReportModal, setShowReportModal] = useState(false);

  const { show } = useNotificationModal();

  const loadStudents = async () => {
    try {
      const data = await getStudentsList(filterClass);
      setStudents(data);
      setSelectedIds([]);
    } catch {
      show({ type: "error", title: t("admin.student.failed"), description: t("admin.student.failedLoad"), autoCloseDelay: 1500 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [filterClass]);

  const toggleSelectAll = () => {
    if (selectedIds.length === students.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(students.map((s) => s.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setUsername("");
    setName("");
    setStudentCode("");
    setClassGroup(filterClass !== "ALL" ? filterClass : "5");
    setGender("L");
    setBirthPlace("Bandung");
    setPassword("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: StudentItem) => {
    setEditingId(item.id);
    setUsername(item.username);
    setName(item.name);
    setStudentCode(item.studentCode);
    setClassGroup(item.classGroup);
    setGender(item.gender || "L");
    setBirthPlace(item.birthPlace || "Bandung");
    setPassword("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !name || !studentCode) {
      show({ type: "error", title: t("admin.student.failed"), description: t("admin.student.requiredFields"), autoCloseDelay: 1500 });
      return;
    }

    try {
      if (editingId) {
        await updateStudent(editingId, {
          name,
          studentCode,
          classGroup,
          gender,
          birthPlace,
        });
        
        await resetStudentCredentials(editingId, username, password || undefined);

        show({
          type: "success",
          title: t("admin.student.updatedTitle"),
          description: `${t("admin.student.updatedDesc1")}${name}${t("admin.student.updatedDesc2")}${classGroup}${t("admin.student.updatedDesc3")}`,
          badgeText: `${t("admin.student.nisBadge")}${studentCode}`,
        });
      } else {
        await createStudent({
          username,
          name,
          studentCode,
          classGroup,
          gender,
          birthPlace,
          password: password || "siswa123",
        });
        show({
          type: "success",
          title: t("admin.student.addedTitle"),
          description: `${t("admin.student.addedDesc1")}${name}${t("admin.student.addedDesc2")}${classGroup}${t("admin.student.addedDesc3")}`,
          badgeText: `${t("admin.student.usernameBadge")}${username}`,
        });
      }
      setIsModalOpen(false);
      loadStudents();
    } catch {
      show({
        type: "error",
        title: t("admin.student.failedSave"),
        description: t("admin.student.failedSaveDesc"),
      });
    }
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteStudent(deleteId);
      setIsDeleteModalOpen(false);
      loadStudents();
      show({
        type: "success",
        title: t("admin.student.deletedTitle"),
        description: t("admin.student.deletedDesc"),
      });
    } catch {
      show({
        type: "error",
        title: t("admin.student.failedDeleteTitle"),
        description: t("admin.student.failedDeleteDesc"),
      });
    }
  };

  const handleBulkMove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkMoveStudentClass(selectedIds, targetMoveClass);
      show({ type: "success", title: t("admin.student.success"), autoCloseDelay: 1500, description: 
        `${selectedIds.length}${t("admin.student.bulkMoveSuccess2")}${targetMoveClass}${t("admin.student.bulkMoveSuccess3")}`
      });
      setIsBulkModalOpen(false);
      loadStudents();
    } catch {
      show({ type: "error", title: t("admin.student.failed"), description: t("admin.student.bulkMoveFailed"), autoCloseDelay: 1500 });
    }
  };

  const handleExportExcel = () => {
    if (students.length === 0) {
      show({ type: "error", title: t("admin.student.failed"), description: t("admin.student.exportNoData"), autoCloseDelay: 1500 });
      return;
    }
    const dataToExport = students.map((s, i) => ({
      No: i + 1,
      NIS: s.studentCode,
      Username: s.username,
      "Nama Lengkap": s.name,
      "Kelas": s.classGroup,
      "Jenis Kelamin": s.gender === "L" ? "Laki-laki" : "Perempuan",
      "Tempat Lahir": s.birthPlace || "-",
      "Poin": s.points,
      "Gelar Aktif": s.activeTitle || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa Ekskul TIK");
    XLSX.writeFile(
      workbook,
      `Data_Siswa_EkskulTIK_Kelas_${filterClass}.xlsx`
    );
    show({ type: "success", title: t("admin.student.success"), description: t("admin.student.exportSuccessDesc"), autoCloseDelay: 1500 });
  };

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NIS: "123456",
        Username: "siswa_123456",
        "Nama Lengkap": "Contoh Nama Siswa",
        "Kelas": "5",
        "Jenis Kelamin": "L",
        "Tempat Lahir": "Bandung",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Siswa");
    XLSX.writeFile(workbook, "Template_Import_Siswa.xlsx");
    show({ type: "success", title: t("admin.student.success"), description: t("admin.student.templateSuccessDesc"), autoCloseDelay: 1500 });
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          show({ type: "error", title: t("admin.student.failed"), description: t("admin.student.emptyDataDesc"), autoCloseDelay: 1500 });
          return;
        }

        const mappedData = data.map((row: any) => ({
          username: String(row["Username"] || ""),
          name: String(row["Nama Lengkap"] || ""),
          studentCode: String(row["NIS"] || ""),
          classGroup: String(row["Kelas"] || ""),
          gender: String(row["Jenis Kelamin"] || "L"),
          birthPlace: String(row["Tempat Lahir"] || ""),
        })).filter(r => r.username && r.name && r.studentCode && r.classGroup);

        if (mappedData.length === 0) {
          show({ type: "error", title: t("admin.student.failed"), description: t("admin.student.invalidFormatDesc"), autoCloseDelay: 1500 });
          return;
        }

        await importStudentsFromExcel(mappedData);
        show({ type: "success", title: t("admin.student.importSuccess"), description: `${t("admin.student.importSuccessDesc1")}${mappedData.length}${t("admin.student.importSuccessDesc2")}`, autoCloseDelay: 2000 });
        loadStudents();
      } catch {
        show({ type: "error", title: t("admin.student.failed"), description: t("admin.student.importErrorDesc"), autoCloseDelay: 1500 });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

  const loadMonthlyReport = async () => {
    try {
      const res = await getAdminMonthlyReport(reportMonthStart, reportMonthEnd, reportYear, filterClass);
      if (res.success) {
        setReportData(res.records);
        setShowReportModal(true);
      }
    } catch {
      show({ type: 'error', title: 'Perhatian', description: 'Gagal memuat laporan', autoCloseDelay: 2500 });
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
      `Laporan_Presensi_TIK_Admin_${filterClass}_Bulan${reportMonthStart}-${reportMonthEnd}_${reportYear}.xlsx`
    );
    show({ type: 'success', title: 'Sukses', description: 'Laporan Excel berhasil diunduh.', autoCloseDelay: 1500 });
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-[#dddddd] airbnb-shadow-sm overflow-hidden">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5 bg-[#f7f7f7] px-3 py-1 rounded-full mb-2 border border-[#ebebeb]">
            <Sparkles className="w-3.5 h-3.5 text-[#ff385c]" />
            <span className="text-xs font-semibold text-[#222222]">
              {t("admin.student.pageTitle")}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#222222]">
            {t("admin.student.pageSubtitle")}
          </h1>
          <p className="text-sm text-[#6a6a6a]">
            {t("admin.student.pageDesc")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
          {/* Unduh Template */}
          <button
            onClick={handleDownloadTemplate}
            className="bg-white hover:bg-[#f7f7f7] text-[#222222] border border-[#dddddd] font-semibold text-xs px-2 py-2 sm:px-3.5 sm:py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
            title={t("admin.student.templateBtnTitle")}
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6a6a6a]" />
            <span className="hidden sm:inline">{t("admin.student.templateBtn")}</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="bg-white hover:bg-[#f7f7f7] text-[#222222] border border-[#dddddd] font-semibold text-xs px-2 py-2 sm:px-3.5 sm:py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff385c]" />
            <span className="hidden sm:inline">{t("admin.student.exportBtn")}</span>
            <span className="sm:hidden">{t("admin.student.exportBtnMobile")}</span>
          </button>

          {/* Import Excel */}
          <label className="bg-white hover:bg-[#f7f7f7] text-[#222222] border border-[#dddddd] font-semibold text-xs px-2 py-2 sm:px-3.5 sm:py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto">
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff385c]" />
            <span className="hidden sm:inline">{t("admin.student.importBtn")}</span>
            <span className="sm:hidden">{t("admin.student.importBtnMobile")}</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>

          {/* Cetak Laporan */}
          <button
            onClick={loadMonthlyReport}
            className="bg-[#222222] hover:bg-[#ff385c] text-white border border-[#222222] font-semibold text-xs px-2 py-2 sm:px-3.5 sm:py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Cetak Laporan</span>
            <span className="sm:hidden">Laporan</span>
          </button>

          {/* Tambah Siswa */}
          <button
            onClick={openAddModal}
            className="col-span-2 sm:col-span-1 bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-colors airbnb-shadow-sm flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t("admin.student.addBtn")}</span>
          </button>
        </div>
      </div>

      {/* Bar Filter {t("admin.student.classLabel")} & Action Bulk */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f7f7f7] p-4 rounded-xl border border-[#ebebeb]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#6a6a6a]" />
          <span className="text-xs font-semibold uppercase text-[#6a6a6a]">
            Filter {t("admin.student.classLabel")}:
          </span>
          <div className="flex rounded-lg bg-white border border-[#dddddd] p-0.5">
            {["ALL", "5", "6"].map((cls) => (
              <button
                key={cls}
                onClick={() => setFilterClass(cls)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  filterClass === cls
                    ? "bg-[#222222] text-white"
                    : "text-[#6a6a6a] hover:text-[#222222]"
                }`}
              >
                {cls === "ALL" ? t("admin.student.allClasses") : `${t("admin.student.classPrefix")}${cls}`}
              </button>
            ))}
          </div>
        </div>

        {/* Action Pindah {t("admin.student.classLabel")} Massal (Bulk Move) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-[#dddddd] airbnb-shadow-sm">
            <span className="text-xs font-bold text-[#ff385c]">
              {selectedIds.length} {t("admin.student.selectedStudents")}
            </span>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="bg-[#222222] hover:bg-[#3f3f3f] text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{t("admin.student.bulkMoveBtn")}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabel Siswa Ekskul TIK */}
      <div className="bg-white border border-[#dddddd] rounded-2xl overflow-hidden airbnb-shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f7f7] border-b border-[#dddddd] text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
                <th className="py-4 px-4 w-12 text-center">
                  <button
                    onClick={toggleSelectAll}
                    className="text-[#6a6a6a] hover:text-[#222222] cursor-pointer"
                  >
                    {selectedIds.length === students.length &&
                    students.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-[#ff385c]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-4 px-4">{t("admin.student.tableCol1")}</th>
                <th className="py-4 px-4">{t("admin.student.tableCol2")}</th>
                <th className="py-4 px-4">{t("admin.student.tableCol3")}</th>
                <th className="py-4 px-4 text-center">{t("admin.student.tableCol4")}</th>
                <th className="py-4 px-4 text-center">{t("admin.student.tableCol5")}</th>
                <th className="py-4 px-4 text-right">{t("admin.student.tableCol6")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebebeb] text-sm text-[#222222]">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6a6a6a]">
                    {t("admin.student.noStudents")}
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-[#f7f7f7]/60 transition-colors"
                  >
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => toggleSelectOne(st.id)}
                        className="text-[#6a6a6a] hover:text-[#222222] cursor-pointer"
                      >
                        {selectedIds.includes(st.id) ? (
                          <CheckSquare className="w-4 h-4 text-[#ff385c]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      <div>
                        <p className="font-bold text-[#222222]">{st.name}</p>
                        <p className="text-xs text-[#6a6a6a]">
                          NIS: {st.studentCode} • @{st.username}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-[#f7f7f7] border border-[#ebebeb]">
                        {t("admin.student.classLabel")} {st.classGroup}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-[#6a6a6a]">
                      <p>
                        {st.gender === "L" ? t("admin.student.maleLabel") : t("admin.student.femaleLabel")}
                      </p>
                      <p>{st.birthPlace || "Bandung"}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-[#ff385c]">
                        {st.points} {t("admin.student.pointsText")}
                      </span>
                      {st.activeTitle && (
                        <p className="text-[11px] text-[#6a6a6a]">
                          {st.activeTitle}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setSelectedStudentQR(st)}
                        className="inline-flex items-center gap-1 bg-white hover:bg-[#f7f7f7] border border-[#dddddd] px-3 py-1.5 rounded-lg text-xs font-semibold text-[#222222] transition-colors airbnb-shadow-sm cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5 text-[#ff385c]" />
                        <span>{t("admin.student.ktaBtn")}</span>
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(st)}
                          className="p-2 text-[#6a6a6a] hover:text-[#222222] hover:bg-[#f7f7f7] rounded-lg transition-colors cursor-pointer"
                          title={t("admin.student.editTitle")}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(st.id)}
                          className="p-2 text-[#6a6a6a] hover:text-[#c13515] hover:bg-[#ffd1da]/30 rounded-lg transition-colors cursor-pointer"
                          title={t("admin.student.deleteTitle")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit Siswa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-[#dddddd] airbnb-shadow my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#222222]">
                {editingId ? t("admin.student.editTitle") : t("admin.student.addTitle")}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#929292] hover:text-[#222222]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                    {t("admin.student.nisLabel")}
                  </label>
                  <input
                    type="text"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    placeholder="Contoh: 20260501"
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                    {t("admin.student.usernameLabel")}
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: andi5"
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                  {t("admin.student.nameLabel")}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Andi Pratama"
                  className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                    {t("admin.student.classLabel")}
                  </label>
                  <select
                    value={classGroup}
                    onChange={(e) => setClassGroup(e.target.value)}
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd]"
                  >
                    <option value="5">{t("admin.student.classLabel")} 5</option>
                    <option value="6">{t("admin.student.classLabel")} 6</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd]"
                  >
                    <option value="L">{t("admin.student.maleLabel")}</option>
                    <option value="P">{t("admin.student.femaleLabel")}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                    {t("admin.student.birthPlaceLabel")}
                  </label>
                  <input
                    type="text"
                    value={birthPlace}
                    onChange={(e) => setBirthPlace(e.target.value)}
                    placeholder="Bandung"
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                  {t("admin.student.passwordLabel")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingId ? "Kosongkan jika tidak ingin mengubah password" : "Default: siswa123"}
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6a6a6a] hover:text-[#222222]"
                    title={showPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ebebeb]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-[#222222] bg-white border border-[#dddddd] rounded-lg"
                >
                  {t("admin.student.cancelBtn")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-lg"
                >
                  {editingId ? t("admin.student.saveBtn") : "Tambah Siswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pindah {t("admin.student.classLabel")} Massal (Bulk Move Class) */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dddddd] airbnb-shadow">
            <h3 className="text-lg font-bold text-[#222222] mb-2">
              Pindah {t("admin.student.classLabel")} Massal ({selectedIds.length}{t("admin.student.bulkMoveModalTitle2")}
            </h3>
            <p className="text-sm text-[#6a6a6a] mb-4">
              {t("admin.student.bulkMoveModalDesc")}
            </p>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-2">
                Pindah ke {t("admin.student.classLabel")}:
              </label>
              <select
                value={targetMoveClass}
                onChange={(e) => setTargetMoveClass(e.target.value)}
                className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-3 border border-[#dddddd]"
              >
                <option value="5">{t("admin.student.classLabel")} 5</option>
                <option value="6">{t("admin.student.classLabel")} 6</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-[#222222] bg-white border border-[#dddddd] rounded-lg"
              >
                {t("admin.student.cancelBtn")}
              </button>
              <button
                onClick={handleBulkMove}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#222222] hover:bg-[#ff385c] rounded-lg"
              >
                Konfirmasi Pindah {t("admin.student.classLabel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal KTA Digital QR Code */}
      <StudentQRCardModal
        isOpen={!!selectedStudentQR}
        onClose={() => setSelectedStudentQR(null)}
        student={selectedStudentQR}
      />

      {/* ConfirmModal Hapus Siswa */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("admin.student.deleteModalTitle")}
        description={t("admin.student.deleteModalDesc")}
        confirmText={t("admin.student.confirmDeleteBtn")}
        isDanger={true}
      />


      {/* MODAL CETAK LAPORAN (ADMIN) */}
      {showReportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full p-6 sm:p-8 border border-[#dddddd] airbnb-shadow my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#ebebeb]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff385c] block">
                  LAPORAN KEHADIRAN BULANAN
                </span>
                <h3 className="text-xl font-bold text-[#222222]">
                  Laporan Ekskul TIK (Admin) {filterClass !== "ALL" ? `- Kelas ${filterClass}` : "- Semua Kelas"}
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
                  <span>Unduh Excel</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-[#ff385c] hover:bg-[#e00b41] text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak PDF</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-[#929292] hover:text-[#222222] ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f7f7] border border-[#222222] text-[#222222] uppercase">
                    <th className="py-3 px-3 border border-[#222222] text-center w-10">No</th>
                    <th className="py-3 px-3 border border-[#222222]">NIS</th>
                    <th className="py-3 px-3 border border-[#222222]">Username</th>
                    <th className="py-3 px-3 border border-[#222222]">Nama Lengkap</th>
                    <th className="py-3 px-3 border border-[#222222] text-center">Kelas</th>
                    <th className="py-3 px-3 border border-[#222222] text-center">Hadir (H)</th>
                    <th className="py-3 px-3 border border-[#222222] text-center">Izin (I)</th>
                    <th className="py-3 px-3 border border-[#222222] text-center">Alpha (A)</th>
                    <th className="py-3 px-3 border border-[#222222] text-center">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-[#6a6a6a]">
                        Belum ada data absensi pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    reportData.map((row, idx) => (
                      <tr key={idx} className="border border-[#222222]">
                        <td className="py-2 px-3 border border-[#222222] text-center">{row.no}</td>
                        <td className="py-2 px-3 border border-[#222222] font-mono">{row.studentCode}</td>
                        <td className="py-2 px-3 border border-[#222222]">{row.username}</td>
                        <td className="py-2 px-3 border border-[#222222] font-semibold">{row.name}</td>
                        <td className="py-2 px-3 border border-[#222222] text-center">{row.classGroup}</td>
                        <td className="py-2 px-3 border border-[#222222] text-center">{row.hadir}</td>
                        <td className="py-2 px-3 border border-[#222222] text-center">{row.izin}</td>
                        <td className="py-2 px-3 border border-[#222222] text-center">{row.alpha}</td>
                        <td className="py-2 px-3 border border-[#222222] text-center font-bold text-[#ff385c]">
                          {row.percentage}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Print Signatures */}
            <div className="mt-8 pt-8 border-t border-[#ebebeb] hidden print:flex justify-between items-end text-sm text-[#222222]">
              <div className="text-center">
                <p>Mengetahui,</p>
                <p className="font-bold mt-16">Admin Utama LMS</p>
                <p className="text-xs text-[#6a6a6a]">SDN 231 Sukaasih</p>
              </div>
              <div className="text-center">
                <p>Bandung, {new Date().toLocaleDateString("id-ID")}</p>
                <p className="font-bold mt-16">Dicetak Oleh</p>
                <p className="text-xs text-[#6a6a6a]">Sistem Admin</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
