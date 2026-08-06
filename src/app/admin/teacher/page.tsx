"use client";

import { useEffect, useState } from "react";
import {
  UserCheck,
  Plus,
  Trash2,
  Edit,
  KeyRound,
  Sparkles,
  Users,
} from "lucide-react";
import { useNotificationModal } from "@/providers/NotificationProvider";
import ConfirmModal from "@/components/ui/ConfirmModal";
import NotificationModal from "@/components/ui/NotificationModal";
import {
  getTeachersList,
  createTeacher,
  updateTeacher,
  resetTeacherPassword,
  deleteTeacher,
} from "../actions";

interface TeacherItem {
  id: string;
  username: string;
  name: string;
  nip: string | null;
  classGroup: string;
  activeTitle: string | null;
}

export default function AdminTeachersPage() {
  const { show } = useNotificationModal();

  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State Modal Tambah/Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [nip, setNip] = useState("");
  const [classGroup, setClassGroup] = useState("5");
  const [password, setPassword] = useState("");

  // Form Reset Password Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");

  // Confirm Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const loadTeachers = async () => {
    try {
      const data = await getTeachersList();
      setTeachers(data);
    } catch {
      show({ type: 'error', title: 'Perhatian', description: `Gagal memuat data pembina`, autoCloseDelay: 2500 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setUsername("");
    setName("");
    setNip("");
    setClassGroup("5");
    setPassword("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: TeacherItem) => {
    setEditingId(item.id);
    setUsername(item.username);
    setName(item.name);
    setNip(item.nip || "");
    setClassGroup(item.classGroup);
    setPassword("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !name) {
      show({ type: 'error', title: 'Perhatian', description: `Username dan Nama lengkap wajib diisi`, autoCloseDelay: 2500 });
      return;
    }

    try {
      if (editingId) {
        await updateTeacher(editingId, { name, nip, classGroup });
        setNotifModal({
          isOpen: true,
          type: "success",
          title: "Data Pembina Diperbarui! 👨‍🏫",
          description: `Informasi pembina atas nama "${name}" untuk Kelas ${classGroup} telah disimpan.`,
          badgeText: `NIP: ${nip || "-"}`,
        });
      } else {
        await createTeacher({
          username,
          name,
          nip,
          classGroup,
          password: password || "pembina123",
        });
        setNotifModal({
          isOpen: true,
          type: "success",
          title: "Pembina Baru Ditambahkan! 🎉",
          description: `Pembina "${name}" resmi ditugaskan mengampu Kelas ${classGroup}.`,
          badgeText: `Username: ${username}`,
        });
      }
      setIsModalOpen(false);
      loadTeachers();
    } catch {
      setNotifModal({
        isOpen: true,
        type: "error",
        title: "Gagal Menyimpan Data ⚠️",
        description: "Periksa kembali apakah Username sudah digunakan oleh akun lain.",
      });
    }
  };

  const openResetModal = (id: string) => {
    setResetId(id);
    setNewPassword("");
    setIsResetModalOpen(true);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetId || !newPassword) return;
    try {
      await resetTeacherPassword(resetId, newPassword);
      setIsResetModalOpen(false);
      setNotifModal({
        isOpen: true,
        type: "success",
        title: "Password Berhasil Direset! 🔑",
        description: "Kata sandi baru untuk akun pembina telah diperbarui.",
        badgeText: "Keamanan Akun",
      });
    } catch {
      setNotifModal({
        isOpen: true,
        type: "error",
        title: "Gagal Mereset Password ⚠️",
        description: "Terjadi kesalahan saat memperbarui kata sandi akun pembina.",
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
      await deleteTeacher(deleteId);
      setIsDeleteModalOpen(false);
      loadTeachers();
      setNotifModal({
        isOpen: true,
        type: "success",
        title: "Akun Pembina Dihapus 🗑️",
        description: "Akun pembina telah dihapus dari sistem LMS sekolah.",
      });
    } catch {
      setNotifModal({
        isOpen: true,
        type: "error",
        title: "Gagal Menghapus Pembina ⚠️",
        description: "Terjadi kesalahan saat mencoba menghapus akun pembina.",
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
              Manajemen Tenaga Pendidik
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#222222]">
            Wali Pembina Ekskul TIK (Kelas 5 & 6)
          </h1>
          <p className="text-sm text-[#6a6a6a]">
            Kelola akun guru pendamping untuk pemantauan presensi dan progres
            siswa per kelas.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold text-sm px-5 py-3 rounded-lg transition-colors airbnb-shadow-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pembina TIK</span>
        </button>
      </div>

      {/* Grid Kartu Pembina */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((t) => (
          <div
            key={t.id}
            className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm hover:airbnb-shadow flex flex-col justify-between card-transition"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-semibold bg-[#222222] text-white px-3 py-1 rounded-full">
                  Kelas {t.classGroup}
                </span>
                <span className="text-xs font-medium text-[#6a6a6a]">
                  @{t.username}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#f7f7f7] border border-[#ebebeb] flex items-center justify-center text-lg font-bold text-[#ff385c]">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#222222]">
                    {t.name}
                  </h3>
                  <p className="text-xs text-[#6a6a6a]">
                    NIP: {t.nip || "Belum dicantumkan"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#6a6a6a] bg-[#f7f7f7] p-3 rounded-xl border border-[#ebebeb]">
                <Users className="w-4 h-4 text-[#ff385c]" />
                <span>Pengampu dan Koordinator Siswa Kelas {t.classGroup}</span>
              </div>
            </div>

            <div className="border-t border-[#ebebeb] pt-4 mt-6 flex items-center justify-between text-xs">
              <button
                onClick={() => openResetModal(t.id)}
                className="flex items-center gap-1.5 text-[#6a6a6a] hover:text-[#222222] font-semibold p-1.5 rounded-lg hover:bg-[#f7f7f7] transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-[#ff385c]" />
                <span>Reset Password</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(t)}
                  className="p-2 text-[#6a6a6a] hover:text-[#222222] hover:bg-[#f7f7f7] rounded-lg transition-colors cursor-pointer"
                  title="Edit Data Guru"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => confirmDelete(t.id)}
                  className="p-2 text-[#6a6a6a] hover:text-[#c13515] hover:bg-[#ffd1da]/30 rounded-lg transition-colors cursor-pointer"
                  title="Hapus Akun"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah/Edit Pembina */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-[#dddddd] airbnb-shadow">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#222222]">
                {editingId ? "Edit Pembina TIK" : "Tambah Pembina TIK Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#929292] hover:text-[#222222]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={!!editingId}
                  placeholder="Contoh: pembina5"
                  className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd] disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Pak Budi S.Pd"
                  className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                  NIP (Opsional)
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => setNip(e.target.value)}
                  placeholder="Nomor Induk Pegawai..."
                  className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                  Kelas Pengampu
                </label>
                <select
                  value={classGroup}
                  onChange={(e) => setClassGroup(e.target.value)}
                  className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd]"
                >
                  <option value="5">Kelas 5 (Semua Rombel)</option>
                  <option value="6">Kelas 6 (Semua Rombel)</option>
                </select>
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
                    placeholder="Default: pembina123"
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
                  {editingId ? "Simpan Perubahan" : "Tambah Pembina"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reset Password */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-[#dddddd] airbnb-shadow">
            <h3 className="text-lg font-bold text-[#222222] mb-4">
              Reset Password Pembina
            </h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                  Password Baru
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Masukkan kata sandi baru..."
                  className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd]"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ebebeb]">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-5 py-2 text-sm font-semibold text-[#222222] bg-white border border-[#dddddd] rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-lg"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ConfirmModal Hapus Akun */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Hapus Akun Pembina TIK"
        description="Apakah Anda yakin ingin menghapus akun pembina ini? Akses login pembina bersangkutan akan segera dicabut."
        confirmText="Hapus Akun"
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
