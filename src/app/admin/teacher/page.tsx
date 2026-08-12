"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import {
  UserCheck,
  Plus,
  Trash2,
  Edit,
  KeyRound,
  Sparkles,
  Users,
  Eye,
  EyeOff,
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
  const { t } = useLanguage();
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
  const [showPassword, setShowPassword] = useState(false);

  // Form Reset Password Modal
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetId, setResetId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);

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
      show({ type: 'error', title: t("admin.teacher.failed"), description: t("admin.teacher.failedLoad"), autoCloseDelay: 2500 });
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
      show({ type: 'error', title: t("admin.teacher.failed"), description: t("admin.teacher.requiredFields"), autoCloseDelay: 2500 });
      return;
    }

    try {
      if (editingId) {
        await updateTeacher(editingId, { name, nip, classGroup });
        setNotifModal({
          isOpen: true,
          type: "success",
          title: t("admin.teacher.updatedTitle"),
          description: `${t("admin.teacher.updatedDesc1")}${name}${t("admin.teacher.updatedDesc2")}${classGroup}${t("admin.teacher.updatedDesc3")}`,
          badgeText: `${t("admin.teacher.nipBadge")}${nip || "-"}`,
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
          title: t("admin.teacher.addedTitle"),
          description: `${t("admin.teacher.addedDesc1")}${name}${t("admin.teacher.addedDesc2")}${classGroup}.`,
          badgeText: `${t("admin.teacher.usernameBadge")}${username}`,
        });
      }
      setIsModalOpen(false);
      loadTeachers();
    } catch {
      setNotifModal({
        isOpen: true,
        type: "error",
        title: t("admin.teacher.failedSave"),
        description: t("admin.teacher.failedSaveDesc"),
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
        title: t("admin.teacher.resetTitle"),
        description: t("admin.teacher.resetDesc"),
        badgeText: t("admin.teacher.resetBadge"),
      });
    } catch {
      setNotifModal({
        isOpen: true,
        type: "error",
        title: t("admin.teacher.failedReset"),
        description: t("admin.teacher.failedResetDesc"),
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
        title: t("admin.teacher.deletedTitle"),
        description: t("admin.teacher.deletedDesc"),
      });
    } catch {
      setNotifModal({
        isOpen: true,
        type: "error",
        title: t("admin.teacher.failedDelete"),
        description: t("admin.teacher.failedDeleteDesc"),
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
              {t("admin.teacher.pageTitle")}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#222222]">
            {t("admin.teacher.pageSubtitle")}
          </h1>
          <p className="text-sm text-[#6a6a6a]">
            {t("admin.teacher.pageDesc")}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold text-sm px-5 py-3 rounded-lg transition-colors airbnb-shadow-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{t("admin.teacher.addBtn")}</span>
        </button>
      </div>

      {/* Grid Kartu Pembina */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacherItem) => (
          <div
            key={teacherItem.id}
            className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm hover:airbnb-shadow flex flex-col justify-between card-transition"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-semibold bg-[#222222] text-white px-3 py-1 rounded-full">
                  {t("admin.teacher.classPrefix")}{teacherItem.classGroup}
                </span>
                <span className="text-xs font-medium text-[#6a6a6a]">
                  @{teacherItem.username}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#f7f7f7] border border-[#ebebeb] flex items-center justify-center text-lg font-bold text-[#ff385c]">
                  {teacherItem.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#222222]">
                    {teacherItem.name}
                  </h3>
                  <p className="text-xs text-[#6a6a6a]">
                    NIP: {teacherItem.nip || t("admin.teacher.noNip")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#6a6a6a] bg-[#f7f7f7] p-3 rounded-xl border border-[#ebebeb]">
                <Users className="w-4 h-4 text-[#ff385c]" />
                <span>Pengampu dan Koordinator Siswa {t("admin.teacher.classPrefix")}{teacherItem.classGroup}</span>
              </div>
            </div>

            <div className="border-t border-[#ebebeb] pt-4 mt-6 flex items-center justify-between text-xs">
              <button
                onClick={() => openResetModal(teacherItem.id)}
                className="flex items-center gap-1.5 text-[#6a6a6a] hover:text-[#222222] font-semibold p-1.5 rounded-lg hover:bg-[#f7f7f7] transition-colors cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-[#ff385c]" />
                <span>{t("admin.teacher.resetBtn")}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(teacherItem)}
                  className="p-2 text-[#6a6a6a] hover:text-[#222222] hover:bg-[#f7f7f7] rounded-lg transition-colors cursor-pointer"
                  title={t("admin.teacher.editTitle")}
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => confirmDelete(teacherItem.id)}
                  className="p-2 text-[#6a6a6a] hover:text-[#c13515] hover:bg-[#ffd1da]/30 rounded-lg transition-colors cursor-pointer"
                  title={t("admin.teacher.deleteTitle")}
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
                {editingId ? t("admin.teacher.editTitle") : t("admin.teacher.addTitle")}
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
                  {t("admin.teacher.nameLabel")}
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
                  {t("admin.teacher.nipLabel")}
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
                  {t("admin.teacher.classLabel")}
                </label>
                <select
                  value={classGroup}
                  onChange={(e) => setClassGroup(e.target.value)}
                  className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd]"
                >
                  <option value="5">{t("admin.teacher.class5")}</option>
                  <option value="6">{t("admin.teacher.class6")}</option>
                </select>
              </div>

              {!editingId && (
                <div>
                  <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                    {t("admin.teacher.passwordLabel")}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Default: pembina123"
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
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ebebeb]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-[#222222] bg-white border border-[#dddddd] rounded-lg"
                >
                  {t("admin.teacher.cancelBtn")}
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
              {t("admin.teacher.resetModalTitle")}
            </h3>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-1">
                  {t("admin.teacher.newPasswordLabel")}
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Contoh: guruHebat2026"
                    className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd] pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#6a6a6a] hover:text-[#222222]"
                    title={showNewPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#ebebeb]">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-5 py-2 text-sm font-semibold text-[#222222] bg-white border border-[#dddddd] rounded-lg"
                >
                  {t("admin.teacher.cancelBtn")}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-lg"
                >
                  {t("admin.teacher.savePasswordBtn")}
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
        title={t("admin.teacher.deleteModalTitle")}
        description={t("admin.teacher.deleteModalDesc")}
        confirmText={t("admin.teacher.confirmDeleteBtn")}
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
        primaryButtonText={t("admin.teacher.notificationBtn")}
        onPrimaryClick={() =>
          setNotifModal((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}
