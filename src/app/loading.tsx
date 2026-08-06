"use client";

import { motion } from "framer-motion";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center min-h-screen">
      {/* Pulsing Logo */}
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#ff385c] flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg mb-6"
      >
        TIK
      </motion.div>

      {/* Loading Text */}
      <div className="flex flex-col items-center space-y-2">
        <h2 className="text-lg sm:text-xl font-bold text-[#222222]">
          Memuat Halaman...
        </h2>
        <p className="text-sm text-[#6a6a6a] text-center px-4 max-w-sm">
          Sedang menyiapkan antarmuka LMS Ekskul TIK SDN 231 Sukaasih untuk
          Anda.
        </p>
      </div>

      {/* Animated dots line */}
      <div className="flex space-x-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
            transition={{
              repeat: Infinity,
              duration: 1,
              delay: i * 0.2,
              ease: "easeInOut",
            }}
            className="w-2.5 h-2.5 bg-[#ff385c] rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
