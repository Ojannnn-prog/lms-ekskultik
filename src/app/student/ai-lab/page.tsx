"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Cpu, Leaf, RefreshCw, Trophy, Volume2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/providers/LanguageProvider";

const FULL_DATASET = [
  { id: 1, name: "Laptop", type: "tech", icon: "💻" },
  { id: 2, name: "Handphone", type: "tech", icon: "📱" },
  { id: 3, name: "Jam Pintar", type: "tech", icon: "⌚" },
  { id: 4, name: "Komputer", type: "tech", icon: "🖥️" },
  { id: 5, name: "Keyboard", type: "tech", icon: "⌨️" },
  { id: 6, name: "Pisang", type: "non-tech", icon: "🍌" },
  { id: 7, name: "Kucing", type: "non-tech", icon: "🐈" },
  { id: 8, name: "Mobil", type: "non-tech", icon: "🚗" },
  { id: 9, name: "Burger", type: "non-tech", icon: "🍔" },
  { id: 10, name: "Sepeda", type: "non-tech", icon: "🚲" },
  { id: 11, name: "Mouse", type: "tech", icon: "🖱️" },
  { id: 12, name: "Buku", type: "non-tech", icon: "📚" },
  { id: 13, name: "Headphone", type: "tech", icon: "🎧" },
  { id: 14, name: "Bunga", type: "non-tech", icon: "🌻" },
  { id: 15, name: "Kamera", type: "tech", icon: "📷" },
  { id: 16, name: "Sepatu", type: "non-tech", icon: "👞" },
  { id: 17, name: "Konsol Game", type: "tech", icon: "🎮" },
  { id: 18, name: "Pohon", type: "non-tech", icon: "🌲" },
  { id: 19, name: "Televisi", type: "tech", icon: "📺" },
  { id: 20, name: "Es Krim", type: "non-tech", icon: "🍦" },
];

export default function AILabPage() {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"loading" | "playing" | "finished">("loading");
  const [items, setItems] = useState<typeof FULL_DATASET>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const speak = (text: string) => {
    if (!isVoiceEnabled) return;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); 
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.pitch = 1.3;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const initGame = () => {
    setStatus("loading");
    setFeedback(null);
    setCurrentIndex(0);
    
    // Shuffle all items and pick 8
    const shuffled = [...FULL_DATASET].sort(() => Math.random() - 0.5).slice(0, 8);
    setItems(shuffled);

    // 2s loading animation before start
    setTimeout(() => {
      setStatus("playing");
      speak("Halo! Bantu aku belajar memilah data ya!");
    }, 2500);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleClassify = (selectedType: "tech" | "non-tech") => {
    const currentItem = items[currentIndex];
    
    if (currentItem.type === selectedType) {
      setFeedback("correct");
      const correctPhrases = ["Kamu benar!", "Wah hebat!", "Tepat sekali!", "Pintar!"];
      speak(correctPhrases[Math.floor(Math.random() * correctPhrases.length)]);
      
      setTimeout(() => {
        setFeedback(null);
        if (currentIndex + 1 < items.length) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setStatus("finished");
          speak("Hore! Kamu berhasil mengklasifikasikan semua data dengan benar! Terima kasih ya!");
        }
      }, 1000);
    } else {
      setFeedback("wrong");
      speak("Oops, kamu salah, coba lagi ya!");
      setTimeout(() => {
        setFeedback(null);
      }, 1000);
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    const threshold = 100;
    if (info.offset.x < -threshold) {
      handleClassify("tech");
    } else if (info.offset.x > threshold) {
      handleClassify("non-tech");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-center p-6 text-[#222222]">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-8xl mb-6"
        >
          🤖
        </motion.div>
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-2">
          AI Ekskul Sedang Bersiap...
        </h1>
        <p className="text-[#6a6a6a] text-center max-w-md">
          Mempersiapkan data lab untuk kamu pelajari. Tunggu sebentar ya!
        </p>
        <div className="w-48 h-2 bg-[#ebebeb] rounded-full mt-8 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5 }}
            className="h-full bg-[#ff385c] rounded-full"
          />
        </div>
      </div>
    );
  }

  if (status === "finished") {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex flex-col items-center justify-center p-6 text-[#222222]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="bg-white rounded-3xl p-8 sm:p-12 max-w-md w-full text-center airbnb-shadow border border-[#dddddd]"
        >
          <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl">
            🏆
          </div>
          <h1 className="text-3xl font-bold mb-4">Luar Biasa!</h1>
          <p className="text-[#6a6a6a] mb-8 leading-relaxed">
            Kamu telah membantu Robot AI Ekskul memilah semua data dengan tepat. Pengetahuan AI-nya sekarang makin bertambah!
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={initGame}
              className="w-full bg-[#ff385c] hover:bg-[#e00b41] text-white font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-5 h-5" />
              Main Lagi
            </button>
            <Link
              href="/student"
              className="w-full bg-white border border-[#dddddd] hover:bg-[#f7f7f7] text-[#222222] font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Kembali ke Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col overflow-hidden">
      <div className="bg-white border-b border-[#dddddd] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <Link
          href="/student"
          className="flex items-center gap-2 text-[#6a6a6a] hover:text-[#222222] font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Kembali</span>
        </Link>
        <div className="font-bold text-[#222222] text-lg flex items-center gap-2">
          🤖 Lab AI Klasifikasi
        </div>
        <button
          onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
          className={`p-2 rounded-full transition-colors cursor-pointer ${
            isVoiceEnabled ? "bg-[#e8f4fd] text-[#0066cc]" : "bg-[#f7f7f7] text-[#6a6a6a]"
          }`}
          title="Toggle Suara"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full relative">
        <div className="absolute top-4 sm:top-8 w-full px-4 flex flex-col items-center gap-2">
          <p className="font-bold text-[#6a6a6a] text-sm">
            Data {currentIndex + 1} dari {items.length}
          </p>
          <div className="w-full max-w-md h-2 bg-[#ebebeb] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#ff385c] transition-all duration-300"
              style={{ width: `${(currentIndex / items.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-center mb-8 mt-16 text-[#222222]">
          Geser benda ini ke kelompok yang benar!
        </h2>

        <div className="flex w-full items-center justify-between gap-2 sm:gap-8 relative min-h-[300px]">
          
          <div className="flex flex-col items-center gap-3 w-1/3 opacity-80 pointer-events-none">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-blue-100 border-4 border-blue-300 flex items-center justify-center text-blue-600">
              <Cpu className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <p className="font-bold text-blue-600 text-sm sm:text-lg text-center leading-tight">Teknologi<br/><span className="text-xs font-normal">(Kiri)</span></p>
          </div>

          <div className="w-1/3 flex justify-center z-20">
            <AnimatePresence mode="popLayout">
              {currentItem && (
                <motion.div
                  key={currentItem.id}
                  drag
                  dragSnapToOrigin
                  onDragEnd={handleDragEnd}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ 
                    scale: 1, 
                    rotate: 0,
                    x: feedback === "wrong" ? [0, -10, 10, -10, 10, 0] : 0
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 200, 
                    damping: 15,
                    x: { type: "tween", duration: 0.4 } 
                  }}
                  className={`w-28 h-28 sm:w-40 sm:h-40 rounded-3xl bg-white border-4 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing airbnb-shadow-md select-none touch-none ${
                    feedback === "correct" ? "border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]" :
                    feedback === "wrong" ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" :
                    "border-[#dddddd]"
                  }`}
                >
                  <span className="text-5xl sm:text-7xl mb-2">{currentItem.icon}</span>
                  <span className="font-bold text-sm sm:text-lg text-[#222222]">{currentItem.name}</span>
                  
                  {feedback === "correct" && (
                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white">
                      ✓
                    </div>
                  )}
                  {feedback === "wrong" && (
                    <div className="absolute -top-4 -right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center text-xl shadow-lg border-2 border-white">
                      ✗
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex flex-col items-center gap-3 w-1/3 opacity-80 pointer-events-none">
            <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-3xl bg-amber-100 border-4 border-amber-300 flex items-center justify-center text-amber-600">
              <Leaf className="w-8 h-8 sm:w-12 sm:h-12" />
            </div>
            <p className="font-bold text-amber-600 text-sm sm:text-lg text-center leading-tight">Bukan<br/>Teknologi<br/><span className="text-xs font-normal">(Kanan)</span></p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
