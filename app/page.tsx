"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Award, X } from "lucide-react";

// Modular components
import SetupWizard, { OperationType } from "@/components/SetupWizard";
import SettingsPanel from "@/components/SettingsPanel";
import TopNavbar from "@/components/TopNavbar";
import PracticeCard from "@/components/PracticeCard";
import RightHelperPanel from "@/components/RightHelperPanel";
import LeftSidebarNav from "@/components/LeftSidebarNav";
import { DecorativeFloatingNumbers, MotivationalStickyNote } from "@/components/ChildMascots";
import ConceptLearningModal from "@/components/ConceptLearningModal";

// Error Diagnostics Engine
import { diagnoseError, generateSessionSummary, type ErrorDiagnosticResult } from "@/lib/errorDiagnostics";

type SimpleOperation = "+" | "-" | "×" | "÷";

interface PracticeQuestionLog {
  no: number;
  operation: string;
  questionStr: string;
  num1: number;
  num2: number;
  userAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
  errorType?: string | null;
  errorDetail?: string | null;
  suggestedIntervention?: string | null;
}

const COMBO_LABELS: Record<string, { code: string; label: string }> = {
  "S-S": { code: "SS", label: "Satuan ke Satuan" },
  "S-P": { code: "SP", label: "Satuan ke Puluhan" },
  "S-R": { code: "SR", label: "Satuan ke Ratusan" },
  "P-S": { code: "PS", label: "Puluhan ke Satuan" },
  "P-P": { code: "PP", label: "Puluhan ke Puluhan" },
  "P-R": { code: "PR", label: "Puluhan ke Ratusan" },
  "R-S": { code: "RS", label: "Ratusan ke Satuan" },
  "R-P": { code: "RP", label: "Ratusan ke Puluhan" },
  "R-R": { code: "RR", label: "Ratusan ke Ratusan" },
};

export default function Home() {
  // USER & SETUP STATE (Mulai dengan wizard pengaturan nama, operasi, dan satuan)
  const [currentUser, setCurrentUser] = useState<string>("");
  const [isSetupOpen, setIsSetupOpen] = useState<boolean>(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isConceptModalOpen, setIsConceptModalOpen] = useState<boolean>(false);
  const [showDienesBlocks, setShowDienesBlocks] = useState<boolean>(false);

  // PRACTICE CONFIGURATION
  const [selectedOp, setSelectedOp] = useState<OperationType>("+");
  const [currentOp, setCurrentOp] = useState<SimpleOperation>("+");
  const [placeValueCombo, setPlaceValueCombo] = useState<string>("P-P");
  const [focusOption, setFocusOption] = useState<string>("random");

  // MATH PROBLEM STATE
  const [num1, setNum1] = useState<number>(45);
  const [num2, setNum2] = useState<number>(27);
  const [correctAnswer, setCorrectAnswer] = useState<number>(72);

  // USER INPUTS & SCORES
  const [userAnswerInput, setUserAnswerInput] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [carryValues, setCarryValues] = useState({ th: "", h: "", t: "", u: "" });
  const [ansValues, setAnsValues] = useState({ th: "", h: "", t: "", u: "" });
  const [diagnosticHint, setDiagnosticHint] = useState<{ message: string; badge: string; color: string } | null>(null);

  // INTERACTIVE ANIMATION & HINT HIGHLIGHT STATES
  const [activePlace, setActivePlace] = useState<"th" | "h" | "t" | "u" | null>(null);
  const [isHelpActive, setIsHelpActive] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // TOAST NOTIFICATIONS
  const [toast, setToast] = useState<{ message: string; icon: string; bgColor: string; visible: boolean } | null>(null);

  // SESSION TRACKING & TIMING
  const [sessionLogs, setSessionLogs] = useState<PracticeQuestionLog[]>([]);
  const [questionSecondsElapsed, setQuestionSecondsElapsed] = useState<number>(0);
  const [totalSessionSeconds, setTotalSessionSeconds] = useState<number>(0);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Tick timer while student is active in practice
  useEffect(() => {
    if (!isSetupOpen && !showSummaryModal) {
      timerRef.current = setInterval(() => {
        setQuestionSecondsElapsed((prev) => prev + 1);
        setTotalSessionSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSetupOpen, showSummaryModal]);

  // Audio Synthesizer
  const playSound = (type: "success" | "error" | "fanfare") => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "success") {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === "error") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === "fanfare") {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.3);
          o.start(ctx.currentTime + idx * 0.1);
          o.stop(ctx.currentTime + idx * 0.1 + 0.3);
        });
      }
    } catch (e) {
      console.log("Audio non-blocking handled", e);
    }
  };

  const showToast = (message: string, icon = "⚠️", bgColor = "bg-slate-900") => {
    setToast({ message, icon, bgColor, visible: true });
  };

  useEffect(() => {
    if (toast?.visible) {
      const t = setTimeout(() => {
        setToast((prev) => (prev ? { ...prev, visible: false } : null));
      }, 3500);
      return () => clearTimeout(t);
    }
  }, [toast?.visible]);

  // Helper numbers in range
  const getRandomNumberInRange = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const getDigitRange = (placeType: string) => {
    if (placeType === "S") return { min: 1, max: 9, digits: 1 };
    if (placeType === "P") return { min: 10, max: 99, digits: 2 };
    if (placeType === "R") return { min: 100, max: 999, digits: 3 };
    return { min: 1, max: 9, digits: 1 };
  };

  // Generate Problem Logic
  const generateProblem = (
    forcedOp?: OperationType,
    forcedCombo?: string,
    forcedFocus?: string
  ) => {
    setCarryValues({ th: "", h: "", t: "", u: "" });
    setAnsValues({ th: "", h: "", t: "", u: "" });
    setUserAnswerInput("");
    setDiagnosticHint(null);
    setIsHelpActive(false);
    setIsSuccess(false);
    setQuestionSecondsElapsed(0);

    const activeOp = forcedOp !== undefined ? forcedOp : selectedOp;
    const activeCombo = forcedCombo !== undefined ? forcedCombo : placeValueCombo;
    const activeFocus = forcedFocus !== undefined ? forcedFocus : focusOption;

    let op: SimpleOperation = "+";
    if (activeOp === "mix") {
      const ops: SimpleOperation[] = ["+", "-", "×", "÷"];
      op = ops[Math.floor(Math.random() * ops.length)];
    } else {
      op = activeOp;
    }
    setCurrentOp(op);

    let [p1, p2] = activeCombo.split("-");
    if (!p1 || !p2) {
      p1 = "P";
      p2 = "P";
    }

    let r1 = getDigitRange(p1);
    let r2 = getDigitRange(p2);

    let n1 = 45;
    let n2 = 27;
    let correct = 72;

    if (op === "+") {
      if (activeFocus === "no-carry") {
        const u1 = getRandomNumberInRange(1, 4);
        const u2 = getRandomNumberInRange(1, 9 - u1);
        const t1 = p1 !== "S" ? getRandomNumberInRange(1, 4) : 0;
        const t2 = p2 !== "S" ? getRandomNumberInRange(1, 9 - t1) : 0;
        const h1 = p1 === "R" ? getRandomNumberInRange(1, 4) : 0;
        const h2 = p2 === "R" ? getRandomNumberInRange(1, 9 - h1) : 0;
        n1 = h1 * 100 + t1 * 10 + u1;
        n2 = h2 * 100 + t2 * 10 + u2;
      } else if (activeFocus === "with-carry") {
        const u1 = getRandomNumberInRange(5, 9);
        const u2 = getRandomNumberInRange(10 - u1, 9);
        const t1 = p1 !== "S" ? getRandomNumberInRange(1, 8) : 0;
        const t2 = p2 !== "S" ? getRandomNumberInRange(1, 8) : 0;
        const h1 = p1 === "R" ? getRandomNumberInRange(1, 8) : 0;
        const h2 = p2 === "R" ? getRandomNumberInRange(1, 8) : 0;
        n1 = h1 * 100 + t1 * 10 + u1;
        n2 = h2 * 100 + t2 * 10 + u2;
      } else {
        n1 = getRandomNumberInRange(r1.min, r1.max);
        n2 = getRandomNumberInRange(r2.min, r2.max);
      }
      correct = n1 + n2;
    } else if (op === "-") {
      if (r1.min < r2.min) {
        [p1, p2] = [p2, p1];
        r1 = getDigitRange(p1);
        r2 = getDigitRange(p2);
      }

      if (activeFocus === "no-carry") {
        const u2 = getRandomNumberInRange(1, 8);
        const u1 = getRandomNumberInRange(u2, 9);
        const t2 = p2 !== "S" ? getRandomNumberInRange(1, 8) : 0;
        const t1 = p1 !== "S" ? getRandomNumberInRange(t2, 9) : 0;
        const h2 = p2 === "R" ? getRandomNumberInRange(1, 8) : 0;
        const h1 = p1 === "R" ? getRandomNumberInRange(h2, 9) : 0;
        n1 = h1 * 100 + t1 * 10 + u1;
        n2 = h2 * 100 + t2 * 10 + u2;
      } else if (activeFocus === "with-carry") {
        const u1 = getRandomNumberInRange(0, 4);
        const u2 = getRandomNumberInRange(u1 + 1, 9);
        const t1 = p1 !== "S" ? getRandomNumberInRange(2, 9) : 1;
        const t2 = p2 !== "S" ? getRandomNumberInRange(1, t1 - 1) : 0;
        const h1 = p1 === "R" ? getRandomNumberInRange(1, 9) : 0;
        const h2 = p2 === "R" ? getRandomNumberInRange(0, h1) : 0;
        n1 = h1 * 100 + t1 * 10 + u1;
        n2 = h2 * 100 + t2 * 10 + u2;
      } else {
        n1 = getRandomNumberInRange(r1.min, r1.max);
        n2 = getRandomNumberInRange(r2.min, Math.min(r2.max, n1));
      }
      correct = n1 - n2;
    } else if (op === "×") {
      n1 = getRandomNumberInRange(r1.min, r1.max);
      n2 = getRandomNumberInRange(r2.min, r2.max);
      while (n1 * n2 > 9999) {
        n1 = Math.floor(n1 * 0.8);
      }
      correct = n1 * n2;
    } else if (op === "÷") {
      if (r1.min < r2.min) {
        [p1, p2] = [p2, p1];
        r1 = getDigitRange(p1);
        r2 = getDigitRange(p2);
      }
      const minDiv = r2.digits === 1 && r2.max > 1 ? 2 : r2.min;
      n2 = getRandomNumberInRange(minDiv, r2.max);

      const minK = Math.ceil(r1.min / n2);
      const maxK = Math.floor(r1.max / n2);

      if (minK > maxK) {
        n1 = getRandomNumberInRange(r1.min, r1.max);
        n2 = 1;
        correct = n1;
      } else {
        const k = getRandomNumberInRange(minK, maxK);
        n1 = k * n2;
        correct = k;
      }
    }

    setNum1(n1);
    setNum2(n2);
    setCorrectAnswer(correct);
  };

  // Completion from Setup Wizard
  const handleCompleteSetup = (name: string, op: OperationType, combo: string) => {
    setCurrentUser(name);
    setSelectedOp(op);
    setPlaceValueCombo(combo);
    setIsSetupOpen(false);
    generateProblem(op, combo, focusOption);
  };

  // Checking Answer with Error Diagnostics
  const handleCheckAnswer = () => {
    let userNum: number;
    let userStr: string;

    if (userAnswerInput.trim() !== "") {
      userNum = parseInt(userAnswerInput.trim(), 10);
      userStr = userAnswerInput.trim();
    } else {
      const { th, h, t, u } = ansValues;
      if (th === "" && h === "" && t === "" && u === "") {
        showToast("Tuliskan jawabanmu pada kotak tanda tanya [ ? ] ya!", "✏️", "bg-amber-600");
        return;
      }
      const cleanDigit = (d: string) => (d.trim() === "" ? "0" : d);
      userStr = `${cleanDigit(th)}${cleanDigit(h)}${cleanDigit(t)}${cleanDigit(u)}`;
      userNum = parseInt(userStr, 10);
    }

    const isAnsCorrect = userNum === correctAnswer;
    const timeSpent = Math.max(1, questionSecondsElapsed);

    let diagnosticResult: ErrorDiagnosticResult | null = null;
    if (!isAnsCorrect) {
      diagnosticResult = diagnoseError(
        currentOp,
        num1,
        num2,
        correctAnswer,
        userStr,
        ansValues,
        carryValues
      );
      setDiagnosticHint({
        message: diagnosticResult.studentFeedback,
        badge: diagnosticResult.badgeLabel,
        color: diagnosticResult.badgeColor,
      });
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setIsHelpActive(true);
      playSound("error");
      setStreak(0);
      showToast(
        `Jawaban belum tepat (${diagnosticResult?.badgeLabel || "Perlu Diteliti"}). Cek petunjuk di sebelah kanan!`,
        "❌",
        "bg-rose-600"
      );
    } else {
      playSound("success");
      setIsSuccess(true);
      confetti({ particleCount: 85, spread: 70, origin: { y: 0.6 } });
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);
      setDiagnosticHint(null);
      setIsHelpActive(false);
      showToast("Hebat! Jawaban Kamu Benar Sekali! 🎉", "🌟", "bg-emerald-600");

      setTimeout(() => {
        setIsSuccess(false);
        generateProblem();
      }, 1300);
    }

    const currentLog: PracticeQuestionLog = {
      no: sessionLogs.length + 1,
      operation: currentOp,
      questionStr: `${num1} ${currentOp === "×" ? "×" : currentOp === "÷" ? "÷" : currentOp === "-" ? "−" : "+"} ${num2}`,
      num1,
      num2,
      userAnswer: userStr,
      isCorrect: isAnsCorrect,
      timeTaken: timeSpent,
      errorType: diagnosticResult?.errorType || null,
      errorDetail: diagnosticResult?.errorDetail || null,
      suggestedIntervention: diagnosticResult?.suggestedIntervention || null,
    };

    const updatedLogs = [...sessionLogs, currentLog];
    setSessionLogs(updatedLogs);
  };

  // Submit practice session records to database
  const handleSaveSession = async () => {
    if (sessionLogs.length === 0) {
      showToast("Belum ada soal yang dikerjakan!", "⚠️", "bg-amber-600");
      return;
    }

    try {
      const correctCount = sessionLogs.filter((q) => q.isCorrect).length;
      const wrongCount = sessionLogs.length - correctCount;
      const totalTime = sessionLogs.reduce((sum, q) => sum + q.timeTaken, 0);
      const summaryErrors = generateSessionSummary(sessionLogs);

      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: currentUser,
          dateStr: new Date().toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          operation: selectedOp === "mix" ? "Campuran" : opNameMap[currentOp] || selectedOp,
          placeValueLevel: placeValueCombo,
          correctCount,
          wrongCount,
          totalTime,
          summaryErrors,
          questions: sessionLogs,
        }),
      });

      if (res.ok) {
        playSound("fanfare");
        setShowSummaryModal(true);
        showToast("Hasil latihan berhasil disimpan ke database guru! 🚀", "✅", "bg-emerald-600");
      } else {
        throw new Error("Gagal menyimpan");
      }
    } catch (e) {
      console.error(e);
      showToast("Gagal menyimpan data latihan ke database.", "❌", "bg-red-600");
    }
  };

  const handleContinuePractice = () => {
    setShowSummaryModal(false);
    generateProblem();
  };

  const handleResetSession = () => {
    setShowSummaryModal(false);
    setSessionLogs([]);
    setScore(0);
    setStreak(0);
    setTotalSessionSeconds(0);
    setIsSetupOpen(true);
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const opNameMap: Record<SimpleOperation, string> = {
    "+": "Penjumlahan",
    "-": "Pengurangan",
    "×": "Perkalian",
    "÷": "Pembagian",
  };

  const correctCount = sessionLogs.filter((q) => q.isCorrect).length;
  const wrongCount = sessionLogs.length - correctCount;
  const accuracy = sessionLogs.length > 0 ? Math.round((correctCount / sessionLogs.length) * 100) : 100;

  return (
    <div className="min-h-screen text-slate-800 flex flex-col p-2.5 sm:p-4 md:p-6 gap-3.5 max-w-[1550px] mx-auto w-full">
      {/* 3-STEP SETUP WIZARD (JIKA MEMBUKA PENGATURAN AWAL) */}
      {isSetupOpen && (
        <SetupWizard
          initialName={currentUser}
          initialOp={selectedOp}
          initialCombo={placeValueCombo}
          onComplete={handleCompleteSetup}
        />
      )}

      {/* 1. TOP NAVBAR (LOGO MATHKU, AVATAR SISWA, PENGATURAN) */}
      <TopNavbar
        currentUser={currentUser || "Siswa"}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={() => setIsSetupOpen(true)}
      />

      {/* 2. KONTEN UTAMA 3 KOLOM */}
      <div className="flex flex-col xl:flex-row flex-1 gap-4 md:gap-5 items-start w-full">
        {/* SIDEBAR KIRI: NAVIGASI OPERASI, PEMILIH DIGIT, & MASKOT ANAK LAKI-LAKI */}
        <div className="w-full xl:w-64 2xl:w-72 shrink-0">
          <LeftSidebarNav
            selectedOp={selectedOp}
            onSelectOp={(op) => {
              setSelectedOp(op);
              generateProblem(op, placeValueCombo, focusOption);
            }}
            placeValueCombo={placeValueCombo}
            onSelectCombo={(combo) => {
              setPlaceValueCombo(combo);
              generateProblem(selectedOp, combo, focusOption);
              const info = COMBO_LABELS[combo];
              showToast(
                `Mode digit diubah ke ${info ? `${info.code} (${info.label})` : combo}!`,
                "🔢",
                "bg-blue-600"
              );
            }}
            targetProgress={correctCount}
            targetTotal={5}
            onOpenHistory={() => setShowSummaryModal(true)}
            onOpenConcept={() => setIsConceptModalOpen(true)}
          />
        </div>

        {/* AREA TENGAH: HERO BANNER & KARTU SOAL LATIHAN */}
        <main className="flex-1 w-full flex flex-col gap-4 min-w-0">
          {/* BANNER AYO LATIHAN MATEMATIKA DENGAN ANGKA MELAYANG & STICKY NOTE */}
          <div className="bg-white/85 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 md:p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
            {/* Sisi Kiri: Angka 1, 2, 3 Melayang & Judul Utama */}
            <div className="flex items-center gap-3">
              <DecorativeFloatingNumbers />
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-fredoka flex items-center gap-2">
                  Ayo Latihan Matematika!
                  <span className="text-2xl animate-bounce">💡</span>
                </h2>
                <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5">
                  Pilih operasi atau digit di sidebar kiri. Soal akan disesuaikan dengan kemampuanmu.
                </p>
              </div>
            </div>

            {/* Sisi Kanan: Sticky Note & Level / Poin */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
              <MotivationalStickyNote />

              <div className="flex flex-col gap-1.5 text-right">
                {/* Level Badge */}
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-3 py-1 rounded-xl text-xs font-black text-amber-900 shadow-2xs">
                  <span className="text-amber-500">⭐</span>
                  <span>Level {Math.floor(score / 30) + 1}</span>
                  <div className="w-12 bg-amber-200/80 h-1.5 rounded-full overflow-hidden ml-1">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, ((score % 30) / 30) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Poin & Streak Badge */}
                <div className="flex items-center gap-1.5 justify-end">
                  <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-xl text-xs font-black text-emerald-900 shadow-2xs">
                    <span>🔥</span>
                    <span>{streak}x Beruntun</span>
                  </div>
                  <div className="flex items-center gap-1 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-xl text-xs font-black text-blue-900 shadow-2xs">
                    <span className="text-amber-500">⭐</span>
                    <span>{score * 10} poin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KARTU SOAL LATIHAN DENGAN PAPAN NILAI TEMPAT & ALAT BANTU BALOK */}
          <PracticeCard
            num1={num1}
            num2={num2}
            currentOp={currentOp}
            levelName={`Level ${Math.floor(score / 30) + 1} – ${
              COMBO_LABELS[placeValueCombo]?.code || placeValueCombo
            }`}
            questionNumber={sessionLogs.length + 1}
            totalQuestions={10}
            userAnswerInput={userAnswerInput}
            setUserAnswerInput={setUserAnswerInput}
            carryValues={carryValues}
            setCarryValues={setCarryValues}
            ansValues={ansValues}
            setAnsValues={setAnsValues}
            onCheckAnswer={handleCheckAnswer}
            onNewProblem={() => generateProblem()}
            onNeedHelp={() => {
              setIsHelpActive(true);
              showToast("Perhatikan Petunjuk Bertingkat di sebelah kanan ya! 💡", "👉", "bg-sky-600");
            }}
            diagnosticHint={diagnosticHint}
            activePlace={activePlace}
            setActivePlace={setActivePlace}
            isShaking={isShaking}
            isSuccess={isSuccess}
            showDienesBlocks={showDienesBlocks}
            setShowDienesBlocks={setShowDienesBlocks}
            placeValueCombo={placeValueCombo}
            onSelectCombo={(combo) => {
              setPlaceValueCombo(combo);
              generateProblem(selectedOp, combo, focusOption);
              const info = COMBO_LABELS[combo];
              showToast(
                `Mode digit diubah ke ${info ? `${info.code} (${info.label})` : combo}!`,
                "🔢",
                "bg-blue-600"
              );
            }}
          />
        </main>

        {/* SIDEBAR KANAN: PETUNJUK BERTINGKAT, STRATEGI, & MASKOT ANAK PEREMPUAN */}
        <div className="w-full xl:w-72 2xl:w-80 shrink-0">
          <RightHelperPanel
            currentOp={currentOp}
            num1={num1}
            num2={num2}
            isHighlighted={isHelpActive}
            onSelectStrategy={(strat) => {
              if (strat === "blocks") {
                setShowDienesBlocks(true);
                showToast("Alat Bantu Balok 3D dibuka!", "🧱", "bg-amber-600");
              } else if (strat === "place-value") {
                showToast("Strategi Pecah Nilai (Dekomposisi) aktif!", "✨", "bg-emerald-600");
              } else if (strat === "unit-first") {
                setActivePlace("u");
                showToast("Fokus hitung kolom Satuan terlebih dahulu!", "👉", "bg-blue-600");
              } else if (strat === "check") {
                showToast("Gunakan operasi kebalikan untuk memeriksa jawaban!", "🔍", "bg-purple-600");
              }
            }}
          />
        </div>
      </div>

      {/* MODAL PENGATURAN MODE & LEVEL (JIKA KLIK IKON GEAR) */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-w-md w-full relative">
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(false)}
              className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-white shadow-md text-slate-600 hover:text-slate-900"
            >
              <X size={16} />
            </button>
            <SettingsPanel
              currentUser={currentUser}
              selectedOp={selectedOp}
              currentOp={currentOp}
              placeValueCombo={placeValueCombo}
              focusOption={focusOption}
              practiceStats={{
                totalAnswered: sessionLogs.length,
                correctCount,
                wrongCount,
                totalSeconds: totalSessionSeconds,
              }}
              opNameMap={opNameMap}
              onSelectOp={(op) => {
                setSelectedOp(op);
                generateProblem(op, placeValueCombo, focusOption);
              }}
              onComboChange={(combo) => {
                setPlaceValueCombo(combo);
                generateProblem(selectedOp, combo, focusOption);
              }}
              onFocusOptionChange={(focus) => {
                setFocusOption(focus);
                generateProblem(selectedOp, placeValueCombo, focus);
              }}
              onNewProblem={() => {
                generateProblem();
                setIsSettingsModalOpen(false);
              }}
              onSaveAndFinishSession={handleSaveSession}
              onChangeSetup={() => {
                setIsSettingsModalOpen(false);
                setIsSetupOpen(true);
              }}
              onCloseSidebar={() => setIsSettingsModalOpen(false)}
              formatTimer={formatTimer}
            />
          </div>
        </div>
      )}

      {/* PRACTICE SESSION SUMMARY MODAL (EVALUASI GURU & SISWA) */}
      {showSummaryModal && (
        <div id="practice-summary-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 max-w-lg w-full p-6 md:p-8 text-center relative overflow-hidden">
            <div className="w-20 h-20 bg-emerald-100/80 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <Award size={40} />
            </div>

            <h2 className="text-2xl font-black text-slate-800 tracking-tight font-fredoka">
              Sesi Latihan Tersimpan! 🎉
            </h2>
            <p className="text-sm font-semibold text-slate-500 mt-1 mb-5">
              Data pengerjaan {currentUser} telah terekam di database untuk evaluasi guru.
            </p>

            {/* STATS TILES */}
            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 mb-5">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs text-center">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">BENAR</p>
                  <p className="text-2xl font-black text-emerald-500 font-fredoka">{correctCount} Soal</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs text-center">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">SALAH</p>
                  <p className="text-2xl font-black text-rose-500 font-fredoka">{wrongCount} Soal</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs text-center">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">AKURASI</p>
                  <p className="text-2xl font-black text-blue-600 font-fredoka">{accuracy}%</p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-xs text-center">
                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-0.5">DURASI LATIHAN</p>
                  <p className="text-2xl font-black text-purple-600 font-fredoka">{formatTimer(totalSessionSeconds)}</p>
                </div>
              </div>

              {/* EVALUATION SUMMARY NOTE */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-left text-xs font-bold text-blue-900">
                <span className="font-black block uppercase text-[10px] text-blue-600 mb-0.5">Ringkasan Evaluasi Belajar:</span>
                {generateSessionSummary(sessionLogs)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleContinuePractice}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3.5 px-4 rounded-2xl text-xs transition duration-200"
              >
                Lanjutkan Latihan
              </button>
              <button
                onClick={handleResetSession}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-blue-500/25 text-xs transition duration-200"
              >
                Mulai Sesi Baru 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BELAJAR KONSEP NILAI TEMPAT & BALOK DIENES */}
      <ConceptLearningModal
        isOpen={isConceptModalOpen}
        onClose={() => setIsConceptModalOpen(false)}
        onOpenBlocks={() => {
          setIsConceptModalOpen(false);
          setShowDienesBlocks(true);
        }}
      />

      {/* TOAST NOTIFICATION */}
      {toast?.visible && (
        <div id="toast-notification" className="fixed bottom-6 right-6 z-50 transform opacity-100 translate-y-0 toast-slide">
          <div id="toast-content" className={`${toast.bgColor} text-white font-bold px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10`}>
            <span className="text-xl">{toast.icon}</span>
            <span className="text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
