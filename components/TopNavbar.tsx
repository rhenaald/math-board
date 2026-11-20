"use client";

import React from "react";
import {
  Lightbulb,
  Settings,
  LogOut,
  ChevronRight,
  BarChart2,
} from "lucide-react";

interface TopNavbarProps {
  currentUser: string;
  activeNav?: string;
  opLabel?: string;
  questionNumber?: number;
  score?: number;
  level?: number;
  onOpenSettings?: () => void;
  onLogout?: () => void;
  onNavigateHome?: () => void;
}

export default function TopNavbar({
  currentUser = "Dika",
  activeNav = "latihan",
  opLabel = "Perkalian",
  questionNumber = 1,
  score = 120,
  level = 1,
  onOpenSettings,
  onLogout,
  onNavigateHome,
}: TopNavbarProps) {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md rounded-2xl md:rounded-3xl p-2.5 md:px-5 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 select-none">
      {/* KIRI: BRANDING MATHKU + BREADCRUMBS */}
      <div className="flex items-center gap-3 md:gap-5 flex-wrap">
        <button
          type="button"
          onClick={onNavigateHome}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-sm shadow-amber-300/40 group-hover:scale-105 transition">
            <Lightbulb size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none font-fredoka flex items-center gap-1 group-hover:text-blue-600 transition">
              MathKu
            </h1>
            <p className="text-[10px] font-extrabold text-blue-600 tracking-wide mt-0.5">
              Belajar Pelan, Pasti Bisa!
            </p>
          </div>
        </button>

        {/* BREADCRUMBS (Sesuai Gambar 4: < Latihan > Perkalian > Soal 1) */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-slate-100/80 rounded-xl text-xs font-black text-slate-600">
          <span className="capitalize text-slate-500">
            {activeNav === "beranda" ? "Beranda" : activeNav === "belajar" ? "Belajar" : activeNav === "profil" ? "Profil" : "Latihan"}
          </span>
          {activeNav !== "beranda" && activeNav !== "profil" && (
            <>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="text-blue-600">{opLabel}</span>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="text-slate-800">
                {activeNav === "belajar" ? "Langkah Terpandu" : activeNav === "pilih-digit" ? "Pilih Digit" : `Soal ${questionNumber}`}
              </span>
            </>
          )}
        </div>
      </div>

      {/* KANAN: BINTANG, LEVEL, PROFIL SISWA & PENGATURAN */}
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        {/* ⭐ Bintang / Poin */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200/80 rounded-2xl shadow-2xs">
          <span className="text-sm">⭐</span>
          <span className="text-xs font-black text-amber-900 font-fredoka">
            {score}
          </span>
        </div>

        {/* 📊 Level */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 border border-sky-200/80 rounded-2xl shadow-2xs">
          <BarChart2 size={14} className="text-blue-600" />
          <span className="text-xs font-black text-blue-900 font-fredoka">
            Level {level}
          </span>
        </div>

        {/* User Greeting Card (Gambar 4) */}
        <div
          onClick={onLogout}
          className="flex items-center gap-2.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition cursor-pointer"
          title="Klik untuk ganti siswa atau setup awal"
        >
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-2xs">
            👦
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="text-xs font-black text-slate-900 font-fredoka">
              Halo, {currentUser || "Siswa"}!
            </div>
            <div className="text-[10px] font-bold text-slate-500">
              Terus berlatih, kamu pasti bisa!
            </div>
          </div>
        </div>

        {/* Tombol Pengaturan */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
          title="Pengaturan Mode & Level"
        >
          <Settings size={17} />
        </button>

        {/* Tombol Keluar / Ganti Setup */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black transition cursor-pointer"
          title="Ganti Siswa / Setup"
        >
          <LogOut size={14} />
          <span className="hidden md:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
