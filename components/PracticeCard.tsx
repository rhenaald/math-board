"use client";

import React, { useState } from "react";
import {
  Volume2,
  Lightbulb,
  CheckCircle,
  RefreshCw,
  HelpCircle,
  Box,
  Layers,
} from "lucide-react";
import MathBoardGrid from "./MathBoardGrid";
import BaseTenBlocksVisualizer from "./BaseTenBlocksVisualizer";

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
  levelName = "Level 2 – Nilai Tempat",
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
  // State toggle khusus alat bantu balok dan papan susun
  const [internalShowBlocks, setInternalShowBlocks] = useState<boolean>(false);
  const showDienesBlocks = propShowBlocks !== undefined ? propShowBlocks : internalShowBlocks;
  const setShowDienesBlocks = propSetShowBlocks || setInternalShowBlocks;
  const [showVerticalBoard, setShowVerticalBoard] = useState<boolean>(false);

  // Decompose numbers for Place Value mini-cells
  const getDecomposition = (val: number) => {
    const u = val % 10;
    const t = Math.floor((val % 100) / 10);
    const h = Math.floor((val % 1000) / 100);
    const th = Math.floor((val % 10000) / 1000);
    return { th, h, t, u };
  };

  const d1 = getDecomposition(num1);
  const d2 = getDecomposition(num2);

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
    utterance.rate = 0.9;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const opSymbol = currentOp === "-" ? "−" : currentOp;

  return (
    <div
      className={`bg-white rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col w-full transition-all duration-300 ${
        isShaking ? "animate-shake ring-2 ring-rose-400" : ""
      } ${isSuccess ? "ring-4 ring-emerald-400 shadow-lg" : ""}`}
    >
      {/* HEADER BIRU CERIA DENGAN BADGE LEVEL & PROGRESS */}
      <div className="bg-blue-600 text-white px-4 md:px-6 py-3 flex items-center justify-between gap-2 select-none">
        <span className="font-black text-xs md:text-sm tracking-tight font-fredoka">
          Soal Latihan
        </span>

        <span className="px-3.5 py-1 rounded-full bg-blue-500/80 border border-blue-400/80 text-[11px] md:text-xs font-black shadow-2xs">
          {levelName}
        </span>

        <span className="text-xs md:text-sm font-black font-fredoka text-blue-100">
          Soal {questionNumber} dari {totalQuestions}
        </span>
      </div>

      {/* BODY KARTU UTAMA */}
      <div className="p-4 md:p-6 flex flex-col gap-4">
        {/* TAMPILAN PERSAMAAN BESAR DENGAN INPUT DAN AUDIO SPEAKER */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5 py-2">
          {/* Rumus Matematika Besar */}
          <div className="flex items-center gap-2.5 md:gap-4 text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-fredoka tracking-tight">
            <span>{num1}</span>
            <span className="text-blue-600">{opSymbol}</span>
            <span>{num2}</span>
            <span className="text-slate-400">=</span>
          </div>

          {/* Kotak Input Jawaban Besar Bergaya Kartun Ceria */}
          <div className="relative">
            <input
              type="text"
              id="main-user-answer-input"
              value={userAnswerInput}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9]/g, "");
                setUserAnswerInput(cleaned);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCheckAnswer();
              }}
              placeholder="?"
              className="w-24 sm:w-28 md:w-32 h-14 sm:h-16 text-center font-black text-2xl sm:text-3xl font-fredoka text-amber-950 bg-amber-50/50 border-3 border-amber-300 rounded-2xl shadow-xs focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-200 focus:outline-none transition"
            />
          </div>

          {/* Tombol Audio Pembaca Soal 🔊 */}
          <button
            type="button"
            onClick={speakProblem}
            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-700 flex items-center justify-center border border-sky-300/80 shadow-xs transition transform active:scale-90"
            title="Dengarkan Soal (Dibacakan)"
          >
            <Volume2 size={24} className="stroke-[2.5]" />
          </button>
        </div>

        {/* BANNER TIPS DENGAN IKON BOHLAM */}
        <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl px-3.5 py-2.5 flex items-center justify-center gap-2 text-center text-[11px] md:text-xs font-bold text-sky-900">
          <Lightbulb size={16} className="text-amber-500 fill-amber-400 shrink-0" />
          <span>Kamu bisa menggunakan Papan Nilai Tempat atau membuka Alat Bantu Balok jika perlu bantuan.</span>
        </div>

        {/* SUBSECTION: PAPAN NILAI TEMPAT & ALAT BANTU BALOK (2 KOLOM SEJAJAR) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* BOX KIRI: PAPAN NILAI TEMPAT */}
          <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-200/80 flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5">
              <span className="text-xs font-black text-slate-800 font-fredoka flex items-center gap-1.5">
                <Box size={14} className="text-blue-600" /> Papan Nilai Tempat
              </span>
              <button
                type="button"
                onClick={() => setShowVerticalBoard(!showVerticalBoard)}
                className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 transition cursor-pointer"
              >
                {showVerticalBoard ? "Tutup Papan Susun" : "Buka Papan Susun"}
              </button>
            </div>

            {/* Kolom Nilai Tempat: Ratusan, Puluhan, Satuan */}
            <div className="grid grid-cols-3 gap-2 text-center">
              {/* Ratusan */}
              <div className="flex flex-col gap-1">
                <div className="py-1 px-1 rounded-t-xl bg-sky-100 text-sky-900 border border-sky-300 text-[10px] md:text-[11px] font-black">
                  Ratusan (R)
                </div>
                <div className="p-2 bg-white rounded-b-xl border border-slate-200 text-base md:text-lg font-black font-fredoka text-sky-900">
                  {d1.h} {currentOp} {d2.h}
                </div>
              </div>

              {/* Puluhan */}
              <div className="flex flex-col gap-1">
                <div className="py-1 px-1 rounded-t-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] md:text-[11px] font-black">
                  Puluhan (P)
                </div>
                <div className="p-2 bg-white rounded-b-xl border border-slate-200 text-base md:text-lg font-black font-fredoka text-emerald-900">
                  {d1.t} {currentOp} {d2.t}
                </div>
              </div>

              {/* Satuan */}
              <div className="flex flex-col gap-1">
                <div className="py-1 px-1 rounded-t-xl bg-rose-100 text-rose-900 border border-rose-300 text-[10px] md:text-[11px] font-black">
                  Satuan (S)
                </div>
                <div className="p-2 bg-white rounded-b-xl border border-slate-200 text-base md:text-lg font-black font-fredoka text-rose-900">
                  {d1.u} {currentOp} {d2.u}
                </div>
              </div>
            </div>
          </div>

          {/* BOX KANAN: ALAT BANTU (KHUSUS BALOK NILAI TEMPAT) */}
          <div className="bg-slate-50/70 rounded-2xl p-3.5 border border-slate-200/80 flex flex-col justify-between gap-2.5">
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-1.5">
              <span className="text-xs font-black text-slate-800 font-fredoka flex items-center gap-1.5">
                <Layers size={15} className="text-blue-600" /> Alat Bantu Balok
              </span>
              <span className="text-[10px] text-blue-700 font-black bg-blue-100/80 px-2.5 py-0.5 rounded-full border border-blue-200">
                Blok Dienes 3D
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-1">
              <div className="text-[11px] font-bold text-slate-600 leading-tight">
                Visualisasikan bilangan dengan balok 3D (Ribuan, Ratusan, Puluhan, Satuan).
              </div>

              <button
                type="button"
                onClick={() => setShowDienesBlocks(!showDienesBlocks)}
                className={`px-4 py-2.5 rounded-xl text-xs font-black font-fredoka transition flex items-center justify-center gap-2 shrink-0 shadow-xs cursor-pointer ${
                  showDienesBlocks
                    ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 ring-2 ring-rose-300"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 ring-2 ring-blue-300 transform hover:scale-102 active:scale-95"
                }`}
              >
                <Layers size={15} />
                <span>{showDienesBlocks ? "Tutup Balok" : "Buka Balok 3D"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ALAT BANTU DRAWER: BLOK DIENES 3D */}
        {showDienesBlocks && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <BaseTenBlocksVisualizer
              num1={num1}
              num2={num2}
              operation={currentOp === "-" ? "−" : currentOp}
              activePlace={activePlace}
              onHoverPlace={setActivePlace}
            />
          </div>
        )}

        {/* ALAT BANTU DRAWER: PAPAN HITUNG SUSUN VERTIKAL */}
        {showVerticalBoard && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <MathBoardGrid
              currentUser=""
              selectedOp={currentOp}
              currentOp={currentOp}
              placeValueCombo="P-P"
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

        {/* DIAGNOSTIC ERROR BANNER JIKA SALAH */}
        {diagnosticHint && (
          <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 animate-in fade-in duration-200 ${diagnosticHint.color}`}>
            <span className="text-lg">💡</span>
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 border border-current inline-block">
                {diagnosticHint.badge}
              </span>
              <p className="text-xs font-bold leading-relaxed">{diagnosticHint.message}</p>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BUTTONS: Ulangi Soal | Saya Butuh Bantuan | Periksa Jawaban */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          {/* 1. Ulangi Soal */}
          <button
            type="button"
            onClick={onNewProblem}
            className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition flex items-center justify-center gap-2 font-fredoka shadow-2xs cursor-pointer"
          >
            <RefreshCw size={15} /> Ulangi Soal
          </button>

          {/* 2. Saya Butuh Bantuan */}
          <button
            type="button"
            onClick={onNeedHelp}
            className="w-full py-3 px-4 rounded-2xl bg-sky-100 hover:bg-sky-200 text-sky-800 font-extrabold text-xs transition flex items-center justify-center gap-2 font-fredoka shadow-2xs cursor-pointer"
          >
            <HelpCircle size={15} /> Saya Butuh Bantuan
          </button>

          {/* 3. Periksa Jawaban */}
          <button
            type="button"
            onClick={onCheckAnswer}
            className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition flex items-center justify-center gap-2 font-fredoka shadow-md shadow-emerald-600/25 transform hover:scale-102 active:scale-95 cursor-pointer"
          >
            <CheckCircle size={17} className="stroke-[2.5]" /> Periksa Jawaban
          </button>
        </div>
      </div>
    </div>
  );
}
