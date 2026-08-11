import React, { useState } from "react";
import { Unlock, Download, Trash2, Search, Eye, LogOut } from "lucide-react";
import AttemptDetailModal from "./AttemptDetailModal";

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

  const filteredAttempts = attemptsHistory.filter((a) =>
    a.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAttempts = attemptsHistory.length;
  const uniqueStudentsCount = new Set(attemptsHistory.map((a) => a.studentName.toLowerCase())).size;
  const averageAccuracy = totalAttempts > 0
    ? Math.round(
      attemptsHistory.reduce(
        (sum, a) => sum + (a.correctCount / (a.correctCount + a.wrongCount)) * 100,
        0
      ) / totalAttempts
    )
    : 0;
  const averageQuizTime = totalAttempts > 0
    ? Math.round(attemptsHistory.reduce((sum, a) => sum + a.totalTime, 0) / totalAttempts)
    : 0;

  const exportToCSV = () => {
    try {
      if (attemptsHistory.length === 0) {
        showToast("Tidak ada data untuk diekspor!", "⚠️", "bg-amber-600");
        return;
      }

      let csvContent = "\ufeff"; // BOM for Excel UTF-8
      csvContent +=
        "ID Percobaan,Nama Siswa,Tanggal,Percobaan Ke,Benar,Salah,Total Waktu Kuis (detik),No Soal,Operasi,Soal,Jawaban Siswa,Status,Waktu Pengerjaan Soal (detik)\n";

      attemptsHistory.forEach((a) => {
        a.questions.forEach((q) => {
          const row = [
            a.id,
            `"${a.studentName.replace(/"/g, '""')}"`,
            `"${a.dateStr}"`,
            a.attemptNumber,
            a.correctCount,
            a.wrongCount,
            a.totalTime,
            q.no,
            q.operation,
            `"${q.questionStr}"`,
            q.userAnswer,
            q.isCorrect ? "Benar" : "Salah",
            q.timeTaken,
          ].join(",");
          csvContent += row + "\n";
        });
      });

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Rekap_Nilai_MathBoard_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("Berhasil mengekspor rekap CSV!", "✅", "bg-emerald-600");
    } catch (e) {
      console.error(e);
      showToast("Ekspor CSV gagal!", "❌", "bg-red-600");
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm flex flex-col gap-6 w-full animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-fredoka flex items-center gap-2">
            <Unlock size={24} className="text-purple-600" /> Dashboard Guru - Rekap Nilai Siswa
          </h2>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Analisis kecepatan pemahaman, akurasi, dan riwayat hasil pengerjaan kuis siswa.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={exportToCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl shadow-md transition flex items-center gap-2"
          >
            <Download size={14} /> Ekspor CSV
          </button>
          <button
            onClick={onClearHistory}
            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition flex items-center gap-2"
          >
            <Trash2 size={14} /> Bersihkan Data
          </button>
          <button
            onClick={onLogout}
            className="bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl transition flex items-center gap-2"
          >
            <LogOut size={14} /> Keluar
          </button>
        </div>
      </div>

      {/* OVERALL METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Total Percobaan Kuis</span>
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
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Rata-rata Waktu Kuis</span>
          <p className="text-2xl font-black text-purple-600 mt-1 font-fredoka">{formatTimer(averageQuizTime)}</p>
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
          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 font-bold focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
        />
      </div>

      {/* TABLE LISTING RECORDS */}
      <div className="overflow-x-auto border border-slate-100 rounded-2xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-black uppercase tracking-wider">
              <th className="p-4">Nama Siswa</th>
              <th className="p-4">Tanggal Pengerjaan</th>
              <th className="p-4 text-center">Percobaan Ke-</th>
              <th className="p-4 text-center">Benar</th>
              <th className="p-4 text-center">Salah</th>
              <th className="p-4 text-center">Akurasi</th>
              <th className="p-4 text-center">Total Waktu</th>
              <th className="p-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-bold">
            {filteredAttempts.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center p-8 text-slate-400 font-semibold">
                  Belum ada data riwayat pengerjaan kuis di database.
                </td>
              </tr>
            ) : (
              filteredAttempts.map((attempt) => {
                const acc = Math.round((attempt.correctCount / (attempt.correctCount + attempt.wrongCount)) * 100);
                return (
                  <tr key={attempt.id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4 text-slate-900 font-black text-sm">{attempt.studentName}</td>
                    <td className="p-4 text-slate-500">{attempt.dateStr}</td>
                    <td className="p-4 text-center">{attempt.attemptNumber}</td>
                    <td className="p-4 text-center text-emerald-600 font-black">{attempt.correctCount}</td>
                    <td className="p-4 text-center text-rose-600 font-black">{attempt.wrongCount}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${acc >= 80
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : acc >= 50
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                      >
                        {acc}%
                      </span>
                    </td>
                    <td className="p-4 text-center text-purple-700 font-black">{formatTimer(attempt.totalTime)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedAttempt(attempt)}
                        type="button"
                        className="bg-purple-100 hover:bg-purple-200 text-purple-700 font-extrabold text-[10px] uppercase px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1"
                      >
                        <Eye size={12} /> Detail
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedAttempt && (
        <AttemptDetailModal
          selectedAttempt={selectedAttempt}
          onClose={() => setSelectedAttempt(null)}
          formatTimer={formatTimer}
        />
      )}
    </div>
  );
}
