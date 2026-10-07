"use client";

import React from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Printer,
  Sparkles,
  Award,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import { exportSingleAttemptToExcel } from "@/lib/excelExport";

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

interface AttemptDetailFullScreenProps {
  selectedAttempt: AttemptRecord;
  onBack: () => void;
  formatTimer: (seconds: number) => string;
}

export default function AttemptDetailFullScreen({
  selectedAttempt,
  onBack,
  formatTimer,
}: AttemptDetailFullScreenProps) {
  const totalQuestions = selectedAttempt.questions.length || (selectedAttempt.correctCount + selectedAttempt.wrongCount);
  const accuracy = totalQuestions > 0
    ? Math.round((selectedAttempt.correctCount / totalQuestions) * 100)
    : 100;

  const getBadgeForErrorType = (type?: string | null) => {
    if (!type) return null;
    const map: Record<string, { label: string; color: string; desc: string }> = {
      LUPA_SIMPAN_PULUHAN: {
        label: "Lupa Simpan Puluhan",
        color: "bg-rose-50 text-rose-700 border-rose-200",
        desc: "Siswa tidak menuliskan angka simpanan pada kolom puluhan saat hasil satuan ≥ 10.",
      },
      LUPA_SIMPAN_RATUSAN: {
        label: "Lupa Simpan Ratusan",
        color: "bg-rose-50 text-rose-700 border-rose-200",
        desc: "Siswa lupa menyimpan ke kolom ratusan saat penjumlahan puluhan ≥ 10.",
      },
      LUPA_TAMBAH_SIMPANAN: {
        label: "Lupa Menambahkan Simpanan (+)",
        color: "bg-rose-50 text-rose-700 border-rose-200",
        desc: "Siswa menjumlahkan puluhan tanpa mengikutsertakan angka simpanan kecil di atasnya.",
      },
      TERTUKAR_SIMPANAN_SATUAN: {
        label: "Simpanan Satuan Tertukar",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        desc: "Siswa menukar posisi digit simpanan puluhan dan hasil satuan.",
      },
      TERTUKAR_SIMPANAN_PULUHAN: {
        label: "Simpanan Puluhan Tertukar",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        desc: "Siswa menukar posisi digit simpanan ratusan dan hasil digit puluhan.",
      },
      PENGURANGAN_TERBALIK: {
        label: "Pengurangan Terbalik (Tanpa Pinjam)",
        color: "bg-red-50 text-red-700 border-red-200",
        desc: "Siswa membalik urutan pengurangan digit bawah dikurangi digit atas untuk menghindari pinjaman.",
      },
      LUPA_KURANGI_PINJAMAN: {
        label: "Lupa Mengurangi Pinjaman (-)",
        color: "bg-orange-50 text-orange-700 border-orange-200",
        desc: "Siswa lupa mengurangi nilai tempat yang sebelumnya telah dipinjam oleh satuan.",
      },
      SALAH_NILAI_TEMPAT: {
        label: "Pergeseran Nilai Tempat",
        color: "bg-purple-50 text-purple-700 border-purple-200",
        desc: "Digit jawaban tergeser letak kolomnya (tertukar antara puluhan dan satuan).",
      },
      DIGIT_TERBALIK: {
        label: "Penulisan Digit Terbalik",
        color: "bg-indigo-50 text-indigo-700 border-indigo-200",
        desc: "Urutan penulisan digit terbalik dari kiri ke kanan.",
      },
      SALAH_HITUNG_SATUAN: {
        label: "Kekeliruan Hitung Satuan",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        desc: "Kekeliruan perhitungan fakta dasar pada kolom satuan.",
      },
      SALAH_HITUNG_PULUHAN: {
        label: "Kekeliruan Hitung Puluhan",
        color: "bg-blue-50 text-blue-700 border-blue-200",
        desc: "Kekeliruan perhitungan pada kolom puluhan.",
      },
      OPERASI_TERTUKAR: {
        label: "Operasi Tertukar",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        desc: "Siswa menjumlahkan padahal soal meminta pengurangan, atau sebaliknya.",
      },
      LUPA_SIMPAN_KALI: {
        label: "Lupa Simpan Perkalian",
        color: "bg-rose-50 text-rose-700 border-rose-200",
        desc: "Siswa tidak menambahkan angka simpanan pada hasil perkalian nilai tempat.",
      },
      MELIHAT_KELIPATAN_DEKAT: {
        label: "Meleset Kelipatan Pembagian",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        desc: "Hasil bagi siswa meleset 1 angka dari hasil bagi sebenarnya.",
      },
      SALAH_HITUNG_UMUM: {
        label: "Kekeliruan Hitung Umum",
        color: "bg-slate-100 text-slate-700 border-slate-200",
        desc: "Hasil hitung belum sesuai dengan kunci perhitungan.",
      },
      SALAH_SECTION_1: {
        label: "Kendala Tahap 1 (Susun Nilai Tempat)",
        color: "bg-purple-50 text-purple-700 border-purple-200",
        desc: "Siswa keliru menempatkan digit bilangan pada kolom nilai tempat papan hitung.",
      },
      SALAH_SECTION_2: {
        label: "Kendala Tahap 2 (Satuan / Simpan / Pinjam)",
        color: "bg-rose-50 text-rose-700 border-rose-200",
        desc: "Kendala saat menghitung kolom satuan atau proses simpan/pinjam.",
      },
      SALAH_SECTION_3: {
        label: "Kendala Tahap 3 (Puluhan / Simpanan)",
        color: "bg-amber-50 text-amber-700 border-amber-200",
        desc: "Kendala saat menghitung operasi nilai tempat puluhan.",
      },
      SALAH_SECTION_4: {
        label: "Kendala Tahap 4 (Hasil Akhir)",
        color: "bg-red-50 text-red-700 border-red-200",
        desc: "Kekeliruan saat menuliskan atau menggabungkan hasil akhir keseluruhan.",
      },
    };
    return map[type] || {
      label: type,
      color: "bg-slate-100 text-slate-700 border-slate-200",
      desc: "Catatan evaluasi khusus pengerjaan siswa.",
    };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300 pb-12">
      {/* 1. TOP NAV BAR DETAIL */}
      <div className="bg-white rounded-3xl p-4 sm:px-6 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          type="button"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs sm:text-sm transition cursor-pointer active:scale-95"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Daftar Sesi</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportSingleAttemptToExcel(selectedAttempt)}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer shadow-xs active:scale-95"
            title="Download Rapor Siswa dalam format Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet size={15} />
            <span>Ekspor Excel (.xlsx)</span>
          </button>
          <button
            onClick={handlePrint}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition cursor-pointer"
            title="Cetak Laporan Evaluasi"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">Cetak Rapor</span>
          </button>
        </div>
      </div>

      {/* 2. HERO PROFILE SISWA & METADATA SESI */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl sm:text-4xl shadow-md border border-white/30 shrink-0">
              🎓
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full backdrop-blur-xs border border-white/20">
                  Laporan Evaluasi Siswa
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-3 py-1 rounded-full shadow-xs">
                  Sesi Ke-{selectedAttempt.attemptNumber}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-fredoka tracking-tight">
                {selectedAttempt.studentName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-xs sm:text-sm font-semibold text-blue-100">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} /> {selectedAttempt.dateStr}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} /> Total Waktu: {formatTimer(selectedAttempt.totalTime)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-black text-blue-200 block">Operasi</span>
              <span className="text-base font-black font-fredoka">{selectedAttempt.operation || "Penjumlahan"}</span>
            </div>
            <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center min-w-[100px]">
              <span className="text-[10px] uppercase font-black text-blue-200 block">Tingkat Nilai</span>
              <span className="text-base font-black font-fredoka">{selectedAttempt.placeValueLevel || "Puluhan"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. QUICK STATS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Benar (Mandiri)</span>
            <span className="text-2xl font-black text-emerald-600 font-fredoka">{selectedAttempt.correctCount} Soal</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Perlu Bimbingan</span>
            <span className="text-2xl font-black text-rose-600 font-fredoka">{selectedAttempt.wrongCount} Soal</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <Award size={24} />
          </div>
          <div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Tingkat Akurasi</span>
            <span className={`text-2xl font-black font-fredoka ${accuracy >= 80 ? "text-blue-600" : accuracy >= 50 ? "text-amber-600" : "text-rose-600"}`}>
              {accuracy}%
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Durasi Sesi</span>
            <span className="text-2xl font-black text-purple-600 font-fredoka">{formatTimer(selectedAttempt.totalTime)}</span>
          </div>
        </div>
      </div>

      {/* 4. CALLOUT RINGKASAN EVALUASI OTOMATIS & REKOMENDASI GURU */}
      <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-purple-50/80 rounded-3xl p-6 border-2 border-blue-200/80 shadow-sm flex flex-col sm:flex-row items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
          <Lightbulb size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-wider text-blue-700 font-fredoka">
              Analisis Diagnostik & Rekomendasi Pengajaran Guru
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-200/70 text-blue-900 text-[10px] font-black">
              Otomatis
            </span>
          </div>
          <p className="text-sm font-bold text-slate-800 leading-relaxed">
            {selectedAttempt.summaryErrors || "Sempurna! Semua soal dijawab dengan benar tanpa miskonsepsi."}
          </p>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Gunakan tabel rincian di bawah ini untuk melihat bagian mana dari langkah nilai tempat yang sudah dikuasai atau masih membutuhkan bimbingan visual.
          </p>
        </div>
      </div>

      {/* 5. DAFTAR SOAL RINCIAN (LEGA, INDAH, DAN RESPONSIF) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 font-fredoka flex items-center gap-2">
              <Layers size={22} className="text-blue-600" />
              Rincian Soal demi Soal ({selectedAttempt.questions.length} Soal)
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Klik dan amati langkah pengerjaan siswa, waktu respon, jenis kekeliruan, serta saran intervensi spesifik.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {selectedAttempt.questions.map((q) => {
            const badge = getBadgeForErrorType(q.errorType || (q.isCorrect ? null : "SALAH_HITUNG_UMUM"));

            return (
              <div
                key={q.no}
                className={`rounded-2xl p-5 border-2 transition-all ${
                  q.isCorrect
                    ? "bg-emerald-50/20 border-emerald-100 hover:border-emerald-200"
                    : "bg-rose-50/30 border-rose-200 hover:border-rose-300"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100/80 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center text-xs font-black font-fredoka">
                      #{q.no}
                    </span>
                    <div className="text-lg sm:text-xl font-black text-slate-900 font-fredoka tracking-tight">
                      {q.questionStr}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                      <Clock size={13} /> {q.timeTaken} detik
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black border flex items-center gap-1.5 ${
                        q.isCorrect
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      {q.isCorrect ? (
                        <>
                          <CheckCircle2 size={14} /> Selesai Mandiri
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={14} /> Perlu Bimbingan
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* CONTENT AREA: ANALISIS DIAGNOSTIK & REKOMENDASI */}
                {q.isCorrect ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                    <Sparkles size={16} className="text-emerald-600 shrink-0" />
                    <span>
                      Siswa menyelesaikan seluruh alur berhitung pada soal ini secara mandiri tanpa membuat kesalahan langkah.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {badge && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-xl text-xs font-black border ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {badge.desc}
                        </span>
                      </div>
                    )}

                    {q.errorDetail && (
                      <div className="p-3 bg-white rounded-xl border border-rose-100 text-xs font-semibold text-slate-700 leading-relaxed">
                        <span className="font-bold text-rose-800 block mb-0.5">Catatan Pengerjaan Siswa:</span>
                        {q.errorDetail}
                      </div>
                    )}

                    {q.suggestedIntervention && (
                      <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200 text-xs font-bold text-indigo-950 flex items-start gap-2">
                        <Lightbulb size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-black text-indigo-700 block mb-0.5">Rekomendasi Intervensi Guru:</span>
                          <p className="leading-relaxed">{q.suggestedIntervention}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
