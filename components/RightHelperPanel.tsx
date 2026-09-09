"use client";

import React, { useState } from "react";
import {
  Lightbulb,
  Sparkles,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import BaseTenBlocksModal from "./BaseTenBlocksModal";

type SimpleOperation = "+" | "-" | "×" | "÷";

interface RightHelperPanelProps {
  currentOp?: SimpleOperation;
  num1?: number;
  num2?: number;
  activeStep?: number;
  onOpenMultiLevelHelp?: () => void;
  onSelectStrategy?: (strat: string) => void;
  isHighlighted?: boolean;
}

export default function RightHelperPanel({
  currentOp = "×",
  num1 = 5,
  num2 = 6,
  activeStep = 4,
  onOpenMultiLevelHelp,
  onSelectStrategy,
  isHighlighted = false,
}: RightHelperPanelProps) {
  const [helpLevel, setHelpLevel] = useState<1 | 2 | 3 | 4>(1);
  const [isBlocksModalOpen, setIsBlocksModalOpen] = useState<boolean>(false);

  // Decompose numbers for hint logic
  const u1 = num1 % 10;
  const t1 = Math.floor((num1 % 100) / 10);
  const u2 = num2 % 10;
  const t2 = Math.floor((num2 % 100) / 10);

  // Visual dot array for multiplication (Gambar 4)
  const renderVisualDots = () => {
    const groups = Math.min(Math.max(num1, 2), 6);
    const perGroup = Math.min(Math.max(num2, 1), 6);

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200/80">
        {Array.from({ length: groups }).map((_, gIdx) => (
          <div
            key={gIdx}
            className="p-1.5 bg-white rounded-xl border border-rose-200 shadow-2xs flex flex-col items-center gap-1"
          >
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: perGroup }).map((_, dIdx) => (
                <div key={dIdx} className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              ))}
            </div>
            <span className="text-[9px] font-black text-slate-500">
              Grup {gIdx + 1}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <aside className={`flex flex-col gap-4 w-full select-none ${isHighlighted ? "ring-2 ring-amber-400 rounded-3xl" : ""}`}>
      {/* KARTU BANTUAN BERTINGKAT 4 LEVEL (Sesuai Gambar 1, 2, 4) */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-200/90 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Lightbulb size={16} />
            </div>
            <div>
              <h3 className="font-black text-slate-900 font-fredoka text-base leading-none">
                Bantuan Bertingkat
              </h3>
              <span className="text-[10px] font-extrabold text-blue-600">
                Level {helpLevel} dari 4 Aktif
              </span>
            </div>
          </div>

          {onOpenMultiLevelHelp && (
            <button
              type="button"
              onClick={onOpenMultiLevelHelp}
              className="text-[11px] font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-200 cursor-pointer"
              title="Buka modal layar penuh"
            >
              Layar Penuh
            </button>
          )}
        </div>

        {/* Tabs 4 Level Bantuan Bertingkat */}
        <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-2xl">
          {[
            { lvl: 1 as const, label: "Lvl 1", desc: "Petunjuk" },
            { lvl: 2 as const, label: "Lvl 2", desc: "Visual" },
            { lvl: 3 as const, label: "Lvl 3", desc: "Langkah" },
            { lvl: 4 as const, label: "Lvl 4", desc: "Contoh" },
          ].map((item) => (
            <button
              key={item.lvl}
              type="button"
              onClick={() => setHelpLevel(item.lvl)}
              className={`py-1 px-1 rounded-xl text-center transition cursor-pointer flex flex-col items-center ${
                helpLevel === item.lvl
                  ? "bg-white text-blue-700 shadow-2xs font-black ring-1 ring-blue-300"
                  : "text-slate-600 hover:text-slate-900 font-bold"
              }`}
            >
              <span className="text-[11px] leading-tight">{item.label}</span>
              <span className="text-[8px] opacity-75">{item.desc}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Dinamis Sesuai Level Bantuan */}
        <div className="flex flex-col gap-2.5 pt-1">
          {/* LEVEL 1: PETUNJUK */}
          {helpLevel === 1 && (
            <div className="bg-blue-50/80 border border-blue-200/80 p-3 rounded-2xl text-xs text-blue-950 font-medium">
              <p className="font-black text-blue-900 mb-1 flex items-center gap-1">
                <span>💡 Level 1: Petunjuk Awal</span>
              </p>
              {currentOp === "×" && (
                <p>
                  Perkalian adalah penjumlahan berulang. {num1} × {num2} berarti angka {num2} dijumlahkan sebanyak {num1} kali.
                </p>
              )}
              {currentOp === "÷" && (
                <p>
                  Pecah bilangan menjadi ratusan, puluhan, dan satuan dulu. Lalu bagi setiap nilai tempat dengan {num2}.
                </p>
              )}
              {currentOp === "+" && (
                <p>
                  Jumlahkan kolom satuan terlebih dahulu: {u1} + {u2} = {u1 + u2}. Jika hasilnya &ge; 10, simpan 1 di atas kolom puluhan.
                </p>
              )}
              {currentOp === "-" && (
                <p>
                  Cek satuan: {u1} &minus; {u2}. Jika tidak cukup, kita tukar 1 puluhan dari angka {num1} menjadi 10 satuan.
                </p>
              )}
            </div>
          )}

          {/* LEVEL 2: VISUAL */}
          {helpLevel === 2 && (
            <div className="flex flex-col gap-2.5 bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-2xl">
              <p className="text-[11px] font-black text-emerald-900">
                📦 Level 2: Representasi Visual
              </p>
              {currentOp === "×" && renderVisualDots()}
              {currentOp === "÷" && (
                <div className="p-2 bg-white rounded-xl border border-emerald-200 text-center text-xs font-bold text-emerald-800">
                  Membagi {num1} menjadi {num2} kelompok bagian sama rata.
                </div>
              )}
              {currentOp === "+" && (
                <div className="p-2.5 bg-white rounded-xl border border-blue-200 text-center text-xs font-bold text-blue-900">
                  {u1 + u2 >= 10 ? `Simpan 1 puluhan di atas kolom puluhan!` : `Jumlahkan kolom satuan langsung.`}
                </div>
              )}
              {currentOp === "-" && (
                <div className="p-2.5 bg-white rounded-xl border border-rose-200 text-center text-xs font-bold text-rose-900">
                  {u1 < u2
                    ? `Setelah ditukar: ${t1 - 1} puluhan & ${u1 + 10} satuan`
                    : `Satuan cukup dikurangkan secara langsung.`}
                </div>
              )}

              {/* Tombol Balok 3D Nilai Tempat (Membuka Modal Lega) */}
              <button
                type="button"
                onClick={() => setIsBlocksModalOpen(true)}
                className="mt-1 text-[11px] font-black text-emerald-800 bg-white hover:bg-emerald-100/70 border border-emerald-300 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <span>📦</span>
                <span>Buka Laboratorium Balok 3D ↗</span>
              </button>
            </div>
          )}

          {/* LEVEL 3: LANGKAH */}
          {helpLevel === 3 && (
            <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-2xl text-xs text-slate-800">
              <p className="font-black text-amber-900 mb-1">📝 Level 3: Penjelasan Langkah</p>
              {currentOp === "×" && (
                <div className="font-mono font-bold text-slate-800 space-y-0.5">
                  <p>{Array.from({ length: Math.min(num1, 6) }).map(() => num2).join(" + ")}</p>
                  <p className="text-blue-600 font-black">= {num1 * num2}</p>
                </div>
              )}
              {currentOp === "÷" && (
                <div className="font-mono font-bold text-slate-800">
                  <p>{num1} ÷ {num2} = {Math.floor(num1 / num2)}</p>
                  <p className="text-purple-600 font-black">Cek: {Math.floor(num1 / num2)} × {num2} = {num1}</p>
                </div>
              )}
              {currentOp === "+" && (
                <div className="font-mono font-bold text-slate-800 space-y-0.5">
                  <p>Satuan: {u1} + {u2} = {u1 + u2}</p>
                  <p>Puluhan: {t1} + {t2} {u1 + u2 >= 10 ? "+ 1" : ""} = {t1 + t2 + (u1 + u2 >= 10 ? 1 : 0)}</p>
                </div>
              )}
              {currentOp === "-" && (
                <div className="font-mono font-bold text-slate-800 space-y-0.5">
                  <p>Satuan: {u1 < u2 ? `${u1 + 10} − ${u2} = ${u1 + 10 - u2}` : `${u1} − ${u2} = ${u1 - u2}`}</p>
                  <p>Puluhan: {u1 < u2 ? `${t1 - 1} − ${t2} = ${t1 - 1 - t2}` : `${t1} − ${t2} = ${t1 - t2}`}</p>
                </div>
              )}
            </div>
          )}

          {/* LEVEL 4: CONTOH & CEK */}
          {helpLevel === 4 && (
            <div className="bg-purple-50/80 border border-purple-200/80 p-3 rounded-2xl text-xs text-purple-950">
              <p className="font-black text-purple-900 mb-1">🎯 Level 4: Contoh & Cek Jawaban</p>
              <div className="font-mono font-black text-purple-800 bg-white p-2 rounded-xl border border-purple-100 text-center">
                {currentOp === "×" && `${num1} × ${num2} = ${num1 * num2}`}
                {currentOp === "÷" && `${num1} ÷ ${num2} = ${Math.floor(num1 / num2)} (Cek: ${Math.floor(num1 / num2)} × ${num2} = ${num1})`}
                {currentOp === "+" && `${num1} + ${num2} = ${num1 + num2} (Cek: ${num1 + num2} − ${num2} = ${num1})`}
                {currentOp === "-" && `${num1} − ${num2} = ${num1 - num2} (Cek: ${num1 - num2} + ${num2} = ${num1})`}
              </div>
            </div>
          )}
        </div>

        {/* Tombol Naikkan Level Bantuan (Step-by-Step Level Advance) */}
        <div className="flex items-center gap-2 pt-1">
          {helpLevel < 4 ? (
            <button
              type="button"
              onClick={() => setHelpLevel((prev) => (Math.min(prev + 1, 4) as 1 | 2 | 3 | 4))}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Naik ke Bantuan Level {helpLevel + 1}</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setHelpLevel(1)}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={13} />
              <span>Kembali ke Level 1</span>
            </button>
          )}
        </div>

        {/* Tombol Buka Modal Bantuan Layar Penuh */}
        {onOpenMultiLevelHelp && (
          <button
            type="button"
            onClick={onOpenMultiLevelHelp}
            className="w-full py-2 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200 rounded-2xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles size={14} className="text-blue-600" />
            <span>Buka Bantuan Bertingkat Layar Penuh</span>
          </button>
        )}
      </div>

      {/* 3. CATATAN PENTING */}
      <div className="bg-rose-50/70 border border-rose-200/80 rounded-3xl p-3.5 flex items-start gap-2.5">
        <AlertCircle size={17} className="text-rose-600 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <span className="font-black text-rose-900 block">Penting!</span>
          <span className="font-semibold text-rose-800">
            Setiap bilangan memiliki nilai tempat. Mengurai ratusan, puluhan, dan satuan membuat matematika jauh lebih mudah!
          </span>
        </div>
      </div>

      {/* 4. MODAL LABORATORIUM BALOK 3D LEGA */}
      <BaseTenBlocksModal
        isOpen={isBlocksModalOpen}
        onClose={() => setIsBlocksModalOpen(false)}
        num1={num1}
        num2={num2}
        operation={currentOp}
      />
    </aside>
  );
}
