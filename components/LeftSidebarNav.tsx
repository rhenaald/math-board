"use client";

import React, { useState } from "react";
import {
  Home,
  LayoutGrid,
  Layers,
  BookOpen,
  History,
  Plus,
  Minus,
  X,
  Divide,
  Shuffle,
  ChevronDown,
} from "lucide-react";
import { BoySidebarCard } from "./ChildMascots";
import { OperationType } from "./SetupWizard";

interface LeftSidebarNavProps {
  selectedOp: OperationType;
  onSelectOp: (op: OperationType) => void;
  placeValueCombo?: string;
  onSelectCombo?: (combo: string) => void;
  targetProgress?: number;
  targetTotal?: number;
  onOpenHistory?: () => void;
  onOpenConcept?: () => void;
}

export default function LeftSidebarNav({
  selectedOp,
  onSelectOp,
  placeValueCombo = "P-P",
  onSelectCombo,
  targetProgress = 3,
  targetTotal = 5,
  onOpenHistory,
  onOpenConcept,
}: LeftSidebarNavProps) {
  const [isOpOpen, setIsOpOpen] = useState<boolean>(true);
  const [isDigitOpen, setIsDigitOpen] = useState<boolean>(true);

  const opSubItems = [
    { id: "+" as OperationType, label: "Penjumlahan", icon: Plus, color: "text-emerald-600 bg-emerald-100" },
    { id: "-" as OperationType, label: "Pengurangan", icon: Minus, color: "text-orange-600 bg-orange-100" },
    { id: "×" as OperationType, label: "Perkalian", icon: X, color: "text-rose-600 bg-rose-100" },
    { id: "÷" as OperationType, label: "Pembagian", icon: Divide, color: "text-purple-600 bg-purple-100" },
    { id: "mix" as OperationType, label: "Mode Campuran", icon: Shuffle, color: "text-teal-600 bg-teal-100" },
  ];

  // 9 Kombinasi Digit Lengkap dengan Nama dan Keterangan yang Jelas Dibaca
  const digitCombinations = [
    { id: "S-S", code: "SS", label: "Satuan & Satuan", desc: "1 Digit & 1 Digit" },
    { id: "S-P", code: "SP", label: "Satuan & Puluhan", desc: "1 Digit & 2 Digit" },
    { id: "S-R", code: "SR", label: "Satuan & Ratusan", desc: "1 Digit & 3 Digit" },
    { id: "P-S", code: "PS", label: "Puluhan & Satuan", desc: "2 Digit & 1 Digit" },
    { id: "P-P", code: "PP", label: "Puluhan & Puluhan", desc: "2 Digit & 2 Digit" },
    { id: "P-R", code: "PR", label: "Puluhan & Ratusan", desc: "2 Digit & 3 Digit" },
    { id: "R-S", code: "RS", label: "Ratusan & Satuan", desc: "3 Digit & 1 Digit" },
    { id: "R-P", code: "RP", label: "Ratusan & Puluhan", desc: "3 Digit & 2 Digit" },
    { id: "R-R", code: "RR", label: "Ratusan & Ratusan", desc: "3 Digit & 3 Digit" },
  ];

  return (
    <aside className="flex flex-col gap-4 w-full select-none">
      {/* 1. KARTU MENU NAVIGASI KIRI */}
      <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-4 border border-slate-200/80 shadow-xs flex flex-col gap-2">
        {/* Beranda */}
        <button
          type="button"
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <Home size={16} className="text-slate-500" />
          <span>Beranda</span>
        </button>

        {/* 1. Latihan Operasi (Collapsible with Arrow) */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => setIsOpOpen(!isOpOpen)}
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-2xl text-xs font-black bg-blue-600 text-white shadow-sm shadow-blue-500/25 hover:bg-blue-700 transition cursor-pointer"
            title={isOpOpen ? "Tutup pilihan operasi" : "Buka pilihan operasi"}
          >
            <div className="flex items-center gap-2.5">
              <LayoutGrid size={16} />
              <span>Latihan Operasi</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                {opSubItems.find((o) => o.id === selectedOp)?.label.slice(0, 6) || "Operasi"}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isOpOpen ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          {/* Sub-item Operasi */}
          {isOpOpen && (
            <div className="pl-1 pr-1 py-1 flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-150">
              {opSubItems.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedOp === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectOp(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? "bg-slate-100 text-slate-900 font-black shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${item.color}`}>
                      <Icon size={12} className="stroke-[3]" />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. PILIH DIGIT BILANGAN (Collapsible with Arrow & Clear Readable Full Names) */}
        <div className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsDigitOpen(!isDigitOpen)}
            className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-2xl bg-indigo-600 text-white shadow-sm shadow-indigo-500/25 hover:bg-indigo-700 transition cursor-pointer"
            title={isDigitOpen ? "Tutup pilihan digit" : "Buka pilihan digit"}
          >
            <div className="flex items-center gap-2">
              <Layers size={16} />
              <span className="text-xs font-black font-fredoka">Pilih Digit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black bg-white/20 px-2 py-0.5 rounded-full font-mono">
                {digitCombinations.find((d) => d.id === placeValueCombo)?.code || "PP"}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${isDigitOpen ? "rotate-180" : ""}`}
              />
            </div>
          </button>

          {/* Daftar Lengkap Digit yang Mudah Dibaca Siswa */}
          {isDigitOpen && (
            <div className="max-h-72 overflow-y-auto space-y-1.5 p-0.5 pr-1 animate-in fade-in slide-in-from-top-1 duration-150">
              {digitCombinations.map((d) => {
                const isSelected = placeValueCombo === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => onSelectCombo?.(d.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer border ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs ring-1 ring-indigo-400"
                        : "bg-slate-50/70 hover:bg-white hover:border-slate-300 border-slate-200/80 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black font-fredoka shrink-0 shadow-2xs ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200/80 text-slate-700"
                        }`}
                      >
                        {d.code}
                      </span>
                      <div className="flex flex-col min-w-0 leading-tight">
                        <span className="text-xs font-black text-slate-800">
                          {d.label}
                        </span>
                        <span
                          className={`text-[10px] ${
                            isSelected ? "text-indigo-600 font-bold" : "text-slate-500 font-medium"
                          }`}
                        >
                          {d.desc}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-xs text-indigo-600 font-black shrink-0 ml-1">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Belajar Konsep */}
        <button
          type="button"
          onClick={onOpenConcept}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <BookOpen size={16} className="text-slate-500" />
          <span>Belajar Konsep</span>
        </button>

        {/* Riwayat Belajar */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <History size={16} className="text-slate-500" />
          <span>Riwayat Belajar</span>
        </button>
      </div>

      {/* 2. MASKOT ANAK LAKI-LAKI + TARGET HARI INI */}
      <BoySidebarCard targetProgress={targetProgress} targetTotal={targetTotal} />
    </aside>
  );
}
