"use client";

import React, { useEffect, useState } from "react";
import { QrCode, Download, Printer, X, Award, Sparkles } from "lucide-react";
import QRCode from "qrcode";
import toast from "react-hot-toast";

interface StudentQRCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    name: string;
    studentCode: string;
    classGroup: string;
    gender?: string;
    activeTitle?: string | null;
  } | null;
}

export default function StudentQRCardModal({
  isOpen,
  onClose,
  student,
}: StudentQRCardModalProps) {
  const [qrUrl, setQrUrl] = useState<string>("");

  useEffect(() => {
    if (student && student.studentCode) {
      QRCode.toDataURL(student.studentCode, {
        width: 300,
        margin: 2,
        color: {
          dark: "#222222",
          light: "#ffffff",
        },
      })
        .then((url) => setQrUrl(url))
        .catch(() => toast.error("Gagal memproses QR Code"));
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement("a");
    link.download = `KTA-EkskulTIK-${student.studentCode}.png`;
    link.href = qrUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR Code KTA berhasil diunduh");
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-[#dddddd] airbnb-shadow my-8 relative">
        {/* Tombol Close */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#929292] hover:text-[#222222] p-1 rounded-full hover:bg-[#f7f7f7] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Kartu KTA Digital SDN 231 Sukaasih */}
        <div
          id="kta-print-area"
          className="bg-[#f7f7f7] border-2 border-[#222222] rounded-2xl p-6 text-center relative overflow-hidden mb-6"
        >
          {/* Aksen atas Rausch */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-[#ff385c]" />

          <div className="mt-2 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ff385c] block">
              KTA DIGITAL EKSTRAKURIKULER TIK
            </span>
            <h3 className="text-base font-bold text-[#222222]">
              SDN 231 SUKAASIH
            </h3>
          </div>

          {/* QR Code Area */}
          <div className="bg-white p-3 rounded-xl inline-block border border-[#dddddd] airbnb-shadow-sm mb-4">
            {qrUrl ? (
              <img
                src={qrUrl}
                alt={`QR Code ${student.studentCode}`}
                className="w-44 h-44 mx-auto"
              />
            ) : (
              <div className="w-44 h-44 flex items-center justify-center text-xs text-[#929292]">
                Memuat QR...
              </div>
            )}
          </div>

          {/* Informasi Siswa */}
          <h4 className="text-lg font-bold text-[#222222] leading-tight">
            {student.name}
          </h4>
          <p className="text-xs font-semibold text-[#6a6a6a] mt-0.5">
            NIS / Kode QR: <span className="text-[#222222]">{student.studentCode}</span>
          </p>

          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="text-xs font-bold bg-[#222222] text-white px-3 py-1 rounded-full">
              Kelas {student.classGroup}
            </span>
            {student.activeTitle && (
              <span className="text-xs font-bold bg-[#ff385c] text-white px-3 py-1 rounded-full flex items-center gap-1">
                <Award className="w-3 h-3" /> {student.activeTitle}
              </span>
            )}
          </div>

          <p className="text-[10px] text-[#929292] mt-4 pt-3 border-t border-[#ebebeb]">
            Tunjukkan KTA ini kepada Web Scanner untuk absen setiap jadwal kegiatan
          </p>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handlePrintCard}
            className="flex-1 bg-white hover:bg-[#f7f7f7] text-[#222222] border border-[#dddddd] font-semibold text-xs py-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#ff385c]" />
            <span>Cetak KTA</span>
          </button>
          <button
            onClick={handleDownloadQR}
            className="flex-1 bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold text-xs py-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Gambar QR</span>
          </button>
        </div>
      </div>
    </div>
  );
}
