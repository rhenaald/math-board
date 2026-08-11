import React from "react";
import { X } from "lucide-react";

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] border border-slate-100 max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          type="button"
          className="absolute right-6 top-6 text-slate-400 hover:text-slate-600 transition"
        >
          <X size={20} />
        </button>
        
        <div className="border-b border-slate-100 pb-4 mb-4">
          <span className="text-[10px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full">
            Detail Log Pengerjaan
          </span>
          <h3 className="text-xl font-black text-slate-900 font-fredoka mt-2">
            {selectedAttempt.studentName} — Percobaan #{selectedAttempt.attemptNumber}
          </h3>
          <p className="text-slate-500 text-xs font-semibold mt-1">
            Dikerjakan pada {selectedAttempt.dateStr}
          </p>
        </div>

        {/* QUICK STATS */}
        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Benar</span>
            <span className="text-base font-black text-emerald-600 font-fredoka">{selectedAttempt.correctCount} Soal</span>
          </div>
          <div className="bg-rose-50/50 border border-rose-100 p-2.5 rounded-xl">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Salah</span>
            <span className="text-base font-black text-rose-600 font-fredoka">{selectedAttempt.wrongCount} Soal</span>
          </div>
          <div className="bg-purple-50/50 border border-purple-100 p-2.5 rounded-xl">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Total Durasi</span>
            <span className="text-base font-black text-purple-600 font-fredoka">{formatTimer(selectedAttempt.totalTime)}</span>
          </div>
        </div>

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
                <th className="p-3 text-center">Waktu (detik)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
              {selectedAttempt.questions.map((q) => (
                <tr key={q.no} className="hover:bg-slate-50/50">
                  <td className="p-3 text-center text-slate-400">{q.no}</td>
                  <td className="p-3 text-center font-black text-sm text-blue-600">{q.operation}</td>
                  <td className="p-3 text-slate-800 text-sm font-black">{q.questionStr}</td>
                  <td className="p-3 text-center text-slate-900 font-black">{q.userAnswer}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                      q.isCorrect ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}>
                      {q.isCorrect ? "Benar" : "Salah"}
                    </span>
                  </td>
                  <td className="p-3 text-center text-slate-500 font-black">{q.timeTaken}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            type="button"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs py-2 px-5 rounded-xl transition"
          >
            Tutup Rincian
          </button>
        </div>
      </div>
    </div>
  );
}
