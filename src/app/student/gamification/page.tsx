"use client";

import { useEffect, useState } from "react";
import {
  Award,
  Sparkles,
  Trophy,
  Palette,
  CheckCircle2,
  Users,
} from "lucide-react";
import { useNotificationModal } from "@/providers/NotificationProvider";
import AvatarMakerModal, {
  AvatarConfig,
} from "@/components/ui/AvatarMakerModal";
import NotificationModal from "@/components/ui/NotificationModal";
import {
  getGamificationData,
  updateStudentAvatarConfig,
  equipStudentTitle,
} from "../actions";

interface StudentGamify {
  id: string;
  name: string;
  username: string;
  points: number;
  activeTitle: string | null;
  classGroup: string;
  avatarConfig: string | null;
  unlockedTitles: string[];
}

export default function StudentGamificationPage() {
  const { show } = useNotificationModal();

  const [data, setData] = useState<{
    student: StudentGamify;
    leaderboardGroup: any[];
    leaderboardAll: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabLeaderboard, setTabLeaderboard] = useState<"GROUP" | "ALL">(
    "GROUP"
  );
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
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
      const res = await getGamificationData();
      setData(res as any);
    } catch {
      show({ type: 'error', title: 'Perhatian', description: `Gagal memuat data gamifikasi`, autoCloseDelay: 2500 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveAvatar = async (configStr: string) => {
    await updateStudentAvatarConfig(configStr);
    loadData();
    setModalConfig({
      isOpen: true,
      type: "success",
      title: "Avatar KTA Berhasil Disimpan! 🎨",
      description:
        "Tampilan KTA Digital kamu telah diperbarui dengan kreasi avatar barumu.",
      badgeText: "Status: Avatar KTA Digital Aktif",
    });
  };

  const handleEquipTitle = async (title: string) => {
    try {
      await equipStudentTitle(title);
      loadData();
      setModalConfig({
        isOpen: true,
        type: "celebration",
        title: "Gelar Kehormatan Dipasang! 👑",
        description:
          "Gelar lamamu telah diganti dan sekarang terlihat resmi di KTA Digital serta Peringkat 10 Besar.",
        badgeText: `Gelar Aktif Sekarang: ${title}`,
      });
    } catch {
      show({ type: 'error', title: 'Perhatian', description: `Gagal mengganti gelar`, autoCloseDelay: 2500 });
    }
  };

  const renderAvatarSVG = (configStr: string | null, size = "w-28 h-28") => {
    let cfg: AvatarConfig = {
      bgColor: "#ff385c",
      hairStyle: "short",
      accessory: "none",
      skinTone: "#fbbf24",
    };
    if (configStr) {
      try {
        cfg = JSON.parse(configStr);
      } catch {}
    }

    return (
      <svg
        viewBox="0 0 100 100"
        className={`${size} transform translate-y-2`}
      >
        <path
          d="M35 75 C35 60, 65 60, 65 75 L65 100 L35 100 Z"
          fill={cfg.bgColor === "#222222" ? "#ff385c" : "#222222"}
        />
        <circle cx="50" cy="45" r="24" fill={cfg.skinTone} />
        <circle cx="42" cy="42" r="3" fill="#222222" />
        <circle cx="58" cy="42" r="3" fill="#222222" />
        <path
          d="M44 52 Q50 58 56 52"
          stroke="#222222"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        {cfg.hairStyle === "short" && (
          <path
            d="M26 40 Q26 20 50 20 Q74 20 74 40 Q74 30 50 30 Q26 30 26 40 Z"
            fill="#222222"
          />
        )}
        {cfg.hairStyle === "spiky" && (
          <polygon
            points="26,38 32,18 40,30 50,15 60,30 68,18 74,38 50,30"
            fill="#222222"
          />
        )}
        {cfg.hairStyle === "long" && (
          <path
            d="M26 45 Q26 15 50 15 Q74 15 74 45 L78 70 L22 70 Z"
            fill="#222222"
          />
        )}
        {cfg.hairStyle === "bob" && (
          <path
            d="M26 48 Q26 18 50 18 Q74 18 74 48 L70 58 Q50 48 30 58 Z"
            fill="#222222"
          />
        )}
        {cfg.hairStyle === "headphone" && (
          <>
            <path
              d="M22 45 A28 28 0 0 1 78 45"
              stroke="#ffffff"
              strokeWidth="4"
              fill="none"
            />
            <rect x="18" y="38" width="6" height="14" rx="3" fill="#ff385c" />
            <rect x="76" y="38" width="6" height="14" rx="3" fill="#ff385c" />
          </>
        )}
        {cfg.accessory === "glasses" && (
          <>
            <circle
              cx="42"
              cy="42"
              r="8"
              stroke="#222222"
              strokeWidth="2.5"
              fill="none"
            />
            <circle
              cx="58"
              cy="42"
              r="8"
              stroke="#222222"
              strokeWidth="2.5"
              fill="none"
            />
          </>
        )}
        {cfg.accessory === "vr" && (
          <rect
            x="30"
            y="36"
            width="40"
            height="12"
            rx="4"
            fill="#ff385c"
            stroke="#ffffff"
            strokeWidth="2"
          />
        )}
        {cfg.accessory === "star" && (
          <polygon
            points="50,65 52,70 57,70 53,73 55,78 50,75 45,78 47,73 43,70 48,70"
            fill="#ff385c"
          />
        )}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff385c]" />
      </div>
    );
  }

  const student = data?.student;
  const currentLeaderboard =
    tabLeaderboard === "GROUP"
      ? data?.leaderboardGroup
      : data?.leaderboardAll;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dddddd] airbnb-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#f7f7f7] px-3 py-1 rounded-full mb-2 border border-[#ebebeb]">
            <Sparkles className="w-3.5 h-3.5 text-[#ff385c]" />
            <span className="text-xs font-semibold text-[#222222]">
              Modul Gamifikasi Siswa
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">
            Toko Gelar, Avatar, & Leaderboard
          </h1>
          <p className="text-sm text-[#6a6a6a]">
            Kumpulkan poin kehadiran dan kuis TIK untuk membuka gelar prestisius
            serta menduduki posisi puncak klasemen siswa!
          </p>
        </div>
      </div>

      {/* Grid 2 Kolom: Profil Karakter & Koleksi Gelar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kartu Karakter Avatar Digital */}
        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm flex flex-col items-center text-center">
          <div
            className="w-36 h-36 rounded-full flex items-center justify-center shadow-lg overflow-hidden mb-4 border-4 border-white"
            style={{
              backgroundColor: student?.avatarConfig
                ? JSON.parse(student.avatarConfig).bgColor
                : "#ff385c",
            }}
          >
            {renderAvatarSVG(student?.avatarConfig || null)}
          </div>
          <h3 className="text-lg font-bold text-[#222222]">{student?.name}</h3>
          <p className="text-xs font-semibold text-[#6a6a6a]">
            Kelas {student?.classGroup}
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-[#ff385c] text-white px-4 py-1.5 rounded-full text-xs font-bold">
            <Award className="w-4 h-4" />
            <span>{student?.activeTitle || "Jagoan Digital"}</span>
          </div>

          <button
            onClick={() => setIsAvatarModalOpen(true)}
            className="mt-6 w-full bg-white hover:bg-[#f7f7f7] text-[#222222] border border-[#dddddd] font-semibold text-xs py-3 rounded-xl transition-colors airbnb-shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Palette className="w-4 h-4 text-[#ff385c]" />
            <span>Kustomisasi Karakter Avatar</span>
          </button>
        </div>

        {/* Koleksi Gelar Siswa */}
        <div className="lg:col-span-2 bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#ebebeb] pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#222222]">
                  Koleksi Gelar Prestasi
                </h3>
                <p className="text-xs text-[#6a6a6a]">
                  Klik gelar yang sudah kamu buka untuk menggunakannya di profil
                  dan papan peringkat
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-[#6a6a6a] uppercase">
                  Poin Kamu:
                </span>
                <p className="text-2xl font-bold text-[#ff385c]">
                  {student?.points} Poin
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  title: "Jagoan Digital",
                  minPoints: 0,
                  desc: "Gelar awal seluruh siswa Ekskul TIK",
                },
                {
                  title: "Desainer Cilik",
                  minPoints: 100,
                  desc: "Terbuka setelah mengumpulkan 100 poin",
                },
                {
                  title: "Master Coding",
                  minPoints: 200,
                  desc: "Terbuka setelah mengumpulkan 200 poin",
                },
                {
                  title: "Cyber Explorer",
                  minPoints: 300,
                  desc: "Terbuka setelah mengumpulkan 300 poin",
                },
                {
                  title: "Legenda TIK",
                  minPoints: 500,
                  desc: "Gelar tertinggi berkat 500 poin belajar",
                },
              ].map((item) => {
                const isUnlocked =
                  student?.unlockedTitles.includes(item.title) ||
                  (student && student.points >= item.minPoints);
                const isEquipped = student?.activeTitle === item.title;

                return (
                  <div
                    key={item.title}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isEquipped
                        ? "bg-[#fff8f6] border-[#ff385c]"
                        : isUnlocked
                        ? "bg-white border-[#dddddd] hover:border-[#222222]"
                        : "bg-[#f7f7f7] border-[#ebebeb] opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-[#222222]">
                        {item.title}
                      </span>
                      {isEquipped ? (
                        <span className="text-[10px] font-bold bg-[#ff385c] text-white px-2.5 py-0.5 rounded-full">
                          Aktif
                        </span>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleEquipTitle(item.title)}
                          className="text-[10px] font-bold bg-[#222222] text-white px-2.5 py-1 rounded-md hover:bg-[#ff385c] transition-colors cursor-pointer"
                        >
                          Pasang Gelar
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold text-[#929292]">
                          Butuh {item.minPoints} Pts
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6a6a6a]">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Papan Peringkat */}
      <div className="bg-white border border-[#dddddd] rounded-2xl overflow-hidden airbnb-shadow-sm">
        <div className="p-6 border-b border-[#dddddd] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="text-lg font-bold text-[#222222]">
                Papan Peringkat (Leaderboard)
              </h2>
              <p className="text-xs text-[#6a6a6a]">
                Siswa dengan poin keaktifan presensi & kuis tertinggi
              </p>
            </div>
          </div>

          <div className="flex rounded-lg bg-[#f7f7f7] border border-[#dddddd] p-0.5">
            <button
              onClick={() => setTabLeaderboard("GROUP")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                tabLeaderboard === "GROUP"
                  ? "bg-[#222222] text-white"
                  : "text-[#6a6a6a] hover:text-[#222222]"
              }`}
            >
              Kelas {student?.classGroup}
            </button>
            <button
              onClick={() => setTabLeaderboard("ALL")}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                tabLeaderboard === "ALL"
                  ? "bg-[#222222] text-white"
                  : "text-[#6a6a6a] hover:text-[#222222]"
              }`}
            >
              Semua Kelas (5 & 6)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f7f7f7] border-b border-[#dddddd] text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider">
                <th className="py-4 px-6 w-16 text-center">Rank</th>
                <th className="py-4 px-6">Nama Siswa</th>
                <th className="py-4 px-6 text-center">Kelas</th>
                <th className="py-4 px-6 text-center">Gelar Aktif</th>
                <th className="py-4 px-6 text-right">Poin Gamifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ebebeb] text-sm text-[#222222]">
              {currentLeaderboard?.map((item, index) => {
                const isMe = item.id === student?.id;
                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isMe ? "bg-[#fff8f6] font-bold" : "hover:bg-[#f7f7f7]/60"
                    }`}
                  >
                    <td className="py-4 px-6 text-center font-bold">
                      {index === 0 ? (
                        <span className="inline-block w-6 h-6 rounded-full bg-amber-500 text-white text-xs leading-6">
                          1
                        </span>
                      ) : index === 1 ? (
                        <span className="inline-block w-6 h-6 rounded-full bg-gray-400 text-white text-xs leading-6">
                          2
                        </span>
                      ) : index === 2 ? (
                        <span className="inline-block w-6 h-6 rounded-full bg-amber-700 text-white text-xs leading-6">
                          3
                        </span>
                      ) : (
                        index + 1
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border border-[#dddddd]"
                          style={{
                            backgroundColor: item.avatarConfig
                              ? JSON.parse(item.avatarConfig).bgColor
                              : "#ff385c",
                          }}
                        >
                          {renderAvatarSVG(item.avatarConfig, "w-8 h-8")}
                        </div>
                        <div>
                          <p className="font-bold text-[#222222]">
                            {item.name} {isMe && "(Kamu)"}
                          </p>
                          <p className="text-xs text-[#6a6a6a]">
                            @{item.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#f7f7f7] border border-[#ebebeb]">
                        Kelas {item.classGroup}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#ff385c] bg-[#ffd1da]/30 px-3 py-1 rounded-full">
                        <Award className="w-3.5 h-3.5" />
                        <span>{item.activeTitle || "Jagoan Digital"}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="font-bold text-base text-[#222222]">
                        {item.points} Pts
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AvatarMakerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        initialConfig={student?.avatarConfig}
        onSave={handleSaveAvatar}
      />

      {/* Pop up Modal Sukses / Perayaan Gelar */}
      <NotificationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
        type={modalConfig.type}
        title={modalConfig.title}
        description={modalConfig.description}
        badgeText={modalConfig.badgeText}
        primaryButtonText="Tutup & Lihat Peringkat"
        onPrimaryClick={() =>
          setModalConfig((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </div>
  );
}
