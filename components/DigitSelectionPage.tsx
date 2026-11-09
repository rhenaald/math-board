"use client";

import React, { useState } from "react";
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  Check,
  Play,
  Sparkles,
  Shuffle,
  Plus,
  Minus,
  X,
  Divide,
} from "lucide-react";
import { OperationType, SimpleOperation } from "./SetupWizard";

interface DigitSelectionPageProps {
  initialOp?: OperationType;
  initialCombo?: string;
  onStartPractice: (op: OperationType, combo: string) => void;
  onBackToExamples: () => void;
}

const operations: Array<{ id: OperationType; symbol: string; title: string; desc: string; iconBg: string }> = [
  {
    id: "+",
    symbol: "+",
    title: "Penjumlahan",
    desc: "Menghitung penggabungan dengan simpan",
    iconBg: "bg-emerald-500 text-white",
  },
  {
    id: "-",
    symbol: "−",
    title: "Pengurangan",
    desc: "Pengurangan dengan konsep pinjam puluhan",
    iconBg: "bg-orange-500 text-white",
  },
  {
    id: "×",
    symbol: "×",
    title: "Perkalian",
    desc: "Perkalian berbasis nilai tempat",
    iconBg: "bg-rose-500 text-white",
  },
  {
    id: "÷",
    symbol: "÷",
    title: "Pembagian",
    desc: "Pembagian bertahap per bagian",
    iconBg: "bg-purple-600 text-white",
  },
  {
    id: "mix",
    symbol: "🎲",
    title: "Mode Campuran",
    desc: "Kombinasi soal secara acak",
    iconBg: "bg-teal-600 text-white",
  },
];

const combos: Array<{ id: string; code: string; label: string; desc: string }> = [
  { id: "S-S", code: "SS", label: "Satuan ke Satuan", desc: "1 Digit & 1 Digit" },
  { id: "S-P", code: "SP", label: "Satuan ke Puluhan", desc: "1 Digit & 2 Digit" },
  { id: "S-R", code: "SR", label: "Satuan ke Ratusan", desc: "1 Digit & 3 Digit" },
  { id: "P-S", code: "PS", label: "Puluhan ke Satuan", desc: "2 Digit & 1 Digit" },
  { id: "P-P", code: "PP", label: "Puluhan ke Puluhan", desc: "2 Digit & 2 Digit" },
  { id: "P-R", code: "PR", label: "Puluhan ke Ratusan", desc: "2 Digit & 3 Digit" },
  { id: "R-S", code: "RS", label: "Ratusan ke Satuan", desc: "3 Digit & 1 Digit" },
  { id: "R-P", code: "RP", label: "Ratusan ke Puluhan", desc: "3 Digit & 2 Digit" },
  { id: "R-R", code: "RR", label: "Ratusan ke Ratusan", desc: "3 Digit & 3 Digit" },
];

const getComboExample = (comboId: string, op: OperationType) => {
  const actualOp = op === "mix" ? "+" : op;
  const examplesByOp: Record<SimpleOperation, Record<string, string>> = {
    "+": {
      "S-S": "7 + 5",
      "S-P": "8 + 34",
      "S-R": "6 + 142",
      "P-S": "45 + 8",
      "P-P": "45 + 27",
      "P-R": "54 + 236",
      "R-S": "324 + 7",
      "R-P": "342 + 58",
      "R-R": "456 + 278",
    },
    "-": {
      "S-S": "9 − 4",
      "S-P": "6 − 34",
      "S-R": "6 − 142",
      "P-S": "45 − 8",
      "P-P": "45 − 27",
      "P-R": "54 − 236",
      "R-S": "324 − 7",
      "R-P": "342 − 58",
      "R-R": "456 − 278",
    },
    "×": {
      "S-S": "7 × 5",
      "S-P": "4 × 23",
      "S-R": "3 × 124",
      "P-S": "23 × 4",
      "P-P": "18 × 12",
      "P-R": "12 × 115",
      "R-S": "124 × 3",
      "R-P": "115 × 12",
      "R-R": "125 × 112",
    },
    "÷": {
      "S-S": "8 ÷ 2",
      "S-P": "6 ÷ 20",
      "S-R": "5 ÷ 200",
      "P-S": "72 ÷ 3",
      "P-P": "75 ÷ 15",
      "P-R": "30 ÷ 120",
      "R-S": "144 ÷ 4",
      "R-P": "615 ÷ 15",
      "R-R": "450 ÷ 225",
    },
  };
  return examplesByOp[actualOp]?.[comboId] || "45 + 27";
};

export default function DigitSelectionPage({
  initialOp = "+",
  initialCombo = "P-P",
  onStartPractice,
  onBackToExamples,
}: DigitSelectionPageProps) {
  const [selectedOp, setSelectedOp] = useState<OperationType>(initialOp);
  const [selectedCombo, setSelectedCombo] = useState<string>(initialCombo);

  const selectedComboInfo = combos.find((c) => c.id === selectedCombo) || combos[4];

  return (
    <main className="flex-1 w-full flex flex-col gap-5 min-w-0 select-none animate-in fade-in duration-200">
      {/* 1. HERO HEADER */}
      <div className="bg-white/95 rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex flex-col gap-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200 w-fit">
            <Layers size={14} />
            <span>Langkah 4: Konfigurasi Digit & Operasi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-fredoka tracking-tight">
            Pilih Digit & Operasi Latihan 🔢
          </h1>

          <p className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed">
            Pilih jenis perhitungan matematika dan banyaknya digit angka yang ingin kamu latih di papan hitung.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => onStartPractice(selectedOp, selectedCombo)}
            className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-md shadow-emerald-500/25 transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 font-fredoka cursor-pointer"
          >
            <Play size={18} fill="currentColor" />
            <span>Mulai Kerjakan 🚀</span>
          </button>
        </div>

        <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. BAGIAN 1: PILIH OPERASI MATEMATIKA */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 font-fredoka flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            <span>Pilih Jenis Operasi Matematika</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">Pilih salah satu:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {operations.map((op) => {
            const isSelected = selectedOp === op.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => setSelectedOp(op.id)}
                className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-3 cursor-pointer ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/90 shadow-sm ring-2 ring-blue-300"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl font-black ${op.iconBg}`}>
                    {op.symbol}
                  </span>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-fredoka">{op.title}</h3>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{op.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. BAGIAN 2: PILIH KOMBINASI DIGIT / NILAI TEMPAT */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 md:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-black text-slate-900 font-fredoka flex items-center gap-2">
            <span className="w-7 h-7 rounded-xl bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            <span>Pilih Banyaknya Digit (Nilai Tempat)</span>
          </h2>

          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl text-xs font-black text-blue-900">
            <span>Pilihan Aktif:</span>
            <span className="text-blue-700 font-extrabold">{selectedComboInfo.code} ({selectedComboInfo.label})</span>
          </div>
        </div>

        {/* Pilihan Cepat (1 Digit / 2 Digit / 3 Digit) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setSelectedCombo("S-S")}
            className={`p-4 rounded-2xl border-2 text-center transition flex flex-col items-center gap-1 cursor-pointer ${
              selectedCombo === "S-S"
                ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-300 shadow-xs"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            }`}
          >
            <span className="text-2xl">🟢</span>
            <span className="font-black text-sm font-fredoka">1 Digit (SS)</span>
            <span className="text-xs text-slate-500 font-bold">Satuan ke Satuan (Contoh: {getComboExample("S-S", selectedOp)})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCombo("P-P")}
            className={`p-4 rounded-2xl border-2 text-center transition flex flex-col items-center gap-1 cursor-pointer ${
              selectedCombo === "P-P"
                ? "border-blue-600 bg-blue-50 text-blue-950 ring-2 ring-blue-300 shadow-xs"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            }`}
          >
            <span className="text-2xl">🔵</span>
            <span className="font-black text-sm font-fredoka">2 Digit (PP)</span>
            <span className="text-xs text-slate-500 font-bold">Puluhan ke Puluhan (Contoh: {getComboExample("P-P", selectedOp)})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCombo("R-R")}
            className={`p-4 rounded-2xl border-2 text-center transition flex flex-col items-center gap-1 cursor-pointer ${
              selectedCombo === "R-R"
                ? "border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-300 shadow-xs"
                : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
            }`}
          >
            <span className="text-2xl">🟣</span>
            <span className="font-black text-sm font-fredoka">3 Digit (RR)</span>
            <span className="text-xs text-slate-500 font-bold">Ratusan ke Ratusan (Contoh: {getComboExample("R-R", selectedOp)})</span>
          </button>
        </div>

        {/* 9 Kombinasi Nilai Tempat Lengkap */}
        <div className="pt-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 block mb-2.5">
            Atau Pilih Kombinasi Spesifik (9 Tingkatan):
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {combos.map((c) => {
              const isSelected = selectedCombo === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCombo(c.id)}
                  className={`p-3 rounded-2xl border-2 text-left transition flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/90 shadow-xs ring-2 ring-blue-300"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
                      }`}>
                        {c.code}
                      </span>
                      <span className="text-xs font-black text-slate-900">{c.label}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">{c.desc} • Contoh: {getComboExample(c.id, selectedOp)}</p>
                  </div>
                  {isSelected && <Check size={16} className="text-blue-600 shrink-0 stroke-[3]" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. FOOTER AKSI */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToExamples}
          className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer font-fredoka"
        >
          <ArrowLeft size={16} />
          <span>Lihat Contoh Soal Lagi</span>
        </button>

        <button
          type="button"
          onClick={() => onStartPractice(selectedOp, selectedCombo)}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-md shadow-emerald-500/25 transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5 font-fredoka cursor-pointer"
        >
          <Play size={18} fill="currentColor" />
          <span>Mulai Kerjakan di Papan Hitung 🚀</span>
        </button>
      </div>
    </main>
  );
}
