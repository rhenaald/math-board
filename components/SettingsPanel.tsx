"use client";

import React from "react";
import { Sliders, RefreshCw, Save, User, Clock, X } from "lucide-react";
import { OperationType } from "./SetupWizard";

type SimpleOperation = "+" | "-" | "×" | "÷";

interface SettingsPanelProps {
  currentUser: string;
  selectedOp: OperationType;
  currentOp: SimpleOperation;
  placeValueCombo: string;
  focusOption: string;
  practiceStats: {
    totalAnswered: number;
    correctCount: number;
    wrongCount: number;
    totalSeconds: number;
  };
  opNameMap: Record<SimpleOperation, string>;
  onSelectOp: (op: OperationType) => void;
  onComboChange: (combo: string) => void;
  onFocusOptionChange: (focus: string) => void;
  onNewProblem: () => void;
  onSaveAndFinishSession: () => void;
  onChangeSetup: () => void;
  onCloseSidebar?: () => void;
  formatTimer: (seconds: number) => string;
}

export default function SettingsPanel({
  currentUser,
  selectedOp,
  currentOp,
  placeValueCombo,
  focusOption,
  practiceStats,
  opNameMap,
  onSelectOp,
  onComboChange,
  onFocusOptionChange,
  onNewProblem,
  onSaveAndFinishSession,
  onChangeSetup,
  onCloseSidebar,
  formatTimer,
}: SettingsPanelProps) {
  const accuracy =
    practiceStats.totalAnswered > 0
      ? Math.round((practiceStats.correctCount / practiceStats.totalAnswered) * 100)
      : 100;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-5 w-full animate-in fade-in duration-200">
      {/* BRANDING & USER GREETING DIRECTLY IN SIDEBAR */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md shadow-blue-500/20 font-fredoka shrink-0">
            ÷×
          </div>
          <div>
            <h2 className="font-black text-base text-slate-900 tracking-tight leading-tight font-fredoka">
              Math Board
            </h2>
            <p id="user-greeting" className="text-xs text-slate-500 font-bold">
              Halo, {currentUser}! 👋
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onChangeSetup}
            className="text-[10px] font-extrabold px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            title="Ubah Alur / Nama / Operasi"
          >
            Ubah
          </button>
          {onCloseSidebar && (
            <button
              type="button"
              onClick={onCloseSidebar}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Tutup Menu Pengaturan"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* STATISTIK SESI LATIHAN */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Progres Latihan Sesi Ini
          </span>
          <span className="text-[11px] font-black text-indigo-700 flex items-center gap-1">
            <Clock size={12} /> {formatTimer(practiceStats.totalSeconds)}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Soal</span>
            <span className="text-base font-black text-slate-800 font-fredoka">{practiceStats.totalAnswered}</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Benar</span>
            <span className="text-base font-black text-emerald-600 font-fredoka">{practiceStats.correctCount}</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-slate-100">
            <span className="text-[9px] font-bold text-slate-400 uppercase block">Akurasi</span>
            <span className="text-base font-black text-blue-600 font-fredoka">{accuracy}%</span>
          </div>
        </div>
      </div>

      {/* OPERASI MATEMATIKA */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5">
          Operasi Latihan
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: "+", label: "Tambah", sym: "+" },
            { id: "-", label: "Kurang", sym: "−" },
            { id: "×", label: "Kali", sym: "×" },
            { id: "÷", label: "Bagi", sym: "÷" },
          ].map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => onSelectOp(op.id as OperationType)}
              className={`p-2.5 rounded-2xl border-2 font-extrabold flex flex-col items-center justify-center gap-1 transition ${
                selectedOp === op.id
                  ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              }`}
            >
              <span className="text-base font-black">{op.sym}</span>
              <span className={`text-[9px] font-bold ${selectedOp === op.id ? "text-blue-600" : "text-slate-400"}`}>
                {op.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* PILIH KOMBINASI NILAI TEMPAT (SS, SP, SR, PS, PP, PR, RS, RP, RR) */}
      <div>
        <label htmlFor="place-value-combo-select" className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2 font-fredoka">
          Pilih Kombinasi Nilai Tempat (SS, SP, SR, PS, PP, PR, RS, RP, RR)
        </label>
        <select
          id="place-value-combo-select"
          value={placeValueCombo}
          onChange={(e) => onComboChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition cursor-pointer"
        >
          <option value="ALL">🎲 Acak Semua Digit (Campuran)</option>
          <option value="R-P">RP – Ratusan & Puluhan</option>
          <option value="P-S">PS – Puluhan & Satuan</option>
          <option value="P-P">PP – Puluhan & Puluhan</option>
          <option value="R-S">RS – Ratusan & Satuan</option>
          <option value="S-S">SS – Satuan & Satuan</option>
          <option value="S-P">SP – Satuan & Puluhan</option>
          <option value="S-R">SR – Satuan & Ratusan</option>
          <option value="P-R">PR – Puluhan & Ratusan</option>
          <option value="R-R">RR – Ratusan & Ratusan</option>
        </select>
      </div>

      {/* FOKUS SOAL */}
      <div>
        <label htmlFor="focus-select" className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
          Karakteristik Soal Latihan
        </label>
        <select
          id="focus-select"
          value={focusOption}
          onChange={(e) => onFocusOptionChange(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        >
          <option value="random">🎲 Campuran Acak</option>
          <option value="no-carry">✨ Soal Dasar (Tanpa Simpan/Pinjam)</option>
          <option value="with-carry">🔥 Soal Tantangan (Dengan Simpan/Pinjam)</option>
        </select>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col gap-2.5 pt-2">
        <button
          onClick={onNewProblem}
          type="button"
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-3 px-4 rounded-2xl shadow-sm transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-fredoka"
        >
          <RefreshCw size={14} /> Acak Soal Baru
        </button>

        <button
          onClick={onSaveAndFinishSession}
          type="button"
          disabled={practiceStats.totalAnswered === 0}
          className={`w-full py-3 px-4 rounded-2xl shadow-sm transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-fredoka ${
            practiceStats.totalAnswered > 0
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 cursor-pointer"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
          title={
            practiceStats.totalAnswered === 0
              ? "Jawab minimal 1 soal untuk menyimpan sesi"
              : "Simpan rekaman latihan ke database guru"
          }
        >
          <Save size={14} /> Simpan & Selesaikan Sesi
        </button>
      </div>
    </div>
  );
}
