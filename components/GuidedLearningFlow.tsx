"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Volume2,
  Sparkles,
  RotateCcw,
  Check,
} from "lucide-react";
import { BoyMascotVector, GirlMascotVector } from "./ChildMascots";
import MultiLevelHelpModal from "./MultiLevelHelpModal";

interface GuidedLearningFlowProps {
  initialOp?: "+" | "-" | "×" | "÷";
  onFinish?: () => void;
  onBackToHome?: () => void;
  onGoToPractice?: (op: "+" | "-" | "×" | "÷") => void;
}

export default function GuidedLearningFlow({
  initialOp = "×",
  onFinish,
  onBackToHome,
  onGoToPractice,
}: GuidedLearningFlowProps) {
  const [currentOp, setCurrentOp] = useState<"+" | "-" | "×" | "÷">(initialOp);
  const [stepIndex, setStepIndex] = useState<number>(1);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Input states for interactive steps
  const [inputs, setInputs] = useState<{ [key: string]: string }>({});

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleInputChange = (key: string, val: string) => {
    setInputs((prev) => ({ ...prev, [key]: val }));
  };

  // Reset steps when changing operation
  const handleChangeOp = (op: "+" | "-" | "×" | "÷") => {
    setCurrentOp(op);
    setStepIndex(1);
    setInputs({});
  };

  // =========================================================================
  // 1. FLOW PERKALIAN (Gambar 1 Step 2 - 5): 242 × 2 = 484
  // =========================================================================
  const renderPerkalianFlow = () => {
    const totalSteps = 4;

    return (
      <div className="flex flex-col gap-5">
        {/* Step Header */}
        <div className="bg-blue-600 text-white p-3.5 sm:px-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
              {stepIndex}
            </span>
            <h3 className="text-xs sm:text-sm font-black font-fredoka tracking-wide">
              {stepIndex === 1 && "Langkah 1 – Mengurai Nilai Tempat (Pecah Bilangan)"}
              {stepIndex === 2 && "Langkah 2 – Hitung Setiap Bagian"}
              {stepIndex === 3 && "Langkah 3 – Gabungkan Hasil"}
              {stepIndex === 4 && "Selesai – Ringkasan Pemahaman"}
            </h3>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  stepIndex === idx + 1 ? "bg-white scale-125" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Pecah Bilangannya (Branching Tree Diagram) */}
        {stepIndex === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-6">
            <div className="flex items-center gap-2 self-start">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <h4 className="font-black text-slate-800 font-fredoka text-base sm:text-lg">
                Pecah Bilangannya
              </h4>
            </div>

            {/* Main Problem Card */}
            <div className="bg-rose-50 border border-rose-200 px-8 py-3.5 rounded-2xl text-2xl sm:text-3xl font-black text-slate-900 font-fredoka shadow-2xs">
              242 × 2
            </div>

            {/* Tree Branching Diagram */}
            <div className="w-full max-w-xl flex flex-col items-center">
              {/* Connector lines SVG */}
              <svg className="w-full h-12 stroke-blue-400 stroke-[3]" fill="none" viewBox="0 0 400 48">
                <path d="M200 0 L200 16" />
                <path d="M200 16 L65 48" />
                <path d="M200 16 L200 48" />
                <path d="M200 16 L335 48" />
              </svg>

              {/* 3 Branches */}
              <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full text-center">
                {/* Ratusan */}
                <div className="bg-blue-100/70 border-2 border-blue-200 rounded-2xl p-3 sm:p-4 flex flex-col items-center shadow-2xs">
                  <span className="text-xl sm:text-2xl font-black text-blue-900 font-fredoka">200</span>
                  <span className="text-[11px] font-bold text-blue-700">(2 ratusan)</span>
                </div>

                {/* Puluhan */}
                <div className="bg-emerald-100/70 border-2 border-emerald-200 rounded-2xl p-3 sm:p-4 flex flex-col items-center shadow-2xs">
                  <span className="text-xl sm:text-2xl font-black text-emerald-900 font-fredoka">40</span>
                  <span className="text-[11px] font-bold text-emerald-700">(4 puluhan)</span>
                </div>

                {/* Satuan */}
                <div className="bg-amber-100/70 border-2 border-amber-200 rounded-2xl p-3 sm:p-4 flex flex-col items-center shadow-2xs">
                  <span className="text-xl sm:text-2xl font-black text-amber-900 font-fredoka">2</span>
                  <span className="text-[11px] font-bold text-amber-700">(2 satuan)</span>
                </div>
              </div>
            </div>

            {/* Mascot Explanation Card */}
            <div className="flex items-center gap-4 bg-rose-50/70 border border-rose-200/80 p-4 rounded-2xl max-w-lg w-full">
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                <GirlMascotVector size={56} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                &quot;242 terdiri dari <strong>2 ratusan (200)</strong>, <strong>4 puluhan (40)</strong>, dan <strong>2 satuan (2)</strong>. Kita kalikan masing-masing dengan 2, ya!&quot;
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Hitung Setiap Bagian (Visual Balok Ratusan, Puluhan, Satuan) */}
        {stepIndex === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  2
                </span>
                <h4 className="font-black text-slate-800 font-fredoka text-base sm:text-lg">
                  Hitung hasil perkalian setiap bagian berikut!
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle size={15} />
                <span>Butuh Bantuan?</span>
              </button>
            </div>

            {/* 3 Columns Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Kolom 1: Ratusan */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-3xl p-4 flex flex-col items-center gap-3">
                <span className="font-black text-blue-900 font-fredoka text-base">
                  200 × 2 = ?
                </span>

                {/* Visual 2 Papan Ratusan (Flats) */}
                <div className="flex gap-2 p-3 bg-white rounded-2xl border border-blue-100 shadow-2xs h-28 items-center justify-center">
                  <div className="w-14 h-14 bg-blue-500 rounded border border-blue-600 grid grid-cols-5 gap-0.5 p-0.5" title="100 balok">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className="bg-blue-400/70 rounded-3xs" />
                    ))}
                  </div>
                  <div className="w-14 h-14 bg-blue-500 rounded border border-blue-600 grid grid-cols-5 gap-0.5 p-0.5" title="100 balok">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className="bg-blue-400/70 rounded-3xs" />
                    ))}
                  </div>
                </div>

                {/* Input & Centang */}
                <div className="flex items-center gap-2 w-full max-w-[140px]">
                  <input
                    type="number"
                    value={inputs["part_h"] ?? "400"}
                    onChange={(e) => handleInputChange("part_h", e.target.value)}
                    className="w-full text-center py-2 px-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-800 text-base focus:border-blue-500 focus:outline-none"
                    placeholder="Hasil"
                  />
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check size={16} className="stroke-[3]" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => speakText("Bagus! Dua ratus dikali dua sama dengan empat ratus.")}
                  className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full hover:bg-emerald-200 transition cursor-pointer"
                >
                  <Volume2 size={13} />
                  <span>Bagus!</span>
                </button>
              </div>

              {/* Kolom 2: Puluhan */}
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-4 flex flex-col items-center gap-3">
                <span className="font-black text-emerald-900 font-fredoka text-base">
                  40 × 2 = ?
                </span>

                {/* Visual 4 Batang Puluhan (Rods) */}
                <div className="flex gap-1.5 p-3 bg-white rounded-2xl border border-emerald-100 shadow-2xs h-28 items-center justify-center">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-3.5 h-20 bg-emerald-500 rounded-sm border border-emerald-600 flex flex-col justify-between p-0.5" title="10 balok">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <div key={j} className="w-full h-1 bg-emerald-400/70" />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Input & Centang */}
                <div className="flex items-center gap-2 w-full max-w-[140px]">
                  <input
                    type="number"
                    value={inputs["part_t"] ?? "80"}
                    onChange={(e) => handleInputChange("part_t", e.target.value)}
                    className="w-full text-center py-2 px-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-800 text-base focus:border-emerald-500 focus:outline-none"
                    placeholder="Hasil"
                  />
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check size={16} className="stroke-[3]" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => speakText("Bagus! Empat puluh dikali dua sama dengan delapan puluh.")}
                  className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full hover:bg-emerald-200 transition cursor-pointer"
                >
                  <Volume2 size={13} />
                  <span>Bagus!</span>
                </button>
              </div>

              {/* Kolom 3: Satuan */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-4 flex flex-col items-center gap-3">
                <span className="font-black text-amber-900 font-fredoka text-base">
                  2 × 2 = ?
                </span>

                {/* Visual 2 Kubus Satuan (Units) */}
                <div className="flex gap-2 p-3 bg-white rounded-2xl border border-amber-100 shadow-2xs h-28 items-center justify-center">
                  <div className="w-5 h-5 bg-amber-400 rounded-sm border border-amber-500 shadow-2xs" />
                  <div className="w-5 h-5 bg-amber-400 rounded-sm border border-amber-500 shadow-2xs" />
                </div>

                {/* Input & Centang */}
                <div className="flex items-center gap-2 w-full max-w-[140px]">
                  <input
                    type="number"
                    value={inputs["part_u"] ?? "4"}
                    onChange={(e) => handleInputChange("part_u", e.target.value)}
                    className="w-full text-center py-2 px-3 bg-white border-2 border-slate-300 rounded-xl font-black text-slate-800 text-base focus:border-amber-500 focus:outline-none"
                    placeholder="Hasil"
                  />
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check size={16} className="stroke-[3]" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => speakText("Bagus! Dua dikali dua sama dengan empat.")}
                  className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full hover:bg-emerald-200 transition cursor-pointer"
                >
                  <Volume2 size={13} />
                  <span>Bagus!</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Gabungkan Hasil (Gambar 1 Step 5) */}
        {stepIndex === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-6">
            <h4 className="font-black text-slate-800 font-fredoka text-lg sm:text-xl">
              Sekarang, kita jumlahkan hasilnya!
            </h4>

            {/* Sum equation cards */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="bg-blue-100/80 border border-blue-200 px-5 py-3 rounded-2xl text-xl sm:text-2xl font-black text-blue-900 font-fredoka">
                400
              </div>
              <span className="text-2xl font-black text-slate-400">+</span>
              <div className="bg-emerald-100/80 border border-emerald-200 px-5 py-3 rounded-2xl text-xl sm:text-2xl font-black text-emerald-900 font-fredoka">
                80
              </div>
              <span className="text-2xl font-black text-slate-400">+</span>
              <div className="bg-amber-100/80 border border-amber-200 px-5 py-3 rounded-2xl text-xl sm:text-2xl font-black text-amber-900 font-fredoka">
                4
              </div>
            </div>

            {/* Bracket Connector SVG */}
            <svg className="w-48 h-8 stroke-slate-400 stroke-[2.5]" fill="none" viewBox="0 0 200 32">
              <path d="M20 5 Q100 5 100 28" />
              <path d="M180 5 Q100 5 100 28" />
            </svg>

            {/* Final Result Card */}
            <div className="bg-rose-100/80 border-2 border-rose-300 px-10 py-4 rounded-3xl text-3xl sm:text-4xl font-black text-rose-700 font-fredoka shadow-sm animate-in zoom-in duration-300">
              484
            </div>

            <div className="text-base sm:text-lg font-black text-slate-800 font-fredoka">
              Jadi, 242 × 2 = <span className="text-rose-600">484</span>
            </div>

            {/* Mascot Cheering */}
            <div className="flex items-center gap-4 bg-emerald-50/80 border border-emerald-200 p-4 rounded-3xl max-w-md w-full">
              <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                <BoyMascotVector size={64} />
              </div>
              <div>
                <p className="font-black text-emerald-900 text-sm font-fredoka">Hebat! Kamu sudah bisa!</p>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Dengan mengurai nilai tempat, perkalian bilangan ratusan terasa sangat mudah!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Selesai & Tindak Lanjut */}
        {stepIndex === 4 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl">
              🎉
            </div>
            <div>
              <h4 className="text-2xl font-black text-slate-800 font-fredoka">
                Konsep Perkalian Nilai Tempat Berhasil Dikuasai!
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 max-w-md">
                Kamu telah memahami cara memecah bilangan ratusan, puluhan, dan satuan, mengalikannya masing-masing, lalu menggabungkannya kembali.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStepIndex(1)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Pelajari Lagi</span>
              </button>
              <button
                type="button"
                onClick={() => onGoToPractice && onGoToPractice("×")}
                className="px-6 py-2.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs transition shadow-md shadow-rose-400/30 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles size={14} />
                <span>Mulai Latihan Mandiri</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 select-none">
          <button
            type="button"
            onClick={() => {
              if (stepIndex > 1) setStepIndex((prev) => prev - 1);
              else if (onBackToHome) onBackToHome();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-2xl transition cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>{stepIndex === 1 ? "Beranda" : "Kembali"}</span>
          </button>

          {stepIndex < totalSteps ? (
            <button
              type="button"
              onClick={() => setStepIndex((prev) => prev + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-rose-400/30 transition cursor-pointer"
            >
              <span>Lanjut</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onFinish || onBackToHome}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-500/30 transition cursor-pointer"
            >
              <CheckCircle size={16} />
              <span>Selesai</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  // =========================================================================
  // 2. FLOW PEMBAGIAN (Gambar 2): 242 ÷ 2 = 121
  // =========================================================================
  const renderPembagianFlow = () => {
    const totalSteps = 5;

    return (
      <div className="flex flex-col gap-5">
        {/* Step Header */}
        <div className="bg-purple-600 text-white p-3.5 sm:px-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
              {stepIndex}
            </span>
            <h3 className="text-xs sm:text-sm font-black font-fredoka tracking-wide">
              {stepIndex === 1 && "Langkah 1 – Lihat Bilangan"}
              {stepIndex === 2 && "Langkah 2 – Pecahkan Berdasarkan Nilai Tempat"}
              {stepIndex === 3 && "Langkah 3 – Bagi Setiap Bagian"}
              {stepIndex === 4 && "Langkah 4 – Gabungkan Hasil"}
              {stepIndex === 5 && "Langkah 5 – Cek Jawaban dengan Perkalian"}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  stepIndex === idx + 1 ? "bg-white scale-125" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Lihat Bilangan */}
        {stepIndex === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 bg-sky-50 border border-sky-200/80 p-4 rounded-2xl max-w-lg w-full">
              <div className="w-14 h-14 shrink-0 flex items-center justify-center">
                <BoyMascotVector size={56} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                &quot;Kita akan membagi <strong>242</strong> dengan <strong>2</strong>.&quot;
              </p>
            </div>

            <div className="bg-rose-50 border border-rose-200 px-8 py-3.5 rounded-2xl text-3xl font-black text-slate-900 font-fredoka shadow-2xs">
              242 ÷ 2 = ?
            </div>

            <div className="text-lg font-black text-slate-800 font-fredoka">
              242 = <span className="text-blue-600">200</span> + <span className="text-emerald-600">40</span> + <span className="text-amber-600">2</span>
            </div>

            <p className="text-xs font-semibold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl">
              242 terdiri dari 2 ratusan, 4 puluhan, dan 2 satuan.
            </p>

            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold text-amber-900">
              <span>💡</span>
              <span>Kita pecah dulu bilangannya agar lebih mudah dibagi, ya!</span>
            </div>
          </div>
        )}

        {/* STEP 2: Pecahkan Berdasarkan Nilai Tempat (Visual Balok) */}
        {stepIndex === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-6">
            <div className="bg-rose-50 border border-rose-200 px-8 py-2.5 rounded-2xl text-2xl font-black text-slate-900 font-fredoka">
              242 ÷ 2
            </div>

            <p className="text-xs sm:text-sm font-bold text-slate-600">
              Kita sudah memecah 242 menjadi:
            </p>

            {/* 3 Balok Columns */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 w-full max-w-xl text-center">
              {/* Ratusan */}
              <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-3 flex flex-col items-center gap-2">
                <span className="text-xl font-black text-blue-900 font-fredoka">200</span>
                <span className="text-[11px] font-bold text-blue-700">(2 ratusan)</span>
                <div className="flex gap-1">
                  <div className="w-10 h-10 bg-blue-500 rounded border border-blue-600" />
                  <div className="w-10 h-10 bg-blue-500 rounded border border-blue-600" />
                </div>
                <span className="text-[10px] font-bold text-slate-500">2 ratusan</span>
              </div>

              {/* Puluhan */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3 flex flex-col items-center gap-2">
                <span className="text-xl font-black text-emerald-900 font-fredoka">40</span>
                <span className="text-[11px] font-bold text-emerald-700">(4 puluhan)</span>
                <div className="flex gap-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-2.5 h-12 bg-emerald-500 rounded-xs border border-emerald-600" />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-slate-500">4 puluhan</span>
              </div>

              {/* Satuan */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 flex flex-col items-center gap-2">
                <span className="text-xl font-black text-amber-900 font-fredoka">2</span>
                <span className="text-[11px] font-bold text-amber-700">(2 satuan)</span>
                <div className="flex gap-1.5 pt-4">
                  <div className="w-4 h-4 bg-amber-400 rounded-xs border border-amber-500" />
                  <div className="w-4 h-4 bg-amber-400 rounded-xs border border-amber-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 mt-2">2 satuan</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-pink-50/80 border border-pink-200 p-4 rounded-2xl max-w-md w-full">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                <GirlMascotVector size={48} />
              </div>
              <p className="text-xs font-bold text-slate-700">
                &quot;Sekarang kita bagi setiap bagian dengan <strong>2</strong>.&quot;
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Bagi Setiap Bagian */}
        {stepIndex === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col gap-6">
            <h4 className="font-black text-slate-800 font-fredoka text-lg">
              Hitung hasil pembagian berikut!
            </h4>

            <div className="flex flex-col gap-3 max-w-md mx-auto w-full">
              {/* 200 / 2 = 100 */}
              <div className="flex items-center justify-between p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl">
                <span className="text-xl font-black text-blue-900 font-fredoka">
                  200 ÷ 2 =
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900 bg-white px-5 py-1.5 rounded-xl border border-blue-300 font-fredoka">
                    100
                  </span>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* 40 / 2 = 20 */}
              <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl">
                <span className="text-xl font-black text-emerald-900 font-fredoka">
                  40 ÷ 2 =
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900 bg-white px-5 py-1.5 rounded-xl border border-emerald-300 font-fredoka">
                    20
                  </span>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                </div>
              </div>

              {/* 2 / 2 = 1 */}
              <div className="flex items-center justify-between p-3.5 bg-amber-50/60 border border-amber-200 rounded-2xl">
                <span className="text-xl font-black text-amber-900 font-fredoka">
                  2 ÷ 2 =
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-900 bg-white px-5 py-1.5 rounded-xl border border-amber-300 font-fredoka">
                    1
                  </span>
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check size={14} className="stroke-[3]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl max-w-md mx-auto w-full">
              <div className="w-12 h-12 shrink-0">
                <BoyMascotVector size={48} />
              </div>
              <p className="text-xs font-bold text-slate-700">
                Bagus! Semua bagian sudah dibagi. Sekarang kita gabungkan hasilnya.
              </p>
            </div>
          </div>
        )}

        {/* STEP 4: Gabungkan Hasil */}
        {stepIndex === 4 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-6">
            <h4 className="font-black text-slate-800 font-fredoka text-lg sm:text-xl">
              Sekarang, kita jumlahkan semua hasilnya!
            </h4>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="bg-blue-100/80 border border-blue-200 px-5 py-3 rounded-2xl text-2xl font-black text-blue-900 font-fredoka">
                100
              </div>
              <span className="text-2xl font-black text-slate-400">+</span>
              <div className="bg-emerald-100/80 border border-emerald-200 px-5 py-3 rounded-2xl text-2xl font-black text-emerald-900 font-fredoka">
                20
              </div>
              <span className="text-2xl font-black text-slate-400">+</span>
              <div className="bg-amber-100/80 border border-amber-200 px-5 py-3 rounded-2xl text-2xl font-black text-amber-900 font-fredoka">
                1
              </div>
            </div>

            <svg className="w-48 h-8 stroke-slate-400 stroke-[2.5]" fill="none" viewBox="0 0 200 32">
              <path d="M20 5 Q100 5 100 28" />
              <path d="M180 5 Q100 5 100 28" />
            </svg>

            <div className="bg-rose-100/80 border-2 border-rose-300 px-10 py-4 rounded-3xl text-4xl font-black text-rose-700 font-fredoka shadow-sm">
              121
            </div>

            <div className="text-base sm:text-lg font-black text-slate-800 font-fredoka">
              Jadi, 242 ÷ 2 = <span className="text-rose-600">121</span>
            </div>
          </div>
        )}

        {/* STEP 5: Cek Jawaban dengan Perkalian (Gambar 2 Step 5) */}
        {stepIndex === 5 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-5">
            <h4 className="font-black text-slate-800 font-fredoka text-xl">
              Cek Jawaban dengan Perkalian
            </h4>

            <p className="text-xs sm:text-sm font-semibold text-slate-600 text-center max-w-md">
              Kita bisa mengecek dengan perkalian. Jika jawaban benar, hasilnya harus kembali ke bilangan awal (242).
            </p>

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-8 py-4 rounded-3xl">
              <span className="text-3xl font-black text-rose-600 font-fredoka">121</span>
              <span className="text-2xl font-black text-slate-400">×</span>
              <span className="text-3xl font-black text-slate-800 font-fredoka">2</span>
              <span className="text-2xl font-black text-slate-400">=</span>
              <span className="text-3xl font-black text-blue-600 font-fredoka">242</span>
            </div>

            <div className="flex items-center gap-2 text-emerald-600 font-black text-lg font-fredoka">
              <CheckCircle size={22} />
              <span>Benar! Hasilnya kembali ke 242!</span>
            </div>

            <div className="flex items-center gap-4 bg-emerald-50/80 border border-emerald-200 p-4 rounded-3xl max-w-md w-full">
              <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                <BoyMascotVector size={64} />
              </div>
              <div>
                <p className="font-black text-emerald-900 text-sm font-fredoka">Kamu hebat!</p>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Sudah bisa menyelesaikan pembagian dan membuktikannya dengan perkalian!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-2 select-none">
          <button
            type="button"
            onClick={() => {
              if (stepIndex > 1) setStepIndex((prev) => prev - 1);
              else if (onBackToHome) onBackToHome();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-2xl transition cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Kembali</span>
          </button>

          {stepIndex < totalSteps ? (
            <button
              type="button"
              onClick={() => setStepIndex((prev) => prev + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-purple-500/30 transition cursor-pointer"
            >
              <span>Lanjut</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onGoToPractice ? onGoToPractice("÷") : onFinish?.()}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-500/30 transition cursor-pointer"
            >
              <Sparkles size={16} />
              <span>Latihan Soal Berikutnya</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  // =========================================================================
  // 3. FLOW PENJUMLAHAN (Gambar 3 Row 1): 47 + 25 = 72
  // =========================================================================
  const renderPenjumlahanFlow = () => {
    const totalSteps = 4;

    return (
      <div className="flex flex-col gap-5">
        <div className="bg-emerald-600 text-white p-3.5 sm:px-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
              {stepIndex}
            </span>
            <h3 className="text-xs sm:text-sm font-black font-fredoka tracking-wide">
              {stepIndex === 1 && "Langkah 1 – Susun Angka pada Papan Nilai Tempat"}
              {stepIndex === 2 && "Langkah 2 – Hitung Satuan (Konsep Simpan)"}
              {stepIndex === 3 && "Langkah 3 – Hitung Puluhan"}
              {stepIndex === 4 && "Langkah 4 – Gabungkan Hasil Akhir"}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  stepIndex === idx + 1 ? "bg-white scale-125" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Susun Angka */}
        {stepIndex === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-6">
            <div className="bg-emerald-50 border border-emerald-200 px-6 py-2.5 rounded-2xl text-2xl font-black text-emerald-950 font-fredoka">
              47 + 25 = ?
            </div>

            {/* Papan Nilai Tempat 2 Kolom (Puluhan & Satuan) */}
            <div className="w-64 border-2 border-slate-300 rounded-3xl overflow-hidden shadow-xs bg-slate-50">
              <div className="grid grid-cols-2 text-center font-black text-xs py-2 bg-slate-200 border-b border-slate-300 text-slate-700">
                <span className="border-r border-slate-300">Puluhan (P)</span>
                <span>Satuan (S)</span>
              </div>
              <div className="grid grid-cols-2 text-center text-2xl font-black py-3 border-b border-slate-200 font-fredoka text-slate-800">
                <span className="border-r border-slate-200">4</span>
                <span>7</span>
              </div>
              <div className="grid grid-cols-2 text-center text-2xl font-black py-3 border-b-2 border-slate-400 font-fredoka text-slate-800 relative">
                <span className="absolute left-3 top-3 text-lg font-black text-emerald-600">+</span>
                <span className="border-r border-slate-200">2</span>
                <span>5</span>
              </div>
              <div className="grid grid-cols-2 text-center text-2xl font-black py-3 bg-white text-slate-400 font-fredoka">
                <span className="border-r border-slate-200">?</span>
                <span>?</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-sky-50 border border-sky-200 p-4 rounded-2xl max-w-md w-full">
              <div className="w-14 h-14 shrink-0">
                <BoyMascotVector size={56} />
              </div>
              <p className="text-xs font-bold text-slate-700 leading-relaxed">
                &quot;Pastikan angka disusun sesuai nilai tempatnya: <strong>puluhan lurus puluhan</strong>, dan <strong>satuan lurus satuan</strong>.&quot;
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Hitung Satuan */}
        {stepIndex === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-6">
            <h4 className="font-black text-slate-800 font-fredoka text-lg">
              Jumlahkan angka pada satuan terlebih dahulu:
            </h4>

            <div className="bg-amber-50 border border-amber-200 px-8 py-3 rounded-2xl text-3xl font-black text-amber-950 font-fredoka">
              7 + 5 = 12
            </div>

            {/* Visual 12 Kubus Satuan */}
            <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="w-6 h-6 bg-amber-400 rounded border border-amber-500 shadow-2xs" />
                ))}
              </div>
              <span className="text-xs font-black text-amber-800">12 kubus satuan</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-3 max-w-md w-full">
              <button
                type="button"
                onClick={() => speakText("Hasil dua belas terdiri dari satu puluhan disimpan, dan dua satuan ditulis.")}
                className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 hover:bg-emerald-600 transition"
              >
                <Volume2 size={20} />
              </button>
              <p className="text-xs sm:text-sm font-bold text-emerald-950">
                Hasil <strong>12</strong> terdiri dari <strong>1 puluhan</strong> (disimpan di atas) dan <strong>2 satuan</strong> (ditulis di bawah).
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Hitung Puluhan */}
        {stepIndex === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-6">
            <h4 className="font-black text-slate-800 font-fredoka text-lg">
              Jumlahkan puluhan dan tambahkan 1 yang disimpan:
            </h4>

            <div className="bg-emerald-50 border border-emerald-200 px-8 py-3 rounded-2xl text-3xl font-black text-emerald-950 font-fredoka">
              4 + 2 + 1 = 7
            </div>

            {/* Visual Balok Puluhan */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex gap-1" title="4 puluhan">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-3.5 h-16 bg-emerald-500 rounded-sm border border-emerald-600" />
                ))}
              </div>
              <span className="text-xl font-black text-slate-400">+</span>
              <div className="flex gap-1" title="2 puluhan">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="w-3.5 h-16 bg-emerald-500 rounded-sm border border-emerald-600" />
                ))}
              </div>
              <span className="text-xl font-black text-slate-400">+</span>
              <div className="flex gap-1" title="1 puluhan simpanan">
                <div className="w-3.5 h-16 bg-amber-400 rounded-sm border border-amber-500" />
              </div>
            </div>

            <div className="bg-rose-100/80 border border-rose-200 px-6 py-2.5 rounded-2xl text-xl font-black text-rose-800 font-fredoka">
              7 puluhan
            </div>
          </div>
        )}

        {/* STEP 4: Gabungkan Hasil */}
        {stepIndex === 4 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-6">
            <h4 className="font-black text-slate-800 font-fredoka text-xl">
              Tulis hasil akhirnya:
            </h4>

            {/* Tabel Papan Akhir */}
            <div className="w-64 border-2 border-emerald-300 rounded-3xl overflow-hidden shadow-xs bg-slate-50">
              <div className="grid grid-cols-2 text-center font-black text-xs py-2 bg-emerald-100 border-b border-emerald-200 text-emerald-900">
                <span className="border-r border-emerald-200">Puluhan (P)</span>
                <span>Satuan (S)</span>
              </div>
              <div className="grid grid-cols-2 text-center text-3xl font-black py-4 bg-white text-slate-800 font-fredoka">
                <span className="border-r border-slate-200 text-emerald-600">7</span>
                <span className="text-amber-600">2</span>
              </div>
            </div>

            <div className="bg-emerald-100/80 border-2 border-emerald-300 px-10 py-3.5 rounded-3xl text-3xl sm:text-4xl font-black text-emerald-800 font-fredoka shadow-sm">
              47 + 25 = 72
            </div>

            <div className="flex items-center gap-4 bg-pink-50 border border-pink-200 p-4 rounded-3xl max-w-md w-full">
              <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                <GirlMascotVector size={64} />
              </div>
              <div>
                <p className="font-black text-pink-900 text-sm font-fredoka">Hebat!</p>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Kita sudah menyelesaikan penjumlahan bersusun dengan konsep simpan nilai tempat!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Nav */}
        <div className="flex items-center justify-between pt-2 select-none">
          <button
            type="button"
            onClick={() => {
              if (stepIndex > 1) setStepIndex((prev) => prev - 1);
              else if (onBackToHome) onBackToHome();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-2xl transition cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Kembali</span>
          </button>

          {stepIndex < totalSteps ? (
            <button
              type="button"
              onClick={() => setStepIndex((prev) => prev + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-500/30 transition cursor-pointer"
            >
              <span>Lanjut</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onGoToPractice ? onGoToPractice("+") : onFinish?.()}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-500/30 transition cursor-pointer"
            >
              <CheckCircle size={16} />
              <span>Selesai</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  // =========================================================================
  // 4. FLOW PENGURANGAN (Gambar 3 Row 2): 52 - 28 = 24 (Regrouping/Tukar)
  // =========================================================================
  const renderPenguranganFlow = () => {
    const totalSteps = 4;

    return (
      <div className="flex flex-col gap-5">
        <div className="bg-orange-500 text-white p-3.5 sm:px-6 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
              {stepIndex}
            </span>
            <h3 className="text-xs sm:text-sm font-black font-fredoka tracking-wide">
              {stepIndex === 1 && "Langkah 1 – Susun Angka pada Papan Nilai Tempat"}
              {stepIndex === 2 && "Langkah 2 – Cek Satuan (Deteksi Kekurangan)"}
              {stepIndex === 3 && "Langkah 3 – Tukar dan Kurangkan (Regrouping Balok)"}
              {stepIndex === 4 && "Langkah 4 – Gabungkan Hasil Akhir"}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  stepIndex === idx + 1 ? "bg-white scale-125" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Susun Angka */}
        {stepIndex === 1 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-6">
            <div className="bg-orange-50 border border-orange-200 px-6 py-2.5 rounded-2xl text-2xl font-black text-orange-950 font-fredoka">
              52 − 28 = ?
            </div>

            <div className="w-64 border-2 border-slate-300 rounded-3xl overflow-hidden shadow-xs bg-slate-50">
              <div className="grid grid-cols-2 text-center font-black text-xs py-2 bg-slate-200 border-b border-slate-300 text-slate-700">
                <span className="border-r border-slate-300">Puluhan (P)</span>
                <span>Satuan (S)</span>
              </div>
              <div className="grid grid-cols-2 text-center text-2xl font-black py-3 border-b border-slate-200 font-fredoka text-slate-800">
                <span className="border-r border-slate-200">5</span>
                <span>2</span>
              </div>
              <div className="grid grid-cols-2 text-center text-2xl font-black py-3 border-b-2 border-slate-400 font-fredoka text-slate-800 relative">
                <span className="absolute left-3 top-3 text-lg font-black text-orange-600">−</span>
                <span className="border-r border-slate-200">2</span>
                <span>8</span>
              </div>
              <div className="grid grid-cols-2 text-center text-2xl font-black py-3 bg-white text-slate-400 font-fredoka">
                <span className="border-r border-slate-200">?</span>
                <span>?</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 p-4 rounded-2xl max-w-md w-full">
              <div className="w-14 h-14 shrink-0">
                <GirlMascotVector size={56} />
              </div>
              <p className="text-xs font-bold text-slate-700 leading-relaxed">
                &quot;Ingat! Jika angka pada satuan atas tidak cukup dikurangkan, kita harus <strong>menukar 1 puluhan</strong>.&quot;
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Cek Satuan */}
        {stepIndex === 2 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-6">
            <h4 className="font-black text-slate-800 font-fredoka text-lg">
              Kurangkan angka pada satuan:
            </h4>

            <div className="bg-rose-50 border border-rose-200 px-8 py-3 rounded-2xl text-3xl font-black text-rose-950 font-fredoka">
              2 − 8 = ?
            </div>

            <div className="flex items-center gap-3 bg-rose-50 border border-rose-300 p-4 rounded-2xl max-w-md w-full">
              <div className="w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center font-black text-lg shrink-0">
                ✕
              </div>
              <div>
                <p className="font-black text-rose-900 text-sm font-fredoka">Tidak Cukup!</p>
                <p className="text-xs font-bold text-rose-700">
                  2 lebih kecil dari 8. Kita perlu menukar 1 puluhan menjadi 10 satuan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-sky-50 border border-sky-200 p-4 rounded-2xl max-w-md w-full">
              <div className="w-14 h-14 shrink-0">
                <BoyMascotVector size={56} />
              </div>
              <p className="text-xs font-bold text-slate-700">
                &quot;Ayo kita tukar 1 batang puluhan dari angka 52 menjadi 10 butir satuan!&quot;
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Tukar dan Kurangkan (Tabel Sebelum vs Sesudah Ditukar Balok - Gambar 3 Row 2 Step 4) */}
        {stepIndex === 3 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-6">
            <h4 className="font-black text-slate-800 font-fredoka text-lg">
              Tukar 1 puluhan, lalu kurangkan kembali:
            </h4>

            {/* Grid Komparasi Sebelum vs Sesudah Ditukar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
              {/* Sebelum */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-4 flex flex-col items-center gap-2">
                <span className="text-xs font-black text-rose-800 uppercase tracking-wide">
                  Sebelum Ditukar
                </span>
                <span className="text-xs font-bold text-slate-600">5 puluhan, 2 satuan</span>

                {/* Balok 5 batang + 2 kubus */}
                <div className="flex items-center gap-2 py-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="w-3 h-14 bg-emerald-500 rounded-xs border border-emerald-600" />
                    ))}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="w-3.5 h-3.5 bg-amber-400 rounded-xs border border-amber-500" />
                    <div className="w-3.5 h-3.5 bg-amber-400 rounded-xs border border-amber-500" />
                  </div>
                </div>

                <span className="text-sm font-black text-slate-800 font-fredoka">
                  52 = 50 + 2
                </span>
              </div>

              {/* Sesudah */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-4 flex flex-col items-center gap-2">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                  Setelah Ditukar
                </span>
                <span className="text-xs font-bold text-emerald-700">4 puluhan, 12 satuan</span>

                {/* Balok 4 batang + 12 kubus */}
                <div className="flex items-center gap-2 py-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="w-3 h-14 bg-emerald-500 rounded-xs border border-emerald-600" />
                    ))}
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="w-3.5 h-3.5 bg-amber-400 rounded-xs border border-amber-500" />
                    ))}
                  </div>
                </div>

                <span className="text-sm font-black text-emerald-900 font-fredoka">
                  52 = 40 + 12
                </span>
              </div>
            </div>

            {/* Hasil Pengurangan per Bagian */}
            <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center">
                <span className="text-lg font-black text-amber-950 font-fredoka block">12 − 8 = 4</span>
                <span className="text-xs font-bold text-amber-800">↓ 4 satuan</span>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-center">
                <span className="text-lg font-black text-blue-950 font-fredoka block">40 − 20 = 20</span>
                <span className="text-xs font-bold text-blue-800">↓ 20 puluhan (2 puluhan)</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Gabungkan Hasil */}
        {stepIndex === 4 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col items-center gap-6">
            <h4 className="font-black text-slate-800 font-fredoka text-xl">
              Tulis hasil akhirnya:
            </h4>

            <div className="w-64 border-2 border-orange-300 rounded-3xl overflow-hidden shadow-xs bg-slate-50">
              <div className="grid grid-cols-2 text-center font-black text-xs py-2 bg-orange-100 border-b border-orange-200 text-orange-900">
                <span className="border-r border-orange-200">Puluhan (P)</span>
                <span>Satuan (S)</span>
              </div>
              <div className="grid grid-cols-2 text-center text-3xl font-black py-4 bg-white text-slate-800 font-fredoka">
                <span className="border-r border-slate-200 text-orange-600">2</span>
                <span className="text-amber-600">4</span>
              </div>
            </div>

            <div className="bg-orange-100/80 border-2 border-orange-300 px-10 py-3.5 rounded-3xl text-3xl sm:text-4xl font-black text-orange-800 font-fredoka shadow-sm">
              52 − 28 = 24
            </div>

            <div className="flex items-center gap-4 bg-emerald-50 border border-emerald-200 p-4 rounded-3xl max-w-md w-full">
              <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                <BoyMascotVector size={64} />
              </div>
              <div>
                <p className="font-black text-emerald-900 text-sm font-fredoka">Hebat!</p>
                <p className="text-xs text-slate-600 font-semibold mt-0.5">
                  Kita sudah menyelesaikan pengurangan dengan konsep menukar puluhan secara visual!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Nav */}
        <div className="flex items-center justify-between pt-2 select-none">
          <button
            type="button"
            onClick={() => {
              if (stepIndex > 1) setStepIndex((prev) => prev - 1);
              else if (onBackToHome) onBackToHome();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs rounded-2xl transition cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Kembali</span>
          </button>

          {stepIndex < totalSteps ? (
            <button
              type="button"
              onClick={() => setStepIndex((prev) => prev + 1)}
              className="flex items-center gap-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-orange-400/30 transition cursor-pointer"
            >
              <span>Lanjut</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onGoToPractice ? onGoToPractice("-") : onFinish?.()}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md shadow-emerald-500/30 transition cursor-pointer"
            >
              <CheckCircle size={16} />
              <span>Selesai</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 select-none animate-in fade-in duration-300">
      {/* Operation Switcher Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => handleChangeOp("+")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            currentOp === "+"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          }`}
        >
          <span>➕</span>
          <span>Penjumlahan</span>
        </button>
        <button
          type="button"
          onClick={() => handleChangeOp("-")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            currentOp === "-"
              ? "bg-orange-500 text-white shadow-xs"
              : "bg-orange-50 text-orange-800 hover:bg-orange-100"
          }`}
        >
          <span>➖</span>
          <span>Pengurangan</span>
        </button>
        <button
          type="button"
          onClick={() => handleChangeOp("×")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            currentOp === "×"
              ? "bg-rose-500 text-white shadow-xs"
              : "bg-rose-50 text-rose-800 hover:bg-rose-100"
          }`}
        >
          <span>✖️</span>
          <span>Perkalian</span>
        </button>
        <button
          type="button"
          onClick={() => handleChangeOp("÷")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            currentOp === "÷"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-purple-50 text-purple-800 hover:bg-purple-100"
          }`}
        >
          <span>➗</span>
          <span>Pembagian</span>
        </button>
      </div>

      {/* Main Flow Rendering based on currentOp */}
      {currentOp === "×" && renderPerkalianFlow()}
      {currentOp === "÷" && renderPembagianFlow()}
      {currentOp === "+" && renderPenjumlahanFlow()}
      {currentOp === "-" && renderPenguranganFlow()}

      {/* Latihan Soal Serupa Bar di Bagian Bawah (Gambar 3 Bottom) */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
            📊
          </div>
          <div>
            <span className="text-xs font-black text-slate-800 block">Latihan Soal Serupa:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {currentOp === "+" && (
                <>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700 font-mono">36 + 28</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700 font-mono">58 + 17</span>
                </>
              )}
              {currentOp === "-" && (
                <>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700 font-mono">63 − 25</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700 font-mono">91 − 46</span>
                </>
              )}
              {currentOp === "×" && (
                <>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700 font-mono">134 × 2</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700 font-mono">312 × 3</span>
                </>
              )}
              {currentOp === "÷" && (
                <>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700 font-mono">248 ÷ 2</span>
                  <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-black text-slate-700 font-mono">369 ÷ 3</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <p className="text-[11px] font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
            💡 Setiap langkah kecil adalah kemajuan besar!
          </p>
        </div>
      </div>

      {/* Multi Level Help Modal */}
      <MultiLevelHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        operation={currentOp}
        num1={currentOp === "×" ? 242 : currentOp === "÷" ? 242 : currentOp === "+" ? 47 : 52}
        num2={currentOp === "×" ? 2 : currentOp === "÷" ? 2 : currentOp === "+" ? 25 : 28}
      />
    </div>
  );
}
