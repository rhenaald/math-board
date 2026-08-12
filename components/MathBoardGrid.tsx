import React, { useRef, useEffect } from "react";
import { CheckCircle, Lightbulb, LightbulbOff } from "lucide-react";

type SimpleOperation = "+" | "-" | "×" | "÷";
type Operation = "+" | "-" | "×" | "÷" | "mix";

interface MathBoardGridProps {
  currentMode: "latihan" | "kuis" | "admin";
  selectedOp: Operation;
  currentOp: SimpleOperation;
  placeValueCombo: string;
  num1: number;
  num2: number;
  carryValues: { th: string; h: string; t: string; u: string };
  setCarryValues: React.Dispatch<React.SetStateAction<{ th: string; h: string; t: string; u: string }>>;
  ansValues: { th: string; h: string; t: string; u: string };
  setAnsValues: React.Dispatch<React.SetStateAction<{ th: string; h: string; t: string; u: string }>>;
  onCheckAnswer: () => void;
  quizCurrentIndex: number;
  opNameMap: Record<SimpleOperation, string>;
  showSteps: boolean;
  setShowSteps: (val: boolean) => void;
  isReadOnly?: boolean;
  quizViewingIndex?: number | null;
  onReturnToActive?: () => void;
  historicalCorrectAnswer?: number;
}

export default function MathBoardGrid({
  currentMode,
  selectedOp,
  currentOp,
  placeValueCombo,
  num1,
  num2,
  carryValues,
  setCarryValues,
  ansValues,
  setAnsValues,
  onCheckAnswer,
  quizCurrentIndex,
  opNameMap,
  showSteps,
  setShowSteps,
  isReadOnly = false,
  quizViewingIndex = null,
  onReturnToActive,
  historicalCorrectAnswer,
}: MathBoardGridProps) {
  const carryThRef = useRef<HTMLInputElement>(null);
  const carryHRef = useRef<HTMLInputElement>(null);
  const carryTRef = useRef<HTMLInputElement>(null);
  const carryURef = useRef<HTMLInputElement>(null);

  const ansThRef = useRef<HTMLInputElement>(null);
  const ansHRef = useRef<HTMLInputElement>(null);
  const ansTRef = useRef<HTMLInputElement>(null);
  const ansURef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isReadOnly && ansURef.current) {
      ansURef.current.focus();
    }
  }, [num1, num2, currentOp, isReadOnly]);

  const handleAnsChange = (
    pos: "th" | "h" | "t" | "u",
    val: string,
    nextRef: React.RefObject<HTMLInputElement | null> | null
  ) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setAnsValues(prev => ({ ...prev, [pos]: cleaned }));
    if (cleaned.length > 0 && nextRef && nextRef.current) {
      nextRef.current.focus();
    }
  };

  const handleAnsKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    prevRef: React.RefObject<HTMLInputElement | null> | null
  ) => {
    if (e.key === "Backspace" && e.currentTarget.value === "" && prevRef && prevRef.current) {
      prevRef.current.focus();
    }
    if (e.key === "Enter") {
      onCheckAnswer();
    }
  };

  const handleCarryChange = (
    pos: "th" | "h" | "t" | "u",
    val: string,
    nextRef: React.RefObject<HTMLInputElement | null> | null
  ) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setCarryValues(prev => ({ ...prev, [pos]: cleaned }));
    if (cleaned.length > 0 && nextRef && nextRef.current) {
      nextRef.current.focus();
    }
  };

  const handleCarryKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    prevRef: React.RefObject<HTMLInputElement | null> | null
  ) => {
    if (e.key === "Backspace" && e.currentTarget.value === "" && prevRef && prevRef.current) {
      prevRef.current.focus();
    }
    if (e.key === "Enter") {
      onCheckAnswer();
    }
  };

  const getDigitVal = (number: number, pos: "u" | "t" | "h" | "th") => {
    const numStr = number.toString();
    const len = numStr.length;
    const posList: ("u" | "t" | "h" | "th")[] = ["u", "t", "h", "th"];
    const idx = posList.indexOf(pos);
    if (idx < len) {
      return numStr[len - 1 - idx];
    }
    return "-";
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm relative flex flex-col gap-6 w-full">
      {/* TOP BADGES & STEP TOGGLE BUTTON */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-black uppercase tracking-wider">
            {currentMode === "latihan"
              ? `🏋️ LATIHAN • ${selectedOp === "mix" ? "CAMPURAN" : opNameMap[currentOp].toUpperCase()}`
              : isReadOnly
                ? `👁️ RIWAYAT SOAL #${(quizViewingIndex ?? 0) + 1}`
                : `🏆 KUIS • SOAL #${quizCurrentIndex + 1}`}
          </span>
          <span className="px-3.5 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-black">
            🎯 {currentMode === "latihan"
              ? `Latihan ${selectedOp === "mix" ? "Campuran" : opNameMap[currentOp]} (${placeValueCombo.split("-")[0]} ke ${placeValueCombo.split("-")[1]})`
              : isReadOnly
                ? `Melihat Kembali Soal #${(quizViewingIndex ?? 0) + 1}`
                : "Soal Kuis Campuran Satuan-Ratusan"}
          </span>
        </div>

        {/* Step Toggle Button (Practice Mode Only) */}
        {currentMode === "latihan" && (
          <button
            onClick={() => setShowSteps(!showSteps)}
            type="button"
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-black flex items-center gap-1.5 transition"
          >
            {showSteps ? <LightbulbOff size={14} /> : <Lightbulb size={14} />}
            {showSteps ? "Sembunyikan Langkah" : "Langkah Penyelesaian"}
          </button>
        )}
      </div>

      {isReadOnly && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between text-xs text-amber-800 font-bold w-full">
          <span className="flex items-center gap-1.5">
            ⚠️ Anda sedang melihat hasil Soal #{(quizViewingIndex ?? 0) + 1} (Kunci Jawaban: {historicalCorrectAnswer})
          </span>
          <button
            onClick={onReturnToActive}
            type="button"
            className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl transition font-black uppercase text-[10px] shadow-sm"
          >
            Kembali ke Soal Aktif
          </button>
        </div>
      )}

      {/* MAIN TITLE */}
      <h2 className="text-2xl font-black text-slate-900 tracking-tight font-fredoka">
        Papan Hitung Nilai Tempat
      </h2>

      {/* MATH BOARD GRID TABLE */}
      <div className="w-full pb-2">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-2 md:gap-4">
          {/* COLUMNS HEADER */}
          <div className="grid grid-cols-5 gap-1.5 md:gap-3 text-center text-[10px] md:text-xs font-black">
            <div className="text-slate-300"></div>
            <div className="place-th py-1.5 md:py-2 rounded-xl border">
              <span className="hidden sm:inline">Ribuan (Th)</span>
              <span className="sm:hidden">Th</span>
            </div>
            <div className="place-h py-1.5 md:py-2 rounded-xl border">
              <span className="hidden sm:inline">Ratusan (R)</span>
              <span className="sm:hidden">R</span>
            </div>
            <div className="place-t py-1.5 md:py-2 rounded-xl border">
              <span className="hidden sm:inline">Puluhan (P)</span>
              <span className="sm:hidden">P</span>
            </div>
            <div className="place-u py-1.5 md:py-2 rounded-xl border">
              <span className="hidden sm:inline">Satuan (S)</span>
              <span className="sm:hidden">S</span>
            </div>
          </div>

          {/* ROW 0: SIMPAN / PINJAM */}
          <div className="grid grid-cols-5 gap-1.5 md:gap-3 items-center">
            <div className="text-right text-[9px] md:text-xs font-black text-slate-400 leading-tight">
              Simpan<br className="md:hidden" />/Pinjam
            </div>
            <input
              type="text"
              maxLength={2}
              ref={carryThRef}
              value={carryValues.th}
              onChange={(e) => handleCarryChange("th", e.target.value, null)}
              onKeyDown={(e) => handleCarryKeyDown(e, carryHRef)}
              disabled={isReadOnly}
              className="board-cell-input w-full h-8 md:h-10 text-center font-bold text-slate-600 bg-white border border-amber-200 rounded-xl text-xs md:text-sm focus:outline-none transition disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="0"
            />
            <input
              type="text"
              maxLength={2}
              ref={carryHRef}
              value={carryValues.h}
              onChange={(e) => handleCarryChange("h", e.target.value, carryThRef)}
              onKeyDown={(e) => handleCarryKeyDown(e, carryTRef)}
              disabled={isReadOnly}
              className="board-cell-input w-full h-8 md:h-10 text-center font-bold text-slate-600 bg-white border border-indigo-200 rounded-xl text-xs md:text-sm focus:outline-none transition disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="0"
            />
            <input
              type="text"
              maxLength={2}
              ref={carryTRef}
              value={carryValues.t}
              onChange={(e) => handleCarryChange("t", e.target.value, carryHRef)}
              onKeyDown={(e) => handleCarryKeyDown(e, carryURef)}
              disabled={isReadOnly}
              className="board-cell-input w-full h-8 md:h-10 text-center font-bold text-slate-600 bg-white border border-emerald-200 rounded-xl text-xs md:text-sm focus:outline-none transition disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="0"
            />
            <input
              type="text"
              maxLength={2}
              ref={carryURef}
              value={carryValues.u}
              onChange={(e) => handleCarryChange("u", e.target.value, carryTRef)}
              onKeyDown={(e) => handleCarryKeyDown(e, null)}
              disabled={isReadOnly}
              className="board-cell-input w-full h-8 md:h-10 text-center font-bold text-slate-600 bg-white border border-rose-200 rounded-xl text-xs md:text-sm focus:outline-none transition disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-50"
              placeholder="0"
            />
          </div>

          {/* ROW 1: FIRST NUMBER */}
          <div className="grid grid-cols-5 gap-1.5 md:gap-3 items-center text-center font-black text-xl md:text-3xl text-slate-800 my-1">
            <div></div>
            <div className="py-1 md:py-2 text-slate-800">{getDigitVal(num1, "th")}</div>
            <div className="py-1 md:py-2 text-slate-800">{getDigitVal(num1, "h")}</div>
            <div className="py-1 md:py-2 text-slate-800">{getDigitVal(num1, "t")}</div>
            <div className="py-1 md:py-2 text-slate-800">{getDigitVal(num1, "u")}</div>
          </div>

          {/* ROW 2: OPERATOR & SECOND NUMBER */}
          <div className="grid grid-cols-5 gap-1.5 md:gap-3 items-center text-center font-black text-xl md:text-3xl text-slate-800 my-1">
            <div className="text-blue-600 font-black text-2xl md:text-3xl flex items-center justify-center">
              {currentOp === "-" ? "−" : currentOp}
            </div>
            <div className="py-1 md:py-2 text-slate-800">{getDigitVal(num2, "th")}</div>
            <div className="py-1 md:py-2 text-slate-800">{getDigitVal(num2, "h")}</div>
            <div className="py-1 md:py-2 text-slate-800">{getDigitVal(num2, "t")}</div>
            <div className="py-1 md:py-2 text-slate-800">{getDigitVal(num2, "u")}</div>
          </div>

          {/* SEPARATOR LINE */}
          <div className="border-b-2 md:border-b-4 border-slate-900 rounded-full my-0.5 md:my-1"></div>

          {/* ROW 3: USER ANSWER INPUTS */}
          <div className="grid grid-cols-5 gap-1.5 md:gap-3 items-center">
            <div className="text-right text-[10px] md:text-xs font-black text-blue-600 leading-tight">Jawaban</div>
            <input
              type="text"
              maxLength={1}
              ref={ansThRef}
              value={ansValues.th}
              onChange={(e) => handleAnsChange("th", e.target.value, null)}
              onKeyDown={(e) => handleAnsKeyDown(e, ansHRef)}
              disabled={isReadOnly}
              className="board-cell-input w-full h-10 md:h-14 text-center font-black text-lg md:text-2xl text-amber-900 bg-amber-50/30 border-2 border-amber-300 rounded-xl md:rounded-2xl focus:bg-white focus:outline-none transition disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="?"
            />
            <input
              type="text"
              maxLength={1}
              ref={ansHRef}
              value={ansValues.h}
              onChange={(e) => handleAnsChange("h", e.target.value, ansThRef)}
              onKeyDown={(e) => handleAnsKeyDown(e, ansTRef)}
              disabled={isReadOnly}
              className="board-cell-input w-full h-10 md:h-14 text-center font-black text-lg md:text-2xl text-indigo-900 bg-indigo-50/30 border-2 border-indigo-300 rounded-xl md:rounded-2xl focus:bg-white focus:outline-none transition disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="?"
            />
            <input
              type="text"
              maxLength={1}
              ref={ansTRef}
              value={ansValues.t}
              onChange={(e) => handleAnsChange("t", e.target.value, ansHRef)}
              onKeyDown={(e) => handleAnsKeyDown(e, ansURef)}
              disabled={isReadOnly}
              className="board-cell-input w-full h-10 md:h-14 text-center font-black text-lg md:text-2xl text-emerald-900 bg-emerald-50/30 border-2 border-emerald-300 rounded-xl md:rounded-2xl focus:bg-white focus:outline-none transition disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="?"
            />
            <input
              type="text"
              maxLength={1}
              ref={ansURef}
              value={ansValues.u}
              onChange={(e) => handleAnsChange("u", e.target.value, ansTRef)}
              onKeyDown={(e) => handleAnsKeyDown(e, null)}
              disabled={isReadOnly}
              className="board-cell-input w-full h-10 md:h-14 text-center font-black text-lg md:text-2xl text-rose-900 bg-rose-50/30 border-2 border-rose-300 rounded-xl md:rounded-2xl focus:bg-white focus:outline-none transition disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-slate-100"
              placeholder="?"
            />
          </div>
        </div>
      </div>

      {/* ACTION BUTTON */}
      {!isReadOnly ? (
        <div className="pt-2 flex justify-start">
          <button
            onClick={onCheckAnswer}
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-8 rounded-2xl shadow-lg shadow-emerald-600/20 text-base transition flex items-center gap-2"
          >
            <CheckCircle size={18} /> Periksa Jawaban
          </button>
        </div>
      ) : (
        <div className="pt-2 flex justify-start">
          <button
            onClick={onReturnToActive}
            type="button"
            className="bg-amber-600 hover:bg-amber-700 text-white font-black py-3.5 px-8 rounded-2xl shadow-lg shadow-amber-600/20 text-base transition flex items-center gap-2"
          >
            Kembali ke Soal Aktif
          </button>
        </div>
      )}
    </div>
  );
}
