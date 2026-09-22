"use client";

import React, { useState } from "react";
import {
  Home,
  BookOpen,
  Edit3,
  BarChart2,
  History,
  Plus,
  Minus,
  X,
  Divide,
  Shuffle,
  ChevronDown,
  Layers,
} from "lucide-react";
import { BoyMascotVector } from "./ChildMascots";
import { OperationType } from "./SetupWizard";

export type NavTab = "beranda" | "belajar" | "pilih-digit" | "latihan" | "profil";

interface LeftSidebarNavProps {
  activeNav: NavTab;
  onNavigate: (nav: NavTab) => void;
  selectedOp: OperationType;
  onSelectOp: (op: OperationType) => void;
  placeValueCombo?: string;
  onSelectCombo?: (combo: string) => void;
  onOpenHistory?: () => void;
}

export default function LeftSidebarNav({
  activeNav = "latihan",
  onNavigate,
  selectedOp = "+",
  onSelectOp,
  placeValueCombo = "P-P",
  onSelectCombo,
  onOpenHistory,
}: LeftSidebarNavProps) {
  const [isOpOpen, setIsOpOpen] = useState<boolean>(true);
  const [isDigitOpen, setIsDigitOpen] = useState<boolean>(false);

  const opSubItems = [
    {
      id: "+" as OperationType,
      label: "Penjumlahan",
      icon: Plus,
      color: "text-emerald-700 bg-emerald-100",
      activeBg: "bg-emerald-500 text-white shadow-xs shadow-emerald-400/30",
    },
    {
      id: "-" as OperationType,
      label: "Pengurangan",
      icon: Minus,
      color: "text-orange-700 bg-orange-100",
      activeBg: "bg-orange-500 text-white shadow-xs shadow-orange-400/30",
    },
    {
      id: "×" as OperationType,
      label: "Perkalian",
      icon: X,
      color: "text-rose-700 bg-rose-100",
      activeBg: "bg-rose-500 text-white shadow-xs shadow-rose-400/30",
    },
    {
      id: "÷" as OperationType,
      label: "Pembagian",
      icon: Divide,
      color: "text-purple-700 bg-purple-100",
      activeBg: "bg-purple-600 text-white shadow-xs shadow-purple-400/30",
    },
    {
      id: "mix" as OperationType,
      label: "Mode Campuran",
      icon: Shuffle,
      color: "text-teal-700 bg-teal-100",
      activeBg: "bg-teal-600 text-white shadow-xs shadow-teal-400/30",
    },
  ];

  const digitCombinations = [
    { id: "S-S", code: "SS", label: "Satuan & Satuan", desc: "Satuan & Satuan" },
    { id: "S-P", code: "SP", label: "Satuan & Puluhan", desc: "Satuan & Puluhan" },
    { id: "S-R", code: "SR", label: "Satuan & Ratusan", desc: "Satuan & Ratusan" },
    { id: "P-S", code: "PS", label: "Puluhan & Satuan", desc: "Puluhan & Satuan" },
    { id: "P-P", code: "PP", label: "Puluhan & Puluhan", desc: "Puluhan & Puluhan" },
    { id: "P-R", code: "PR", label: "Puluhan & Ratusan", desc: "Puluhan & Ratusan" },
    { id: "R-S", code: "RS", label: "Ratusan & Satuan", desc: "Ratusan & Satuan" },
    { id: "R-P", code: "RP", label: "Ratusan & Puluhan", desc: "Ratusan & Puluhan" },
    { id: "R-R", code: "RR", label: "Ratusan & Ratusan", desc: "Ratusan & Ratusan" },
  ];

  return (
    <aside className="flex flex-col gap-4 w-full select-none">
      {/* 1. KARTU MENU NAVIGASI KIRI */}
      <div className="bg-white rounded-3xl p-3 md:p-3.5 border border-slate-200/90 shadow-xs flex flex-col gap-1.5">
        {/* 🏠 Beranda */}
        <button
          type="button"
          onClick={() => onNavigate("beranda")}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
            activeNav === "beranda"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Home size={17} className={activeNav === "beranda" ? "text-white" : "text-slate-500"} />
          <span>Beranda</span>
        </button>

        {/* 📖 Contoh Soal (Bahan Belajar) */}
        <button
          type="button"
          onClick={() => onNavigate("belajar")}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
            activeNav === "belajar"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <BookOpen size={17} className={activeNav === "belajar" ? "text-white" : "text-slate-500"} />
          <span>Contoh Soal (Belajar)</span>
        </button>

        {/* 🔢 Pilih Digit & Operasi */}
        <button
          type="button"
          onClick={() => onNavigate("pilih-digit")}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
            activeNav === "pilih-digit"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <Layers size={17} className={activeNav === "pilih-digit" ? "text-white" : "text-slate-500"} />
          <span>Pilih Digit</span>
        </button>

        {/* ✏️ Latihan (Aktif dengan Submenu) */}
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => {
              onNavigate("latihan");
              setIsOpOpen(!isOpOpen);
            }}
            className={`flex items-center justify-between w-full px-3.5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
              activeNav === "latihan"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <Edit3 size={17} className={activeNav === "latihan" ? "text-white" : "text-slate-500"} />
              <span>Latihan</span>
            </div>
            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${isOpOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Sub-menu Operasi */}
          {isOpOpen && (
            <div className="pl-2 pr-1 py-1 flex flex-col gap-1 animate-in fade-in slide-in-from-top-1 duration-150">
              {opSubItems.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedOp === item.id && activeNav === "latihan";
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onNavigate("latihan");
                      onSelectOp(item.id);
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                      isSelected
                        ? item.activeBg
                        : "text-slate-600 hover:bg-slate-100/90"
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black ${
                      isSelected ? "bg-white/20 text-white" : item.color
                    }`}>
                      <Icon size={12} strokeWidth={3} />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 📊 Profil Siswa */}
        <button
          type="button"
          onClick={() => onNavigate("profil")}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer ${
            activeNav === "profil"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25"
              : "text-slate-700 hover:bg-slate-100"
          }`}
        >
          <BarChart2 size={17} className={activeNav === "profil" ? "text-white" : "text-slate-500"} />
          <span>Profil & Riwayat</span>
        </button>
      </div>

      {/* 2. CARD MASKOT MOTIVASI ANAK */}
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white rounded-3xl p-4 border border-blue-100/80 shadow-xs flex flex-col items-center text-center gap-2">
        <div className="w-20 h-20">
          <BoyMascotVector size={80} />
        </div>
        <div className="text-xs font-black text-slate-800 font-fredoka">
          Belajar Pelan, Pasti Bisa!
        </div>
        <p className="text-[11px] text-slate-500 font-bold leading-tight">
          Pahami konsep nilai tempat lewat contoh soal, lalu latih di papan hitung!
        </p>
      </div>
    </aside>
  );
}
