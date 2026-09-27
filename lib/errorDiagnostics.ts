export interface ErrorDiagnosticResult {
  errorType: string;
  badgeLabel: string;
  badgeColor: string; // Tailwind color classes
  studentFeedback: string;
  errorDetail: string;
  suggestedIntervention: string;
}

export interface ColumnValues {
  th: string;
  h: string;
  t: string;
  u: string;
}

/**
 * Menganalisis kesalahan berhitung siswa berdasarkan nilai tempat,
 * operasi, angka soal, dan digit yang dimasukkan pada kotak papan hitung.
 */
export function diagnoseError(
  operation: "+" | "-" | "×" | "÷" | string,
  num1: number,
  num2: number,
  correctAnswer: number,
  userAnswerStr: string,
  ansValues: ColumnValues,
  carryValues?: ColumnValues
): ErrorDiagnosticResult {
  const cleanDigit = (d?: string) => {
    if (!d || d.trim() === "") return 0;
    const n = parseInt(d.trim(), 10);
    return isNaN(n) ? 0 : n;
  };

  const ansU = cleanDigit(ansValues.u);
  const ansT = cleanDigit(ansValues.t);
  const ansH = cleanDigit(ansValues.h);
  const ansTh = cleanDigit(ansValues.th);

  const userNum = parseInt(
    `${cleanDigit(ansValues.th)}${cleanDigit(ansValues.h)}${cleanDigit(ansValues.t)}${cleanDigit(ansValues.u)}`,
    10
  );

  // Dekomposisi digit num1 dan num2
  const u1 = num1 % 10;
  const t1 = Math.floor((num1 % 100) / 10);
  const h1 = Math.floor((num1 % 1000) / 100);
  const th1 = Math.floor((num1 % 10000) / 1000);

  const u2 = num2 % 10;
  const t2 = Math.floor((num2 % 100) / 10);
  const h2 = Math.floor((num2 % 1000) / 100);
  const th2 = Math.floor((num2 % 10000) / 1000);

  // Dekomposisi digit correctAnswer
  const cU = correctAnswer % 10;
  const cT = Math.floor((correctAnswer % 100) / 10);
  const cH = Math.floor((correctAnswer % 1000) / 100);
  const cTh = Math.floor((correctAnswer % 10000) / 1000);

  // 1. CEK OPERASI TERTUKAR (Menjumlahkan bukannya mengurang, atau sebaliknya)
  if (operation === "-" && userNum === num1 + num2) {
    return {
      errorType: "OPERASI_TERTUKAR",
      badgeLabel: "Operasi Tertukar",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      studentFeedback: "Kamu menjumlahkan kedua angka. Perhatikan tanda pengurangan (−) ya!",
      errorDetail: `Siswa melakukan penjumlahan (${num1} + ${num2} = ${userNum}) padahal soal menghendaki pengurangan.`,
      suggestedIntervention: "Ingatkan siswa untuk selalu membaca simbol tanda operasi dengan teliti sebelum berhitung."
    };
  }

  if (operation === "+" && userNum === Math.abs(num1 - num2)) {
    return {
      errorType: "OPERASI_TERTUKAR",
      badgeLabel: "Operasi Tertukar",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
      studentFeedback: "Kamu mengurangkan angka. Perhatikan tanda penjumlahan (+) ya!",
      errorDetail: `Siswa melakukan pengurangan (${num1} − ${num2} = ${userNum}) padahal soal menghendaki penjumlahan.`,
      suggestedIntervention: "Ingatkan siswa untuk memverifikasi simbol operasi sebelum mulai menghitung."
    };
  }

  // 2. CEK PERGESERAN DIGIT / NILAI TEMPAT TERBALIK
  const correctStr = String(correctAnswer);
  const reversedStr = correctStr.split("").reverse().join("");
  if (userAnswerStr.trim() === reversedStr && correctStr.length > 1) {
    return {
      errorType: "DIGIT_TERBALIK",
      badgeLabel: "Digit Terbalik",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-300",
      studentFeedback: "Angka yang kamu tulis terbalik urutannya. Kolom satuan harus di kanan!",
      errorDetail: `Siswa menuliskan digit secara terbalik (${userAnswerStr} alih-alih ${correctAnswer}).`,
      suggestedIntervention: "Berikan latihan orientasi nilai tempat: satuan di kolom paling kanan, disusul puluhan di kirinya."
    };
  }

  if (userNum === correctAnswer * 10 || (userNum * 10 === correctAnswer && userNum !== 0)) {
    return {
      errorType: "SALAH_NILAI_TEMPAT",
      badgeLabel: "Geser Nilai Tempat",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-300",
      studentFeedback: "Jawabanmu tergeser satu kolom. Periksa letak satuan dan puluhannya!",
      errorDetail: `Jawaban siswa tergeser kelipatan 10 (${userNum} vs ${correctAnswer}), kemungkinan salah memasukkan kolom kotak.`,
      suggestedIntervention: "Pandu siswa mencocokkan setiap digit jawaban tepat lurus ke bawah kolomnya."
    };
  }

  // 3. ANALISIS POLA PENJUMLAHAN (+)
  if (operation === "+") {
    const carryToTens = u1 + u2 >= 10 ? 1 : 0;
    const carryToHundreds = t1 + t2 + carryToTens >= 10 ? 1 : 0;

    // Lupa simpan ke puluhan (satuan benar, puluhan = t1 + t2 tanpa simpanan)
    if (carryToTens > 0 && ansU === cU && ansT === (t1 + t2) % 10 && ansT !== cT) {
      return {
        errorType: "LUPA_SIMPAN_PULUHAN",
        badgeLabel: "Lupa Simpan (+)",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
        studentFeedback: "Satuanmu sudah benar! Tapi kamu lupa menambahkan 1 angka simpanan di kolom puluhan.",
        errorDetail: `Siswa menjumlahkan satuan dengan benar (${u1} + ${u2} = ${u1 + u2}), namun lupa menambahkan simpanan 1 ke kolom puluhan (${t1} + ${t2} = ${ansT}, seharusnya ${cT}).`,
        suggestedIntervention: "Gunakan alat bantu balok untuk memperlihatkan pertukaran 10 satuan menjadi 1 batang puluhan di atas kolom puluhan."
      };
    }

    // Lupa simpan ke ratusan
    if (carryToHundreds > 0 && ansT === cT && ansH === (h1 + h2) % 10 && ansH !== cH) {
      return {
        errorType: "LUPA_SIMPAN_RATUSAN",
        badgeLabel: "Lupa Simpan Ratusan",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
        studentFeedback: "Puluhan dan satuanmu benar, tapi kamu lupa menambahkan simpanan di kolom ratusan.",
        errorDetail: `Siswa lupa menambahkan simpanan pada kolom ratusan (${h1} + ${h2} = ${ansH}, seharusnya ${cH}).`,
        suggestedIntervention: "Ingatkan siswa untuk selalu menulis dan menjumlahkan angka di kotak simpan ratusan."
      };
    }

    // Hanya satuan yang salah
    if (ansT === cT && ansH === cH && ansTh === cTh && ansU !== cU) {
      return {
        errorType: "SALAH_HITUNG_SATUAN",
        badgeLabel: "Salah Hitung Satuan",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
        studentFeedback: `Puluhanmu sudah benar. Tapi ${u1} + ${u2} bukan ${ansU}. Hitung kembali satuannya!`,
        errorDetail: `Kekeliruan perhitungan pada kolom satuan: ${u1} + ${u2} dijawab ${ansU} (kunci: ${cU}). Kolom lain sudah tepat.`,
        suggestedIntervention: "Latih kembali fakta dasar penjumlahan bilangan satu digit (1-9)."
      };
    }

    // Hanya puluhan yang salah
    if (ansU === cU && ansH === cH && ansTh === cTh && ansT !== cT) {
      return {
        errorType: "SALAH_HITUNG_PULUHAN",
        badgeLabel: "Salah Hitung Puluhan",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
        studentFeedback: "Satuanmu sudah benar, namun hasil perhitungan pada kolom puluhan belum tepat.",
        errorDetail: `Kekeliruan perhitungan pada kolom puluhan: siswa menjawab ${ansT} (kunci: ${cT}).`,
        suggestedIntervention: "Bimbing siswa menghitung ulang penjumlahan pada kolom puluhan."
      };
    }
  }

  // 4. ANALISIS POLA PENGURANGAN (-)
  if (operation === "-") {
    // Pengurangan Terbalik (Smaller-from-Larger Bug): Jika u1 < u2, siswa malah menghitung u2 - u1
    if (u1 < u2) {
      const reversedDiffU = u2 - u1;
      if (ansU === reversedDiffU) {
        return {
          errorType: "PENGURANGAN_TERBALIK",
          badgeLabel: "Pengurangan Terbalik",
          badgeColor: "bg-red-100 text-red-800 border-red-300",
          studentFeedback: `Karena ${u1} lebih kecil dari ${u2}, kamu harus pinjam 1 dari puluhan, bukan membalik jadi ${u2} − ${u1}!`,
          errorDetail: `Miskonsepsi pengurangan terbalik: Siswa mengurangkan angka bawah dengan angka atas (${u2} − ${u1} = ${ansU}) untuk menghindari peminjaman.`,
          suggestedIntervention: "Intervensi konseptual mendalam: Tunjukkan dengan balok bahwa satuan yang kurang harus meminjam 1 puluhan (10 satuan), bukan dibalik."
        };
      }

      // Lupa mengurangi puluhan setelah meminjam (ansU benar, tapi ansT dihitung t1 - t2 alih-alih t1 - 1 - t2)
      if (ansU === cU && ansT === t1 - t2 && ansT !== cT) {
        return {
          errorType: "LUPA_KURANGI_PINJAMAN",
          badgeLabel: "Lupa Kurangi Pinjaman (-)",
          badgeColor: "bg-orange-100 text-orange-800 border-orange-300",
          studentFeedback: "Kamu sudah meminjam ke puluhan, tapi lupa mengurangi angka di puluhan dengan 1.",
          errorDetail: `Siswa meminjam untuk kolom satuan (${u1} + 10 − ${u2} = ${cU}), namun lupa mengurangi 1 dari kolom puluhan (${t1} − ${t2} = ${ansT}, seharusnya ${cT}).`,
          suggestedIntervention: "Biasakan siswa menuliskan angka sisa di kotak pinjaman atas kolom puluhan agar tidak lupa terhitung."
        };
      }
    }

    // Hanya satuan yang salah
    if (ansT === cT && ansH === cH && ansTh === cTh && ansU !== cU) {
      return {
        errorType: "SALAH_HITUNG_SATUAN",
        badgeLabel: "Salah Hitung Satuan",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
        studentFeedback: "Puluhanmu sudah benar. Hitung kembali hasil pengurangan di kolom satuan!",
        errorDetail: `Kekeliruan hitung pengurangan pada satuan: siswa menjawab ${ansU} (kunci: ${cU}).`,
        suggestedIntervention: "Latih kembali operasi pengurangan dasar bilangan 1 sampai 18."
      };
    }

    // Hanya puluhan yang salah
    if (ansU === cU && ansH === cH && ansTh === cTh && ansT !== cT) {
      return {
        errorType: "SALAH_HITUNG_PULUHAN",
        badgeLabel: "Salah Hitung Puluhan",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-300",
        studentFeedback: "Satuanmu sudah benar, namun hasil pengurangan di kolom puluhan belum tepat.",
        errorDetail: `Kekeliruan pengurangan pada puluhan: siswa menjawab ${ansT} (kunci: ${cT}).`,
        suggestedIntervention: "Periksa kembali sisa puluhan dan lakukan pengurangan langkah demi langkah."
      };
    }
  }

  // 5. ANALISIS PERKALIAN (×) & PEMBAGIAN (÷)
  if (operation === "×") {
    // Cek jika siswa hanya mengalikan digit satuan dan puluhan tanpa silang (misal 23 * 4 = 812)
    if (num2 < 10) {
      if (ansU === (u1 * num2) % 10 && ansT !== cT) {
        return {
          errorType: "LUPA_SIMPAN_KALI",
          badgeLabel: "Lupa Simpan Perkalian",
          badgeColor: "bg-rose-100 text-rose-800 border-rose-300",
          studentFeedback: "Perkalian satuanmu benar, tapi jangan lupa menambahkan angka simpanan ke hasil puluhan!",
          errorDetail: `Siswa mengalikan satuan (${u1} × ${num2}), namun lupa menambahkan simpanan pada perkalian puluhan (${t1} × ${num2}).`,
          suggestedIntervention: "Latih teknik perkalian bersusun dengan mencatat hasil simpanan di atas kolom puluhan."
        };
      }
    }
  }

  if (operation === "÷") {
    if (userNum === Math.floor(num1 / num2) + 1 || userNum === Math.floor(num1 / num2) - 1) {
      return {
        errorType: "MELIHAT_KELIPATAN_DEKAT",
        badgeLabel: "Kelipatan Meleset 1",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-300",
        studentFeedback: "Hampir tepat! Periksa kembali perkalian pembaginya agar pas.",
        errorDetail: `Hasil bagi siswa (${userNum}) meleset 1 dari hasil bagi yang benar (${correctAnswer}).`,
        suggestedIntervention: "Minta siswa menguji kembali jawaban dengan mengalikan: jawaban × pembagi."
      };
    }
  }

  // 6. KESALAHAN UMUM / DEFAULT
  return {
    errorType: "SALAH_HITUNG_UMUM",
    badgeLabel: "Perlu Diteliti",
    badgeColor: "bg-slate-100 text-slate-800 border-slate-300",
    studentFeedback: "Jawabanmu belum tepat nih. Coba periksa kembali perhitunganmu pelan-pelan dengan bantuan visual balok ya!",
    errorDetail: `Hasil siswa (${userNum || userAnswerStr}) tidak sesuai dengan kunci jawaban (${correctAnswer}).`,
    suggestedIntervention: "Ajak siswa mengulang perhitungan dengan bantuan visual balok nilai tempat langkah demi langkah."
  };
}

/**
 * Ringkasan diagnosis dari sekumpulan soal latihan
 */
export function generateSessionSummary(
  questions: Array<{ isCorrect: boolean; errorType?: string | null; errorDetail?: string | null }>
): string {
  const incorrectQuestions = questions.filter((q) => !q.isCorrect);
  if (incorrectQuestions.length === 0) {
    return "Sempurna! Semua soal dijawab dengan benar tanpa miskonsepsi.";
  }

  const counts: Record<string, number> = {};
  incorrectQuestions.forEach((q) => {
    const t = q.errorType || "SALAH_HITUNG_UMUM";
    counts[t] = (counts[t] || 0) + 1;
  });

  const readableNames: Record<string, string> = {
    LUPA_SIMPAN_PULUHAN: "Lupa Simpan Puluhan",
    LUPA_SIMPAN_RATUSAN: "Lupa Simpan Ratusan",
    LUPA_TAMBAH_SIMPANAN: "Lupa Menambahkan Simpanan (+)",
    PENGURANGAN_TERBALIK: "Pengurangan Terbalik (Tanpa Pinjam)",
    LUPA_KURANGI_PINJAMAN: "Lupa Mengurangi Pinjaman",
    SALAH_NILAI_TEMPAT: "Pergeseran Nilai Tempat",
    DIGIT_TERBALIK: "Penulisan Digit Terbalik",
    SALAH_HITUNG_SATUAN: "Kekeliruan Hitung Satuan",
    SALAH_HITUNG_PULUHAN: "Kekeliruan Hitung Puluhan",
    OPERASI_TERTUKAR: "Operasi Tertukar",
    LUPA_SIMPAN_KALI: "Lupa Simpan Perkalian",
    MELIHAT_KELIPATAN_DEKAT: "Meleset Kelipatan",
    SALAH_HITUNG_UMUM: "Kekeliruan Hitung Umum",
    SALAH_POROGAPIT: "Kendala Porogapit Pengurangan Berulang",
    SALAH_SECTION_1: "Kendala Tahap 1 (Susun Nilai Tempat / Porogapit)",
    SALAH_SECTION_2: "Kendala Tahap 2 (Satuan / Pengurangan Berulang)",
    SALAH_SECTION_3: "Kendala Tahap 3 (Puluhan / Turunkan Digit)",
    SALAH_SECTION_4: "Kendala Tahap 4 (Hasil Akhir / Pembuktian)"
  };

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const primaryError = sorted[0];
  const primaryLabel = readableNames[primaryError[0]] || primaryError[0];

  return `Catatan Evaluasi: Terdapat ${incorrectQuestions.length} soal perlu bimbingan. Pola kendala: ${primaryLabel} (${primaryError[1]}x). Rekomendasi: Berikan latihan penguatan dengan alat bantu balok nilai tempat.`;
}

// ---------------------------------------------------------------------------
// SECTION-LEVEL DIAGNOSTIC TRACKING (Untuk Latihan Beralur Bertahap)
// ---------------------------------------------------------------------------

export interface SectionDiagnostic {
  sectionId: number;
  sectionName: string;
  status: "correct" | "incorrect" | "skipped";
  studentInput?: string;
  expectedValue?: string;
  diagnosticNote?: string;
  hadMistake?: boolean;
  attempts?: number;
  errorType?: string;
  errorDetail?: string;
  suggestedIntervention?: string;
}

export interface QuestionSectionEvaluation {
  sections: SectionDiagnostic[];
  failedSectionId?: number | null;
  failedSectionName?: string | null;
  summaryMessage: string;
}

/**
 * Memberikan metadata section latihan berdasarkan jenis operasi matematika dan tingkat bilangan
 */
export function getSectionNamesForOp(
  op: "+" | "-" | "×" | "÷" | string,
  isSingleDigit: boolean = false
): Array<{ id: number; title: string; subtitle: string }> {
  if (isSingleDigit) {
    if (op === "×") {
      return [
        { id: 1, title: "Hitung Perkalian Balok", subtitle: "Hitung total benda/balok dengan visual" },
        { id: 2, title: "Hasil Akhir & Validasi", subtitle: "Tuliskan hasil perkalian" },
      ];
    }
    if (op === "÷") {
      return [
        { id: 1, title: "Bagi Rata Satuan", subtitle: "Bagi balok satuan ke kelompok sama rata" },
        { id: 2, title: "Hasil Akhir & Validasi", subtitle: "Tuliskan hasil bagi keseluruhan" },
      ];
    }
    if (op === "-") {
      return [
        { id: 1, title: "Hitung Selisih Satuan", subtitle: "Kurangkan angka satuan secara tepat" },
        { id: 2, title: "Hasil Akhir & Validasi", subtitle: "Tuliskan selisih akhir" },
      ];
    }
    // Penjumlahan (Default)
    return [
      { id: 1, title: "Hitung Satuan & Simpanan", subtitle: "Jumlahkan satuan (simpan puluhan jika ≥ 10)" },
      { id: 2, title: "Hasil Akhir & Validasi", subtitle: "Tuliskan jumlah akhir keseluruhan" },
    ];
  }

  // Multi-digit (Puluhan / Ratusan / Ribuan)
  if (op === "×") {
    return [
      { id: 1, title: "Papan Susun Nilai Tempat", subtitle: "Susun bilangan ke kolom ratusan, puluhan, satuan" },
      { id: 2, title: "Pecah Nilai & Visual Balok", subtitle: "Urai bentuk perkalian dengan visual balok" },
      { id: 3, title: "Gabungkan Hasil Pecahan", subtitle: "Jumlahkan hasil dari setiap bagian nilai tempat" },
      { id: 4, title: "Hasil Akhir & Validasi", subtitle: "Tuliskan hasil akhir keseluruhan" },
    ];
  }
  if (op === "÷") {
    return [
      { id: 1, title: "Susun Papan Porogapit", subtitle: "Tentukan pembagi, bilangan, dan kelompok angka awal" },
      { id: 2, title: "Tangga Pengurangan Berulang", subtitle: "Kurangkan angka dengan pembagi berulang kali" },
      { id: 3, title: "Turunkan Angka / Desimal", subtitle: "Turunkan digit berikutnya atau pasang koma jika bersisa" },
      { id: 4, title: "Susun Hasil Akhir", subtitle: "Rangkum digit dari hasil pengurangan sebelumnya" },
    ];
  }
  if (op === "-") {
    return [
      { id: 1, title: "Susun Kolom Nilai Tempat", subtitle: "Atur nilai tempat pada papan" },
      { id: 2, title: "Cek Satuan & Tukar Puluhan", subtitle: "Tukar jika nilai tempat kurang (Regrouping)" },
      { id: 3, title: "Hitung Pengurangan Nilai Tempat", subtitle: "Kurangkan kolom satuan, puluhan, dan ratusan" },
      { id: 4, title: "Hasil Akhir", subtitle: "Tuliskan selisih akhir" },
    ];
  }
  // Penjumlahan (Default)
  return [
    { id: 1, title: "Susun Kolom Nilai Tempat", subtitle: "Atur nilai tempat pada papan" },
    { id: 2, title: "Hitung Satuan & Simpanan", subtitle: "Jumlahkan satuan dan simpan jika ≥ 10" },
    { id: 3, title: "Hitung Puluhan & Ratusan", subtitle: "Jumlahkan puluhan dan ratusan beserta simpanan" },
    { id: 4, title: "Hasil Akhir", subtitle: "Tuliskan jumlah akhir keseluruhan" },
  ];
}

/**
 * Menganalisis statistik kesalahan siswa per section dari seluruh sesi latihan
 */
export function analyzeSectionPerformance(
  questionsWithSections: Array<{
    sections?: SectionDiagnostic[];
  }>
): {
  sectionStats: Record<number, { name: string; total: number; correct: number; incorrect: number; accuracy: number }>;
  weakestSection: { id: number; name: string; incorrect: number } | null;
} {
  const stats: Record<number, { name: string; total: number; correct: number; incorrect: number; accuracy: number }> = {
    1: { name: "Tahap 1: Penguraian Nilai Tempat", total: 0, correct: 0, incorrect: 0, accuracy: 100 },
    2: { name: "Tahap 2: Operasi Satuan / Visual Balok", total: 0, correct: 0, incorrect: 0, accuracy: 100 },
    3: { name: "Tahap 3: Operasi Puluhan / Penggabungan", total: 0, correct: 0, incorrect: 0, accuracy: 100 },
    4: { name: "Tahap 4: Penulisan Hasil Akhir", total: 0, correct: 0, incorrect: 0, accuracy: 100 },
  };

  questionsWithSections.forEach((q) => {
    if (q.sections && Array.isArray(q.sections)) {
      q.sections.forEach((sec) => {
        if (stats[sec.sectionId]) {
          stats[sec.sectionId].total += 1;
          if (sec.status === "correct") {
            stats[sec.sectionId].correct += 1;
          } else if (sec.status === "incorrect") {
            stats[sec.sectionId].incorrect += 1;
          }
        }
      });
    }
  });

  // Hitung persentase
  Object.keys(stats).forEach((k) => {
    const s = stats[Number(k)];
    s.accuracy = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 100;
  });

  // Cari section terlemah
  let weakest: { id: number; name: string; incorrect: number } | null = null;
  Object.entries(stats).forEach(([idStr, data]) => {
    if (data.incorrect > 0) {
      if (!weakest || data.incorrect > weakest.incorrect) {
        weakest = { id: Number(idStr), name: data.name, incorrect: data.incorrect };
      }
    }
  });

  return { sectionStats: stats, weakestSection: weakest };
}

