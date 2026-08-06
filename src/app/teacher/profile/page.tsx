"use client";

import React, { useEffect, useState } from "react";
import {
  Award,
  Sparkles,
  Palette,
  User,
  Shield,
  BookOpen,
} from "lucide-react";
import { useNotificationModal } from "@/providers/NotificationProvider";
import AvatarMakerModal, { AvatarConfig } from "@/components/ui/AvatarMakerModal";
import { updateTeacherAvatarConfig } from "../actions";
import { useLanguage } from "@/providers/LanguageProvider";

export default function TeacherProfilePage() {
  const { show } = useNotificationModal();
  const { t } = useLanguage();

  const [user, setUser] = useState<{
    name: string;
    username: string;
    classGroup: string;
    avatarConfig: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  useEffect(() => {
    // Ambil info dari server action / cookie
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveAvatar = async (configStr: string) => {
    await updateTeacherAvatarConfig(configStr);
    if (user) {
      setUser({ ...user, avatarConfig: configStr });
    }
  };

  const renderAvatarSVG = (configStr: string | null) => {
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
      <svg viewBox="0 0 100 100" className="w-28 h-28 transform translate-y-2">
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dddddd] airbnb-shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#f7f7f7] px-3 py-1 rounded-full mb-2 border border-[#ebebeb]">
            <Sparkles className="w-3.5 h-3.5 text-[#ff385c]" />
            <span className="text-xs font-semibold text-[#222222]">
              {t('teacher.profile_character')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222222]">
            {t('teacher.customize_avatar')}
          </h1>
          <p className="text-sm text-[#6a6a6a]">
            {t('teacher.customize_avatar_desc')} {user?.classGroup || "5 & 6"}.
          </p>
        </div>

        <button
          onClick={() => setIsAvatarModalOpen(true)}
          className="bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors airbnb-shadow-sm flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Palette className="w-4 h-4" />
          <span>{t('teacher.customize_avatar_btn')}</span>
        </button>
      </div>

      {/* Kartu Karakter dan Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Karakter Avatar Card */}
        <div className="bg-white border border-[#dddddd] rounded-2xl p-6 airbnb-shadow-sm flex flex-col items-center justify-center text-center">
          <div
            className="w-36 h-36 rounded-full flex items-center justify-center shadow-lg overflow-hidden mb-4 border-4 border-white"
            style={{
              backgroundColor: user?.avatarConfig
                ? JSON.parse(user.avatarConfig).bgColor
                : "#ff385c",
            }}
          >
            {renderAvatarSVG(user?.avatarConfig || null)}
          </div>
          <h3 className="text-lg font-bold text-[#222222]">
            {user?.name || t('teacher.default_teacher_name')}
          </h3>
          <p className="text-xs font-semibold text-[#ff385c] mt-0.5">
            {t('teacher.coordinator')} {user?.classGroup || "5"}
          </p>
          <button
            onClick={() => setIsAvatarModalOpen(true)}
            className="mt-4 text-xs font-bold text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] px-4 py-2 rounded-full border border-[#dddddd] transition-colors cursor-pointer"
          >
            {t('teacher.change_appearance')}
          </button>
        </div>

        {/* Informasi Akun & Hak Akses */}
        <div className="md:col-span-2 bg-white border border-[#dddddd] rounded-2xl p-6 sm:p-8 airbnb-shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-[#222222] border-b border-[#ebebeb] pb-3">
            {t('teacher.employment_info')}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <span className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider block mb-1">
                {t('teacher.username')}
              </span>
              <p className="text-sm font-bold text-[#222222] flex items-center gap-2">
                <User className="w-4 h-4 text-[#ff385c]" />
                <span>@{user?.username || "pembina"}</span>
              </p>
            </div>

            <div>
              <span className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider block mb-1">
                {t('teacher.study_group')}
              </span>
              <p className="text-sm font-bold text-[#222222] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#ff385c]" />
                <span>{t('teacher.assigned_class')} {user?.classGroup || "5"}</span>
              </p>
            </div>

            <div className="sm:col-span-2">
              <span className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider block mb-1">
                {t('teacher.access_rights')}
              </span>
              <p className="text-xs text-[#3f3f3f] bg-[#f7f7f7] p-3 rounded-xl border border-[#ebebeb] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#ff385c]" />
                <span>
                  {t('teacher.access_rights_desc')}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <AvatarMakerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        initialConfig={user?.avatarConfig}
        onSave={handleSaveAvatar}
      />
    </div>
  );
}
