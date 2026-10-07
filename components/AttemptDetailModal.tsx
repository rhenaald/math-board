"use client";

import React from "react";
import { X, AlertCircle, Lightbulb, CheckCircle, HelpCircle } from "lucide-react";

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

interface AttemptDetailModalProps {
  selectedAttempt: AttemptRecord;
  onClose: () => void;
  formatTimer: (seconds: number) => string;
}

export default function AttemptDetailModal({
  selectedAttempt,
  onClose,
  formatTimer,
}: AttemptDetailModalProps) {
  const getBadgeForErrorType = (type?: string | null) => {
    if (!type) return null;
    const map: Record<string, { label: string; color: string }> = {
      LUPA_SIMPAN_PULUHAN: { label: "Lupa Simpan Puluhan", color: "bg-rose-50 text-rose-700 border-rose-200" },
      LUPA_SIMPAN_RATUSAN: { label: "Lupa Simpan Ratusan", color: "bg-rose-50 text-rose-700 border-rose-200" },
      LUPA_TAMBAH_SIMPANAN: { label: "Lupa Tambah Simpanan (+)", color: "bg-rose-50 text-rose-700 border-rose-200" },
      TERTUKAR_SIMPANAN_SATUAN: { label: "Simpanan Satuan Tertukar", color: "bg-amber-50 text-amber-700 border-amber-200" },
      TERTUKAR_SIMPANAN_PULUHAN: { label: "Simpanan Puluhan Tertukar", color: "bg-amber-50 text-amber-700 border-amber-200" },
      PENGURANGAN_TERBALIK: { label: "Pengurangan Terbalik", color: "bg-red-50 text-red-700 border-red-200" },
      LUPA_KURANGI_PINJAMAN: { label: "Lupa Kurang Pinjam", color: "bg-orange-50 text-orange-700 border-orange-200" },
      SALAH_NILAI_TEMPAT: { label: "Geser Nilai Tempat", color: "bg-purple-50 text-purple-700 border-purple-200" },
      DIGIT_TERBALIK: { label: "Digit Terbalik", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      SALAH_HITUNG_SATUAN: { label: "Salah Hitung Satuan", color: "bg-blue-50 text-blue-700 border-blue-200" },
      SALAH_HITUNG_PULUHAN: { label: "Salah Hitung Puluhan", color: "bg-blue-50 text-blue-700 border-blue-200" },
      OPERASI_TERTUKAR: { label: "Operasi Tertukar", color: "bg-amber-50 text-amber-700 border-amber-200" },
      LUPA_SIMPAN_KALI: { label: "Lupa Simpan Kali", color: "bg-rose-50 text-rose-700 border-rose-200" },
      MELIHAT_KELIPATAN_DEKAT: { label: "Meleset Kelipatan", color: "bg-amber-50 text-amber-700 border-amber-200" },
      SALAH_HITUNG_UMUM: { label: "Salah Hitung Umum", color: "bg-slate-100 text-slate-700 border-slate-200" },
      SALAH_SECTION_1: { label: "Kendala Tahap 1 (Susun Nilai Tempat)", color: "bg-purple-50 text-purple-700 border-purple-200" },
      SALAH_SECTION_2: { label: "Kendala Tahap 2 (Satuan / Simpan)", color: "bg-rose-50 text-rose-700 border-rose-200" },
      SALAH_SECTION_3: { label: "Kendala Tahap 3 (Puluhan / Simpan)", color: "bg-amber-50 text-amber-700 border-amber-200" },
      SALAH_SECTION_4: { label: "Kendala Tahap 4 (Hasil Akhir)", color: "bg-red-50 text-red-700 border-red-200" },
    };
    return map[type] || { label: type, color: "bg-slate-100 text-slate-700 border-slate-200" };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] border border-slate-100 max-w-3xl w-full max-h-[90vh] flex flex-col p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={20} />
        </button>

        <div className="border-b border-slate-100 pb-4 mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
              Detail Sesi Latihan
            </span>
            {selectedAttempt.operation && (
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full">
                Operasi: {selectedAttempt.operation}
              </span>
            )}
            {selectedAttempt.placeValueLevel && (
              <span className="text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
                Tingkat: {selectedAttempt.placeValueLevel}
              </span>
            )}
          </div>
          <h3 className="text-xl font-black text-slate-900 font-fredoka">
            {selectedAttempt.studentName} — Sesi #{selectedAttempt.attemptNumber}
          </h3>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Dikerjakan pada {selectedAttempt.dateStr}
          </p>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-2xl">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Benar (Mandiri)</span>
            <span className="text-base font-black text-emerald-600 font-fredoka">{selectedAttempt.correctCount} Soal</span>
          </div>
          <div className="bg-rose-50/50 border border-rose-100 p-2.5 rounded-2xl">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Perlu Bimbingan</span>
            <span className="text-base font-black text-rose-600 font-fredoka">{selectedAttempt.wrongCount} Soal</span>
          </div>
          <div className="bg-purple-50/50 border border-purple-100 p-2.5 rounded-2xl">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Waktu</span>
            <span className="text-base font-black text-purple-600 font-fredoka">{formatTimer(selectedAttempt.totalTime)}</span>
          </div>
        </div>

        {/* RINGKASAN DIAGNOSTIK KESALAHAN GURU */}
        {selectedAttempt.summaryErrors && (
          <div className="mb-4 p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs font-bold text-blue-900 flex items-start gap-2.5">
            <Lightbulb size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-black uppercase text-[10px] text-blue-700 block mb-0.5">
                Evaluasi Otomatis & Analisis Kesalahan Siswa:
              </span>
              <p className="leading-relaxed">{selectedAttempt.summaryErrors}</p>
            </div>
          </div>
        )}

        {/* DETAILED QUESTION LIST */}
        <div className="overflow-y-auto flex-1 pr-1 border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-100 font-black uppercase tracking-wider sticky top-0">
                <th className="p-3 text-center">No.</th>
                <th className="p-3 text-center">Operasi</th>
                <th className="p-3">Soal / Angka</th>
                <th className="p-3 text-center">Jawaban Siswa</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3">Analisis & Rekomendasi Guru</th>
                <th className="p-3 text-center">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              {selectedAttempt.questions.map((q) => {
                const badge = getBadgeForErrorType(q.errorType || (q.isCorrect ? null : "SALAH_HITUNG_UMUM"));
                return (
                  <tr key={q.no} className="hover:bg-slate-50/50">
                    <td className="p-3 text-center text-slate-400">{q.no}</td>
                    <td className="p-3 text-center font-black text-sm text-blue-600">{q.operation}</td>
                    <td className="p-3 text-slate-800 text-sm font-black whitespace-nowrap">{q.questionStr}</td>
                    <td className="p-3 text-center text-slate-900 font-black">{q.userAnswer}</td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          q.isCorrect
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {q.isCorrect ? "Benar (Mandiri)" : "Perlu Bimbingan"}
                      </span>
                    </td>
                    <td className="p-3 min-w-[220px]">
                      {q.isCorrect ? (
                        <span className="text-slate-400 italic text-[11px] flex items-center gap-1 font-semibold">
                          <CheckCircle size={12} className="text-emerald-500 inline" /> Diselesaikan mandiri tanpa kesalahan
                        </span>
                      ) : (
                        <div className="space-y-1">
                          {badge && (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-black border inline-block ${badge.color}`}>
                              {badge.label}
                            </span>
                          )}
                          <p className="text-[11px] text-slate-600 font-medium leading-snug">
                            {q.errorDetail || "Siswa mengalami kendala pada tahapan pengerjaan perhitungan."}
                          </p>
                          <p className="text-[10px] text-indigo-700 font-bold leading-snug bg-indigo-50/60 p-1 rounded border border-indigo-100">
                            💡 Saran: {q.suggestedIntervention || "Ajak siswa mengulang tahapan perhitungan dengan bantuan visual balok nilai tempat."}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center text-slate-500 font-black whitespace-nowrap">{q.timeTaken}s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2.5 px-5 rounded-xl transition"
          >
            Tutup Rincian
          </button>
        </div>
      </div>
    </div>
  );
}
