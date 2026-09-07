"use client";

import React, { useState } from "react";
import { Lightbulb, Layers, LayoutGrid, Box, Repeat, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { GirlEncouragementCard } from "./ChildMascots";

type SimpleOperation = "+" | "-" | "×" | "÷";

interface RightHelperPanelProps {
  currentOp?: SimpleOperation;
  num1?: number;
  num2?: number;
  onSelectStrategy?: (strat: string) => void;
  isHighlighted?: boolean;
}

export default function RightHelperPanel({
  currentOp = "+",
  num1 = 45,
  num2 = 27,
  onSelectStrategy,
  isHighlighted = false,
}: RightHelperPanelProps) {
  const [activeStrategy, setActiveStrategy] = useState<string | null>("place-value");

  // Hitung dekomposisi untuk contoh langsung
  const u1 = num1 % 10;
  const t1 = Math.floor((num1 % 100) / 10);
  const h1 = Math.floor((num1 % 1000) / 100);

  const u2 = num2 % 10;
  const t2 = Math.floor((num2 % 100) / 10);
  const h2 = Math.floor((num2 % 1000) / 100);

  // Petunjuk Bertingkat dinamis
  const getSteps = () => {
    if (currentOp === "×") {
      return [
        `Pecah bilangan pertama (${num1}) menjadi ratusan, puluhan, dan satuan.`,
        `Kalikan setiap bagian dengan angka ${num2}.`,
        "Jumlahkan seluruh hasil kali bagian.",
        "Periksa kembali hasil akhirmu.",
      ];
    }
    if (currentOp === "÷") {
      return [
        `Bagi dari nilai tempat terbesar dengan angka ${num2}.`,
        "Tulis hasil bagi di atas kolom.",
        "Kurangkan dan turunkan angka berikutnya.",
        "Pastikan tidak ada sisa pembagian yang terlewat.",
      ];
    }
    if (currentOp === "-") {
      return [
        "Kurangkan mulai dari kolom Satuan paling kanan.",
        "Jika angka atas lebih kecil, pinjam 1 dari kolom Puluhan.",
        "Lanjutkan pengurangan ke kolom Puluhan dan Ratusan.",
        "Tulis hasil akhir dengan teliti.",
      ];
    }
    // Penjumlahan (Default)
    return [
      "Jumlahkan angka pada kolom Satuan terlebih dahulu.",
      "Jika hasilnya 10 atau lebih, simpan 1 di atas kolom Puluhan.",
      "Jumlahkan angka di kolom Puluhan beserta angka simpanannya.",
      "Kerjakan dengan tenang dan teliti.",
    ];
  };

  const steps = getSteps();

  const strategies = [
    {
      id: "place-value",
      label: "Pecah Nilai",
      sublabel: "Dekomposisi",
      icon: LayoutGrid,
      color: "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200",
      activeColor: "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300",
    },
    {
      id: "blocks",
      label: "Balok 3D",
      sublabel: "Alat Bantu",
      icon: Box,
      color: "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200",
      activeColor: "bg-amber-500 text-white border-amber-500 ring-2 ring-amber-300",
    },
    {
      id: "unit-first",
      label: "Fokus Satuan",
      sublabel: "Kolom Kanan",
      icon: Repeat,
      color: "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200",
      activeColor: "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300",
    },
    {
      id: "check",
      label: "Cek Balik",
      sublabel: "Pembuktian",
      icon: CheckCircle,
      color: "bg-purple-50 hover:bg-purple-100 text-purple-800 border-purple-200",
      activeColor: "bg-purple-600 text-white border-purple-600 ring-2 ring-purple-300",
    },
  ];

  const handleStrategyClick = (stratId: string) => {
    setActiveStrategy((prev) => (prev === stratId ? null : stratId));
    onSelectStrategy?.(stratId);
  };

  return (
    <aside
      className={`flex flex-col gap-3.5 w-full transition-all duration-300 ${
        isHighlighted ? "ring-4 ring-amber-400/80 rounded-3xl p-1 bg-amber-50/50" : ""
      }`}
    >
      {/* 1. KARTU PETUNJUK BERTINGKAT */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Lightbulb size={15} className="fill-amber-400" />
          </div>
          <h3 className="text-xs md:text-sm font-black text-slate-800 tracking-tight font-fredoka">
            Petunjuk Bertingkat
          </h3>
        </div>

        <div className="flex flex-col gap-2.5">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-2.5 text-xs font-bold text-slate-700">
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-fredoka">
                {idx + 1}
              </span>
              <span className="leading-snug">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. STRATEGI YANG BISA DIGUNAKAN (DENGAN INTERAKSI NYATA) */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
              <Sparkles size={14} />
            </div>
            <h3 className="text-xs md:text-sm font-black text-slate-800 tracking-tight font-fredoka">
              Strategi yang Bisa Digunakan
            </h3>
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
            Klik untuk Coba
          </span>
        </div>

        {/* 4 Pilihan Tombol Strategi */}
        <div className="grid grid-cols-2 gap-2">
          {strategies.map((strat) => {
            const Icon = strat.icon;
            const isSelected = activeStrategy === strat.id;
            return (
              <button
                key={strat.id}
                type="button"
                onClick={() => handleStrategyClick(strat.id)}
                className={`p-2.5 rounded-xl border flex flex-col items-start gap-0.5 transition cursor-pointer shadow-2xs ${
                  isSelected ? strat.activeColor : strat.color
                }`}
              >
                <div className="flex items-center gap-1.5 w-full">
                  <Icon size={14} className="shrink-0" />
                  <span className="text-xs font-black truncate">{strat.label}</span>
                </div>
                <span className={`text-[9px] font-semibold ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                  {strat.sublabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* KARTU PENERAPAN STRATEGI INTERAKTIF SECARA REAL-TIME */}
        {activeStrategy && (
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 space-y-2 animate-in fade-in zoom-in-95 duration-200">
            {/* 1. Dekomposisi / Pecah Angka */}
            {activeStrategy === "place-value" && (
              <div>
                <span className="font-black text-emerald-800 block text-xs font-fredoka mb-1 flex items-center gap-1">
                  <LayoutGrid size={13} /> Cara Dekomposisi {num1} dan {num2}:
                </span>
                <div className="space-y-1 bg-white p-2.5 rounded-xl border border-emerald-200 font-mono text-[11px]">
                  <div>
                    • <strong>{num1}</strong> ={" "}
                    {h1 > 0 ? `${h1 * 100} + ` : ""}
                    {t1 > 0 ? `${t1 * 10} + ` : ""}
                    {u1}
                  </div>
                  <div>
                    • <strong>{num2}</strong> ={" "}
                    {h2 > 0 ? `${h2 * 100} + ` : ""}
                    {t2 > 0 ? `${t2 * 10} + ` : ""}
                    {u2}
                  </div>
                  {currentOp === "+" && (
                    <div className="pt-1 border-t border-slate-100 text-emerald-700 font-bold">
                      👉 Gabungkan: Satuan ({u1 + u2}) + Puluhan ({(t1 + t2) * 10})
                      {h1 + h2 > 0 ? ` + Ratusan (${(h1 + h2) * 100})` : ""} = {num1 + num2}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Balok 3D */}
            {activeStrategy === "blocks" && (
              <div>
                <span className="font-black text-amber-800 block text-xs font-fredoka mb-1 flex items-center gap-1">
                  <Box size={13} /> Panduan Balok Nilai Tempat:
                </span>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Gunakan balok untuk membayangkan bilangan:
                </p>
                <div className="bg-white p-2 rounded-xl border border-amber-200 text-[11px] space-y-0.5 mt-1 font-bold text-amber-900">
                  <div>
                    • <strong>{num1}</strong>: {h1 > 0 ? `${h1} Ratusan, ` : ""}{t1 > 0 ? `${t1} Puluhan, ` : ""}{u1} Satuan
                  </div>
                  <div>
                    • <strong>{num2}</strong>: {h2 > 0 ? `${h2} Ratusan, ` : ""}{t2 > 0 ? `${t2} Puluhan, ` : ""}{u2} Satuan
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectStrategy?.("blocks")}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black font-fredoka text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                >
                  <Layers size={14} />
                  <span>Buka Balok 3D di Papan Soal</span>
                </button>
              </div>
            )}

            {/* 3. Fokus Satuan */}
            {activeStrategy === "unit-first" && (
              <div>
                <span className="font-black text-blue-800 block text-xs font-fredoka mb-1 flex items-center gap-1">
                  <Repeat size={13} /> Langkah Pertama: Kolom Satuan
                </span>
                <div className="bg-white p-2.5 rounded-xl border border-blue-200 text-[11px] space-y-1">
                  <div className="font-bold text-blue-900">
                    Hitung Satuan: {u1} {currentOp} {u2} ={" "}
                    {currentOp === "+" ? u1 + u2 : currentOp === "-" ? u1 - u2 : u1 * u2}
                  </div>
                  {currentOp === "+" && u1 + u2 >= 10 && (
                    <div className="text-amber-700 font-semibold leading-tight">
                      ⚠️ Karena hasilnya ≥ 10, tulis angka <strong>{(u1 + u2) % 10}</strong> di kolom satuan dan <strong>simpan 1</strong> di atas kolom puluhan!
                    </div>
                  )}
                  {currentOp === "-" && u1 < u2 && (
                    <div className="text-amber-700 font-semibold leading-tight">
                      ⚠️ Karena {u1} lebih kecil dari {u2}, pinjam 1 puluhan (10) sehingga menjadi {u1 + 10} − {u2} = {(u1 + 10) - u2}!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Cek Balik */}
            {activeStrategy === "check" && (
              <div>
                <span className="font-black text-purple-800 block text-xs font-fredoka mb-1 flex items-center gap-1">
                  <CheckCircle size={13} /> Cara Memeriksa Jawaban:
                </span>
                <div className="bg-white p-2.5 rounded-xl border border-purple-200 text-[11px] space-y-1 text-slate-700">
                  {currentOp === "+" && (
                    <p>
                      Kurangkan hasilmu dengan <strong>{num2}</strong>. Jika hasilnya tepat <strong>{num1}</strong>, maka jawabanmu 100% Benar!
                    </p>
                  )}
                  {currentOp === "-" && (
                    <p>
                      Tambahkan hasilmu dengan <strong>{num2}</strong>. Jika hasilnya tepat <strong>{num1}</strong>, jawabanmu Benar!
                    </p>
                  )}
                  {currentOp === "×" && (
                    <p>
                      Bagi hasilmu dengan <strong>{num2}</strong>. Hasil bagi harus sama dengan <strong>{num1}</strong>.
                    </p>
                  )}
                  {currentOp === "÷" && (
                    <p>
                      Kalikan hasilmu dengan <strong>{num2}</strong>. Hasil kali harus sama dengan <strong>{num1}</strong>.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. KARTU MOTIVASI "INGAT!" DENGAN MASKOT ANAK PEREMPUAN */}
      <GirlEncouragementCard />
    </aside>
  );
}
