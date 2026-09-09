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

interface LeftSidebarNavProps {
  activeNav: "beranda" | "belajar" | "latihan" | "profil";
  onNavigate: (nav: "beranda" | "belajar" | "latihan" | "profil") => void;
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
      {/* 1. KARTU MENU NAVIGASI KIRI (Sesuai Gambar 4) */}
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

        {/* 📖 Belajar (Guided Step-by-Step) */}
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
          <span>Belajar</span>
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

          {/* Sub-menu Operasi (Penjumlahan, Pengurangan, Perkalian, Pembagian, Mode Campuran) */}
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
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                      isSelected
                        ? item.activeBg
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                        isSelected ? "bg-white/20 text-white" : item.color
                      }`}
                    >
                      <Icon size={12} className="stroke-[3]" />
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 📊 Profil Belajarku */}
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
          <span>Profil Belajarku</span>
        </button>

        {/* 🕒 Riwayat Latihan */}
        <button
          type="button"
          onClick={onOpenHistory}
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-100 transition cursor-pointer"
        >
          <History size={17} className="text-slate-500" />
          <span>Riwayat Latihan</span>
        </button>


        {/* 🔢 Dropdown Pilihan Digit (Collapsible) */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsDigitOpen(!isDigitOpen)}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition cursor-pointer text-xs font-black"
          >
            <div className="flex items-center gap-2">
              <Layers size={14} className="text-indigo-600" />
              <span>Digit: {placeValueCombo}</span>
            </div>
            <ChevronDown
              size={14}
              className={`transition-transform duration-200 ${isDigitOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isDigitOpen && (
            <div className="mt-1.5 max-h-48 overflow-y-auto space-y-1 p-0.5 animate-in fade-in duration-150">
              {digitCombinations.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    onSelectCombo?.(d.id);
                    setIsDigitOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-bold transition cursor-pointer ${
                    placeValueCombo === d.id
                      ? "bg-indigo-600 text-white font-black"
                      : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60"
                  }`}
                >
                  <span>{d.code} ({d.desc})</span>
                  {placeValueCombo === d.id && <span>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. MASKOT KARTU DI BAWAH SIDEBAR (Sesuai Gambar 4) */}
      <div className="bg-gradient-to-tr from-sky-50 via-blue-50 to-indigo-50 rounded-3xl p-4 border border-blue-200/80 shadow-xs flex flex-col items-center text-center gap-3 relative overflow-hidden">
        {/* Speech Bubble */}
        <div className="bg-white px-3 py-2 rounded-2xl border border-blue-200 shadow-2xs text-[11px] font-black text-slate-800 relative z-10 leading-snug">
          &quot;Sedikit demi sedikit, kamu pasti bisa!&quot;
          <div className="w-2.5 h-2.5 bg-white border-r border-b border-blue-200 transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
        </div>

        {/* Mascot Vector */}
        <div className="w-24 h-24 flex items-center justify-center">
          <BoyMascotVector size={92} />
        </div>
      </div>
    </aside>
  );
}
