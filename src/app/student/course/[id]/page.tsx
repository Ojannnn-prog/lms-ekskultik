"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  FileText,
  Video,
  Clock,
} from "lucide-react";
import { useNotificationModal } from "@/providers/NotificationProvider";
import SmartEmbedViewer from "@/components/ui/SmartEmbedViewer";
import NotificationModal from "@/components/ui/NotificationModal";
import {
  getCourseResourceDetail,
  submitQuizAttempt,
  markCourseCompleted,
} from "../../actions";

interface QuizConfig {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: "A" | "B" | "C" | "D";
}

export default function StudentCourseDetailPage() {
  const { show } = useNotificationModal();

  const params = useParams();
  const router = useRouter();
  const resourceId = params.id as string;

  const [resource, setResource] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Countdown & Mark Completed State (2 menit = 120 detik)
  const [countdown, setCountdown] = useState(120);
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false);

  // Modal Notification State untuk CTA & Hadiah
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: "success" | "celebration" | "reward" | "error" | "info";
    title: string;
    description: string;
    badgeText?: string;
    primaryButtonText?: string;
    onPrimaryClick?: () => void;
    secondaryButtonText?: string;
    onSecondaryClick?: () => void;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    description: "",
  });

  // Quiz state
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    success: boolean;
    passed: boolean;
    score: number;
    pointsEarned: number;
    newTitleUnlocked: string | null;
  } | null>(null);

  useEffect(() => {
    if (!resourceId) return;
    getCourseResourceDetail(resourceId)
      .then((res) => {
        setResource(res.resource);
        setIsCompleted(res.isCompleted);
      })
      .catch((err) => {
        show({ type: 'error', title: 'Perhatian', description: `Materi tidak ditemukan`, autoCloseDelay: 2500 });
        router.push("/student/course");
      })
      .finally(() => setLoading(false));
  }, [resourceId, router]);

  useEffect(() => {
    if (isCompleted || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, isCompleted]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleMarkCompleted = async () => {
    if (countdown > 0) {
      show({
        type: 'error',
        title: 'Perhatian',
        description: `Tunggu ${formatCountdown(countdown)} menit sebelum menyelesaikan modul`,
        autoCloseDelay: 2500
      });
      return;
    }
    setIsMarkingCompleted(true);
    try {
      const res = await markCourseCompleted(resourceId);
      setIsCompleted(true);
      if (res.alreadyCompleted) {
        setModalConfig({
          isOpen: true,
          type: "info",
          title: "Modul Sudah Selesai 📚",
          description:
            "Kamu telah menyelesaikan modul materi pembelajaran ini sebelumnya.",
          primaryButtonText: "Kembali ke Daftar Materi",
          onPrimaryClick: () => router.push("/student/course"),
          secondaryButtonText: "Tutup",
          onSecondaryClick: () =>
            setModalConfig((prev) => ({ ...prev, isOpen: false })),
        });
      } else {
        setModalConfig({
          isOpen: true,
          type: "reward",
          title: "Modul Berhasil Diselesaikan! 🎉",
          description:
            "Selamat! Kamu telah menuntaskan mempelajari materi ini dan berhak mendapatkan hadiah poin gamifikasi.",
          badgeText: `+${res.pointsEarned} Poin Gamifikasi Diberikan${
            res.newTitleUnlocked ? ` • Gelar: ${res.newTitleUnlocked}` : ""
          }`,
          primaryButtonText: "Kembali ke Daftar Materi",
          onPrimaryClick: () => router.push("/student/course"),
          secondaryButtonText: "Tetap di Materi Ini",
          onSecondaryClick: () =>
            setModalConfig((prev) => ({ ...prev, isOpen: false })),
        });
      }
    } catch {
      show({ type: 'error', title: 'Perhatian', description: `Gagal menyimpan progress penyelesaian`, autoCloseDelay: 2500 });
    } finally {
      setIsMarkingCompleted(false);
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnswer) {
      show({ type: 'error', title: 'Perhatian', description: `Pilih salah satu opsi jawaban (A, B, C, atau D)`, autoCloseDelay: 2500 });
      return;
    }

    setSubmittingQuiz(true);
    setQuizResult(null);
    try {
      const res = await submitQuizAttempt(resourceId, selectedAnswer);
      setQuizResult(res);
      if (res.passed) {
        setIsCompleted(true);
        setModalConfig({
          isOpen: true,
          type: "celebration",
          title: "Jawaban Kamu Benar! 🌟",
          description:
            "Luar biasa! Pemahamanmu mengenai materi modul ini sangat tepat dan akurat.",
          badgeText: `+${res.pointsEarned} Poin Hadiah Kuis${
            res.newTitleUnlocked ? ` • Gelar: ${res.newTitleUnlocked}` : ""
          }`,
          primaryButtonText: "Lihat Peringkat & Gelar Saya",
          onPrimaryClick: () => router.push("/student/gamification"),
          secondaryButtonText: "Tutup",
          onSecondaryClick: () =>
            setModalConfig((prev) => ({ ...prev, isOpen: false })),
        });
      } else {
        setModalConfig({
          isOpen: true,
          type: "error",
          title: "Jawaban Belum Tepat 🤔",
          description:
            "Jangan menyerah! Coba baca kembali artikel materi di atas dengan teliti, lalu pilih jawaban lain yang paling tepat.",
          primaryButtonText: "Coba Lagi",
          onPrimaryClick: () =>
            setModalConfig((prev) => ({ ...prev, isOpen: false })),
        });
      }
    } catch {
      show({ type: 'error', title: 'Perhatian', description: `Gagal mengirim jawaban kuis`, autoCloseDelay: 2500 });
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff385c]" />
      </div>
    );
  }

  if (!resource) return null;

  let quizConfig: QuizConfig | null = null;
  if (resource.quizConfig) {
    try {
      quizConfig = JSON.parse(resource.quizConfig);
    } catch {}
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Tombol Kembali & Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/student/course"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#6a6a6a] hover:text-[#222222] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Materi</span>
        </Link>
        <span className="text-xs font-semibold bg-[#f7f7f7] text-[#222222] px-3.5 py-1 rounded-full border border-[#ebebeb]">
          {resource.category}
        </span>
      </div>

      {/* Header Judul Materi */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dddddd] airbnb-shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="inline-flex items-center gap-1.5 bg-[#f7f7f7] px-3 py-1 rounded-full border border-[#ebebeb]">
            <Sparkles className="w-3.5 h-3.5 text-[#ff385c]" />
            <span className="text-xs font-semibold text-[#222222]">
              Tipe: {resource.type}
            </span>
          </div>

          {isCompleted ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 text-green-800 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span>Modul Selesai</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1.5 rounded-full border border-amber-200">
              <Award className="w-4 h-4 text-amber-600" />
              <span>+{resource.pointsReward} Poin Gamifikasi</span>
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] tracking-tight mb-4">
          {resource.title}
        </h1>

        {resource.description && (
          <p className="text-base text-[#3f3f3f] leading-relaxed">
            {resource.description}
          </p>
        )}
      </div>

      {/* Konten Utama (Teks, PDF, Video, Link) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dddddd] airbnb-shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-[#222222] border-b border-[#ebebeb] pb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#ff385c]" />
          <span>Materi Pembelajaran</span>
        </h2>
        {/* RENDER MATERI SECARA PINTAR & RESPONSIF (GOOGLE DRIVE, YOUTUBE, PDF, DOKUMEN) */}
        {resource.fileUrl ? (
          <div className="space-y-6">
            <SmartEmbedViewer
              url={resource.fileUrl}
              title={resource.title}
              type={resource.type}
            />
            {resource.content &&
              resource.content.trim().length > 30 &&
              resource.content !== resource.description && (
                <div className="prose max-w-none text-[#222222] leading-relaxed whitespace-pre-wrap bg-[#f7f7f7] p-6 rounded-2xl border border-[#ebebeb]">
                  {resource.content}
                </div>
              )}
          </div>
        ) : (
          <div className="prose max-w-none text-[#222222] leading-relaxed whitespace-pre-wrap bg-[#f7f7f7] p-6 rounded-2xl border border-[#ebebeb]">
            {resource.content ||
              resource.description ||
              "Tidak ada detail materi tambahan."}
          </div>
        )}
      </div>

      {/* MODUL KUIS INTERAKTIF A-D */}
      {quizConfig && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#222222] airbnb-shadow space-y-6">
          <div className="flex items-center justify-between border-b border-[#ebebeb] pb-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#ff385c]" />
              <h2 className="text-xl font-bold text-[#222222]">
                Kuis Interaktif Modul
              </h2>
            </div>
            <span className="text-xs font-bold bg-[#ff385c] text-white px-3 py-1 rounded-full">
              +{resource.pointsReward} Poin Gamifikasi
            </span>
          </div>

          {/* Pertanyaan */}
          <div className="bg-[#f7f7f7] p-5 rounded-xl border border-[#ebebeb]">
            <p className="text-base font-bold text-[#222222]">
              {quizConfig.question}
            </p>
          </div>

          {/* Opsi Pilihan Ganda (A - D) */}
          <form onSubmit={handleQuizSubmit} className="space-y-3">
            {(["A", "B", "C", "D"] as const).map((optKey) => {
              const optionText = quizConfig?.[`option${optKey}`];
              const isSelected = selectedAnswer === optKey;

              return (
                <label
                  key={optKey}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-[#ff385c] bg-[#fff8f6]"
                      : "border-[#dddddd] hover:border-[#b0b0b0] bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="quizOption"
                    value={optKey}
                    checked={isSelected}
                    onChange={() => setSelectedAnswer(optKey)}
                    className="hidden"
                  />
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                      isSelected
                        ? "bg-[#ff385c] text-white"
                        : "bg-[#f7f7f7] text-[#222222] border border-[#dddddd]"
                    }`}
                  >
                    {optKey}
                  </div>
                  <span className="text-sm font-semibold text-[#222222]">
                    {optionText}
                  </span>
                </label>
              );
            })}

            <div className="pt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={submittingQuiz || !selectedAnswer}
                className="bg-[#ff385c] hover:bg-[#e00b41] text-white font-bold text-sm px-8 py-4 rounded-xl transition-colors airbnb-shadow disabled:opacity-50 cursor-pointer"
              >
                {submittingQuiz ? "Memeriksa..." : "Kirim Jawaban Kuis"}
              </button>
            </div>
          </form>

          {/* Banner Hasil Kuis */}
          {quizResult && (
            <div
              className={`p-6 rounded-2xl border mt-6 animate-fadeIn ${
                quizResult.passed
                  ? "bg-green-50 border-green-300 text-green-900"
                  : "bg-red-50 border-red-300 text-red-900"
              }`}
            >
              {quizResult.passed ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-7 h-7 text-green-600 shrink-0" />
                  <div>
                    <h3 className="text-lg font-bold">
                      Selamat! Jawaban Kamu Benar! 🎉
                    </h3>
                    <p className="text-sm mt-1">
                      Kamu mendapatkan{" "}
                      <strong className="text-green-800">
                        +{quizResult.pointsEarned} Poin
                      </strong>{" "}
                      hadiah dan menyelesaikan modul ini!
                    </p>
                    {quizResult.newTitleUnlocked && (
                      <div className="mt-3 inline-flex items-center gap-1.5 bg-green-200 text-green-900 px-3.5 py-1.5 rounded-full text-xs font-bold">
                        <Award className="w-4 h-4" />
                        <span>
                          Gelar Baru Terbuka: {quizResult.newTitleUnlocked}!
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-7 h-7 text-red-600 shrink-0" />
                  <div>
                    <h3 className="text-base font-bold">
                      Jawaban Masih Belum Tepat
                    </h3>
                    <p className="text-sm mt-0.5">
                      Jangan menyerah! Baca kembali materi di atas dan cobalah
                      memilih jawaban lain yang paling tepat.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* KARTU SELESAI & TANDAI DENGAN COUNTDOWN 2 MENIT */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-[#ebebeb] airbnb-shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div
            className={`p-3.5 rounded-2xl ${
              isCompleted
                ? "bg-green-100 text-green-700"
                : countdown > 0
                ? "bg-amber-100 text-amber-700"
                : "bg-[#fff8f6] text-[#ff385c]"
            }`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : countdown > 0 ? (
              <Clock className="w-8 h-8 animate-pulse" />
            ) : (
              <Award className="w-8 h-8" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#222222]">
              {isCompleted
                ? "Modul Telah Diselesaikan!"
                : countdown > 0
                ? "Pelajari Materi Terlebih Dahulu"
                : "Modul Siap Ditandai Selesai!"}
            </h3>
            <p className="text-sm text-[#6a6a6a] mt-0.5">
              {isCompleted
                ? "Kamu telah menyelesaikan materi ini dan mendapatkan poin hadiah."
                : countdown > 0
                ? `Tunggu ${formatCountdown(
                    countdown
                  )} menit sebelum kamu dapat menekan tombol selesai dan mendapatkan poin.`
                : `Klik tombol di sebelah kanan untuk menyelesaikan modul dan mengklaim +${
                    resource.pointsReward
                  } Poin Gamifikasi.`}
            </p>
          </div>
        </div>

        <div>
          {isCompleted ? (
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-green-50 border border-green-200 text-green-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Selesai & Lulus</span>
            </div>
          ) : (
            <button
              type="button"
              disabled={countdown > 0 || isMarkingCompleted}
              onClick={handleMarkCompleted}
              className={`px-6 py-3.5 rounded-xl font-bold text-sm flex items-center gap-2.5 transition-all ${
                countdown > 0
                  ? "bg-[#ebebeb] text-[#929292] cursor-not-allowed border border-[#dddddd]"
                  : "bg-[#ff385c] hover:bg-[#e00b41] text-white airbnb-shadow-sm cursor-pointer scale-100 hover:scale-[1.02]"
              }`}
            >
              {countdown > 0 ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Selesai & Tandai ({formatCountdown(countdown)})</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isMarkingCompleted
                      ? "Menyimpan..."
                      : `Selesai & Tandai (+${resource.pointsReward} Poin)`}
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Pop up Modal Notifikasi & Perayaan Gamifikasi */}
      <NotificationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        type={modalConfig.type}
        title={modalConfig.title}
        description={modalConfig.description}
        badgeText={modalConfig.badgeText}
        primaryButtonText={modalConfig.primaryButtonText}
        onPrimaryClick={modalConfig.onPrimaryClick}
        secondaryButtonText={modalConfig.secondaryButtonText}
        onSecondaryClick={modalConfig.onSecondaryClick}
      />
    </div>
  );
}
