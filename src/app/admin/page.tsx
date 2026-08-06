"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Calendar,
  AlertCircle,
  TrendingUp,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  UserCheck,
  Edit3,
  X,
} from "lucide-react";
import { useNotificationModal } from "@/providers/NotificationProvider";
import ConfirmModal from "@/components/ui/ConfirmModal";
import NotificationModal from "@/components/ui/NotificationModal";
import {
  getAdminDashboardData,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "./actions";
import { useLanguage } from "@/providers/LanguageProvider";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: any;
}

export default function AdminDashboardPage() {
  const { show } = useNotificationModal();
  const { t } = useLanguage();

  const [stats, setStats] = useState<any>(null);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form pengumuman baru
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // State Edit Pengumuman
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // State Delete Modal
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // State NotificationModal
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
      const data = await getAdminDashboardData();
      setStats(data.stats);
      setAttendances(data.todayAttendances);
      setAnnouncements(data.announcements as Announcement[]);
    } catch {
      show({ type: 'error', title: t('admin.attention'), description: t('admin.dashboardLoadError'), autoCloseDelay: 2500 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    try {
      await createAnnouncement(title, content);
      setTitle("");
      setContent("");
      loadData();
      setModalConfig({
        isOpen: true,
        type: "success",
        title: t('admin.announcementPublishSuccess'),
        description: t('admin.announcementPublishDesc'),
        badgeText: t('admin.statusPublished'),
      });
    } catch {
      show({ type: 'error', title: t('admin.attention'), description: t('admin.announcementPublishError'), autoCloseDelay: 2500 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (ann: Announcement) => {
    setEditingAnn(ann);
    setEditTitle(ann.title);
    setEditContent(ann.content);
  };

  const handleSaveEditAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnn) return;
    try {
      await updateAnnouncement(editingAnn.id, editTitle, editContent);
      setEditingAnn(null);
      loadData();
      setModalConfig({
        isOpen: true,
        type: "success",
        title: t('admin.announcementUpdateSuccess'),
        description: t('admin.announcementUpdateDesc'),
      });
    } catch {
      show({ type: 'error', title: t('admin.attention'), description: t('admin.announcementUpdateError'), autoCloseDelay: 2500 });
    }
  };

  const confirmDeleteAnnouncement = async () => {
    if (!deleteId) return;
    try {
      await deleteAnnouncement(deleteId);
      show({ type: 'success', title: t('admin.success'), description: t('admin.announcementDeleteSuccess'), autoCloseDelay: 1500 });
      setDeleteId(null);
      loadData();
    } catch {
      show({ type: 'error', title: t('admin.attention'), description: t('admin.announcementDeleteError'), autoCloseDelay: 2500 });
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
      {/* Header Sambutan */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dddddd] airbnb-shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-[#ff385c] uppercase tracking-wider block mb-1">
              {t('admin.schoolHeader')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">
              {t('admin.dashboardTitle')}
            </h1>
            <p className="text-sm text-[#6a6a6a] mt-1">
              {t('admin.dashboardSubtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#f7f7f7] px-4 py-2.5 rounded-xl border border-[#ebebeb]">
            <TrendingUp className="w-5 h-5 text-[#ff385c]" />
            <div>
              <p className="text-xs text-[#6a6a6a]">{t('admin.attendanceRateToday')}</p>
              <p className="text-base font-bold text-[#222222]">
                {stats?.todayAttendanceRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 4 Kolom: Statistik Kunci */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#dddddd] rounded-xl p-5 airbnb-shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
              {t('admin.totalStudents')}
            </span>
            <Users className="w-5 h-5 text-[#ff385c]" />
          </div>
          <p className="text-3xl font-bold text-[#222222]">
            {stats?.totalStudents || 0}
          </p>
          <p className="text-xs text-[#929292] mt-1">
            {t('admin.class5')}: {stats?.studentsClass5 || 0} • {t('admin.class6')}:{" "}
            {stats?.studentsClass6 || 0}
          </p>
        </div>

        <div className="bg-white border border-[#dddddd] rounded-xl p-5 airbnb-shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
              {t('admin.learningModules')}
            </span>
            <BookOpen className="w-5 h-5 text-[#ff385c]" />
          </div>
          <p className="text-3xl font-bold text-[#222222]">
            {stats?.totalResources || 0}
          </p>
          <p className="text-xs text-[#929292] mt-1">
            {t('admin.curriculumDesc')}
          </p>
        </div>

        <div className="bg-white border border-[#dddddd] rounded-xl p-5 airbnb-shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
              {t('admin.ictTutor')}
            </span>
            <UserCheck className="w-5 h-5 text-[#ff385c]" />
          </div>
          <p className="text-3xl font-bold text-[#222222]">
            {stats?.totalTeachers || 0}
          </p>
          <p className="text-xs text-[#929292] mt-1">{t('admin.classGuardian')}</p>
        </div>

        <div className="bg-white border border-[#dddddd] rounded-xl p-5 airbnb-shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
              {t('admin.presentToday')}
            </span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-[#222222]">
            {stats?.hadirCount || 0}
          </p>
          <p className="text-xs text-[#929292] mt-1">
            {t('admin.izin')}: {stats?.izinCount || 0} | {t('admin.alpha')}: {stats?.alphaCount || 0}
          </p>
        </div>
      </div>

      {/* Grid 2 Kolom: Rekap Kehadiran Terkini & Pengumuman */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Aktivitas Presensi QR Terkini */}
        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#222222] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#ff385c]" />
              <span>{t('admin.attendanceActivityToday')}</span>
            </h2>
            <span className="text-xs font-semibold bg-[#f7f7f7] text-[#6a6a6a] px-3 py-1 rounded-full border border-[#ebebeb]">
              {t('admin.resetTime')}
            </span>
          </div>

          {attendances.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#dddddd] rounded-xl">
              <Clock className="w-8 h-8 text-[#929292] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#6a6a6a]">
                {t('admin.noStudentsPresentToday')}
              </p>
              <p className="text-xs text-[#929292] mt-1">
                {t('admin.useScannerPrompt')}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {attendances.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 bg-[#f7f7f7] rounded-xl border border-[#ebebeb]"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#222222]">
                      {item.student.name}
                    </p>
                    <p className="text-xs text-[#6a6a6a]">
                      {t('admin.nis')}: {item.student.studentCode} • {t('admin.class')}{" "}
                      {item.student.classGroup}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      {item.status}
                    </span>
                    <p className="text-[10px] text-[#929292] mt-1">
                      {new Date(item.timestamp).toLocaleTimeString("id-ID", {
                        timeZone: "Asia/Jakarta",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      {t('admin.wib')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pengumuman Ekskul TIK */}
        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#222222] mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#ff385c]" />
              <span>{t('admin.globalAnnouncements')}</span>
            </h2>

            {announcements.length === 0 ? (
              <p className="text-sm text-[#6a6a6a] text-center py-8">
                {t('admin.noAnnouncements')}
              </p>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-1">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 bg-[#f7f7f7] rounded-xl border border-[#ebebeb] flex items-start justify-between gap-4"
                  >
                    <div>
                      <h3 className="text-sm font-bold text-[#222222]">
                        {ann.title}
                      </h3>
                      <p className="text-xs text-[#3f3f3f] mt-1 leading-relaxed">
                        {ann.content}
                      </p>
                      <p className="text-[10px] text-[#929292] mt-2">
                        {ann.createdAt.toLocaleDateString("id-ID", {
                          timeZone: "Asia/Jakarta",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(ann)}
                        className="text-[#6a6a6a] hover:text-[#222222] p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
                        title={t('admin.editAnnouncementTitle')}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(ann.id)}
                        className="text-[#929292] hover:text-[#c13515] p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
                        title={t('admin.deleteAnnouncementTitle')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Buat Pengumuman Baru */}
          <form
            onSubmit={handleAddAnnouncement}
            className="border-t border-[#ebebeb] pt-4 space-y-3"
          >
            <h4 className="text-xs font-semibold text-[#222222] uppercase tracking-wider">
              {t('admin.createAnnouncement')}
            </h4>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('admin.announcementTitlePlaceholder')}
              className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd] focus:bg-white focus:border-[#222222] focus:outline-none"
              required
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('admin.announcementContentPlaceholder')}
              rows={2}
              className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-lg px-3.5 py-2.5 border border-[#dddddd] focus:bg-white focus:border-[#222222] focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#222222] hover:bg-[#ff385c] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>
                {submitting ? t('admin.publishing') : t('admin.publishAnnouncement')}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* MODAL EDIT PENGUMUMAN (GLASSMORPHISM LUXURY) */}
      {editingAnn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#dddddd] airbnb-shadow">
            <div className="flex items-center justify-between pb-4 border-b border-[#ebebeb] mb-6">
              <h3 className="text-lg font-bold text-[#222222]">
                {t('admin.editAnnouncement')}
              </h3>
              <button
                onClick={() => setEditingAnn(null)}
                className="p-1 rounded-full text-[#6a6a6a] hover:bg-[#f7f7f7]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#222222] mb-1">
                  {t('admin.announcementTitleLabel')}
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-xl px-4 py-3 border border-[#dddddd] focus:bg-white focus:border-[#ff385c] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#222222] mb-1">
                  {t('admin.announcementContentLabel')}
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full bg-[#f7f7f7] text-sm text-[#222222] rounded-xl px-4 py-3 border border-[#dddddd] focus:bg-white focus:border-[#ff385c] focus:outline-none"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingAnn(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#6a6a6a] hover:bg-[#f7f7f7]"
                >
                  {t('admin.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-[#ff385c] hover:bg-[#e00b41] text-white transition-colors"
                >
                  {t('admin.saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      <ConfirmModal
        isOpen={!!deleteId}
        title={t('admin.deleteAnnouncementConfirmTitle')}
        description={t('admin.deleteAnnouncementConfirmDesc')}
        confirmText={t('admin.yesDelete')}
        cancelText={t('admin.cancel')}
        isDanger={true}
        onConfirm={confirmDeleteAnnouncement}
        onClose={() => setDeleteId(null)}
      />

      {/* Pop up Modal Sukses / Informasi Pengumuman */}
      <NotificationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        type={modalConfig.type}
        title={modalConfig.title}
        description={modalConfig.description}
        badgeText={modalConfig.badgeText}
        primaryButtonText={t('admin.understandAndClose')}
        onPrimaryClick={() =>
          setModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}

