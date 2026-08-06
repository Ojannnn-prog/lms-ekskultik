"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Volume2,
  Sparkles,
  UserCheck,
  Search,
  Camera,
  CameraOff,
  RefreshCw,
} from "lucide-react";
import { useNotificationModal } from "@/providers/NotificationProvider";
import { Html5Qrcode } from "html5-qrcode";
import { useLanguage } from "@/providers/LanguageProvider";
import { scanStudentQRCodeAttendance } from "../actions";
import NotificationModal, { NotificationModalType } from "@/components/ui/NotificationModal";

export default function AdminScannerPage() {
  const { t } = useLanguage();
  const { show } = useNotificationModal();

  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    alreadyRecorded?: boolean;
    error?: string;
    student?: {
      name: string;
      studentCode: string;
      classGroup: string;
      status: string;
    };
  } | null>(null);

  // State untuk Live Camera QR Scanner
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);

  // State untuk Notifikasi Modal Sukses Absen
  const [notifModal, setNotifModal] = useState<{
    isOpen: boolean;
    type: NotificationModalType;
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    description: "",
  });

  // Fungsi Bunyi Audio Beep menggunakan Web Audio API (Tanpa file eksternal)
  const playBeepSound = (isSuccess = true) => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.value = isSuccess ? 880 : 330; // Nada tinggi jika sukses, rendah jika gagal
      gain.gain.value = 0.2;

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 180);
    } catch {
      // Abaikan jika browser memblokir autostart audio
    }
  };

  // Muat daftar kamera peramban
  const fetchAvailableCameras = async () => {
    try {
      const deviceList = await Html5Qrcode.getCameras();
      if (deviceList && deviceList.length > 0) {
        setCameras(
          deviceList.map((c) => ({
            id: c.id,
            label: c.label || `Kamera ${c.id.slice(0, 5)}...`,
          }))
        );
        setSelectedCameraId(deviceList[0].id);
      } else {
        show({ type: 'error', title: 'Perhatian', description: `Tidak ada kamera/webcam ditemukan di perangkat Anda`, autoCloseDelay: 2500 });
      }
    } catch {
      show({ type: 'error', title: 'Perhatian', description: `Izin kamera peramban diperlukan untuk scan otomatis`, autoCloseDelay: 2500 });
    }
  };

  const startCameraScanner = async () => {
    if (!selectedCameraId) {
      await fetchAvailableCameras();
      return;
    }

    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      const html5QrCode = new Html5Qrcode("qr-reader");
      html5QrCodeRef.current = html5QrCode;

      setIsCameraActive(true);
      isScanningRef.current = true;

      await html5QrCode.start(
        selectedCameraId,
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
        },
        async (decodedText) => {
          // Ketika QR / Barcode berhasil dideteksi kamera
          if (!isScanningRef.current) return;
          isScanningRef.current = false; // Jeda sejenak agar tidak scan berulang kali dalam 1 detik

          await processScanCode(decodedText);

          // Lanjutkan scan setelah jeda 2.5 detik
          setTimeout(() => {
            isScanningRef.current = true;
          }, 2500);
        },
        (errorMessage) => {
          // Abaikan log frame yang tidak mengandung QR
        }
      );
    } catch {
      show({ type: 'error', title: 'Perhatian', description: `Gagal mengaktifkan kamera. Periksa izin akses kamera browser.`, autoCloseDelay: 2500 });
      setIsCameraActive(false);
    }
  };

  const stopCameraScanner = async () => {
    try {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
    } catch {
      // ignore
    } finally {
      setIsCameraActive(false);
      isScanningRef.current = false;
    }
  };

  useEffect(() => {
    fetchAvailableCameras();
    return () => {
      stopCameraScanner();
    };
  }, []);

  const processScanCode = async (code: string) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    setLoading(true);
    setLastResult(null);
    try {
      const res = await scanStudentQRCodeAttendance(cleanCode);
      setLastResult(res);
      if (res.success) {
        playBeepSound(true);
        if (res.alreadyRecorded) {
          show({ type: 'info', title: 'Informasi', description: `${res.student?.name} ${t("admin.scanner.alreadyPresent")}`, autoCloseDelay: 2000 });
        } else {
          setNotifModal({
            isOpen: true,
            type: "success",
            title: t("admin.scanner.successNotifTitle"),
            description: `${res.student?.name} ${t("admin.scanner.pointsEarned")}`,
          });
        }
      } else {
        playBeepSound(false);
        show({ type: 'error', title: 'Perhatian', description: res.error || t("admin.scanner.failedToRecord"), autoCloseDelay: 2500 });
      }
      setInputCode("");
    } catch {
      show({ type: 'error', title: 'Perhatian', description: `Terjadi kesalahan sistem scanner`, autoCloseDelay: 2500 });
      playBeepSound(false);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputCode.trim()) return;
    await processScanCode(inputCode);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dddddd] airbnb-shadow-sm text-center">
        <div className="inline-flex items-center gap-1.5 bg-[#f7f7f7] px-3.5 py-1.5 rounded-full mb-3 border border-[#ebebeb]">
          <Sparkles className="w-3.5 h-3.5 text-[#ff385c]" />
          <span className="text-xs font-semibold text-[#222222]">
            Modul Presensi KTA Digital
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#222222] tracking-tight">
          Web Scanner QR & Barcode Presensi
        </h1>
        <p className="text-sm text-[#6a6a6a] max-w-lg mx-auto mt-1">
          Gunakan kamera peramban secara langsung (*Live Camera*) atau ketik NIS
          manual untuk mencatat absensi harian Ekskul TIK secara cepat dan
          akurat.
        </p>
      </div>

      {/* LIVE CAMERA QR SCANNER SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dddddd] airbnb-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#ebebeb]">
          <div className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-[#ff385c]" />
            <div>
              <h2 className="text-lg font-bold text-[#222222]">
                Pemindai Kamera Live (Auto-Scan)
              </h2>
              <p className="text-xs text-[#6a6a6a]">
                Arahkan kartu KTA QR Siswa ke bingkai kamera untuk mencatat
                secara otomatis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {cameras.length > 1 && (
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  if (isCameraActive) {
                    stopCameraScanner().then(() => {
                      setTimeout(startCameraScanner, 300);
                    });
                  }
                }}
                className="bg-[#f7f7f7] text-xs text-[#222222] font-semibold px-3 py-2.5 rounded-lg border border-[#dddddd] cursor-pointer"
              >
                {cameras.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}

            {!isCameraActive ? (
              <button
                onClick={startCameraScanner}
                className="flex-1 sm:flex-none bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors airbnb-shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>{t("admin.scanner.startCameraBtn")}</span>
              </button>
            ) : (
              <button
                onClick={stopCameraScanner}
                className="flex-1 sm:flex-none bg-[#222222] hover:bg-[#3f3f3f] text-white text-xs font-bold px-5 py-3 rounded-xl transition-colors airbnb-shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <CameraOff className="w-4 h-4 text-[#ff385c]" />
                <span>{t("admin.scanner.stopCameraBtn")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Viewfinder Area Kamera */}
        <div className="flex flex-col items-center justify-center bg-[#f7f7f7] rounded-2xl border-2 border-dashed border-[#dddddd] p-4 min-h-[320px] relative overflow-hidden">
          <div
            id="qr-reader"
            className={`w-full max-w-sm mx-auto rounded-xl overflow-hidden ${
              !isCameraActive ? "hidden" : "block"
            }`}
          />

          {!isCameraActive && (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 rounded-full bg-white border border-[#dddddd] airbnb-shadow-sm flex items-center justify-center mx-auto mb-3">
                <Camera className="w-8 h-8 text-[#ff385c]" />
              </div>
              <h3 className="text-base font-bold text-[#222222]">
                Kamera Scanner Nonaktif
              </h3>
              <p className="text-xs text-[#6a6a6a] max-w-xs mx-auto mt-1 mb-4">
                Tekan tombol "Mulai Kamera Scanner" di atas dan berikan izin
                kamera peramban Anda untuk memindai QR secara otomatis.
              </p>
              <button
                onClick={startCameraScanner}
                className="text-xs font-bold bg-white hover:bg-[#ebebeb] text-[#222222] px-4 py-2 rounded-lg border border-[#dddddd] transition-colors cursor-pointer"
              >
                Aktifkan Sekarang
              </button>
            </div>
          )}
        </div>
      </div>

      {/* INPUT NIS / BARCODE MANUAL FALLBACK */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#dddddd] airbnb-shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#ff385c]" />
            <h2 className="text-base font-bold text-[#222222]">
              Alternatif: Input NIS Manual / Barcode Gun
            </h2>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-[#6a6a6a]">
            <Volume2 className="w-4 h-4 text-[#ff385c]" />
            <span>{t("admin.scanner.audioBeepActive")}</span>
          </div>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-[#929292]" />
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={t("admin.scanner.inputPlaceholder")}
              className="w-full bg-[#f7f7f7] text-[#222222] text-base font-semibold rounded-xl pl-12 pr-28 py-4 border-2 border-[#ebebeb] focus:bg-white focus:border-[#ff385c] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !inputCode.trim()}
              className="absolute right-2.5 top-2.5 bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? t("admin.scanner.processingBtn") : t("admin.scanner.processBtn")}
            </button>
          </div>
        </form>
      </div>

      {/* HASIL PRESENSI TERAKHIR */}
      {lastResult && (
        <div
          className={`p-6 rounded-2xl border transition-all animate-fadeIn ${
            lastResult.success
              ? lastResult.alreadyRecorded
                ? "bg-amber-50 border-amber-200"
                : "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          {lastResult.success ? (
            <div className="flex items-start gap-4">
              <CheckCircle2
                className={`w-8 h-8 shrink-0 ${
                  lastResult.alreadyRecorded
                    ? "text-amber-600"
                    : "text-green-600"
                }`}
              />
              <div>
                <h3 className="text-lg font-bold text-[#222222]">
                  {lastResult.alreadyRecorded
                    ? "Kehadiran Sudah Dicatat Sebelumnya"
                    : "Presensi Berhasil Dicatat!"}
                </h3>
                <div className="mt-2 text-sm text-[#3f3f3f] space-y-1">
                  <p>
                    <strong>{t("admin.scanner.studentNameLabel")}</strong>{" "}
                    {lastResult.student?.name}
                  </p>
                  <p>
                    <strong>{t("admin.scanner.nisLabel")}</strong>{" "}
                    {lastResult.student?.studentCode} • Kelas{" "}
                    {lastResult.student?.classGroup}
                  </p>
                  <p>
                    <strong>{t("admin.scanner.statusLabel")}</strong>{" "}
                    <span className="font-bold text-green-700">
                      {lastResult.student?.status}
                    </span>
                  </p>
                </div>
                {!lastResult.alreadyRecorded && (
                  <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold bg-green-200 text-green-900 px-3 py-1 rounded-full">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{t("admin.scanner.pointsAdded")}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <AlertCircle className="w-8 h-8 text-red-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-red-900">
                  Presensi Gagal
                </h3>
                <p className="text-sm text-red-700 mt-0.5">
                  {lastResult.error}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <NotificationModal
        isOpen={notifModal.isOpen}
        type={notifModal.type}
        title={notifModal.title}
        description={notifModal.description}
        autoCloseDelay={1500}
        onClose={() => setNotifModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
