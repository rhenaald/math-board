"use client";

import React, { useState } from "react";
import {
  BookOpen,
  ArrowRight,
  Volume2,
  Sparkles,
  Lightbulb,
  Layers,
  Play,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  Eye,
} from "lucide-react";
import BaseTenBlocksVisualizer, { UnitCube3D, TenRod3D, HundredFlat3D } from "./BaseTenBlocksVisualizer";
import { BoyMascotVector, GirlMascotVector } from "./ChildMascots";

interface ExampleProblemsPageProps {
  studentName: string;
  initialOp?: "+" | "-" | "×" | "÷";
  onGoToDigitSelection: (op?: "+" | "-" | "×" | "÷") => void;
  onGoToHome?: () => void;
}

interface StepDetail {
  stepNumber: number;
  title: string;
  badge: string;
  badgeColor: string;
  activePlace: "th" | "h" | "t" | "u" | "all";
  carryValues: { th: string; h: string; t: string; u: string };
  ansValues: { th: string; h: string; t: string; u: string };
  explanation: string;
  speechText: string;
}

interface ExampleConfig {
  id: string;
  title: string;
  op: "+" | "-" | "×" | "÷";
  num1: number;
  num2: number;
  result: number;
  overviewSpeech: string;
  tips: string;
  steps: StepDetail[];
}

const EXAMPLES_DATABASE: Record<"+" | "-" | "×" | "÷", ExampleConfig[]> = {
  "+": [
    {
      id: "add-1",
      title: "Penjumlahan 2 Digit (Simpan Satuan ke Puluhan)",
      op: "+",
      num1: 45,
      num2: 27,
      result: 72,
      overviewSpeech:
        "Contoh penjumlahan 45 ditambah 27. Perhatikan papan hitung dan balok nilai tempat. Mari kita hitung langkah demi langkah dari kolom satuan.",
      tips: "Selalu mulai menghitung dari kolom Satuan (paling kanan). Jika jumlah satuan 10 atau lebih, simpan 1 ke kolom Puluhan!",
      steps: [
        {
          stepNumber: 1,
          title: "Langkah 1: Hitung Kolom Satuan (S)",
          badge: "Satuan (5 + 7 = 12)",
          badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
          activePlace: "u",
          carryValues: { th: "", h: "", t: "1", u: "" },
          ansValues: { th: "", h: "", t: "", u: "2" },
          explanation:
            "Jumlahkan satuan: 5 + 7 = 12 satuan. Karena 12 melebihi 9, kita tulis angka 2 di kolom satuan dan simpan 1 (senilai 10) di atas kolom puluhan.",
          speechText:
            "Langkah 1: Jumlahkan 5 ditambah 7 sama dengan 12. Tulis angka 2 di tempat satuan, dan simpan 1 di atas tempat puluhan.",
        },
        {
          stepNumber: 2,
          title: "Langkah 2: Hitung Kolom Puluhan (P)",
          badge: "Puluhan (4 + 2 + 1 = 7)",
          badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
          activePlace: "t",
          carryValues: { th: "", h: "", t: "1", u: "" },
          ansValues: { th: "", h: "", t: "7", u: "2" },
          explanation:
            "Jumlahkan puluhan: 4 + 2 + 1 (simpanan) = 7 puluhan. Tulis angka 7 di kolom puluhan.",
          speechText:
            "Langkah 2: Jumlahkan puluhan: 4 ditambah 2 ditambah 1 simpanan sama dengan 7. Tulis angka 7 di tempat puluhan.",
        },
        {
          stepNumber: 3,
          title: "Langkah 3: Ringkasan Hasil Akhir",
          badge: "Hasil Akhir = 72",
          badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
          activePlace: "all",
          carryValues: { th: "", h: "", t: "1", u: "" },
          ansValues: { th: "", h: "", t: "7", u: "2" },
          explanation:
            "Selesai! Nilai gabungan 7 Puluhan dan 2 Satuan adalah 72. 45 + 27 = 72.",
          speechText:
            "Hebat! Hasil akhir dari 45 ditambah 27 adalah 72. Kamu siap latihan!",
        },
      ],
    },
    {
      id: "add-2",
      title: "Penjumlahan 3 Digit (Ratusan & Simpan Berjenjang)",
      op: "+",
      num1: 348,
      num2: 275,
      result: 623,
      overviewSpeech:
        "Contoh penjumlahan ratusan 348 ditambah 275. Perhatikan bagaimana kubus satuan dan batang puluhan dikelompokkan.",
      tips: "Jika puluhan menghasilkan 10 atau lebih (contoh 12), simpan 1 batang ratusan ke kolom Ratusan!",
      steps: [
        {
          stepNumber: 1,
          title: "Langkah 1: Kolom Satuan (S)",
          badge: "8 + 5 = 13",
          badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
          activePlace: "u",
          carryValues: { th: "", h: "", t: "1", u: "" },
          ansValues: { th: "", h: "", t: "", u: "3" },
          explanation: "8 + 5 = 13. Tulis 3 di kolom satuan, simpan 1 di atas puluhan.",
          speechText: "8 ditambah 5 sama dengan 13. Tulis 3, simpan 1 ke puluhan.",
        },
        {
          stepNumber: 2,
          title: "Langkah 2: Kolom Puluhan (P)",
          badge: "4 + 7 + 1 = 12",
          badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
          activePlace: "t",
          carryValues: { th: "", h: "1", t: "1", u: "" },
          ansValues: { th: "", h: "", t: "2", u: "3" },
          explanation: "4 + 7 + 1 (simpanan) = 12. Tulis 2 di kolom puluhan, simpan 1 di atas ratusan.",
          speechText: "4 ditambah 7 ditambah 1 simpanan sama dengan 12. Tulis 2, simpan 1 ke ratusan.",
        },
        {
          stepNumber: 3,
          title: "Langkah 3: Kolom Ratusan (R)",
          badge: "3 + 2 + 1 = 6",
          badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
          activePlace: "h",
          carryValues: { th: "", h: "1", t: "1", u: "" },
          ansValues: { th: "", h: "6", t: "2", u: "3" },
          explanation: "3 + 2 + 1 (simpanan) = 6. Tulis 6 di kolom ratusan.",
          speechText: "3 ditambah 2 ditambah 1 simpanan sama dengan 6. Hasil akhir 623.",
        },
        {
          stepNumber: 4,
          title: "Langkah 4: Hasil Akhir",
          badge: "Hasil = 623",
          badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
          activePlace: "all",
          carryValues: { th: "", h: "1", t: "1", u: "" },
          ansValues: { th: "", h: "6", t: "2", u: "3" },
          explanation: "Gabungan: 6 Ratusan + 2 Puluhan + 3 Satuan = 623.",
          speechText: "Hasil akhir 348 ditambah 275 adalah 623.",
        },
      ],
    },
  ],
  "-": [
    {
      id: "sub-1",
      title: "Pengurangan 2 Digit (Pinjam 1 Puluhan)",
      op: "-",
      num1: 52,
      num2: 28,
      result: 24,
      overviewSpeech:
        "Contoh pengurangan 52 dikurang 28. Karena satuan 2 tidak bisa dikurang 8, kita pinjam 1 puluhan dari 5.",
      tips: "1 puluhan yang dipinjam berubah menjadi 10 satuan. Jadi 2 satuan bertambah menjadi 12 satuan!",
      steps: [
        {
          stepNumber: 1,
          title: "Langkah 1: Kolom Satuan (Pinjam Puluhan)",
          badge: "12 − 8 = 4",
          badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
          activePlace: "u",
          carryValues: { th: "", h: "", t: "4", u: "12" },
          ansValues: { th: "", h: "", t: "", u: "4" },
          explanation:
            "2 − 8 tidak bisa. Pinjam 1 puluhan dari angka 5 (5 bersisa 4). Angka 2 menjadi 12 satuan. Lalu 12 − 8 = 4 satuan.",
          speechText:
            "Langkah 1: 2 dikurang 8 tidak cukup. Pinjam 1 puluhan dari 5. Angka 2 menjadi 12, lalu 12 dikurang 8 sama dengan 4.",
        },
        {
          stepNumber: 2,
          title: "Langkah 2: Kolom Puluhan (Sisa Puluhan)",
          badge: "4 − 2 = 2",
          badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
          activePlace: "t",
          carryValues: { th: "", h: "", t: "4", u: "12" },
          ansValues: { th: "", h: "", t: "2", u: "4" },
          explanation:
            "Angka 5 sudah dipinjam 1, sehingga bersisa 4 puluhan. Lalu 4 − 2 = 2 puluhan. Tulis 2 di kolom puluhan.",
          speechText:
            "Langkah 2: Angka 5 sisa 4 karena sudah dipinjam. Lalu 4 dikurang 2 sama dengan 2.",
        },
        {
          stepNumber: 3,
          title: "Langkah 3: Ringkasan Hasil",
          badge: "Hasil = 24",
          badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
          activePlace: "all",
          carryValues: { th: "", h: "", t: "4", u: "12" },
          ansValues: { th: "", h: "", t: "2", u: "4" },
          explanation:
            "Hasil akhirnya adalah 2 Puluhan dan 4 Satuan = 24. 52 − 28 = 24.",
          speechText: "Hasil akhir 52 dikurang 28 sama dengan 24.",
        },
      ],
    },
    {
      id: "sub-2",
      title: "Pengurangan 3 Digit (Ratusan ke Ratusan)",
      op: "-",
      num1: 432,
      num2: 165,
      result: 267,
      overviewSpeech:
        "Contoh pengurangan ratusan 432 dikurang 165 dengan pinjam berjenjang.",
      tips: "Perhatikan sisa angka di baris simpan/pinjam setelah dipinjam ke kolom sebelahnya.",
      steps: [
        {
          stepNumber: 1,
          title: "Langkah 1: Satuan",
          badge: "12 − 5 = 7",
          badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
          activePlace: "u",
          carryValues: { th: "", h: "3", t: "12", u: "12" },
          ansValues: { th: "", h: "", t: "", u: "7" },
          explanation: "Pinjam 1 puluhan: 2 jadi 12. 12 − 5 = 7.",
          speechText: "2 pinjam 1 jadi 12. 12 dikurang 5 sama dengan 7.",
        },
        {
          stepNumber: 2,
          title: "Langkah 2: Puluhan",
          badge: "12 − 6 = 6",
          badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
          activePlace: "t",
          carryValues: { th: "", h: "3", t: "12", u: "12" },
          ansValues: { th: "", h: "", t: "6", u: "7" },
          explanation: "3 sisa 2, pinjam 1 ratusan jadi 12. 12 − 6 = 6.",
          speechText: "Puluhan sisa 2 pinjam dari ratusan jadi 12. 12 dikurang 6 sama dengan 6.",
        },
        {
          stepNumber: 3,
          title: "Langkah 3: Ratusan",
          badge: "3 − 1 = 2",
          badgeColor: "bg-purple-100 text-purple-900 border-purple-300",
          activePlace: "h",
          carryValues: { th: "", h: "3", t: "12", u: "12" },
          ansValues: { th: "", h: "2", t: "6", u: "7" },
          explanation: "4 sisa 3 ratusan. 3 − 1 = 2.",
          speechText: "Ratusan 3 dikurang 1 sama dengan 2. Hasil akhir 267.",
        },
      ],
    },
  ],
  "×": [
    {
      id: "mul-1",
      title: "Perkalian 2 Digit × 1 Digit (24 × 3)",
      op: "×",
      num1: 24,
      num2: 3,
      result: 72,
      overviewSpeech:
        "Contoh perkalian 24 dikali 3. Pertama kalikan satuan 4 dikali 3, lalu kalikan puluhan 2 dikali 3.",
      tips: "Kalikan digit pengali ke Satuan terlebih dahulu, baru kalikan ke Puluhan!",
      steps: [
        {
          stepNumber: 1,
          title: "Langkah 1: Kalikan Bagian Satuan (4 × 3)",
          badge: "4 × 3 = 12",
          badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
          activePlace: "u",
          carryValues: { th: "", h: "", t: "1", u: "" },
          ansValues: { th: "", h: "", t: "", u: "2" },
          explanation:
            "Kalikan satuan: 4 × 3 = 12 satuan. Tulis angka 2 di kolom satuan, dan simpan 1 di atas kolom puluhan.",
          speechText:
            "Langkah 1: Kalikan 4 dikali 3 sama dengan 12. Tulis 2 di tempat satuan, simpan 1 di atas puluhan.",
        },
        {
          stepNumber: 2,
          title: "Langkah 2: Kalikan Bagian Puluhan (2 × 3 + 1)",
          badge: "2 × 3 + 1 = 7",
          badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
          activePlace: "t",
          carryValues: { th: "", h: "", t: "1", u: "" },
          ansValues: { th: "", h: "", t: "7", u: "2" },
          explanation:
            "Kalikan puluhan: 2 × 3 = 6. Lalu tambahkan 1 (simpanan) menjadi 6 + 1 = 7 puluhan. Tulis 7 di kolom puluhan.",
          speechText:
            "Langkah 2: Kalikan 2 dikali 3 sama dengan 6, lalu tambah 1 simpanan sama dengan 7. Tulis 7 di tempat puluhan.",
        },
        {
          stepNumber: 3,
          title: "Langkah 3: Hasil Akhir",
          badge: "Hasil = 72",
          badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
          activePlace: "all",
          carryValues: { th: "", h: "", t: "1", u: "" },
          ansValues: { th: "", h: "", t: "7", u: "2" },
          explanation: "Hasil akhirnya adalah 72. 24 × 3 = 72.",
          speechText: "Hasil akhir 24 dikali 3 adalah 72.",
        },
      ],
    },
  ],
  "÷": [
    {
      id: "div-1",
      title: "Pembagian Berbasis Dekomposisi (48 ÷ 4)",
      op: "÷",
      num1: 48,
      num2: 4,
      result: 12,
      overviewSpeech:
        "Contoh pembagian 48 dibagi 4. Kita pecah bilangan 48 menjadi 40 puluhan dan 8 satuan, lalu bagi masing-masing.",
      tips: "Pada pembagian susun/terurai, bagi nilai tempat terbesar (Puluhan) terlebih dahulu, baru nilai Satuan.",
      steps: [
        {
          stepNumber: 1,
          title: "Langkah 1: Bagi Bagian Puluhan (40 ÷ 4)",
          badge: "40 ÷ 4 = 10",
          badgeColor: "bg-blue-100 text-blue-900 border-blue-300",
          activePlace: "t",
          carryValues: { th: "", h: "", t: "", u: "" },
          ansValues: { th: "", h: "", t: "1", u: "" },
          explanation:
            "4 puluhan (40) dibagi 4 = 1 puluhan (10). Tulis angka 1 di kolom puluhan.",
          speechText:
            "Langkah 1: Bagi 4 puluhan dengan 4 sama dengan 1 puluhan. Tulis 1 di kolom puluhan.",
        },
        {
          stepNumber: 2,
          title: "Langkah 2: Bagi Bagian Satuan (8 ÷ 4)",
          badge: "8 ÷ 4 = 2",
          badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
          activePlace: "u",
          carryValues: { th: "", h: "", t: "", u: "" },
          ansValues: { th: "", h: "", t: "1", u: "2" },
          explanation:
            "8 satuan dibagi 4 = 2 satuan. Tulis angka 2 di kolom satuan.",
          speechText:
            "Langkah 2: Bagi 8 satuan dengan 4 sama dengan 2 satuan. Tulis 2 di kolom satuan.",
        },
        {
          stepNumber: 3,
          title: "Langkah 3: Gabungkan Hasil",
          badge: "10 + 2 = 12",
          badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
          activePlace: "all",
          carryValues: { th: "", h: "", t: "", u: "" },
          ansValues: { th: "", h: "", t: "1", u: "2" },
          explanation:
            "Gabungkan hasil puluhan dan satuan: 10 + 2 = 12. 48 ÷ 4 = 12.",
          speechText: "Hasil akhir 48 dibagi 4 adalah 12. Sangat mudah kan?",
        },
      ],
    },
  ],
};

export default function ExampleProblemsPage({
  studentName = "Siswa",
  initialOp = "+",
  onGoToDigitSelection,
  onGoToHome,
}: ExampleProblemsPageProps) {
  const [selectedOp, setSelectedOp] = useState<"+" | "-" | "×" | "÷">(initialOp);
  const [activeExampleIndex, setActiveExampleIndex] = useState<number>(0);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const currentExamples = EXAMPLES_DATABASE[selectedOp] || EXAMPLES_DATABASE["+"];
  const activeExample = currentExamples[activeExampleIndex] || currentExamples[0];
  const activeStep = activeExample.steps[activeStepIndex] || activeExample.steps[0];

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getDigit = (num: number, place: "th" | "h" | "t" | "u") => {
    if (place === "th") return Math.floor((num % 10000) / 1000) || "";
    if (place === "h") return Math.floor((num % 1000) / 100) || "";
    if (place === "t") return Math.floor((num % 100) / 10) || "";
    return num % 10;
  };

  const opColors: Record<"+" | "-" | "×" | "÷", { bg: string; text: string; border: string; activeTab: string }> = {
    "+": {
      bg: "bg-emerald-500",
      text: "text-emerald-700",
      border: "border-emerald-300",
      activeTab: "bg-emerald-500 text-white shadow-md shadow-emerald-400/30",
    },
    "-": {
      bg: "bg-orange-500",
      text: "text-orange-700",
      border: "border-orange-300",
      activeTab: "bg-orange-500 text-white shadow-md shadow-orange-400/30",
    },
    "×": {
      bg: "bg-rose-500",
      text: "text-rose-700",
      border: "border-rose-300",
      activeTab: "bg-rose-500 text-white shadow-md shadow-rose-400/30",
    },
    "÷": {
      bg: "bg-purple-600",
      text: "text-purple-700",
      border: "border-purple-300",
      activeTab: "bg-purple-600 text-white shadow-md shadow-purple-400/30",
    },
  };

  return (
    <main className="flex-1 w-full flex flex-col gap-5 min-w-0 select-none animate-in fade-in duration-200">
      {/* 1. HERO BANNER HALAMAN CONTOH */}
      <div className="bg-white/95 rounded-3xl p-5 sm:p-6 md:p-7 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex flex-col gap-1.5 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200 w-fit">
            <BookOpen size={14} />
            <span>Langkah 2: Bahan Belajar & Contoh Visualisasi</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-fredoka tracking-tight">
            Contoh Soal & Papan Visualisasi 💡
          </h1>

          <p className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed">
            Halo <span className="text-blue-600 font-black">{studentName || "Teman"}</span>! Ini adalah papan peraga nilai tempat dan balok Dienes interaktif. Klik tombol langkah untuk melihat cara menghitungnya!
          </p>
        </div>

        {/* TOMBOL AKSI LANGKAH 3 (MULAI LATIHAN) */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 relative z-10">
          <button
            type="button"
            onClick={() => onGoToDigitSelection(selectedOp)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-500/30 transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 font-fredoka cursor-pointer"
          >
            <Play size={18} fill="currentColor" />
            <span>Mulai Latihan Sekarang 🚀</span>
          </button>
        </div>

        <div className="absolute -top-10 -right-10 w-48 h-48 bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* 2. TAB PEMILIH OPERASI & CONTOH SOAL */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Tab 4 Operasi */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100/80 rounded-2xl">
          {[
            { id: "+" as const, label: "➕ Penjumlahan" },
            { id: "-" as const, label: "➖ Pengurangan" },
            { id: "×" as const, label: "✖️ Perkalian" },
            { id: "÷" as const, label: "➗ Pembagian" },
          ].map((op) => {
            const isActive = selectedOp === op.id;
            return (
              <button
                key={op.id}
                type="button"
                onClick={() => {
                  setSelectedOp(op.id);
                  setActiveExampleIndex(0);
                  setActiveStepIndex(0);
                }}
                className={`py-2 px-3.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer font-fredoka ${
                  isActive ? opColors[op.id].activeTab : "text-slate-600 hover:bg-slate-200/80"
                }`}
              >
                {op.label}
              </button>
            );
          })}
        </div>

        {/* Pilihan Contoh 1 / Contoh 2 */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">Pilih Soal:</span>
          {currentExamples.map((ex, idx) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => {
                setActiveExampleIndex(idx);
                setActiveStepIndex(0);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer font-fredoka ${
                activeExampleIndex === idx
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Contoh {idx + 1}: {ex.num1} {ex.op} {ex.num2}
            </button>
          ))}
        </div>
      </div>

      {/* 3. PAPAN VISUALISASI BALOK NILAI TEMPAT (BASE TEN BLOCKS 3D) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-400 flex items-center justify-center text-amber-950 font-black text-sm shadow-2xs">
              🧱
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 font-fredoka">
                Visualisasi Balok Nilai Tempat 3D ({activeExample.num1} {activeExample.op} {activeExample.num2})
              </h2>
              <p className="text-[11px] text-slate-500 font-semibold">
                Perhatikan bagaimana kubus satuan (S), batang puluhan (P), dan lempeng ratusan (R) disusun:
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => speakText(activeExample.overviewSpeech)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-black transition border border-blue-200 cursor-pointer shadow-2xs"
          >
            <Volume2 size={14} />
            <span className="hidden sm:inline">Dengarkan Penjelasan</span>
          </button>
        </div>

        {/* Komponen Visualizer Balok 3D Nyata */}
        <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200">
          <BaseTenBlocksVisualizer
            num1={activeExample.num1}
            num2={activeExample.num2}
            operation={activeExample.op}
            activePlace={activeStep.activePlace}
            hideHeader={true}
          />
        </div>
      </div>

      {/* 4. PAPAN HITUNG NILAI TEMPAT (MATH BOARD GRID) & STEP-BY-STEP EXPLANATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* SISI KIRI (7 Kolom): PAPAN HITUNG GRID (Mirip MathBoardGrid Latihan) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 md:p-7 border border-slate-200/90 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                Papan Hitung Interaktif
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-fredoka mt-1">
                Langkah {activeStep.stepNumber}: {activeStep.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => speakText(activeStep.speechText)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-black transition cursor-pointer"
            >
              <Volume2 size={14} />
              <span>Suara Langkah</span>
            </button>
          </div>

          {/* GRID PAPAN HITUNG REALISTIS */}
          <div className="w-full max-w-lg mx-auto flex flex-col gap-2.5 py-2">
            {/* Header Kolom Nilai Tempat */}
            <div className="grid grid-cols-5 gap-2 text-center text-xs font-black">
              <div></div>
              <div className={`py-1.5 rounded-xl border text-purple-700 bg-purple-50 border-purple-200 ${
                activeStep.activePlace === "th" ? "ring-2 ring-purple-400 scale-105" : ""
              }`}>
                Ribuan (Th)
              </div>
              <div className={`py-1.5 rounded-xl border text-indigo-700 bg-indigo-50 border-indigo-200 ${
                activeStep.activePlace === "h" ? "ring-2 ring-indigo-400 scale-105" : ""
              }`}>
                Ratusan (R)
              </div>
              <div className={`py-1.5 rounded-xl border text-blue-700 bg-blue-50 border-blue-200 ${
                activeStep.activePlace === "t" ? "ring-2 ring-blue-400 scale-105" : ""
              }`}>
                Puluhan (P)
              </div>
              <div className={`py-1.5 rounded-xl border text-amber-800 bg-amber-50 border-amber-200 ${
                activeStep.activePlace === "u" ? "ring-2 ring-amber-400 scale-105" : ""
              }`}>
                Satuan (S)
              </div>
            </div>

            {/* Baris 0: Simpan / Pinjam */}
            <div className="grid grid-cols-5 gap-2 items-center">
              <div className="text-right text-[10px] font-black text-slate-400 leading-tight">
                Simpan<br />/Pinjam
              </div>
              <div className="h-9 rounded-xl border border-dashed border-slate-300 flex items-center justify-center font-bold text-xs text-slate-500 bg-slate-50">
                {activeStep.carryValues.th || ""}
              </div>
              <div className={`h-9 rounded-xl border flex items-center justify-center font-black text-xs transition ${
                activeStep.carryValues.h
                  ? "bg-indigo-100 text-indigo-900 border-indigo-300 animate-pulse"
                  : "border-dashed border-slate-300 text-slate-400 bg-slate-50"
              }`}>
                {activeStep.carryValues.h || ""}
              </div>
              <div className={`h-9 rounded-xl border flex items-center justify-center font-black text-xs transition ${
                activeStep.carryValues.t
                  ? "bg-blue-100 text-blue-900 border-blue-300 animate-pulse"
                  : "border-dashed border-slate-300 text-slate-400 bg-slate-50"
              }`}>
                {activeStep.carryValues.t || ""}
              </div>
              <div className={`h-9 rounded-xl border flex items-center justify-center font-black text-xs transition ${
                activeStep.carryValues.u
                  ? "bg-amber-100 text-amber-900 border-amber-300 animate-pulse"
                  : "border-dashed border-slate-300 text-slate-400 bg-slate-50"
              }`}>
                {activeStep.carryValues.u || ""}
              </div>
            </div>

            {/* Baris 1: Bilangan 1 */}
            <div className="grid grid-cols-5 gap-2 items-center text-center font-mono font-black text-xl sm:text-2xl text-slate-800 my-1">
              <div></div>
              <div className="py-1">{getDigit(activeExample.num1, "th")}</div>
              <div className="py-1">{getDigit(activeExample.num1, "h")}</div>
              <div className="py-1">{getDigit(activeExample.num1, "t")}</div>
              <div className="py-1">{getDigit(activeExample.num1, "u")}</div>
            </div>

            {/* Baris 2: Operasi & Bilangan 2 */}
            <div className="grid grid-cols-5 gap-2 items-center text-center font-mono font-black text-xl sm:text-2xl text-slate-800 my-1">
              <div className="text-blue-600 font-sans font-black text-2xl flex items-center justify-center">
                {activeExample.op === "-" ? "−" : activeExample.op}
              </div>
              <div className="py-1">{getDigit(activeExample.num2, "th")}</div>
              <div className="py-1">{getDigit(activeExample.num2, "h")}</div>
              <div className="py-1">{getDigit(activeExample.num2, "t")}</div>
              <div className="py-1">{getDigit(activeExample.num2, "u")}</div>
            </div>

            {/* Garis Pemisah Garis Hitung */}
            <div className="border-b-4 border-slate-900 rounded-full my-1"></div>

            {/* Baris 3: Jawaban Langkah Ini */}
            <div className="grid grid-cols-5 gap-2 items-center">
              <div className="text-right text-xs font-black text-emerald-700 leading-tight font-fredoka">
                Jawaban
              </div>
              <div className={`h-12 rounded-2xl border-2 flex items-center justify-center font-black text-xl font-fredoka ${
                activeStep.ansValues.th ? "bg-emerald-50 text-emerald-700 border-emerald-400 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-300"
              }`}>
                {activeStep.ansValues.th || "?"}
              </div>
              <div className={`h-12 rounded-2xl border-2 flex items-center justify-center font-black text-xl font-fredoka ${
                activeStep.ansValues.h ? "bg-emerald-50 text-emerald-700 border-emerald-400 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-300"
              }`}>
                {activeStep.ansValues.h || "?"}
              </div>
              <div className={`h-12 rounded-2xl border-2 flex items-center justify-center font-black text-xl font-fredoka ${
                activeStep.ansValues.t ? "bg-emerald-50 text-emerald-700 border-emerald-400 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-300"
              }`}>
                {activeStep.ansValues.t || "?"}
              </div>
              <div className={`h-12 rounded-2xl border-2 flex items-center justify-center font-black text-xl font-fredoka ${
                activeStep.ansValues.u ? "bg-emerald-50 text-emerald-700 border-emerald-400 shadow-xs" : "bg-slate-50 border-slate-200 text-slate-300"
              }`}>
                {activeStep.ansValues.u || "?"}
              </div>
            </div>
          </div>
        </div>

        {/* SISI KANAN (5 Kolom): NAVIGASI LANGKAH & PENJELASAN RAMAH ANAK */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Stepper Langkah */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col gap-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              <span>Pilih Langkah Pembelajaran:</span>
            </h4>

            <div className="flex flex-col gap-2">
              {activeExample.steps.map((s, idx) => {
                const isCurrent = activeStepIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStepIndex(idx)}
                    className={`p-3 rounded-2xl border-2 text-left transition flex items-center justify-between cursor-pointer ${
                      isCurrent
                        ? "border-blue-600 bg-blue-50/90 shadow-xs ring-2 ring-blue-300 font-black text-blue-950"
                        : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                        isCurrent ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs font-fredoka font-bold">{s.title}</span>
                    </div>
                    {isCurrent && <Eye size={16} className="text-blue-600" />}
                  </button>
                );
              })}
            </div>

            {/* Kotak Penjelasan Langkah */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border w-fit ${activeStep.badgeColor}`}>
                {activeStep.badge}
              </span>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                {activeStep.explanation}
              </p>
            </div>
          </div>

          {/* Tips Maskot */}
          <div className="bg-amber-50 border border-amber-200/90 rounded-3xl p-4 flex items-center gap-3 text-amber-950 shadow-2xs">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 text-lg shadow-xs">
              💡
            </div>
            <div className="text-xs">
              <span className="font-black text-amber-900 block font-fredoka text-sm">Tips Nilai Tempat:</span>
              <span className="font-semibold text-amber-800">{activeExample.tips}</span>
            </div>
          </div>

          {/* Tombol Lanjut ke Latihan */}
          <button
            type="button"
            onClick={() => onGoToDigitSelection(selectedOp)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-500/30 transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5 font-fredoka cursor-pointer"
          >
            <span>Lanjut ke Pilih Digit & Latihan</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </main>
  );
}
