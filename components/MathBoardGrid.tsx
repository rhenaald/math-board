"use client";

import React, { useRef, useEffect } from "react";
import { CheckCircle, AlertCircle } from "lucide-react";
import { OperationType } from "./SetupWizard";

type SimpleOperation = "+" | "-" | "×" | "÷";

interface DiagnosticHint {
  message: string;
  badge: string;
  color: string;
}

interface MathBoardGridProps {
  currentUser: string;
  selectedOp: OperationType;
  currentOp: SimpleOperation;
  placeValueCombo: string;
  num1: number;
  num2: number;
  carryValues: { th: string; h: string; t: string; u: string };
  setCarryValues: React.Dispatch<React.SetStateAction<{ th: string; h: string; t: string; u: string }>>;
  ansValues: { th: string; h: string; t: string; u: string };
  setAnsValues: React.Dispatch<React.SetStateAction<{ th: string; h: string; t: string; u: string }>>;
  onCheckAnswer: () => void;
  opNameMap: Record<SimpleOperation, string>;
  diagnosticHint?: DiagnosticHint | null;
}

export default function MathBoardGrid({
  currentUser,
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
  opNameMap,
  diagnosticHint,
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
    if (ansURef.current) {
      ansURef.current.focus();
    }
  }, [num1, num2, currentOp]);

  const handleAnsChange = (
    pos: "th" | "h" | "t" | "u",
    val: string,
    nextRef: React.RefObject<HTMLInputElement | null> | null
  ) => {
    const cleaned = val.replace(/[^0-9]/g, "");
    setAnsValues((prev) => ({ ...prev, [pos]: cleaned }));
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
    setCarryValues((prev) => ({ ...prev, [pos]: cleaned }));
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

      {/* MAIN TITLE */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-fredoka">
          Papan Hitung Nilai Tempat
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-0.5">
          Tuliskan jawaban per kolom nilai tempat. Gunakan kotak di atas jika ada angka simpanan atau pinjaman.
        </p>
      </div>

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
              className="board-cell-input w-full h-8 md:h-10 text-center font-bold text-slate-600 bg-white border border-amber-200 rounded-xl text-xs md:text-sm focus:outline-none transition"
              placeholder="0"
            />
            <input
              type="text"
              maxLength={2}
              ref={carryHRef}
              value={carryValues.h}
              onChange={(e) => handleCarryChange("h", e.target.value, carryThRef)}
              onKeyDown={(e) => handleCarryKeyDown(e, carryTRef)}
              className="board-cell-input w-full h-8 md:h-10 text-center font-bold text-slate-600 bg-white border border-indigo-200 rounded-xl text-xs md:text-sm focus:outline-none transition"
              placeholder="0"
            />
            <input
              type="text"
              maxLength={2}
              ref={carryTRef}
              value={carryValues.t}
              onChange={(e) => handleCarryChange("t", e.target.value, carryHRef)}
              onKeyDown={(e) => handleCarryKeyDown(e, carryURef)}
              className="board-cell-input w-full h-8 md:h-10 text-center font-bold text-slate-600 bg-white border border-emerald-200 rounded-xl text-xs md:text-sm focus:outline-none transition"
              placeholder="0"
            />
            <input
              type="text"
              maxLength={2}
              ref={carryURef}
              value={carryValues.u}
              onChange={(e) => handleCarryChange("u", e.target.value, carryTRef)}
              onKeyDown={(e) => handleCarryKeyDown(e, null)}
              className="board-cell-input w-full h-8 md:h-10 text-center font-bold text-slate-600 bg-white border border-rose-200 rounded-xl text-xs md:text-sm focus:outline-none transition"
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
              className="board-cell-input w-full h-10 md:h-14 text-center font-black text-lg md:text-2xl text-amber-900 bg-amber-50/30 border-2 border-amber-300 rounded-xl md:rounded-2xl focus:bg-white focus:outline-none transition"
              placeholder="?"
            />
            <input
              type="text"
              maxLength={1}
              ref={ansHRef}
              value={ansValues.h}
              onChange={(e) => handleAnsChange("h", e.target.value, ansThRef)}
              onKeyDown={(e) => handleAnsKeyDown(e, ansTRef)}
              className="board-cell-input w-full h-10 md:h-14 text-center font-black text-lg md:text-2xl text-indigo-900 bg-indigo-50/30 border-2 border-indigo-300 rounded-xl md:rounded-2xl focus:bg-white focus:outline-none transition"
              placeholder="?"
            />
            <input
              type="text"
              maxLength={1}
              ref={ansTRef}
              value={ansValues.t}
              onChange={(e) => handleAnsChange("t", e.target.value, ansHRef)}
              onKeyDown={(e) => handleAnsKeyDown(e, ansURef)}
              className="board-cell-input w-full h-10 md:h-14 text-center font-black text-lg md:text-2xl text-emerald-900 bg-emerald-50/30 border-2 border-emerald-300 rounded-xl md:rounded-2xl focus:bg-white focus:outline-none transition"
              placeholder="?"
            />
            <input
              type="text"
              maxLength={1}
              ref={ansURef}
              value={ansValues.u}
              onChange={(e) => handleAnsChange("u", e.target.value, ansTRef)}
              onKeyDown={(e) => handleAnsKeyDown(e, null)}
              className="board-cell-input w-full h-10 md:h-14 text-center font-black text-lg md:text-2xl text-rose-900 bg-rose-50/30 border-2 border-rose-300 rounded-xl md:rounded-2xl focus:bg-white focus:outline-none transition"
              placeholder="?"
            />
          </div>
        </div>
      </div>

      {/* DIAGNOSTIC ERROR FEEDBACK BANNER */}
      {diagnosticHint && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in duration-200 ${diagnosticHint.color}`}>
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 border border-current inline-block">
              {diagnosticHint.badge}
            </span>
            <p className="text-xs font-bold leading-relaxed">{diagnosticHint.message}</p>
          </div>
        </div>
      )}

      {/* ACTION BUTTON */}
      <div className="pt-2 flex justify-start">
        <button
          onClick={onCheckAnswer}
          type="button"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-8 rounded-2xl shadow-lg shadow-emerald-600/20 text-base transition flex items-center gap-2 transform active:scale-95"
        >
          <CheckCircle size={18} /> Periksa Jawaban
        </button>
      </div>
    </div>
  );
}
