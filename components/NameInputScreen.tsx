"use client";

import React, { useState } from "react";
import { User, ArrowRight, Sparkles, Calculator, BookOpen } from "lucide-react";
import { BoyMascotVector } from "./ChildMascots";

interface NameInputScreenProps {
  initialName?: string;
  onSubmitted: (name: string) => void;
}

export default function NameInputScreen({
  initialName = "",
  onSubmitted,
}: NameInputScreenProps) {
  const [name, setName] = useState(initialName);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) {
      setErrorMsg("Silakan tuliskan nama kamu terlebih dahulu ya! 😊");
      return;
    }
    setErrorMsg("");
    onSubmitted(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-[36px] shadow-2xl border border-slate-100 max-w-lg w-full p-6 sm:p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Hiasan Latar Belakang */}
        <div className="absolute -top-14 -right-14 w-40 h-40 bg-blue-100 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-14 -left-14 w-40 h-40 bg-amber-100 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          {/* Maskot / Logo */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl shadow-lg shadow-blue-500/20">
              <Calculator size={42} strokeWidth={2.5} />
            </div>

            <div className="mt-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
                Media Intervensi Berhitung Interaktif
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-fredoka tracking-tight mt-2">
                Selamat Datang di MathKu!
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
                Papan Hitung Nilai Tempat (Ribuan, Ratusan, Puluhan, Satuan)
              </p>
            </div>
          </div>

          {/* Form Input Nama */}
          <div className="text-left space-y-2 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <label
              htmlFor="student-name-input-screen"
              className="block text-xs font-black uppercase tracking-wider text-slate-600"
            >
              Nama Siswa / Pengguna:
            </label>
            <div className="relative">
              <User size={18} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="student-name-input-screen"
                placeholder="Tuliskan nama Anda di sini..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errorMsg) setErrorMsg("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                autoFocus
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm sm:text-base shadow-2xs"
              />
            </div>
            {errorMsg && <p className="text-xs text-rose-500 font-bold mt-1">{errorMsg}</p>}
          </div>

          {/* Tombol Lanjut ke Contoh Soal */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/25 transition duration-200 transform active:scale-95 text-base flex items-center justify-center gap-2.5 font-fredoka cursor-pointer"
          >
            <BookOpen size={20} />
            <span>Lanjut ke Contoh Soal (Bahan Belajar)</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
