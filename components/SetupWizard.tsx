"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User,
  ArrowRight,
  ArrowLeft,
  Check,
  BookOpen,
  Sparkles,
  Volume2,
  Lightbulb,
  Play,
} from "lucide-react";

export type OperationType = "+" | "-" | "×" | "÷" | "mix";

export interface PlaceValueComboOption {
  id: string;
  label: string;
  desc: string;
  example: string;
}

interface SetupWizardProps {
  initialName?: string;
  initialOp?: OperationType;
  initialCombo?: string;
  onComplete: (name: string, operation: OperationType, combo: string) => void;
}

const operations: Array<{ id: OperationType; symbol: string; title: string; desc: string }> = [
  {
    id: "+",
    symbol: "+",
    title: "Penjumlahan",
    desc: "Menghitung penggabungan bilangan dengan konsep simpan",
  },
  {
    id: "-",
    symbol: "−",
    title: "Pengurangan",
    desc: "Melatih pengurangan kolom berjenjang dengan konsep pinjam",
  },
  {
    id: "×",
    symbol: "×",
    title: "Perkalian",
    desc: "Perkalian berbasis nilai tempat (ratusan, puluhan, satuan)",
  },
  {
    id: "÷",
    symbol: "÷",
    title: "Pembagian",
    desc: "Pembagian bertahap dengan dekomposisi nilai tempat",
  },
  {
    id: "mix",
    symbol: "🎲",
    title: "Mode Campuran",
    desc: "Kombinasi soal secara acak untuk menguji pemahaman menyeluruh",
  },
];

// 9 Pilihan Kombinasi Nilai Tempat (SS, SP, SR, PS, PP, PR, RS, RP, RR - Tanpa Ribuan)
const combos: Array<{ id: string; code: string; label: string; desc: string; example: string }> = [
  { id: "S-S", code: "SS", label: "Satuan ke Satuan", desc: "1 Digit & 1 Digit", example: "Contoh: 7 + 5" },
  { id: "S-P", code: "SP", label: "Satuan ke Puluhan", desc: "1 Digit & 2 Digit", example: "Contoh: 8 + 34" },
  { id: "S-R", code: "SR", label: "Satuan ke Ratusan", desc: "1 Digit & 3 Digit", example: "Contoh: 6 + 142" },
  { id: "P-S", code: "PS", label: "Puluhan ke Satuan", desc: "2 Digit & 1 Digit", example: "Contoh: 45 + 8" },
  { id: "P-P", code: "PP", label: "Puluhan ke Puluhan", desc: "2 Digit & 2 Digit", example: "Contoh: 45 + 27" },
  { id: "P-R", code: "PR", label: "Puluhan ke Ratusan", desc: "2 Digit & 3 Digit", example: "Contoh: 54 + 236" },
  { id: "R-S", code: "RS", label: "Ratusan ke Satuan", desc: "3 Digit & 1 Digit", example: "Contoh: 324 + 7" },
  { id: "R-P", code: "RP", label: "Ratusan ke Puluhan", desc: "3 Digit & 2 Digit", example: "Contoh: 342 + 58" },
  { id: "R-R", code: "RR", label: "Ratusan ke Ratusan", desc: "3 Digit & 3 Digit", example: "Contoh: 456 + 278" },
];

export default function SetupWizard({
  initialName = "",
  initialOp = "+",
  initialCombo = "P-P",
  onComplete,
}: SetupWizardProps) {
  // Step 1: Input Nama
  // Step 2: Contoh Soal & Bahan Belajar (dengan Tombol Latihan)
  // Step 3: Input Digit & Operasi
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(initialName);
  const [selectedOp, setSelectedOp] = useState<OperationType>(initialOp);
  const [selectedCombo, setSelectedCombo] = useState<string>(initialCombo);
  const [exampleTab, setExampleTab] = useState<"+" | "-" | "×" | "÷">("+");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleNextFromStep1 = useCallback(() => {
    if (!name.trim()) {
      setErrorMsg("Silakan tuliskan nama Anda terlebih dahulu!");
      return;
    }
    setErrorMsg("");
    setStep(2);
  }, [name]);

  const handleGoToDigitStep = useCallback(() => {
    // Jika sedang di tab contoh tertentu, sesuaikan default selectedOp
    if (selectedOp !== "mix") {
      setSelectedOp(exampleTab);
    }
    setStep(3);
  }, [exampleTab, selectedOp]);

  const handleFinish = useCallback(() => {
    onComplete(name.trim(), selectedOp, selectedCombo);
  }, [name, onComplete, selectedCombo, selectedOp]);

  const speakText = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.key === "Enter") {
        e.preventDefault();
        if (step === 1) {
          handleNextFromStep1();
        } else if (step === 2) {
          handleGoToDigitStep();
        } else if (step === 3) {
          handleFinish();
        }
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [step, handleFinish, handleNextFromStep1, handleGoToDigitStep]);

  return (
    <div id="setup-wizard-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/80 backdrop-blur-md overflow-y-auto">
      <div className={`bg-white rounded-[32px] shadow-2xl border border-slate-100 w-full p-5 sm:p-7 md:p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto ${
        step === 2 ? "max-w-3xl" : "max-w-xl"
      }`}>
        {/* Hiasan Latar Belakang */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-100/60 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-100/60 rounded-full blur-2xl pointer-events-none"></div>

        {/* Progress Stepper (Alur 5 Langkah Terkoordinasi) */}
        <div className="relative z-10 mb-5">
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-black text-slate-400 mb-2 font-fredoka gap-1">
            <span className={`flex items-center gap-1 ${step >= 1 ? "text-blue-600 font-bold" : ""}`}>
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Nama</span>
            </span>
            <span className={`flex items-center gap-1 ${step >= 2 ? "text-blue-600 font-bold" : ""}`}>
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Contoh Soal (Bahan Belajar)</span>
            </span>
            <span className={`flex items-center gap-1 ${step >= 3 ? "text-blue-600 font-bold" : ""}`}>
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] flex items-center justify-center font-bold">3</span>
              <span>Pilih Digit & Latihan</span>
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
            ></div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* LANGKAH 1: INPUT NAMA                                                     */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="relative z-10 space-y-5 text-left">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto text-amber-950 shadow-lg shadow-amber-400/30 text-3xl animate-bounce">
              💡
            </div>

            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
                Langkah 1: Masukkan Nama Siswa
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2 font-fredoka">
                Selamat Datang di MathKu!
              </h2>
              <p className="text-slate-500 text-xs font-semibold mt-1">
                Belajar Pelan, Pasti Bisa! Tuliskan nama Anda untuk memulai.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="wizard-student-name" className="block text-xs font-black uppercase tracking-wider text-slate-500">
                Nama Siswa / Pengguna
              </label>
              <div className="relative">
                <User size={18} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="wizard-student-name"
                  placeholder="Tuliskan nama Anda di sini..."
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleNextFromStep1();
                  }}
                  autoFocus
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition text-sm"
                />
              </div>
              {errorMsg && <p className="text-xs text-rose-500 font-bold">{errorMsg}</p>}
            </div>

            <button
              onClick={handleNextFromStep1}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/30 transition duration-200 transform active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer font-fredoka"
            >
              Lanjut ke Contoh Soal (Bahan Belajar) <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LANGKAH 2 & 3: CONTOH SOAL SESUAI LATIHAN & TOMBOL LATIHAN                */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="relative z-10 space-y-4 text-left">
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <BookOpen size={12} />
                <span>Langkah 2: Contoh Soal & Bahan Belajar Anak</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5 font-fredoka">
                Pelajari Contoh Soal Nilai Tempat
              </h2>
              <p className="text-slate-500 text-xs font-semibold mt-0.5">
                Halo <b>{name}</b>! Ini adalah contoh cara menghitung berbasis nilai tempat sebelum kita latihan:
              </p>
            </div>

            {/* TAB PILIHAN CONTOH OPERASI */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-1 bg-slate-100 rounded-2xl">
              {[
                { id: "+" as const, label: "➕ Penjumlahan", color: "bg-emerald-500 text-white shadow-xs" },
                { id: "-" as const, label: "➖ Pengurangan", color: "bg-orange-500 text-white shadow-xs" },
                { id: "×" as const, label: "✖️ Perkalian", color: "bg-rose-500 text-white shadow-xs" },
                { id: "÷" as const, label: "➗ Pembagian", color: "bg-purple-600 text-white shadow-xs" },
              ].map((tab) => {
                const isActive = exampleTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setExampleTab(tab.id)}
                    className={`flex-1 py-2 px-2.5 rounded-xl font-black text-xs transition cursor-pointer font-fredoka ${
                      isActive ? tab.color : "text-slate-600 hover:bg-slate-200/70"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* KARTU CONTOH SOAL EDUKATIF & VISUAL */}
            <div className="bg-slate-50/90 border-2 border-slate-200 rounded-3xl p-4 sm:p-5 flex flex-col gap-4 max-h-[340px] overflow-y-auto">
              {/* 1. CONTOH PENJUMLAHAN */}
              {exampleTab === "+" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-xl">
                      Contoh Soal: 45 + 27 = 72
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        speakText(
                          "Contoh penjumlahan 45 ditambah 27. Pertama, jumlahkan satuan 5 ditambah 7 sama dengan 12. Tulis 2, simpan 1 di atas puluhan. Lalu jumlahkan puluhan 4 ditambah 2 ditambah 1 simpanan sama dengan 7. Hasil akhirnya adalah 72."
                        )
                      }
                      className="flex items-center gap-1 text-[11px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      <Volume2 size={13} /> Dengarkan
                    </button>
                  </div>

                  {/* Visual Papan Nilai Tempat */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center font-mono">
                      <div className="text-[10px] font-black text-slate-400 mb-1 flex gap-6">
                        <span>P (Puluhan)</span>
                        <span>S (Satuan)</span>
                      </div>
                      <div className="text-xs text-amber-500 font-black mb-0.5">
                        <span className="inline-block w-6 text-center bg-amber-100 text-amber-800 rounded-full text-[10px]">¹</span>
                        <span className="inline-block w-6"></span>
                      </div>
                      <div className="text-xl font-black text-slate-800 flex gap-6 border-b-2 border-slate-700 pb-1 w-28 justify-center relative">
                        <span className="absolute -left-3 top-2 text-sm text-slate-400">+</span>
                        <div className="flex flex-col text-right">
                          <span>4 5</span>
                          <span>2 7</span>
                        </div>
                      </div>
                      <div className="text-2xl font-black text-emerald-600 mt-1 font-fredoka">
                        7 2
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-700 font-medium">
                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                        <b className="text-emerald-700">1. Kolom Satuan (S):</b>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          5 + 7 = <b>12</b>. Tulis angka <b>2</b> di bawah satuan, dan simpan <b>1</b> di atas puluhan.
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                        <b className="text-blue-700">2. Kolom Puluhan (P):</b>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          4 + 2 + <b>1 (simpanan)</b> = <b>7</b>. Tulis angka <b>7</b> di bawah puluhan.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Lightbulb size={16} className="shrink-0 text-amber-600" />
                    <span>Tips: Selalu mulai menghitung dari kolom paling kanan (Satuan) ya!</span>
                  </div>
                </div>
              )}

              {/* 2. CONTOH PENGURANGAN */}
              {exampleTab === "-" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-orange-700 bg-orange-100 px-3 py-1 rounded-xl">
                      Contoh Soal: 52 − 28 = 24
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        speakText(
                          "Contoh pengurangan 52 dikurang 28. Karena 2 satuan tidak bisa dikurang 8, kita pinjam 1 puluhan dari 5. Angka 2 menjadi 12, lalu 12 dikurang 8 sama dengan 4. Angka 5 sisa 4, lalu 4 dikurang 2 sama dengan 2. Hasilnya 24."
                        )
                      }
                      className="flex items-center gap-1 text-[11px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      <Volume2 size={13} /> Dengarkan
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center font-mono">
                      <div className="text-[10px] font-black text-slate-400 mb-1 flex gap-6">
                        <span>P (Puluhan)</span>
                        <span>S (Satuan)</span>
                      </div>
                      <div className="text-xs text-rose-500 font-black mb-0.5 flex gap-4">
                        <span className="text-[10px] text-slate-400 line-through">5</span>
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1 rounded font-bold">4</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 rounded font-bold">12</span>
                      </div>
                      <div className="text-xl font-black text-slate-800 flex gap-6 border-b-2 border-slate-700 pb-1 w-28 justify-center relative">
                        <span className="absolute -left-3 top-2 text-sm text-slate-400">−</span>
                        <div className="flex flex-col text-right">
                          <span>5 2</span>
                          <span>2 8</span>
                        </div>
                      </div>
                      <div className="text-2xl font-black text-orange-600 mt-1 font-fredoka">
                        2 4
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-700 font-medium">
                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                        <b className="text-orange-700">1. Kolom Satuan (S):</b>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          2 − 8 tidak bisa. Pinjam 1 puluhan dari angka 5 sehingga 2 menjadi <b>12</b>. Lalu 12 − 8 = <b>4</b>.
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                        <b className="text-blue-700">2. Kolom Puluhan (P):</b>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          Angka 5 sisa <b>4</b> karena sudah dipinjam 1. Lalu 4 − 2 = <b>2</b>.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Lightbulb size={16} className="shrink-0 text-amber-600" />
                    <span>Tips: 1 Puluhan yang dipinjam bernilai 10 Satuan!</span>
                  </div>
                </div>
              )}

              {/* 3. CONTOH PERKALIAN */}
              {exampleTab === "×" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-rose-700 bg-rose-100 px-3 py-1 rounded-xl">
                      Contoh Soal: 24 × 3 = 72
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        speakText(
                          "Contoh perkalian 24 dikali 3. Pertama, kalikan satuan 4 dikali 3 sama dengan 12. Tulis 2, simpan 1. Lalu kalikan puluhan 2 dikali 3 sama dengan 6, ditambah 1 simpanan sama dengan 7. Hasilnya 72."
                        )
                      }
                      className="flex items-center gap-1 text-[11px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      <Volume2 size={13} /> Dengarkan
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center font-mono">
                      <div className="text-[10px] font-black text-slate-400 mb-1 flex gap-6">
                        <span>P (Puluhan)</span>
                        <span>S (Satuan)</span>
                      </div>
                      <div className="text-xs text-amber-500 font-black mb-0.5">
                        <span className="inline-block w-6 text-center bg-amber-100 text-amber-800 rounded-full text-[10px]">¹</span>
                        <span className="inline-block w-6"></span>
                      </div>
                      <div className="text-xl font-black text-slate-800 flex gap-6 border-b-2 border-slate-700 pb-1 w-28 justify-center relative">
                        <span className="absolute -left-3 top-2 text-sm text-slate-400">×</span>
                        <div className="flex flex-col text-right">
                          <span>2 4</span>
                          <span>  3</span>
                        </div>
                      </div>
                      <div className="text-2xl font-black text-rose-600 mt-1 font-fredoka">
                        7 2
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-700 font-medium">
                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                        <b className="text-rose-700">1. Kalikan Satuan (S):</b>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          4 × 3 = <b>12</b>. Tulis angka <b>2</b> di bawah satuan, simpan <b>1</b> di atas puluhan.
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                        <b className="text-blue-700">2. Kalikan Puluhan (P):</b>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          2 × 3 = 6, lalu ditambah <b>1 (simpanan)</b> = <b>7</b>. Tulis angka <b>7</b> di puluhan.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Lightbulb size={16} className="shrink-0 text-amber-600" />
                    <span>Tips: Kalikan bagian satuan dulu, baru kalikan bagian puluhan!</span>
                  </div>
                </div>
              )}

              {/* 4. CONTOH PEMBAGIAN */}
              {exampleTab === "÷" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-xl">
                      Contoh Soal: 48 ÷ 4 = 12
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        speakText(
                          "Contoh pembagian 48 dibagi 4. Pertama, bagi puluhan: 4 puluhan dibagi 4 sama dengan 1 puluhan. Kedua, bagi satuan: 8 satuan dibagi 4 sama dengan 2 satuan. Hasil akhirnya adalah 12."
                        )
                      }
                      className="flex items-center gap-1 text-[11px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                    >
                      <Volume2 size={13} /> Dengarkan
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col items-center justify-center font-mono">
                      <div className="text-xs font-black text-slate-400 mb-1">
                        48 = 40 (Puluhan) + 8 (Satuan)
                      </div>
                      <div className="text-sm font-black text-slate-800 p-2 bg-slate-50 rounded-xl w-full text-center space-y-1">
                        <div>40 ÷ 4 = <span className="text-blue-600 font-bold">10</span></div>
                        <div>8 ÷ 4 = <span className="text-emerald-600 font-bold">2</span></div>
                      </div>
                      <div className="text-2xl font-black text-purple-600 mt-2 font-fredoka">
                        10 + 2 = 12
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-700 font-medium">
                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                        <b className="text-purple-700">1. Bagi Bagian Puluhan:</b>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          4 puluhan ÷ 4 = <b>1 puluhan (10)</b>.
                        </p>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                        <b className="text-emerald-700">2. Bagi Bagian Satuan:</b>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          8 satuan ÷ 4 = <b>2 satuan</b>. Gabungkan 10 + 2 = <b>12</b>.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold text-amber-900">
                    <Lightbulb size={16} className="shrink-0 text-amber-600" />
                    <span>Tips: Pada pembagian, uraikan bilangan menurut nilai tempatnya!</span>
                  </div>
                </div>
              )}
            </div>

            {/* LANGKAH 3: TOMBOL LATIHAN (AKSI UTAMA) */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3.5 px-4 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer font-fredoka"
              >
                <ArrowLeft size={14} /> Ganti Nama
              </button>

              <button
                type="button"
                onClick={handleGoToDigitStep}
                className="w-2/3 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-black py-3.5 px-5 rounded-2xl shadow-lg shadow-emerald-600/30 transition duration-200 transform active:scale-95 text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer font-fredoka"
              >
                <Play size={18} fill="currentColor" /> Tekan untuk Mulai Latihan 🚀
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[11px] text-slate-400 font-bold">
              <span>💡 Atau tekan</span>
              <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded-md text-[10px] font-mono font-black text-slate-700 shadow-2xs">Enter ↵</kbd>
              <span>untuk lanjut memilih digit</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* LANGKAH 4: INPUT DIGIT & OPERASI                                          */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="relative z-10 space-y-4 text-left">
            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
                Langkah 4: Pilih Operasi & Banyak Digit
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5 font-fredoka">
                Pilih Digit & Operasi Latihan
              </h2>
              <p className="text-slate-500 text-xs font-semibold mt-0.5">
                Pilih jenis operasi matematika dan tingkat digit yang ingin kamu kerjakan:
              </p>
            </div>

            {/* A. PILIH OPERASI MATEMATIKA */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                1. Pilih Operasi Matematika:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {operations.map((op) => {
                  const isSelected = selectedOp === op.id;
                  return (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setSelectedOp(op.id)}
                      className={`p-2 sm:p-2.5 rounded-2xl border-2 text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/90 shadow-sm ring-2 ring-blue-300"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-base font-black ${
                        isSelected ? "bg-blue-600 text-white shadow-2xs" : "bg-slate-100 text-slate-700"
                      }`}>
                        {op.symbol}
                      </span>
                      <span className="text-[11px] font-black text-slate-800 truncate w-full">{op.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* B. PILIH KOMBINASI DIGIT / NILAI TEMPAT */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                  2. Pilih Kombinasi Digit Nilai Tempat:
                </label>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  Pilihan: {selectedCombo}
                </span>
              </div>

              {/* Tombol Cepat 1 Digit, 2 Digit, 3 Digit */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCombo("S-S")}
                  className={`py-2 px-2.5 rounded-xl border-2 text-center font-bold text-xs transition cursor-pointer flex flex-col items-center ${
                    selectedCombo === "S-S"
                      ? "border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-300"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="font-fredoka font-black">1 Digit (SS)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Satuan & Satuan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCombo("P-P")}
                  className={`py-2 px-2.5 rounded-xl border-2 text-center font-bold text-xs transition cursor-pointer flex flex-col items-center ${
                    selectedCombo === "P-P"
                      ? "border-blue-600 bg-blue-50 text-blue-900 ring-2 ring-blue-300"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="font-fredoka font-black">2 Digit (PP)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Puluhan & Puluhan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCombo("R-R")}
                  className={`py-2 px-2.5 rounded-xl border-2 text-center font-bold text-xs transition cursor-pointer flex flex-col items-center ${
                    selectedCombo === "R-R"
                      ? "border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-300"
                      : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="font-fredoka font-black">3 Digit (RR)</span>
                  <span className="text-[10px] text-slate-500 font-medium">Ratusan & Ratusan</span>
                </button>
              </div>

              {/* Daftar 9 Kombinasi */}
              <div className="grid grid-cols-3 gap-1.5 max-h-[170px] overflow-y-auto pr-1">
                {combos.map((c) => {
                  const isSelected = selectedCombo === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedCombo(c.id)}
                      className={`p-2 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "border-blue-600 bg-blue-50 text-blue-900 font-black ring-1 ring-blue-400"
                          : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-black truncate">{c.code} - {c.label}</div>
                        <div className="text-[9px] text-slate-500 truncate">{c.example}</div>
                      </div>
                      {isSelected && <Check size={12} className="text-blue-600 shrink-0 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LANGKAH 5: TOMBOL MULAI LATIHAN DI PAPAN HITUNG */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3.5 px-4 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer font-fredoka"
              >
                <ArrowLeft size={14} /> Contoh Soal
              </button>

              <button
                type="button"
                onClick={handleFinish}
                className="w-2/3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3.5 px-5 rounded-2xl shadow-lg shadow-emerald-600/30 transition duration-200 transform active:scale-95 text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer font-fredoka"
              >
                Mulai Kerjakan di Papan Hitung 🚀
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 pt-0.5 text-[11px] text-slate-400 font-bold">
              <span>💡 Tekan</span>
              <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded-md text-[10px] font-mono font-black text-slate-700 shadow-2xs">Enter ↵</kbd>
              <span>untuk langsung mulai</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
