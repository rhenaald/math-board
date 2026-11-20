"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Volume2,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Box,
  Check,
  Award,
} from "lucide-react";
import { GirlMascotVector } from "./ChildMascots";
import BaseTenBlocksVisualizer, { UnitCube3D, TenRod3D, HundredFlat3D } from "./BaseTenBlocksVisualizer";
import { getSectionNamesForOp, type SectionDiagnostic } from "@/lib/errorDiagnostics";
import PorogapitDivisionBoard from "./PorogapitDivisionBoard";
import MathBoardGrid, { buildPlan, validatePlan } from "./MathBoardGrid";
import DigitComboSelectorRow from "./DigitComboSelectorRow";

type SimpleOperation = "+" | "-" | "×" | "÷";

interface PracticeCardProps {
  num1: number;
  num2: number;
  currentOp: SimpleOperation;
  levelName: string;
  questionNumber: number;
  totalQuestions: number;
  onQuestionCompleted: (isAllCorrect: boolean, sections: SectionDiagnostic[]) => void;
  onNewProblem: () => void;
  onBack?: () => void;
  onSectionChanged?: (secId: number) => void;
  onFinishSession?: () => void;
  hasAnsweredAny?: boolean;
  isAutoSaving?: boolean;
  currentCombo?: string;
  onSelectCombo?: (combo: string) => void;
}

/**
 * Komponen balok 3D untuk hasil perkalian:
 * Setiap 10 kubus diwakili oleh 1 batang puluhan (emerald).
 * Sisa satuan ("buntutan", misal 142 -> 2 satuan) diwakili oleh kubus satuan (amber/emas).
 */
function MultiplicationProductBlocks3D({ val }: { val: number }) {
  if (val <= 0) {
    return (
      <div className="w-full bg-slate-50/60 border border-slate-100 rounded-xl p-2.5 min-h-[80px] flex items-center justify-center">
        <span className="text-xs font-semibold text-slate-400 font-fredoka">0 (Tidak ada balok)</span>
      </div>
    );
  }

  const rods = Math.floor(val / 10);
  const units = val % 10;
  const rodHeight = rods > 20 ? 54 : rods > 12 ? 64 : 74;

  return (
    <div className="w-full bg-slate-50/70 border border-slate-200/60 rounded-xl p-2.5 sm:p-3 min-h-[96px] flex flex-col items-center justify-center gap-2">
      <div className="flex flex-wrap items-end justify-center gap-1.5 sm:gap-2 max-w-[340px] max-h-[140px] overflow-y-auto p-1">
        {/* Batang puluhan (masing-masing 10 kubus) */}
        {Array.from({ length: rods }).map((_, i) => (
          <TenRod3D key={`rod-${i}`} height={rodHeight} variant="emerald" />
        ))}
        {/* Buntutan kubus satuan dengan warna berbeda (amber/emas) */}
        {units > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1 p-1 bg-amber-50/80 rounded-lg border border-amber-200/80">
            {Array.from({ length: units }).map((_, i) => (
              <UnitCube3D key={`unit-${i}`} size={16} />
            ))}
          </div>
        )}
      </div>

      <div className="text-[11px] font-semibold text-center leading-tight">
        {rods > 0 && units > 0 ? (
          <span className="text-slate-600">
            <span className="text-emerald-700 font-bold">{rods} batang puluhan</span> +{" "}
            <span className="text-amber-700 font-bold">{units} kubus satuan</span>
          </span>
        ) : rods > 0 ? (
          <span className="text-emerald-700 font-bold">
            {rods} batang puluhan
          </span>
        ) : (
          <span className="text-amber-700 font-bold">
            {units} kubus satuan
          </span>
        )}
      </div>
    </div>
  );
}

export default function PracticeCard({
  num1,
  num2,
  currentOp,
  levelName = "Level 1 – Bilangan Kecil",
  questionNumber = 1,
  totalQuestions = 10,
  onQuestionCompleted,
  onNewProblem,
  onBack,
  onSectionChanged,
  onFinishSession,
  hasAnsweredAny = false,
  isAutoSaving = false,
  currentCombo,
  onSelectCombo,
}: PracticeCardProps) {
  // Decompose numbers for Addition & Subtraction
  const u1 = num1 % 10;
  const t1 = Math.floor((num1 % 100) / 10);
  const h1 = Math.floor((num1 % 1000) / 100);

  const u2 = num2 % 10;
  const t2 = Math.floor((num2 % 100) / 10);
  const h2 = Math.floor((num2 % 1000) / 100);

  const hasHundreds1 = Math.abs(num1) >= 100;
  const hasTens1 = Math.abs(num1) >= 10;
  const hasHundreds2 = Math.abs(num2) >= 100;
  const hasTens2 = Math.abs(num2) >= 10;

  const hasHundreds = hasHundreds1 || hasHundreds2;
  const hasTens = hasTens1 || hasTens2 || hasHundreds;
  const isMultiDigit = hasTens || hasHundreds;
  const isSingleDigit = !isMultiDigit;
  const isMultiDigitAddSub = (currentOp === "+" || currentOp === "-") && !isSingleDigit;
  const plan = useMemo(
    () => buildPlan(num1, num2, currentOp === "-" ? "-" : "+"),
    [num1, num2, currentOp]
  );
  const sectionMeta = getSectionNamesForOp(currentOp, isSingleDigit);
  const totalSections = sectionMeta.length;

  // Smart Decomposition untuk Perkalian (×) & Pembagian (÷):
  // Untuk perkalian: Bilangan yang dipecah (decompNum) adalah bilangan yang memiliki digit lebih banyak
  // atau nilai tempat lebih besar (misal 526 pada 20 × 526). Bilangan lainnya (20) menjadi pengali.
  // Untuk pembagian: Yang dipecah selalu bilangan yang dibagi (num1), pembaginya adalah num2.
  const isMult = currentOp === "×";
  const isDiv = currentOp === "÷";

  let decompNum = num1;
  let multiplierNum = num2;
  if (isMult) {
    if (num2 > num1) {
      decompNum = num2;
      multiplierNum = num1;
    } else {
      decompNum = num1;
      multiplierNum = num2;
    }
  } else if (isDiv) {
    decompNum = num1;
    multiplierNum = num2;
  }

  const decU = decompNum % 10;
  const decT = Math.floor((decompNum % 100) / 10);
  const decH = Math.floor((decompNum % 1000) / 100);

  const hasDecH = decH > 0;
  const hasDecT = decT > 0 || hasDecH;

  const valH = decH * 100;
  const valT = decT * 10;
  const valU = decU;

  // Stepper Section State (1 s/d totalSections)
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [sectionErrorNotice, setSectionErrorNotice] = useState<string | null>(null);
  const [isSectionShaking, setIsSectionShaking] = useState<boolean>(false);

  // Section Interaction Inputs
  const [secInputs, setSecInputs] = useState<{ [key: string]: string }>({});

  // Diagnostik status tiap section untuk soal aktif ini
  const [sectionDiagnostics, setSectionDiagnostics] = useState<SectionDiagnostic[]>(() =>
    sectionMeta.map((s) => ({
      sectionId: s.id,
      sectionName: s.title,
      status: "skipped",
    }))
  );

  const [hasFailedAnySection, setHasFailedAnySection] = useState<boolean>(false);
  const [isQuestionFinished, setIsQuestionFinished] = useState<boolean>(false);

  // Sync active section to parent (RightHelperPanel sync)
  useEffect(() => {
    if (onSectionChanged) onSectionChanged(currentSection);
  }, [currentSection, onSectionChanged]);

  // Sound effects
  const playSound = (type: "success" | "error") => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch (e) {
      console.log("Audio non-blocking handled", e);
    }
  };

  // Text-to-speech
  const speakProblem = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const opWords: Record<SimpleOperation, string> = {
      "+": "ditambah",
      "-": "dikurangi",
      "×": "dikali",
      "÷": "dibagi",
    };
    const text = `Berapa ${num1} ${opWords[currentOp] || currentOp} ${num2}?`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const rawSumU = u1 + u2;
  const carryT = rawSumU >= 10 ? 1 : 0;
  const expSumU = rawSumU % 10;
  const rawSumT = t1 + t2 + carryT;
  const carryH = hasHundreds && rawSumT >= 10 ? 1 : 0;
  const expSumT = hasHundreds ? rawSumT % 10 : rawSumT;
  const expSumH = hasHundreds ? h1 + h2 + carryH : 0;

  const isNegativeSub = currentOp === "-" && num1 < num2;

  const borrowFromT = u1 < u2 ? 1 : 0;
  const effectiveU1 = borrowFromT ? u1 + 10 : u1;
  const remT1 = t1 - borrowFromT;
  const borrowFromH = hasHundreds && remT1 < t2 ? 1 : 0;
  const effectiveT1 = borrowFromH ? remT1 + 10 : remT1;
  const effectiveH1 = hasHundreds ? h1 - borrowFromH : 0;

  // Nilai selisih mutlak |num1 - num2| jika num1 < num2 (pengurangan hasil negatif)
  const diffMagnitude = Math.abs(num1 - num2);
  const negDiffU = diffMagnitude % 10;
  const negDiffT = Math.floor((diffMagnitude % 100) / 10);
  const negDiffH = Math.floor((diffMagnitude % 1000) / 100);

  const expDiffU = isNegativeSub ? negDiffU : (effectiveU1 - u2);
  const expDiffT = isNegativeSub ? negDiffT : (effectiveT1 - t2);
  const expDiffH = isNegativeSub ? negDiffH : (hasHundreds ? effectiveH1 - h2 : 0);

  const expPartH = valH * multiplierNum;
  const expPartT = valT * multiplierNum;
  const expPartU = valU * multiplierNum;

  const expQuotH = hasDecH ? Math.floor(valH / multiplierNum) : 0;
  const expQuotT = hasDecT ? Math.floor(valT / multiplierNum) : 0;
  const expQuotU = Math.floor(valU / multiplierNum);

  const combinedPlaceholder =
    currentOp === "×"
      ? hasDecH
        ? `${secInputs["partH"] || expPartH} + ${secInputs["partT"] || expPartT} + ${secInputs["partU"] || expPartU}`
        : hasDecT
        ? `${secInputs["partT"] || expPartT} + ${secInputs["partU"] || expPartU}`
        : `${secInputs["partU"] || expPartU}`
      : currentOp === "÷"
      ? hasDecH
        ? `${secInputs["quotH"] || expQuotH} + ${secInputs["quotT"] || expQuotT} + ${secInputs["quotU"] || expQuotU}`
        : hasDecT
        ? `${secInputs["quotT"] || expQuotT} + ${secInputs["quotU"] || expQuotU}`
        : `${secInputs["quotU"] || expQuotU}`
      : "?";

  const expectedFinalAnswer =
    currentOp === "+" ? num1 + num2 : currentOp === "-" ? num1 - num2 : currentOp === "×" ? num1 * num2 : Math.floor(num1 / num2);

  const opSymbol = currentOp === "-" ? "−" : currentOp;

  const opColors: Record<SimpleOperation, { bg: string; text: string; badgeBg: string }> = {
    "+": { bg: "bg-emerald-600", text: "text-emerald-600", badgeBg: "bg-emerald-100 text-emerald-800" },
    "-": { bg: "bg-orange-500", text: "text-orange-600", badgeBg: "bg-orange-100 text-orange-800" },
    "×": { bg: "bg-rose-500", text: "text-rose-600", badgeBg: "bg-rose-100 text-rose-800" },
    "÷": { bg: "bg-purple-600", text: "text-purple-600", badgeBg: "bg-purple-100 text-purple-800" },
  };

  const handleFieldInput = (
    key: string,
    val: string,
    nextKey?: string,
    autoAdvanceLength: number = 1
  ) => {
    const cleanVal = val.replace(/[^0-9\-]/g, "").replace(/(?!^)-/g, "");
    setSecInputs((prev) => ({ ...prev, [key]: cleanVal }));
    // Pindah kursor otomatis ke kotak berikutnya setelah mengetik
    if (autoAdvanceLength > 0 && cleanVal.length >= autoAdvanceLength && cleanVal !== "-" && nextKey) {
      setTimeout(() => {
        const nextEl = document.querySelector<HTMLInputElement>(`[data-field-key="${nextKey}"]`);
        if (nextEl) {
          nextEl.focus();
          nextEl.select();
        }
      }, 20);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    prevKey?: string,
    nextKey?: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextKey) {
        const nextEl = document.querySelector<HTMLInputElement>(`[data-field-key="${nextKey}"]`);
        if (nextEl && !nextEl.value) {
          nextEl.focus();
          nextEl.select();
          return;
        }
      }
      handleValidateSection(currentSection);
    } else if (
      e.key === "Backspace" &&
      !secInputs[(e.target as HTMLInputElement).getAttribute("data-field-key") || ""] &&
      prevKey
    ) {
      const prevEl = document.querySelector<HTMLInputElement>(`[data-field-key="${prevKey}"]`);
      if (prevEl) {
        prevEl.focus();
        prevEl.select();
      }
    } else if (e.key === "ArrowRight" && nextKey) {
      const nextEl = document.querySelector<HTMLInputElement>(`[data-field-key="${nextKey}"]`);
      if (nextEl) {
        nextEl.focus();
        nextEl.select();
      }
    } else if (e.key === "ArrowLeft" && prevKey) {
      const prevEl = document.querySelector<HTMLInputElement>(`[data-field-key="${prevKey}"]`);
      if (prevEl) {
        prevEl.focus();
        prevEl.select();
      }
    }
  };

  // Auto-focus input pertama saat masuk ke section baru
  useEffect(() => {
    const timer = setTimeout(() => {
      let firstKey = "";
      if (currentSection === 1) {
        if (isSingleDigit) {
          if (currentOp === "+") firstKey = "sumU";
          else if (currentOp === "-") firstKey = "diffU";
          else if (currentOp === "×") firstKey = "repSum";
          else if (currentOp === "÷") firstKey = "quotU";
        } else {
          firstKey = num1 >= 100 ? "h1" : num1 >= 10 ? "t1" : "u1";
        }
      } else if (currentSection === 2) {
        if (isSingleDigit) {
          firstKey = "finalAnswer";
        } else if (isMultiDigitAddSub) {
          firstKey = "st_r0";
        } else {
          if (currentOp === "+") firstKey = "sumU";
          else if (currentOp === "-") firstKey = "diffU";
          else if (currentOp === "×")
            firstKey = hasDecH ? "partH" : hasDecT ? "partT" : "partU";
          else if (currentOp === "÷")
            firstKey = hasDecH ? "decH_val" : hasDecT ? "decT_val" : "decU_val";
        }
      } else if (currentSection === 3) {
        if (isMultiDigitAddSub) firstKey = "finalAnswer";
        else if (currentOp === "+") firstKey = "sumT";
        else if (currentOp === "-") firstKey = secInputs["diffU"] ? "diffT" : "diffU";
        else if (currentOp === "×")
          firstKey = "finalAnswer";
        else if (currentOp === "÷")
          firstKey = "combined";
      } else if (currentSection === 4) {
        firstKey = "finalAnswer";
      }

      if (firstKey) {
        const el = document.querySelector<HTMLInputElement>(`[data-field-key="${firstKey}"]`);
        if (el) {
          el.focus();
          el.select();
        }
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [currentSection, currentOp, hasHundreds, hasTens, isSingleDigit, u1, u2, num1, h1, t1, rawSumU, rawSumT, hasDecH, hasDecT, decompNum, multiplierNum, hasHundreds1, hasTens1, hasHundreds2, hasTens2]);

  // -------------------------------------------------------------------------
  // VALIDASI SETIAP SECTION
  // -------------------------------------------------------------------------
  const handleValidateSection = (secId: number) => {
    let isCorrect = false;
    let errorMessage = "";
    let detectedErrorType: string | undefined;
    let detectedErrorDetail: string | undefined;
    let detectedIntervention: string | undefined;
    const studentInputsStr = JSON.stringify(secInputs);

    if (isSingleDigit) {
      if (secId === 1) {
        if (currentOp === "+") {
          // Hitung Total Satuan
          const inSumU = parseInt(secInputs["sumU"] || "-1", 10);
          const rawSum = u1 + u2;
          isCorrect = inSumU === rawSum;
          if (!isCorrect) {
            detectedErrorType = "SALAH_HITUNG_SATUAN";
            errorMessage = "Hitung kembali jumlah total balok satuan dengan teliti ya!";
            detectedErrorDetail = `Kekeliruan penjumlahan satuan (${u1} + ${u2} = ${rawSum}). Siswa menginput ${inSumU}.`;
            detectedIntervention = "Bimbing siswa menghitung penjumlahan satuan dengan bantuan visual balok satuan secara terfokus.";
          }
        } else if (currentOp === "-") {
          const inDiffU = parseInt(secInputs["diffU"] || "-1", 10);
          const expDiff = u1 - u2;
          isCorrect = inDiffU === expDiff;
          if (!isCorrect) {
            detectedErrorType = "SALAH_HITUNG_SATUAN";
            errorMessage = "Hitung kembali selisih balok satuan dengan teliti ya!";
            detectedErrorDetail = `Kekeliruan pengurangan satuan (${u1} − ${u2} = ${expDiff}). Siswa menginput ${inDiffU}.`;
            detectedIntervention = "Bimbing siswa menghitung selisih dengan mencoret atau mengambil balok satuan sesuai angka pengurang.";
          }
        } else if (currentOp === "×") {
          const inRepeatedSum = parseInt(secInputs["repSum"] || "0", 10);
          isCorrect = inRepeatedSum === num1 * num2;
          if (!isCorrect) {
            detectedErrorType = "SALAH_SECTION_1";
            errorMessage = "Hitung total penjumlahan berulang semua kelompok balok ya!";
            detectedErrorDetail = `Kekeliruan konsep perkalian sebagai penjumlahan berulang.`;
            detectedIntervention = "Gunakan balok untuk menghitung kelompok benda berulang.";
          }
        } else if (currentOp === "÷") {
          const inQuotU = parseInt(secInputs["quotU"] || "0", 10);
          const expQuotU = Math.floor(u1 / num2);
          isCorrect = inQuotU === expQuotU;
          if (!isCorrect) {
            detectedErrorType = "SALAH_SECTION_1";
            errorMessage = `Bagi setiap kubus satuan dengan ${num2} sama rata ya!`;
            detectedErrorDetail = `Kekeliruan pembagian satuan.`;
            detectedIntervention = "Gunakan balok untuk membagi rata ke kelompok pembagi.";
          }
        }
      } else if (secId === 2) {
        // Validasi Hasil Akhir untuk bilangan satuan (Tahap 2)
        const inFinal = parseInt(secInputs["finalAnswer"] || "0", 10);
        isCorrect = inFinal === expectedFinalAnswer;
        if (!isCorrect) {
          detectedErrorType = "SALAH_HASIL_AKHIR";
          errorMessage = "Hitung kembali hasil akhirnya dengan teliti ya!";
          detectedErrorDetail = `Hasil akhir ditulis ${inFinal}, kunci yang benar adalah ${expectedFinalAnswer}.`;
          detectedIntervention = "Ajak siswa mengecek kembali hasil perhitungan dengan balok satuan.";
        }
      }
    } else if (secId === 1) {
      // Susun kolom nilai tempat untuk SEMUA operasi (+, -, ×, ÷)
      const rawU1 = (secInputs["u1"] || "").trim();
      const rawT1 = (secInputs["t1"] || "").trim();
      const rawH1 = (secInputs["h1"] || "").trim();

      const rawU2 = (secInputs["u2"] || "").trim();
      const rawT2 = (secInputs["t2"] || "").trim();
      const rawH2 = (secInputs["h2"] || "").trim();

      const inU1 = parseInt(rawU1 || "0", 10);
      const inT1 = parseInt(rawT1 || "0", 10);
      const inH1 = parseInt(rawH1 || "0", 10);

      const inU2 = parseInt(rawU2 || "0", 10);
      const inT2 = parseInt(rawT2 || "0", 10);
      const inH2 = parseInt(rawH2 || "0", 10);

      const u1Ok = rawU1 !== "" && inU1 === u1;
      const t1Ok = !hasTens || num1 < 10 || (
        rawT1 !== "" && (inT1 === t1 || (t1 > 0 && inT1 === t1 * 10))
      );
      const h1Ok = !hasHundreds || num1 < 100 || (
        rawH1 !== "" && (inH1 === h1 || (h1 > 0 && inH1 === h1 * 100))
      );

      const u2Ok = rawU2 !== "" && inU2 === u2;
      const t2Ok = !hasTens || num2 < 10 || (
        rawT2 !== "" && (inT2 === t2 || (t2 > 0 && inT2 === t2 * 10))
      );
      const h2Ok = !hasHundreds || num2 < 100 || (
        rawH2 !== "" && (inH2 === h2 || (h2 > 0 && inH2 === h2 * 100))
      );

      isCorrect = u1Ok && t1Ok && h1Ok && u2Ok && t2Ok && h2Ok;
      if (!isCorrect) {
        detectedErrorType = "SALAH_SECTION_1";
        const opLabel2 = currentOp === "-" ? "Pengurang" : currentOp === "×" ? "Pengali" : currentOp === "÷" ? "Pembagi" : "Bil. 2";
        const errors: string[] = [];
        if (!h1Ok) errors.push(`Ratusan Bil. 1 (${h1})`);
        if (!t1Ok) errors.push(`Puluhan Bil. 1 (${t1})`);
        if (!u1Ok) errors.push(`Satuan Bil. 1 (${u1})`);
        if (!h2Ok) errors.push(`Ratusan ${opLabel2} (${h2})`);
        if (!t2Ok) errors.push(`Puluhan ${opLabel2} (${t2})`);
        if (!u2Ok) errors.push(`Satuan ${opLabel2} (${u2})`);

        if (errors.length > 0) {
          errorMessage = `Periksa kembali: ${errors.join(", ")} belum sesuai dengan angka soal.`;
        } else if (currentOp === "-") {
          errorMessage = `Susun digit bilangan ${num1} dan pengurang ${num2} pada kolom nilai tempat dengan tepat.`;
        } else {
          errorMessage = `Susun digit bilangan ${num1} dan ${num2} pada kolom nilai tempat dengan tepat.`;
        }
        detectedErrorDetail = errorMessage;
        detectedIntervention = "Pandu siswa mengenali susunan kolom nilai tempat: satuan di paling kanan, disusul puluhan dan ratusan di kirinya.";
      }
    } else if (isMultiDigitAddSub) {
      if (secId === 2) {
        const res = validatePlan(plan, secInputs);
        isCorrect = res.isCorrect;
        if (!isCorrect) {
          errorMessage = res.message;
          detectedErrorType = res.errorType || "SALAH_HITUNG_BERSUSUN";
          detectedErrorDetail = res.errorDetail || res.message;
          detectedIntervention =
            res.intervention ||
            "Bimbing siswa mengerjakan hitung bersusun kolom demi kolom dari kanan ke kiri.";
        }
      } else {
        const val = parseInt(
          (secInputs.finalAnswer || "").replace("−", "-") || "NaN",
          10
        );
        isCorrect = val === expectedFinalAnswer;
        if (!isCorrect) {
          detectedErrorType = "SALAH_HASIL_AKHIR";
          errorMessage =
            expectedFinalAnswer < 0
              ? "Tulis hasil dari papan bersusun dan jangan lupa tanda minus (−) di depannya!"
              : "Tulis hasil dari papan bersusun (baca dari kiri ke kanan) dengan teliti ya!";
          detectedErrorDetail = `Hasil akhir ditulis ${
            secInputs.finalAnswer || "(kosong)"
          }, seharusnya ${expectedFinalAnswer}.`;
          detectedIntervention =
            "Minta siswa membaca hasil pada papan bersusun dari kolom kiri ke kanan.";
        }
      }
    } else if (currentOp === "+") {
      if (secId === 2) {
        // Hitung Satuan & Simpanan
        // Hitung Total Satuan
        const inSumU = parseInt(secInputs["sumU"] || "-1", 10);
        const rawSum = u1 + u2;
        isCorrect = inSumU === rawSum;
        if (!isCorrect) {
          detectedErrorType = "SALAH_HITUNG_SATUAN";
          errorMessage = "Hitung kembali jumlah total balok satuan dengan teliti ya!";
          detectedErrorDetail = `Kekeliruan penjumlahan satuan (${u1} + ${u2} = ${rawSum}). Siswa menginput ${inSumU}.`;
          detectedIntervention = "Bimbing siswa menghitung penjumlahan satuan dengan bantuan visual balok satuan secara terfokus.";
        }
      } else if (secId === 3) {
        // Hitung Total Puluhan & Ratusan
        const inSumT = parseInt(secInputs["sumT"] || "-1", 10);
        const expectedT = rawSumT;

        if (hasHundreds) {
          const inSumH = parseInt(secInputs["sumH"] || "-1", 10);
          const expectedH = expSumH; // h1 + h2 + carryH
          const tOk = inSumT === expectedT;
          const hOk = inSumH === expectedH;
          isCorrect = tOk && hOk;
          if (!isCorrect) {
            if (!tOk && !hOk) {
              errorMessage = "Coba hitung kembali total penjumlahan pada kolom puluhan dan ratusan.";
            } else if (!tOk) {
              if (carryT > 0 && inSumT === t1 + t2) {
                errorMessage = "Jangan lupa tambahkan 1 simpanan dari kolom satuan ya!";
              } else {
                errorMessage = `Coba hitung kembali total penjumlahan batang puluhan (${t1} + ${t2}${carryT > 0 ? " + 1 simpanan" : ""}).`;
              }
            } else {
              if (carryH > 0 && inSumH === h1 + h2) {
                errorMessage = "Jangan lupa tambahkan 1 simpanan dari kolom puluhan ya!";
              } else {
                errorMessage = `Coba hitung kembali total lempeng ratusan (${h1} + ${h2}${carryH > 0 ? " + 1 simpanan" : ""}).`;
              }
            }
            detectedErrorType = !tOk ? "SALAH_HITUNG_PULUHAN" : "SALAH_HITUNG_RATUSAN";
            detectedErrorDetail = `Puluhan: ${inSumT} (kunci: ${expectedT}), Ratusan: ${inSumH} (kunci: ${expectedH})`;
            detectedIntervention = "Pandu siswa menghitung total balok per kolom nilai tempat beserta simpanannya.";
          }
        } else {
          isCorrect = inSumT === expectedT;
          if (!isCorrect) {
            if (carryT > 0 && inSumT === t1 + t2) {
              errorMessage = "Jangan lupa tambahkan 1 simpanan dari kolom satuan ya!";
            } else {
              errorMessage = `Coba hitung kembali total penjumlahan batang puluhan (${t1} + ${t2}${carryT > 0 ? " + 1 simpanan" : ""}).`;
            }
            detectedErrorType = "SALAH_HITUNG_PULUHAN";
            detectedErrorDetail = `Kekeliruan penjumlahan puluhan: ${t1} + ${t2}${carryT > 0 ? ` + ${carryT}` : ""} diisi ${inSumT}.`;
            detectedIntervention = "Ajak siswa menjumlahkan batang balok puluhan secara bertahap.";
          }
        }
      } else if (secId === 4) {
        const inFinal = parseInt(secInputs["finalAnswer"] || "0", 10);
        isCorrect = inFinal === expectedFinalAnswer;
        if (!isCorrect) {
          detectedErrorType = "SALAH_SECTION_4";
          errorMessage = "Periksa kembali gabungan digit nilai tempat dari hasil perhitungan sebelumnya ya!";
          detectedErrorDetail = `Hasil akhir penjumlahan ditulis ${inFinal}, kunci yang benar adalah ${expectedFinalAnswer}.`;
          detectedIntervention = "Minta siswa memeriksa kembali gabungan digit kolom kerja dari kanan ke kiri.";
        }
      }
    } else if (currentOp === "-") {
      if (secId === 2) {
        // Cek Satuan & Tukar Puluhan: Siswa menghitung selisih satuan (baik langsung maupun setelah meminjam 1 puluhan)
        const inDiffU = parseInt(secInputs["diffU"] || "-1", 10);
        isCorrect = inDiffU === expDiffU;
        if (!isCorrect) {
          detectedErrorType = "SALAH_HITUNG_SATUAN";
          errorMessage = u1 >= u2
            ? "Hitung kembali selisih balok satuan dengan teliti ya!"
            : `Hitung kembali selisih satuan setelah meminjam 1 puluhan ya (${effectiveU1} − ${u2})!`;
          detectedErrorDetail = `Kekeliruan pengurangan satuan (${effectiveU1} − ${u2} = ${expDiffU}). Siswa menginput ${inDiffU}.`;
          detectedIntervention = "Bimbing siswa menghitung selisih dengan mencoret atau mengambil balok satuan sesuai angka pengurang.";
        }
      } else if (secId === 3) {
        const inDiffU = parseInt(secInputs["diffU"] || "-1", 10);
        const inDiffT = parseInt(secInputs["diffT"] || "-1", 10);
        const inDiffH = parseInt(secInputs["diffH"] || "-1", 10);

        if (hasHundreds) {
          isCorrect = inDiffU === expDiffU && inDiffT === expDiffT && inDiffH === expDiffH;
          if (!isCorrect) {
            detectedErrorType = "LUPA_KURANGI_PINJAMAN";
            errorMessage = "Periksa kembali pengurangan setiap kolom nilai tempat, ingat kolom yang sudah dipinjam!";
            detectedErrorDetail = `Kekeliruan saat mengurangi kolom nilai tempat.`;
            detectedIntervention = "Ingatkan siswa untuk mencoret nilai tempat yang telah dipinjam.";
          }
        } else {
          isCorrect = inDiffU === expDiffU && inDiffT === expDiffT;
          if (!isCorrect) {
            if (borrowFromT > 0 && inDiffT === t1 - t2) {
              detectedErrorType = "LUPA_KURANGI_PINJAMAN";
              detectedErrorDetail = `Siswa mengurangi puluhan (${t1} − ${t2}) tanpa mengingat bahwa 1 puluhan telah dipinjam oleh satuan.`;
              detectedIntervention = "Tekankan kebiasaan mencoret angka puluhan awal dan menuliskan angka sisa di atasnya setelah dipinjam.";
            } else {
              detectedErrorType = "SALAH_HITUNG_PULUHAN";
              detectedErrorDetail = `Kekeliruan pada selisih puluhan.`;
              detectedIntervention = "Bimbing siswa mengurangi batang puluhan dengan bantuan visual balok.";
            }
            errorMessage = borrowFromT > 0
              ? "Perhatikan batang puluhan yang tersisa setelah 1 puluhan dipinjam oleh satuan ya!"
              : "Hitung kembali selisih pada kolom satuan dan puluhan.";
          }
        }
      } else if (secId === 4) {
        const inFinal = parseInt(secInputs["finalAnswer"] || "0", 10);
        isCorrect = inFinal === expectedFinalAnswer;
        if (!isCorrect) {
          detectedErrorType = "SALAH_SECTION_4";
          errorMessage = "Periksa kembali hasil pengurangan akhir dari setiap kolom nilai tempat.";
          detectedErrorDetail = `Hasil akhir pengurangan ditulis ${inFinal}, seharusnya ${expectedFinalAnswer}.`;
          detectedIntervention = "Ajak siswa mengecek kembali hasil pengurangan tiap kolom.";
        }
      }
    } else if (currentOp === "×") {
      if (secId === 2) {
        if (!isSingleDigit) {
          const inPartH = hasDecH ? parseInt(secInputs["partH"] || secInputs["decH_val"] || "-1", 10) : 0;
          const inPartT = hasDecT ? parseInt(secInputs["partT"] || secInputs["decT_val"] || "-1", 10) : 0;
          const inPartU = parseInt(secInputs["partU"] || secInputs["decU_val"] || "-1", 10);
          const inCombined = parseInt(secInputs["combined"] || "-1", 10);

          const hOk = !hasDecH || inPartH === expPartH;
          const tOk = !hasDecT || inPartT === expPartT;
          const uOk = inPartU === expPartU;
          const combOk = inCombined === expectedFinalAnswer;

          isCorrect = hOk && tOk && uOk && combOk;
          if (!isCorrect) {
            detectedErrorType = "SALAH_PERKALIAN_BERSUSUN";
            if (!hOk) {
              errorMessage = `Hitung kembali hasil perkalian ratusan (${multiplierNum} × ${valH} = ${expPartH}) ya!`;
              detectedErrorDetail = `Perkalian ratusan diisi ${inPartH}, seharusnya ${expPartH}.`;
            } else if (!tOk) {
              errorMessage = `Hitung kembali hasil perkalian puluhan (${multiplierNum} × ${valT} = ${expPartT}) ya!`;
              detectedErrorDetail = `Perkalian puluhan diisi ${inPartT}, seharusnya ${expPartT}.`;
            } else if (!uOk) {
              errorMessage = `Hitung kembali hasil perkalian satuan (${multiplierNum} × ${valU} = ${expPartU}) ya!`;
              detectedErrorDetail = `Perkalian satuan diisi ${inPartU}, seharusnya ${expPartU}.`;
            } else if (!combOk) {
              errorMessage = "Jumlahkan semua hasil perkalian bersusun di sebelah kanan dengan teliti ya!";
              detectedErrorDetail = `Penjumlahan bersusun diisi ${inCombined}, seharusnya ${expectedFinalAnswer}.`;
            }
            detectedIntervention = "Ajak siswa mengamati visual balok untuk menghitung hasil per nilai tempat lalu menjumlahkannya secara bersusun.";
          }
        } else {
          const inRepeatedSum = parseInt(secInputs["repSum"] || "0", 10);
          isCorrect = inRepeatedSum === num1 * num2;
          if (!isCorrect) {
            detectedErrorType = "SALAH_SECTION_2";
            errorMessage = "Hitung total penjumlahan berulang semua kelompok balok ya!";
            detectedErrorDetail = `Kekeliruan konsep perkalian sebagai penjumlahan berulang.`;
            detectedIntervention = "Gunakan balok untuk menghitung kelompok benda berulang.";
          }
        }
      } else if (secId === 3) {
        const inFinal = parseInt(secInputs["finalAnswer"] || "0", 10);
        isCorrect = inFinal === expectedFinalAnswer;
        if (!isCorrect) {
          detectedErrorType = "SALAH_HASIL_AKHIR";
          errorMessage = "Periksa kembali hasil akhir perkalian untuk jawaban akhirnya ya!";
          detectedErrorDetail = `Hasil akhir perkalian ditulis ${inFinal}, seharusnya ${expectedFinalAnswer}.`;
          detectedIntervention = "Periksa kembali hasil penjumlahan bersusun dari tahap sebelumnya.";
        }
      } else if (secId === 4) {
        const inFinal = parseInt(secInputs["finalAnswer"] || "0", 10);
        isCorrect = inFinal === expectedFinalAnswer;
        if (!isCorrect) {
          detectedErrorType = "SALAH_SECTION_4";
          errorMessage = "Periksa kembali gabungan hasil kali bagian untuk jawaban akhirnya.";
          detectedErrorDetail = `Hasil akhir perkalian ditulis ${inFinal}, seharusnya ${expectedFinalAnswer}.`;
          detectedIntervention = "Periksa kembali penjumlahan hasil kali bagian.";
        }
      }
    } else if (currentOp === "÷") {
      if (secId === 2) {
        const inDecH = hasDecH ? parseInt(secInputs["decH_val"] || "-1", 10) : 0;
        const inDecT = hasDecT ? parseInt(secInputs["decT_val"] || "-1", 10) : 0;
        const inDecU = parseInt(secInputs["decU_val"] || "-1", 10);

        const hOk = !hasDecH || inDecH === valH || inDecH === decH || inDecH === expQuotH;
        const tOk = !hasDecT || inDecT === valT || inDecT === decT || inDecT === expQuotT;
        const uOk = inDecU === valU || inDecU === expQuotU;

        isCorrect = hOk && tOk && uOk;
        if (!isCorrect) {
          detectedErrorType = "SALAH_PECAH_NILAI";
          errorMessage = `Urai bilangan ${decompNum} ke dalam ratusan (${valH}), puluhan (${valT}), dan satuan (${valU}) atau hasil bagi tiap bagiannya dengan tepat ya!`;
          detectedErrorDetail = `Kekeliruan dalam mengisi nilai pecahan tempat atau hasil bagian bilangan ${decompNum}.`;
          detectedIntervention = "Ajak siswa mengamati visual balok untuk mengenali ratusan, puluhan, dan satuan.";
        }
      } else if (secId === 3) {
        const inCombined = parseInt(secInputs["combined"] || "-1", 10);
        isCorrect = inCombined === expectedFinalAnswer;
        if (!isCorrect) {
          detectedErrorType = "SALAH_GABUNG_HASIL";
          errorMessage = "Gabungkan (jumlahkan) hasil bagi tiap bagian untuk mendapatkan hasil total!";
          detectedErrorDetail = `Kekeliruan saat menggabungkan hasil bagi tiap bagian. Ditulis ${inCombined}, seharusnya ${expectedFinalAnswer}.`;
          detectedIntervention = "Bimbing siswa menjumlahkan hasil bagi parsial.";
        }
      } else if (secId === 4) {
        const inFinal = parseInt(secInputs["finalAnswer"] || "0", 10);
        isCorrect = inFinal === expectedFinalAnswer;
        if (!isCorrect) {
          detectedErrorType = "SALAH_SECTION_4";
          errorMessage = "Periksa kembali gabungan hasil bagi dari setiap kelompok nilai tempat.";
          detectedErrorDetail = `Hasil akhir pembagian ditulis ${inFinal}, seharusnya ${expectedFinalAnswer}.`;
          detectedIntervention = "Uji kembali hasil pembagian dengan perkalian terbalik.";
        }
      }
    }

    // UPDATE SECTION DIAGNOSTICS DENGAN RIWAYAT KESALAHAN
    const updated = sectionDiagnostics.map((sec) => {
      if (sec.sectionId === secId) {
        const hadPreviousMistake = sec.hadMistake || !isCorrect;
        return {
          ...sec,
          status: isCorrect ? ("correct" as const) : ("incorrect" as const),
          studentInput: studentInputsStr,
          expectedValue: String(expectedFinalAnswer),
          diagnosticNote: !isCorrect ? errorMessage : sec.diagnosticNote,
          hadMistake: hadPreviousMistake,
          attempts: (sec.attempts || 0) + 1,
          errorType: !isCorrect ? detectedErrorType : sec.errorType,
          errorDetail: !isCorrect ? detectedErrorDetail : sec.errorDetail,
          suggestedIntervention: !isCorrect ? detectedIntervention : sec.suggestedIntervention,
        };
      }
      return sec;
    });
    setSectionDiagnostics(updated);

    if (!isCorrect) {
      playSound("error");
      setSectionErrorNotice(errorMessage);
      setIsSectionShaking(true);
      setTimeout(() => setIsSectionShaking(false), 500);
      setHasFailedAnySection(true);
    } else {
      playSound("success");
      setSectionErrorNotice(null);

      if (secId < totalSections) {
        setCurrentSection(secId + 1);
      } else {
        // Tuntas semua section!
        setIsQuestionFinished(true);
        const hasAnyMistake = hasFailedAnySection || updated.some((s) => s.hadMistake);
        const isCleanPass = !hasAnyMistake;
        onQuestionCompleted(isCleanPass, updated);
      }
    }
  };

  if (currentOp === "÷") {
    return (
      <PorogapitDivisionBoard
        num1={num1}
        num2={num2}
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        levelName={levelName}
        onQuestionCompleted={onQuestionCompleted}
        onNewProblem={onNewProblem}
        onBack={onBack}
        onFinishSession={onFinishSession}
        onSectionChanged={onSectionChanged}
        hasAnsweredAny={hasAnsweredAny}
        isAutoSaving={isAutoSaving}
        currentCombo={currentCombo}
        onSelectCombo={onSelectCombo}
      />
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col w-full select-none transition-all duration-300">
      {/* 1. HEADER KARTU: JUDUL OPERASI, LEVEL & NO SOAL */}
      <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl ${opColors[currentOp].bg} text-white flex items-center justify-center text-sm font-black shadow-2xs`}>
            {opSymbol}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 font-fredoka leading-none">
              Latihan {currentOp === "+" ? "Penjumlahan" : currentOp === "-" ? "Pengurangan" : currentOp === "×" ? "Perkalian" : "Pembagian"}
            </h3>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5">
              Alur Terpandu per Tahap (CPA Method)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isAutoSaving ? (
            <span className="text-[11px] font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 animate-pulse flex items-center gap-1">
              💾 Menyimpan...
            </span>
          ) : hasAnsweredAny ? (
            <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              ✅ Tersimpan ke Guru
            </span>
          ) : null}
          <span className="px-3 py-1 rounded-full bg-slate-200/80 text-slate-700 text-xs font-black">
            {levelName}
          </span>
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-fredoka">
            Soal {questionNumber} dari {totalQuestions}
          </span>
        </div>
      </div>

      <div className="px-4 sm:px-6 pt-3">
        <DigitComboSelectorRow
          op={currentOp}
          currentCombo={currentCombo}
          onSelectCombo={onSelectCombo}
          onNewProblem={onNewProblem}
        />
      </div>

      {/* 2. STEPPER PROGRESS BAR (3 SECTIONS UNTUK SATUAN, 4 SECTIONS UNTUK PULUHAN/RATUSAN) */}
      <div className="bg-slate-50/80 border-b border-slate-200/70 px-4 sm:px-6 py-2.5">
        <div className={`grid ${totalSections === 2 ? "grid-cols-2" : totalSections === 3 ? "grid-cols-3" : "grid-cols-4"} gap-2`}>
          {sectionMeta.map((sec) => {
            const isActive = currentSection === sec.id;
            const diag = sectionDiagnostics.find((d) => d.sectionId === sec.id);
            const isDone = diag?.status === "correct";
            const isFailed = diag?.status === "incorrect";

            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => {
                  // Hanya bisa klik ke section yang sudah pernah dicapai
                  if (sec.id <= currentSection || isQuestionFinished) {
                    setCurrentSection(sec.id);
                  }
                }}
                className={`flex items-center gap-2 p-2 rounded-2xl text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-white shadow-xs border-2 border-blue-400 scale-[1.02]"
                    : isDone
                    ? "bg-emerald-50/80 border border-emerald-200 hover:bg-emerald-100/60"
                    : isFailed
                    ? "bg-rose-50 border border-rose-200"
                    : "bg-slate-100/60 border border-transparent opacity-60"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                    isDone
                      ? "bg-emerald-600 text-white"
                      : isFailed
                      ? "bg-rose-500 text-white"
                      : isActive
                      ? "bg-blue-600 text-white animate-pulse"
                      : "bg-slate-300 text-slate-700"
                  }`}
                >
                  {isDone ? <Check size={14} /> : sec.id}
                </div>
                <div className="hidden sm:block overflow-hidden">
                  <p className="text-[11px] font-black text-slate-800 truncate font-fredoka">
                    Tahap {sec.id}
                  </p>
                  <p className="text-[9px] font-bold text-slate-500 truncate">
                    {sec.title}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PERSAMAAN SOAL UTAMA & AUDIO */}
      <div className="px-4 sm:px-6 pt-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-fredoka tracking-tight flex items-center gap-2">
            <span>{num1}</span>
            <span className={opColors[currentOp].text}>{opSymbol}</span>
            <span>{num2}</span>
            <span className="text-slate-400">=</span>
            <span className="text-blue-600 font-mono">?</span>
          </div>

          <button
            type="button"
            onClick={speakProblem}
            className="w-9 h-9 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-700 flex items-center justify-center border border-sky-300 transition cursor-pointer"
            title="Dengarkan Soal"
          >
            <Volume2 size={18} />
          </button>
        </div>
      </div>

      {/* 4. KONTEN TAHAP AKTIF (SECTION 1 s/d 4) */}
      <div className={`p-4 sm:p-6 flex flex-col gap-5 ${isSectionShaking ? "animate-shake ring-2 ring-rose-400 rounded-2xl" : ""}`}>
        {/* ================================================================= */}
        {/* SECTION 1: PENGURAIAN NILAI TEMPAT (Hanya untuk Multi-Digit) */}
        {/* ================================================================= */}
        {!isSingleDigit && currentSection === 1 && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black">
                1
              </span>
              <h4 className="font-black text-slate-800 font-fredoka text-sm sm:text-base">
                {sectionMeta[0].title}
              </h4>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              {currentOp === "+"
                ? `Susun bilangan ${num1} dan ${num2} ke dalam kolom nilai tempat bersusun di bawah ini:`
                : currentOp === "-"
                ? `Susun bilangan ${num1} dan pengurang ${num2} ke dalam kolom nilai tempat bersusun:`
                : currentOp === "×"
                ? `Susun bilangan ${num1} dan pengali ${num2} ke dalam kolom nilai tempat bersusun:`
                : `Susun bilangan yang dibagi ${num1} dan pembagi ${num2} ke dalam kolom nilai tempat bersusun:`}
            </p>

            {/* PAPAN SUSUN NILAI TEMPAT PRESISI DENGAN CSS GRID (UNTUK SEMUA OPERASI: +, -, ×, ÷) */}
            <div className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-6 flex flex-col items-center gap-4 shadow-xs">
              <div className="text-center">
                <span className="text-xs sm:text-sm font-black text-slate-800 font-fredoka tracking-wide">
                  Papan Susun Nilai Tempat
                </span>
                <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5">
                  Tulis digit nilai tempat untuk <span className="text-blue-700 font-black">{num1}</span> dan <span className="text-purple-700 font-black">{num2}</span>
                </p>
              </div>

              {/* Whiteboard Kotak-Kotak Presisi */}
              <div className="bg-white rounded-2xl border-2 border-slate-300 p-4 sm:p-6 shadow-sm flex flex-col items-center">
                <div
                  className={`grid ${
                    hasHundreds
                      ? "grid-cols-[auto_repeat(3,minmax(72px,88px))]"
                      : hasTens
                      ? "grid-cols-[auto_repeat(2,minmax(72px,88px))]"
                      : "grid-cols-[auto_minmax(72px,88px)]"
                  } gap-x-3 sm:gap-x-4 gap-y-3 items-center text-center`}
                >
                  {/* Header Row: Label Kolom Nilai Tempat */}
                  <div className="text-right font-black text-[11px] uppercase tracking-wider text-slate-400 pr-2">
                    Operasi
                  </div>
                  {hasHundreds && (
                    <div className="py-1.5 px-2 bg-blue-100 text-blue-900 rounded-xl text-xs sm:text-sm font-black font-fredoka border border-blue-200 shadow-2xs">
                      Ratusan
                    </div>
                  )}
                  {hasTens && (
                    <div className="py-1.5 px-2 bg-emerald-100 text-emerald-900 rounded-xl text-xs sm:text-sm font-black font-fredoka border border-emerald-200 shadow-2xs">
                      Puluhan
                    </div>
                  )}
                  <div className="py-1.5 px-2 bg-amber-100 text-amber-900 rounded-xl text-xs sm:text-sm font-black font-fredoka border border-amber-200 shadow-2xs">
                    Satuan
                  </div>

                  {/* Baris 1: Bilangan Pertama (num1) */}
                  <div className="flex items-center justify-end gap-2 pr-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                      {(currentOp as string) === "÷" ? "Dibagi" : "Bil. 1"}
                    </span>
                    <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-fredoka font-black text-base sm:text-lg shadow-2xs min-w-[54px]">
                      {num1}
                    </div>
                  </div>
                  {hasHundreds && (
                    num1 >= 100 ? (
                      <input
                        type="text"
                        data-field-key="h1"
                        maxLength={1}
                        value={secInputs["h1"] || ""}
                        onChange={(e) => handleFieldInput("h1", e.target.value, num1 >= 10 ? "t1" : "u1", 1)}
                        onKeyDown={(e) => handleKeyDown(e, undefined, num1 >= 10 ? "t1" : "u1")}
                        placeholder="?"
                        className="w-full h-12 sm:h-14 text-center font-black text-xl font-fredoka bg-blue-50/50 border-2 border-blue-300 text-blue-900 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition placeholder:text-blue-300 shadow-2xs"
                      />
                    ) : (
                      <div className="w-full h-12 sm:h-14 flex items-center justify-center font-black text-xl font-fredoka bg-slate-100/80 border-2 border-slate-200 text-slate-300 rounded-2xl select-none">
                        −
                      </div>
                    )
                  )}
                  {hasTens && (
                    num1 >= 10 ? (
                      <input
                        type="text"
                        data-field-key="t1"
                        maxLength={1}
                        value={secInputs["t1"] || ""}
                        onChange={(e) => handleFieldInput("t1", e.target.value, "u1", 1)}
                        onKeyDown={(e) => handleKeyDown(e, num1 >= 100 ? "h1" : undefined, "u1")}
                        placeholder="?"
                        className="w-full h-12 sm:h-14 text-center font-black text-xl font-fredoka bg-emerald-50/50 border-2 border-emerald-300 text-emerald-900 rounded-2xl focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100 outline-none transition placeholder:text-emerald-300 shadow-2xs"
                      />
                    ) : (
                      <div className="w-full h-12 sm:h-14 flex items-center justify-center font-black text-xl font-fredoka bg-slate-100/80 border-2 border-slate-200 text-slate-300 rounded-2xl select-none">
                        −
                      </div>
                    )
                  )}
                  <input
                    type="text"
                    data-field-key="u1"
                    maxLength={1}
                    value={secInputs["u1"] || ""}
                    onChange={(e) =>
                      handleFieldInput(
                        "u1",
                        e.target.value,
                        num2 >= 100 ? "h2" : num2 >= 10 ? "t2" : "u2",
                        1
                      )
                    }
                    onKeyDown={(e) =>
                      handleKeyDown(
                        e,
                        num1 >= 10 ? "t1" : num1 >= 100 ? "h1" : undefined,
                        num2 >= 100 ? "h2" : num2 >= 10 ? "t2" : "u2"
                      )
                    }
                    placeholder="?"
                    className="w-full h-12 sm:h-14 text-center font-black text-xl font-fredoka bg-amber-50/50 border-2 border-amber-300 text-amber-900 rounded-2xl focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-100 outline-none transition placeholder:text-amber-300 shadow-2xs"
                  />

                  {/* Baris 2: Bilangan Kedua (num2) */}
                  <div className="flex items-center justify-end gap-2 pr-2">
                    <span
                      className={`w-6 h-6 rounded-lg ${opColors[currentOp].bg} text-white flex items-center justify-center text-xs font-black shadow-xs shrink-0`}
                    >
                      {opSymbol}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
                      {currentOp === "×" ? "Pengali" : (currentOp as string) === "÷" ? "Pembagi" : currentOp === "-" ? "Pengurang" : "Bil. 2"}
                    </span>
                    <div className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-fredoka font-black text-base sm:text-lg shadow-2xs min-w-[54px]">
                      {num2}
                    </div>
                  </div>
                  {hasHundreds && (
                    num2 >= 100 ? (
                      <input
                        type="text"
                        data-field-key="h2"
                        maxLength={1}
                        value={secInputs["h2"] || ""}
                        onChange={(e) => handleFieldInput("h2", e.target.value, num2 >= 10 ? "t2" : "u2", 1)}
                        onKeyDown={(e) => handleKeyDown(e, "u1", num2 >= 10 ? "t2" : "u2")}
                        placeholder="?"
                        className="w-full h-12 sm:h-14 text-center font-black text-xl font-fredoka bg-blue-50/50 border-2 border-blue-300 text-blue-900 rounded-2xl focus:border-blue-600 focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition placeholder:text-blue-300 shadow-2xs"
                      />
                    ) : (
                      <div className="w-full h-12 sm:h-14 flex items-center justify-center font-black text-xl font-fredoka bg-slate-100/80 border-2 border-slate-200 text-slate-300 rounded-2xl select-none">
                        −
                      </div>
                    )
                  )}
                  {hasTens && (
                    num2 >= 10 ? (
                      <input
                        type="text"
                        data-field-key="t2"
                        maxLength={1}
                        value={secInputs["t2"] || ""}
                        onChange={(e) => handleFieldInput("t2", e.target.value, "u2", 1)}
                        onKeyDown={(e) => handleKeyDown(e, num2 >= 100 ? "h2" : "u1", "u2")}
                        placeholder="?"
                        className="w-full h-12 sm:h-14 text-center font-black text-xl font-fredoka bg-emerald-50/50 border-2 border-emerald-300 text-emerald-900 rounded-2xl focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100 outline-none transition placeholder:text-emerald-300 shadow-2xs"
                      />
                    ) : (
                      <div className="w-full h-12 sm:h-14 flex items-center justify-center font-black text-xl font-fredoka bg-slate-100/80 border-2 border-slate-200 text-slate-300 rounded-2xl select-none">
                        −
                      </div>
                    )
                  )}
                  <input
                    type="text"
                    data-field-key="u2"
                    maxLength={1}
                    value={secInputs["u2"] || ""}
                    onChange={(e) => handleFieldInput("u2", e.target.value, undefined, 1)}
                    onKeyDown={(e) =>
                      handleKeyDown(
                        e,
                        num2 >= 10 ? "t2" : num2 >= 100 ? "h2" : "u1",
                        undefined
                      )
                    }
                    placeholder="?"
                    className="w-full h-12 sm:h-14 text-center font-black text-xl font-fredoka bg-amber-50/50 border-2 border-amber-300 text-amber-900 rounded-2xl focus:border-amber-600 focus:bg-white focus:ring-4 focus:ring-amber-100 outline-none transition placeholder:text-amber-300 shadow-2xs"
                  />

                  {/* Garis Pembatas Operasi Bersusun */}
                  <div className="col-span-full h-1 sm:h-1.5 bg-slate-800 rounded-full my-1.5 w-full" />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleValidateSection(1)}
              className="self-end px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-sm"
            >
              <span>Periksa & Lanjut ke Tahap 2</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* HITUNG BERSUSUN MATEMATIKA BERSIH (Tahap 2 untuk + dan - multi-digit) */}
        {/* ================================================================= */}
        {isMultiDigitAddSub && currentSection === 2 && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                2
              </span>
              <h4 className="font-black text-slate-800 font-fredoka text-sm sm:text-base">
                {sectionMeta[1]?.title}
              </h4>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600">
              {currentOp === "+"
                ? `Hitung ${num1} + ${num2} secara bersusun ke bawah. Mulai dari kolom Satuan, lalu Puluhan${isMultiDigit ? ", lalu Ratusan" : ""}.`
                : `Hitung ${num1} − ${num2} secara bersusun ke bawah. Mulai dari kolom Satuan, lalu Puluhan${isMultiDigit ? ", lalu Ratusan" : ""}.`}
            </p>
            <MathBoardGrid
              plan={plan}
              num1={num1}
              num2={num2}
              inputs={secInputs}
              onInput={(k, v) => {
                handleFieldInput(k, v);
              }}
              onEnter={() => handleValidateSection(2)}
            />
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setCurrentSection(1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                ← Kembali ke Tahap 1
              </button>
              <button
                type="button"
                onClick={() => handleValidateSection(2)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                <span>Periksa & Lanjut ke Hasil Akhir</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION HITUNG BAGIAN PER NILAI TEMPAT & BALOK 3D (Tahap 1 jika satuan, Tahap 2 jika multi-digit perkalian/pembagian) */}
        {/* ================================================================= */}
        {!isMultiDigitAddSub && ((isSingleDigit && currentSection === 1) || (!isSingleDigit && currentSection === 2)) && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                {isSingleDigit ? 1 : 2}
              </span>
              <h4 className="font-black text-slate-800 font-fredoka text-sm sm:text-base">
                {sectionMeta[isSingleDigit ? 0 : 1]?.title}
              </h4>
            </div>

            {/* A. OPERASI PERKALIAN (×) */}
            {currentOp === "×" ? (
              isSingleDigit ? (
                <div className="p-4 bg-rose-50/70 border-2 border-rose-200/90 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs font-black text-rose-900 font-fredoka">
                    <Box size={16} className="text-rose-600" />
                    Penjumlahan Berulang Balok ({num1} kelompok masing-masing {num2} kubus):
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-rose-200 flex flex-wrap gap-4 items-center justify-center">
                    {Array.from({ length: num1 }).map((_, gIdx) => (
                      <div key={gIdx} className="flex flex-col items-center gap-1 p-2 bg-amber-50/80 rounded-lg border border-amber-200">
                        <span className="text-[10px] font-black text-amber-800">Kel. {gIdx + 1}</span>
                        <div className="flex flex-wrap gap-1 items-center justify-center max-w-[90px]">
                          {Array.from({ length: num2 }).map((_, cIdx) => (
                            <UnitCube3D key={cIdx} size={16} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <span className="text-sm font-black text-slate-700 font-fredoka">
                      Jumlah semua benda ({Array.from({ length: num1 }).map(() => num2).join(" + ")}) =
                    </span>
                    <input
                      type="text"
                      data-field-key="repSum"
                      value={secInputs["repSum"] || ""}
                      onChange={(e) => handleFieldInput("repSum", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e)}
                      placeholder="?"
                      className="w-18 h-12 text-center font-black text-xl font-fredoka bg-white border-2 border-rose-300 rounded-2xl outline-none focus:ring-4 focus:ring-rose-200 shadow-2xs"
                    />
                  </div>
                </div>
              ) : (
                /* Perkalian: Tahap 2 - Visual Balok Hasil Perkalian & Penjumlahan Bersusun (2 Kolom) */
                <div className="flex flex-col gap-4 sm:gap-5">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs sm:text-sm font-semibold text-slate-700">
                      Hitung perkalian tiap nilai tempat, lalu susun dan jumlahkan hasilnya:
                    </p>
                  </div>

                  {/* Tata Letak 2 Kolom: Kiri (Kartu Perkalian + Balok) -> Panah -> Kanan (Penjumlahan Bersusun) */}
                  <div className="flex flex-col md:flex-row items-center md:items-stretch justify-center gap-3 sm:gap-5 w-full">
                    {/* Kolom Kiri: Kartu Balok Perkalian Per Nilai Tempat */}
                    <div className="flex-1 w-full flex flex-col gap-3">
                      {/* Kartu Ratusan (jika ada) */}
                      {hasDecH && (
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2.5 shadow-xs hover:border-slate-300 transition-all">
                          <div className="flex items-center justify-between w-full">
                            <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200/70 rounded-lg text-xs sm:text-sm font-bold font-fredoka">
                              {multiplierNum} × {valH}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">Ratusan</span>
                          </div>
                          <MultiplicationProductBlocks3D val={expPartH} />
                          <div className="flex items-center justify-between w-full pt-1 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-500">Tulis Hasil:</span>
                            <input
                              type="text"
                              data-field-key="partH"
                              value={secInputs["partH"] || ""}
                              onChange={(e) =>
                                handleFieldInput(
                                  "partH",
                                  e.target.value,
                                  hasDecT ? "partT" : "partU",
                                  0
                                )
                              }
                              onKeyDown={(e) => handleKeyDown(e, undefined, hasDecT ? "partT" : "partU")}
                              placeholder="?"
                              className="w-24 sm:w-28 h-10 sm:h-11 text-center font-black text-lg sm:text-xl font-fredoka bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition placeholder:text-slate-300"
                            />
                          </div>
                        </div>
                      )}

                      {/* Kartu Puluhan (jika ada) */}
                      {hasDecT && (
                        <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2.5 shadow-xs hover:border-slate-300 transition-all">
                          <div className="flex items-center justify-between w-full">
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/70 rounded-lg text-xs sm:text-sm font-bold font-fredoka">
                              {multiplierNum} × {valT}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">Puluhan</span>
                          </div>
                          <MultiplicationProductBlocks3D val={expPartT} />
                          <div className="flex items-center justify-between w-full pt-1 border-t border-slate-100">
                            <span className="text-xs font-semibold text-slate-500">Tulis Hasil:</span>
                            <input
                              type="text"
                              data-field-key="partT"
                              value={secInputs["partT"] || ""}
                              onChange={(e) =>
                                handleFieldInput("partT", e.target.value, "partU", 0)
                              }
                              onKeyDown={(e) => handleKeyDown(e, hasDecH ? "partH" : undefined, "partU")}
                              placeholder="?"
                              className="w-24 sm:w-28 h-10 sm:h-11 text-center font-black text-lg sm:text-xl font-fredoka bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition placeholder:text-slate-300"
                            />
                          </div>
                        </div>
                      )}

                      {/* Kartu Satuan */}
                      <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2.5 shadow-xs hover:border-slate-300 transition-all">
                        <div className="flex items-center justify-between w-full">
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200/70 rounded-lg text-xs sm:text-sm font-bold font-fredoka">
                            {multiplierNum} × {valU}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400">Satuan</span>
                        </div>
                        <MultiplicationProductBlocks3D val={expPartU} />
                        <div className="flex items-center justify-between w-full pt-1 border-t border-slate-100">
                          <span className="text-xs font-semibold text-slate-500">Tulis Hasil:</span>
                          <input
                            type="text"
                            data-field-key="partU"
                            value={secInputs["partU"] || ""}
                            onChange={(e) =>
                              handleFieldInput("partU", e.target.value, "combined", 0)
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, hasDecT ? "partT" : hasDecH ? "partH" : undefined, "combined")
                            }
                            placeholder="?"
                            className="w-24 sm:w-28 h-10 sm:h-11 text-center font-black text-lg sm:text-xl font-fredoka bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none transition placeholder:text-slate-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Panah Penghubung ke Penjumlahan Bersusun */}
                    <div className="flex md:flex-col items-center justify-center text-slate-300 shrink-0 py-1 md:py-0 px-2 sm:px-3">
                      <div className="hidden md:flex flex-col items-center gap-1.5">
                        <ArrowRight size={22} className="text-slate-300" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Susun
                        </span>
                      </div>
                      <div className="md:hidden flex items-center gap-1.5 py-1">
                        <div className="rotate-90">
                          <ArrowRight size={18} className="text-slate-300" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Susun
                        </span>
                      </div>
                    </div>

                    {/* Kolom Kanan: Papan Penjumlahan Bersusun */}
                    <div className="flex-1 w-full md:max-w-[320px] bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col items-center justify-between gap-4 shadow-xs">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                        Penjumlahan Bersusun
                      </span>

                      <div className="flex flex-col items-end pr-5 sm:pr-6 relative my-auto py-2 justify-center">
                        {hasDecH && (
                          <div className="text-2xl sm:text-3xl font-black font-fredoka tracking-widest text-right min-h-[32px] leading-tight">
                            {secInputs["partH"] ? (
                              <span className="text-slate-800">{secInputs["partH"]}</span>
                            ) : (
                              <span className="text-slate-300 font-normal">...</span>
                            )}
                          </div>
                        )}
                        {hasDecT && (
                          <div className="text-2xl sm:text-3xl font-black font-fredoka tracking-widest text-right min-h-[32px] leading-tight">
                            {secInputs["partT"] ? (
                              <span className="text-slate-800">{secInputs["partT"]}</span>
                            ) : (
                              <span className="text-slate-300 font-normal">...</span>
                            )}
                          </div>
                        )}
                        <div className="text-2xl sm:text-3xl font-black font-fredoka tracking-widest text-right min-h-[32px] leading-tight">
                          {secInputs["partU"] ? (
                            <span className="text-slate-800">{secInputs["partU"]}</span>
                          ) : (
                            <span className="text-slate-300 font-normal">...</span>
                          )}
                        </div>

                        {/* Garis pemisah dengan tanda + */}
                        <div className="w-full min-w-[120px] sm:min-w-[140px] border-b-2 border-slate-700 my-2 relative">
                          <span className="absolute -right-5 sm:-right-6 -top-3.5 text-xl font-bold text-slate-400 font-fredoka">
                            +
                          </span>
                        </div>

                        {/* Input hasil penjumlahan bersusun */}
                        <div className="flex flex-col items-center w-full mt-1">
                          <input
                            type="text"
                            data-field-key="combined"
                            value={secInputs["combined"] || ""}
                            onChange={(e) => handleFieldInput("combined", e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, "partU", undefined)}
                            placeholder="?"
                            className="w-32 sm:w-36 h-12 text-center font-black text-2xl font-fredoka bg-slate-50 border-2 border-slate-300 text-slate-900 rounded-xl focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition placeholder:text-slate-300"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400 font-medium text-center">
                        Jumlahkan hasil bagian di atas untuk mendapatkan total
                      </p>
                    </div>
                  </div>

                  {/* Ringkasan Bentuk Pemecahan */}
                  <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-3 text-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Sifat Distributif Perkalian
                    </span>
                    <div className="text-xs sm:text-sm font-bold text-slate-700 font-fredoka flex items-center justify-center gap-1.5 flex-wrap">
                      <span>{num1} × {num2}</span>
                      <span className="text-slate-400">=</span>
                      {hasDecH && (
                        <>
                          <span>({multiplierNum} × <span className="text-blue-600 font-bold">{valH}</span>)</span>
                          <span className="text-slate-400">+</span>
                        </>
                      )}
                      {hasDecT && (
                        <>
                          <span>({multiplierNum} × <span className="text-emerald-600 font-bold">{valT}</span>)</span>
                          <span className="text-slate-400">+</span>
                        </>
                      )}
                      <span>({multiplierNum} × <span className="text-amber-600 font-bold">{valU}</span>)</span>
                    </div>
                  </div>
                </div>
              )
            ) : (currentOp as string) === "÷" ? (
              /* Pembagian: Tahap 2 - Pecah Nilai Tempat & Visual Balok */
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    Pecah bilangan <span className="text-purple-700 font-black">{decompNum}</span> ke dalam ratusan, puluhan, dan satuan untuk dibagi dengan <span className="text-slate-900 font-black">{multiplierNum}</span>:
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Tuliskan pecahan nilai tempat pada kotak di bawah sesuai balok bantuan, lalu periksa!
                  </p>
                </div>

                <div className={`grid grid-cols-1 ${hasDecH ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3 sm:gap-4`}>
                  {/* Kartu 1: Ratusan (jika ada) */}
                  {hasDecH && (
                    <div className="bg-blue-50/70 border-2 border-blue-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-between gap-3 shadow-2xs hover:border-blue-300 transition-all">
                      <div className="px-3 py-1 bg-blue-100/90 text-blue-900 border border-blue-200 rounded-full text-xs sm:text-sm font-black font-fredoka shadow-2xs">
                        {valH} ÷ {multiplierNum}
                      </div>
                      {/* Visual Balok Ratusan */}
                      <div className="w-full bg-white/90 border border-blue-200/80 rounded-xl p-3 min-h-[105px] flex flex-col items-center justify-center gap-1 shadow-inner">
                        <div className={`flex flex-col items-center justify-center ${decH > 3 ? "grid grid-cols-2 gap-1.5" : "-space-y-2 sm:-space-y-2.5"}`}>
                          {Array.from({ length: decH }).map((_, i) => (
                            <HundredFlat3D key={i} width={74} />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-blue-600 font-fredoka mt-1">
                          {decH} lempeng ratusan ({valH})
                        </span>
                      </div>
                      {/* Input Pecahan Nilai Ratusan */}
                      <div className="flex flex-col items-center gap-1 w-full">
                        <span className="text-[11px] font-bold text-slate-600">Nilai Ratusan:</span>
                        <input
                          type="text"
                          data-field-key="decH_val"
                          value={secInputs["decH_val"] || ""}
                          onChange={(e) =>
                            handleFieldInput(
                              "decH_val",
                              e.target.value,
                              hasDecT ? "decT_val" : "decU_val",
                              0
                            )
                          }
                          onKeyDown={(e) => handleKeyDown(e, undefined, hasDecT ? "decT_val" : "decU_val")}
                          placeholder=""
                          className="w-24 sm:w-28 h-12 text-center font-black text-xl font-fredoka bg-white border-2 border-blue-300 text-blue-900 rounded-2xl focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition shadow-2xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Kartu 2: Puluhan (jika ada) */}
                  {hasDecT && (
                    <div className="bg-emerald-50/70 border-2 border-emerald-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-between gap-3 shadow-2xs hover:border-emerald-300 transition-all">
                      <div className="px-3 py-1 bg-emerald-100/90 text-emerald-900 border border-emerald-200 rounded-full text-xs sm:text-sm font-black font-fredoka shadow-2xs">
                        {valT} ÷ {multiplierNum}
                      </div>
                      {/* Visual Balok Puluhan */}
                      <div className="w-full bg-white/90 border border-emerald-200/80 rounded-xl p-3 min-h-[105px] flex flex-col items-center justify-center gap-1 shadow-inner">
                        <div className="flex flex-wrap items-end justify-center gap-2">
                          {Array.from({ length: decT }).map((_, i) => (
                            <TenRod3D key={i} height={82} />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 font-fredoka">
                          {decT} batang puluhan ({valT})
                        </span>
                      </div>
                      {/* Input Pecahan Nilai Puluhan */}
                      <div className="flex flex-col items-center gap-1 w-full">
                        <span className="text-[11px] font-bold text-slate-600">Nilai Puluhan:</span>
                        <input
                          type="text"
                          data-field-key="decT_val"
                          value={secInputs["decT_val"] || ""}
                          onChange={(e) =>
                            handleFieldInput("decT_val", e.target.value, "decU_val", 0)
                          }
                          onKeyDown={(e) => handleKeyDown(e, hasDecH ? "decH_val" : undefined, "decU_val")}
                          placeholder=""
                          className="w-24 sm:w-28 h-12 text-center font-black text-xl font-fredoka bg-white border-2 border-emerald-300 text-emerald-900 rounded-2xl focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition shadow-2xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* Kartu 3: Satuan */}
                  <div className="bg-amber-50/70 border-2 border-amber-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-between gap-3 shadow-2xs hover:border-amber-300 transition-all">
                    <div className="px-3 py-1 bg-amber-100/90 text-amber-900 border border-amber-200 rounded-full text-xs sm:text-sm font-black font-fredoka shadow-2xs">
                      {valU} ÷ {multiplierNum}
                    </div>
                    {/* Visual Balok Satuan */}
                    <div className="w-full bg-white/90 border border-amber-200/80 rounded-xl p-3 min-h-[105px] flex flex-col items-center justify-center gap-1 shadow-inner">
                      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[140px]">
                        {Array.from({ length: decU }).map((_, i) => (
                          <UnitCube3D key={i} size={18} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 font-fredoka">
                        {decU} kubus satuan ({valU})
                      </span>
                    </div>
                    {/* Input Pecahan Nilai Satuan */}
                    <div className="flex flex-col items-center gap-1 w-full">
                      <span className="text-[11px] font-bold text-slate-600">Nilai Satuan:</span>
                      <input
                        type="text"
                        data-field-key="decU_val"
                        value={secInputs["decU_val"] || ""}
                        onChange={(e) =>
                          handleFieldInput("decU_val", e.target.value, undefined, 0)
                        }
                        onKeyDown={(e) =>
                          handleKeyDown(e, hasDecT ? "decT_val" : hasDecH ? "decH_val" : undefined)
                        }
                        placeholder=""
                        className="w-20 sm:w-24 h-12 text-center font-black text-xl font-fredoka bg-white border-2 border-amber-300 text-amber-900 rounded-2xl focus:border-amber-600 focus:ring-4 focus:ring-amber-100 outline-none transition shadow-2xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Ringkasan Bentuk Pemecahan Pembagian */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-3 text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Bentuk Pemecahan Pembagian
                  </span>
                  <div className="text-xs sm:text-sm font-bold text-slate-700 font-fredoka flex items-center justify-center gap-1.5 flex-wrap">
                    <span>{num1} ÷ {num2}</span>
                    <span className="text-slate-400">=</span>
                    {hasDecH && (
                      <>
                        <span>(<span className="text-blue-600 font-bold">{valH}</span> ÷ {multiplierNum})</span>
                        <span className="text-slate-400">+</span>
                      </>
                    )}
                    {hasDecT && (
                      <>
                        <span>(<span className="text-emerald-600 font-bold">{valT}</span> ÷ {multiplierNum})</span>
                        <span className="text-slate-400">+</span>
                      </>
                    )}
                    <span>(<span className="text-amber-600 font-bold">{valU}</span> ÷ {multiplierNum})</span>
                  </div>
                </div>
              </div>
            ) : currentOp === "+" ? (
              /* C. OPERASI PENJUMLAHAN (+) (Fokus Satuan) */
              <div className="flex flex-col gap-3.5">
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  Hitung balok pada kolom satuan:
                </p>
                {/* Visual Balok Kubus Satuan yang Bersih & Proporsional */}
                <div className="bg-amber-50/50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-4 shadow-xs">
                  <div className="flex items-center justify-center gap-2 sm:gap-5 flex-wrap">
                    {/* Kartu Satuan Bilangan 1 */}
                    <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-amber-200/90 shadow-2xs min-w-[115px]">
                      <span className="text-xs font-black text-amber-900 font-fredoka">
                        {u1} Satuan
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-w-[130px] items-center justify-center min-h-[44px]">
                        {Array.from({ length: u1 }).map((_, i) => (
                          <UnitCube3D key={i} size={18} />
                        ))}
                      </div>
                    </div>

                    <span className="w-8 h-8 rounded-full bg-amber-100/80 border border-amber-200 text-amber-800 flex items-center justify-center font-black text-base shadow-2xs">
                      +
                    </span>

                    {/* Kartu Satuan Bilangan 2 */}
                    <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-amber-200/90 shadow-2xs min-w-[115px]">
                      <span className="text-xs font-black text-amber-900 font-fredoka">
                        {u2} Satuan
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-w-[130px] items-center justify-center min-h-[44px]">
                        {Array.from({ length: u2 }).map((_, i) => (
                          <UnitCube3D key={i} size={18} />
                        ))}
                      </div>
                    </div>

                    <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-black text-base shadow-2xs">
                      =
                    </span>

                    {/* Kotak Input Langsung Total Satuan di samping '=' */}
                    <div className="flex flex-col items-center justify-center gap-1 px-4 py-3 bg-amber-50 rounded-2xl border-2 border-dashed border-amber-300 min-w-[100px] min-h-[64px] shadow-2xs">
                      <span className="text-[11px] font-bold text-amber-800">Total Satuan</span>
                      <input
                        type="text"
                        data-field-key="sumU"
                        maxLength={2}
                        value={secInputs["sumU"] || ""}
                        onChange={(e) => handleFieldInput("sumU", e.target.value, undefined, String(rawSumU).length)}
                        onKeyDown={(e) => handleKeyDown(e, undefined, undefined)}
                        placeholder="?"
                        className="w-14 h-12 sm:w-16 sm:h-12 text-center font-black text-xl font-fredoka bg-white border-2 border-amber-400 text-amber-950 rounded-xl outline-none focus:ring-4 focus:ring-amber-200 shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Keterangan konsep jika total satuan >= 10, HANYA setelah siswa mengetik jawaban */}
                  {parseInt(secInputs["sumU"] || "-1", 10) === rawSumU ? (
                    rawSumU >= 10 && (
                      <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2 text-center mt-2 animate-in fade-in zoom-in-95">
                        <span>💡 Keren! Totalnya <span className="font-black">{rawSumU}</span> (≥ 10). Karena mencapai 10 atau lebih, maka <span className="font-black">10 satuan ditukar menjadi 1 batang puluhan</span> dan disimpan ke kolom puluhan pada tahap berikutnya!</span>
                      </div>
                    )
                  ) : (
                    <p className="text-[11px] text-slate-500 font-semibold text-center mt-1">
                      Hitung semua balok satuan di atas, lalu tuliskan totalnya di kotak kuning.
                    </p>
                  )}
                </div>
              </div>
          ) : (
            /* D. OPERASI PENGURANGAN (-) (Fokus Cek & Hitung Satuan) */
            <div className="flex flex-col gap-3.5">
              <p className="text-xs sm:text-sm font-bold text-slate-600">
                {u1 >= u2
                  ? "Kurangkan balok pada kolom satuan:"
                  : "Periksa angka satuan dan lakukan penukaran puluhan:"}
              </p>
              {/* Visual Balok Kubus Satuan Pengurangan Sesuai Gaya Penjumlahan */}
              <div className="bg-orange-50/50 border border-orange-200/90 rounded-2xl p-4 sm:p-5 flex flex-col items-center gap-4 shadow-xs">
                {isNegativeSub ? (
                  /* KASUS C: BILANGAN PERTAMA < PENGURANG (HASIL NEGATIF) */
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="w-full p-3.5 bg-indigo-50/95 border-2 border-indigo-300 rounded-2xl flex items-start gap-3 text-indigo-950 text-xs shadow-2xs">
                      <span className="text-xl shrink-0 mt-0.5">💡</span>
                      <div className="flex flex-col gap-1 text-left">
                        <span className="font-black text-indigo-950 font-fredoka text-xs sm:text-sm">
                          Pengurangan Bilangan Kecil Dikurang Bilangan Besar ({num1} &lt; {num2})
                        </span>
                        <p className="text-[11.5px] sm:text-xs text-indigo-900 leading-relaxed font-medium">
                          Karena bilangan pertama (<span className="font-bold">{num1}</span>) lebih kecil dari pengurang (<span className="font-bold">{num2}</span>), hasilnya adalah <strong>bilangan negatif (−)</strong>. 
                          Kita hitung selisih bilangannya: <span className="font-black">{num2} − {num1} = {diffMagnitude}</span>, lalu beri tanda minus (−) di depan hasil akhirnya!
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 sm:gap-5 flex-wrap">
                      <div className="flex flex-col items-center gap-2 p-3 bg-amber-50/80 rounded-2xl border-2 border-amber-300 shadow-2xs min-w-[130px]">
                        <span className="text-xs font-black text-orange-950 font-fredoka">
                          Satuan Bil. Pengurang ({num2})
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-w-[150px] items-center justify-center min-h-[44px] p-1.5 bg-white rounded-xl border border-amber-200">
                          {Array.from({ length: Math.min(u2, 10) }).map((_, i) => (
                            <UnitCube3D key={i} size={16} />
                          ))}
                        </div>
                      </div>

                      <span className="w-8 h-8 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 flex items-center justify-center font-black text-base shadow-2xs">
                        ↔
                      </span>

                      <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-orange-200/90 shadow-2xs min-w-[115px]">
                        <span className="text-xs font-black text-orange-900 font-fredoka">
                          Satuan Bil. 1 ({num1})
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-w-[130px] items-center justify-center min-h-[44px] p-1.5 bg-white rounded-xl border border-orange-100">
                          {Array.from({ length: u1 }).map((_, i) => (
                            <UnitCube3D key={i} size={16} />
                          ))}
                        </div>
                      </div>

                      <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-black text-base shadow-2xs">
                        =
                      </span>

                      <div className="flex flex-col items-center gap-2 p-3 bg-orange-50/60 rounded-2xl border-2 border-dashed border-orange-300 min-w-[115px]">
                        <span className="text-xs font-black text-orange-900 font-fredoka">
                          Digit Satuan Selisih
                        </span>
                        <input
                          type="text"
                          data-field-key="diffU"
                          maxLength={2}
                          value={secInputs["diffU"] || ""}
                          onChange={(e) => handleFieldInput("diffU", e.target.value, undefined, String(expDiffU).length)}
                          onKeyDown={(e) => handleKeyDown(e, undefined, undefined)}
                          placeholder="?"
                          className="w-14 h-12 sm:w-16 sm:h-12 text-center font-black text-xl font-fredoka bg-white border-2 border-orange-400 text-orange-950 rounded-xl outline-none focus:ring-4 focus:ring-orange-200 shadow-2xs"
                        />
                      </div>
                    </div>

                    {parseInt(secInputs["diffU"] || "-1", 10) === expDiffU ? (
                      <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2 text-center animate-in fade-in zoom-in-95 w-full">
                        <span>✅ Hebat! Digit satuan selisihnya adalah <span className="font-black">{expDiffU}</span>. Lanjut ke Tahap 3 untuk menghitung puluhan dan ratusan!</span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 font-semibold text-center mt-0.5">
                        Tuliskan digit satuan dari selisih ({num2} − {num1} = {diffMagnitude}), yaitu {expDiffU}.
                      </p>
                    )}
                  </div>
                ) : u1 < u2 ? (
                  /* KASUS A: u1 < u2 (Perlu Meminjam/Menukar 1 Puluhan) */
                  <div className="flex flex-col items-center gap-4 w-full">
                    {/* Penjelasan Edukatif Konsep Meminjam */}
                    <div className="w-full p-3.5 bg-amber-50/95 border-2 border-amber-300 rounded-2xl flex items-start gap-3 text-amber-950 text-xs shadow-2xs">
                      <span className="text-xl shrink-0 mt-0.5">💡</span>
                      <div className="flex flex-col gap-1 text-left">
                        <span className="font-black text-amber-950 font-fredoka text-xs sm:text-sm">
                          Karena Satuan {u1} &lt; {u2}, Kita Pinjam 1 Puluhan dari Kolom Sampingnya!
                        </span>
                        <p className="text-[11.5px] sm:text-xs text-amber-900 leading-relaxed font-medium">
                          Angka satuan di atas (<span className="font-bold">{u1}</span>) tidak cukup dikurangi <span className="font-bold">{u2}</span>. 
                          Oleh karena itu, kita <span className="font-bold underline">meminjam 1 puluhan (= 10 satuan)</span> dari angka puluhan di sampingnya. 
                          Sehingga satuan sekarang menjadi: <span className="font-black text-amber-950">{u1} + 10 = {effectiveU1}</span>!
                        </p>
                      </div>
                    </div>

                    {/* Baris Kartu Perhitungan Setelah Meminjam */}
                    <div className="flex items-center justify-center gap-2 sm:gap-5 flex-wrap">
                      {/* Kartu Satuan Setelah Pinjam (effectiveU1) */}
                      <div className="flex flex-col items-center gap-2 p-3 bg-amber-50/80 rounded-2xl border-2 border-amber-300 shadow-2xs min-w-[130px]">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-black text-orange-950 font-fredoka">
                            {effectiveU1} Satuan
                          </span>
                          <span className="text-[10px] font-bold text-amber-800 bg-white/90 px-2 py-0.5 rounded-full border border-amber-200 mt-0.5">
                            ({u1} awal + 10 pinjaman)
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-w-[150px] items-center justify-center min-h-[44px] p-1.5 bg-white rounded-xl border border-amber-200">
                          {Array.from({ length: effectiveU1 }).map((_, i) => (
                            <UnitCube3D key={i} size={16} />
                          ))}
                        </div>
                      </div>

                      <span className="w-8 h-8 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 flex items-center justify-center font-black text-base shadow-2xs">
                        −
                      </span>

                      {/* Kartu Satuan Bilangan 2 (u2) */}
                      <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-orange-200/90 shadow-2xs min-w-[115px]">
                        <span className="text-xs font-black text-orange-900 font-fredoka">
                          {u2} Satuan
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-w-[130px] items-center justify-center min-h-[44px] p-1.5 bg-white rounded-xl border border-orange-100">
                          {Array.from({ length: u2 }).map((_, i) => (
                            <UnitCube3D key={i} size={16} />
                          ))}
                        </div>
                      </div>

                      <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-black text-base shadow-2xs">
                        =
                      </span>

                      {/* Kotak Input Selisih Satuan */}
                      <div className="flex flex-col items-center gap-2 p-3 bg-orange-50/60 rounded-2xl border-2 border-dashed border-orange-300 min-w-[115px]">
                        <span className="text-xs font-black text-orange-900 font-fredoka">
                          Selisih Satuan
                        </span>
                        <input
                          type="text"
                          data-field-key="diffU"
                          maxLength={2}
                          value={secInputs["diffU"] || ""}
                          onChange={(e) => handleFieldInput("diffU", e.target.value, undefined, String(expDiffU).length)}
                          onKeyDown={(e) => handleKeyDown(e, undefined, undefined)}
                          placeholder="?"
                          className="w-14 h-12 sm:w-16 sm:h-12 text-center font-black text-xl font-fredoka bg-white border-2 border-orange-400 text-orange-950 rounded-xl outline-none focus:ring-4 focus:ring-orange-200 shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Feedback / Petunjuk Bawah */}
                    {parseInt(secInputs["diffU"] || "-1", 10) === expDiffU ? (
                      <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2 text-center animate-in fade-in zoom-in-95 w-full">
                        <span>✅ Hebat! <span className="font-black">{effectiveU1} − {u2} = {expDiffU}</span>. Satuan sudah selesai dihitung! Klik lanjut ke Tahap 3 untuk menghitung sisa puluhan.</span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 font-semibold text-center mt-0.5">
                        Hitung selisih satuan setelah meminjam ({effectiveU1} − {u2}), lalu tuliskan hasilnya di kotak oranye.
                      </p>
                    )}
                  </div>
                ) : (
                  /* KASUS B: u1 >= u2 (Cukup Tanpa Meminjam) */
                  <div className="flex flex-col items-center gap-4 w-full">
                    <div className="flex items-center justify-center gap-2 sm:gap-5 flex-wrap">
                      {/* Kartu Satuan Bilangan 1 */}
                      <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-orange-200/90 shadow-2xs min-w-[115px]">
                        <span className="text-xs font-black text-orange-900 font-fredoka">
                          {u1} Satuan
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-w-[130px] items-center justify-center min-h-[44px]">
                          {Array.from({ length: u1 }).map((_, i) => (
                            <UnitCube3D key={i} size={18} />
                          ))}
                        </div>
                      </div>

                      <span className="w-8 h-8 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 flex items-center justify-center font-black text-base shadow-2xs">
                        −
                      </span>

                      {/* Kartu Satuan Bilangan 2 */}
                      <div className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-orange-200/90 shadow-2xs min-w-[115px]">
                        <span className="text-xs font-black text-orange-900 font-fredoka">
                          {u2} Satuan
                        </span>
                        <div className="flex flex-wrap gap-1.5 max-w-[130px] items-center justify-center min-h-[44px]">
                          {Array.from({ length: u2 }).map((_, i) => (
                            <UnitCube3D key={i} size={18} />
                          ))}
                        </div>
                      </div>

                      <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-black text-base shadow-2xs">
                        =
                      </span>

                      {/* Kotak Input Selisih Satuan */}
                      <div className="flex flex-col items-center gap-2 p-3 bg-orange-50/60 rounded-2xl border-2 border-dashed border-orange-300 min-w-[115px]">
                        <span className="text-xs font-black text-orange-900 font-fredoka">
                          Selisih Satuan
                        </span>
                        <input
                          type="text"
                          data-field-key="diffU"
                          maxLength={2}
                          value={secInputs["diffU"] || ""}
                          onChange={(e) => handleFieldInput("diffU", e.target.value, undefined, String(u1 - u2).length)}
                          onKeyDown={(e) => handleKeyDown(e, undefined, undefined)}
                          placeholder="?"
                          className="w-14 h-12 sm:w-16 sm:h-12 text-center font-black text-xl font-fredoka bg-white border-2 border-orange-400 text-orange-950 rounded-xl outline-none focus:ring-4 focus:ring-orange-200 shadow-2xs"
                        />
                      </div>
                    </div>

                    {parseInt(secInputs["diffU"] || "-1", 10) === (u1 - u2) ? (
                      <div className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center justify-center gap-2 text-center animate-in fade-in zoom-in-95 w-full">
                        <span>✅ Hebat! Selisih satuannya adalah <span className="font-black">{u1 - u2}</span>. Balok satuan cukup sehingga langsung dikurangkan!</span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-500 font-semibold text-center mt-0.5">
                        Kurangkan balok satuan di atas ({u1} − {u2}), lalu tuliskan selisihnya di kotak oranye.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

            {/* Navigasi Section Hitung Satuan */}
            <div className="flex items-center justify-between pt-1">
              {!isSingleDigit ? (
                <button
                  type="button"
                  onClick={() => setCurrentSection(1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  &larr; Kembali ke Tahap 1
                </button>
              ) : (
                <div />
              )}
              <button
                type="button"
                onClick={() => handleValidateSection(isSingleDigit ? 1 : 2)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                <span>{isSingleDigit ? "Periksa & Lanjut ke Hasil Akhir" : "Periksa & Lanjut ke Tahap 3"}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 3: OPERASI PULUHAN / PENGGABUNGAN HASIL & BALOK 3D (Hanya untuk Multi-Digit) */}
        {/* ================================================================= */}
        {!isSingleDigit && currentSection === 3 && currentSection < totalSections && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-black">
                3
              </span>
              <h4 className="font-black text-slate-800 font-fredoka text-sm sm:text-base">
                {sectionMeta[2]?.title}
              </h4>
            </div>

            {/* A. PENJUMLAHAN (+) : HITUNG PULUHAN & RATUSAN */}
            {currentOp === "+" ? (
              <div className="flex flex-col gap-4">
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  {hasHundreds
                    ? "Hitung nilai tempat puluhan dan ratusan:"
                    : "Hitung nilai tempat puluhan:"}
                </p>

                <div className={`w-full ${hasHundreds ? "grid grid-cols-1 lg:grid-cols-2" : "flex flex-col"} gap-4`}>
                  {/* 1. BAGIAN PULUHAN */}
                  <div className="bg-emerald-50/50 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between gap-4 shadow-xs w-full">
                    <div className="flex items-center justify-between w-full border-b border-emerald-100 pb-1.5">
                      <span className="text-xs font-black text-emerald-900 font-fredoka uppercase tracking-wider">
                        Kolom Puluhan
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        {t1} + {t2} {carryT > 0 ? "+ 1 simpanan" : ""}
                      </span>
                    </div>

                    {/* Penjelasan Asal Simpanan di Puluhan */}
                    {carryT > 0 && (
                      <div className="w-full p-2.5 sm:p-3 bg-amber-50/95 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-amber-950 text-xs shadow-2xs animate-in fade-in">
                        <span className="text-base sm:text-lg shrink-0 mt-0.5">💡</span>
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="font-black text-amber-950 font-fredoka text-xs sm:text-sm">
                            Dari mana asal 1 simpanan di puluhan ini?
                          </span>
                          <p className="text-[11px] sm:text-xs text-amber-900 leading-relaxed font-medium">
                            Di tahap perhitungan satuan sebelumnya ({u1} + {u2} = {rawSumU}), hasilnya <span className="font-bold">mencapai 10 atau lebih</span>. Karena itu, <span className="font-bold underline">10 kubus satuan dikelompokkan dan ditukar menjadi 1 batang puluhan</span>, lalu disimpan ke kolom puluhan ini.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Visual Balok Puluhan & Input Langsung di samping '=' */}
                    <div className="flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap">
                      {/* Batang t1 */}
                      <div className="flex flex-col items-center gap-1 p-2 bg-emerald-50/60 rounded-xl border border-emerald-200/70">
                        <span className="text-xs font-black text-emerald-800 font-fredoka">{t1} puluhan</span>
                        <div className="flex flex-wrap gap-1.5 items-end justify-center min-h-[85px] p-1 bg-white rounded-lg border border-emerald-200">
                          {Array.from({ length: t1 }).map((_, i) => (
                            <TenRod3D key={i} height={76} />
                          ))}
                        </div>
                      </div>

                      <span className="text-xl font-black text-emerald-600">+</span>

                      {/* Batang t2 */}
                      <div className="flex flex-col items-center gap-1 p-2 bg-emerald-50/60 rounded-xl border border-emerald-200/70">
                        <span className="text-xs font-black text-emerald-800 font-fredoka">{t2} puluhan</span>
                        <div className="flex flex-wrap gap-1.5 items-end justify-center min-h-[85px] p-1 bg-white rounded-lg border border-emerald-200">
                          {Array.from({ length: t2 }).map((_, i) => (
                            <TenRod3D key={i} height={76} />
                          ))}
                        </div>
                      </div>

                      {/* Batang Simpanan (jika ada) */}
                      {carryT > 0 && (
                        <>
                          <span className="text-xl font-black text-amber-600">+</span>
                          <div className="flex flex-col items-center gap-1.5 p-2 sm:p-2.5 bg-amber-50 rounded-2xl border-2 border-amber-300 shadow-2xs min-w-[125px]">
                            <span className="text-xs font-black text-amber-900 font-fredoka text-center">
                              1 Simpanan
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-bold text-amber-800 bg-white/95 px-2 py-0.5 rounded-full border border-amber-300 text-center leading-tight">
                              Dari Satuan Sebelumnya
                            </span>
                            <div className="flex flex-wrap gap-1.5 items-end justify-center min-h-[85px] p-1 bg-white rounded-xl border border-amber-200 shadow-inner">
                              <TenRod3D variant="amber" height={76} />
                            </div>
                            <span className="text-[9.5px] font-semibold text-amber-900/90 text-center leading-tight max-w-[120px]">
                              (10 satuan ditukar jadi 1 puluhan)
                            </span>
                          </div>
                        </>
                      )}

                      <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-black text-base shadow-2xs">
                        =
                      </span>

                      {/* Kotak Input Langsung Total Puluhan di samping '=' */}
                      <div className="flex flex-col items-center justify-center gap-1 px-4 py-3 bg-emerald-50 rounded-2xl border-2 border-dashed border-emerald-300 min-w-[100px] min-h-[64px] shadow-2xs">
                        <span className="text-[11px] font-bold text-emerald-800">Total Puluhan</span>
                        <input
                          type="text"
                          data-field-key="sumT"
                          maxLength={2}
                          value={secInputs["sumT"] || ""}
                          onChange={(e) =>
                            handleFieldInput(
                              "sumT",
                              e.target.value,
                              hasHundreds ? "sumH" : undefined,
                              String(rawSumT).length
                            )
                          }
                          onKeyDown={(e) =>
                            handleKeyDown(
                              e,
                              undefined,
                              hasHundreds ? "sumH" : undefined
                            )
                          }
                          placeholder="?"
                          className="w-14 h-12 sm:w-16 sm:h-12 text-center font-black text-xl font-fredoka bg-white border-2 border-emerald-400 text-emerald-950 rounded-xl outline-none focus:ring-4 focus:ring-emerald-200 shadow-2xs"
                        />
                      </div>
                    </div>

                    {hasHundreds && rawSumT >= 10 && (
                      parseInt(secInputs["sumT"] || "-1", 10) === rawSumT ? (
                        <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-[11px] font-semibold text-center w-full animate-in fade-in zoom-in-95 mt-1">
                          💡 Hebat! Total puluhan adalah <span className="font-black">{rawSumT}</span> (≥ 10). Maka <span className="font-black">10 puluhan ditukar menjadi 1 lempeng ratusan</span> dan disimpan ke kolom ratusan!
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 font-semibold text-center w-full mt-0.5">
                          Hitung semua batang puluhan (termasuk simpanan jika ada), lalu tuliskan totalnya.
                        </p>
                      )
                    )}
                  </div>

                  {/* 2. BAGIAN RATUSAN (JIKA BILANGAN RATUSAN) */}
                  {hasHundreds && (
                    <div className="bg-blue-50/50 border border-blue-200/90 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between gap-4 shadow-xs w-full">
                      <div className="flex items-center justify-between w-full border-b border-blue-100 pb-1.5">
                        <span className="text-xs font-black text-blue-900 font-fredoka uppercase tracking-wider">
                          Kolom Ratusan
                        </span>
                        <span className="text-[11px] font-bold text-blue-700">
                          {h1} + {h2} {carryH > 0 ? "+ 1 simpanan (dari puluhan)" : ""}
                        </span>
                      </div>

                      {/* Penjelasan Asal Simpanan di Ratusan */}
                      {carryH > 0 && (
                        <div className="w-full p-2.5 sm:p-3 bg-amber-50/95 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-amber-950 text-xs shadow-2xs animate-in fade-in">
                          <span className="text-base sm:text-lg shrink-0 mt-0.5">💡</span>
                          <div className="flex flex-col gap-0.5 text-left">
                            <span className="font-black text-amber-950 font-fredoka text-xs sm:text-sm">
                              Dari mana asal 1 simpanan di ratusan?
                            </span>
                            <p className="text-[11px] sm:text-xs text-amber-900 leading-relaxed font-medium">
                              Di kolom puluhan, hasil penjumlahannya <span className="font-bold">mencapai 10 atau lebih</span>. Karena itu, <span className="font-bold underline">10 puluhan ditukar menjadi 1 lempeng ratusan</span> dan disimpan ke kolom ratusan ini.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap">
                        {/* Balok h1 */}
                        <div className="flex flex-col items-center gap-1 p-2 bg-blue-50/60 rounded-xl border border-blue-200/70">
                          <span className="text-xs font-black text-blue-800 font-fredoka">{h1} ratusan</span>
                          <div className={`flex items-center justify-center min-h-[75px] p-1 bg-white rounded-lg border border-blue-200 ${h1 > 3 ? "grid grid-cols-2 gap-1" : "flex-col -space-y-2"}`}>
                            {Array.from({ length: h1 }).map((_, i) => (
                              <HundredFlat3D key={i} width={h1 > 3 ? 56 : 68} />
                            ))}
                          </div>
                        </div>

                        <span className="text-xl font-black text-blue-600">+</span>

                        {/* Balok h2 */}
                        <div className="flex flex-col items-center gap-1 p-2 bg-blue-50/60 rounded-xl border border-blue-200/70">
                          <span className="text-xs font-black text-blue-800 font-fredoka">{h2} ratusan</span>
                          <div className={`flex items-center justify-center min-h-[75px] p-1 bg-white rounded-lg border border-blue-200 ${h2 > 3 ? "grid grid-cols-2 gap-1" : "flex-col -space-y-2"}`}>
                            {Array.from({ length: h2 }).map((_, i) => (
                              <HundredFlat3D key={i} width={h2 > 3 ? 56 : 68} />
                            ))}
                          </div>
                        </div>

                        {/* Simpanan Ratusan (jika ada) */}
                        {carryH > 0 && (
                          <>
                            <span className="text-xl font-black text-amber-600">+</span>
                            <div className="flex flex-col items-center gap-1.5 p-2 sm:p-2.5 bg-amber-50 rounded-2xl border-2 border-amber-300 shadow-2xs min-w-[125px]">
                              <span className="text-xs font-black text-amber-900 font-fredoka text-center">
                                1 Simpanan
                              </span>
                              <span className="text-[9px] sm:text-[10px] font-bold text-amber-800 bg-white/95 px-2 py-0.5 rounded-full border border-amber-300 text-center leading-tight">
                                Dari Puluhan Sebelumnya
                              </span>
                              <div className="flex flex-col items-center justify-center min-h-[75px] p-1.5 bg-white rounded-xl border border-amber-200 shadow-inner">
                                <HundredFlat3D width={68} />
                              </div>
                              <span className="text-[9.5px] font-semibold text-amber-900/90 text-center leading-tight max-w-[120px]">
                                (10 puluhan ditukar jadi 1 ratusan)
                              </span>
                            </div>
                          </>
                        )}

                        <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-black text-base shadow-2xs">
                          =
                        </span>

                        {/* Kotak Input Langsung Ratusan di samping '=' */}
                        <div className="flex flex-col items-center justify-center gap-1 px-4 py-3 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-300 min-w-[100px] min-h-[64px] shadow-2xs">
                          <span className="text-[11px] font-bold text-blue-800">Total Ratusan</span>
                          <input
                            type="text"
                            data-field-key="sumH"
                            maxLength={2}
                            value={secInputs["sumH"] || ""}
                            onChange={(e) => handleFieldInput("sumH", e.target.value, undefined, String(expSumH).length)}
                            onKeyDown={(e) => handleKeyDown(e, "sumT")}
                            placeholder="?"
                            className="w-14 h-12 sm:w-16 sm:h-12 text-center font-black text-xl font-fredoka bg-white border-2 border-blue-400 text-blue-950 rounded-xl outline-none focus:ring-4 focus:ring-blue-200 shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : currentOp === "-" ? (
              /* B. PENGURANGAN (-) : HITUNG PER NILAI TEMPAT */
              <div className="flex flex-col gap-3.5">
                <p className="text-xs sm:text-sm font-bold text-slate-600">
                  Kurangkan setiap nilai tempat berikut:
                </p>

                {(borrowFromT > 0 || borrowFromH > 0) && (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
                    <span>💡 {borrowFromT > 0 && borrowFromH > 0
                      ? "Nilai tempat ratusan dan puluhan telah ditukar/dipinjam agar cukup dikurangkan."
                      : borrowFromT > 0
                      ? "1 puluhan telah ditukar menjadi 10 satuan."
                      : "1 ratusan telah ditukar menjadi 10 puluhan."}
                    </span>
                  </div>
                )}

                {/* Kartu Visualisasi & Input Per Digit */}
                <div className={`grid grid-cols-1 ${hasHundreds ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3.5`}>
                  {/* KARTU 1: SATUAN */}
                  <div className="bg-amber-50/70 border-2 border-amber-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-between gap-3 shadow-2xs hover:border-amber-300 transition-all">
                    <div className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-xs font-black font-fredoka shadow-2xs">
                      Kolom Satuan
                    </div>

                    {/* Visual Balok Satuan */}
                    <div className="w-full bg-white/90 border border-amber-200/80 rounded-xl p-3 min-h-[110px] flex flex-col items-center justify-center gap-1.5 shadow-inner">
                      <div className="flex flex-wrap items-center justify-center gap-1.5 max-w-[140px]">
                        {Array.from({ length: Math.max(0, isNegativeSub ? expDiffU : effectiveU1) }).map((_, i) => (
                          <UnitCube3D key={i} size={18} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 font-fredoka">
                        {isNegativeSub ? expDiffU : effectiveU1} kubus satuan
                      </span>
                    </div>

                    {/* Formula & Input Box */}
                    <div className="flex flex-col items-center gap-1 w-full pt-1">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-amber-950 font-fredoka">
                          {isNegativeSub ? "Digit Satuan =" : `${effectiveU1} − ${u2} =`}
                        </span>
                        <input
                          type="text"
                          data-field-key="diffU"
                          value={secInputs["diffU"] || ""}
                          onChange={(e) => handleFieldInput("diffU", e.target.value, "diffT", 1)}
                          onKeyDown={(e) => handleKeyDown(e, undefined, "diffT")}
                          placeholder="?"
                          className="w-16 h-11 text-center font-black text-xl font-fredoka bg-white border-2 border-amber-400 text-amber-950 rounded-xl outline-none focus:ring-3 focus:ring-amber-200 shadow-2xs"
                        />
                        <span className="text-xs font-bold text-amber-800">satuan</span>
                      </div>
                    </div>
                  </div>

                  {/* KARTU 2: PULUHAN */}
                  <div className="bg-emerald-50/70 border-2 border-emerald-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-between gap-3 shadow-2xs hover:border-emerald-300 transition-all">
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-full text-xs font-black font-fredoka shadow-2xs">
                      Kolom Puluhan
                    </div>

                    {/* Visual Balok Puluhan */}
                    <div className="w-full bg-white/90 border border-emerald-200/80 rounded-xl p-3 min-h-[110px] flex flex-col items-center justify-center gap-1.5 shadow-inner">
                      <div className="flex flex-wrap items-end justify-center gap-1.5 max-w-[150px]">
                        {Array.from({ length: Math.max(0, isNegativeSub ? expDiffT : effectiveT1) }).map((_, i) => (
                          <TenRod3D key={i} height={72} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 font-fredoka">
                        {isNegativeSub ? expDiffT : effectiveT1} batang puluhan ({(isNegativeSub ? expDiffT : effectiveT1) * 10})
                      </span>
                    </div>

                    {/* Formula & Input Box */}
                    <div className="flex flex-col items-center gap-1 w-full pt-1">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-emerald-950 font-fredoka">
                          {isNegativeSub ? "Digit Puluhan =" : `${effectiveT1} − ${t2} =`}
                        </span>
                        <input
                          type="text"
                          data-field-key="diffT"
                          value={secInputs["diffT"] || ""}
                          onChange={(e) => handleFieldInput("diffT", e.target.value, hasHundreds ? "diffH" : undefined, 1)}
                          onKeyDown={(e) => handleKeyDown(e, "diffU", hasHundreds ? "diffH" : undefined)}
                          placeholder="?"
                          className="w-16 h-11 text-center font-black text-xl font-fredoka bg-white border-2 border-emerald-400 text-emerald-950 rounded-xl outline-none focus:ring-3 focus:ring-emerald-200 shadow-2xs"
                        />
                        <span className="text-xs font-bold text-emerald-800">puluhan</span>
                      </div>
                    </div>
                  </div>

                  {/* KARTU 3: RATUSAN (JIKA ADA) */}
                  {hasHundreds && (
                    <div className="bg-blue-50/70 border-2 border-blue-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col items-center justify-between gap-3 shadow-2xs hover:border-blue-300 transition-all">
                      <div className="px-3 py-1 bg-blue-100 text-blue-900 border border-blue-200 rounded-full text-xs font-black font-fredoka shadow-2xs">
                        Kolom Ratusan
                      </div>

                      {/* Visual Balok Ratusan */}
                      <div className="w-full bg-white/90 border border-blue-200/80 rounded-xl p-3 min-h-[110px] flex flex-col items-center justify-center gap-1.5 shadow-inner">
                        <div className={`flex items-center justify-center ${(isNegativeSub ? expDiffH : effectiveH1) > 3 ? "grid grid-cols-2 gap-1.5" : "flex-col -space-y-2"}`}>
                          {Array.from({ length: Math.max(0, isNegativeSub ? expDiffH : effectiveH1) }).map((_, i) => (
                            <HundredFlat3D key={i} width={(isNegativeSub ? expDiffH : effectiveH1) > 3 ? 56 : 68} />
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-blue-700 font-fredoka">
                          {isNegativeSub ? expDiffH : effectiveH1} lempeng ratusan ({(isNegativeSub ? expDiffH : effectiveH1) * 100})
                        </span>
                      </div>

                      {/* Formula & Input Box */}
                      <div className="flex flex-col items-center gap-1 w-full pt-1">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-xs sm:text-sm font-black text-blue-950 font-fredoka">
                            {isNegativeSub ? "Digit Ratusan =" : `${effectiveH1} − ${h2} =`}
                          </span>
                          <input
                            type="text"
                            data-field-key="diffH"
                            value={secInputs["diffH"] || ""}
                            onChange={(e) => handleFieldInput("diffH", e.target.value, undefined, 1)}
                            onKeyDown={(e) => handleKeyDown(e, "diffT")}
                            placeholder="?"
                            className="w-16 h-11 text-center font-black text-xl font-fredoka bg-white border-2 border-blue-400 text-blue-950 rounded-xl outline-none focus:ring-3 focus:ring-blue-200 shadow-2xs"
                          />
                          <span className="text-xs font-bold text-blue-800">ratusan</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* C. PERKALIAN (×) & PEMBAGIAN (÷) : GABUNGKAN HASIL PECAHAN */
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    {currentOp === "×"
                      ? "Gabungkan (jumlahkan) semua hasil perkalian bagian di bawah ini:"
                      : "Gabungkan (jumlahkan) semua hasil pembagian bagian di bawah ini:"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Jumlahkan hasil setiap pecahan untuk mendapatkan jawaban keseluruhan!
                  </p>
                </div>

                {/* Bagian Gabungkan Hasil Perhitungan */}
                <div className="flex flex-col items-center gap-4 bg-slate-50/80 border-2 border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-2xs">
                  {/* Top Row: Nilai-nilai bagian */}
                  <div className="flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
                    {hasDecH && (
                      <>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[11px] font-bold text-blue-700 font-fredoka">
                            {currentOp === "×" ? `${multiplierNum} × ${valH}` : `${valH} ÷ ${multiplierNum}`}
                          </span>
                          <div className="px-4 py-2 rounded-2xl bg-blue-100 border-2 border-blue-300 text-blue-900 font-fredoka font-black text-lg sm:text-xl shadow-2xs min-w-[75px] text-center">
                            {currentOp === "×" ? expPartH : expQuotH}
                          </div>
                        </div>
                        <span className="text-xl font-black text-slate-400 mt-5">+</span>
                      </>
                    )}

                    {hasDecT && (
                      <>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[11px] font-bold text-emerald-700 font-fredoka">
                            {currentOp === "×" ? `${multiplierNum} × ${valT}` : `${valT} ÷ ${multiplierNum}`}
                          </span>
                          <div className="px-4 py-2 rounded-2xl bg-emerald-100 border-2 border-emerald-300 text-emerald-900 font-fredoka font-black text-lg sm:text-xl shadow-2xs min-w-[75px] text-center">
                            {currentOp === "×" ? expPartT : expQuotT}
                          </div>
                        </div>
                        <span className="text-xl font-black text-slate-400 mt-5">+</span>
                      </>
                    )}

                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[11px] font-bold text-amber-700 font-fredoka">
                        {currentOp === "×" ? `${multiplierNum} × ${valU}` : `${valU} ÷ ${multiplierNum}`}
                      </span>
                      <div className="px-4 py-2 rounded-2xl bg-amber-100 border-2 border-amber-300 text-amber-900 font-fredoka font-black text-lg sm:text-xl shadow-2xs min-w-[75px] text-center">
                        {currentOp === "×" ? expPartU : expQuotU}
                      </div>
                    </div>
                  </div>

                  {/* Curly Bracket SVG Menunjuk ke Bawah */}
                  <svg className="w-56 h-6 text-rose-300" viewBox="0 0 200 24" fill="none">
                    <path
                      d="M 10 2 Q 10 14 50 14 L 90 14 Q 100 14 100 22 Q 100 14 110 14 L 150 14 Q 190 14 190 2"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Big Pink Combined Input Box */}
                  <div className="flex flex-col items-center gap-2">
                    <input
                      type="text"
                      data-field-key="combined"
                      value={secInputs["combined"] || ""}
                      onChange={(e) => handleFieldInput("combined", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e)}
                      placeholder="?"
                      className="w-48 sm:w-60 h-14 text-center font-black text-xl sm:text-2xl font-fredoka bg-rose-100/90 border-3 border-rose-300 text-rose-950 rounded-2xl focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-200 outline-none transition shadow-xs placeholder:text-rose-400/80"
                    />
                    <span className="text-xs sm:text-sm font-black text-slate-700 font-fredoka">
                      Jadi, {num1} {opSymbol} {num2} = ?
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigasi Section 3 */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setCurrentSection(2)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                &larr; Kembali ke Tahap 2
              </button>
              <button
                type="button"
                onClick={() => handleValidateSection(3)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer shadow-sm"
              >
                <span>Periksa & Lanjut ke Tahap 4</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION HASIL AKHIR & VALIDASI KESELURUHAN (Tahap 2 jika satuan, Tahap 4 jika multi-digit +, -, Tahap 3 jika ×) */}
        {/* ================================================================= */}
        {currentSection === totalSections && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-black">
                {totalSections}
              </span>
              <h4 className="font-black text-slate-800 font-fredoka text-sm sm:text-base">
                {sectionMeta[totalSections - 1]?.title || "Hasil Akhir & Validasi"}
              </h4>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-600 text-center">
              Tulis hasil akhirnya.
            </p>

            {/* TABEL RINGKASAN NILAI TEMPAT DARI PERHITUNGAN SEBELUMNYA (SESUAI GAMBAR) */}
            {(() => {
              const absAns = Math.abs(expectedFinalAnswer);
              const ansRTh = Math.floor(absAns / 100000) % 10; // Ratus Ribuan (0-9)
              const ansPTh = Math.floor(absAns / 10000) % 10;  // Puluh Ribuan (0-9)
              const ansTh = Math.floor(absAns / 1000) % 10;    // Ribuan (0-9)
              const ansH = Math.floor(absAns / 100) % 10;      // Ratusan (0-9)
              const ansT = Math.floor(absAns / 10) % 10;       // Puluhan (0-9)
              const ansU = absAns % 10;                        // Satuan (0-9)

              const showRTh = absAns >= 100000;
              const showPTh = absAns >= 10000;
              const showTh = absAns >= 1000;
              const showH = absAns >= 100 || hasHundreds;
              const showT = absAns >= 10 || hasTens || showH;

              return (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full max-w-sm sm:max-w-xl rounded-2xl border-2 border-slate-200 overflow-hidden bg-white shadow-2xs">
                    <div
                      className={`grid ${
                        expectedFinalAnswer < 0
                          ? showRTh ? "grid-cols-7" : showPTh ? "grid-cols-6" : showTh ? "grid-cols-5" : showH ? "grid-cols-4" : showT ? "grid-cols-3" : "grid-cols-2"
                          : showRTh ? "grid-cols-6" : showPTh ? "grid-cols-5" : showTh ? "grid-cols-4" : showH ? "grid-cols-3" : showT ? "grid-cols-2" : "grid-cols-1"
                      } text-center`}
                    >
                      {/* Header Row */}
                      {expectedFinalAnswer < 0 && (
                        <div className="py-2.5 bg-rose-200 text-rose-950 border-b-2 border-r-2 border-slate-200 text-xs sm:text-sm font-black font-fredoka">
                          Tanda
                        </div>
                      )}
                      {showRTh && (
                        <div className="py-2.5 bg-teal-100 text-teal-900 border-b-2 border-r-2 border-slate-200 text-xs sm:text-sm font-black font-fredoka">
                          Ratus Rb
                        </div>
                      )}
                      {showPTh && (
                        <div className="py-2.5 bg-indigo-100 text-indigo-900 border-b-2 border-r-2 border-slate-200 text-xs sm:text-sm font-black font-fredoka">
                          Puluh Rb
                        </div>
                      )}
                      {showTh && (
                        <div className="py-2.5 bg-purple-100 text-purple-900 border-b-2 border-r-2 border-slate-200 text-xs sm:text-sm font-black font-fredoka">
                          Ribuan (Rb)
                        </div>
                      )}
                      {showH && (
                        <div className="py-2.5 bg-blue-100 text-blue-900 border-b-2 border-r-2 border-slate-200 text-xs sm:text-sm font-black font-fredoka">
                          Ratusan (R)
                        </div>
                      )}
                      {showT && (
                        <div className={`py-2.5 bg-sky-100 text-sky-900 border-b-2 border-slate-200 text-xs sm:text-sm font-black font-fredoka ${showT ? "border-r-2" : ""}`}>
                          Puluhan (P)
                        </div>
                      )}
                      <div className="py-2.5 bg-rose-100 text-rose-900 border-b-2 border-slate-200 text-xs sm:text-sm font-black font-fredoka">
                        Satuan (S)
                      </div>

                      {/* Values Row - Setiap kolom menampilkan 1 digit (0-9) */}
                      {expectedFinalAnswer < 0 && (
                        <div className="p-3.5 flex items-center justify-center bg-rose-50/50 border-r-2 border-slate-200">
                          <div className="w-14 h-12 flex items-center justify-center bg-rose-100 rounded-xl border-2 border-rose-400 font-black text-2xl font-fredoka text-rose-700 shadow-2xs">
                            −
                          </div>
                        </div>
                      )}
                      {showRTh && (
                        <div className="p-3.5 flex items-center justify-center bg-white border-r-2 border-slate-200">
                          <div className="w-14 h-12 flex items-center justify-center bg-white rounded-xl border-2 border-teal-400 font-black text-2xl font-fredoka text-slate-800 shadow-2xs">
                            {ansRTh}
                          </div>
                        </div>
                      )}
                      {showPTh && (
                        <div className="p-3.5 flex items-center justify-center bg-white border-r-2 border-slate-200">
                          <div className="w-14 h-12 flex items-center justify-center bg-white rounded-xl border-2 border-indigo-400 font-black text-2xl font-fredoka text-slate-800 shadow-2xs">
                            {ansPTh}
                          </div>
                        </div>
                      )}
                      {showTh && (
                        <div className="p-3.5 flex items-center justify-center bg-white border-r-2 border-slate-200">
                          <div className="w-14 h-12 flex items-center justify-center bg-white rounded-xl border-2 border-purple-400 font-black text-2xl font-fredoka text-slate-800 shadow-2xs">
                            {ansTh}
                          </div>
                        </div>
                      )}
                      {showH && (
                        <div className="p-3.5 flex items-center justify-center bg-white border-r-2 border-slate-200">
                          <div className="w-14 h-12 flex items-center justify-center bg-white rounded-xl border-2 border-sky-400 font-black text-2xl font-fredoka text-slate-800 shadow-2xs">
                            {ansH}
                          </div>
                        </div>
                      )}
                      {showT && (
                        <div className="p-3.5 flex items-center justify-center bg-white border-r-2 border-slate-200">
                          <div className="w-14 h-12 flex items-center justify-center bg-white rounded-xl border-2 border-blue-400 font-black text-2xl font-fredoka text-slate-800 shadow-2xs">
                            {ansT}
                          </div>
                        </div>
                      )}
                      <div className="p-3.5 flex items-center justify-center bg-white">
                        <div className="w-14 h-12 flex items-center justify-center bg-white rounded-xl border-2 border-rose-400 font-black text-2xl font-fredoka text-slate-800 shadow-2xs">
                          {ansU}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* KARTU HIJAU HASIL AKHIR - PLACEHOLDER TIDAK MEMBOCORKAN JAWABAN */}
                  <div className="w-full max-w-sm sm:max-w-md p-4 bg-emerald-100/90 border-2 border-emerald-300 rounded-2xl flex flex-wrap items-center justify-center gap-3 shadow-2xs">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 font-fredoka">
                      {num1} {opSymbol} {num2} =
                    </span>
                    <input
                      type="text"
                      id="practice-final-answer"
                      data-field-key="finalAnswer"
                      value={secInputs["finalAnswer"] || ""}
                      onChange={(e) => handleFieldInput("finalAnswer", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e)}
                      placeholder={expectedFinalAnswer < 0 ? "-?" : "?"}
                      className="w-28 sm:w-36 h-12 sm:h-14 text-center font-black text-2xl sm:text-3xl font-fredoka text-emerald-950 bg-white border-2 border-emerald-500 rounded-2xl shadow-xs outline-none focus:ring-4 focus:ring-emerald-200 placeholder:text-emerald-400/50"
                    />

                    {!isQuestionFinished && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setCurrentSection(totalSections - 1)}
                          className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        >
                          &larr; Kembali ke Tahap {totalSections - 1}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleValidateSection(totalSections)}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-sm shadow-sm transition cursor-pointer"
                        >
                          Selesaikan Soal
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Apresiasi Maskot saat Berhasil Tuntas */}
            {isQuestionFinished && (
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl animate-in zoom-in-95">
                <div className="w-12 h-12 shrink-0">
                  <GirlMascotVector size={48} />
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-900 font-fredoka">
                    Hebat Sekali! Semua Tahap Selesai! 🎉
                  </p>
                  <p className="text-xs font-bold text-slate-600">
                    Kamu berhasil menyelesaikan alur latihan ini langkah demi langkah dengan sangat baik!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FEEDBACK DIAGNOSTIK JIKA ADA KESALAHAN PADA SECTION */}
        {sectionErrorNotice && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-start gap-2.5 animate-in shake">
            <HelpCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-black text-rose-900 block font-fredoka">
                Perhatian di Tahap {currentSection}:
              </span>
              <span className="text-xs font-semibold text-rose-800">
                {sectionErrorNotice}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 5. BOTTOM ACTION BAR: KEMBALI, SELESAI & REKAP, ULANGI SOAL, SOAL BERIKUTNYA */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 flex-wrap">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-black text-xs sm:text-sm border border-slate-200 shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Kembali</span>
        </button>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onFinishSession && hasAnsweredAny && (
            <button
              type="button"
              onClick={onFinishSession}
              className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs sm:text-sm border border-indigo-200 transition cursor-pointer shadow-2xs"
              title="Lihat rekap evaluasi dan selesaikan sesi latihan"
            >
              <Award size={15} />
              <span>Selesai & Rekap Sesi</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNewProblem}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-black text-xs sm:text-sm border border-slate-200 shadow-2xs transition cursor-pointer"
            title="Dapatkan soal baru dengan angka berbeda"
          >
            <RotateCcw size={15} />
            <span>Ulangi Soal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (questionNumber >= totalQuestions && isQuestionFinished && onFinishSession) {
                onFinishSession();
              } else {
                onNewProblem();
              }
            }}
            className={`flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-2xl text-white font-black text-xs sm:text-sm shadow-md transition cursor-pointer ${
              isQuestionFinished
                ? "bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-emerald-500/25 ring-2 ring-emerald-300"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25"
            }`}
          >
            <CheckCircle2 size={16} />
            <span>
              {isQuestionFinished
                ? questionNumber >= totalQuestions
                  ? "Selesai & Lihat Rapor 🎉"
                  : "Soal Berikutnya ➔"
                : "Lewati / Soal Baru"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
