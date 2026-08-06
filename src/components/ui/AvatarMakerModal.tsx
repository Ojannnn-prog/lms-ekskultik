"use client";

import React, { useState } from "react";
import { Sparkles, Check, X, Palette } from "lucide-react";
import toast from "react-hot-toast";
import NotificationModal from "@/components/ui/NotificationModal";
import { useLanguage } from "@/providers/LanguageProvider";

export interface AvatarConfig {
  bgColor: string;
  hairStyle: "short" | "long" | "spiky" | "bob" | "headphone";
  accessory: "none" | "glasses" | "vr" | "star";
  skinTone: string;
}

interface AvatarMakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig?: string | null;
  onSave: (configStr: string) => Promise<void>;
  title?: string;
}

const BG_COLORS = [
  "#ff385c", // Rausch
  "#222222", // Ink
  "#460479", // Luxe
  "#2563eb", // Blue
  "#059669", // Emerald
  "#d97706", // Amber
];

const SKIN_TONES = [
  "#fcd34d", // Fair
  "#fbbf24", // Tan
  "#d97706", // Brown
  "#92400e", // Deep
];

export default function AvatarMakerModal({
  isOpen,
  onClose,
  initialConfig,
  onSave,
  title,
}: AvatarMakerModalProps) {
  const { t } = useLanguage();
  const displayTitle = title || t("ui.avatarMakerTitle");
  const [config, setConfig] = useState<AvatarConfig>(() => {
    if (initialConfig) {
      try {
        return JSON.parse(initialConfig);
      } catch {
        // Fallback default
      }
    }
    return {
      bgColor: "#ff385c",
      hairStyle: "short",
      accessory: "none",
      skinTone: "#fbbf24",
    };
  });
  const [saving, setSaving] = useState(false);

  // State NotificationModal
  const [notifModal, setNotifModal] = useState<{
    isOpen: boolean;
    type: "success" | "celebration" | "reward" | "error" | "info";
    title: string;
    description: string;
    badgeText?: string;
  }>({
    isOpen: false,
    type: "celebration",
    title: "",
    description: "",
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(JSON.stringify(config));
      setNotifModal({
        isOpen: true,
        type: "celebration",
        title: t("ui.avatarSavedTitle"),
        description: t("ui.avatarSavedDesc"),
        badgeText: t("ui.avatarSavedBadge"),
      });
    } catch {
      setNotifModal({
        isOpen: true,
        type: "error",
        title: t("ui.avatarFailedTitle"),
        description: t("ui.avatarFailedDesc"),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#dddddd] airbnb-shadow my-8 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#ff385c]" />
            <h3 className="text-lg font-bold text-[#222222]">{displayTitle}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#929292] hover:text-[#222222] p-1 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live SVG Preview Avatar */}
        <div className="flex flex-col items-center justify-center p-6 bg-[#f7f7f7] rounded-2xl border border-[#ebebeb] mb-6">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center shadow-lg relative overflow-hidden transition-all duration-300"
            style={{ backgroundColor: config.bgColor }}
          >
            <svg
              viewBox="0 0 100 100"
              className="w-28 h-28 transform translate-y-2"
            >
              {/* Leher / Badan */}
              <path
                d="M35 75 C35 60, 65 60, 65 75 L65 100 L35 100 Z"
                fill={config.bgColor === "#222222" ? "#ff385c" : "#222222"}
              />

              {/* Wajah / Kepala */}
              <circle cx="50" cy="45" r="24" fill={config.skinTone} />

              {/* Mata */}
              <circle cx="42" cy="42" r="3" fill="#222222" />
              <circle cx="58" cy="42" r="3" fill="#222222" />

              {/* Senyum */}
              <path
                d="M44 52 Q50 58 56 52"
                stroke="#222222"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />

              {/* Rambut (Hair Styles) */}
              {config.hairStyle === "short" && (
                <path
                  d="M26 40 Q26 20 50 20 Q74 20 74 40 Q74 30 50 30 Q26 30 26 40 Z"
                  fill="#222222"
                />
              )}
              {config.hairStyle === "spiky" && (
                <polygon
                  points="26,38 32,18 40,30 50,15 60,30 68,18 74,38 50,30"
                  fill="#222222"
                />
              )}
              {config.hairStyle === "long" && (
                <path
                  d="M26 45 Q26 15 50 15 Q74 15 74 45 L78 70 L22 70 Z"
                  fill="#222222"
                />
              )}
              {config.hairStyle === "bob" && (
                <path
                  d="M26 48 Q26 18 50 18 Q74 18 74 48 L70 58 Q50 48 30 58 Z"
                  fill="#222222"
                />
              )}
              {config.hairStyle === "headphone" && (
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

              {/* Aksesori */}
              {config.accessory === "glasses" && (
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
                  <line
                    x1="50"
                    y1="42"
                    x2="50"
                    y2="42"
                    stroke="#222222"
                    strokeWidth="3"
                  />
                </>
              )}
              {config.accessory === "vr" && (
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
              {config.accessory === "star" && (
                <polygon
                  points="50,65 52,70 57,70 53,73 55,78 50,75 45,78 47,73 43,70 48,70"
                  fill="#ff385c"
                />
              )}
            </svg>
          </div>
          <span className="text-xs font-semibold text-[#6a6a6a] mt-3">
            {t("ui.liveAvatarPreview")}
          </span>
        </div>

        {/* Pemilihan Opsi Kustomisasi */}
        <div className="space-y-5">
          {/* Warna Latar */}
          <div>
            <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-2">
              {t("ui.bgColor")}
            </label>
            <div className="flex items-center gap-2">
              {BG_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setConfig({ ...config, bgColor: col })}
                  className="w-8 h-8 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center"
                  style={{
                    backgroundColor: col,
                    borderColor:
                      config.bgColor === col ? "#222222" : "transparent",
                    transform:
                      config.bgColor === col ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {config.bgColor === col && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Gaya Rambut */}
          <div>
            <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-2">
              {t("ui.hairStyle")}
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: "short", label: t("ui.hairShort") },
                { id: "spiky", label: t("ui.hairSpiky") },
                { id: "long", label: t("ui.hairLong") },
                { id: "bob", label: t("ui.hairBob") },
                { id: "headphone", label: t("ui.hairHeadphone") },
              ].map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      hairStyle: h.id as AvatarConfig["hairStyle"],
                    })
                  }
                  className={`text-xs font-semibold py-2 px-1 rounded-lg border transition-colors cursor-pointer ${
                    config.hairStyle === h.id
                      ? "bg-[#222222] text-white border-[#222222]"
                      : "bg-[#f7f7f7] text-[#222222] border-[#ebebeb] hover:bg-[#ebebeb]"
                  }`}
                >
                  {h.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aksesori Wajah */}
          <div>
            <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-2">
              {t("ui.faceAccessory")}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "none", label: t("ui.accNone") },
                { id: "glasses", label: t("ui.accGlasses") },
                { id: "vr", label: t("ui.accVR") },
                { id: "star", label: t("ui.accStar") },
              ].map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      accessory: a.id as AvatarConfig["accessory"],
                    })
                  }
                  className={`text-xs font-semibold py-2 px-1 rounded-lg border transition-colors cursor-pointer ${
                    config.accessory === a.id
                      ? "bg-[#ff385c] text-white border-[#ff385c]"
                      : "bg-[#f7f7f7] text-[#222222] border-[#ebebeb] hover:bg-[#ebebeb]"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Kulit */}
          <div>
            <label className="block text-xs font-semibold text-[#222222] uppercase tracking-wider mb-2">
              {t("ui.skinTone")}
            </label>
            <div className="flex items-center gap-2">
              {SKIN_TONES.map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setConfig({ ...config, skinTone: tone })}
                  className="w-8 h-8 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center"
                  style={{
                    backgroundColor: tone,
                    borderColor:
                      config.skinTone === tone ? "#222222" : "transparent",
                    transform:
                      config.skinTone === tone ? "scale(1.15)" : "scale(1)",
                  }}
                >
                  {config.skinTone === tone && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tombol Simpan */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-[#ebebeb]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-[#222222] bg-white border border-[#dddddd] rounded-lg"
          >
            {t("ui.cancel")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-lg transition-colors cursor-pointer"
          >
            {saving ? t("ui.saving") : t("ui.saveAvatar")}
          </button>
        </div>
      </div>

      {/* Pop up Modal Notifikasi Kustomisasi Avatar */}
      <NotificationModal
        isOpen={notifModal.isOpen}
        onClose={() => {
          setNotifModal((prev) => ({ ...prev, isOpen: false }));
          if (notifModal.type === "celebration") {
            onClose();
          }
        }}
        type={notifModal.type}
        title={notifModal.title}
        description={notifModal.description}
        badgeText={notifModal.badgeText}
        primaryButtonText={t("ui.coolBackToProfile")}
        onPrimaryClick={() => {
          setNotifModal((prev) => ({ ...prev, isOpen: false }));
          if (notifModal.type === "celebration") {
            onClose();
          }
        }}
      />
    </div>
  );
}
