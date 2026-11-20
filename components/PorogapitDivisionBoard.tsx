"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  HelpCircle,
  Award,
  Sparkles,
  AlertCircle,
  ArrowDown,
  Check,
} from "lucide-react";
import {
  solvePorogapit,
  PorogapitSolution,
  PorogapitStage,
} from "@/lib/porogapitEngine";
import { SectionDiagnostic } from "@/lib/errorDiagnostics";
import { GirlMascotVector, BoyMascotVector } from "./ChildMascots";
import DigitComboSelectorRow from "./DigitComboSelectorRow";
import confetti from "canvas-confetti";

interface PorogapitDivisionBoardProps {
  num1: number;
  num2: number;
  questionNumber: number;
  totalQuestions: number;
  levelName: string;
  onQuestionCompleted: (
    isCleanPass: boolean,
    sections: SectionDiagnostic[]
  ) => void;
  onNewProblem: () => void;
  onBack?: () => void;
  onFinishSession?: () => void;
  onSectionChanged?: (secId: number) => void;
  hasAnsweredAny?: boolean;
  isAutoSaving?: boolean;
  currentCombo?: string;
  onSelectCombo?: (combo: string) => void;
}

interface PorogapitSectionMeta {
  id: number;
  type: "setup" | "stage" | "final";
  stageIdx: number;
  title: string;
  subtitle: string;
}

const buildSectionMeta = (sol: PorogapitSolution): PorogapitSectionMeta[] => {
  const list: PorogapitSectionMeta[] = [
    {
      id: 1,
      type: "setup",
      stageIdx: -1,
      title: "Susun Papan Porogapit",
      subtitle: "Tentukan pembagi, bilangan, dan kelompok angka awal",
    },
  ];

  sol.stages.forEach((stg, idx) => {
    let title = "";
    let subtitle = "";
    if (idx === 0) {
      if (sol.num1 < sol.num2) {
        title = "Pengurangan Berulang (Desimal)";
        subtitle = `Kurangi berulang kali dengan ${sol.num2}`;
      } else {
        title = sol.stages.length === 1 ? "Pengurangan Berulang" : "Pengurangan Bagian 1";
        subtitle = `Kurangi berulang kali dengan ${sol.num2}`;
      }
    } else if (stg.isDecimalStep) {
      title = "Sisa Ditambah 0 (Desimal)";
      const prevRem = sol.stages[idx - 1]?.remainder ?? 0;
      subtitle = `Sisa ${prevRem} ditambah 0 → ${stg.startVal} dikurangi ${sol.num2}`;
    } else {
      const prevBrought = sol.stages[idx - 1]?.broughtDownDigit ?? "";
      title = `Turunkan Angka (Bagian ${idx + 1})`;
      subtitle = `Turunkan digit ${prevBrought} → ${stg.startVal} ÷ ${sol.num2}`;
    }

    list.push({
      id: idx + 2,
      type: "stage",
      stageIdx: idx,
      title,
      subtitle,
    });
  });

  const finalId = sol.stages.length + 2;
  list.push({
    id: finalId,
    type: "final",
    stageIdx: -1,
    title: "Tulis Hasil Pembagian",
    subtitle: "Baca angka di atas kurung porogapit",
  });

  return list;
};

export default function PorogapitDivisionBoard({
  num1,
  num2,
  questionNumber,
  totalQuestions,
  levelName,
  onQuestionCompleted,
  onNewProblem,
  onBack,
  onFinishSession,
  onSectionChanged,
  hasAnsweredAny = false,
  isAutoSaving = false,
  currentCombo,
  onSelectCombo,
}: PorogapitDivisionBoardProps) {
  // Hitung solusi porogapit pengurangan berulang
  const [solution, setSolution] = useState<PorogapitSolution>(() =>
    solvePorogapit(num1, num2)
  );

  const [sectionMeta, setSectionMeta] = useState<PorogapitSectionMeta[]>(() =>
    buildSectionMeta(solvePorogapit(num1, num2))
  );

  // Stepper Section State (1 s/d totalSections)
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [secInputs, setSecInputs] = useState<{ [key: string]: string }>({});
  const [sectionErrorNotice, setSectionErrorNotice] = useState<string | null>(
    null
  );
  const [isSectionShaking, setIsSectionShaking] = useState<boolean>(false);
  const [hasFailedAnySection, setHasFailedAnySection] =
    useState<boolean>(false);
  const [isQuestionFinished, setIsQuestionFinished] = useState<boolean>(false);

  const [sectionDiagnostics, setSectionDiagnostics] = useState<
    SectionDiagnostic[]
  >(() =>
    buildSectionMeta(solvePorogapit(num1, num2)).map((s) => ({
      sectionId: s.id,
      sectionName: s.title,
      status: "skipped",
    }))
  );

  // Hitung ulang solusi jika num1 atau num2 berubah
  useEffect(() => {
    const sol = solvePorogapit(num1, num2);
    setSolution(sol);
    const newMeta = buildSectionMeta(sol);
    setSectionMeta(newMeta);
    setCurrentSection(1);
    setSecInputs({});
    setSectionErrorNotice(null);
    setHasFailedAnySection(false);
    setIsQuestionFinished(false);
    setSectionDiagnostics(
      newMeta.map((s) => ({
        sectionId: s.id,
        sectionName: s.title,
        status: "skipped",
      }))
    );
  }, [num1, num2]);

  // Sync active section to parent (RightHelperPanel sync)
  useEffect(() => {
    if (onSectionChanged) onSectionChanged(currentSection);
  }, [currentSection, onSectionChanged]);

  // Audio synthesizer
  const playSound = (type: "success" | "error") => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
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
      console.log("Audio handled non-blocking", e);
    }
  };

  // Text to speech
  const speakProblem = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const text = `Berapa ${num1} dibagi ${num2}? Kita gunakan porogapit metode pengurangan berulang.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // Helper input change
  const handleInputChange = (key: string, val: string) => {
    // Izinkan angka, minus, koma, dan titik
    const clean = val.replace(/[^0-9,\.-]/g, "");
    setSecInputs((prev) => ({ ...prev, [key]: clean }));
    if (sectionErrorNotice) setSectionErrorNotice(null);
  };

  // Validasi per tahap
  const validateSection = (secId: number) => {
    let isCorrect = false;
    let errorMessage = "";
    let detectedErrorType = "SALAH_POROGAPIT";
    let detectedErrorDetail = "";
    let detectedIntervention = "";

    const curMeta = sectionMeta.find((s) => s.id === secId);
    if (!curMeta) return;

    if (curMeta.type === "setup") {
      // Tahap 1: Setup Papan Porogapit
      const inDivisor = parseInt(secInputs["s1_divisor"] || "-1", 10);
      const inDividend = parseInt(secInputs["s1_dividend"] || "-1", 10);
      const inChunk = parseInt(secInputs["s1_chunk"] || "-1", 10);

      const expChunk = solution.initialChunk;
      const divisorOk = inDivisor === num2;
      const dividendOk = inDividend === num1;
      const chunkOk = inChunk === expChunk;

      isCorrect = divisorOk && dividendOk && chunkOk;

      if (!isCorrect) {
        if (!divisorOk) {
          errorMessage = `Angka pembagi di luar kurung adalah ${num2}.`;
        } else if (!dividendOk) {
          errorMessage = `Bilangan yang dibagi di dalam kurung adalah ${num1}.`;
        } else {
          errorMessage =
            num1 < num2
              ? solution.zerosAdded > 1
                ? `Tambahkan angka 0 di belakang ${num1} satu per satu sampai bilangannya tidak lebih kecil dari ${num2}. Ingat, menambah satu 0 saja belum cukup!`
                : `Tambahkan satu angka 0 di belakang ${num1}. Bilangan ${num1} dengan tambahan 0 di belakangnya menjadi berapa?`
              : `Ambil angka dari depan (kiri) satu per satu sampai bilangannya tidak lebih kecil dari ${num2}.`;
        }
        detectedErrorDetail = `Kekeliruan setup papan porogapit untuk ${num1} ÷ ${num2}.`;
        detectedIntervention =
          "Bimbing siswa mengidentifikasi posisi pembagi di luar kurung dan kelompok angka awal.";
      }
    } else if (curMeta.type === "stage") {
      // Validasi Tangga Pengurangan untuk stage tertentu
      const stage = solution.stages[curMeta.stageIdx];
      let allSubsCorrect = true;

      stage.subtractions.forEach((sub, idx) => {
        const key = `s${secId}_sub_${idx + 1}`;
        const userVal = parseInt(secInputs[key] || "-9999", 10);
        if (userVal !== sub.resultVal) {
          allSubsCorrect = false;
        }
      });

      const inCount = parseInt(secInputs[`s${secId}_count`] || "-1", 10);
      const countOk = inCount === stage.subtractionsCount;

      isCorrect = allSubsCorrect && countOk;

      if (!isCorrect) {
        if (!allSubsCorrect) {
          errorMessage = `Periksa kembali hasil pengurangan berulang dengan angka ${num2}!`;
        } else {
          errorMessage = `Hitung berapa kali pengurangan berhasil dilakukan: ${stage.subtractionsCount} kali!`;
        }
        detectedErrorDetail = `Kekeliruan pada tangga pengurangan tahap ${curMeta.title} (${stage.startVal} ÷ ${num2}).`;
        detectedIntervention =
          "Bimbing siswa menghitung pengurangan berulang dengan teliti sampai sisanya lebih kecil dari pembagi.";
      }
    } else if (curMeta.type === "final") {
      // Tahap Hasil Akhir & Validasi
      const rawInput = (secInputs["finalAnswer"] || "").trim().replace(",", ".");
      const userFloat = parseFloat(rawInput);
      const isNumCorrect =
        !isNaN(userFloat) &&
        Math.abs(userFloat - solution.numericAnswer) < 0.01;

      isCorrect = isNumCorrect;

      if (!isCorrect) {
        errorMessage = `Tuliskan hasil akhir pembagian dengan tepat (${solution.quotientStr}).`;
        detectedErrorDetail = `Hasil akhir dijawab "${secInputs["finalAnswer"]}", seharusnya "${solution.quotientStr}".`;
        detectedIntervention =
          "Bimbing siswa merangkai digit-digit hasil pengurangan berulang menjadi hasil bagi utuh.";
      }
    }

    // Catat diagnostik evaluasi
    setSectionDiagnostics((prev) =>
      prev.map((s) => {
        if (s.sectionId === secId) {
          const isPreviouslyFailed = s.hadMistake;
          return {
            ...s,
            status: isCorrect ? "correct" : "incorrect",
            hadMistake: isPreviouslyFailed || !isCorrect,
            attempts: (s.attempts || 0) + 1,
            errorType: isCorrect ? undefined : detectedErrorType,
            errorDetail: isCorrect ? undefined : detectedErrorDetail,
            suggestedIntervention: isCorrect ? undefined : detectedIntervention,
          };
        }
        return s;
      })
    );

    if (!isCorrect) {
      setHasFailedAnySection(true);
      setSectionErrorNotice(errorMessage);
      setIsSectionShaking(true);
      setTimeout(() => setIsSectionShaking(false), 500);
      playSound("error");
    } else {
      playSound("success");
      setSectionErrorNotice(null);

      if (secId < sectionMeta.length) {
        setCurrentSection(secId + 1);
      } else {
        // TUNTAS SELESAI SOAL
        setIsQuestionFinished(true);
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
        const isCleanPass = !hasFailedAnySection;
        const finalSecs = sectionDiagnostics.map((s) =>
          s.sectionId === secId ? { ...s, status: "correct" as const } : s
        );
        onQuestionCompleted(isCleanPass, finalSecs);
      }
    }
  };

  const currentMeta =
    sectionMeta.find((s) => s.id === currentSection) || sectionMeta[0];

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col gap-5 select-none relative overflow-hidden">
      {/* HEADER SOAL & LEVEL */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
              title="Kembali ke beranda"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <span className="text-xs sm:text-sm font-extrabold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200/80">
            {levelName}
          </span>
          <span className="text-xs font-bold text-slate-400">
            Soal {questionNumber} dari {totalQuestions}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAutoSaving && (
            <span className="text-[10px] text-purple-600 font-bold animate-pulse">
              Menyimpan...
            </span>
          )}
          <button
            type="button"
            onClick={speakProblem}
            className="p-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer"
            title="Dengarkan soal"
          >
            <Volume2 size={16} />
          </button>
        </div>
      </div>

      <DigitComboSelectorRow
        op="÷"
        currentCombo={currentCombo}
        onSelectCombo={onSelectCombo}
        onNewProblem={onNewProblem}
        accent="purple"
      />

      {/* BANNER SOAL UTAMA */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-indigo-600 text-white rounded-2xl p-4 sm:p-5 shadow-sm gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-2xl border border-white/30 shrink-0">
            ÷
          </div>
          <div>
            <span className="text-[11px] uppercase tracking-wider text-purple-200 font-black font-fredoka block">
              Porogapit Pengurangan Berulang
            </span>
            <h2 className="text-2xl sm:text-3xl font-black font-fredoka tracking-wide">
              {num1} ÷ {num2} = {isQuestionFinished ? solution.quotientStr : "?"}
            </h2>
          </div>
        </div>

        {solution.isDecimal && (
          <div className="px-3 py-1.5 bg-amber-400 text-amber-950 font-black text-xs font-fredoka rounded-xl shadow-xs shrink-0 flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Hasil Desimal (Koma)</span>
          </div>
        )}
      </div>

      {/* STEPPER DINAMIS */}
      <div
        className={`grid grid-cols-2 ${
          sectionMeta.length === 3
            ? "sm:grid-cols-3"
            : sectionMeta.length === 5
            ? "sm:grid-cols-5"
            : "sm:grid-cols-4"
        } gap-2`}
      >
        {sectionMeta.map((s) => {
          const isActive = currentSection === s.id;
          const isDone = currentSection > s.id || isQuestionFinished;

          return (
            <div
              key={s.id}
              className={`p-2.5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                isActive
                  ? "bg-purple-100/90 border-purple-400 ring-2 ring-purple-300 shadow-2xs"
                  : isDone
                  ? "bg-emerald-50/70 border-emerald-300 text-emerald-900"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  Tahap {s.id}
                </span>
                {isDone && <Check size={14} className="text-emerald-600 stroke-[3]" />}
              </div>
              <h4 className="text-xs font-black line-clamp-1 text-slate-800 font-fredoka">
                {s.title}
              </h4>
              <p className="text-[10px] text-slate-500 line-clamp-1">
                {s.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* PERINGATAN KESALAHAN JIKA ADA */}
      {sectionErrorNotice && (
        <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-rose-800 animate-in fade-in duration-200">
          <AlertCircle size={18} className="shrink-0 text-rose-600" />
          <span>{sectionErrorNotice}</span>
        </div>
      )}

      {/* ====================================================================== */}
      {/* AREA UTAMA: TAMPILAN PAPAN POROGAPIT & TANGGA PENGURANGAN BERULANG    */}
      {/* ====================================================================== */}
      <div
        className={`bg-slate-50/70 border-2 border-slate-200 rounded-3xl p-4 sm:p-6 transition-all ${
          isSectionShaking ? "animate-shake" : ""
        }`}
      >
        {/* TAHAP 1: SUSUN PAPAN POROGAPIT */}
        {currentMeta.type === "setup" && (
          <div className="flex flex-col gap-5 items-center">
            <div className="text-center max-w-lg">
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-fredoka mb-1">
                Tahap 1: Susun Papan Porogapit
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Tuliskan angka <strong>pembagi ({num2})</strong> di luar kurung
                porogapit dan bilangan yang <strong>dibagi ({num1})</strong> di
                dalam kurung.
              </p>
            </div>

            {/* Visual Bentuk Porogapit Interaktif */}
            <div className="p-6 bg-white border-2 border-purple-200 rounded-3xl shadow-sm flex items-start gap-3 sm:gap-4 select-none">
              {/* Input Pembagi (di luar kurung) */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold text-purple-700">
                  Pembagi:
                </span>
                <input
                  type="text"
                  value={secInputs["s1_divisor"] || ""}
                  onChange={(e) => handleInputChange("s1_divisor", e.target.value)}
                  placeholder="?"
                  className="w-16 sm:w-20 h-14 text-center font-black text-xl font-fredoka bg-purple-50 border-2 border-purple-300 text-purple-950 rounded-2xl focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100 outline-none transition"
                />
              </div>

              {/* Kurung Porogapit (Radical / Hook Bar) */}
              <div className="flex flex-col">
                {/* Garis horizontal atas porogapit */}
                <div className="border-b-4 border-slate-800 pb-2 flex items-center justify-center px-4 min-h-[44px]">
                  {num1 < num2 && parseInt(secInputs["s1_chunk"] || "-1", 10) === solution.initialChunk ? (
                    <div className="flex items-center gap-1.5 bg-amber-100/90 border border-amber-300 px-3 py-1 rounded-xl shadow-2xs animate-in zoom-in-95 duration-300">
                      <span className="text-xs font-bold text-amber-900">Hasil di atas:</span>
                      <span className="text-base font-black text-amber-950 font-fredoka bg-white px-2.5 py-0.5 rounded-lg border border-amber-300">
                        {solution.decimalPrefix}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 italic">
                      (Tempat hasil bagi)
                    </span>
                  )}
                </div>

                {/* Garis vertikal pembatas kiri porogapit */}
                <div className="border-l-4 border-slate-800 pl-4 pt-3 flex flex-col gap-2">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[11px] font-bold text-slate-600">
                      Bilangan yang Dibagi:
                    </span>
                    <input
                      type="text"
                      value={secInputs["s1_dividend"] || ""}
                      onChange={(e) =>
                        handleInputChange("s1_dividend", e.target.value)
                      }
                      placeholder="?"
                      className="w-24 sm:w-32 h-14 text-center font-black text-2xl font-fredoka bg-indigo-50 border-2 border-indigo-300 text-indigo-950 rounded-2xl focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 outline-none transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pertanyaan Pemahaman Kelompok Awal */}
            {(() => {
              const isChunkCorrect = parseInt(secInputs["s1_chunk"] || "-1", 10) === solution.initialChunk;
              const zerosAdded = solution.zerosAdded;
              return (
                <div className="w-full max-w-md bg-purple-50/80 border border-purple-200 rounded-2xl p-4 flex flex-col gap-2.5">
                  {num1 < num2 ? (
                    <div className="flex flex-col gap-1.5 text-xs sm:text-sm text-purple-950 leading-relaxed">
                      <span className="font-black font-fredoka">
                        {num1} lebih kecil dari {num2}, jadi {num1} belum bisa dikurangi {num2}.
                      </span>
                      <span className="font-semibold">
                        {zerosAdded > 1
                          ? `Tambahkan angka 0 di belakang ${num1}. Jika masih lebih kecil dari ${num2}, tambahkan 0 lagi. Ulangi sampai bilangannya bisa dikurangi ${num2}.`
                          : `Tambahkan satu angka 0 di belakang ${num1} supaya bisa dikurangi ${num2}.`}
                      </span>
                      <span className="font-black text-purple-900">
                        Bilangannya sekarang menjadi:
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs sm:text-sm font-black text-purple-900 font-fredoka leading-relaxed">
                      Ambil angka dari depan (kiri) sampai bilangannya bisa dikurangi {num2}. Bilangan yang diambil:
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={secInputs["s1_chunk"] || ""}
                      onChange={(e) => handleInputChange("s1_chunk", e.target.value)}
                      placeholder="?"
                      className={`w-28 h-12 text-center font-black text-lg font-fredoka bg-white border-2 rounded-xl outline-none shadow-2xs ${
                        isChunkCorrect
                          ? "border-emerald-500 text-emerald-800"
                          : "border-purple-300 focus:border-purple-600"
                      }`}
                    />
                    {isChunkCorrect && (
                      <Check size={22} className="text-emerald-600 stroke-[3]" />
                    )}
                  </div>
                  {num1 < num2 && isChunkCorrect && (
                    <div className="p-3 bg-amber-50 border-2 border-amber-300 rounded-xl text-xs sm:text-sm text-amber-950 font-semibold leading-relaxed animate-in fade-in slide-in-from-top-1 duration-300">
                      {zerosAdded > 1 ? (
                        <>
                          Kita menambahkan <strong>{zerosAdded} angka 0</strong> ({num1} → {Array.from({ length: zerosAdded }, (_, i) => num1 * Math.pow(10, i + 1)).join(" → ")}). Karena itu, di atas kurung ditulis <strong className="font-fredoka text-base">{solution.decimalPrefix}</strong> — angka 0 pertama ditulis <strong>0,</strong> (nol koma), dan setiap tambahan 0 berikutnya ditulis sebagai angka 0 di belakang koma.
                        </>
                      ) : (
                        <>
                          Kita menambahkan <strong>1 angka 0</strong> ({num1} → {solution.initialChunk}). Di atas kurung ditulis <strong className="font-fredoka text-base">0,</strong> (nol koma).
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            <button
              type="button"
              onClick={() => validateSection(1)}
              className="mt-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-sm font-fredoka shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 transform active:scale-95"
            >
              <span>Periksa & Lanjut ke Pengurangan Berulang</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* TAHAP PENGURANGAN BERULANG DINAMIS (Mendukung semua stage termasuk sisa desimal) */}
        {currentMeta.type === "stage" && (() => {
          const currentStage = solution.stages[currentMeta.stageIdx];
          if (!currentStage) return null;

          const isFirstStage = currentMeta.stageIdx === 0;
          const prevStage = !isFirstStage ? solution.stages[currentMeta.stageIdx - 1] : null;

          return (
            <div className="flex flex-col gap-5 items-center">
              <div className="text-center max-w-lg">
                <h3 className="text-base sm:text-lg font-black text-slate-900 font-fredoka mb-1">
                  Tahap {currentMeta.id}: {currentMeta.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {currentStage.isDecimalStep
                    ? isFirstStage
                      ? `Kurangi ${currentStage.startVal} dengan ${num2} berulang kali sampai sisanya lebih kecil dari ${num2}. Lalu hitung berapa kali kamu mengurangi.`
                      : `Angka soal sudah habis tetapi masih ada sisa ${prevStage?.remainder ?? 0}. Tambahkan 0 di belakang sisa sehingga menjadi ${currentStage.startVal}${prevStage && !prevStage.isDecimalStep ? ", dan tulis tanda koma (,) di atas kurung" : ""}.`
                    : isFirstStage
                    ? `Kurangi ${currentStage.startVal} dengan ${num2} berulang kali sampai sisanya lebih kecil dari ${num2}. Lalu hitung berapa kali kamu mengurangi.`
                    : `Sisa sebelumnya adalah ${prevStage?.remainder ?? 0}. Turunkan angka ${prevStage?.broughtDownDigit} dari bilangan asli sehingga menjadi ${currentStage.startVal}!`}
                </p>
              </div>

              {/* Reminder Awalan 0, jika num1 < num2 pada pengurangan pertama */}
              {num1 < num2 && isFirstStage && (
                <div className="w-full max-w-md p-3.5 bg-amber-50/90 border-2 border-amber-300 rounded-2xl flex items-center justify-between gap-2.5 text-amber-950">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                    <div className="flex flex-col">
                      <span className="text-xs font-black font-fredoka">
                        Di atas kurung sudah tertulis &quot;{solution.decimalPrefix}&quot;
                      </span>
                      <span className="text-[11px] text-amber-800 font-medium">
                        Itu karena kita menambahkan {solution.zerosAdded} angka 0 pada {num1} sehingga menjadi {solution.initialChunk}. Banyaknya pengurangan di bawah ini ditulis tepat setelah &quot;{solution.decimalPrefix}&quot;.
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-amber-500 text-white font-black text-sm rounded-xl font-fredoka shrink-0">
                    {solution.decimalPrefix}
                  </span>
                </div>
              )}

              {/* Banner Visual untuk Turunkan Digit atau Pinjam 0 (Desimal) */}
              {!isFirstStage && (
                <div
                  className={`w-full max-w-md p-3.5 rounded-2xl border-2 flex items-center justify-between ${
                    currentStage.isDecimalStep
                      ? "bg-amber-50/90 border-amber-300 text-amber-950"
                      : "bg-purple-50/90 border-purple-200 text-purple-950"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {currentStage.isDecimalStep ? (
                      <AlertCircle className="text-amber-600 animate-pulse shrink-0" size={20} />
                    ) : (
                      <ArrowDown className="text-purple-600 animate-bounce shrink-0" size={20} />
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-black font-fredoka">
                        {currentStage.isDecimalStep
                          ? "Masih Ada Sisa (Masuk Desimal):"
                          : "Turunkan Digit Berikutnya:"}
                      </span>
                      <span className="text-[11px] text-slate-600 font-medium">
                        {currentStage.isDecimalStep
                          ? `Sisa ${prevStage?.remainder ?? 0} ditambah angka 0 di belakangnya → menjadi ${currentStage.startVal}${prevStage && !prevStage.isDecimalStep ? " (tulis tanda koma di atas)" : ""}`
                          : `Sisa ${prevStage?.remainder ?? 0}, lalu turunkan angka ${prevStage?.broughtDownDigit} di sebelahnya → menjadi ${currentStage.startVal}`}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 font-black text-sm rounded-xl font-fredoka shrink-0 ${
                      currentStage.isDecimalStep
                        ? "bg-amber-500 text-white"
                        : "bg-purple-600 text-white"
                    }`}
                  >
                    {currentStage.startVal}
                  </span>
                </div>
              )}

              {/* Tangga Coretan Pengurangan Berulang Interaktif */}
              <div className="p-5 sm:p-7 bg-white border-2 border-purple-200 rounded-3xl shadow-sm flex flex-col items-center gap-2 w-full max-w-md select-none font-fredoka">
                {/* Header Mini */}
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 w-full justify-between">
                  <span className="text-xs font-black text-purple-700">
                    Pembagi: {num2}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Kelompok: {currentStage.startVal}
                  </span>
                </div>

                {/* Subtractions Langkah Bertingkat Progresif */}
                <div className="flex flex-col items-center gap-2 w-full">
                  {currentStage.subtractions.map((sub, idx) => {
                    const key = `s${currentMeta.id}_sub_${idx + 1}`;
                    const prevKey = `s${currentMeta.id}_sub_${idx}`;
                    const isFirst = idx === 0;
                    const prevVal = secInputs[prevKey];

                    // Tampilkan hanya jika langkah pertama atau langkah sebelumnya sudah diisi
                    const isVisible = isFirst || (prevVal !== undefined && prevVal.trim() !== "");
                    if (!isVisible) return null;

                    const topNumber = isFirst ? currentStage.startVal : prevVal;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-end w-full max-w-[260px] pb-2 border-b border-slate-200/80 animate-in fade-in slide-in-from-top-1 duration-200"
                      >
                        {/* Angka Awal Langkah Ini */}
                        <div className="flex items-center justify-between w-full text-lg font-black text-slate-800 px-2 font-fredoka">
                          <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md font-sans">
                            Ke-{idx + 1}
                          </span>
                          <span>{topNumber}</span>
                        </div>

                        {/* Baris Pengurang (- num2) */}
                        <div className="flex items-center justify-end gap-3 text-lg font-black text-rose-600 px-2 font-fredoka">
                          <span>−</span>
                          <span>{num2}</span>
                        </div>

                        {/* Garis dan Kotak Hasil Pengurangan */}
                        <div className="w-full border-t-2 border-slate-800 pt-1 flex items-center justify-between px-1">
                          <span className="text-[11px] font-bold text-slate-400 font-sans">
                            Sisa:
                          </span>
                          <input
                            type="text"
                            value={secInputs[key] || ""}
                            onChange={(e) => handleInputChange(key, e.target.value)}
                            placeholder="?"
                            className="w-20 h-11 text-center font-black text-lg bg-amber-50 border-2 border-amber-300 text-amber-950 rounded-xl focus:border-amber-600 focus:bg-white outline-none transition"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Hitung Berapa Kali Pengurangan (Muncul setelah semua baris pengurangan diisi) */}
                {currentStage.subtractions.every(
                  (_, i) => (secInputs[`s${currentMeta.id}_sub_${i + 1}`] || "").trim() !== ""
                ) && (
                  <div className="mt-4 p-3 bg-purple-50 border-2 border-purple-200 rounded-2xl w-full flex items-center justify-between gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-purple-900">
                        Berapa kali berhasil dikurangi?
                      </span>
                      <span className="text-[10px] text-purple-700">
                        {currentStage.isDecimalStep
                          ? "(Tulis di belakang koma pada hasil bagi)"
                          : "(Angka ini ditulis di atas kurung porogapit)"}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={secInputs[`s${currentMeta.id}_count`] || ""}
                      onChange={(e) => handleInputChange(`s${currentMeta.id}_count`, e.target.value)}
                      placeholder="?"
                      className="w-14 h-12 text-center font-black text-xl font-fredoka bg-white border-2 border-purple-400 text-purple-950 rounded-xl focus:border-purple-600 outline-none"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => validateSection(currentMeta.id)}
                className="mt-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-sm font-fredoka shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 transform active:scale-95"
              >
                <span>
                  {currentMeta.id + 1 === sectionMeta.length
                    ? "Periksa & Lanjut ke Hasil Akhir"
                    : `Periksa & Lanjut ke Tahap ${currentMeta.id + 1}`}
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          );
        })()}

        {/* TAHAP HASIL AKHIR: SUSUN HASIL DARI SETIAP LANGKAH */}
        {currentMeta.type === "final" && (
          <div className="flex flex-col gap-5 items-center">
            <div className="text-center max-w-lg">
              <h3 className="text-base sm:text-lg font-black text-slate-900 font-fredoka mb-1">
                Tahap {currentMeta.id}: Tulis Hasil Pembagian
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Hasil bagi adalah angka-angka yang kamu tulis{" "}
                <strong>di atas kurung porogapit</strong>. Baca angka-angka itu
                dari kiri ke kanan, lalu tulis di kotak jawaban.
              </p>
            </div>

            {(() => {
              const getCount = (idx: number) =>
                String(
                  secInputs[`s${idx + 2}_count`] ||
                    solution.stages[idx].subtractionsCount
                );
              const segments: {
                text: string;
                kind: "prefix" | "comma" | "digit";
              }[] = [];
              if (num1 < num2) {
                segments.push({ text: solution.decimalPrefix, kind: "prefix" });
                solution.stages.forEach((_, idx) => {
                  segments.push({ text: getCount(idx), kind: "digit" });
                });
              } else {
                let commaAdded = false;
                solution.stages.forEach((stg, idx) => {
                  if (stg.isDecimalStep && !commaAdded) {
                    segments.push({ text: ",", kind: "comma" });
                    commaAdded = true;
                  }
                  segments.push({ text: getCount(idx), kind: "digit" });
                });
              }

              return (
                <div className="w-full max-w-lg bg-white border border-purple-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col gap-4 select-none">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-black text-purple-900 font-fredoka">
                      📋 Yang sudah kamu kerjakan:
                    </span>
                    <ol className="flex flex-col gap-1.5">
                      {num1 < num2 && (
                        <li className="text-xs sm:text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                          <strong>Tahap 1:</strong> {num1} lebih kecil dari {num2}, jadi ditambah {solution.zerosAdded} angka 0 menjadi {solution.initialChunk}. Di atas kurung ditulis{" "}
                          <strong className="font-fredoka text-amber-800">
                            {solution.decimalPrefix}
                          </strong>
                        </li>
                      )}
                      {solution.stages.map((stg, idx) => {
                        const count = getCount(idx);
                        const isFirstDecimal =
                          stg.isDecimalStep &&
                          num1 >= num2 &&
                          !solution.stages[idx - 1]?.isDecimalStep;
                        return (
                          <li
                            key={idx}
                            className="text-xs sm:text-sm text-slate-700 bg-purple-50/70 border border-purple-100 rounded-xl px-3 py-2"
                          >
                            <strong>Tahap {idx + 2}:</strong> {stg.startVal} dikurangi {num2} sebanyak{" "}
                            <strong className="text-purple-700">{count} kali</strong> (sisa {stg.remainder}). Di atas kurung ditulis{" "}
                            <strong className="font-fredoka text-purple-700">
                              {count}
                            </strong>
                            {isFirstDecimal ? " setelah tanda koma" : ""}.
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  <div className="flex flex-col items-center gap-2 pt-3 border-t border-purple-100">
                    <span className="text-xs font-black text-purple-900 font-fredoka">
                      Angka di atas kurung porogapit:
                    </span>
                    <div className="flex items-end gap-1.5 border-b-4 border-slate-800 pb-1.5 px-3">
                      {segments.map((seg, idx) => (
                        <span
                          key={idx}
                          className={`font-black font-fredoka text-xl sm:text-2xl ${
                            seg.kind === "comma"
                              ? "text-amber-600 px-0.5"
                              : seg.kind === "prefix"
                              ? "px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300"
                              : "px-2 py-0.5 rounded-lg bg-purple-100 text-purple-900 border border-purple-300"
                          }`}
                        >
                          {seg.text}
                        </span>
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium text-center">
                      Gabungkan angka-angka di atas menjadi satu bilangan
                      {solution.isDecimal ? " (jangan lupa tanda komanya)" : ""}.
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Input Hasil Akhir Besar */}
            <div className="p-6 bg-white border-2 border-purple-200 rounded-3xl shadow-sm flex flex-col items-center gap-3 w-full max-w-md">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tuliskan Hasil Bagi Keseluruhan:
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xl sm:text-2xl font-black text-slate-800 font-fredoka">
                  {num1} ÷ {num2} =
                </span>
                <input
                  type="text"
                  value={secInputs["finalAnswer"] || ""}
                  onChange={(e) =>
                    handleInputChange("finalAnswer", e.target.value)
                  }
                  placeholder="?"
                  className="w-32 sm:w-40 h-16 text-center font-black text-2xl sm:text-3xl font-fredoka bg-purple-50 border-3 border-purple-400 text-purple-950 rounded-2xl focus:border-purple-600 focus:bg-white focus:ring-4 focus:ring-purple-100 outline-none transition"
                />
              </div>
            </div>

            {!isQuestionFinished ? (
              <button
                type="button"
                onClick={() => validateSection(currentMeta.id)}
                className="mt-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-base font-fredoka shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 transform active:scale-95"
              >
                <span>Validasi Hasil Akhir</span>
                <Check size={18} />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={onNewProblem}
                  className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-base font-fredoka shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 transform active:scale-95"
                >
                  <span>Soal Berikutnya</span>
                  <ArrowRight size={18} />
                </button>
                {onFinishSession && (
                  <button
                    type="button"
                    onClick={onFinishSession}
                    className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-sm font-fredoka transition cursor-pointer"
                  >
                    Selesai Latihan & Lihat Rapor
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER NAVIGASI BALIK TAHAP */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold text-slate-500">
        {currentSection > 1 && !isQuestionFinished ? (
          <button
            type="button"
            onClick={() => setCurrentSection((prev) => Math.max(1, prev - 1))}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Tahap {currentSection - 1}</span>
          </button>
        ) : (
          <div />
        )}

        <span className="text-[11px] text-purple-700 font-fredoka">
          Metode: Porogapit Pengurangan Berulang
        </span>
      </div>
    </div>
  );
}
