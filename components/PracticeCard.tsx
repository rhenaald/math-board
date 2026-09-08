"use client";

import React, { useState } from "react";
import {
  Volume2,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  Box,
  Layers,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import MathBoardGrid from "./MathBoardGrid";
import BaseTenBlocksVisualizer from "./BaseTenBlocksVisualizer";
import { BoyMascotVector, GirlMascotVector } from "./ChildMascots";

type SimpleOperation = "+" | "-" | "×" | "÷";

interface DiagnosticHint {
  message: string;
  badge: string;
  color: string;
}

interface PracticeCardProps {
  num1: number;
  num2: number;
  currentOp: SimpleOperation;
  levelName: string;
  questionNumber: number;
  totalQuestions: number;
  userAnswerInput: string;
  setUserAnswerInput: (val: string) => void;
  carryValues: { th: string; h: string; t: string; u: string };
  setCarryValues: React.Dispatch<React.SetStateAction<{ th: string; h: string; t: string; u: string }>>;
  ansValues: { th: string; h: string; t: string; u: string };
  setAnsValues: React.Dispatch<React.SetStateAction<{ th: string; h: string; t: string; u: string }>>;
  onCheckAnswer: () => void;
  onNewProblem: () => void;
  onNeedHelp?: () => void;
  onBack?: () => void;
  diagnosticHint?: DiagnosticHint | null;
  activePlace?: "th" | "h" | "t" | "u" | null;
  setActivePlace?: (place: "th" | "h" | "t" | "u" | null) => void;
  isShaking?: boolean;
  isSuccess?: boolean;
  placeValueCombo?: string;
  onSelectCombo?: (combo: string) => void;
  showDienesBlocks?: boolean;
  setShowDienesBlocks?: (show: boolean | ((prev: boolean) => boolean)) => void;
}

export default function PracticeCard({
  num1,
  num2,
  currentOp,
  levelName = "Level 1 – Bilangan Kecil",
  questionNumber = 1,
  totalQuestions = 10,
  userAnswerInput,
  setUserAnswerInput,
  carryValues,
  setCarryValues,
  ansValues,
  setAnsValues,
  onCheckAnswer,
  onNewProblem,
  onNeedHelp,
  onBack,
  diagnosticHint,
  activePlace,
  setActivePlace,
  isShaking = false,
  isSuccess = false,
  placeValueCombo = "P-P",
  onSelectCombo,
  showDienesBlocks: propShowBlocks,
  setShowDienesBlocks: propSetShowBlocks,
}: PracticeCardProps) {
  const [internalShowBlocks, setInternalShowBlocks] = useState<boolean>(false);
  const showDienesBlocks = propShowBlocks !== undefined ? propShowBlocks : internalShowBlocks;
  const setShowDienesBlocks = propSetShowBlocks || setInternalShowBlocks;
  const [showVerticalBoard, setShowVerticalBoard] = useState<boolean>(false);

  // Text-to-speech audio reader
  const speakProblem = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const opWords: Record<SimpleOperation, string> = {
      "+": "ditambah",
      "-": "dikurangi",
      "×": "dikali",
      "÷": "dibagi",
    };
    const text = `Berapa ${num1} ${opWords[currentOp] || currentOp} ${num2}?`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const opSymbol = currentOp === "-" ? "−" : currentOp;

  const opColors: Record<SimpleOperation, { bg: string; text: string; badgeBg: string }> = {
    "+": { bg: "bg-emerald-600", text: "text-emerald-600", badgeBg: "bg-emerald-100 text-emerald-800" },
    "-": { bg: "bg-orange-500", text: "text-orange-600", badgeBg: "bg-orange-100 text-orange-800" },
    "×": { bg: "bg-rose-500", text: "text-rose-600", badgeBg: "bg-rose-100 text-rose-800" },
    "÷": { bg: "bg-purple-600", text: "text-purple-600", badgeBg: "bg-purple-100 text-purple-800" },
  };

  const opTitle: Record<SimpleOperation, string> = {
    "+": "Penjumlahan",
    "-": "Pengurangan",
    "×": "Perkalian",
    "÷": "Pembagian",
  };

  // Multiplication 4-Quadrant Renderer (Sesuai Gambar 4)
  const renderMultiplicationQuadrants = () => {
    const groups = Math.min(Math.max(num1, 2), 6);
    const perGroup = Math.min(Math.max(num2, 1), 6);
    const expectedAns = num1 * num2;
    const isAnsweredCorrectly = userAnswerInput === String(expectedAns) || isSuccess;

    return (
      <div className="flex flex-col gap-4 animate-in fade-in duration-200">
        {/* Soal Card + Mascot Speech (Gambar 4) */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-rose-700 bg-rose-100 px-3 py-1 rounded-xl">
              Soal:
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 font-fredoka tracking-tight flex items-center gap-2">
              <span>{num1} × {num2} = ?</span>
              <button
                type="button"
                onClick={speakProblem}
                className="p-2 rounded-xl bg-white text-rose-600 hover:bg-rose-100 transition shadow-2xs cursor-pointer"
                title="Dengarkan Soal"
              >
                <Volume2 size={20} />
              </button>

              {onNeedHelp && (
                <button
                  type="button"
                  onClick={onNeedHelp}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-black transition cursor-pointer shadow-2xs"
                  title="Buka Bantuan Bertingkat"
                >
                  <Sparkles size={14} className="text-amber-600" />
                  <span>Bantuan Bertingkat</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/90 px-4 py-2 rounded-2xl border border-rose-100 shadow-2xs">
            <div className="w-12 h-12 shrink-0">
              <BoyMascotVector size={48} />
            </div>
            <p className="text-xs font-bold text-slate-700 leading-snug">
              &quot;Kita bisa menggunakan gambar untuk memahami perkalian!&quot;
            </p>
          </div>
        </div>

        {/* 4 Kuadran Grid (Gambar 4) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Pahami Soal */}
          <div className="bg-sky-50/70 border border-sky-200 rounded-3xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                1
              </span>
              <h4 className="font-black text-slate-800 font-fredoka text-sm">
                Pahami Soal
              </h4>
            </div>
            <div className="text-xs font-bold text-slate-700">
              {num1} × {num2} artinya apa?
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-bold text-amber-950 mt-1">
              Ada {num1} kelompok, setiap kelompok berisi {num2} benda.
            </div>
          </div>

          {/* 2. Lihat Gambar */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs">
                2
              </span>
              <h4 className="font-black text-slate-800 font-fredoka text-sm">
                Lihat Gambar
              </h4>
            </div>
            <div className="text-xs font-bold text-slate-700">
              Mari kita gambar {groups} kelompok yang masing-masing berisi {perGroup} benda:
            </div>

            {/* Visual Dot Array (Gambar 4) */}
            <div className="flex flex-wrap items-center gap-2 py-1 justify-center">
              {Array.from({ length: groups }).map((_, gIdx) => (
                <div
                  key={gIdx}
                  className="p-2 bg-white rounded-xl border border-rose-200 shadow-2xs flex flex-col items-center gap-1"
                >
                  <div className="grid grid-cols-3 gap-1">
                    {Array.from({ length: perGroup }).map((_, dIdx) => (
                      <div key={dIdx} className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-2xs" />
                    ))}
                  </div>
                  <span className="text-[9px] font-black text-slate-600">
                    Kelompok {gIdx + 1} ({perGroup})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Hitung Semua Benda */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                3
              </span>
              <h4 className="font-black text-slate-800 font-fredoka text-sm">
                Hitung Semua Benda
              </h4>
            </div>
            <div className="text-xs font-bold text-slate-700">
              Kita jumlahkan semua kelompok:
            </div>

            <div className="flex flex-col items-center gap-1 py-1">
              <div className="font-mono font-black text-slate-800 text-sm sm:text-base">
                {Array.from({ length: groups }).map(() => perGroup).join(" + ")}
              </div>
              <svg className="w-32 h-5 stroke-slate-400 stroke-[2]" fill="none" viewBox="0 0 100 20">
                <path d="M10 2 Q50 2 50 18" />
                <path d="M90 2 Q50 2 50 18" />
              </svg>
              <div className="bg-rose-100 border border-rose-300 px-4 py-1 rounded-xl text-lg font-black text-rose-700 font-fredoka">
                {expectedAns}
              </div>
            </div>
          </div>

          {/* 4. Tulis Jawaban */}
          <div className="bg-purple-50/70 border border-purple-200 rounded-3xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                4
              </span>
              <h4 className="font-black text-slate-800 font-fredoka text-sm">
                Tulis Jawaban
              </h4>
            </div>

            {/* Input Jawaban / Tampilan Jawaban */}
            <div className="flex items-center justify-center gap-3 py-1">
              <span className="text-xl sm:text-2xl font-black text-slate-800 font-fredoka">
                {num1} × {num2} =
              </span>
              <input
                type="text"
                id="practice-user-answer"
                value={userAnswerInput}
                onChange={(e) => setUserAnswerInput(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCheckAnswer();
                }}
                placeholder="?"
                className="w-20 sm:w-24 h-12 text-center font-black text-2xl font-fredoka text-rose-900 bg-white border-2 border-rose-300 rounded-2xl shadow-xs focus:ring-4 focus:ring-rose-200 focus:outline-none"
              />
              <button
                type="button"
                onClick={onCheckAnswer}
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Cek
              </button>
            </div>

            {/* Apresiasi Maskot saat Benar */}
            {isAnsweredCorrectly && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl animate-in zoom-in-95">
                <div className="w-10 h-10 shrink-0">
                  <GirlMascotVector size={40} />
                </div>
                <div>
                  <p className="text-xs font-black text-emerald-900 font-fredoka">Hebat!</p>
                  <p className="text-[11px] font-bold text-slate-600">
                    Kamu sudah menyelesaikan perkalian ini dengan sangat baik!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col w-full select-none transition-all duration-300 ${
        isShaking ? "animate-shake ring-2 ring-rose-400" : ""
      } ${isSuccess ? "ring-4 ring-emerald-400 shadow-md" : ""}`}
    >
      {/* HEADER: BADGE OPERASI, LEVEL & SOAL KE-X (Sesuai Gambar 4) */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-xl ${opColors[currentOp].bg} text-white flex items-center justify-center text-xs font-black shadow-2xs`}>
            {opSymbol}
          </div>
          <h3 className="text-base font-black text-slate-900 font-fredoka">
            {opTitle[currentOp]}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 text-xs font-black">
            {levelName}
          </span>
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-fredoka">
            Soal {questionNumber} dari {totalQuestions}
          </span>
        </div>
      </div>

      {/* BODY KARTU */}
      <div className="p-4 sm:p-6 flex flex-col gap-4">
        {/* JIKA PERKALIAN: TAMPILKAN 4 KUADRAN (GAMBAR 4) */}
        {currentOp === "×" ? (
          renderMultiplicationQuadrants()
        ) : (
          /* JIKA +, -, ATAU ÷: TAMPILKAN PERSAMAAN BESAR & PAPAN NILAI TEMPAT */
          <div className="flex flex-col gap-4">
            {/* Persamaan Utama */}
            <div className="flex flex-wrap items-center justify-center gap-4 py-3 bg-slate-50/70 border border-slate-200 rounded-3xl">
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-fredoka tracking-tight flex items-center gap-3">
                <span>{num1}</span>
                <span className={opColors[currentOp].text}>{opSymbol}</span>
                <span>{num2}</span>
                <span className="text-slate-400">=</span>
              </div>

              {/* Input Jawaban */}
              <input
                type="text"
                id="main-practice-input"
                value={userAnswerInput}
                onChange={(e) => setUserAnswerInput(e.target.value.replace(/[^0-9]/g, ""))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onCheckAnswer();
                }}
                placeholder="?"
                className="w-24 sm:w-28 h-14 text-center font-black text-2xl sm:text-3xl font-fredoka text-slate-900 bg-white border-3 border-blue-300 rounded-2xl shadow-xs focus:ring-4 focus:ring-blue-200 focus:outline-none"
              />

              <button
                type="button"
                onClick={speakProblem}
                className="w-12 h-12 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-700 flex items-center justify-center border border-sky-300 shadow-2xs transition cursor-pointer"
                title="Dengarkan Soal"
              >
                <Volume2 size={22} />
              </button>

              <button
                type="button"
                onClick={onCheckAnswer}
                className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md shadow-blue-500/30 transition cursor-pointer"
              >
                Cek Jawaban
              </button>

              {onNeedHelp && (
                <button
                  type="button"
                  onClick={onNeedHelp}
                  className="px-4 py-3 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs sm:text-sm border border-amber-300 shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                  title="Buka Bantuan Bertingkat"
                >
                  <Sparkles size={16} className="text-amber-600" />
                  <span>Bantuan</span>
                </button>
              )}
            </div>

            {/* Papan Nilai Tempat Susun Mini / Balok Dienes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Papan Nilai Tempat */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-black text-slate-800 font-fredoka flex items-center gap-1.5">
                    <Box size={15} className="text-blue-600" /> Papan Nilai Tempat
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowVerticalBoard(!showVerticalBoard)}
                    className="text-[10px] font-black px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 transition cursor-pointer"
                  >
                    {showVerticalBoard ? "Tutup Papan Susun" : "Buka Papan Susun"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs font-black">
                  <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                    Puluhan (P): {Math.floor(num1 / 10)} {opSymbol} {Math.floor(num2 / 10)}
                  </div>
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                    Satuan (S): {num1 % 10} {opSymbol} {num2 % 10}
                  </div>
                </div>
              </div>

              {/* Alat Bantu Balok */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-xs font-black text-slate-800 font-fredoka flex items-center gap-1.5">
                    <Layers size={15} className="text-blue-600" /> Balok Dienes
                  </span>
                  <span className="text-[10px] text-blue-700 font-black bg-blue-100 px-2 py-0.5 rounded-full">
                    Visualisasi 3D
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-600">
                    Tampilkan alat bantu balok satuan & puluhan.
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDienesBlocks(!showDienesBlocks)}
                    className="text-xs font-black px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition shadow-2xs cursor-pointer"
                  >
                    {showDienesBlocks ? "Sembunyikan" : "Buka Balok"}
                  </button>
                </div>
              </div>
            </div>

            {/* Papan Susun Grid Interaktif */}
            {showVerticalBoard && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <MathBoardGrid
                  currentUser="Siswa"
                  selectedOp={currentOp}
                  currentOp={currentOp}
                  placeValueCombo={placeValueCombo}
                  num1={num1}
                  num2={num2}
                  carryValues={carryValues}
                  setCarryValues={setCarryValues}
                  ansValues={ansValues}
                  setAnsValues={setAnsValues}
                  onCheckAnswer={onCheckAnswer}
                  opNameMap={{ "+": "Penjumlahan", "-": "Pengurangan", "×": "Perkalian", "÷": "Pembagian" }}
                  diagnosticHint={diagnosticHint}
                />
              </div>
            )}

            {/* Balok Visualizer */}
            {showDienesBlocks && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
                <BaseTenBlocksVisualizer
                  num1={num1}
                  num2={num2}
                  operation={currentOp}
                  activePlace={activePlace}
                />
              </div>
            )}
          </div>
        )}

        {/* Diagnostic Hint jika salah */}
        {diagnosticHint && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-start gap-2.5 animate-in shake">
            <HelpCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-black text-rose-900 block font-fredoka">
                {diagnosticHint.badge || "Perhatian:"}
              </span>
              <span className="text-xs font-semibold text-rose-800">
                {diagnosticHint.message}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BAR (Sesuai Gambar 4: < Kembali, 🔄 Ulangi Soal, ✅ Soal Berikutnya) */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-black text-xs sm:text-sm border border-slate-200 shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNewProblem}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-black text-xs sm:text-sm border border-slate-200 shadow-2xs transition cursor-pointer"
            title="Dapatkan soal baru dengan angka berbeda"
          >
            <RotateCcw size={15} />
            <span>Ulangi Soal</span>
          </button>

          <button
            type="button"
            onClick={onNewProblem}
            className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-500/25 transition cursor-pointer"
          >
            <CheckCircle2 size={16} />
            <span>Soal Berikutnya</span>
          </button>
        </div>
      </div>
    </div>
  );
}
