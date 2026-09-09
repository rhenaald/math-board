"use client";

import React, { useState } from "react";
import { Unlock, FileSpreadsheet, Trash2, Search, Eye, LogOut } from "lucide-react";
import AttemptDetailFullScreen from "./AttemptDetailFullScreen";
import { exportAllAttemptsToExcel } from "@/lib/excelExport";

interface QuestionLog {
  no: number;
  operation: string;
  questionStr: string;
  userAnswer: string;
  isCorrect: boolean;
  timeTaken: number;
  errorType?: string | null;
  errorDetail?: string | null;
  suggestedIntervention?: string | null;
}

interface AttemptRecord {
  id: string;
  studentName: string;
  dateStr: string;
  attemptNumber: number;
  operation?: string | null;
  placeValueLevel?: string | null;
  correctCount: number;
  wrongCount: number;
  totalTime: number;
  summaryErrors?: string | null;
  questions: QuestionLog[];
}

interface AdminDashboardProps {
  attemptsHistory: AttemptRecord[];
  onLogout: () => void;
  onClearHistory: () => void;
  showToast: (msg: string, icon?: string, bgColor?: string) => void;
  formatTimer: (seconds: number) => string;
}

export default function AdminDashboard({
  attemptsHistory,
  onLogout,
  onClearHistory,
  showToast,
  formatTimer,
}: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttempt, setSelectedAttempt] = useState<AttemptRecord | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);

  // Jika guru memilih melihat detail sesi, tampilkan layar penuh (full screen view)
  if (selectedAttempt) {
    return (
      <AttemptDetailFullScreen
        selectedAttempt={selectedAttempt}
        onBack={() => setSelectedAttempt(null)}
        formatTimer={formatTimer}
      />
    );
  }

  const filteredAttempts = attemptsHistory.filter((a) =>
    a.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAttempts = attemptsHistory.length;
  const uniqueStudentsCount = new Set(attemptsHistory.map((a) => a.studentName.toLowerCase())).size;
  const averageAccuracy =
    totalAttempts > 0
      ? Math.round(
          attemptsHistory.reduce(
            (sum, a) => sum + (a.correctCount / Math.max(1, a.correctCount + a.wrongCount)) * 100,
            0
          ) / totalAttempts
        )
      : 0;
  const averageSessionTime =
    totalAttempts > 0
      ? Math.round(attemptsHistory.reduce((sum, a) => sum + a.totalTime, 0) / totalAttempts)
      : 0;

  const handleExportExcel = () => {
    try {
      if (attemptsHistory.length === 0) {
        showToast("Tidak ada data untuk diekspor!", "⚠️", "bg-amber-600");
        return;
      }
      exportAllAttemptsToExcel(attemptsHistory);
      showToast("Berhasil mengekspor rekap evaluasi ke Excel (.xlsx)!", "✅", "bg-emerald-600");
    } catch (e) {
      console.error(e);
      showToast("Ekspor Excel gagal!", "❌", "bg-red-600");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6 w-full animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-fredoka flex items-center gap-2">
            <Unlock size={24} className="text-blue-600" /> Dashboard Guru - Evaluasi Latihan Siswa
          </h2>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Analisis miskonsepsi berhitung, penguasaan nilai tempat, dan diagnosis kesalahan belajar siswa.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            title="Download Rekap Evaluasi format Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet size={15} /> Ekspor Excel (.xlsx)
          </button>
          <button
            onClick={() => setIsClearModalOpen(true)}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <Trash2 size={14} /> Bersihkan Data
          </button>
          <button
            onClick={onLogout}
            className="bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </div>

      {/* OVERALL METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Sesi Latihan</span>
          <p className="text-2xl font-black text-slate-800 mt-1 font-fredoka">{totalAttempts}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Jumlah Siswa</span>
          <p className="text-2xl font-black text-slate-800 mt-1 font-fredoka">{uniqueStudentsCount}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Rata-rata Akurasi</span>
          <p className="text-2xl font-black text-blue-600 mt-1 font-fredoka">{averageAccuracy}%</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Rata-rata Durasi Sesi</span>
          <p className="text-2xl font-black text-purple-600 mt-1 font-fredoka">{formatTimer(averageSessionTime)}</p>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="relative max-w-sm w-full">
        <Search size={18} className="text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari nama siswa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        />
      </div>

      {/* TABLE LISTING RECORDS */}
      <div className="overflow-x-auto border border-slate-100 rounded-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-black uppercase tracking-wider">
              <th className="p-4">Nama Siswa</th>
              <th className="p-4">Tanggal Latihan</th>
              <th className="p-4">Operasi & Satuan</th>
              <th className="p-4 text-center">Sesi Ke-</th>
              <th className="p-4 text-center">Benar (Mandiri)</th>
              <th className="p-4 text-center">Perlu Bimbingan</th>
              <th className="p-4 text-center">Akurasi</th>
              <th className="p-4">Ringkasan Evaluasi</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-bold">
            {filteredAttempts.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center p-8 text-slate-400 font-semibold">
                  Belum ada data riwayat latihan siswa di database.
                </td>
              </tr>
            ) : (
              filteredAttempts.map((attempt) => {
                const totalQ = attempt.correctCount + attempt.wrongCount;
                const acc = totalQ > 0 ? Math.round((attempt.correctCount / totalQ) * 100) : 100;
                return (
                  <tr key={attempt.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 text-slate-900 font-black text-sm">{attempt.studentName}</td>
                    <td className="p-4 text-slate-500">{attempt.dateStr}</td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-extrabold text-blue-700">{attempt.operation || "Campuran"}</span>
                        <span className="text-[10px] text-slate-400">{attempt.placeValueLevel || "Puluhan"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">{attempt.attemptNumber}</td>
                    <td className="p-4 text-center text-emerald-600 font-black">{attempt.correctCount}</td>
                    <td className="p-4 text-center text-rose-600 font-black">{attempt.wrongCount}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          acc >= 80
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : acc >= 50
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {acc}%
                      </span>
                    </td>
                    <td className="p-4 max-w-xs">
                      {attempt.summaryErrors ? (
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {attempt.summaryErrors}
                        </p>
                      ) : (
                        <span className="text-slate-300 italic text-[11px]">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedAttempt(attempt)}
                        type="button"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] uppercase px-3.5 py-1.5 rounded-xl transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Eye size={13} /> Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL KONFIRMASI BERSIHKAN DATA */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 font-fredoka">Hapus Semua Riwayat Data?</h3>
              <p className="text-xs text-slate-600 font-semibold mt-1.5 leading-relaxed">
                Tindakan ini akan menghapus seluruh data sesi latihan dan evaluasi siswa dari database secara permanen. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsClearModalOpen(false);
                  onClearHistory();
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition cursor-pointer shadow-sm active:scale-95"
              >
                Ya, Bersihkan Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
