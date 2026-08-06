"use client";

import { useEffect, useState } from "react";
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

  // Delete Confirm Modal
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);


  const { show } = useNotificationModal();

  const loadStudents = async () => {
    try {
      const data = await getStudentsList(filterClass);
      setStudents(data);
      setSelectedIds([]);
    } catch {
      show({ type: "error", title: "Gagal", description: "Gagal memuat daftar siswa", autoCloseDelay: 1500 });
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
      show({ type: "error", title: "Gagal", description: "Username, Nama, dan NIS/Kode QR wajib diisi", autoCloseDelay: 1500 });
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
        show({

          type: "success",
          title: "Data Siswa Diperbarui! 👤",
          description: `Informasi siswa "${name}" (Kelas ${classGroup}) telah diperbarui pada database sekolah.`,
          badgeText: `NIS: ${studentCode}`,
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
          title: "Siswa Baru Ditambahkan! 🎉",
          description: `Siswa atas nama "${name}" resmi terdaftar di Kelas ${classGroup} dengan KTA Digital aktif.`,
          badgeText: `Username: ${username}`,
        });
      }
      setIsModalOpen(false);
      loadStudents();
    } catch {
      show({

        type: "error",
        title: "Gagal Menyimpan Data ⚠️",
        description:
          "Periksa kembali apakah Username atau NIS/Kode QR sudah digunakan siswa lain.",
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
        title: "Data Siswa Dihapus 🗑️",
        description:
          "Siswa telah dihapus dari sistem LMS dan KTA Digital dinonaktifkan.",
      });
    } catch {
      show({

        type: "error",
        title: "Gagal Menghapus Siswa ⚠️",
        description: "Terjadi kesalahan saat menghapus data siswa dari server.",
      });
    }
  };

  const handleBulkMove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await bulkMoveStudentClass(selectedIds, targetMoveClass);
      show({ type: "success", title: "Berhasil", autoCloseDelay: 1500, description: 
        `${selectedIds.length} siswa berhasil dipindahkan ke Kelas ${targetMoveClass}!`
      });
      setIsBulkModalOpen(false);
      loadStudents();
    } catch {
      show({ type: "error", title: "Gagal", description: "Gagal memindahkan kelas", autoCloseDelay: 1500 });
    }
  };

  // Ekspor ke Excel (.xlsx)
  const handleExportExcel = () => {
    if (students.length === 0) {
      show({ type: "error", title: "Gagal", description: "Tidak ada data siswa untuk diekspor", autoCloseDelay: 1500 });
      return;
    }
    const dataToExport = students.map((s, i) => ({
      No: i + 1,
      NIS: s.studentCode,
      Username: s.username,
      "Nama Lengkap": s.name,
      Kelas: s.classGroup,
      "Jenis Kelamin": s.gender === "L" ? "Laki-laki" : "Perempuan",
      "Tempat Lahir": s.birthPlace || "-",
      Poin: s.points,
      "Gelar Aktif": s.activeTitle || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Siswa Ekskul TIK");
    XLSX.writeFile(
      workbook,
      `Data_Siswa_EkskulTIK_Kelas_${filterClass}.xlsx`
    );
    show({ type: "success", title: "Berhasil", description: "Data Excel berhasil diunduh!", autoCloseDelay: 1500 });
  };

  // Unduh Template Excel Kosong
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NIS: "123456",
        Username: "siswa_123456",
        "Nama Lengkap": "Contoh Nama Siswa",
        Kelas: "5",
        "Jenis Kelamin": "L",
        "Tempat Lahir": "Bandung",
      },
      {
        NIS: "123457",
        Username: "siswa_123457",
        "Nama Lengkap": "Contoh Siswa Kedua",
        Kelas: "6",
        "Jenis Kelamin": "P",
        "Tempat Lahir": "Jakarta",
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template Siswa");
    XLSX.writeFile(workbook, "Template_Import_Siswa.xlsx");
    show({ type: "success", title: "Berhasil", description: "Template Excel berhasil diunduh!", autoCloseDelay: 1500 });
  };

  // Impor dari Excel (.xlsx)
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const wsName = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsName];
        const json = XLSX.utils.sheet_to_json(ws) as Array<Record<string, any>>;

        if (json.length === 0) {
          show({ type: "error", title: "Gagal", description: "File Excel kosong", autoCloseDelay: 1500 });
          return;
        }

        const formatted = json.map((row) => ({
          username: String(
            row["Username"] || row["username"] || `siswa_${row["NIS"] || row["studentCode"]}`
          ),
          name: String(row["Nama Lengkap"] || row["name"] || "Siswa"),
          studentCode: String(row["NIS"] || row["studentCode"] || Date.now()),
          classGroup: String(row["Kelas"] || row["classGroup"] || "5"),
          gender: String(row["Jenis Kelamin"] || row["gender"] || "L").startsWith("P")
            ? "P"
            : "L",
          birthPlace: String(row["Tempat Lahir"] || row["birthPlace"] || "Bandung"),
        }));

        const res = await importStudentsFromExcel(formatted);
        show({ type: "success", title: "Berhasil", autoCloseDelay: 1500, description: `Berhasil mengimpor ${res.count} data siswa!` });
        loadStudents();
      } catch {
        show({ type: "error", title: "Gagal", description: "Format file Excel tidak sesuai. Gunakan kolom NIS, Nama Lengkap, Kelas.", autoCloseDelay: 2500 });
      }
    };
    reader.readAsBinaryString(file);
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
              Manajemen Rombongan Belajar
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#222222]">
            Data Siswa & KTA Digital QR
          </h1>
          <p className="text-sm text-[#6a6a6a]">
            Kelola siswa Kelas 5 & 6, cetak kartu KTA QR, perpindahan kelas
            massal (Bulk Move), serta ekspor/impor Excel.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
          {/* Unduh Template */}
          <button
            onClick={handleDownloadTemplate}
            className="bg-white hover:bg-[#f7f7f7] text-[#222222] border border-[#dddddd] font-semibold text-xs px-2 py-2 sm:px-3.5 sm:py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
            title="Unduh Template Excel Kosong"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6a6a6a]" />
            <span className="hidden sm:inline">Template</span>
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="bg-white hover:bg-[#f7f7f7] text-[#222222] border border-[#dddddd] font-semibold text-xs px-2 py-2 sm:px-3.5 sm:py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff385c]" />
            <span className="hidden sm:inline">Ekspor Excel</span>
            <span className="sm:hidden">Ekspor</span>
          </button>

          {/* Import Excel */}
          <label className="bg-white hover:bg-[#f7f7f7] text-[#222222] border border-[#dddddd] font-semibold text-xs px-2 py-2 sm:px-3.5 sm:py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto">
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff385c]" />
            <span className="hidden sm:inline">Impor Excel</span>
            <span className="sm:hidden">Impor</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
            />
          </label>

          {/* Tambah Siswa */}
          <button
            onClick={openAddModal}
            className="col-span-2 sm:col-span-1 bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold text-xs sm:text-sm px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg transition-colors airbnb-shadow-sm flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Bar Filter Kelas & Action Bulk */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f7f7f7] p-4 rounded-xl border border-[#ebebeb]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#6a6a6a]" />
          <span className="text-xs font-semibold uppercase text-[#6a6a6a]">
            Filter Kelas:
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
                {cls === "ALL" ? "Semua Kelas" : `Kelas ${cls}`}
              </button>
            ))}
          </div>
        </div>

        {/* Action Pindah Kelas Massal (Bulk Move) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-[#dddddd] airbnb-shadow-sm">
            <span className="text-xs font-bold text-[#ff385c]">
              {selectedIds.length} Siswa Terpilih
            </span>
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="bg-[#222222] hover:bg-[#3f3f3f] text-white text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Pindah Kelas Massal</span>
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
                <th className="py-4 px-4">Nama Lengkap & NIS</th>
                <th className="py-4 px-4">Kelas</th>
                <th className="py-4 px-4">Gender & TTL</th>
                <th className="py-4 px-4 text-center">Poin & Gelar</th>
                <th className="py-4 px-4 text-center">KTA Digital</th>
                <th className="py-4 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebebeb] text-sm text-[#222222]">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6a6a6a]">
                    Tidak ada siswa pada filter ini
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
                        Kelas {st.classGroup}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-[#6a6a6a]">
                      <p>
                        {st.gender === "L" ? "Laki-laki (L)" : "Perempuan (P)"}
                      </p>
                      <p>{st.birthPlace || "Bandung"}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-bold text-[#ff385c]">
                        {st.points} Poin
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
                        <span>KTA QR</span>
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(st)}
                          className="p-2 text-[#6a6a6a] hover:text-[#222222] hover:bg-[#f7f7f7] rounded-lg transition-colors cursor-pointer"
                          title="Edit Siswa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(st.id)}
                          className="p-2 text-[#6a6a6a] hover:text-[#c13515] hover:bg-[#ffd1da]/30 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Siswa"
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
                {editingId ? "Edit Siswa" : "Tambah Siswa Baru"}
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
                    NIS / Kode QR
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
                    Username Login
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!!editingId}
                    placeholder="Contoh: andi5"
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd] disabled:opacity-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                  Nama Lengkap Siswa
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
                    Kelas
                  </label>
                  <select
                    value={classGroup}
                    onChange={(e) => setClassGroup(e.target.value)}
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd]"
                  >
                    <option value="5">Kelas 5</option>
                    <option value="6">Kelas 6</option>
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
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                    Kota Lahir
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

              {!editingId && (
                <div>
                  <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                    Password Awal
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Default: siswa123"
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ebebeb]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-[#222222] bg-white border border-[#dddddd] rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-lg"
                >
                  {editingId ? "Simpan Perubahan" : "Tambah Siswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pindah Kelas Massal (Bulk Move Class) */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-[#dddddd] airbnb-shadow">
            <h3 className="text-lg font-bold text-[#222222] mb-2">
              Pindah Kelas Massal ({selectedIds.length} Siswa)
            </h3>
            <p className="text-sm text-[#6a6a6a] mb-4">
              Pilih kelas baru untuk memindahkan seluruh siswa yang terpilih
              sekaligus:
            </p>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-2">
                Pindah ke Kelas:
              </label>
              <select
                value={targetMoveClass}
                onChange={(e) => setTargetMoveClass(e.target.value)}
                className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-3 border border-[#dddddd]"
              >
                <option value="5">Kelas 5</option>
                <option value="6">Kelas 6</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold text-[#222222] bg-white border border-[#dddddd] rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleBulkMove}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#222222] hover:bg-[#ff385c] rounded-lg"
              >
                Konfirmasi Pindah Kelas
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
        title="Hapus Data Siswa"
        description="Apakah Anda yakin ingin menghapus data siswa ini? Semua progres belajar, kuis, dan riwayat presensi siswa juga akan terhapus."
        confirmText="Hapus Siswa"
        isDanger={true}
      />


    </div>
  );
}
