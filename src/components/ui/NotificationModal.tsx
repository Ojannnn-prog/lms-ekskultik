"use client";

import React, { useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Trophy,
  Award,
  Sparkles,
  HelpCircle,
  X,
  ArrowRight,
} from "lucide-react";

export type NotificationModalType =
  | "success"
  | "celebration"
  | "reward"
  | "error"
  | "info";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: NotificationModalType;
  title: string;
  description: string;
  badgeText?: string;
  primaryButtonText?: string;
  onPrimaryClick?: () => void;
  secondaryButtonText?: string;
  onSecondaryClick?: () => void;
  autoCloseDelay?: number;
}

export default function NotificationModal({
  isOpen,
  onClose,
  type = "info",
  title,
  description,
  badgeText,
  primaryButtonText = "Mengerti & Lanjutkan",
  onPrimaryClick,
  secondaryButtonText,
  onSecondaryClick,
  autoCloseDelay,
}: NotificationModalProps) {
  useEffect(() => {
    if (isOpen && autoCloseDelay) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  const handlePrimary = () => {
    if (onPrimaryClick) {
      onPrimaryClick();
    } else {
      onClose();
    }
  };

  const handleSecondary = () => {
    if (onSecondaryClick) {
      onSecondaryClick();
    } else {
      onClose();
    }
  };

  // Tema gaya berdasarkan tipe modal
  const getTypeStyles = () => {
    switch (type) {
      case "celebration":
      case "reward":
        return {
          bgIcon: "bg-gradient-to-br from-[#ff385c] to-[#d70466] text-white",
          icon: <Trophy className="w-7 h-7 animate-bounce" />,
          badgeBg:
            "bg-gradient-to-r from-[#fff8f6] to-[#ffe5ed] border-[#ffb6ce] text-[#ff385c]",
          primaryBtn:
            "bg-gradient-to-r from-[#ff385c] to-[#e00b41] hover:from-[#e00b41] hover:to-[#c40635] text-white",
          borderGlow: "border-[#ff385c]/30 shadow-2xl shadow-[#ff385c]/10",
        };
      case "success":
        return {
          bgIcon: "bg-gradient-to-br from-green-500 to-emerald-600 text-white",
          icon: <CheckCircle2 className="w-7 h-7" />,
          badgeBg: "bg-green-50 border-green-200 text-green-800",
          primaryBtn:
            "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white",
          borderGlow: "border-green-500/30 shadow-2xl shadow-green-500/10",
        };
      case "error":
        return {
          bgIcon: "bg-gradient-to-br from-red-500 to-rose-600 text-white",
          icon: <AlertCircle className="w-7 h-7" />,
          badgeBg: "bg-red-50 border-red-200 text-red-800",
          primaryBtn:
            "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white",
          borderGlow: "border-red-500/30 shadow-2xl shadow-red-500/10",
        };
      case "info":
      default:
        return {
          bgIcon: "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
          icon: <Sparkles className="w-7 h-7" />,
          badgeBg: "bg-blue-50 border-blue-200 text-blue-800",
          primaryBtn:
            "bg-gradient-to-r from-[#222222] to-[#333333] hover:from-[#000000] hover:to-[#222222] text-white",
          borderGlow: "border-[#dddddd] shadow-xl",
        };
    }
  };

  const style = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div
        className={`bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border-2 ${style.borderGlow} transform transition-all relative overflow-hidden`}
      >
        {/* Dekorasi Cahaya di sudut atas (Glassmorphism Luxury) */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#ff385c]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#929292] hover:text-[#222222] hover:bg-[#f7f7f7] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon Mewah */}
        <div className="flex flex-col items-center text-center mt-2 mb-5">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 airbnb-shadow-sm ${style.bgIcon}`}
          >
            {style.icon}
          </div>

          <h3 className="text-xl font-extrabold text-[#222222] leading-tight px-2">
            {title}
          </h3>

          <p className="text-sm text-[#555555] mt-2.5 leading-relaxed px-2">
            {description}
          </p>
        </div>

        {/* Badge / Highlight Tambahan jika ada */}
        {badgeText && (
          <div
            className={`my-5 p-3.5 rounded-2xl border text-center font-bold text-sm flex items-center justify-center gap-2 ${style.badgeBg}`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>{badgeText}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className={`flex flex-col sm:flex-row items-center gap-3 mt-6 ${
            secondaryButtonText ? "justify-between" : "justify-center"
          }`}
        >
          {secondaryButtonText && (
            <button
              type="button"
              onClick={handleSecondary}
              className="w-full sm:w-1/2 py-3.5 px-5 rounded-xl font-bold text-sm text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] border border-[#dddddd] transition-all cursor-pointer text-center"
            >
              {secondaryButtonText}
            </button>
          )}

          <button
            type="button"
            onClick={handlePrimary}
            className={`w-full ${
              secondaryButtonText ? "sm:w-1/2" : ""
            } py-3.5 px-6 rounded-xl font-bold text-sm airbnb-shadow-sm transition-all transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 ${
              style.primaryBtn
            }`}
          >
            <span>{primaryButtonText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
