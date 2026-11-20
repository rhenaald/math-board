"use client";

import React from "react";
import { RotateCcw } from "lucide-react";

export interface DigitComboSelectorRowProps {
  op: string;
  currentCombo?: string;
  onSelectCombo?: (combo: string) => void;
  onNewProblem?: () => void;
  accent?: "blue" | "purple";
}

const COMBOS = ["ALL", "S-S", "S-P", "S-R", "P-S", "P-P", "P-R", "R-S", "R-P", "R-R"];
const PLACE_LABELS: Record<string, string> = {
  S: "Satuan",
  P: "Puluhan",
  R: "Ratusan",
};

const getComboButtonLabel = (combo: string, op: string = "+") => {
  if (combo === "ALL") return "🎲 Acak Semua";
  const [p1, p2] = combo.split("-");
  const sym = op === "-" ? "−" : op;
  return `${combo} (${PLACE_LABELS[p1] || p1} ${sym} ${PLACE_LABELS[p2] || p2})`;
};

export default function DigitComboSelectorRow({
  op,
  currentCombo = "ALL",
  onSelectCombo,
  onNewProblem,
  accent = "blue",
}: DigitComboSelectorRowProps) {
  const activeClass =
    accent === "purple"
      ? "bg-purple-600 text-white border-purple-600 shadow-xs"
      : "bg-blue-600 text-white border-blue-600 shadow-xs";

  const hoverClass =
    accent === "purple"
      ? "hover:bg-purple-50 hover:text-purple-800"
      : "hover:bg-blue-50 hover:text-blue-800";

  return (
    <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-2.5 sm:p-3 flex flex-col gap-2 shadow-2xs">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span className="text-[11px] font-black uppercase text-slate-500 flex items-center gap-1">
          <span>📏</span> Pilih Digit Soal
        </span>

        {onNewProblem && (
          <button
            type="button"
            onClick={onNewProblem}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black text-xs font-fredoka transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Dapatkan soal baru dengan angka berbeda"
          >
            <RotateCcw size={13} />
            <span>Acak Soal Baru</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        {COMBOS.map((c) => {
          const isSelected = (currentCombo || "ALL") === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onSelectCombo && onSelectCombo(c)}
              className={`px-2.5 py-1.5 rounded-xl font-black text-xs font-fredoka border transition cursor-pointer ${
                isSelected
                  ? activeClass
                  : `bg-white text-slate-700 border-slate-200 ${hoverClass}`
              }`}
            >
              {c === "ALL" ? "🎲 Acak Semua" : getComboButtonLabel(c, op)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
