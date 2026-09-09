"use client";

import React, { useState, useEffect } from "react";
import AdminDashboard from "@/components/AdminDashboard";
import LoginForm from "@/components/LoginForm";

interface QuestionLog {
  no: number;
  operation: string;
  questionStr: string;
  userAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
}

interface AttemptRecord {
  id: string;
  studentName: string;
  dateStr: string;
  attemptNumber: number;
  correctCount: number;
  wrongCount: number;
  totalTime: number;
  questions: QuestionLog[];
}

export default function GuruPage() {
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(false);
  const [attemptsHistory, setAttemptsHistory] = useState<AttemptRecord[]>([]);
  const [toast, setToast] = useState<{ message: string; icon: string; bgColor: string; visible: boolean } | null>(null);

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

  // Load history from DB
  const loadAttemptsFromDB = async () => {
    try {
      const res = await fetch("/api/attempts");
      if (res.ok) {
        const data = await res.json();
        setAttemptsHistory(data);
      }
    } catch (e) {
      console.error("Gagal memuat rekap nilai:", e);
    }
  };

  // Check login status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setAdminUnlocked(true);
            loadAttemptsFromDB();
          }
        }
      } catch (e) {
        console.error("Auth check failed:", e);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setAdminUnlocked(true);
    loadAttemptsFromDB();
    showToast("Akses Guru Terbuka! 🔑", "🔓", "bg-emerald-600");
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setAdminUnlocked(false);
        setAttemptsHistory([]);
        showToast("Anda telah keluar dari akun Guru.", "🔒", "bg-slate-800");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/attempts/clear", { method: "POST" });
      if (res.ok) {
        setAttemptsHistory([]);
        showToast("Semua riwayat rekap nilai berhasil dibersihkan dari database!", "🗑️", "bg-rose-600");
      } else {
        showToast("Gagal menghapus data dari database.", "❌", "bg-red-600");
      }
    } catch (e) {
      console.error(e);
      showToast("Terjadi kesalahan koneksi.", "❌", "bg-red-600");
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const secs = String(totalSeconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col justify-between relative overflow-x-hidden p-3 md:p-6 w-full bg-slate-50">
      <main className="flex-1 max-w-7xl mx-auto w-full flex items-center justify-center py-6">
        {!adminUnlocked ? (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onCancel={() => { window.location.href = "/"; }}
          />
        ) : (
          <AdminDashboard
            attemptsHistory={attemptsHistory}
            onLogout={handleLogout}
            onClearHistory={handleClearHistory}
            showToast={showToast}
            formatTimer={formatTimer}
          />
        )}
      </main>

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
