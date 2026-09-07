"use client";

import React from "react";
import { Lightbulb, Plus, LayoutGrid, Box, Repeat, Divide } from "lucide-react";
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
    { id: "place-value", label: "Nilai Tempat", icon: LayoutGrid, color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
    { id: "blocks", label: "Gambar/Blok", icon: Box, color: "bg-amber-50 text-amber-800 border-amber-200" },
    { id: "repeated", label: "Hitung Bertahap", icon: Repeat, color: "bg-blue-50 text-blue-800 border-blue-200" },
    { id: "sharing", label: "Bagi Rata", icon: Divide, color: "bg-purple-50 text-purple-800 border-purple-200" },
  ];

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

      {/* 2. STRATEGI YANG BISA DIGUNAKAN */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
            <Plus size={15} className="stroke-[3]" />
          </div>
          <h3 className="text-xs md:text-sm font-black text-slate-800 tracking-tight font-fredoka">
            Strategi yang Bisa Digunakan
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {strategies.map((strat) => {
            const Icon = strat.icon;
            return (
              <button
                key={strat.id}
                type="button"
                onClick={() => onSelectStrategy?.(strat.id)}
                className={`p-2 rounded-xl border flex items-center gap-1.5 text-[11px] font-black transition cursor-pointer hover:scale-102 ${strat.color}`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="truncate">{strat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. KARTU MOTIVASI "INGAT!" DENGAN MASKOT ANAK PEREMPUAN */}
      <GirlEncouragementCard />
    </aside>
  );
}
