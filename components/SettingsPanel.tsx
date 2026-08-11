import React from "react";
import { Sliders, Play, RefreshCw, Timer } from "lucide-react";

type Operation = "+" | "-" | "×" | "÷" | "mix";
type SimpleOperation = "+" | "-" | "×" | "÷";

interface SettingsPanelProps {
  currentMode: "latihan" | "kuis" | "admin";
  selectedOp: Operation;
  currentOp: SimpleOperation;
  placeValueCombo: string;
  focusOption: string;
  quizTimerActive: boolean;
  quizCurrentIndex: number;
  quizLength: number;
  quizSecondsRemaining: number;
  opNameMap: Record<SimpleOperation, string>;
  onSelectOp: (op: Operation) => void;
  onPlaceValueChange: (combo: string) => void;
  onFocusOptionChange: (focus: string) => void;
  onStartQuiz: () => void;
  onNewProblem: () => void;
  formatTimer: (seconds: number) => string;
}

export default function SettingsPanel({
  currentMode,
  selectedOp,
  currentOp,
  placeValueCombo,
  focusOption,
  quizTimerActive,
  quizCurrentIndex,
  quizLength,
  quizSecondsRemaining,
  opNameMap,
  onSelectOp,
  onPlaceValueChange,
  onFocusOptionChange,
  onStartQuiz,
  onNewProblem,
  formatTimer,
}: SettingsPanelProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col gap-5">
      <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
        <Sliders size={18} className="text-blue-600" /> Pengaturan Soal
      </h2>

      {/* OPERASI MATEMATIKA */}
      <div>
        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
          Operasi Matematika
        </label>
        <div className="grid grid-cols-5 gap-1.5">
          {[
            { id: "+", label: "Tambah", sym: "+" },
            { id: "-", label: "Kurang", sym: "−" },
            { id: "×", label: "Kali", sym: "×" },
            { id: "÷", label: "Bagi", sym: "÷" },
            { id: "mix", label: "Campuran", sym: "🎲" },
          ].map((op) => (
            <button
              key={op.id}
              type="button"
              disabled={currentMode === "kuis" && quizTimerActive}
              onClick={() => onSelectOp(op.id as Operation)}
              className={`p-2.5 rounded-2xl border-2 font-extrabold flex flex-col items-center justify-center gap-1 transition ${
                selectedOp === op.id
                  ? "border-blue-600 bg-blue-50/50 text-blue-600"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
              } ${currentMode === "kuis" && quizTimerActive ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="text-lg font-black">{op.sym}</span>
              <span className={`text-[9px] font-bold ${selectedOp === op.id ? "text-blue-500" : "text-slate-400"}`}>
                {op.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* KOMBINASI NILAI TEMPAT (Latihan Mode Only) */}
      {currentMode === "latihan" && (
        <div>
          <label htmlFor="place-value-combo" className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
            Kombinasi Nilai Tempat
          </label>
          <select
            id="place-value-combo"
            value={placeValueCombo}
            onChange={(e) => onPlaceValueChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          >
            <option value="S-S">Satuan ke Satuan (1 digit & 1 digit)</option>
            <option value="P-S">Puluhan ke Satuan (2 digit & 1 digit)</option>
            <option value="S-P">Satuan ke Puluhan (1 digit & 2 digit)</option>
            <option value="P-P">Puluhan ke Puluhan (2 digit & 2 digit)</option>
            <option value="R-S">Ratusan ke Satuan (3 digit & 1 digit)</option>
            <option value="R-P">Ratusan ke Puluhan (3 digit & 2 digit)</option>
            <option value="S-R">Satuan ke Ratusan (1 digit & 3 digit)</option>
            <option value="P-R">Puluhan ke Ratusan (2 digit & 3 digit)</option>
            <option value="R-R">Ratusan ke Ratusan (3 digit & 3 digit)</option>
          </select>
        </div>
      )}

      {/* FOKUS SOAL LATIHAN (Latihan Mode Only) */}
      {currentMode === "latihan" && (
        <div id="focus-select-card">
          <label htmlFor="focus-select" className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
            Fokus Soal Latihan
          </label>
          <select
            id="focus-select"
            value={focusOption}
            onChange={(e) => onFocusOptionChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          >
            <option value="random">🎲 Campuran (Acak)</option>
            <option value="no-carry">✨ Soal Dasar (Tanpa Simpan/Pinjam)</option>
            <option value="with-carry">🔥 Soal Tantangan (Dengan Simpan/Pinjam)</option>
          </select>
        </div>
      )}

      {/* QUIZ CONFIGURATION (QUIZ MODE ONLY) */}
      {currentMode === "kuis" && (
        <div id="quiz-config-card" className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 flex flex-col gap-3">
          {!quizTimerActive ? (
            <>
              <div className="text-amber-900 text-xs font-bold leading-relaxed">
                Kuis ini mencakup <b>{quizLength} soal acak</b> dengan variasi angka dari <b>satuan hingga ratusan</b> dan campuran 4 operasi hitung. Waktu per soal akan dicatat.
              </div>
              <button
                onClick={onStartQuiz}
                type="button"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-3.5 rounded-xl shadow-md text-xs transition flex items-center justify-center gap-2 uppercase tracking-wider font-fredoka"
              >
                <Play size={12} className="fill-white" /> Mulai Kuis Sekarang
              </button>
            </>
          ) : (
            /* QUIZ PROGRESS BAR (QUIZ MODE ONLY) */
            <div id="quiz-progress-bar-container" className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col gap-2">
              <div className="flex justify-between items-center gap-2">
                <span id="quiz-question-indicator" className="text-xs font-black text-amber-800 uppercase tracking-wider">
                  Soal {quizCurrentIndex + 1} dari {quizLength}
                </span>
                <span
                  id="quiz-timer"
                  className={`text-xs font-black px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all duration-300 ${
                    quizSecondsRemaining <= 10
                      ? "text-white bg-rose-600 border-rose-700 animate-bounce shadow-md shadow-rose-600/30 scale-105"
                      : "text-red-600 bg-red-50 border-red-200 animate-pulse"
                  }`}
                >
                  <Timer size={12} className={quizSecondsRemaining <= 10 ? "animate-spin" : ""} /> ⏱️ {formatTimer(quizSecondsRemaining)}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  id="quiz-progress-fill"
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${(quizCurrentIndex / quizLength) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTION BUTTON (Latihan Mode Only) */}
      {currentMode === "latihan" && (
        <button
          onClick={onNewProblem}
          type="button"
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-3.5 px-4 rounded-2xl shadow-sm transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-fredoka"
        >
          <RefreshCw size={14} /> Acak Soal Baru
        </button>
      )}
    </div>
  );
}
