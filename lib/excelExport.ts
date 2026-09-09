import * as XLSX from "xlsx";

export interface QuestionLog {
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

export interface AttemptRecord {
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

/**
 * Mengekspor seluruh riwayat sesi latihan siswa ke file Microsoft Excel (.xlsx)
 * dengan 2 sheet: 'Rekap Sesi Siswa' dan 'Detail Soal & Diagnosis'.
 */
export function exportAllAttemptsToExcel(attempts: AttemptRecord[]) {
  if (!attempts || attempts.length === 0) {
    throw new Error("Tidak ada data sesi untuk diekspor.");
  }

  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // SHEET 1: REKAP SESI SISWA
  // -------------------------------------------------------------
  const summaryRows = attempts.map((a, idx) => {
    const totalQ = a.correctCount + a.wrongCount;
    const accuracy = totalQ > 0 ? Math.round((a.correctCount / totalQ) * 100) : 100;
    return {
      No: idx + 1,
      "ID Sesi": a.id,
      "Nama Siswa": a.studentName,
      "Tanggal Pelaksanaan": a.dateStr,
      "Sesi Ke-": a.attemptNumber,
      Operasi: a.operation || "Campuran",
      "Tingkat Nilai Tempat": a.placeValueLevel || "Satuan",
      "Total Soal": totalQ,
      "Benar (Mandiri)": a.correctCount,
      "Perlu Bimbingan (Salah)": a.wrongCount,
      "Akurasi (%)": `${accuracy}%`,
      "Durasi (detik)": a.totalTime,
      "Ringkasan Diagnostik": a.summaryErrors || "Semua soal dijawab dengan baik.",
    };
  });

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  // Atur lebar kolom agar nyaman dibaca di Excel
  wsSummary["!cols"] = [
    { wch: 5 },  // No
    { wch: 14 }, // ID Sesi
    { wch: 22 }, // Nama Siswa
    { wch: 20 }, // Tanggal
    { wch: 10 }, // Sesi Ke-
    { wch: 14 }, // Operasi
    { wch: 20 }, // Tingkat Nilai Tempat
    { wch: 12 }, // Total Soal
    { wch: 16 }, // Benar (Mandiri)
    { wch: 22 }, // Perlu Bimbingan
    { wch: 12 }, // Akurasi (%)
    { wch: 14 }, // Durasi (detik)
    { wch: 45 }, // Ringkasan Diagnostik
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Rekap Sesi Siswa");

  // -------------------------------------------------------------
  // SHEET 2: DETAIL SOAL & DIAGNOSIS KESALAHAN
  // -------------------------------------------------------------
  const detailRows: Record<string, unknown>[] = [];
  attempts.forEach((a) => {
    (a.questions || []).forEach((q) => {
      detailRows.push({
        "ID Sesi": a.id,
        "Nama Siswa": a.studentName,
        "Tanggal": a.dateStr,
        "Sesi Ke-": a.attemptNumber,
        "No Soal": q.no,
        "Operasi": q.operation,
        "Soal": q.questionStr,
        "Jawaban Siswa": q.userAnswer,
        "Status": q.isCorrect ? "Benar (Mandiri)" : "Salah (Perlu Bimbingan)",
        "Waktu Pengerjaan (detik)": q.timeTaken,
        "Jenis Kesalahan": q.errorType || "-",
        "Analisis Diagnosis": q.errorDetail || (q.isCorrect ? "Pemahaman konsep nilai tempat sudah tepat." : "-"),
        "Saran Intervensi Guru": q.suggestedIntervention || (q.isCorrect ? "Pertahankan pemahaman dan lanjutkan ke latihan variatif." : "-"),
      });
    });
  });

  const wsDetails = XLSX.utils.json_to_sheet(detailRows);
  wsDetails["!cols"] = [
    { wch: 14 }, // ID Sesi
    { wch: 22 }, // Nama Siswa
    { wch: 20 }, // Tanggal
    { wch: 10 }, // Sesi Ke-
    { wch: 9 },  // No Soal
    { wch: 10 }, // Operasi
    { wch: 16 }, // Soal
    { wch: 15 }, // Jawaban Siswa
    { wch: 24 }, // Status
    { wch: 22 }, // Waktu Pengerjaan
    { wch: 25 }, // Jenis Kesalahan
    { wch: 45 }, // Analisis Diagnosis
    { wch: 50 }, // Saran Intervensi Guru
  ];
  XLSX.utils.book_append_sheet(wb, wsDetails, "Detail Soal & Diagnosis");

  // Download file .xlsx
  const dateStamp = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `Rekap_Evaluasi_MathBoard_${dateStamp}.xlsx`);
}

/**
 * Mengekspor 1 sesi pengerjaan siswa spesifik ke Microsoft Excel (.xlsx)
 */
export function exportSingleAttemptToExcel(attempt: AttemptRecord) {
  if (!attempt) return;

  const wb = XLSX.utils.book_new();
  const totalQ = attempt.correctCount + attempt.wrongCount;
  const accuracy = totalQ > 0 ? Math.round((attempt.correctCount / totalQ) * 100) : 100;

  // Sheet 1: Profil & Ringkasan Siswa
  const infoRows = [
    { "Parameter Evaluasi": "Nama Siswa", "Keterangan": attempt.studentName },
    { "Parameter Evaluasi": "ID Sesi", "Keterangan": attempt.id },
    { "Parameter Evaluasi": "Waktu Pelaksanaan", "Keterangan": attempt.dateStr },
    { "Parameter Evaluasi": "Sesi Ke-", "Keterangan": String(attempt.attemptNumber) },
    { "Parameter Evaluasi": "Operasi Utama", "Keterangan": attempt.operation || "Campuran" },
    { "Parameter Evaluasi": "Tingkat Nilai Tempat", "Keterangan": attempt.placeValueLevel || "Satuan" },
    { "Parameter Evaluasi": "Total Soal Dikerjakan", "Keterangan": String(totalQ) },
    { "Parameter Evaluasi": "Benar (Mandiri)", "Keterangan": String(attempt.correctCount) },
    { "Parameter Evaluasi": "Perlu Bimbingan (Salah)", "Keterangan": String(attempt.wrongCount) },
    { "Parameter Evaluasi": "Akurasi Hasil", "Keterangan": `${accuracy}%` },
    { "Parameter Evaluasi": "Total Durasi Pengerjaan", "Keterangan": `${attempt.totalTime} detik` },
    { "Parameter Evaluasi": "Kesimpulan Diagnosis", "Keterangan": attempt.summaryErrors || "Semua soal dikerjakan dengan sangat baik." },
  ];
  const wsInfo = XLSX.utils.json_to_sheet(infoRows);
  wsInfo["!cols"] = [{ wch: 25 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsInfo, "Profil & Ringkasan");

  // Sheet 2: Rincian Soal
  const qRows = (attempt.questions || []).map((q) => ({
    "No Soal": q.no,
    "Operasi": q.operation,
    "Soal": q.questionStr,
    "Jawaban Siswa": q.userAnswer,
    "Status": q.isCorrect ? "Benar (Mandiri)" : "Salah (Perlu Bimbingan)",
    "Durasi (detik)": q.timeTaken,
    "Jenis Kesalahan": q.errorType || "-",
    "Diagnosis Guru": q.errorDetail || (q.isCorrect ? "Konsep nilai tempat tepat." : "-"),
    "Rekomendasi Intervensi": q.suggestedIntervention || (q.isCorrect ? "Tingkatkan ke level tantangan berikutnya." : "-"),
  }));
  const wsQuestions = XLSX.utils.json_to_sheet(qRows);
  wsQuestions["!cols"] = [
    { wch: 9 },  // No Soal
    { wch: 10 }, // Operasi
    { wch: 16 }, // Soal
    { wch: 15 }, // Jawaban
    { wch: 24 }, // Status
    { wch: 15 }, // Durasi
    { wch: 25 }, // Jenis Kesalahan
    { wch: 45 }, // Diagnosis
    { wch: 50 }, // Rekomendasi
  ];
  XLSX.utils.book_append_sheet(wb, wsQuestions, "Rincian Soal");

  const safeName = attempt.studentName.replace(/[^a-zA-Z0-9]/g, "_");
  const dateStamp = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `Laporan_Evaluasi_${safeName}_${dateStamp}.xlsx`);
}
