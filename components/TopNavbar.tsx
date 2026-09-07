"use client";

import React from "react";
import {
  Lightbulb,
  Settings,
  LogOut,
} from "lucide-react";

interface TopNavbarProps {
  currentUser: string;
  onOpenSettings?: () => void;
  onLogout?: () => void;
}

export default function TopNavbar({
  currentUser = "Siswa",
  onOpenSettings,
  onLogout,
}: TopNavbarProps) {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md rounded-2xl md:rounded-3xl p-2.5 md:px-5 border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 select-none">
      {/* KIRI: BRANDING MATHKU DENGAN IKON BOHLAM */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-900 flex items-center justify-center shadow-sm shadow-amber-300/40 transform hover:scale-105 transition">
          <Lightbulb size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none font-fredoka flex items-center gap-1">
            MathKu
          </h1>
          <p className="text-[10px] font-extrabold text-blue-600 tracking-wide mt-0.5">
            Belajar Pelan, Pasti Bisa!
          </p>
        </div>
      </div>

      {/* KANAN: PROFIL SISWA, PENGATURAN, & TOMBOL KELUAR */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* User Card Ceria (Klik untuk ganti nama/operasi/satuan) */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-200/70 rounded-2xl transition cursor-pointer text-left group"
          title="Klik untuk ganti nama, operasi, atau satuan"
        >
          {/* Avatar Icon */}
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-xs group-hover:scale-105 transition">
            👦
          </div>
          <div className="leading-tight">
            <div className="text-xs font-black text-slate-900 font-fredoka group-hover:text-blue-600 transition">
              Halo, {currentUser || "Siswa"}!
            </div>
            <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
              Tetap semangat! <span className="text-xs">💪</span>
            </div>
          </div>
        </button>

        {/* Tombol Pengaturan */}
        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          title="Pengaturan Mode & Level"
        >
          <Settings size={17} />
        </button>

        {/* Tombol Keluar */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black transition"
          title="Ganti Siswa / Selesaikan Sesi"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}
