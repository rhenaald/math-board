"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Award, X, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";

// Modular components
import SetupWizard, { OperationType } from "@/components/SetupWizard";
import SettingsPanel from "@/components/SettingsPanel";
import TopNavbar from "@/components/TopNavbar";
import PracticeCard from "@/components/PracticeCard";
import RightHelperPanel from "@/components/RightHelperPanel";
import LeftSidebarNav, { NavTab } from "@/components/LeftSidebarNav";
import { BoyMascotVector } from "@/components/ChildMascots";
import ConceptLearningModal from "@/components/ConceptLearningModal";
import GuidedLearningFlow from "@/components/GuidedLearningFlow";
import StudentProfileView from "@/components/StudentProfileView";
import MultiLevelHelpModal from "@/components/MultiLevelHelpModal";
import ExampleProblemsPage from "@/components/ExampleProblemsPage";
import DigitSelectionPage from "@/components/DigitSelectionPage";
import NameInputScreen from "@/components/NameInputScreen";

// Error Diagnostics Engine
import {
  diagnoseError,
  generateSessionSummary,
  analyzeSectionPerformance,
  type ErrorDiagnosticResult,
  type SectionDiagnostic,
} from "@/lib/errorDiagnostics";

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
  sections?: SectionDiagnostic[];
  failedSectionId?: number | null;
  failedSectionName?: string | null;
}

const COMBO_LABELS: Record<string, { code: string; label: string }> = {
  "ALL": { code: "Semua", label: "Acak Semua Digit" },
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
  const [isNameModalOpen, setIsNameModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isConceptModalOpen, setIsConceptModalOpen] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<NavTab>("belajar");
  const [isMultiLevelHelpOpen, setIsMultiLevelHelpOpen] = useState<boolean>(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(true);

  // PRACTICE CONFIGURATION
  const [selectedOp, setSelectedOp] = useState<OperationType>("+");
  const [currentOp, setCurrentOp] = useState<SimpleOperation>("+");
  const [placeValueCombo, setPlaceValueCombo] = useState<string>("P-P");
  const [focusOption, setFocusOption] = useState<string>("random");
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState<number>(1);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastProblemRef = useRef<{ n1: number; n2: number; op: string } | null>(null);
  const lastDivisionProblemRef = useRef<{ n1: number; n2: number } | null>(null);
  const wasLastDivisionDecimalRef = useRef<boolean>(false);

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
  const [activePracticeSection, setActivePracticeSection] = useState<number>(1);

  // TOAST NOTIFICATIONS
  const [toast, setToast] = useState<{ message: string; icon: string; bgColor: string; visible: boolean } | null>(null);

  // SESSION TRACKING & TIMING
  const [sessionLogs, setSessionLogs] = useState<PracticeQuestionLog[]>([]);
  const [currentSessionAttemptId, setCurrentSessionAttemptId] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [questionSecondsElapsed, setQuestionSecondsElapsed] = useState<number>(0);
  const [totalSessionSeconds, setTotalSessionSeconds] = useState<number>(0);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inisialisasi nama siswa dari localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("mathboard_student_name");
      if (savedName && savedName.trim()) {
        setTimeout(() => {
          setCurrentUser(savedName.trim());
          setIsNameModalOpen(false);
        }, 0);
      } else {
        setIsNameModalOpen(true);
      }
    }
  }, []);

  // Tick timer while student is active in practice
  useEffect(() => {
    if (!isNameModalOpen && !showSummaryModal) {
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
  }, [isNameModalOpen, showSummaryModal]);

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
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }

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
      let attempts = 0;
      while (attempts < 25) {
        attempts++;
        if (activeFocus === "no-carry") {
          const u1 = getRandomNumberInRange(1, 4);
          const u2 = getRandomNumberInRange(1, 9 - u1);
          const t1 = p1 !== "S" ? getRandomNumberInRange(1, 4) : 0;
          const t2 = p2 !== "S" ? getRandomNumberInRange(1, 9 - t1) : 0;
          const h1 = p1 === "R" ? getRandomNumberInRange(1, 4) : 0;
          const h2 = p2 === "R" ? getRandomNumberInRange(1, 9 - h1) : 0;
          n1 = (p1 === "R" ? h1 * 100 : 0) + (p1 !== "S" ? t1 * 10 : 0) + u1;
          n2 = (p2 === "R" ? h2 * 100 : 0) + (p2 !== "S" ? t2 * 10 : 0) + u2;
        } else if (activeFocus === "with-carry") {
          const u1 = getRandomNumberInRange(5, 9);
          const u2 = getRandomNumberInRange(10 - u1, 9);
          const t1 = p1 !== "S" ? getRandomNumberInRange(1, 8) : 0;
          const t2 = p2 !== "S" ? getRandomNumberInRange(1, 8) : 0;
          const h1 = p1 === "R" ? getRandomNumberInRange(1, 8) : 0;
          const h2 = p2 === "R" ? getRandomNumberInRange(1, 8) : 0;
          n1 = (p1 === "R" ? h1 * 100 : 0) + (p1 !== "S" ? t1 * 10 : 0) + u1;
          n2 = (p2 === "R" ? h2 * 100 : 0) + (p2 !== "S" ? t2 * 10 : 0) + u2;
        } else {
          n1 = getRandomNumberInRange(r1.min, r1.max);
          n2 = getRandomNumberInRange(r2.min, r2.max);
        }
        const prev = lastProblemRef.current;
        if (!prev || prev.n1 !== n1 || prev.n2 !== n2 || prev.op !== op) {
          break;
        }
      }
      correct = n1 + n2;
      lastProblemRef.current = { n1, n2, op };
    } else if (op === "-") {
      let attempts = 0;
      while (attempts < 25) {
        attempts++;
        if (r1.min < r2.min) {
          [p1, p2] = [p2, p1];
          r1 = getDigitRange(p1);
          r2 = getDigitRange(p2);
        }

        const isSS = p1 === "S" && p2 === "S";
        const isPP = p1 === "P" && p2 === "P";
        const isPS = p1 === "P" && p2 === "S";
        const isRP = p1 === "R" && p2 === "P";
        const isRS = p1 === "R" && p2 === "S";
        const isRR = p1 === "R" && p2 === "R";

        // Variasi tipe soal: with-carry (meminjam) vs no-carry (tanpa meminjam)
        const wantBorrow =
          activeFocus === "with-carry"
            ? true
            : activeFocus === "no-carry"
            ? false
            : Math.random() < 0.5;

        if (isSS) {
          // Satuan - Satuan: selalu n1 > n2 (hasil positif, tidak pernah kembar)
          const u2 = getRandomNumberInRange(1, 7);
          const u1 = getRandomNumberInRange(u2 + 1, 9);
          n1 = u1;
          n2 = u2;
        } else if (isPP) {
          // Puluhan - Puluhan: variasi kaya (contoh: 25 - 17, 84 - 36, 48 - 23, 76 - 32)
          if (wantBorrow) {
            // Meminjam: u1 < u2, t1 > t2
            const u1 = getRandomNumberInRange(0, 6);
            const u2 = getRandomNumberInRange(u1 + 1, 9);
            const t1 = getRandomNumberInRange(2, 9);
            const t2 = getRandomNumberInRange(1, t1 - 1);
            n1 = t1 * 10 + u1;
            n2 = t2 * 10 + u2;
          } else {
            // Tanpa meminjam: u1 >= u2, t1 > t2
            const u1 = getRandomNumberInRange(2, 9);
            const u2 = getRandomNumberInRange(0, u1 - 1);
            const t1 = getRandomNumberInRange(2, 9);
            const t2 = getRandomNumberInRange(1, t1 - 1);
            n1 = t1 * 10 + u1;
            n2 = t2 * 10 + u2;
          }
        } else if (isPS) {
          // Puluhan - Satuan (contoh: 84 - 8, 35 - 7, 48 - 3)
          if (wantBorrow) {
            const u1 = getRandomNumberInRange(0, 6);
            const u2 = getRandomNumberInRange(u1 + 1, 9);
            const t1 = getRandomNumberInRange(2, 9);
            n1 = t1 * 10 + u1;
            n2 = u2;
          } else {
            const u1 = getRandomNumberInRange(3, 9);
            const u2 = getRandomNumberInRange(1, u1 - 1);
            const t1 = getRandomNumberInRange(2, 9);
            n1 = t1 * 10 + u1;
            n2 = u2;
          }
        } else if (isRP) {
          // Ratusan - Puluhan (contoh: 245 - 68, 574 - 32)
          if (wantBorrow) {
            const u1 = getRandomNumberInRange(0, 6);
            const u2 = getRandomNumberInRange(u1 + 1, 9);
            const t1 = getRandomNumberInRange(1, 8);
            const t2 = getRandomNumberInRange(1, 8);
            const h1 = getRandomNumberInRange(1, 9);
            n1 = h1 * 100 + t1 * 10 + u1;
            n2 = t2 * 10 + u2;
          } else {
            const u1 = getRandomNumberInRange(2, 9);
            const u2 = getRandomNumberInRange(0, u1 - 1);
            const t1 = getRandomNumberInRange(2, 9);
            const t2 = getRandomNumberInRange(1, t1 - 1);
            const h1 = getRandomNumberInRange(1, 9);
            n1 = h1 * 100 + t1 * 10 + u1;
            n2 = t2 * 10 + u2;
          }
        } else if (isRS) {
          // Ratusan - Satuan
          if (wantBorrow) {
            const u1 = getRandomNumberInRange(0, 6);
            const u2 = getRandomNumberInRange(u1 + 1, 9);
            const t1 = getRandomNumberInRange(1, 9);
            const h1 = getRandomNumberInRange(1, 9);
            n1 = h1 * 100 + t1 * 10 + u1;
            n2 = u2;
          } else {
            const u1 = getRandomNumberInRange(2, 9);
            const u2 = getRandomNumberInRange(1, u1 - 1);
            const t1 = getRandomNumberInRange(1, 9);
            const h1 = getRandomNumberInRange(1, 9);
            n1 = h1 * 100 + t1 * 10 + u1;
            n2 = u2;
          }
        } else if (isRR) {
          // Ratusan - Ratusan
          if (wantBorrow) {
            const u1 = getRandomNumberInRange(0, 6);
            const u2 = getRandomNumberInRange(u1 + 1, 9);
            const t1 = getRandomNumberInRange(1, 8);
            const t2 = getRandomNumberInRange(1, 8);
            const h1 = getRandomNumberInRange(2, 9);
            const h2 = getRandomNumberInRange(1, h1 - 1);
            n1 = h1 * 100 + t1 * 10 + u1;
            n2 = h2 * 100 + t2 * 10 + u2;
          } else {
            const u1 = getRandomNumberInRange(2, 9);
            const u2 = getRandomNumberInRange(0, u1 - 1);
            const t1 = getRandomNumberInRange(2, 9);
            const t2 = getRandomNumberInRange(1, t1 - 1);
            const h1 = getRandomNumberInRange(2, 9);
            const h2 = getRandomNumberInRange(1, h1 - 1);
            n1 = h1 * 100 + t1 * 10 + u1;
            n2 = h2 * 100 + t2 * 10 + u2;
          }
        } else {
          // Fallback umum
          n1 = getRandomNumberInRange(Math.max(r1.min, 15), r1.max);
          n2 = getRandomNumberInRange(r2.min, Math.min(r2.max, n1 - 2));
        }

        // Perlindungan mutlak: n1 harus selalu lebih besar dari n2 (selisih minimal 2, tidak pernah kembar)
        if (n1 <= n2) {
          n1 = n2 + getRandomNumberInRange(2, 9);
        }

        const prev = lastProblemRef.current;
        if (!prev || prev.n1 !== n1 || prev.n2 !== n2 || prev.op !== op) {
          break;
        }
      }
      correct = n1 - n2;
      lastProblemRef.current = { n1, n2, op };
    } else if (op === "×") {
      let attempts = 0;
      while (attempts < 25) {
        attempts++;
        const isSS = p1 === "S" && p2 === "S";
        const isPS = (p1 === "P" && p2 === "S") || (p1 === "S" && p2 === "P");
        const isRS = (p1 === "R" && p2 === "S") || (p1 === "S" && p2 === "R");
        const isPP = p1 === "P" && p2 === "P";
        const isRP = (p1 === "R" && p2 === "P") || (p1 === "P" && p2 === "R");
        const isRR = p1 === "R" && p2 === "R";

        if (isSS) {
          n1 = getRandomNumberInRange(2, 9);
          n2 = getRandomNumberInRange(2, 9);
        } else if (isPS) {
          // Puluhan × Satuan atau sebaliknya (angka ramah visual balok: puluhan 12-79, pengali 2-5)
          const big = getRandomNumberInRange(12, 79);
          const small = getRandomNumberInRange(2, 5);
          n1 = p1 === "P" ? big : small;
          n2 = p1 === "P" ? small : big;
        } else if (isRS) {
          // Ratusan × Satuan (angka ramah balok: ratusan 102-240, pengali 2-4)
          const big = getRandomNumberInRange(102, 240);
          const small = getRandomNumberInRange(2, 4);
          n1 = p1 === "R" ? big : small;
          n2 = p1 === "R" ? small : big;
        } else if (isPP) {
          // Puluhan × Puluhan (angka bersahabat: 11-25 × 11-15)
          n1 = getRandomNumberInRange(11, 25);
          n2 = getRandomNumberInRange(11, 15);
        } else if (isRP || isRR) {
          // Ratusan × Puluhan/Ratusan (dibatasi agar tidak meledak ribuan besar)
          const big = getRandomNumberInRange(102, 220);
          const small = getRandomNumberInRange(10, 14);
          n1 = p1 === "R" ? big : small;
          n2 = p1 === "R" ? small : big;
        } else {
          n1 = getRandomNumberInRange(r1.min, Math.min(r1.max, 85));
          n2 = getRandomNumberInRange(r2.min, Math.min(r2.max, 5));
        }

        const prev = lastProblemRef.current;
        if (!prev || prev.n1 !== n1 || prev.n2 !== n2 || prev.op !== op) {
          break;
        }
      }
      correct = n1 * n2;
      lastProblemRef.current = { n1, n2, op };
    } else if (op === "÷") {
      // Pembagian dibuat campur-campur: mayoritas bilangan bulat bersih (~75-80%), dan sesekali desimal bersih (~20-25%).
      // Jika soal sebelumnya sudah desimal, soal berikutnya PASTI bilangan bulat habis dibagi!
      let isDecimalProblem = false;
      if (wasLastDivisionDecimalRef.current) {
        isDecimalProblem = false;
      } else {
        isDecimalProblem = Math.random() < 0.25;
      }
      wasLastDivisionDecimalRef.current = isDecimalProblem;

      // Tentukan kombinasi digit yang aktif
      let effectiveCombo = activeCombo;
      if (effectiveCombo === "ALL" || effectiveCombo === "random") {
        // Distribusi variasi porogapit yang seimbang
        const pool = [
          "R-P", "R-P", "R-P", "R-P", // 30% Ratusan ÷ Puluhan (misal 615 : 15)
          "P-S", "P-S", "P-S", "P-S", // 30% Puluhan ÷ Satuan (misal 72 : 3)
          "P-P", "P-P",               // 15% Puluhan ÷ Puluhan (misal 75 : 15)
          "R-S", "R-S",               // 15% Ratusan ÷ Satuan (misal 144 : 4)
          "S-S",                      // 10% Satuan ÷ Satuan (misal 8 : 2)
        ];
        effectiveCombo = pool[Math.floor(Math.random() * pool.length)];
      }

      let attempt = 0;
      let generatedN1 = 45;
      let generatedN2 = 3;
      let generatedCorrect = 15;

      while (attempt < 30) {
        attempt++;

        if (isDecimalProblem) {
          // KASUS DESIMAL:
          // Jika combo S-S atau sesekali P-P, buat variasi N1 < N2 (seperti 12 : 24 = 0.5 atau 15 : 20 = 0.75)
          const isSmallerDividend = Math.random() < 0.35 && (effectiveCombo === "P-P" || effectiveCombo === "S-S" || effectiveCombo === "S-P");

          if (isSmallerDividend) {
            const cleanFractions = [
              { numMult: 1, denMult: 2 }, // 0.5
              { numMult: 1, denMult: 4 }, // 0.25
              { numMult: 3, denMult: 4 }, // 0.75
              { numMult: 2, denMult: 5 }, // 0.4
              { numMult: 3, denMult: 5 }, // 0.6
              { numMult: 4, denMult: 5 }, // 0.8
              { numMult: 1, denMult: 8 }, // 0.125
            ];
            const frac = cleanFractions[Math.floor(Math.random() * cleanFractions.length)];
            const maxMult = effectiveCombo === "S-S" ? Math.floor(9 / frac.denMult) : Math.floor(40 / frac.denMult);
            const minMult = 2;
            const mult = getRandomNumberInRange(minMult, Math.max(minMult, maxMult));
            generatedN2 = mult * frac.denMult;
            generatedN1 = mult * frac.numMult;
            generatedCorrect = generatedN1 / generatedN2;
          } else {
            // N1 > N2 dengan sisa desimal bersih (misal 618 : 15 = 41.2 atau 75 : 4 = 18.75)
            let candidateDivisors: number[] = [];
            if (effectiveCombo === "P-S" || effectiveCombo === "R-S" || effectiveCombo === "S-S") {
              candidateDivisors = [2, 4, 5, 8];
            } else {
              candidateDivisors = [10, 12, 15, 16, 20, 24, 25, 40, 50];
            }
            generatedN2 = candidateDivisors[Math.floor(Math.random() * candidateDivisors.length)];

            let minK = 10;
            let maxK = 40;
            if (effectiveCombo === "R-P") {
              minK = Math.max(10, Math.floor(100 / generatedN2));
              maxK = Math.max(minK, Math.floor(950 / generatedN2));
            } else if (effectiveCombo === "P-S") {
              minK = Math.max(10, Math.floor(10 / generatedN2));
              maxK = Math.max(minK, Math.floor(90 / generatedN2));
            } else if (effectiveCombo === "P-P") {
              minK = 2;
              maxK = Math.max(2, Math.floor(90 / generatedN2));
            } else if (effectiveCombo === "R-S") {
              minK = Math.max(20, Math.floor(100 / generatedN2));
              maxK = Math.max(minK, Math.floor(950 / generatedN2));
            } else {
              minK = 1;
              maxK = 2;
            }

            const k = getRandomNumberInRange(minK, Math.max(minK, maxK));

            // Sisa yang menghasilkan desimal bersih
            const cleanRemainders: number[] = [];
            for (let rem = 1; rem < generatedN2; rem++) {
              const fracStr = (rem / generatedN2).toString();
              if (
                fracStr.length <= 5 &&
                !fracStr.includes("333") &&
                !fracStr.includes("666") &&
                !fracStr.includes("777")
              ) {
                cleanRemainders.push(rem);
              }
            }

            const rem =
              cleanRemainders.length > 0
                ? cleanRemainders[Math.floor(Math.random() * cleanRemainders.length)]
                : 1;

            generatedN1 = k * generatedN2 + rem;
            generatedCorrect = generatedN1 / generatedN2;
          }
        } else {
          // KASUS BILANGAN BULAT (HABIS DIBAGI)
          if (effectiveCombo === "R-P") {
            // Ratusan ÷ Puluhan (contoh: 615 : 15 = 41, 450 : 18 = 25, 345 : 15 = 23, 756 : 14 = 54, 525 : 25 = 21)
            const divisorPool = [12, 13, 14, 15, 16, 18, 20, 22, 24, 25, 28, 30, 32, 35, 45];
            generatedN2 = divisorPool[Math.floor(Math.random() * divisorPool.length)];
            const minK = Math.max(10, Math.ceil(100 / generatedN2));
            const maxK = Math.floor(999 / generatedN2);
            const k = getRandomNumberInRange(minK, Math.max(minK, maxK));
            generatedN1 = k * generatedN2;
            generatedCorrect = k;
          } else if (effectiveCombo === "P-S") {
            // Puluhan ÷ Satuan (contoh: 72 : 3 = 24, 84 : 4 = 21, 96 : 6 = 16, 65 : 5 = 13, 91 : 7 = 13, 48 : 3 = 16)
            generatedN2 = getRandomNumberInRange(2, 9);
            const minK = Math.max(11, Math.ceil(10 / generatedN2));
            const maxK = Math.floor(99 / generatedN2);
            const k = getRandomNumberInRange(minK, Math.max(minK, maxK));
            generatedN1 = k * generatedN2;
            generatedCorrect = k;
          } else if (effectiveCombo === "P-P") {
            // Puluhan ÷ Puluhan (contoh: 75 : 15 = 5, 96 : 12 = 8, 84 : 14 = 6, 90 : 15 = 6, 72 : 12 = 6, 84 : 28 = 3)
            // Pastikan k >= 2 dan divisor kecil (12 s/d 30) agar bukan sekedar 30 : 10 atau 50 : 50 = 1!
            const divisorPool = [12, 13, 14, 15, 16, 18, 20, 24, 25, 28, 30];
            generatedN2 = divisorPool[Math.floor(Math.random() * divisorPool.length)];
            const maxK = Math.floor(99 / generatedN2);
            const minK = 2;
            if (maxK >= minK) {
              const k = getRandomNumberInRange(minK, maxK);
              generatedN1 = k * generatedN2;
              generatedCorrect = k;
            } else {
              generatedN2 = 12;
              const k = getRandomNumberInRange(2, 8);
              generatedN1 = k * generatedN2;
              generatedCorrect = k;
            }
          } else if (effectiveCombo === "R-S") {
            // Ratusan ÷ Satuan (contoh: 144 : 4 = 36, 325 : 5 = 65, 456 : 6 = 76, 672 : 8 = 84, 255 : 5 = 51)
            generatedN2 = getRandomNumberInRange(2, 9);
            const minK = Math.max(20, Math.ceil(100 / generatedN2));
            const maxK = Math.floor(999 / generatedN2);
            const k = getRandomNumberInRange(minK, Math.max(minK, maxK));
            generatedN1 = k * generatedN2;
            generatedCorrect = k;
          } else if (effectiveCombo === "S-S") {
            // Satuan ÷ Satuan (contoh: 8 : 2 = 4, 9 : 3 = 3, 6 : 2 = 3, 8 : 4 = 2, 6 : 3 = 2)
            generatedN2 = getRandomNumberInRange(2, 4);
            const maxK = Math.floor(9 / generatedN2);
            const k = getRandomNumberInRange(2, Math.max(2, maxK));
            generatedN1 = k * generatedN2;
            generatedCorrect = k;
          } else {
            // Fallback jika kombinasi lain (R-R, S-P, dll.)
            let [c1, c2] = effectiveCombo.split("-");
            let d1 = getDigitRange(c1 || "P");
            let d2 = getDigitRange(c2 || "S");
            if (d1.min < d2.min) {
              [d1, d2] = [d2, d1];
            }
            generatedN2 = getRandomNumberInRange(Math.max(2, d2.min), Math.min(35, d2.max));
            const minK = Math.max(2, Math.ceil(d1.min / generatedN2));
            const maxK = Math.floor(d1.max / generatedN2);
            const k = getRandomNumberInRange(minK, Math.max(minK, maxK));
            generatedN1 = k * generatedN2;
            generatedCorrect = k;
          }
        }

        // Anti-Duplikasi: Pastikan soal baru TIDAK sama persis dengan soal sebelumnya!
        const prev = lastDivisionProblemRef.current;
        if (!prev || prev.n1 !== generatedN1 || prev.n2 !== generatedN2) {
          break;
        }
      }

      lastDivisionProblemRef.current = { n1: generatedN1, n2: generatedN2 };
      lastProblemRef.current = { n1: generatedN1, n2: generatedN2, op };
      n1 = generatedN1;
      n2 = generatedN2;
      correct = generatedCorrect;
    }

    setCurrentQuestionNumber(sessionLogs.length + 1);
    setNum1(n1);
    setNum2(n2);
    setCorrectAnswer(correct);
  };

  // Completion from Name Input Screen
  const handleNameSubmitted = (name: string) => {
    const finalName = name.trim() || "Dika";
    setCurrentUser(finalName);
    if (typeof window !== "undefined") {
      localStorage.setItem("mathboard_student_name", finalName);
    }
    setIsNameModalOpen(false);
    setActiveNav("belajar");
  };

  // Completion from Setup Wizard / Digit Selection
  const handleCompleteSetup = (name: string, op: OperationType, combo: string) => {
    const finalName = name.trim() || "Dika";
    setCurrentUser(finalName);
    if (typeof window !== "undefined") {
      localStorage.setItem("mathboard_student_name", finalName);
    }
    setSelectedOp(op);
    setPlaceValueCombo(combo);
    setSessionLogs([]);
    setCurrentQuestionNumber(1);
    setIsNameModalOpen(false);
    setActiveNav("latihan");
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

  // Auto-sync session records to database in background
  const syncSessionToDB = async (logsToSync: PracticeQuestionLog[]): Promise<string | null> => {
    if (logsToSync.length === 0) return null;
    setIsAutoSaving(true);
    try {
      const correctCount = logsToSync.filter((q) => q.isCorrect).length;
      const wrongCount = logsToSync.length - correctCount;
      const totalTime = logsToSync.reduce((sum, q) => sum + (q.timeTaken || 0), 0);
      const summaryErrors = generateSessionSummary(logsToSync);

      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: currentSessionAttemptId,
          studentName: currentUser?.trim() || "Dika",
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
          questions: logsToSync,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.attempt?.id) {
          setCurrentSessionAttemptId(data.attempt.id);
          return data.attempt.id;
        }
      }
    } catch (e) {
      console.error("Auto-sync attempt failed:", e);
    } finally {
      setIsAutoSaving(false);
    }
    return null;
  };

  // Handler saat sebuah soal latihan tuntas diselesaikan melalui 4 tahapan beralur
  const handlePracticeQuestionCompleted = (isCleanPass: boolean, sections: SectionDiagnostic[]) => {
    const timeSpent = Math.max(1, questionSecondsElapsed);
    // Cari section yang mengalami kendala (hadMistake atau status === "incorrect")
    const failedSec = sections.find((s) => s.hadMistake || s.status === "incorrect");

    if (isCleanPass) {
      playSound("fanfare");
      setIsSuccess(true);
      confetti({ particleCount: 85, spread: 70, origin: { y: 0.6 } });
      setScore((prev) => prev + 10);
      setStreak((prev) => prev + 1);
      showToast("Luar biasa! Semua tahap selesai secara mandiri tanpa kesalahan! 🎉", "🌟", "bg-emerald-600");
    } else {
      playSound("success");
      setStreak(0);
      showToast(
        `Bagus sudah menyelesaikan soal! Dicatat kendala pada ${failedSec?.sectionName || "tahap berhitung"} untuk evaluasi guru.`,
        "💡",
        "bg-amber-600"
      );
    }

    const currentLog: PracticeQuestionLog = {
      no: sessionLogs.length + 1,
      operation: currentOp,
      questionStr: `${num1} ${currentOp === "×" ? "×" : currentOp === "÷" ? "÷" : currentOp === "-" ? "−" : "+"} ${num2}`,
      num1,
      num2,
      userAnswer: String(correctAnswer),
      isCorrect: isCleanPass,
      timeTaken: timeSpent,
      errorType: isCleanPass
        ? null
        : failedSec?.errorType || (failedSec ? `SALAH_SECTION_${failedSec.sectionId}` : "SALAH_HITUNG_UMUM"),
      errorDetail: isCleanPass
        ? null
        : failedSec?.errorDetail || failedSec?.diagnosticNote || (failedSec ? `Kendala pada tahap ${failedSec.sectionName}` : "Terdapat kekeliruan berhitung pada tahapan pengerjaan."),
      suggestedIntervention: isCleanPass
        ? null
        : failedSec?.suggestedIntervention || (failedSec ? `Fokuskan pendampingan pada tahap ${failedSec.sectionName}` : "Bimbing siswa dengan alat bantu visual balok nilai tempat."),
      sections,
      failedSectionId: failedSec?.sectionId || null,
      failedSectionName: failedSec?.sectionName || null,
    };

    const updatedLogs = [...sessionLogs, currentLog];
    setSessionLogs(updatedLogs);
    setCurrentQuestionNumber(updatedLogs.length + 1);
    setQuestionSecondsElapsed(0);

    // Auto-save this question to database in background
    syncSessionToDB(updatedLogs);

    // Jika telah mencapai target 10 soal, langsung buka evaluasi rapor sesi
    if (updatedLogs.length >= 10) {
      setTimeout(() => {
        playSound("fanfare");
        setShowSummaryModal(true);
        showToast("Target 10 latihan tuntas & tersimpan di Dashboard Guru! 🏆", "🎉", "bg-emerald-600");
      }, 1600);
      return;
    }

    // Auto-advance ke soal berikutnya setelah 2.5 detik
    autoAdvanceTimerRef.current = setTimeout(() => {
      generateProblem();
    }, 2500);
  };

  // Submit practice session records to database
  const handleSaveSession = async () => {
    if (sessionLogs.length === 0) {
      showToast("Belum ada soal yang dikerjakan!", "⚠️", "bg-amber-600");
      return;
    }

    try {
      await syncSessionToDB(sessionLogs);
      playSound("fanfare");
      setShowSummaryModal(true);
      showToast("Hasil latihan berhasil disimpan ke database guru! 🚀", "✅", "bg-emerald-600");
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
    setCurrentSessionAttemptId(null);
    setSessionLogs([]);
    setScore(0);
    setStreak(0);
    setTotalSessionSeconds(0);
    setIsNameModalOpen(true);
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
      {/* 1. INPUT NAMA SCREEN / MODAL (JIKA BELUM MEMASUKKAN NAMA) */}
      {isNameModalOpen && (
        <NameInputScreen
          initialName={currentUser}
          onSubmitted={handleNameSubmitted}
        />
      )}

      {/* 1. TOP NAVBAR (LOGO MATHKU, AVATAR SISWA, PENGATURAN) */}
      <TopNavbar
        currentUser={currentUser || "Dika"}
        activeNav={activeNav}
        opLabel={selectedOp === "mix" ? "Campuran" : opNameMap[currentOp] || selectedOp}
        questionNumber={sessionLogs.length + 1}
        score={score * 10 || 120}
        level={Math.floor(score / 30) + 1}
        onNavigateHome={() => setActiveNav("beranda")}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onLogout={() => setIsNameModalOpen(true)}
      />

      {/* 2. KONTEN UTAMA */}
      <div className="flex flex-col xl:flex-row flex-1 gap-4 md:gap-5 items-start w-full">
        {/* SIDEBAR KIRI dengan toggle */}
        <div className="shrink-0 hidden xl:block">
          {leftSidebarOpen ? (
            <div className="w-64 2xl:w-72 relative">
              {/* Tombol tutup — pojok kanan atas sidebar */}
              <button
                type="button"
                onClick={() => setLeftSidebarOpen(false)}
                title="Tutup sidebar"
                className="absolute -right-3 top-3 z-30 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-slate-700 hover:border-slate-400 transition cursor-pointer"
              >
                <ChevronLeft size={13} />
              </button>
              <LeftSidebarNav
                activeNav={activeNav}
                onNavigate={(nav) => setActiveNav(nav)}
                selectedOp={selectedOp}
                onSelectOp={(op) => {
                  setSelectedOp(op);
                  generateProblem(op, placeValueCombo, focusOption);
                  setActiveNav("latihan");
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
                onOpenHistory={async () => {
                  if (sessionLogs.length > 0) {
                    await syncSessionToDB(sessionLogs);
                  }
                  setShowSummaryModal(true);
                }}
              />
            </div>
          ) : (
            /* Collapsed pill kiri */
            <button
              type="button"
              onClick={() => setLeftSidebarOpen(true)}
              title="Buka sidebar navigasi"
              className="flex flex-col items-center justify-start gap-2 w-10 pt-4 pb-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md transition cursor-pointer h-full min-h-[120px]"
            >
              <ChevronRight size={16} />
              <span className="[writing-mode:vertical-rl] text-[10px] font-black tracking-widest text-slate-400 rotate-180">MENU</span>
            </button>
          )}
        </div>

        {/* Mobile: sidebar kiri tampil penuh di atas */}
        <div className="w-full xl:hidden">
          <LeftSidebarNav
            activeNav={activeNav}
            onNavigate={(nav) => setActiveNav(nav)}
            selectedOp={selectedOp}
            onSelectOp={(op) => {
              setSelectedOp(op);
              generateProblem(op, placeValueCombo, focusOption);
              setActiveNav("latihan");
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
            onOpenHistory={async () => {
              if (sessionLogs.length > 0) {
                await syncSessionToDB(sessionLogs);
              }
              setShowSummaryModal(true);
            }}
          />
        </div>

        {/* AREA KONTEN BERDASARKAN ACTIVE NAV */}
        {activeNav === "beranda" && (
          <main className="flex-1 w-full flex flex-col gap-5 min-w-0">
            {/* HERO BANNER BERANDA (Gambar 1 Step 1) */}
            <div className="bg-white/95 rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="flex flex-col gap-3 max-w-lg">
                <div className="flex items-center gap-2 text-2xl sm:text-3xl font-black text-slate-900 font-fredoka">
                  <span>Halo, {currentUser || "Dika"}!</span>
                  <span>👋</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-600 leading-relaxed">
                  Ayo belajar matematika dengan cara yang lebih mudah dan menyenangkan!
                </p>

                {/* Balon Ucapan Maskot */}
                <div className="bg-blue-50/80 border border-blue-200 px-4 py-2.5 rounded-2xl text-xs font-black text-blue-900 flex items-center gap-2 max-w-sm">
                  <span>💬</span>
                  <span>&quot;Langkah kecil hari ini, hasil besar untuk besok!&quot;</span>
                </div>
              </div>

              {/* Maskot Anak Laki-laki dengan Hiasan Angka-angka Melayang */}
              <div className="relative w-44 h-44 shrink-0 flex items-center justify-center select-none">
                {/* Balon Angka 1 */}
                <div className="absolute -top-1 left-2 w-8 h-8 rounded-2xl bg-amber-400 text-amber-950 font-black font-fredoka text-sm flex items-center justify-center shadow-md shadow-amber-300/50 animate-bounce">
                  1
                </div>
                {/* Balon Angka 2 */}
                <div className="absolute top-1 right-2 w-9 h-9 rounded-2xl bg-blue-500 text-white font-black font-fredoka text-base flex items-center justify-center shadow-md shadow-blue-400/50 animate-pulse">
                  2
                </div>
                {/* Balon Angka 3 */}
                <div className="absolute -bottom-1 left-4 w-7 h-7 rounded-xl bg-emerald-400 text-emerald-950 font-black font-fredoka text-xs flex items-center justify-center shadow-md shadow-emerald-300/50">
                  3
                </div>
                {/* Balon Simbol + */}
                <div className="absolute -bottom-2 right-4 w-8 h-8 rounded-2xl bg-purple-500 text-white font-black font-fredoka text-sm flex items-center justify-center shadow-md shadow-purple-400/50 animate-bounce">
                  +
                </div>

                <div className="w-36 h-36">
                  <BoyMascotVector size={144} />
                </div>
              </div>
            </div>

            {/* GRID KARTU OPERASI (4 KARTU MATEMATIKA UTAMA) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* Penjumlahan */}
              <div className="bg-emerald-50/70 border-2 border-emerald-200 hover:border-emerald-400 rounded-3xl p-5 flex flex-col items-center text-center gap-3 transition hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl font-black shadow-sm shadow-emerald-400/30">
                  +
                </div>
                <div>
                  <h3 className="font-black text-slate-900 font-fredoka text-lg">Penjumlahan</h3>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">Konsep gabung & simpan nilai tempat</p>
                </div>
                <div className="flex flex-col gap-1.5 w-full mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOp("+");
                      setCurrentOp("+");
                      setActiveNav("belajar");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs transition cursor-pointer shadow-2xs"
                  >
                    Belajar Konsep
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOp("+");
                      generateProblem("+", placeValueCombo, focusOption);
                      setActiveNav("latihan");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs transition cursor-pointer"
                  >
                    Mulai Latihan
                  </button>
                </div>
              </div>

              {/* Pengurangan */}
              <div className="bg-orange-50/70 border-2 border-orange-200 hover:border-orange-400 rounded-3xl p-5 flex flex-col items-center text-center gap-3 transition hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-2xl font-black shadow-sm shadow-orange-400/30">
                  −
                </div>
                <div>
                  <h3 className="font-black text-slate-900 font-fredoka text-lg">Pengurangan</h3>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">Konsep tukar puluhan (regroup)</p>
                </div>
                <div className="flex flex-col gap-1.5 w-full mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOp("-");
                      setCurrentOp("-");
                      setActiveNav("belajar");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs transition cursor-pointer shadow-2xs"
                  >
                    Belajar Konsep
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOp("-");
                      generateProblem("-", placeValueCombo, focusOption);
                      setActiveNav("latihan");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-orange-100 text-orange-800 border border-orange-300 font-black text-xs transition cursor-pointer"
                  >
                    Mulai Latihan
                  </button>
                </div>
              </div>

              {/* Perkalian */}
              <div className="bg-rose-50/70 border-2 border-rose-200 hover:border-rose-400 rounded-3xl p-5 flex flex-col items-center text-center gap-3 transition hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-rose-500 text-white flex items-center justify-center text-2xl font-black shadow-sm shadow-rose-400/30">
                  ×
                </div>
                <div>
                  <h3 className="font-black text-slate-900 font-fredoka text-lg">Perkalian</h3>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">Mengurai nilai tempat & grup</p>
                </div>
                <div className="flex flex-col gap-1.5 w-full mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOp("×");
                      setCurrentOp("×");
                      setActiveNav("belajar");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs transition cursor-pointer shadow-2xs"
                  >
                    Belajar Konsep
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOp("×");
                      generateProblem("×", placeValueCombo, focusOption);
                      setActiveNav("latihan");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 font-black text-xs transition cursor-pointer"
                  >
                    Mulai Latihan
                  </button>
                </div>
              </div>

              {/* Pembagian */}
              <div className="bg-purple-50/70 border-2 border-purple-200 hover:border-purple-400 rounded-3xl p-5 flex flex-col items-center text-center gap-3 transition hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl font-black shadow-sm shadow-purple-400/30">
                  ÷
                </div>
                <div>
                  <h3 className="font-black text-slate-900 font-fredoka text-lg">Pembagian</h3>
                  <p className="text-[11px] font-bold text-slate-500 mt-0.5">Bagi per bagian & cek perkalian</p>
                </div>
                <div className="flex flex-col gap-1.5 w-full mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOp("÷");
                      setCurrentOp("÷");
                      setActiveNav("belajar");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition cursor-pointer shadow-2xs"
                  >
                    Belajar Konsep
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOp("÷");
                      generateProblem("÷", placeValueCombo, focusOption);
                      setActiveNav("latihan");
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-purple-100 text-purple-800 border border-purple-300 font-black text-xs transition cursor-pointer"
                  >
                    Mulai Latihan
                  </button>
                </div>
              </div>
            </div>
          </main>
        )}

        {/* MODE CONTOH SOAL (BAHAN BELAJAR MANDIRI ANAK - HALAMAN PENUH) */}
        {activeNav === "belajar" && (
          <ExampleProblemsPage
            studentName={currentUser || "Teman"}
            initialOp={selectedOp === "mix" ? "+" : (selectedOp as "+" | "-" | "×" | "÷")}
            onGoToDigitSelection={(op) => {
              if (op) setSelectedOp(op);
              setActiveNav("pilih-digit");
            }}
            onGoToHome={() => setActiveNav("beranda")}
          />
        )}

        {/* MODE PILIH DIGIT & OPERASI (HALAMAN PENUH) */}
        {activeNav === "pilih-digit" && (
          <DigitSelectionPage
            initialOp={selectedOp}
            initialCombo={placeValueCombo}
            onStartPractice={(op, combo) => {
              handleCompleteSetup(currentUser, op, combo);
            }}
            onBackToExamples={() => setActiveNav("belajar")}
          />
        )}

        {/* MODE PROFIL BELAJARKU (Gambar 1 Step 10) */}
        {activeNav === "profil" && (
          <main className="flex-1 w-full min-w-0">
            <StudentProfileView
              studentName={currentUser}
              onBackToHome={() => setActiveNav("beranda")}
              onStartRecommendedPractice={(op, combo) => {
                setSelectedOp(op);
                if (combo) setPlaceValueCombo(combo);
                generateProblem(op, combo || placeValueCombo, focusOption);
                setActiveNav("latihan");
              }}
            />
          </main>
        )}

        {/* MODE LATIHAN (Gambar 4) */}
        {activeNav === "latihan" && (
          <>
            <main className="flex-1 w-full flex flex-col gap-4 min-w-0">
            <PracticeCard
              key={`practice-card-${num1}-${currentOp}-${num2}`}
              num1={num1}
              num2={num2}
              currentOp={currentOp}
              levelName={`Level ${Math.floor(score / 30) + 1} – ${
                COMBO_LABELS[placeValueCombo]?.code || placeValueCombo
              }`}
              questionNumber={currentQuestionNumber}
              totalQuestions={10}
              onQuestionCompleted={handlePracticeQuestionCompleted}
              onNewProblem={() => generateProblem()}
              onBack={() => setActiveNav("beranda")}
              onSectionChanged={(secId) => setActivePracticeSection(secId)}
              onFinishSession={async () => {
                if (sessionLogs.length > 0) {
                  await syncSessionToDB(sessionLogs);
                }
                setShowSummaryModal(true);
              }}
              hasAnsweredAny={sessionLogs.length > 0}
              isAutoSaving={isAutoSaving}
              currentCombo={placeValueCombo}
              onSelectCombo={(combo) => {
                setPlaceValueCombo(combo);
                generateProblem(currentOp, combo, focusOption);
              }}
            />
          </main>

          {/* SIDEBAR KANAN BANTUAN dengan toggle — hanya di xl ke atas */}
          <div className="shrink-0 hidden xl:block">
            {rightSidebarOpen ? (
              <div className="w-72 2xl:w-80 relative">
                {/* Tombol tutup — pojok kiri atas sidebar */}
                <button
                  type="button"
                  onClick={() => setRightSidebarOpen(false)}
                  title="Tutup sidebar bantuan"
                  className="absolute -left-3 top-3 z-30 w-6 h-6 flex items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-slate-700 hover:border-slate-400 transition cursor-pointer"
                >
                  <ChevronRight size={13} />
                </button>
                <RightHelperPanel
                  currentOp={currentOp}
                  num1={num1}
                  num2={num2}
                  activeStep={activePracticeSection}
                  isHighlighted={isHelpActive}
                  onOpenMultiLevelHelp={() => setIsMultiLevelHelpOpen(true)}
                  onSelectStrategy={(strat) => {
                    if (strat === "blocks") {
                      setIsMultiLevelHelpOpen(true);
                      showToast("Bantuan Visual Balok & Konsep dibuka!", "🧱", "bg-amber-600");
                    } else if (strat === "place-value") {
                      showToast("Strategi Pecah Nilai aktif!", "✨", "bg-emerald-600");
                    }
                  }}
                />
              </div>
            ) : (
              /* Collapsed pill kanan */
              <button
                type="button"
                onClick={() => setRightSidebarOpen(true)}
                title="Buka sidebar bantuan"
                className="flex flex-col items-center justify-start gap-2 w-10 pt-4 pb-6 rounded-2xl bg-white border border-slate-200 shadow-xs text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-md transition cursor-pointer h-full min-h-[120px]"
              >
                <ChevronLeft size={16} />
                <span className="[writing-mode:vertical-rl] text-[10px] font-black tracking-widest text-slate-400">BANTUAN</span>
              </button>
            )}
          </div>

          {/* Mobile: sidebar kanan tampil di bawah konten */}
          <div className="w-full xl:hidden">
            <RightHelperPanel
              currentOp={currentOp}
              num1={num1}
              num2={num2}
              activeStep={activePracticeSection}
              isHighlighted={isHelpActive}
              onOpenMultiLevelHelp={() => setIsMultiLevelHelpOpen(true)}
              onSelectStrategy={(strat) => {
                if (strat === "blocks") {
                  setIsMultiLevelHelpOpen(true);
                  showToast("Bantuan Visual Balok & Konsep dibuka!", "🧱", "bg-amber-600");
                } else if (strat === "place-value") {
                  showToast("Strategi Pecah Nilai aktif!", "✨", "bg-emerald-600");
                }
              }}
            />
          </div>
        </>
        )}
      </div>

      {/* MULTI-LEVEL HELP MODAL (Level 1–4) */}
      <MultiLevelHelpModal
        isOpen={isMultiLevelHelpOpen}
        onClose={() => setIsMultiLevelHelpOpen(false)}
        operation={currentOp}
        num1={num1}
        num2={num2}
      />

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
                setIsNameModalOpen(true);
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
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-left text-xs font-bold text-blue-900 mb-3">
                <span className="font-black block uppercase text-[10px] text-blue-600 mb-0.5">Ringkasan Evaluasi Belajar:</span>
                {generateSessionSummary(sessionLogs)}
              </div>

              {/* ANALISIS KESALAHAN PER SECTION / TAHAP (PEDAGOGI GURU) */}
              {(() => {
                const report = analyzeSectionPerformance(sessionLogs);
                return (
                  <div className="flex flex-col gap-2 text-left">
                    {report.weakestSection && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2">
                        <span className="text-base">⚠️</span>
                        <div>
                          <span className="text-xs font-black text-rose-900 block font-fredoka">
                            Kendala Terbanyak: {report.weakestSection.name}
                          </span>
                          <p className="text-[11px] font-semibold text-rose-800 mt-0.5">
                            Siswa keliru {report.weakestSection.incorrect}x pada tahap ini. Disarankan penguatan peragaan konkret dengan balok nilai tempat.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="p-3 bg-white border border-slate-100 rounded-2xl shadow-2xs">
                      <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">
                        Ketuntasan Tiap Tahap (Section)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {Object.entries(report.sectionStats).map(([id, s]) => (
                          <div key={id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-center">
                            <p className="text-[9px] font-black text-slate-500 uppercase">Tahap {id}</p>
                            <p className={`text-sm font-black font-fredoka ${s.accuracy < 70 ? "text-rose-600" : "text-emerald-600"}`}>
                              {s.accuracy}%
                            </p>
                            <span className="text-[9px] font-bold text-slate-400">
                              {s.incorrect > 0 ? `${s.incorrect} keliru` : "Tuntas"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
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
          setIsMultiLevelHelpOpen(true);
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
