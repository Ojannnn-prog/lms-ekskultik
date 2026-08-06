"use client";

import React from "react";
import { AlertTriangle, HelpCircle, X } from "lucide-react";
import { useLanguage } from "@/providers/LanguageProvider";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDanger = false,
  loading = false,
}: ConfirmModalProps) {
  const { t } = useLanguage();
  
  const displayConfirmText = confirmText === "Konfirmasi" ? t("ui.confirm") : confirmText;
  const displayCancelText = cancelText === "Batal" ? t("ui.cancel") : cancelText;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#dddddd] airbnb-shadow transform transition-all">
        {/* Header dengan Icon */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDanger
                  ? "bg-[#ffd1da] text-[#c13515]"
                  : "bg-[#f7f7f7] text-[#222222]"
              }`}
            >
              {isDanger ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <HelpCircle className="w-5 h-5" />
              )}
            </div>
            <h3 className="text-lg font-bold text-[#222222] leading-tight">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-[#929292] hover:text-[#222222] transition-colors p-1 rounded-full hover:bg-[#f7f7f7]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deskripsi */}
        <p className="text-sm text-[#3f3f3f] leading-relaxed mb-6">
          {description}
        </p>

        {/* Action Buttons ala Airbnb */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-[#222222] bg-white border border-[#dddddd] rounded-lg hover:border-[#222222] hover:bg-[#f7f7f7] transition-all cursor-pointer"
          >
            {displayCancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all cursor-pointer ${
              isDanger
                ? "bg-[#c13515] hover:bg-[#b32505]"
                : "bg-[#ff385c] hover:bg-[#e00b41]"
            }`}
          >
            {loading ? t("ui.processing") : displayConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
