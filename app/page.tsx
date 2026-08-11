"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Calculator,
  Dumbbell,
  Trophy,
  Star,
  Flame,
} from "lucide-react";

// Import modular components
import WelcomeScreen from "@/components/WelcomeScreen";
import SettingsPanel from "@/components/SettingsPanel";
import MathBoardGrid from "@/components/MathBoardGrid";
import StepsCard from "@/components/StepsCard";

type Operation = "+" | "-" | "×" | "÷" | "mix";
type SimpleOperation = "+" | "-" | "×" | "÷";

interface QuestionLog {
  no: number;
  operation: string;
  questionStr: string;
  userAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
}

export default function Home() {
  // GLOBAL APP STATE
  const [currentUser, setCurrentUser] = useState<string>("");
  const [isWelcome, setIsWelcome] = useState<boolean>(true);
  const [studentNameInput, setStudentNameInput] = useState<string>("");

  const [currentMode, setCurrentMode] = useState<"latihan" | "kuis">("latihan");
  const [selectedOp, setSelectedOp] = useState<Operation>("+");
  const [currentOp, setCurrentOp] = useState<SimpleOperation>("+");
  const [placeValueCombo, setPlaceValueCombo] = useState<string>("P-P");
  const [focusOption, setFocusOption] = useState<string>("random");

  const [num1, setNum1] = useState<number>(45);
  const [num2, setNum2] = useState<number>(27);
  const [correctAnswer, setCorrectAnswer] = useState<number>(72);

  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  // UI states
  const [showSteps, setShowSteps] = useState<boolean>(true);
  const [carryValues, setCarryValues] = useState({ th: "", h: "", t: "", u: "" });
  const [ansValues, setAnsValues] = useState({ th: "", h: "", t: "", u: "" });
  const [toast, setToast] = useState<{ message: string; icon: string; bgColor: string; visible: boolean } | null>(null);

  // QUIZ STATE
  const quizLength: number = 36; // Locked to 36 questions as per spec
  const TIME_LIMIT = 45; // 45 seconds countdown per question
  const [quizCurrentIndex, setQuizCurrentIndex] = useState<number>(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState<number>(0);
  const [quizSecondsRemaining, setQuizSecondsRemaining] = useState<number>(TIME_LIMIT);
  const [quizTimerActive, setQuizTimerActive] = useState<boolean>(false);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [quizQuestionsLog, setQuizQuestionsLog] = useState<QuestionLog[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Synthesizer
  const playSound = (type: "success" | "error" | "fanfare") => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
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
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
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
        setToast(prev => prev ? { ...prev, visible: false } : null);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [toast?.visible]);

  // Quiz Timer Effect (Countdown Ticks)
  useEffect(() => {
    if (quizTimerActive) {
      timerRef.current = setInterval(() => {
        setQuizSecondsRemaining(prev => prev - 1);
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
  }, [quizTimerActive]);

  // Countdown triggers auto-submit when remaining time reaches 0
  useEffect(() => {
    if (quizTimerActive && quizSecondsRemaining <= 0) {
      handleTimeUp();
    }
  }, [quizTimerActive, quizSecondsRemaining]);

  const handleTimeUp = () => {
    playSound("error");
    showToast("Waktu Habis! ⏱️", "⏱️", "bg-rose-600");

    const currentLog: QuestionLog = {
      no: quizCurrentIndex + 1,
      operation: currentOp,
      questionStr: `${num1} ${currentOp === "×" ? "×" : currentOp === "÷" ? "÷" : currentOp === "-" ? "−" : "+"} ${num2}`,
      userAnswer: "-",
      isCorrect: false,
      timeTaken: TIME_LIMIT,
    };

    const updatedLogs = [...quizQuestionsLog, currentLog];
    setQuizQuestionsLog(updatedLogs);

    const nextIdx = quizCurrentIndex + 1;
    if (nextIdx >= quizLength) {
      setQuizTimerActive(false);
      playSound("fanfare");
      saveAttemptRecord(updatedLogs);
      setShowSummaryModal(true);
    } else {
      setQuizCurrentIndex(nextIdx);
      setQuizSecondsRemaining(TIME_LIMIT);

      // Generate next question
      const combos = ["S-S", "P-S", "S-P", "P-P", "R-S", "R-P", "S-R", "P-R", "R-R"];
      const randomCombo = combos[Math.floor(Math.random() * combos.length)];
      const ops: SimpleOperation[] = ["+", "-", "×", "÷"];
      const randomOp = ops[Math.floor(Math.random() * ops.length)];
      generateProblem(randomOp, randomCombo, "random");
    }
  };

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
    forcedOp?: Operation,
    forcedCombo?: string,
    forcedFocus?: string
  ) => {
    // Clear inputs
    setCarryValues({ th: "", h: "", t: "", u: "" });
    setAnsValues({ th: "", h: "", t: "", u: "" });

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

  // Welcome screen name submission
  const handleStartApp = () => {
    const name = studentNameInput.trim();
    if (!name) {
      showToast("Silakan tuliskan nama Anda terlebih dahulu!", "⚠️", "bg-amber-600");
      return;
    }
    setCurrentUser(name);
    setIsWelcome(false);
    generateProblem(selectedOp, placeValueCombo, focusOption);
  };

  // Switch navigation tabs
  const handleSwitchMode = (mode: "latihan" | "kuis") => {
    setCurrentMode(mode);
    setQuizTimerActive(false);
    if (mode === "latihan") {
      generateProblem(selectedOp, placeValueCombo, focusOption);
    }
  };

  const handleSelectOp = (op: Operation) => {
    setSelectedOp(op);
    generateProblem(op, placeValueCombo, focusOption);
  };

  // Submit attempt results to database API
  const saveAttemptRecord = async (questionsLog: QuestionLog[]) => {
    try {
      const correctCount = questionsLog.filter(q => q.isCorrect).length;
      const wrongCount = questionsLog.length - correctCount;
      const totalTime = questionsLog.reduce((sum, q) => sum + q.timeTaken, 0);

      await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: currentUser,
          dateStr: new Date().toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short"
          }),
          correctCount,
          wrongCount,
          totalTime,
          questions: questionsLog,
        }),
      });
    } catch (e) {
      console.error("Gagal menyimpan hasil ke Database:", e);
    }
  };

  // Checking Answer
  const handleCheckAnswer = () => {
    const { th, h, t, u } = ansValues;
    const userStr = `${th}${h}${t}${u}`;
    const userNum = parseInt(userStr, 10);

    if (isNaN(userNum)) {
      showToast("Silakan isi kotak jawaban pada papan terlebih dahulu!", "⚠️", "bg-amber-600");
      return;
    }

    const isAnsCorrect = userNum === correctAnswer;

    if (currentMode === "kuis") {
      const timeTaken = Math.max(1, TIME_LIMIT - quizSecondsRemaining);
      const currentLog: QuestionLog = {
        no: quizCurrentIndex + 1,
        operation: currentOp,
        questionStr: `${num1} ${currentOp === "×" ? "×" : currentOp === "÷" ? "÷" : currentOp === "-" ? "−" : "+"} ${num2}`,
        userAnswer: userStr,
        isCorrect: isAnsCorrect,
        timeTaken,
      };

      const updatedLogs = [...quizQuestionsLog, currentLog];
      setQuizQuestionsLog(updatedLogs);

      if (isAnsCorrect) {
        playSound("success");
        confetti({ particleCount: 50, spread: 40, origin: { y: 0.7 } });
        setQuizCorrectCount(prev => prev + 1);
        showToast("Hebat! Jawaban Kamu Benar! 🎉", "✅", "bg-emerald-600");
      } else {
        playSound("error");
        showToast(`Jawaban belum tepat (Benar: ${correctAnswer}). Lanjut ke soal berikutnya! ⏩`, "❌", "bg-rose-600");
      }

      const nextIdx = quizCurrentIndex + 1;
      if (nextIdx >= quizLength) {
        setQuizTimerActive(false);
        playSound("fanfare");
        saveAttemptRecord(updatedLogs);
        setShowSummaryModal(true);
      } else {
        setQuizCurrentIndex(nextIdx);
        setQuizSecondsRemaining(TIME_LIMIT);
        // Generate new quiz problem
        const combos = ["S-S", "P-S", "S-P", "P-P", "R-S", "R-P", "S-R", "P-R", "R-R"];
        const randomCombo = combos[Math.floor(Math.random() * combos.length)];
        const ops: SimpleOperation[] = ["+", "-", "×", "÷"];
        const randomOp = ops[Math.floor(Math.random() * ops.length)];
        generateProblem(randomOp, randomCombo, "random");
      }
    } else {
      // PRACTICE MODE
      if (isAnsCorrect) {
        playSound("success");
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 } });
        setScore(prev => prev + 10);
        setStreak(prev => prev + 1);
        showToast("Hebat! Jawaban Kamu Benar! 🎉", "✅", "bg-emerald-600");
        setTimeout(() => {
          generateProblem();
        }, 1200);
      } else {
        playSound("error");
        setStreak(0);
        showToast(`Jawaban belum tepat. Hasil yang benar adalah ${correctAnswer}. Ayo coba lagi!`, "❌", "bg-red-600");
      }
    }
  };

  // Start Quiz Mode
  const handleStartQuiz = () => {
    setQuizCurrentIndex(0);
    setQuizCorrectCount(0);
    setQuizSecondsRemaining(TIME_LIMIT);
    setQuizQuestionsLog([]);
    setQuizTimerActive(true);
    // Generate first question
    const combos = ["S-S", "P-S", "S-P", "P-P", "R-S", "R-P", "S-R", "P-R", "R-R"];
    const randomCombo = combos[Math.floor(Math.random() * combos.length)];
    const ops: SimpleOperation[] = ["+", "-", "×", "÷"];
    const randomOp = ops[Math.floor(Math.random() * ops.length)];
    generateProblem(randomOp, randomCombo, "random");
  };

  const handleCloseQuizSummary = () => {
    setShowSummaryModal(false);
    handleSwitchMode("latihan");
  };

  const handleRepeatQuiz = () => {
    setShowSummaryModal(false);
    handleStartQuiz();
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // Operation text mapping
  const opNameMap: Record<SimpleOperation, string> = {
    "+": "Penjumlahan",
    "-": "Pengurangan",
    "×": "Perkalian",
    "÷": "Pembagian",
  };

  const getAccuracy = () => {
    if (quizLength === 0) return 0;
    return Math.round((quizCorrectCount / quizLength) * 100);
  };

  const getEncouragementText = (accuracy: number) => {
    if (accuracy < 60) return `Tetap semangat, ${currentUser}!`;
    if (accuracy < 85) return `Bagus sekali, ${currentUser}!`;
    return `Hebat sekali, ${currentUser}!`;
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col justify-between relative overflow-x-hidden p-3 md:p-6 w-full">
      {/* WELCOME SCREEN */}
      {isWelcome && (
        <WelcomeScreen
          studentNameInput={studentNameInput}
          setStudentNameInput={setStudentNameInput}
          handleStartApp={handleStartApp}
        />
      )}

      {/* MAIN CONTAINER */}
      {!isWelcome && (
        <div id="main-app" className="flex flex-col flex-1 max-w-7xl mx-auto w-full gap-6">
          {/* HEADER / NAVBAR */}
          <header className="bg-white rounded-3xl p-4 md:px-6 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
            {/* Left Branding */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-md shadow-blue-500/20 font-fredoka">
                ÷×
              </div>
              <div>
                <h1 className="font-black text-xl text-slate-900 tracking-tight leading-tight font-fredoka">
                  Math Board
                </h1>
                <p id="user-greeting" className="text-xs text-slate-500 font-bold">
                  Halo, {currentUser}! 👋
                </p>
              </div>
            </div>

            {/* Center Session Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
              <button
                onClick={() => handleSwitchMode("latihan")}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition duration-200 flex items-center gap-2 ${currentMode === "latihan"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Dumbbell size={14} /> Sesi Latihan
              </button>
              <button
                onClick={() => handleSwitchMode("kuis")}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition duration-200 flex items-center gap-2 ${currentMode === "kuis"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                  }`}
              >
                <Trophy size={14} className={currentMode === "kuis" ? "text-white" : "text-amber-500"} /> Sesi Kuis
              </button>
            </div>

            {/* Right Stats Badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200/80 px-4 py-2 rounded-2xl font-extrabold text-xs shadow-xs">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span>
                  Skor: <span id="stat-score" className="text-amber-900">{score}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-4 py-2 rounded-2xl font-extrabold text-xs shadow-xs">
                <Flame size={14} className="text-emerald-500 fill-emerald-500" />
                <span>
                  Beruntun: <span id="stat-streak" className="text-emerald-900">{streak}</span>
                </span>
              </div>
            </div>
          </header>

          {/* MAIN APP GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT PANEL */}
            <section className="lg:col-span-4 flex flex-col gap-5">
              <SettingsPanel
                currentMode={currentMode}
                selectedOp={selectedOp}
                currentOp={currentOp}
                placeValueCombo={placeValueCombo}
                focusOption={focusOption}
                quizTimerActive={quizTimerActive}
                quizCurrentIndex={quizCurrentIndex}
                quizLength={quizLength}
                quizSecondsRemaining={quizSecondsRemaining}
                opNameMap={opNameMap}
                onSelectOp={handleSelectOp}
                onPlaceValueChange={(combo) => {
                  setPlaceValueCombo(combo);
                  generateProblem(selectedOp, combo, focusOption);
                }}
                onFocusOptionChange={(focus) => {
                  setFocusOption(focus);
                  generateProblem(selectedOp, placeValueCombo, focus);
                }}
                onStartQuiz={handleStartQuiz}
                onNewProblem={() => generateProblem()}
                formatTimer={formatTimer}
              />
            </section>

            {/* RIGHT PANEL */}
            <section className="lg:col-span-8 flex flex-col gap-6">
              <MathBoardGrid
                currentMode={currentMode}
                selectedOp={selectedOp}
                currentOp={currentOp}
                placeValueCombo={placeValueCombo}
                num1={num1}
                num2={num2}
                carryValues={carryValues}
                setCarryValues={setCarryValues}
                ansValues={ansValues}
                setAnsValues={setAnsValues}
                onCheckAnswer={handleCheckAnswer}
                quizCurrentIndex={quizCurrentIndex}
                opNameMap={opNameMap}
                showSteps={showSteps}
                setShowSteps={setShowSteps}
              />

              {currentMode === "latihan" && showSteps && (
                <StepsCard
                  currentOp={currentOp}
                  num1={num1}
                  num2={num2}
                  correctAnswer={correctAnswer}
                />
              )}
            </section>
          </div>
        </div>
      )}

      {/* QUIZ SUMMARY MODAL */}
      {showSummaryModal && (
        <div id="quiz-summary-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] shadow-2xl border border-slate-100 max-w-md w-full p-6 md:p-8 text-center relative overflow-hidden">
            <div className="w-20 h-20 bg-amber-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy size={36} className="text-amber-500 fill-amber-500" />
            </div>

            <h2 className="text-2xl font-black text-slate-800 tracking-tight font-fredoka">Hasil Sesi Kuis</h2>
            <p id="summary-subtitle" className="text-sm font-semibold text-slate-500 mt-1 mb-6">
              {getEncouragementText(getAccuracy())}
            </p>

            <div className="bg-slate-50/80 p-3.5 rounded-3xl border border-slate-100 mb-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs text-center">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">JAWABAN BENAR</p>
                  <p className="text-2xl font-black text-emerald-500">{quizCorrectCount} Soal</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs text-center">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">JAWABAN SALAH</p>
                  <p className="text-2xl font-black text-rose-500">{quizLength - quizCorrectCount} Soal</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs text-center">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">AKURASI SKOR</p>
                  <p className="text-2xl font-black text-blue-600">{getAccuracy()}%</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs text-center">
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">TOTAL WAKTU</p>
                  <p className="text-2xl font-black text-purple-600">
                    {formatTimer(quizQuestionsLog.reduce((sum, q) => sum + q.timeTaken, 0))}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCloseQuizSummary}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold py-3.5 px-4 rounded-2xl text-xs transition duration-200"
              >
                Kembali ke Latihan
              </button>
              <button
                onClick={handleRepeatQuiz}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-purple-500/25 text-xs transition duration-200"
              >
                Ulangi Kuis
              </button>
            </div>
          </div>
        </div>
      )}

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
