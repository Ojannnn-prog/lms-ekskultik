"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  FileText,
  Video,
  Presentation,
  Table,
  HardDrive,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { parseSmartEmbedUrl, SmartEmbedInfo } from "@/lib/smartEmbed";
import { useLanguage } from "@/providers/LanguageProvider";

interface SmartEmbedViewerProps {
  url: string;
  title?: string;
  type?: string;
  compact?: boolean;
}

export default function SmartEmbedViewer({
  url,
  title = "Materi Pembelajaran TIK",
  type,
  compact = false,
}: SmartEmbedViewerProps) {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const embedInfo = parseSmartEmbedUrl(url);

  if (!embedInfo) {
    return null;
  }

  const isGoogleDrive = embedInfo.platform.startsWith("GOOGLE_");

  const handleCopyLink = () => {
    navigator.clipboard.writeText(embedInfo.viewUrl);
    setCopied(true);
    toast.success(t("ui.copyLinkSuccess"));
    setTimeout(() => setCopied(false), 2500);
  };

  const getPlatformIcon = () => {
    switch (embedInfo.iconName) {
      case "drive":
        return <HardDrive className="w-4 h-4 text-[#ff385c]" />;
      case "docs":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "slides":
        return <Presentation className="w-4 h-4 text-amber-500" />;
      case "sheets":
        return <Table className="w-4 h-4 text-green-600" />;
      case "youtube":
        return <Video className="w-4 h-4 text-red-600" />;
      case "pdf":
        return <FileText className="w-4 h-4 text-[#ff385c]" />;
      default:
        return <LinkIcon className="w-4 h-4 text-[#222222]" />;
    }
  };

  // Jika tautan tidak bisa di-embed (misal tautan eksternal biasa)
  if (!embedInfo.isEmbeddable) {
    return (
      <div className="p-6 sm:p-8 bg-[#f7f7f7] rounded-3xl border border-[#dddddd] airbnb-shadow-sm text-center space-y-4 my-6">
        <div className="w-14 h-14 rounded-2xl bg-white border border-[#ebebeb] flex items-center justify-center mx-auto airbnb-shadow-sm">
          <LinkIcon className="w-7 h-7 text-[#ff385c]" />
        </div>
        <div>
          <span className="text-xs font-bold text-[#ff385c] uppercase tracking-wider block mb-1">
            {embedInfo.label}
          </span>
          <h3 className="text-lg font-bold text-[#222222]">{title}</h3>
          <p className="text-xs text-[#6a6a6a] max-w-md mx-auto mt-1">
            {t("ui.externalLinkInfo")}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={embedInfo.viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#ff385c] hover:bg-[#e00b41] text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors airbnb-shadow-sm inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{t("ui.openLinkNow")}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={handleCopyLink}
            className="bg-white hover:bg-[#ebebeb] text-[#222222] font-semibold text-xs px-4 py-3 rounded-xl border border-[#dddddd] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? t("ui.copied") : t("ui.copyLink")}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 my-6 animate-fadeIn">
      {/* SMART HEADER TOOLBAR (RESPONSIVE MOBILE & DESKTOP) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#dddddd] airbnb-shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Info Platform & File */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 bg-[#f7f7f7] rounded-xl border border-[#ebebeb] shrink-0">
            {getPlatformIcon()}
          </div>
          <div className="min-w-0">
            <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#ff385c] bg-[#fff8f6] px-2.5 py-0.5 rounded-full border border-[#ff385c]/20 mb-1">
              {embedInfo.label}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-[#222222] truncate">
              {title}
            </h3>
          </div>
        </div>

        {/* Action Toolbar Responsif (Touch Friendly di Mobile) */}
        <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#ebebeb]">
          {/* Tombol Salin Link Sharing */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 text-xs font-semibold text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] rounded-xl border border-[#dddddd] transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Salin Link Sharing Google Drive / Dokumen"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span className="hidden xs:inline">
              {copied ? t("ui.copied") : t("ui.copy")}
            </span>
          </button>

          {/* Tombol Unduh File (Jika Google Drive File & Bukan Compact) */}
          {embedInfo.downloadUrl && !compact && (
            <a
              href={embedInfo.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-semibold text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] rounded-xl border border-[#dddddd] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Unduh File Langsung dari Google Drive"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("ui.download")}</span>
            </a>
          )}

          {/* Tombol Mode Fullscreen / Expand (Jika Bukan Compact) */}
          {!compact && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-2 text-xs font-semibold text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] rounded-xl border border-[#dddddd] transition-colors flex items-center gap-1.5 cursor-pointer"
              title={isExpanded ? "Tampilan Normal" : "Mode Baca Luas (Fullscreen)"}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden md:inline">
                {isExpanded ? t("ui.normal") : t("ui.expand")}
              </span>
            </button>
          )}

          {/* Tombol Buka di Tab Baru / App Drive (Penting untuk HP / Cookie Block) */}
          <a
            href={embedInfo.viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 text-xs font-bold text-white bg-[#ff385c] hover:bg-[#e00b41] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer airbnb-shadow-sm"
            title="Buka langsung di Google Drive / YouTube App"
          >
            <span>{t("ui.openInApp")}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* RESPONSIVE IFRAME CONTAINER (ADAPTIF MOBILE & DESKTOP) */}
      <div
        className={`relative w-full rounded-2xl sm:rounded-3xl border border-[#dddddd] airbnb-shadow-sm overflow-hidden bg-[#222222]/5 transition-all duration-300 ${
          isExpanded
            ? "h-[85vh] z-40"
            : compact
            ? "h-[240px] sm:h-[280px]"
            : "h-[380px] sm:h-[480px] md:h-[580px] lg:h-[660px]"
        }`}
      >
        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f7f7f7] z-10 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#ff385c]" />
            <p className="text-xs font-semibold text-[#6a6a6a]">
              {t("ui.loadingFile", { label: embedInfo.label })}
            </p>
          </div>
        )}

        <iframe
          src={embedInfo.embedUrl}
          className={`w-full border-0 ${
            isGoogleDrive && !isExpanded
              ? "absolute top-[-46px] left-0 h-[calc(100%+46px)]"
              : "h-full"
          }`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      </div>
    </div>
  );
}
