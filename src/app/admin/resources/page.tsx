"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit,
  FileText,
  Video,
  Link as LinkIcon,
  HelpCircle,
  Award,
  Sparkles,
  HardDrive,
} from "lucide-react";
import { useNotificationModal } from "@/providers/NotificationProvider";
import ConfirmModal from "@/components/ui/ConfirmModal";
import NotificationModal from "@/components/ui/NotificationModal";
import SmartEmbedViewer from "@/components/ui/SmartEmbedViewer";
import {
  getCourseResourcesList,
  createCourseResource,
  updateCourseResource,
  deleteCourseResource,
} from "../actions";

interface CourseItem {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  content: string;
  fileUrl: string | null;
  quizConfig: string | null;
  pointsReward: number;
  createdAt: Date;
  _count?: {
    studentProgress: number;
    quizAttempts: number;
  };
}

export default function AdminResourcesPage() {
  const { show } = useNotificationModal();

  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Hardware & Software");
  const [type, setType] = useState("TEXT");
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [pointsReward, setPointsReward] = useState("25");

  // State untuk Kuis Interaktif (Pilihan Ganda A-D)
  const [hasQuiz, setHasQuiz] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");

  // Confirm Delete State
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State NotificationModal
  const [notifModal, setNotifModal] = useState<{
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

  const loadResources = async () => {
    try {
      const data = await getCourseResourcesList();
      setResources(
        data.map((r) => ({
          ...r,
          createdAt: new Date(r.createdAt),
        }))
      );
    } catch {
      show({ type: 'error', title: 'Perhatian', description: `Gagal memuat daftar materi`, autoCloseDelay: 2500 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory("Hardware & Software");
    setType("TEXT");
    setContent("");
    setFileUrl("");
    setPointsReward("25");
    setHasQuiz(false);
    setQuizQuestion("");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("A");
    setIsModalOpen(true);
  };

  const openEditModal = (item: CourseItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description || "");
    setCategory(item.category || "Hardware & Software");
    setType(item.type);
    setContent(item.content);
    setFileUrl(item.fileUrl || "");
    setPointsReward((item.pointsReward || 25).toString());

    if (item.quizConfig) {
      try {
        const q = JSON.parse(item.quizConfig);
        setHasQuiz(true);
        setQuizQuestion(q.question || "");
        setOptionA(q.options?.A || "");
        setOptionB(q.options?.B || "");
        setOptionC(q.options?.C || "");
        setOptionD(q.options?.D || "");
        setCorrectAnswer(q.correctAnswer || "A");
      } catch {
        setHasQuiz(false);
      }
    } else {
      setHasQuiz(false);
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      show({ type: 'error', title: 'Perhatian', description: `Judul dan isi materi wajib diisi`, autoCloseDelay: 2500 });
      return;
    }

    let quizConfigStr = undefined;
    if (hasQuiz) {
      if (!quizQuestion || !optionA || !optionB || !optionC || !optionD) {
        show({ type: 'error', title: 'Perhatian', description: `Seluruh opsi soal kuis (A, B, C, D) wajib diisi`, autoCloseDelay: 2500 });
        return;
      }
      quizConfigStr = JSON.stringify({
        question: quizQuestion,
        options: {
          A: optionA,
          B: optionB,
          C: optionC,
          D: optionD,
        },
        correctAnswer,
      });
    }

    try {
      if (editingId) {
        await updateCourseResource(editingId, {
          title,
          description,
          category,
          type,
          content,
          fileUrl,
          quizConfig: quizConfigStr,
          pointsReward: Number(pointsReward),
        });
        setNotifModal({
          isOpen: true,
          type: "success",
          title: "Materi TIK Diperbarui! 📚",
          description: `Materi "${title}" berhasil diperbarui dalam kurikulum LMS sekolah.`,
          badgeText: `Kategori: ${category}`,
        });
      } else {
        await createCourseResource({
          title,
          description,
          category,
          type,
          content,
          fileUrl,
          quizConfig: quizConfigStr,
          pointsReward: Number(pointsReward),
        });
        setNotifModal({
          isOpen: true,
          type: "success",
          title: "Materi TIK Baru Ditambahkan! 🚀",
          description: `Modul materi "${title}" siap diakses dan dipelajari oleh siswa.`,
          badgeText: `Hadiah: +${pointsReward} Poin`,
        });
      }
      setIsModalOpen(false);
      loadResources();
    } catch {
      setNotifModal({
        isOpen: true,
        type: "error",
        title: "Gagal Menyimpan Materi ⚠️",
        description:
          "Terjadi kesalahan saat menyimpan materi TIK. Silakan coba kembali.",
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
      await deleteCourseResource(deleteId);
      setIsDeleteModalOpen(false);
      loadResources();
      setNotifModal({
        isOpen: true,
        type: "success",
        title: "Materi TIK Dihapus 🗑️",
        description:
          "Materi pelajaran telah resmi dihapus dari kurikulum LMS sekolah.",
      });
    } catch {
      setNotifModal({
        isOpen: true,
        type: "error",
        title: "Gagal Menghapus Materi ⚠️",
        description:
          "Terjadi kesalahan saat mencoba menghapus materi TIK ini.",
      });
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#dddddd] airbnb-shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#f7f7f7] px-3 py-1 rounded-full mb-2 border border-[#ebebeb]">
            <Sparkles className="w-3.5 h-3.5 text-[#ff385c]" />
            <span className="text-xs font-semibold text-[#222222]">
              LMS Core Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#222222]">
            Kurator Materi & Kuis TIK
          </h1>
          <p className="text-sm text-[#6a6a6a]">
            Kelola modul belajar Ekstrakurikuler TIK untuk Kelas 5 & 6, lengkap
            dengan kuis interaktif A-D berpoin.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold text-sm px-5 py-3 rounded-lg transition-colors airbnb-shadow-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Materi TIK</span>
        </button>
      </div>

      {/* Grid Materi */}
      {resources.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-[#dddddd] rounded-2xl">
          <BookOpen className="w-12 h-12 text-[#929292] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#222222]">
            Belum Ada Materi Pelajaran TIK
          </h3>
          <p className="text-sm text-[#6a6a6a] max-w-md mx-auto mt-1 mb-6">
            Sesuai arahan, database dikosongkan agar Admin dapat menambahkan
            modul materi dan kuis TIK secara mandiri.
          </p>
          <button
            onClick={openAddModal}
            className="bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Materi Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm hover:airbnb-shadow flex flex-col justify-between card-transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-semibold bg-[#f7f7f7] text-[#222222] px-3 py-1 rounded-full border border-[#ebebeb]">
                    {item.category}
                  </span>
                  <span className="text-xs font-semibold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> +{item.pointsReward} Poin
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#222222] mb-2 line-clamp-2">
                  {item.title}
                </h3>

                <p className="text-sm text-[#6a6a6a] mb-4 line-clamp-3 leading-relaxed">
                  {item.description || item.content}
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
                    {item.quizConfig ? "Terdapat Kuis A-D" : "Tanpa Kuis"}
                  </span>
                </div>
              </div>

              <div className="border-t border-[#ebebeb] pt-4 flex items-center justify-between text-xs">
                <span className="text-[#929292]">
                  Selesai: {item._count?.studentProgress || 0} Siswa
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 text-[#6a6a6a] hover:text-[#222222] hover:bg-[#f7f7f7] rounded-lg transition-colors cursor-pointer"
                    title="Edit Materi"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => confirmDelete(item.id)}
                    className="p-2 text-[#6a6a6a] hover:text-[#c13515] hover:bg-[#ffd1da]/30 rounded-lg transition-colors cursor-pointer"
                    title="Hapus Materi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tambah / Edit Materi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-[#dddddd] airbnb-shadow my-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#222222]">
                {editingId ? "Edit Materi TIK" : "Tambah Materi TIK Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#929292] hover:text-[#222222] transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                    Judul Modul
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Pengenalan Scratch Coding"
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd] focus:bg-white focus:border-[#222222] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                    Kategori Ekskul TIK
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd] focus:bg-white focus:border-[#222222] focus:outline-none"
                  >
                    <option value="Hardware & Software">Hardware & Software</option>
                    <option value="Coding & Pemrograman">Coding & Pemrograman</option>
                    <option value="Literasi Digital & Internet">Literasi Digital & Internet</option>
                    <option value="Desain Grafis">Desain Grafis</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                    Tipe Konten
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd] focus:bg-white focus:border-[#222222] focus:outline-none"
                  >
                    <option value="GOOGLE_DRIVE">Google Drive (Docs / Slides / Sheets / PDF)</option>
                    <option value="TEXT">Teks / Artikel Digital</option>
                    <option value="PDF">Dokumen PDF</option>
                    <option value="VIDEO">Video Edukasi</option>
                    <option value="LINK">Tautan Sumber Belajar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                    Poin Hadiah Kelulusan
                  </label>
                  <input
                    type="number"
                    value={pointsReward}
                    onChange={(e) => setPointsReward(e.target.value)}
                    min={10}
                    max={500}
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd] focus:bg-white focus:border-[#222222] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ringkasan tentang modul ini..."
                  className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd] focus:bg-white focus:border-[#222222] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                  Isi Materi Pelajaran
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Tulis materi atau instruksi pembelajaran TIK untuk siswa..."
                  className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd] focus:bg-white focus:border-[#222222] focus:outline-none"
                  required
                />
              </div>

              {/* INPUT URL SHARING GOOGLE DRIVE / MEDIA (SELALU TAMPIL UNTUK SEMUA TIPE) */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider">
                  URL Sharing Google Drive / YouTube / File Eksternal (Opsional)
                </label>
                <input
                  type="text"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="Tempel link Google Drive (PDF, Docs, Slides, Sheets) atau YouTube... (otomatis dikonversi ke Embed)"
                  className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd] focus:bg-white focus:border-[#ff385c] focus:outline-none"
                />
                <p className="text-[11px] text-[#6a6a6a] leading-normal">
                  💡 <span className="font-semibold text-[#222222]">Fitur Pintar:</span> Mendukung link sharing Google Drive, Google Docs, Slides, Sheets, maupun YouTube. Sistem otomatis mengonversi link menjadi tampilan Embed yang responsif di HP/Desktop siswa.
                </p>

                {/* Live Mini Preview di Modal Admin */}
                {fileUrl && fileUrl.startsWith("http") && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-[#ff385c] uppercase mb-1">
                      Pratinjau Embed Responsif:
                    </p>
                    <SmartEmbedViewer
                      url={fileUrl}
                      title={title || "Preview Materi"}
                      type={type}
                      compact={true}
                    />
                  </div>
                )}
              </div>

              {/* Switch Kuis Interaktif */}
              <div className="border-t border-[#ebebeb] pt-4 mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasQuiz}
                    onChange={(e) => setHasQuiz(e.target.checked)}
                    className="w-4 h-4 text-[#ff385c] rounded border-[#dddddd]"
                  />
                  <span className="text-sm font-bold text-[#222222] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#ff385c]" />
                    Sertakan Kuis Interaktif A-D (Berpoin)
                  </span>
                </label>

                {hasQuiz && (
                  <div className="mt-4 p-4 bg-[#f7f7f7] rounded-xl border border-[#ebebeb] space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                        Pertanyaan Kuis
                      </label>
                      <input
                        type="text"
                        value={quizQuestion}
                        onChange={(e) => setQuizQuestion(e.target.value)}
                        placeholder="Contoh: Apa fungsi utama dari monitor komputer?"
                        className="w-full bg-white text-sm text-[#222222] rounded-lg px-3.5 py-2 border border-[#dddddd]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-[#3f3f3f] mb-1">
                          Opsi A
                        </label>
                        <input
                          type="text"
                          value={optionA}
                          onChange={(e) => setOptionA(e.target.value)}
                          placeholder="Menampilkan gambar/visual"
                          className="w-full bg-white text-sm text-[#222222] rounded-lg px-3 py-1.5 border border-[#dddddd]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3f3f3f] mb-1">
                          Opsi B
                        </label>
                        <input
                          type="text"
                          value={optionB}
                          onChange={(e) => setOptionB(e.target.value)}
                          placeholder="Mencetak dokumen kertas"
                          className="w-full bg-white text-sm text-[#222222] rounded-lg px-3 py-1.5 border border-[#dddddd]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3f3f3f] mb-1">
                          Opsi C
                        </label>
                        <input
                          type="text"
                          value={optionC}
                          onChange={(e) => setOptionC(e.target.value)}
                          placeholder="Menyimpan suara audio"
                          className="w-full bg-white text-sm text-[#222222] rounded-lg px-3 py-1.5 border border-[#dddddd]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#3f3f3f] mb-1">
                          Opsi D
                        </label>
                        <input
                          type="text"
                          value={optionD}
                          onChange={(e) => setOptionD(e.target.value)}
                          placeholder="Menghubungkan ke internet"
                          className="w-full bg-white text-sm text-[#222222] rounded-lg px-3 py-1.5 border border-[#dddddd]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                        Kunci Jawaban Benar
                      </label>
                      <select
                        value={correctAnswer}
                        onChange={(e) => setCorrectAnswer(e.target.value)}
                        className="w-full bg-white text-sm text-[#222222] rounded-lg px-3.5 py-2 border border-[#dddddd]"
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ebebeb]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-[#222222] bg-white border border-[#dddddd] rounded-lg hover:bg-[#f7f7f7] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-lg cursor-pointer"
                >
                  {editingId ? "Simpan Perubahan" : "Simpan Materi TIK"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Zero Native Alert: ConfirmModal Hapus Materi */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Materi Pelajaran TIK"
        description="Apakah Anda yakin ingin menghapus materi dan soal kuis ini? Seluruh riwayat penyelesaian siswa pada materi ini juga akan terhapus."
        confirmText="Hapus Materi"
        isDanger={true}
      />

      {/* Modal Notifikasi Sukses / Gagal */}
      <NotificationModal
        isOpen={notifModal.isOpen}
        onClose={() => setNotifModal((prev) => ({ ...prev, isOpen: false }))}
        type={notifModal.type}
        title={notifModal.title}
        description={notifModal.description}
        badgeText={notifModal.badgeText}
        primaryButtonText="Mengerti & Lanjutkan →"
        onPrimaryClick={() =>
          setNotifModal((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}
