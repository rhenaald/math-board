"use client";

import React, { useState } from "react";
import { Lightbulb } from "lucide-react";

export interface ColumnPlan {
  op: "+" | "-";
  top: number;
  bottom: number;
  isNegative: boolean;
  cols: number;
  topDigits: number[];
  bottomDigits: number[];
  topLen: number;
  bottomLen: number;
  resultDigits: number[];
  resultLen: number;
  carries: number[];
  newTop: (number | null)[];
  borrowedInto: boolean[];
  lentFrom: boolean[];
  result: number;
}

export interface PlanValidationResult {
  isCorrect: boolean;
  message: string;
  errorType?: string;
  errorDetail?: string;
  intervention?: string;
}

const PLACE_NAMES = ["Satuan", "Puluhan", "Ratusan", "Ribuan"];
const PLACE_ABBRS = ["S", "P", "R", "Th"];

const COLUMN_COLORS = [
  {
    head: "bg-amber-100 text-amber-900 border-amber-200",
    input: "border-amber-300 focus:border-amber-600 focus:ring-amber-100",
    ring: "ring-amber-300",
  },
  {
    head: "bg-emerald-100 text-emerald-900 border-emerald-200",
    input: "border-emerald-300 focus:border-emerald-600 focus:ring-emerald-100",
    ring: "ring-emerald-300",
  },
  {
    head: "bg-blue-100 text-blue-900 border-blue-200",
    input: "border-blue-300 focus:border-blue-600 focus:ring-blue-100",
    ring: "ring-blue-300",
  },
  {
    head: "bg-purple-100 text-purple-900 border-purple-200",
    input: "border-purple-300 focus:border-purple-600 focus:ring-purple-100",
    ring: "ring-purple-300",
  },
];

const getNumDigits = (n: number) => Math.max(1, Math.abs(n).toString().length);

const extractDigitsLE = (n: number, cols: number): number[] => {
  const digits: number[] = [];
  let temp = Math.abs(n);
  for (let i = 0; i < cols; i++) {
    digits.push(temp % 10);
    temp = Math.floor(temp / 10);
  }
  return digits;
};

/**
 * Menyusun rencana perhitungan bersusun kolom demi kolom
 */
export function buildPlan(num1: number, num2: number, op: "+" | "-"): ColumnPlan {
  const isNegative = op === "-" && num1 < num2;
  const top = isNegative ? num2 : num1;
  const bottom = isNegative ? num1 : num2;
  const result = op === "+" ? top + bottom : top - bottom;

  const cols = Math.max(getNumDigits(top), getNumDigits(bottom), getNumDigits(result));
  const topDigits = extractDigitsLE(top, cols);
  const bottomDigits = extractDigitsLE(bottom, cols);
  const resultDigits = extractDigitsLE(result, cols);

  const carries: number[] = new Array(cols).fill(0);
  const newTop: (number | null)[] = new Array(cols).fill(null);
  const borrowedInto: boolean[] = new Array(cols).fill(false);
  const lentFrom: boolean[] = new Array(cols).fill(false);

  if (op === "+") {
    let c = 0;
    for (let i = 0; i < cols; i++) {
      carries[i] = c;
      c = topDigits[i] + bottomDigits[i] + c >= 10 ? 1 : 0;
    }
  } else {
    const curTop = [...topDigits];
    for (let i = 0; i < cols; i++) {
      if (curTop[i] < bottomDigits[i]) {
        let f = i + 1;
        while (f < cols && curTop[f] === 0) f++;
        if (f < cols) {
          curTop[f] -= 1;
          lentFrom[f] = true;
          for (let d = f - 1; d > i; d--) {
            curTop[d] = 9;
            lentFrom[d] = true;
            borrowedInto[d] = true;
          }
          curTop[i] += 10;
          borrowedInto[i] = true;
        }
      }
    }
    for (let i = 0; i < cols; i++) {
      if (curTop[i] !== topDigits[i]) {
        newTop[i] = curTop[i];
      }
    }
  }

  return {
    op,
    top,
    bottom,
    isNegative,
    cols,
    topDigits,
    bottomDigits,
    topLen: getNumDigits(top),
    bottomLen: getNumDigits(bottom),
    resultDigits,
    resultLen: getNumDigits(result),
    carries,
    newTop,
    borrowedInto,
    lentFrom,
    result,
  };
}

const parseVal = (str?: string): number | null => {
  const s = (str || "").trim();
  if (s === "") return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
};

const getCalcErrorType = (colIdx: number) =>
  colIdx === 0
    ? "SALAH_HITUNG_SATUAN"
    : colIdx === 1
    ? "SALAH_HITUNG_PULUHAN"
    : "SALAH_HITUNG_RATUSAN";

/**
 * Validasi isian siswa pada papan bersusun
 */
export function validatePlan(
  plan: ColumnPlan,
  inputs: Record<string, string>
): PlanValidationResult {
  // Cek tanda minus jika hasil negatif
  if (plan.isNegative) {
    const sign = (inputs["st_sign"] || "").trim();
    if (sign !== "-" && sign !== "−") {
      return {
        isCorrect: false,
        message: `Hasilnya negatif karena ${plan.bottom} lebih kecil dari ${plan.top}. Klik kotak tanda di depan hasil untuk memberi tanda minus (−).`,
        errorType: "LUPA_TANDA_NEGATIF",
        errorDetail: `Siswa belum memberi tanda negatif pada hasil ${plan.bottom} − ${plan.top}.`,
        intervention:
          "Tunjukkan pada garis bilangan bahwa mengurangi dengan bilangan yang lebih besar menghasilkan bilangan negatif.",
      };
    }
  }

  // Operasi Penjumlahan (+)
  if (plan.op === "+") {
    for (let col = 0; col < plan.cols; col++) {
      const colName = PLACE_NAMES[col];

      // Periksa simpanan
      if (col >= 1) {
        const carryIn = parseVal(inputs[`st_c${col}`]);
        const expectedCarry = plan.carries[col];
        const actualCarry = carryIn === null ? 0 : carryIn;

        if (actualCarry !== expectedCarry) {
          const prevColName = PLACE_NAMES[col - 1];
          return expectedCarry === 1
            ? {
                isCorrect: false,
                message: `Jumlah kolom ${prevColName} 10 atau lebih. Tulis 1 (simpanan) di kotak kecil di atas kolom ${colName}.`,
                errorType: "LUPA_SIMPAN",
                errorDetail: `Siswa tidak menuliskan simpanan ke kolom ${colName}.`,
                intervention:
                  "Ingatkan: jika jumlah satu kolom ≥ 10, angka puluhannya disimpan ke kolom sebelah kiri.",
              }
            : {
                isCorrect: false,
                message: `Jumlah kolom ${prevColName} kurang dari 10, jadi tidak ada simpanan ke kolom ${colName}. Kosongkan kotak simpanannya.`,
                errorType: "SIMPAN_TIDAK_PERLU",
                errorDetail: `Siswa menulis simpanan yang tidak perlu di kolom ${colName}.`,
                intervention:
                  "Ajak siswa memeriksa apakah jumlah kolom sebelumnya sudah mencapai 10.",
              };
        }
      }

      // Periksa digit hasil
      if (col < plan.resultLen) {
        const ansIn = parseVal(inputs[`st_r${col}`]);
        if (ansIn !== plan.resultDigits[col]) {
          const tVal = plan.topDigits[col];
          const bVal = plan.bottomDigits[col];
          const cVal = plan.carries[col];
          const sumNoCarry = (tVal + bVal) % 10;

          if (ansIn === null) {
            return {
              isCorrect: false,
              message: `Kotak hasil kolom ${colName} masih kosong. Isi dulu ya!`,
            };
          }
          if (cVal === 1 && ansIn === sumNoCarry) {
            return {
              isCorrect: false,
              message: `Kolom ${colName}: jangan lupa tambahkan 1 simpanan yang ada di atasnya!`,
              errorType: "LUPA_SIMPAN",
              errorDetail: `Kolom ${colName}: ${tVal} + ${bVal} + 1 (simpanan), siswa menulis ${ansIn}.`,
              intervention:
                "Tekankan agar angka simpanan di atas kolom ikut dijumlahkan.",
            };
          }
          return {
            isCorrect: false,
            message: `Hitung lagi kolom ${colName}: ${tVal} + ${bVal}${
              cVal ? " + 1 (simpanan)" : ""
            }. Jika hasilnya 10 atau lebih, tulis angka satuannya saja di bawah.`,
            errorType: getCalcErrorType(col),
            errorDetail: `Kolom ${colName}: ${tVal} + ${bVal}${
              cVal ? " + 1" : ""
            }, siswa menulis ${ansIn}.`,
            intervention:
              "Bimbing siswa menjumlahkan kolom satu per satu dari kanan dengan bantuan balok.",
          };
        }
      }
    }
    return { isCorrect: true, message: "" };
  }

  // Operasi Pengurangan (−)
  for (let col = 0; col < plan.cols; col++) {
    const colName = PLACE_NAMES[col];

    // Cek peminjaman di kotak kecil atas
    if (col < plan.topLen) {
      const borrowIn = parseVal(inputs[`st_b${col}`]);
      const expectedNewTop = plan.newTop[col];

      if (expectedNewTop !== null && borrowIn !== expectedNewTop) {
        if (plan.borrowedInto[col] && !plan.lentFrom[col]) {
          return {
            isCorrect: false,
            message: `Kolom ${colName}: ${plan.topDigits[col]} lebih kecil dari ${plan.bottomDigits[col]}, jadi harus meminjam 1 dari kolom kirinya. Tulis angka barunya (${plan.topDigits[col]} + 10) di kotak kecil atas.`,
            errorType: "PENGURANGAN_TERBALIK",
            errorDetail: `Kolom ${colName} perlu meminjam, siswa belum menuliskan angka barunya.`,
            intervention:
              "Peragakan penukaran 1 batang puluhan menjadi 10 kubus satuan.",
          };
        }
        return {
          isCorrect: false,
          message: `Kolom ${colName} sudah dipinjam${
            plan.borrowedInto[col] ? " lalu meminjam lagi" : ""
          }. Tulis angka barunya di kotak kecil atas kolom ${colName}.`,
          errorType: "LUPA_KURANGI_PINJAMAN",
          errorDetail: `Siswa tidak memperbarui angka kolom ${colName} setelah dipinjam.`,
          intervention:
            "Biasakan siswa mencoret angka yang dipinjam dan menulis angka barunya di atas.",
        };
      }

      if (expectedNewTop === null && borrowIn !== null && borrowIn !== plan.topDigits[col]) {
        return {
          isCorrect: false,
          message: `Kolom ${colName} tidak perlu meminjam dan tidak dipinjam. Kosongkan kotak kecil di atasnya.`,
          errorType: "PINJAM_TIDAK_PERLU",
          errorDetail: `Siswa menulis peminjaman yang tidak perlu di kolom ${colName}.`,
          intervention:
            "Ajak siswa membandingkan dulu angka atas dan bawah sebelum meminjam.",
        };
      }
    }

    // Cek digit hasil
    const ansIn = parseVal(inputs[`st_r${col}`]);
    const correctAns = plan.resultDigits[col];

    if (col >= plan.resultLen) {
      if (ansIn !== null && ansIn !== 0) {
        return {
          isCorrect: false,
          message: `Kolom ${colName} hasilnya 0 (boleh dikosongkan). Periksa lagi ya!`,
        };
      }
      continue;
    }

    if (ansIn !== correctAns) {
      const p = plan.topDigits[col];
      const m = plan.bottomDigits[col];

      if (ansIn === null) {
        return {
          isCorrect: false,
          message: `Kotak hasil kolom ${colName} masih kosong. Isi dulu ya!`,
        };
      }

      if (plan.borrowedInto[col] && ansIn === Math.abs(p - m)) {
        return {
          isCorrect: false,
          message: `Kolom ${colName}: jangan dibalik (${m} − ${p}). Pinjam 1 dari kolom kiri dulu, lalu hitung ${
            plan.newTop[col] ?? p
          } − ${m}.`,
          errorType: "PENGURANGAN_TERBALIK",
          errorDetail: `Kolom ${colName}: siswa mengurangi terbalik tanpa meminjam (menulis ${ansIn}).`,
          intervention:
            "Tekankan bahwa angka atas selalu dikurangi angka bawah; jika kurang, pinjam dari kiri.",
        };
      }

      if (plan.lentFrom[col] && ansIn === p - m) {
        return {
          isCorrect: false,
          message: `Kolom ${colName} sudah dipinjam 1, jadi angkanya berkurang. Hitung dengan angka barunya ya!`,
          errorType: "LUPA_KURANGI_PINJAMAN",
          errorDetail: `Kolom ${colName}: siswa memakai angka awal ${p} padahal sudah dipinjam.`,
          intervention:
            "Biasakan siswa mencoret angka yang dipinjam dan menulis angka barunya.",
        };
      }

      return {
        isCorrect: false,
        message: `Hitung lagi kolom ${colName}: ${plan.newTop[col] ?? p} − ${m}.`,
        errorType: getCalcErrorType(col),
        errorDetail: `Kolom ${colName}: ${plan.newTop[col] ?? p} − ${m}, siswa menulis ${ansIn}.`,
        intervention:
          "Bimbing siswa mengurangi kolom satu per satu dari kanan dengan bantuan balok.",
      };
    }
  }

  return { isCorrect: true, message: "" };
}

const focusElementByKey = (key: string) => {
  setTimeout(() => {
    const el = document.querySelector<HTMLInputElement>(`[data-field-key="${key}"]`);
    if (el) {
      el.focus();
      el.select();
    }
  }, 20);
};

export interface MathBoardGridProps {
  plan: ColumnPlan;
  num1: number;
  num2: number;
  inputs: Record<string, string>;
  onInput: (field: string, val: string) => void;
  onEnter?: () => void;
}

export default function MathBoardGrid({
  plan,
  num1,
  num2,
  inputs,
  onInput,
  onEnter,
}: MathBoardGridProps) {
  const [activeCol, setActiveCol] = useState<number>(0);
  const isAdd = plan.op === "+";
  const opSymbol = isAdd ? "+" : "−";
  const colIndices = Array.from({ length: plan.cols }, (_, i) => plan.cols - 1 - i);

  const getNextFieldToLeft = (col: number) => {
    if (col + 1 >= plan.cols) return null;
    return isAdd ? `st_c${col + 1}` : `st_r${col + 1}`;
  };

  const handleFieldChange = (
    field: string,
    rawVal: string,
    maxLen: number,
    nextField: string | null
  ) => {
    const cleaned = rawVal.replace(/[^0-9]/g, "").slice(0, maxLen);
    onInput(field, cleaned);
    if (nextField && cleaned.length >= maxLen) {
      focusElementByKey(nextField);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter?.();
    }
  };

  const gridStyle = {
    gridTemplateColumns: `auto repeat(${plan.cols}, minmax(56px, 76px))`,
  };

  const signVal = (inputs["st_sign"] || "").trim();

  const renderColHint = (col: number) => {
    const colName = PLACE_NAMES[col];
    const topD = plan.topDigits[col];
    const botD = plan.bottomDigits[col];

    if (isAdd && col >= Math.max(plan.topLen, plan.bottomLen)) {
      return (
        <>
          Kolom <strong>{colName}</strong> tidak punya angka dari soal. Jika ada simpanan dari
          kolom kanannya, tulis angka simpanan itu sebagai hasil di kotak bawah.
        </>
      );
    }

    if (isAdd) {
      const nextColName = PLACE_NAMES[col + 1];
      return (
        <>
          Jumlahkan angka di kolom <strong>{colName}</strong>:{" "}
          <strong>
            {topD} + {botD}
          </strong>
          {col > 0 && " ditambah angka simpanan di atasnya (jika ada)"}.{" "}
          {nextColName ? (
            <>
              Jika hasilnya <strong>10 atau lebih</strong>, tulis angka satuannya di kotak bawah,
              lalu tulis <strong>1</strong> di kotak kecil <em>Simpan</em> di atas kolom{" "}
              {nextColName}.
            </>
          ) : (
            "Tulis hasilnya di kotak bawah."
          )}
        </>
      );
    }

    // Subtraction
    return (
      <>
        Kurangkan angka di kolom <strong>{colName}</strong>: angka atas dikurangi angka bawah (
        <strong>
          {topD} − {botD}
        </strong>
        {col > 0 && ", perhatikan jika angka atas sudah dipinjam"}). Jika angka atas{" "}
        <strong>lebih kecil</strong>, pinjam 1 dari kolom kirinya: angka kiri berkurang 1, angka
        kolom ini bertambah 10. Tulis angka-angka barunya di kotak kecil <em>Pinjam</em>.
      </>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {plan.isNegative && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5">
          <span className="text-xl">💡</span>
          <div className="text-xs sm:text-sm text-rose-900 leading-relaxed font-medium">
            <strong className="font-bold">Perhatikan:</strong> Angka pengurang ({num2}) lebih besar
            dari angka yang dikurangi ({num1}). Bilangan ditukar posisinya ({num2} − {num1}) untuk
            menghitung selisihnya, lalu klik kotak <strong className="font-bold">±</strong> di depan
            hasil untuk memberi tanda minus (hasilnya bernilai negatif).
          </div>
        </div>
      )}

      {/* Main Board */}
      <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-3 shadow-xs">
        <div className="text-center">
          <span className="text-xs sm:text-sm font-black text-slate-800 font-fredoka tracking-wide">
            Papan Hitung Bersusun
          </span>
          <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5">
            Kerjakan dari kolom paling kanan (Satuan) ke kiri
          </p>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-300 p-3 sm:p-5 shadow-sm">
          <div
            className="grid gap-x-2 sm:gap-x-3 gap-y-2 items-center text-center"
            style={gridStyle}
          >
            {/* Header: Kolom Place Names */}
            <div />
            {colIndices.map((col) => (
              <div
                key={`h-${col}`}
                className={`py-1.5 px-1 rounded-xl text-[11px] sm:text-sm font-black font-fredoka border shadow-2xs ${
                  COLUMN_COLORS[col].head
                } ${activeCol === col ? `ring-2 ${COLUMN_COLORS[col].ring}` : ""}`}
              >
                <span className="hidden sm:inline">{PLACE_NAMES[col]}</span>
                <span className="sm:hidden">{PLACE_ABBRS[col]}</span>
              </div>
            ))}

            {/* Row Simpan / Pinjam */}
            <div className="text-right text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400 pr-1">
              {isAdd ? "Simpan" : "Pinjam"}
            </div>
            {colIndices.map((col) => {
              if (isAdd) {
                if (col === 0) return <div key={`c-${col}`} />;
                const key = `st_c${col}`;
                return (
                  <div key={`c-${col}`} className="flex justify-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      data-field-key={key}
                      value={inputs[key] || ""}
                      onFocus={() => setActiveCol(col)}
                      onChange={(e) =>
                        handleFieldChange(key, e.target.value, 1, `st_r${col}`)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder=""
                      title={`Simpanan untuk kolom ${PLACE_NAMES[col]}`}
                      className="w-9 h-9 text-center font-black text-base font-fredoka bg-sky-50 border-2 border-dashed border-sky-300 text-sky-800 rounded-lg focus:border-sky-600 focus:bg-white outline-none transition"
                    />
                  </div>
                );
              }

              if (col >= plan.topLen) return <div key={`b-${col}`} />;
              const key = `st_b${col}`;
              return (
                <div key={`b-${col}`} className="flex justify-center">
                  <input
                    type="text"
                    inputMode="numeric"
                    data-field-key={key}
                    value={inputs[key] || ""}
                    onFocus={() => setActiveCol(col)}
                    onChange={(e) => handleFieldChange(key, e.target.value, 2, null)}
                    onKeyDown={handleKeyDown}
                    placeholder=""
                    title={`Angka baru kolom ${PLACE_NAMES[col]} setelah meminjam`}
                    className="w-11 h-9 text-center font-black text-base font-fredoka bg-orange-50 border-2 border-dashed border-orange-300 text-orange-800 rounded-lg focus:border-orange-600 focus:bg-white outline-none transition"
                  />
                </div>
              );
            })}

            {/* Row 1: Bilangan Atas */}
            <div className="flex items-center justify-end gap-2 pr-1">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {plan.isNegative ? "Ditukar" : "Bil. 1"}
              </span>
            </div>
            {colIndices.map((col) => {
              const hasDigit = col < plan.topLen;
              const hasBorrow = !isAdd && (inputs[`st_b${col}`] || "").trim() !== "";
              return (
                <div
                  key={`t-${col}`}
                  className={`h-12 sm:h-14 flex items-center justify-center rounded-2xl text-2xl sm:text-3xl font-black font-fredoka ${
                    activeCol === col ? "bg-yellow-50" : ""
                  } ${hasDigit ? "text-slate-800" : "text-transparent"}`}
                >
                  <span
                    className={
                      hasBorrow
                        ? "line-through decoration-rose-500 decoration-[3px] text-slate-400"
                        : ""
                    }
                  >
                    {hasDigit ? plan.topDigits[col] : "0"}
                  </span>
                </div>
              );
            })}

            {/* Row 2: Bilangan Bawah + Tanda Operasi */}
            <div className="flex items-center justify-end gap-2 pr-1">
              <span
                className={`w-6 h-6 rounded-lg ${
                  isAdd ? "bg-emerald-600" : "bg-orange-500"
                } text-white flex items-center justify-center text-sm font-black shadow-xs`}
              >
                {opSymbol}
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                {isAdd ? "Bil. 2" : "Pengurang"}
              </span>
            </div>
            {colIndices.map((col) => {
              const hasDigit = col < plan.bottomLen;
              return (
                <div
                  key={`bt-${col}`}
                  className={`h-12 sm:h-14 flex items-center justify-center rounded-2xl text-2xl sm:text-3xl font-black font-fredoka ${
                    activeCol === col ? "bg-yellow-50" : ""
                  } ${hasDigit ? "text-slate-800" : "text-transparent"}`}
                >
                  {hasDigit ? plan.bottomDigits[col] : "0"}
                </div>
              );
            })}

            {/* Separator */}
            <div className="col-span-full h-1.5 bg-slate-800 rounded-full my-1" />

            {/* Row 3: Hasil */}
            <div className="flex items-center justify-end pr-1">
              {plan.isNegative ? (
                <button
                  type="button"
                  onClick={() => onInput("st_sign", signVal ? "" : "-")}
                  title="Klik untuk memberi tanda minus"
                  className={`w-11 h-11 rounded-xl border-2 font-black text-2xl font-fredoka transition cursor-pointer ${
                    signVal
                      ? "bg-rose-100 border-rose-500 text-rose-700"
                      : "bg-white border-dashed border-rose-300 text-rose-300 hover:bg-rose-50"
                  }`}
                >
                  {signVal ? "−" : "±"}
                </button>
              ) : (
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-400">
                  Hasil
                </span>
              )}
            </div>
            {colIndices.map((col) => {
              const key = `st_r${col}`;
              return (
                <input
                  key={key}
                  type="text"
                  inputMode="numeric"
                  data-field-key={key}
                  value={inputs[key] || ""}
                  onFocus={() => setActiveCol(col)}
                  onChange={(e) =>
                    handleFieldChange(key, e.target.value, 1, getNextFieldToLeft(col))
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="?"
                  className={`w-full h-12 sm:h-14 text-center font-black text-xl sm:text-2xl font-fredoka bg-white border-2 text-slate-900 rounded-2xl focus:ring-4 outline-none transition placeholder:text-slate-300 shadow-2xs ${COLUMN_COLORS[col].input}`}
                />
              );
            })}
          </div>
        </div>

        {/* Petunjuk Kolom Aktif */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-yellow-50 border border-yellow-200 text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
          <Lightbulb size={18} className="text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-black text-yellow-900 block font-fredoka">
              Kolom {PLACE_NAMES[activeCol]}
            </span>
            {renderColHint(activeCol)}
          </div>
        </div>
      </div>
    </div>
  );
}
