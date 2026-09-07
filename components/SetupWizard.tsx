"use client";

import React, { useState } from "react";
import { User, ArrowRight, ArrowLeft, Check } from "lucide-react";

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

export default function SetupWizard({
  initialName = "",
  initialOp = "+",
  initialCombo = "P-P",
  onComplete,
}: SetupWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState(initialName);
  const [selectedOp, setSelectedOp] = useState<OperationType>(initialOp);
  const [selectedCombo, setSelectedCombo] = useState<string>(initialCombo);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleNextFromStep1 = () => {
    if (!name.trim()) {
      setErrorMsg("Silakan tuliskan nama Anda terlebih dahulu!");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleNextFromStep2 = () => {
    setStep(3);
  };

  const handleFinish = () => {
    onComplete(name.trim(), selectedOp, selectedCombo);
  };

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

  // 9 Pilihan Kombinasi Digit (SS, SP, SR, PS, PP, PR, RS, RP, RR - Tanpa Ribuan)
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

  return (
    <div id="setup-wizard-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 max-w-lg w-full p-6 md:p-8 text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-100/60 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-indigo-100/60 rounded-full blur-2xl pointer-events-none"></div>

        {/* Progress Stepper */}
        <div className="relative z-10 mb-6">
          <div className="flex items-center justify-between text-xs font-black text-slate-400 mb-2 font-fredoka">
            <span className={step >= 1 ? "text-blue-600 font-bold" : ""}>1. Nama Siswa</span>
            <span className={step >= 2 ? "text-blue-600 font-bold" : ""}>2. Pilih Operasi</span>
            <span className={step >= 3 ? "text-blue-600 font-bold" : ""}>3. Pilih Digit</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* STEP 1: INPUT NAMA */}
        {step === 1 && (
          <div className="relative z-10 space-y-5 text-left">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-400 rounded-2xl flex items-center justify-center mx-auto text-amber-950 shadow-lg shadow-amber-400/30 text-3xl">
              💡
            </div>

            <div className="text-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
                Langkah 1 dari 3: Nama Siswa
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
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-4 px-6 rounded-2xl shadow-lg shadow-blue-600/30 transition duration-200 transform active:scale-95 text-sm flex items-center justify-center gap-2"
            >
              Lanjut ke Pilih Operasi <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: PILIH OPERASI */}
        {step === 2 && (
          <div className="relative z-10 space-y-4 text-left">
            <div className="text-center mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
                Langkah 2 dari 3
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1 font-fredoka">
                Pilih Operasi Matematika
              </h2>
              <p className="text-slate-500 text-xs font-semibold">
                Halo <b>{name}</b>, pilih operasi yang ingin kamu latih:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {operations.map((op) => {
                const isSelected = selectedOp === op.id;
                return (
                  <button
                    key={op.id}
                    type="button"
                    onClick={() => setSelectedOp(op.id)}
                    className={`p-3.5 rounded-2xl border-2 text-left transition flex items-center justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/70 shadow-sm"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl font-black ${
                        isSelected ? "bg-blue-600 text-white shadow-xs" : "bg-slate-100 text-slate-700"
                      }`}>
                        {op.symbol}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">{op.title}</h4>
                        <p className="text-[11px] text-slate-500 font-semibold line-clamp-1">{op.desc}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3.5 px-4 rounded-2xl text-xs transition flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={14} /> Kembali
              </button>
              <button
                type="button"
                onClick={handleNextFromStep2}
                className="w-2/3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-blue-600/30 transition text-xs flex items-center justify-center gap-2"
              >
                Lanjut ke Pilih Nilai Tempat <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PILIH DIGIT (SS, SP, SR, PS, PP, PR, RS, RP, RR) */}
        {step === 3 && (
          <div className="relative z-10 space-y-4 text-left">
            <div className="text-center mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
                Langkah 3 dari 3: Pilih Digit
              </span>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1 font-fredoka">
                Pilih Kombinasi Digit
              </h2>
              <p className="text-slate-500 text-xs font-semibold">
                Pilih kombinasi digit bilangan (SS, SP, SR, PS, PP, PR, RS, RP, RR):
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-[310px] overflow-y-auto pr-1">
              {combos.map((c) => {
                const isSelected = selectedCombo === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCombo(c.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition flex flex-col justify-between gap-1.5 cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/90 shadow-sm ring-2 ring-blue-300"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${
                          isSelected ? "bg-blue-600 text-white shadow-2xs" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {c.code}
                      </span>
                      {isSelected && <Check size={14} className="text-blue-600 stroke-[3]" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{c.label}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{c.desc}</p>
                      <p className="text-[9px] text-blue-600 font-bold mt-0.5">{c.example}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3 px-4 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} /> Kembali
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="w-2/3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-3 px-4 rounded-2xl shadow-lg shadow-emerald-600/30 transition text-xs flex items-center justify-center gap-2 transform active:scale-95 cursor-pointer font-fredoka"
              >
                Mulai Latihan Sekarang 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
