"use client";

import React from "react";
import { X, Box, Sparkles, CheckCircle2 } from "lucide-react";
import BaseTenBlocksVisualizer from "./BaseTenBlocksVisualizer";

interface BaseTenBlocksModalProps {
  isOpen: boolean;
  onClose: () => void;
  num1: number;
  num2: number;
  operation: "+" | "-" | "×" | "÷" | string;
}

export default function BaseTenBlocksModal({
  isOpen,
  onClose,
  num1,
  num2,
  operation,
}: BaseTenBlocksModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[28px] sm:rounded-[32px] shadow-2xl border border-slate-100 max-w-6xl w-[96vw] max-h-[92vh] flex flex-col overflow-hidden relative">
        {/* Latar Belakang Estetik */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-100/50 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

        {/* HEADER MODAL */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-gradient-to-r from-amber-50/80 via-white to-blue-50/80 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Box size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-800 font-fredoka">
                  Laboratorium Balok 3D Nilai Tempat
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[11px] flex items-center gap-1">
                  <Sparkles size={12} />
                  Ukuran Penuh
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold">
                Representasi konkret bilangan {num1} dan {num2} dengan kubus ribuan, lempeng ratusan, batang puluhan, dan kubus satuan.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Tutup Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY MODAL: VISUALISASI BALOK 3D SECARA LEGA */}
        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-auto flex-1 flex flex-col gap-4 relative z-10">
          <BaseTenBlocksVisualizer
            num1={num1}
            num2={num2}
            operation={operation}
            hideHeader={true}
          />
        </div>

        {/* FOOTER MODAL */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 relative z-10">
          <div className="text-xs text-slate-600 font-bold hidden sm:block">
            💡 Amati bentuk dan jumlah balok untuk membuktikan hasil hitunganmu!
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-auto px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/25 flex items-center gap-2 transition cursor-pointer"
          >
            <CheckCircle2 size={16} />
            <span>Paham, Kembali Berlatih</span>
          </button>
        </div>
      </div>
    </div>
  );
}
